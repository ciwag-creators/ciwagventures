import supabaseAdmin from '@/lib/supabase/admin'
import { logWalletAction } from '@/lib/vtu/audit'
import vtuProvider from '@/lib/vtu'

export async function POST(req: Request) {
  try {
    /* ---------------- 0. PARSE BODY ---------------- */
    const body = await req.json()
    const { user_id, network, phone, planId, amount, reference } = body

    if (!user_id || !network || !phone || !planId || !amount || !reference) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    /* ---------------- 1. FETCH WALLET ---------------- */
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

    /* ---------------- 2. IDEMPOTENCY CHECK ---------------- */
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
    const { data: transaction, error: txError } = await supabaseAdmin
      .from('transactions')
      .insert({
        user_id,
        amount,
        service: 'data',
        status: 'pending',
        reference,
        metadata: { network, phone, planId }
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
      /* ---------------- 4. DEDUCT WALLET ---------------- */
      const balanceBefore = wallet.balance
      const balanceAfter = wallet.balance - amount

      await supabaseAdmin
        .from('wallets')
        .update({ balance: balanceAfter })
        .eq('id', wallet.id)

      await logWalletAction({
        user_id,
        action: 'data_debit',
        amount,
        balance_before: balanceBefore,
        balance_after: balanceAfter,
        reference,
        metadata: { network, phone, planId }
      })

      /* ---------------- 5. VTU PROVIDER ---------------- */
      const result = await vtuProvider.data({
        network,
        phone,
        planId,
        amount,
        reference
      })

      if (!result.success) {
        throw new Error('VTU_PROVIDER_FAILED')
      }

      /* ---------------- 6. MARK SUCCESS ---------------- */
      await supabaseAdmin
        .from('transactions')
        .update({ status: 'success' })
        .eq('id', transaction.id)

      return Response.json({
        success: true,
        reference,
        new_balance: balanceAfter
      })

    } catch (err) {
      console.error('❌ VTU failed, refunding...', err)

      /* ---------------- 7. REFUND ---------------- */
      await supabaseAdmin
        .from('wallets')
        .update({ balance: wallet.balance })
        .eq('id', wallet.id)

      await logWalletAction({
        user_id,
        action: 'data_refund',
        amount,
        balance_before: wallet.balance - amount,
        balance_after: wallet.balance,
        reference,
        metadata: { reason: 'VTU_PROVIDER_FAILED' }
      })

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
