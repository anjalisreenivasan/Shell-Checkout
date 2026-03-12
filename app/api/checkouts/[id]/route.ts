import { getAuthUserId } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { isBoardMember, getSheller } from '@/lib/sheller'
import { notifyApproved, notifyDenied } from '@/lib/discord'
import { z } from 'zod'

const boardUpdateSchema = z.object({
  status: z.enum(['approved', 'denied', 'returned', 'return_confirmed']).optional(),
  return_date: z.string().optional(),
  return_time: z.string().optional(),
})

// PATCH /api/checkouts/[id] — only board members can update status (including mark as returned)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const userId = await getAuthUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const board = await isBoardMember(userId)
  const sheller = await getSheller(userId)
  if (!sheller) return NextResponse.json({ error: 'Sheller not found' }, { status: 404 })

  const body = await req.json()

  if (!board) {
    return NextResponse.json({ error: 'Only board members can update checkouts' }, { status: 403 })
  }

  const parsed = boardUpdateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const updateData: Record<string, unknown> = { ...parsed.data }
  if (parsed.data.status === 'approved' || parsed.data.status === 'denied') {
    updateData.approved_by = sheller.id
  }

  // When board marks as returned, insert return record first
  if (parsed.data.status === 'returned') {
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from('checkouts')
      .select('sheller_id, status, item_id')
      .eq('id', id)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json({ error: fetchError?.message ?? 'Checkout not found' }, { status: fetchError ? 500 : 404 })
    }
    if (existing.status !== 'approved') {
      return NextResponse.json({ error: 'Can only mark approved checkouts as returned' }, { status: 400 })
    }

    const { error: insertReturnError } = await supabaseAdmin.from('returns').insert({
      request_id: id,
      sheller_id: existing.sheller_id,
      item_id: existing.item_id,
      returned_at: new Date().toISOString(),
    })
    if (insertReturnError) {
      return NextResponse.json({ error: insertReturnError.message }, { status: 500 })
    }
  }

  const { data, error } = await supabaseAdmin
    .from('checkouts')
    .update(updateData)
    .eq('id', id)
    .select('*, sheller:sheller_id(id, name, email), item:items(id, name, description)')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (parsed.data.status === 'approved' || parsed.data.status === 'denied') {
    const shellerRecord = await supabaseAdmin
      .from('shellers')
      .select('discord_user_id')
      .eq('id', data.sheller?.id)
      .single()
    const discordUserId = shellerRecord?.data?.discord_user_id ?? null
    const itemName = data.item?.name ?? 'Unknown item'

    if (parsed.data.status === 'approved') {
      notifyApproved(discordUserId, itemName).catch(err =>
        console.error('Discord approve notification failed:', err)
      )
    } else {
      notifyDenied(discordUserId, itemName).catch(err =>
        console.error('Discord deny notification failed:', err)
      )
    }
  }

  return NextResponse.json({ checkout: data })
}
