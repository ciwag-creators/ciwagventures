'use client'

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
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">Date</th>
            <th className="p-2 border">User</th>
            <th className="p-2 border">Service</th>
            <th className="p-2 border">Amount</th>
            <th className="p-2 border">Status</th>
            <th className="p-2 border">Reference</th>
          </tr>
        </thead>

        <tbody>
          {data.map(tx => (
            <tr key={tx.id} className="border-b">
              <td className="p-2 border">
                {new Date(tx.created_at).toLocaleString()}
              </td>
              <td className="p-2 border">{tx.user_id}</td>
              <td className="p-2 border capitalize">
                {tx.service}
              </td>
              <td className="p-2 border">₦{tx.amount}</td>
              <td
                className={`p-2 border font-medium ${
                  tx.status === 'success'
                    ? 'text-green-600'
                    : tx.status === 'failed'
                    ? 'text-red-600'
                    : 'text-yellow-600'
                }`}
              >
                {tx.status}
              </td>
              <td className="p-2 border text-xs">
                {tx.reference}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
