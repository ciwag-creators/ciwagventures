import supabaseAdmin from '@/lib/supabase/admin'

await requireAdmin()

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('transactions')
    .select('amount, profit, status')

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  const totalVolume = data.reduce((sum, tx) => sum + tx.amount, 0)
  const totalProfit = data.reduce((sum, tx) => sum + (tx.profit || 0), 0)
  const successCount = data.filter(tx => tx.status === 'success').length
  const failedCount = data.filter(tx => tx.status === 'failed').length

  return Response.json({
    total_transactions: data.length,
    successful: successCount,
    failed: failedCount,
    total_volume: totalVolume,
    total_profit: totalProfit
  })
}
