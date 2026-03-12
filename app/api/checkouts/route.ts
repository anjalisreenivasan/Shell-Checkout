import { getAuthUserId } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { isBoardMember, getSheller } from '@/lib/sheller'
import { notifyNewRequest } from '@/lib/discord'
import { z } from 'zod'

const checkoutSchema = z.object({
  item_id: z.string().uuid(),
  checkout_at: z.string(),
  return_date: z.string(),
  return_time: z.string(),
  contract_url: z.string().optional(),
  rental_consent: z.boolean(),
})

// GET /api/checkouts — board gets all, sheller gets own
export async function GET(req: NextRequest) {
  const userId = await getAuthUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const board = await isBoardMember(userId)
  const sheller = await getSheller(userId)
  if (!sheller) return NextResponse.json({ error: 'Sheller not found' }, { status: 404 })

  let query = supabaseAdmin
    .from('checkouts')
    .select('*, sheller:sheller_id(id, name, email), item:items(id, name, description)')
    .order('created_at', { ascending: false })

  if (!board) {
    query = query.eq('sheller_id', sheller.id)
  }

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  if (status) query = query.eq('status', status)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ checkouts: data })
}

// POST /api/checkouts — any authenticated sheller
export async function POST(req: NextRequest) {
  const userId = await getAuthUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sheller = await getSheller(userId)
  if (!sheller) return NextResponse.json({ error: 'Sheller not found' }, { status: 404 })

  const body = await req.json()
  const parsed = checkoutSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { data, error } = await supabaseAdmin
    .from('checkouts')
    .insert({ ...parsed.data, sheller_id: sheller.id, status: 'pending' })
    .select('*, sheller:sheller_id(id, name, email), item:items(id, name, description)')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const boardUrl = `${req.headers.get('origin') ?? process.env.NEXT_PUBLIC_APP_URL ?? ''}/board`
  notifyNewRequest(
    sheller.name,
    sheller.discord_handle ?? null,
    data.item?.name ?? 'Unknown item',
    parsed.data.return_date,
    parsed.data.return_time,
    boardUrl,
  ).catch(err => console.error('Discord notification failed:', err))

  return NextResponse.json({ checkout: data }, { status: 201 })
}
