'use client'

import { useState } from 'react'

type Transaction = {
  id: string
  user_id: string
  service: string
  amount: number
  status: string
  reference: string
  created_at: string
}

export default function TransactionsTable({
  data
}: {
  data: Transaction[]
}) {
  const [status, setStatus] = useState('')
  const [service, setService] = useState('')
  const [date, setDate] = useState('')

  const filtered = data.filter(tx => {
    if (status && tx.status !== status) return false
    if (service && tx.service !== service) return false
    if (date && !tx.created_at.startsWith(date)) return false
    return true
  })

  return (
    <div className="space-y-4">
      {/* 🔍 Filters */}
      <div className="flex flex-wrap gap-4">
        <select
          className="border rounded px-3 py-2"
          value={status}
          onChange={e => setStatus(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="success">Success</option>
          <option value="failed">Failed</option>
          <option value="pending">Pending</option>
        </select>

        <select
          className="border rounded px-3 py-2"
          value={service}
          onChange={e => setService(e.target.value)}
        >
          <option value="">All Services</option>
          <option value="airtime">Airtime</option>
          <option value="data">Data</option>
          <option value="bill">Bill</option>
        </select>

        <input
          type="date"
          className="border rounded px-3 py-2"
          value={date}
          onChange={e => setDate(e.target.value)}
        />
      </div>

      {/* 📊 Table */}
      <div className="overflow-x-auto">
        <table className="w-full border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">Date</th>
              <th className="p-2 border">Service</th>
              <th className="p-2 border">Amount</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Reference</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(tx => (
              <tr key={tx.id}>
                <td className="p-2 border">
                  {new Date(tx.created_at).toLocaleDateString()}
                </td>
                <td className="p-2 border capitalize">{tx.service}</td>
                <td className="p-2 border">₦{tx.amount}</td>
                <td className="p-2 border">
                  <span
                    className={`px-2 py-1 rounded text-white text-xs ${
                      tx.status === 'success'
                        ? 'bg-green-600'
                        : tx.status === 'failed'
                        ? 'bg-red-600'
                        : 'bg-yellow-600'
                    }`}
                  >
                    {tx.status}
                  </span>
                </td>
                <td className="p-2 border">{tx.reference}</td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-500">
                  No transactions found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
