import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export async function requireAdmin() {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: name => cookies().get(name)?.value
      }
    }
  )

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
