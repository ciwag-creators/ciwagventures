async function getStats() {
  const res = await fetch(
    ${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/stats,
    { cache: 'no-store' }
  )

  if (!res.ok) throw new Error('Failed to load stats')
  return res.json()
}

export default async function AdminDashboard() {
  const stats = await getStats()

  return (
    <div className="grid grid-cols-2 gap-6">
      <Stat label="Users" value={stats.users} />
      <Stat label="Wallet Balance" value={₦${stats.total_wallet_balance}} />
      <Stat label="Total Revenue" value={₦${stats.total_revenue}} />
      <Stat label="Today Revenue" value={₦${stats.today_revenue}} />
    </div>
  )
}

function Stat({ label, value }: { label: string; value: any }) {
  return (
    <div className="bg-white p-6 rounded shadow">
      <p className="text-gray-500">{label}</p>
      <h2 className="text-2xl font-bold">{value}</h2>
    </div>
  )
}