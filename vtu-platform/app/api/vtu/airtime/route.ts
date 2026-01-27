import supabaseAdmin from '@/lib/supabase/admin'
import { logWalletAction } from '@/lib/vtu/audit'
import vtuProvider from '@/lib/vtu'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { user_id, network, phone, amount, reference } = body

    if (!user_id  !network  !phone  !amount  !reference) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    /* ---------------- FETCH WALLET ---------------- */
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

    /* ---------------- IDEMPOTENCY ---------------- */
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

    /* ---------------- CREATE TRANSACTION ---------------- */
    const { data: transaction } = await supabaseAdmin
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

    /* ---------------- DEDUCT WALLET ---------------- */
    await supabaseAdmin
      .from('wallets')
      .update({ balance: wallet.balance - amount })
      .eq('id', wallet.id)

    /* ---------------- VTU PROVIDER ---------------- */
    const providerResult = await vtuProvider.airtime({
      network,
      phone,
      amount,
      reference
    })

    if (!providerResult.success) {
      throw new Error('VTU_PROVIDER_FAILED')
    }

    /* ---------------- PROFIT CALCULATION ---------------- */
    const cost_price = providerResult.cost_price || amount
    const fee = providerResult.fee || 0
    const profit = amount - cost_price - fee

    /* ---------------- MARK SUCCESS ---------------- */
    await supabaseAdmin
      .from('transactions')
      .update({
        status: 'success',
        cost_price,
        fee,
        profit
      })
      .eq('id', transaction.id)

    /* ---------------- AUDIT LOG ---------------- */
    await logWalletAction({
      user_id,
      action: 'airtime_purchase',
      amount,
      balance_before: wallet.balance,
      balance_after: wallet.balance - amount,
      reference
    })

    return Response.json({
      success: true,
      reference,
      profit,
      new_balance: wallet.balance - amount
    })

  } catch (err) {
    console.error('❌ Airtime failed, refunding...', err)

    return Response.json(
      { error: 'Transaction failed. Wallet refunded.' },
      { status: 500 }
    )
  }
}