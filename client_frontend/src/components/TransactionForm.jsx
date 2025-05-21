import { useState, useEffect } from 'react'
import { FiPlus } from 'react-icons/fi'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { transactionSchema } from '../utils/validationSchemas'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function TransactionForm() {
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState([])
  
  // API base URL from environment variable
  const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'
  
  // Get user info from localStorage
  const getUserId = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    return user._id
  }
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
  } = useForm({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'expense',
      amount: '',
      description: '',
      category: '',
      date: new Date().toISOString().split('T')[0],
    },
  })

  const transactionType = watch('type')  // Fetch categories from the API
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
      
      // If no categories exist, create some default ones
      const defaultCategories = [
        { name: 'Food', type: 'expense', balance: 0 },
        { name: 'Transportation', type: 'expense', balance: 0 },
        { name: 'Entertainment', type: 'expense', balance: 0 },
        { name: 'Utilities', type: 'expense', balance: 0 },
        { name: 'Salary', type: 'income', balance: 0 },
        { name: 'Gifts', type: 'income', balance: 0 },
        { name: 'Investments', type: 'income', balance: 0 }
      ]
      
      // Create these default categories
      for (const category of defaultCategories) {
        try {
          await axios.post(`${API_URL}/categories/user/${userId}`, category)
        } catch (error) {
          console.error(`Failed to create category ${category.name}:`, error)
        }
      }
      
      // Now fetch them again
      const newResponse = await axios.get(`${API_URL}/categories/user/${userId}`)
      setCategories(newResponse.data)
    } catch (error) {
      console.error('Failed to fetch categories:', error)
      toast.error('Failed to load categories')
    }
  }
  // Add new transaction
  const addTransaction = async (data) => {
    setLoading(true)
    try {
      const userId = getUserId()
      const formattedDate = data.date || new Date().toISOString().split('T')[0];
      
      // Create transaction with all necessary fields
      const transaction = {
        id_akun: userId,
        deskripsi: data.description,
        nominal: Number(data.amount),
        tipe: data.type,
        category: data.category,
        tags: [data.category],
        created_at: new Date(formattedDate).toISOString() // Send in ISO format
      };
      
      console.log('Creating transaction:', transaction);
      
      await axios.post(`${API_URL}/transactions`, transaction);
      
      toast.success('Transaction added successfully')
      reset()
      
      // Emit event to notify other components
      window.dispatchEvent(new CustomEvent('transaction-added'))
      return true
    } catch (error) {
      console.error('Failed to add transaction:', error)
      toast.error(error.response?.data?.message || 'Failed to add transaction')
      return false
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const onSubmit = async (data) => {
    const success = await addTransaction(data)
    if (success) {
      reset()
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Transaction</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              {...register('type')}
              className="w-full rounded-lg border-gray-300 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount
            </label>            <input
              type="number"
              step="1"
              {...register('amount')}
              placeholder="Rp 0"
              className="w-full rounded-lg border-gray-300 focus:ring-purple-500 focus:border-purple-500"
            />
            {errors.amount && (
              <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <input
            type="text"
            {...register('description')}
            placeholder="What's this for?"
            className="w-full rounded-lg border-gray-300 focus:ring-purple-500 focus:border-purple-500"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              {...register('category')}
              className="w-full rounded-lg border-gray-300 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="">Select a category</option>
              {categories
                .filter(cat => cat.type === transactionType)
                .map(category => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
            </select>
            {errors.category && (
              <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              {...register('date')}
              className="w-full rounded-lg border-gray-300 focus:ring-purple-500 focus:border-purple-500"
            />
            {errors.date && (
              <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FiPlus className="mr-2" />
          {loading ? 'Adding...' : 'Add Transaction'}
        </button>
      </form>
    </div>
  )
}