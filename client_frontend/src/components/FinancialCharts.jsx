import { useState, useEffect } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import axios from 'axios'
import toast from 'react-hot-toast'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

export default function FinancialCharts() {
  const [transactions, setTransactions] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
    // API base URL from environment variable
  const API_URL = import.meta.env.VITE_API_BASE_URL || 'https://sbd-kelas.vercel.app/api'
  
  // Get user info from localStorage
  const getUserId = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    return user._id
  }
  // Fetch transactions
  const fetchTransactions = async () => {
    setLoading(true)
    try {
      const userId = getUserId()
      console.log('Fetching transactions for user:', userId);
      const response = await axios.get(`${API_URL}/transactions/account/${userId}`)
      console.log('Fetched transactions for charts:', response.data);
      setTransactions(response.data)
    } catch (error) {
      console.error('Failed to fetch transactions:', error)
      toast.error('Failed to load transactions')
    } finally {
      setLoading(false)
    }
  }
    // Fetch categories from the backend
  const fetchCategories = async () => {
    try {
      const userId = getUserId()
      
      // First, try with the user-specific endpoint
      try {
        const response = await axios.get(`${API_URL}/categories/user/${userId}`)
        if (response.data && response.data.length > 0) {
          setCategories(response.data)
          return
        }
      } catch (err) {
        console.log('User-specific categories not found, using defaults')
      }
      
      // If no categories found, use these defaults
      const defaultCategories = [
        { name: 'Food', type: 'expense' },
        { name: 'Transportation', type: 'expense' },
        { name: 'Entertainment', type: 'expense' },
        { name: 'Utilities', type: 'expense' },
        { name: 'Salary', type: 'income' },
        { name: 'Gifts', type: 'income' },
        { name: 'Investments', type: 'income' }
      ]
      
      setCategories(defaultCategories)
    } catch (error) {
      console.error('Failed to fetch categories:', error)
      toast.error('Failed to load categories')
    }
  }
    useEffect(() => {
    fetchTransactions()
    fetchCategories()
    
    // For debugging
    console.log('FinancialCharts component mounted')
    
    // Listen for transaction events
    const handleTransactionChange = () => {
      console.log('Transaction changed event detected - refetching transactions')
      fetchTransactions()
    }
    
    window.addEventListener('transaction-added', handleTransactionChange)
    window.addEventListener('transaction-deleted', handleTransactionChange)
      return () => {
      window.removeEventListener('transaction-added', handleTransactionChange)
      window.removeEventListener('transaction-deleted', handleTransactionChange)
    }
  }, []);
  
  const [timeRange, setTimeRange] = useState('week') // 'week' or 'month'
  const [chartData, setChartData] = useState([])
  const [categoryData, setCategoryData] = useState([])
  const [categoryType, setCategoryType] = useState('expense') // 'expense' or 'income'
  
  useEffect(() => {
    // Process data for area chart
    const now = new Date()
    const days = timeRange === 'week' ? 7 : 30
    const data = Array.from({ length: days }, (_, i) => {
      const date = new Date(now)
      date.setDate(date.getDate() - (days - 1 - i))
      
      // Format the date to match the database format (YYYY-MM-DD)
      const dateStr = date.toISOString().split('T')[0]
      
      // Filter transactions for this date by comparing with created_at
      const dayTransactions = transactions.filter(t => {
        // Try to find a transaction date from various possible fields
        let transactionDate = null;
        
        // Use tanggal (from frontend) or created_at (from database)
        if (t.tanggal) {
          transactionDate = new Date(t.tanggal);
        } else if (t.date) {
          transactionDate = new Date(t.date);
        } else if (t.created_at) {
          transactionDate = new Date(t.created_at);
        }
        
        // If we found a valid date, compare it to our target date
        if (transactionDate) {
          const transDateStr = transactionDate.toISOString().split('T')[0];
          return transDateStr === dateStr;
        }
        
        return false;
      });
      
      console.log(`Transactions for ${dateStr}:`, dayTransactions.length);
      
      // Calculate income and expense totals for this date
      const income = dayTransactions
        .filter(t => (t.tipe || t.type) === 'income')
        .reduce((sum, t) => sum + Number(t.nominal || t.amount), 0);
      
      const expense = dayTransactions
        .filter(t => (t.tipe || t.type) === 'expense')
        .reduce((sum, t) => sum + Number(t.nominal || t.amount), 0);

      return {
        date: date.toLocaleDateString('id-ID', { month: 'short', day: 'numeric' }),
        income,
        expense,
      }
    });

    console.log('Processed chart data:', data);
    setChartData(data);    // Process data for pie chart
    const categoryTransactions = transactions
      .filter(t => (t.tipe || t.type) === categoryType)
      .reduce((acc, t) => {
        const category = categories.find(c => c._id === t.category)
        const categoryName = category ? category.name : 'Uncategorized'
        acc[categoryName] = (acc[categoryName] || 0) + Number(t.nominal || t.amount)
        return acc
      }, {})

    const pieData = Object.entries(categoryTransactions).map(([name, value]) => ({
      name,
      value,
    }));
    
    setCategoryData(pieData);
  }, [transactions, categories, timeRange, categoryType])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Area Chart */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Spending Trends</h2>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="rounded-lg border-gray-300 focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
          </select>
        </div>        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>              
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip 
                formatter={(value) => `Rp ${new Intl.NumberFormat('id-ID').format(value)}`} 
                labelFormatter={(label) => `Tanggal: ${label}`}
              />
              <Area
                type="monotone"
                dataKey="income"
                stackId="1"
                stroke="#10B981"
                fill="#10B981"
                fillOpacity={0.2}
                name="Pendapatan"
              />
              <Area
                type="monotone"
                dataKey="expense"
                stackId="1"
                stroke="#EF4444"
                fill="#EF4444"
                fillOpacity={0.2}
                name="Pengeluaran"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pie Chart */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            {categoryType === 'expense' ? 'Expense' : 'Income'} Categories
          </h2>
          <select
            value={categoryType}
            onChange={(e) => setCategoryType(e.target.value)}
            className="rounded-lg border-gray-300 focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >                
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `Rp ${new Intl.NumberFormat('id-ID').format(value)}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}