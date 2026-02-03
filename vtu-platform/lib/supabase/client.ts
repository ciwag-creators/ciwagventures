import { createBrowserClient } from '@supabase/ssr'
import supabase from '@/lib/supabase/client'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default supabase
