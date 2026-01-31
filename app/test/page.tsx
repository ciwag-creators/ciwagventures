import { supabase } from '@/lib/supabase/client'

export default async function TestPage() {
  const { data, error } = await supabase.from('wallets').select('*')
  return (
    <pre>{JSON.stringify({ data, error }, null, 2)}</pre>
  )
}
