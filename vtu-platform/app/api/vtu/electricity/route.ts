import supabaseAdmin from '@/lib/supabase/admin'
import { logWalletAction } from '@/lib/vtu/audit'
import vtuProvider from '@/lib/vtu'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      user_id,
      provider,
      meterNumber,
      amount,
      reference
    } = body

    if (!user_id || !provider || !meterNumber || !amount || !reference) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    /* ---------------- 1. FETCH WALLET ---------------- */
    const { data: wallet } = await supabaseAdmin
      .from('wallets')
      .select('*')
      .eq('user_id', user_id)
      .single()

    if (!wallet || wallet.balance < amount) {
      return Response.json(
        { error: 'Insufficient balance' },
        { status: 400 }
      )
    }

    /* ---------------- 2. IDEMPOTENCY ---------------- */
    const { data: existingTx } = await supabaseAdmin
      .from('transactions')
      .select('*')
      .eq('reference', reference)
      .single()
  
    if (existingTx) {
      return Response.json({
        success: existingTx.status === 'success',
        reference: existingTx.reference,
        status: existingTx.status,
        new_balance: wallet.balance
      })
    }

    /* ---------------- 3. CREATE TRANSACTION ---------------- */
    const { data: transaction } = await supabaseAdmin
      .from('transactions')
      .insert({
        user_id,
        amount,
        service: 'electricity',
        status: 'pending',
        reference,
        metadata: { provider, meterNumber }
      })
      .select()
      .single()

    try {
      /* ---------------- 4. DEBIT WALLET ---------------- */
      const balanceBefore = wallet.balance
      const balanceAfter = wallet.balance - amount

      await supabaseAdmin
        .from('wallets')
        .update({ balance: balanceAfter })
        .eq('id', wallet.id)

      await logWalletAction({
        user_id,
        action: 'electricity_debit',
        amount,
        balance_before: balanceBefore,
        balance_after: balanceAfter,
        reference
      })

      /* ---------------- 5. PROVIDER ---------------- */
      const result = await vtuProvider.bill({
        service: 'electricity',
        provider,
        meterNumber,
        amount,
        reference
      })

      if (!result.success) throw new Error('PROVIDER_FAILED')

      /* ---------------- 6. SUCCESS ---------------- */
      await supabaseAdmin
        .from('transactions')
        .update({
          status: 'success',
          metadata: { token: result.token }
        })
        .eq('id', transaction.id)

      return Response.json({
        success: true,
        reference,
        token: result.token,
        new_balance: balanceAfter
      })

    } catch (err) {
      /* ---------------- 7. REFUND ---------------- */
      await supabaseAdmin
        .from('wallets')
        .update({ balance: wallet.balance })
        .eq('id', wallet.id)

      await logWalletAction({
        user_id,
        action: 'electricity_refund',
        amount,
        balance_before: wallet.balance - amount,
        balance_after: wallet.balance,
        reference
      })

      await supabaseAdmin
        .from('transactions')
        .update({ status: 'failed' })
        .eq('id', transaction.id)

      return Response.json(
        { error: 'Payment failed. Wallet refunded.' },
        { status: 500 }
      )
    }

  } catch (err) {
    return Response.json({ error: 'Server error' }, { status: 500 })
  }
}
