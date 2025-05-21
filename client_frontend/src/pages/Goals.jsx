import { useState, useEffect } from 'react'
import GoalsManagement from '../components/GoalsManagement'
import { FiTarget } from 'react-icons/fi'
import toast from 'react-hot-toast'

export default function Goals() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (!token || !user) {
      setError('Authentication error. Please log in again.');
      toast.error('Authentication error. Please log in again.');
    }
    
    setIsLoading(false);
  }, []);

  if (error) {
    return (
      <div className="p-6 bg-white rounded-xl shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center mb-4">
          <FiTarget className="mr-2" /> Financial Goals
        </h1>
        <div className="text-red-500 p-4 bg-red-50 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 flex items-center">
        <FiTarget className="mr-2" /> Financial Goals
      </h1>
      
      <GoalsManagement />
    </div>
  )
}
