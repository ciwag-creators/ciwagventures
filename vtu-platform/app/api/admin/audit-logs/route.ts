import supabaseAdmin from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/admin-auth'

export async function GET() {
  try {
    // 🔐 Admin guard
    await requireAdmin()

    /* ---------------- USERS ---------------- */
    const { count: totalUsers } = await supabaseAdmin
      .from('profiles')
      .select('id', { count: 'exact', head: true })

    /* ---------------- WALLETS ---------------- */
    const { data: wallets } = await supabaseAdmin
      .from('wallets')
      .select('balance')

    const totalWalletBalance =
      wallets?.reduce((sum, w) => sum + w.balance, 0) || 0

    /* ---------------- TRANSACTIONS ---------------- */
    const { data: transactions } = await supabaseAdmin
      .from('transactions')
      .select(
        amount,
        profit,
        service,
        status,
        created_at
      )
      .eq('status', 'success')

const totalRevenue =
  transactions?.reduce(
    (sum, t) => sum + (t.profit || 0),
    0
  ) || 0

    /* ---------------- TODAY STATS ---------------- */
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const todaysTx =
      transactions?.filter(
        (t) => new Date(t.created_at) >= today
      ) || []

    const todayRevenue =
      todaysTx.reduce((sum, t) => sum + (t.profit || 0), 0)

    /* ---------------- SERVICE BREAKDOWN ---------------- */
    const serviceCounts = {
      airtime: 0,
      data: 0,
      bill: 0
    }

    for (const tx of transactions || []) {
      if (tx.service === 'airtime') serviceCounts.airtime++
      if (tx.service === 'data') serviceCounts.data++
      if (tx.service === 'bill') serviceCounts.bill++
    }

    return Response.json({
      users: totalUsers || 0,
      total_wallet_balance: totalWalletBalance,
      total_revenue: totalRevenue,
      today_transactions: todaysTx.length,
      today_revenue: todayRevenue,
      services: serviceCounts
    })

  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (err.message === 'FORBIDDEN') {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }

    return Response.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}