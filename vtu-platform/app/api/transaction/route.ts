import supabaseAdmin from '@/lib/supabase/admin'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const user_id = searchParams.get('user_id')

    if (!user_id) {
      return Response.json(
        { error: 'user_id is required' },
        { status: 400 }
      )
    }

    const { data: transactions, error } = await supabaseAdmin
      .from('transactions')
      .select('*')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Fetch transactions error:', error)
      return Response.json(
        { error: 'Failed to fetch transactions' },
        { status: 500 }
      )
    }

    return Response.json({
      success: true,
      transactions
    })

  } catch (err) {
    console.error('❌ Server error:', err)
    return Response.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}