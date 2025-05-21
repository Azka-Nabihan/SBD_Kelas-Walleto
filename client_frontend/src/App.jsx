import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import Goals from './pages/Goals'
import Profile from './pages/Profile'
import Layout from './components/Layout'

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Check if user is already authenticated from localStorage
  const checkAuth = () => {
    const token = localStorage.getItem('token')
    const user = localStorage.getItem('user')
    if (token && user) {
      setIsAuthenticated(true)
    } else {
      setIsAuthenticated(false)
    }
  }

  useEffect(() => {
    // Check authentication status on initial load
    checkAuth()
    
    // Listen for storage events (including our custom ones)
    const handleStorageChange = () => {
      checkAuth()
    }
    
    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-cyan-500">
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#fff',
              color: '#363636',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              borderRadius: '0.5rem',
            },
            success: {
              iconTheme: {
                primary: '#10B981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#EF4444',
                secondary: '#fff',
              },
            },
          }}
        />
        <Routes>
          <Route path="/login" element={
            !isAuthenticated ? <Login /> : <Navigate to="/dashboard" />
          } />
          <Route path="/register" element={
            !isAuthenticated ? <Register /> : <Navigate to="/dashboard" />
          } />
          <Route path="/dashboard" element={
            isAuthenticated ? (
              <Layout>
                <Dashboard />
              </Layout>
            ) : <Navigate to="/login" />
          } />
          <Route path="/transactions" element={
            isAuthenticated ? (
              <Layout>
                <Transactions />
              </Layout>
            ) : <Navigate to="/login" />
          } />
          <Route path="/goals" element={
            isAuthenticated ? (
              <Layout>
                <Goals />
              </Layout>
            ) : <Navigate to="/login" />
          } />
          <Route path="/profile" element={
            isAuthenticated ? (
              <Layout>
                <Profile />
              </Layout>
            ) : <Navigate to="/login" />
          } />
          <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  )
}