import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { isBoardMember } from '@/lib/sheller'
import { z } from 'zod'

const schema = z.object({
  sheller_id: z.string().uuid(),
  is_board_member: z.boolean(),
})

// GET /api/board/members — board only
export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!(await isBoardMember(userId))) {
    return NextResponse.json({ error: 'Board members only' }, { status: 403 })
  }

  const { data, error } = await supabaseAdmin
    .from('shellers')
    .select('*')
    .order('name')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ shellers: data })
}

// PATCH /api/board/members — promote/demote board members
export async function PATCH(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!(await isBoardMember(userId))) {
    return NextResponse.json({ error: 'Board members only' }, { status: 403 })
  }

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { data, error } = await supabaseAdmin
    .from('shellers')
    .update({ is_board_member: parsed.data.is_board_member })
    .eq('id', parsed.data.sheller_id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ sheller: data })
}
