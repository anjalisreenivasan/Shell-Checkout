import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { isBoardMember } from '@/lib/sheller'
import { z } from 'zod'

const itemSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  quantity: z.number().int().min(1).default(1),
})

// GET /api/items — public, returns all active items
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const query = searchParams.get('q') ?? ''

  let builder = supabaseAdmin
    .from('items')
    .select('*')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (query) {
    builder = builder.or(`name.ilike.%${query}%,description.ilike.%${query}%`)
  }

  const { data, error } = await builder
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ items: data })
}

// POST /api/items — board only
export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!(await isBoardMember(userId))) {
    return NextResponse.json({ error: 'Board members only' }, { status: 403 })
  }

  const body = await req.json()
  const parsed = itemSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { data: sheller } = await supabaseAdmin
    .from('shellers')
    .select('id')
    .eq('clerk_user_id', userId)
    .single()

  const { data, error } = await supabaseAdmin
    .from('items')
    .insert({ ...parsed.data, added_by: sheller?.id })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ item: data }, { status: 201 })
}
