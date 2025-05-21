import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema } from '../../utils/validationSchemas'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function Login() {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  
  // API base URL from environment variable
  const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      // Since we don't have a dedicated login endpoint yet, 
      // we'll get accounts and find the matching one
      const response = await axios.get(`${API_URL}/accounts`)
      const accounts = response.data
      
      const user = accounts.find(
        account => account.email === data.email && account.password === data.password
      )
      
      if (!user) {
        throw new Error('Invalid email or password')
      }
      
      // Create a simple token
      const token = btoa(`${user._id}:${Date.now()}`)
        // Store auth data in localStorage
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      
      // Dispatch a custom event to notify App.jsx of authentication change
      window.dispatchEvent(new Event('storage'))
      
      toast.success('Login successful!')
      navigate('/dashboard')
    } catch (error) {
      console.error('Login error:', error)
      const message = error.response?.data?.message || error.message || 'Login failed'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Welcome to Walleto
          </h2>
          <p className="mt-2 text-center text-sm text-gray-100">
            Sign in to manage your finances
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                {...register('email')}
                type="email"
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                {...register('password')}
                type="password"
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm"
                placeholder="Password"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          <div className="text-sm text-center">
            <Link
              to="/register"
              className="font-medium text-white hover:text-purple-200"
            >
              Don't have an account? Sign up
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
} 