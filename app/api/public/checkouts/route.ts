import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/public/checkouts — no auth required, returns active checkouts for home page
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('checkouts')
    .select('*, sheller:shellers(id, name), item:items(id, name, description)')
    .in('status', ['approved', 'returned'])
    .order('checkout_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ checkouts: data })
}
