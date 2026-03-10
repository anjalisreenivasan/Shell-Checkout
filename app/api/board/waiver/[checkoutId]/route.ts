import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { isBoardMember } from '@/lib/sheller'

// GET /api/board/waiver/[checkoutId] — board only, returns a signed URL to view the waiver
export async function GET(_req: NextRequest, { params }: { params: Promise<{ checkoutId: string }> }) {
  const { checkoutId } = await params
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!(await isBoardMember(userId))) {
    return NextResponse.json({ error: 'Board members only' }, { status: 403 })
  }

  const { data: checkout, error } = await supabaseAdmin
    .from('checkouts')
    .select('waiver_url')
    .eq('id', checkoutId)
    .single()

  if (error || !checkout?.waiver_url) {
    return NextResponse.json({ error: 'Waiver not found' }, { status: 404 })
  }

  const { data: signedUrl, error: urlError } = await supabaseAdmin.storage
    .from('waivers')
    .createSignedUrl(checkout.waiver_url, 60 * 60) // valid for 1 hour

  if (urlError || !signedUrl) {
    return NextResponse.json({ error: 'Could not generate waiver URL' }, { status: 500 })
  }

  return NextResponse.json({ url: signedUrl.signedUrl })
}
