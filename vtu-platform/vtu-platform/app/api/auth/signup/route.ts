import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()

  const { data, error } = await supabaseServer.auth.signUp({
    email,
    password
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  if (data.user) {
    await supabaseServer.from('wallets').insert({
      user_id: data.user.id,
      balance: 0
    })
  }

  return NextResponse.json({ message: 'Signup successful' })
}
