import WalletsTable from '@/components/admin/WalletsTable'

async function getWallets() {
  const res = await fetch('/api/admin/wallets', {
    cache: 'no-store'
  })

  if (!res.ok) {
    throw new Error('Failed to fetch wallets')
  }

  const json = await res.json()
  return json.data
}

export default async function AdminWallets() {
  const wallets = await getWallets()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Wallets</h1>

      <div className="bg-white rounded-xl shadow p-4">
        <WalletsTable data={wallets} />
      </div>
    </div>
  )
}