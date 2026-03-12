import { getAuthUserId } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { isBoardMember, getSheller } from '@/lib/sheller'
import { z } from 'zod'

const blockoutSchema = z.object({
  item_id: z.string().uuid(),
  title: z.string().min(1),
  start_at: z.string(),
  end_at: z.string(),
})

// GET /api/blockouts?item_id=xxx — public, returns blockouts for an item (or all)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const itemId = searchParams.get('item_id')

  let query = supabaseAdmin
    .from('blockouts')
    .select('*, item:items(id, name)')
    .order('start_at', { ascending: true })

  if (itemId) {
    query = query.eq('item_id', itemId)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ blockouts: data })
}

// POST /api/blockouts — board only
export async function POST(req: NextRequest) {
  const userId = await getAuthUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!(await isBoardMember(userId))) {
    return NextResponse.json({ error: 'Board members only' }, { status: 403 })
  }

  const sheller = await getSheller(userId)
  const body = await req.json()
  const parsed = blockoutSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { data, error } = await supabaseAdmin
    .from('blockouts')
    .insert({ ...parsed.data, created_by: sheller?.id })
    .select('*, item:items(id, name)')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ blockout: data }, { status: 201 })
}
