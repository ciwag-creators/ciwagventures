import supabaseAdmin from '@/lib/supabase/admin'
import { logWalletAction } from '@/lib/vtu/audit'
import vtuProvider from '@/lib/vtu'

interface AirtimeRequestBody {
  user_id: string
  network: string
  phone: string
  amount: number
  reference: string
}

export async function POST(req: Request) {
  try {
    const body: AirtimeRequestBody = await req.json()

    const { user_id, network, phone, amount, reference } = body

    /* ---------------- VALIDATION ---------------- */
    if (
      !user_id ||
      !network ||
      !phone ||
      !amount ||
      !reference
    ) {
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

    /* ---------------- IDEMPOTENCY CHECK ---------------- */
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

      /* ---------------- VTU PROVIDER ---------------- */
      const providerResult = await vtuProvider.purchaseAirtime({
        network,
        phone,
        amount,

      })

      if (!providerResult.success) {
        throw new Error('VTU_PROVIDER_FAILED')
      }

      /* ---------------- PROFIT CALCULATION ---------------- */
      const cost_price = providerResult.cost_price ?? amount
      const fee = providerResult.fee ?? 0
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
        reference,
        metadata: {
          network,
          phone
        }
      })

      return Response.json({
        success: true,
        reference,
        profit,
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
        { error: 'Transaction failed. Wallet refunded.' },
        { status: 500 }
      )
    }

    } catch (err) {
    console.error('❌ Server error:', err)
    return Response.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}