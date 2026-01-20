import { NextResponse } from 'next/server'
import supabaseAdmin from '@/lib/supabase/admin'

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const { user_id, network, phone, planId, amount } = body

    if (!user_id || !network || !phone || !planId || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const { data: wallet, error } = await supabaseAdmin
      .from('wallets')
      .select('id, balance')
      .eq('user_id', user_id)
      .single()

    if (error || !wallet) {
      return NextResponse.json({ error: 'Wallet not found' }, { status: 404 })
    }

    if (wallet.balance < amount) {
      return NextResponse.json(
        { error: 'Insufficient balance' },
        { status: 400 }
      )
    }

    const reference = `DAT-${Date.now()}`

    await supabaseAdmin.from('transactions').insert({
      user_id,
      amount,
      service: 'data',
      status: 'success',
      reference,
    })

    const newBalance = wallet.balance - amount

    await supabaseAdmin
      .from('wallets')
      .update({ balance: newBalance })
      .eq('id', wallet.id)

    return NextResponse.json({
      success: true,
      reference,
      new_balance: newBalance,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
