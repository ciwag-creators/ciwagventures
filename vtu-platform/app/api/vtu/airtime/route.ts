import supabaseAdmin from '@/lib/supabase/admin'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { user_id, network, phone, amount } = body

    if (!user_id || !network || !phone || !amount) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    /* ---------------- FETCH WALLET ---------------- */
    const { data: wallet, error: walletError } = await supabaseAdmin
      .from('wallets')
      .select('*')
      .eq('user_id', user_id)
      .single()

    if (walletError || !wallet) {
      return Response.json({ error: 'Wallet not found' }, { status: 404 })
    }

    if (wallet.balance < amount) {
      return Response.json(
        { error: 'Insufficient balance' },
        { status: 400 }
      )
    }

    const reference = `AIR-${Date.now()}`

    /* ---------------- CREATE TRANSACTION ---------------- */
    const { data: transaction, error: txError } = await supabaseAdmin
      .from('transactions')
      .insert({
        user_id,
        amount,
        service: 'airtime',
        status: 'pending',
        reference
      })
      .select()
      .single()

    if (txError || !transaction) {
      return Response.json(
        { error: 'Failed to create transaction' },
        { status: 500 }
      )
    }

    try {
      /* ---------------- DEDUCT WALLET ---------------- */
      await supabaseAdmin
        .from('wallets')
        .update({ balance: wallet.balance - amount })
        .eq('id', wallet.id)

      /* ---------------- SIMULATE VTU PROVIDER ---------------- */
      const vtuSuccess = true // replace later with real provider call

      if (!vtuSuccess) {
        throw new Error('VTU_PROVIDER_FAILED')
      }

      /* ---------------- MARK SUCCESS ---------------- */
      await supabaseAdmin
        .from('transactions')
        .update({ status: 'success' })
        .eq('id', transaction.id)

      return Response.json({
        success: true,
        reference,
        new_balance: wallet.balance - amount
      })

    } catch (err) {
      console.error('❌ VTU failed, refunding...', err)

      /* ---------------- REFUND ---------------- */
      await supabaseAdmin
        .from('wallets')
        .update({ balance: wallet.balance })
        .eq('id', wallet.id)

      await supabaseAdmin
        .from('transactions')
        .update({ status: 'failed' })
        .eq('id', transaction.id)

      return Response.json(
        { error: 'VTU failed. Wallet refunded.' },
        { status: 500 }
      )
    }
  } catch (err) {
    console.error('❌ Server error:', err)
    return Response.json({ error: 'Server error' }, { status: 500 })
  }
}
