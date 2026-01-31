'use client'

import StatusBadge from '@/components/admin/StatusBadge'

type Transaction = {
  id: string
  reference: string
  service: string
  amount: number
  status: string
  created_at: string
}

export default function TransactionsTable({
  data
}: {
  data: Transaction[]
}) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse">
        <thead>
          <tr className="border-b bg-gray-50 text-left text-sm text-gray-600">
            <th className="py-3 px-4">Reference</th>
            <th className="py-3 px-4">Service</th>
            <th className="py-3 px-4">Amount</th>
            <th className="py-3 px-4">Status</th>
            <th className="py-3 px-4">Date</th>
          </tr>
        </thead>

        <tbody>
          {data.map(tx => (
            <tr
              key={tx.id}
              className="border-b text-sm hover:bg-gray-50 transition"
            >
              <td className="py-3 px-4 font-mono text-xs">
                {tx.reference}
              </td>

              <td className="py-3 px-4 capitalize">
                {tx.service}
              </td>

              <td className="py-3 px-4 font-medium">
                ₦{tx.amount.toLocaleString()}
              </td>

              <td className="py-3 px-4">
                <StatusBadge status={tx.status} />
              </td>

              <td className="py-3 px-4 text-gray-500">
                {new Date(tx.created_at).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {data.length === 0 && (
        <div className="text-center py-6 text-gray-500">
          No transactions yet
        </div>
      )}
    </div>
  )
}
