import { useState } from 'react'
import { FiMenu, FiX, FiHome, FiPieChart, FiTarget, FiUser, FiLogOut } from 'react-icons/fi'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function Layout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
    const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    
    // Dispatch a custom event to notify App.jsx of authentication change
    window.dispatchEvent(new Event('storage'))
    
    // Show success message
    toast.success('Logged out successfully')
    
    // Redirect to login page
    navigate('/login')
  }

  const navItems = [
    { path: '/dashboard', icon: <FiHome />, label: 'Dashboard' },
    { path: '/transactions', icon: <FiPieChart />, label: 'Transactions' },
    { path: '/goals', icon: <FiTarget />, label: 'Goals' },
    { path: '/profile', icon: <FiUser />, label: 'Profile' },
  ]

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0`}>
        <div className="flex items-center justify-between h-16 px-4 border-b">
          <h1 className="text-2xl font-bold text-purple-600">Walleto</h1>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden">
            <FiX className="w-6 h-6" />
          </button>
        </div>
        <nav className="px-4 py-6">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-4 py-3 mb-2 rounded-lg transition-colors ${
                location.pathname === item.path
                  ? 'bg-purple-100 text-purple-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        {/* Top Navigation */}
        <header className="h-16 bg-white shadow-sm">
          <div className="flex items-center justify-between h-full px-6">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden"
            >
              <FiMenu className="w-6 h-6" />
            </button>
            <div className="flex items-center space-x-4">              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white">
                  <FiUser />
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center text-gray-600 hover:text-red-500"
                >
                  <FiLogOut className="mr-1" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
} 