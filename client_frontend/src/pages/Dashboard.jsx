import { useState, useEffect } from 'react'
import { FiArrowUp, FiArrowDown, FiCreditCard } from 'react-icons/fi'
import axios from 'axios'
import toast from 'react-hot-toast'
import TransactionForm from '../components/TransactionForm'
import TransactionList from '../components/TransactionList'
import FinancialCharts from '../components/FinancialCharts'
import GoalsManagement from '../components/GoalsManagement'

export default function Dashboard() {
  const [summary, setSummary] = useState({
    balance: 0,
    totalIncome: 0,
    totalExpense: 0
  })
  const [loading, setLoading] = useState(false)
  // API base URL from environment variable
  const API_URL = import.meta.env.VITE_API_BASE_URL || 'https://sbd-kelas.vercel.app/api'
  
  // Get user info from localStorage
  const getUserId = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    return user._id
  }
    // Fetch transaction summary
  const fetchTransactionSummary = async () => {
    setLoading(true)
    try {
      const userId = getUserId()
      // Get transactions for this user
      const response = await axios.get(`${API_URL}/transactions/account/${userId}`)
      const transactions = response.data

      // Calculate summary from transactions
      const summary = {
        balance: 0,
        totalIncome: 0,
        totalExpense: 0
      }

      transactions.forEach(transaction => {
        if (transaction.tipe === 'income') {
          summary.totalIncome += transaction.nominal
          summary.balance += transaction.nominal
        } else if (transaction.tipe === 'expense') {
          summary.totalExpense += transaction.nominal
          summary.balance -= transaction.nominal
        }
      })

      setSummary(summary)
    } catch (error) {
      console.error('Failed to fetch summary:', error)
      toast.error('Failed to load financial summary')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactionSummary()
    
    // Listen for transaction events to refresh data
    const handleTransactionChange = () => {
      fetchTransactionSummary()
    }
    
    window.addEventListener('transaction-added', handleTransactionChange)
    window.addEventListener('transaction-deleted', handleTransactionChange)
    
    return () => {
      window.removeEventListener('transaction-added', handleTransactionChange)
      window.removeEventListener('transaction-deleted', handleTransactionChange)
    }
  }, [])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      
      {/* Financial Summary Cards */}      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Balance Card */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Balance</p>
              <p className="text-2xl font-bold text-gray-900">Rp {new Intl.NumberFormat('id-ID').format(summary.balance)}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <FiCreditCard className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Income Card */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Income</p>
              <p className="text-2xl font-bold text-green-600">Rp {new Intl.NumberFormat('id-ID').format(summary.totalIncome)}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <FiArrowUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Expenses Card */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">            <div>
              <p className="text-sm font-medium text-gray-600">Total Expenses</p>
              <p className="text-2xl font-bold text-red-600">Rp {new Intl.NumberFormat('id-ID').format(summary.totalExpense)}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <FiArrowDown className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Financial Charts */}
      <FinancialCharts />

      {/* Transaction Form and List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TransactionForm />
        <TransactionList />
      </div>

      {/* Goals Management */}
      <GoalsManagement />
    </div>
  )
} 