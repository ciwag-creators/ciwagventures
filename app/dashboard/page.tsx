import { supabaseServer } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const { data: { user } } = await supabaseServer.auth.getUser()

  if (!user) {
    return <p>Please log in</p>
  }

  const { data: wallet } = await supabaseServer
    .from('wallets')
    .select('balance')
    .eq('user_id', user.id)
    .single()

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Email: {user.email}</p>
      <p>Balance: ₦{wallet?.balance ?? 0}</p>
    </div>
  )
}
