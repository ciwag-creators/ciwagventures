import TransactionsTable from '@/components/charts/TransactionsTable'

async function getTransactions() {
  const res = await fetch('/api/admin/transactions', {
    cache: 'no-store'
  })

  if (!res.ok) {
    throw new Error('Failed to fetch transactions')
  }

  const json = await res.json()
  return json.data
}

export default async function AdminTransactions() {
  const transactions = await getTransactions()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Transactions</h1>

      <div className="bg-white rounded-xl shadow p-4">
        <TransactionsTable data={transactions} />
      </div>
    </div>
  )
}