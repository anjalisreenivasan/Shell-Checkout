import { getAuthUserId } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { isBoardMember, getSheller } from '@/lib/sheller'
import { notifyApproved, notifyDenied } from '@/lib/discord'
import { z } from 'zod'

const boardUpdateSchema = z.object({
  status: z.enum(['approved', 'denied', 'return_confirmed']).optional(),
  return_date: z.string().optional(),
  return_time: z.string().optional(),
})

// PATCH /api/checkouts/[id] — only board members can update status
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

  // When board confirms return (approved → return_confirmed), insert return record first
  if (parsed.data.status === 'return_confirmed') {
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from('checkouts')
      .select('sheller_id, status, item_id')
      .eq('id', id)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json({ error: fetchError?.message ?? 'Checkout not found' }, { status: fetchError ? 500 : 404 })
    }
    if (existing.status !== 'approved' && existing.status !== 'returned') {
      return NextResponse.json({ error: 'Can only confirm return for approved checkouts' }, { status: 400 })
    }

    // Only insert return record when moving from approved (skip if already had one from 'returned')
    if (existing.status === 'approved') {
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
