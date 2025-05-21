import { useState, useEffect } from 'react'
import { FiTrash2, FiArrowUp, FiArrowDown } from 'react-icons/fi'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function TransactionList() {
  const [transactions, setTransactions] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState('all') // 'all', 'income', 'expense'
  
  // API base URL from environment variable
  const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'
  
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
      const response = await axios.get(`${API_URL}/transactions/account/${userId}`)
      console.log('Fetched transactions:', response.data)
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
        console.log('User-specific categories not found, creating default categories')
      }
      
      // If no categories found, create some default ones
      const defaultCategories = [
        { name: 'Food', type: 'expense' },
        { name: 'Transportation', type: 'expense' },
        { name: 'Entertainment', type: 'expense' },
        { name: 'Utilities', type: 'expense' },
        { name: 'Salary', type: 'income' },
        { name: 'Gifts', type: 'income' },
        { name: 'Investments', type: 'income' }
      ]
      
      // Use these as fallback categories
      setCategories(defaultCategories)
    } catch (error) {
      console.error('Failed to fetch categories:', error)
      toast.error('Failed to load categories')
    }
  }
  
  // Delete transaction
  const deleteTransaction = async (id) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return
    
    setLoading(true)
    try {
      await axios.delete(`${API_URL}/transactions/${id}`)
      toast.success('Transaction deleted successfully')
      fetchTransactions()
      
      // Emit event to update other components
      window.dispatchEvent(new CustomEvent('transaction-deleted'))
    } catch (error) {
      console.error('Failed to delete transaction:', error)
      toast.error('Failed to delete transaction')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactions()
    fetchCategories()
    
    // Listen for transaction added events
    const handleTransactionAdded = () => {
      fetchTransactions()
    }
    
    window.addEventListener('transaction-added', handleTransactionAdded)
    
    return () => {
      window.removeEventListener('transaction-added', handleTransactionAdded)
    }
  }, [])

  const filteredTransactions = transactions.filter(transaction => {
    if (filter === 'all') return true
    return transaction.tipe === filter // Using 'tipe' field from the backend
  })

  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat._id === categoryId)
    return category ? category.name : 'Uncategorized'
  }
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    
    // Handle various date formats
    let date;
    try {
      date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.warn('Invalid date:', dateString);
        return 'Invalid date';
      }
    } catch (error) {
      console.error('Error parsing date:', dateString, error);
      return 'Error parsing date';
    }
    
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
  // Format amount properly in Indonesian Rupiah
  const formatAmount = (transaction) => {
    let amount = 0;
    
    // Check different possible field names
    if (transaction.nominal !== undefined) {
      amount = transaction.nominal;
    } else if (transaction.amount !== undefined) {
      amount = transaction.amount;
    }
    
    // Convert to number if it's a string
    if (typeof amount === 'string') {
      amount = parseFloat(amount);
    }
    
    // Format as Indonesian Rupiah
    return new Intl.NumberFormat('id-ID').format(amount);
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-lg border-gray-300 focus:ring-purple-500 focus:border-purple-500"
        >
          <option value="all">All</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
        </div>
      ) : filteredTransactions.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No transactions found</p>
      ) : (
        <div className="space-y-4">
          {filteredTransactions.map((transaction) => (
            <div
              key={transaction._id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-4">
                <div className={`p-2 rounded-full ${
                  transaction.tipe === 'income' ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {transaction.tipe === 'income' ? (
                    <FiArrowUp className="w-5 h-5 text-green-600" />
                  ) : (
                    <FiArrowDown className="w-5 h-5 text-red-600" />
                  )}
                </div>
                <div>                  <p className="font-medium text-gray-900">{transaction.deskripsi || transaction.description}</p>
                  <p className="text-sm text-gray-500">
                    {getCategoryName(transaction.category)} • {formatDate(transaction.tanggal || transaction.date || transaction.created_at)}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">                <p className={`font-semibold ${
                  transaction.tipe === 'income' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.tipe === 'income' ? '+' : '-'}Rp {formatAmount(transaction)}
                </p>
                <button
                  onClick={() => deleteTransaction(transaction._id)}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <FiTrash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}