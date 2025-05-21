import { useState, useEffect } from 'react'
import { FiUser, FiMail, FiKey, FiSave } from 'react-icons/fi'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function Profile() {
  const [user, setUser] = useState({
    name: '',
    email: '',
    password: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
    // API base URL from environment variable
  const API_URL = import.meta.env.VITE_API_BASE_URL || 'https://sbd-kelas.vercel.app/api'
  
  // Get user info from localStorage on component mount
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}')
    setUser(prev => ({
      ...prev,
      name: storedUser.name || '',
      email: storedUser.email || ''
    }))
  }, [])
  
  const handleChange = (e) => {
    const { name, value } = e.target
    setUser(prev => ({
      ...prev,
      [name]: value
    }))
  }
  
  const updateProfile = async (e) => {
    e.preventDefault()
    
    // Validate passwords if updating password
    if (user.newPassword) {
      if (user.newPassword !== user.confirmPassword) {
        toast.error('New passwords do not match')
        return
      }
      if (!user.password) {
        toast.error('Current password is required to set a new password')
        return
      }
    }
    
    setLoading(true)
    
    try {
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}')
      const userId = storedUser._id
      
      if (!userId) {
        toast.error('User information not found')
        setLoading(false)
        return
      }
      
      // Prepare data for API
      const updateData = {
        name: user.name
      }
      
      // Add password update data if provided
      if (user.newPassword && user.password) {
        updateData.currentPassword = user.password
        updateData.newPassword = user.newPassword
      }
      
      // Update user profile
      const response = await axios.put(`${API_URL}/accounts/${userId}`, updateData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      // Update local storage with new user data
      const updatedUser = {
        ...storedUser,
        name: user.name
      }
      localStorage.setItem('user', JSON.stringify(updatedUser))
      
      toast.success('Profile updated successfully')
      
      // Clear password fields
      setUser(prev => ({
        ...prev,
        password: '',
        newPassword: '',
        confirmPassword: ''
      }))
    } catch (error) {
      console.error('Failed to update profile:', error)
      toast.error(error.response?.data?.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
      
      <div className="bg-white rounded-xl shadow-sm p-6">
        <form onSubmit={updateProfile} className="space-y-6">
          {/* Name Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiUser className="text-gray-400" />
              </div>
              <input
                type="text"
                name="name"
                value={user.name}
                onChange={handleChange}
                className="pl-10 w-full rounded-lg border-gray-300 focus:ring-purple-500 focus:border-purple-500"
                placeholder="Your full name"
              />
            </div>
          </div>
          
          {/* Email Field (readonly) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiMail className="text-gray-400" />
              </div>
              <input
                type="email"
                name="email"
                value={user.email}
                readOnly
                className="pl-10 w-full rounded-lg border-gray-300 bg-gray-50 text-gray-600"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
          </div>
          
          <div className="pt-4 border-t border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
            
            {/* Current Password */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiKey className="text-gray-400" />
                </div>
                <input
                  type="password"
                  name="password"
                  value={user.password}
                  onChange={handleChange}
                  className="pl-10 w-full rounded-lg border-gray-300 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Enter current password"
                />
              </div>
            </div>
            
            {/* New Password */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiKey className="text-gray-400" />
                </div>
                <input
                  type="password"
                  name="newPassword"
                  value={user.newPassword}
                  onChange={handleChange}
                  className="pl-10 w-full rounded-lg border-gray-300 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Enter new password"
                />
              </div>
            </div>
            
            {/* Confirm New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiKey className="text-gray-400" />
                </div>
                <input
                  type="password"
                  name="confirmPassword"
                  value={user.confirmPassword}
                  onChange={handleChange}
                  className="pl-10 w-full rounded-lg border-gray-300 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Confirm new password"
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? (
                <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
              ) : (
                <FiSave className="mr-2" />
              )}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
