import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { isBoardMember, getSheller } from '@/lib/sheller'

// POST /api/returns/[id]/confirm — board only
export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!(await isBoardMember(userId))) {
    return NextResponse.json({ error: 'Board members only' }, { status: 403 })
  }

  const sheller = await getSheller(userId)
  if (!sheller) return NextResponse.json({ error: 'Sheller not found' }, { status: 404 })

  const now = new Date().toISOString()

  // Update the return record
  const { data: returnData, error: returnError } = await supabaseAdmin
    .from('returns')
    .update({ confirmed_by: sheller.id, confirmed_at: now })
    .eq('id', id)
    .select()
    .single()

  if (returnError) return NextResponse.json({ error: returnError.message }, { status: 500 })

  // Update the checkout status to return_confirmed
  await supabaseAdmin
    .from('checkouts')
    .update({ status: 'return_confirmed' })
    .eq('id', returnData.request_id)

  return NextResponse.json({ success: true })
}
