import RevenueChart from '@/components/charts/RevenueChart'

async function getRevenueData() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/stats`,
    { cache: 'no-store' }
  )

  const data = await res.json()

  // Example transform
  return data.daily_revenue.map((d: any) => ({
    date: d.date,
    revenue: d.total
  }))
}

export default async function AdminDashboard() {
  const revenueData = await getRevenueData()

  return (
    <div className="space-y-6">
      <RevenueChart data={revenueData} />
    </div>
  )
}
