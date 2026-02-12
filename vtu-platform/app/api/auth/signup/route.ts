import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()

  if (!email || !password) {
    return NextResponse.json(
      { error: 'Missing credentials' },
      { status: 400 }
    )
  }

  const supabase = await supabaseServer()

  const { data, error } = await supabase.auth.signUp({
    email,
    password
  })

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    )
  }

  return NextResponse.json({
    user: data.user
  })
}