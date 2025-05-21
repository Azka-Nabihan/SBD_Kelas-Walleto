import { useState, useEffect } from 'react'
import { FiPlus, FiTrash2, FiCreditCard } from 'react-icons/fi'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { goalSchema } from '../utils/validationSchemas'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function GoalsManagement() {
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [contributionAmount, setContributionAmount] = useState('')
  const [selectedGoal, setSelectedGoal] = useState(null)
    // API base URL from environment variable
  const API_URL = import.meta.env.VITE_API_BASE_URL || 'https://sbd-kelas.vercel.app/api'
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
  } = useForm({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      name: '',
      targetAmount: '',
      deadline: '',
    },
  })

  // Create default goals if none exist
  const createDefaultGoal = async () => {
    const userId = getUserId();
    if (!userId) return;
    
    try {
      console.log('Creating default goal for user:', userId);
      
      await axios.post(`${API_URL}/goals/user/${userId}`, {
        title: 'Emergency Fund',
        description: 'Save for unexpected expenses',
        target_amount: 5000000, // 5 million Rupiah
        target_date: new Date(new Date().setMonth(new Date().getMonth() + 6)), // 6 months from now
        saved_amount: 0
      });
      
      toast.success('Created a default Emergency Fund goal');
      fetchGoals();
    } catch (error) {
      console.error('Failed to create default goal:', error);
      toast.error('Failed to create default goal');
    }
  };

  // Fetch goals, and if none exist, create a default one
  const fetchGoalsAndCreateDefaultIfEmpty = async () => {
    try {
      const userId = getUserId();
      if (!userId) {
        toast.error('User ID not found. Please log in again.');
        return;
      }
      
      console.log('Fetching goals for user:', userId);
      const response = await axios.get(`${API_URL}/goals/user/${userId}`);
      console.log('Goals response:', response.data);
      
      setGoals(response.data);
      
      // If no goals exist, create a default one
      if (response.data.length === 0) {
        await createDefaultGoal();
      }
    } catch (error) {
      console.error('Failed to fetch goals:', error);
      toast.error('Failed to load goals: ' + (error.response?.data?.message || error.message));
      setGoals([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  // Add a new goal
  const addGoal = async (data) => {
    setLoading(true)
    try {
      const userId = getUserId()
      await axios.post(`${API_URL}/goals/user/${userId}`, {
        title: data.name,
        description: data.description || '',
        target_amount: Number(data.targetAmount),
        target_date: data.deadline,
        saved_amount: 0
      })
      
      toast.success('Goal added successfully')
      fetchGoals()
      return true
    } catch (error) {
      console.error('Failed to add goal:', error)
      toast.error(error.response?.data?.message || 'Failed to add goal')
      return false
    } finally {
      setLoading(false)
    }
  }
  
  // Delete a goal
  const deleteGoal = async (goalId) => {
    if (!confirm('Are you sure you want to delete this goal?')) return
    
    setLoading(true)
    try {
      await axios.delete(`${API_URL}/goals/${goalId}`)
      toast.success('Goal deleted successfully')
      fetchGoals()
      return true
    } catch (error) {
      console.error('Failed to delete goal:', error)
      toast.error('Failed to delete goal')
      return false
    } finally {
      setLoading(false)
    }
  }
  // Add contribution to a goal
  const addContribution = async (goalId, amount) => {
    setLoading(true)
    try {
      await axios.post(`${API_URL}/goals/${goalId}/allocate`, { 
        amount: Number(amount),
        create_transaction: true,
        note: 'Manual contribution'
      })
      
      toast.success('Contribution added successfully')
      fetchGoals()
      return true
    } catch (error) {
      console.error('Failed to add contribution:', error)
      toast.error('Failed to add contribution: ' + (error.response?.data?.message || 'Unknown error'))
      return false
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGoalsAndCreateDefaultIfEmpty();
    
    // Listen for custom events
    const handleGoalAdded = () => {
      fetchGoals();
    };
    
    window.addEventListener('goal-added', handleGoalAdded);
    
    return () => {
      window.removeEventListener('goal-added', handleGoalAdded);
    };
  }, []);

  const onSubmit = async (data) => {
    const success = await addGoal(data)
    if (success) {
      reset()
      setShowForm(false)
    }
  }

  const handleContribution = async (goalId) => {
    if (!contributionAmount || isNaN(Number(contributionAmount)) || Number(contributionAmount) <= 0) {
      return
    }
    const success = await addContribution(goalId, Number(contributionAmount))
    if (success) {
      setContributionAmount('')
      setSelectedGoal(null)
    }
  }
  const calculateProgress = (goal) => {
    const progress = (goal.saved_amount / goal.target_amount) * 100
    return Math.min(progress, 100)
  }
  const formatDate = (dateString) => {
    if (!dateString) return 'No deadline';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Financial Goals</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
        >
          <FiPlus className="mr-2" />
          Add Goal
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit(onSubmit)} className="mb-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Goal Name
            </label>
            <input
              {...register('name')}
              type="text"
              placeholder="e.g., New Car Fund"
              className="w-full rounded-lg border-gray-300 focus:ring-purple-500 focus:border-purple-500"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Target Amount
            </label>            <input
              {...register('targetAmount')}
              type="number"
              step="1"
              placeholder="Rp 0"
              className="w-full rounded-lg border-gray-300 focus:ring-purple-500 focus:border-purple-500"
            />
            {errors.targetAmount && (
              <p className="mt-1 text-sm text-red-600">{errors.targetAmount.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Deadline
            </label>
            <input
              {...register('deadline')}
              type="date"
              className="w-full rounded-lg border-gray-300 focus:ring-purple-500 focus:border-purple-500"
            />
            {errors.deadline && (
              <p className="mt-1 text-sm text-red-600">{errors.deadline.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiPlus className="mr-2" />
            {loading ? 'Adding...' : 'Add Goal'}
          </button>
        </form>
      )}

      {loading ? (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
        </div>
      ) : goals.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No goals set yet</p>
      ) : (
        <div className="space-y-4">
          {goals.map((goal) => (
            <div
              key={goal._id}
              className="p-4 bg-gray-50 rounded-lg"
            >              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900">{goal.title}</h3>
                <button
                  onClick={() => deleteGoal(goal._id)}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <FiTrash2 className="w-5 h-5" />
                </button>
              </div><div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">
                  Target: Rp {new Intl.NumberFormat('id-ID').format(goal.target_amount)}
                </p>
                <p className="text-sm text-gray-600">
                  Deadline: {formatDate(goal.target_date)}
                </p>
              </div>
              <div className="mb-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full"
                    style={{ width: `${calculateProgress(goal)}%` }}
                  ></div>
                </div>                <p className="text-sm text-gray-600 mt-1">
                  Progress: Rp {new Intl.NumberFormat('id-ID').format(goal.saved_amount)} / Rp {new Intl.NumberFormat('id-ID').format(goal.target_amount)}
                </p>
              </div>
              {selectedGoal === goal._id ? (
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={contributionAmount}
                    onChange={(e) => setContributionAmount(e.target.value)}
                    placeholder="Amount"
                    className="flex-1 rounded-lg border-gray-300 focus:ring-purple-500 focus:border-purple-500"
                  />
                  <button
                    onClick={() => handleContribution(goal._id)}
                    className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => {
                      setSelectedGoal(null)
                      setContributionAmount('')
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setSelectedGoal(goal._id)}
                  className="flex items-center text-sm font-medium text-purple-600 hover:text-purple-700"
                >
                  <FiCreditCard className="mr-1" />
                  Add Contribution
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}