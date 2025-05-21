import { useState, useEffect } from 'react'
import TransactionForm from '../components/TransactionForm'
import TransactionList from '../components/TransactionList'
import { FiFileText } from 'react-icons/fi'

export default function Transactions() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 flex items-center">
        <FiFileText className="mr-2" /> Transactions
      </h1>
      
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Transaction</h2>
        <TransactionForm />
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Transaction History</h2>
        <TransactionList />
      </div>
    </div>
  )
}
