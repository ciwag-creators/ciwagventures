import supabaseAdmin from '@/lib/supabase/admin.js'

export async function logWalletAction({
  user_id,
  action,
  amount,
  balance_before,
  balance_after,
  reference,
  metadata = {}
}) {
  await supabaseAdmin.from('wallet_logs').insert({
    user_id,
    action,
    amount,
    balance_before,
    balance_after,
    reference,
    metadata
  })
}
