import { requireAdmin } from '@/lib/admin-auth'

import StatCard from '@/components/Admin/StatCard'
import RevenueChart from '@/components/charts/RevenueChart'
import DailyTransactions from '@/components/charts/DailyTransactions'
import TransactionsTable from '@/components/charts/TransactionsTable'

/* ---------------- FETCH ADMIN STATS ---------------- */
async function getAdminStats() {
  const res = await fetch('/api/admin/stats', {
    cache: 'no-store'
  })

  if (!res.ok) {
    throw new Error('Failed to fetch admin stats')
  }

  return res.json()
}

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

export default async function AdminDashboard() {
  // 🔐 Protect admin dashboard
  await requireAdmin()

  const stats = await getAdminStats()
  const transactions = await getTransactions()

  return (
    <div className="p-6 space-y-10">
      {/* ---------------- PAGE TITLE ---------------- */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Admin Dashboard
        </h1>
        <p className="text-sm text-gray-500">
          Overview of platform activity
        </p>
      </div>

      {/* ---------------- STATS GRID ---------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value={`₦${stats.total_revenue.toLocaleString()}`}

        <StatCard
          title="Total Transactions"
          value={stats.total_transactions}
        />

        <StatCard
          title="Successful"
          value={stats.successful_transactions}
        />
        <StatCard
          title="Pending"
          value={stats.pending_transactions}
        />
      </div>

      {/* ---------------- CHARTS ---------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <h2 className="text-lg font-semibold mb-4">
            Daily Revenue
          </h2>
          <RevenueChart data={stats.daily_revenue} />
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-4">
          <h2 className="text-lg font-semibold mb-4">
            Daily Transactions
          </h2>
          <DailyTransactions data={stats.daily_transactions} />
        </div>
      </div>

      {/* ---------------- RECENT TRANSACTIONS ---------------- */}
      <div className="bg-white rounded-xl shadow-sm border p-4">
        <h2 className="text-lg font-semibold mb-4">
          Recent Transactions
        </h2>
        <TransactionsTable data={transactions} />
      </div>
    </div>
  )
}