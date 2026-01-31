import supabaseAdmin from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/admin-auth'

export async function GET() {
  try {
    // 🔐 Admin auth check
    await requireAdmin()

    /* ---------------- DAILY REVENUE ---------------- */
    const { data: revenueData, error: revenueError } = await supabaseAdmin
      .from('transactions')
      .select('created_at, amount')
      .eq('status', 'success')

    if (revenueError) {
      throw revenueError
    }

    const dailyRevenueMap: Record<string, number> = {}

    revenueData.forEach(tx => {
      const date = tx.created_at.split('T')[0]
      dailyRevenueMap[date] = (dailyRevenueMap[date] || 0) + tx.amount
    })

    const daily_revenue = Object.entries(dailyRevenueMap).map(
      ([date, total]) => ({ date, total })
    )

    /* ---------------- DAILY TRANSACTIONS ---------------- */
    const { data: txData, error: txError } = await supabaseAdmin
      .from('transactions')
      .select('created_at')

    if (txError) {
      throw txError
    }

    const dailyTxMap: Record<string, number> = {}

    txData.forEach(tx => {
      const date = tx.created_at.split('T')[0]
      dailyTxMap[date] = (dailyTxMap[date] || 0) + 1
    })

    const daily_transactions = Object.entries(dailyTxMap).map(
      ([date, total]) => ({ date, total })
    )

    return Response.json({
      daily_revenue,
      daily_transactions
    })

  } catch (err: any) {
    console.error('❌ Admin stats error:', err)
    return Response.json(
      { error: err.message || 'Unauthorized' },
      { status: 401 }
    )
  }
}