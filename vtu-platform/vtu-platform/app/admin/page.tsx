import RevenueChart from '@/components/charts/RevenueChart'
import DailyTransactions from '@/components/charts/DailyTransactions'
import TransactionsTable from '@/components/charts/TransactionsTable'
import { requireAdmin } from '@/lib/admin-auth'

type RevenueItem = {
  date: string
  revenue: number
}

type TransactionItem = {
  id: string
  user_id: string
  service: string
  amount: number
  status: string
  reference: string
  created_at: string
}

/* ---------------- FETCH ADMIN STATS ---------------- */
async function getAdminStats() {
  const res = await fetch('/api/admin/stats', { cache: 'no-store' })

  if (!res.ok) throw new Error('Failed to fetch admin stats')

  return res.json()
}

/* ---------------- FETCH TRANSACTIONS ---------------- */
async function getTransactions() {
  const res = await fetch('/api/admin/transactions', { cache: 'no-store' })

  if (!res.ok) throw new Error('Failed to fetch transactions')

  const json = await res.json()
  return json.data as TransactionItem[]
}

/* ---------------- ADMIN DASHBOARD PAGE ---------------- */
export default async function AdminDashboard() {
  // 🔐 Protect admin page
  await requireAdmin()

  const stats = await getAdminStats()
  const transactions = await getTransactions()

  // Map stats for charts
  const revenueData: RevenueItem[] = stats.daily_revenue.map((d: any) => ({
    date: d.date,
    revenue: d.total
  }))

  const transactionData: TransactionItem[] = stats.daily_transactions || transactions

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      {/* Revenue Chart */}
      <div className="bg-white rounded-xl shadow p-4">
        <h2 className="text-lg font-semibold mb-4">Daily Revenue</h2>
        <RevenueChart data={revenueData} />
      </div>

      {/* Daily Transactions Chart */}
      <div className="bg-white rounded-xl shadow p-4">
        <h2 className="text-lg font-semibold mb-4">Daily Transactions</h2>
        <DailyTransactions data={transactionData} />
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl shadow p-4">
        <h2 className="text-lg font-semibold mb-4">Recent Transactions</h2>
        <TransactionsTable data={transactions} />
      </div>
    </div>
  )
}