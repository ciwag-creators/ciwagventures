import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'

export async function requireAdmin() {
  const supabase = createServerComponentClient({
    cookies
  })

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('UNAUTHORIZED')
  }

  const { data: admin } = await supabase
    .from('admins')
    .select('id')
    .eq('id', user.id)
    .single()

  if (!admin) {
    throw new Error('FORBIDDEN')
  }

  return user
}