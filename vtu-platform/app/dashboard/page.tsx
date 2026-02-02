import StatCard from '@/components/admin/StatCard'
import { requireUser } from '@/lib/auth/requireUser'
import supabaseAdmin from '@/lib/supabase/admin'

export default async function UserDashboard() {
  const user = await requireUser()

  const { data: wallet } = await supabaseAdmin
    .from('wallets')
    .select('balance')
    .eq('user_id', user.id)
    .single()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">
        Dashboard
      </h1>

      <StatCard
        title="Wallet Balance"
        value={`₦${(wallet?.balance ?? 0).toLocaleString()}`}
      />
    </div>
  )
}
