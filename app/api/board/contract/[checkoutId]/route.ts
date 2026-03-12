import { getAuthUserId } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { isBoardMember } from '@/lib/sheller'

// GET /api/board/contract/[checkoutId] — board only, returns a signed URL to view the contract
export async function GET(_req: NextRequest, { params }: { params: Promise<{ checkoutId: string }> }) {
  const { checkoutId } = await params
  const userId = await getAuthUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!(await isBoardMember(userId))) {
    return NextResponse.json({ error: 'Board members only' }, { status: 403 })
  }

  const { data: checkout, error } = await supabaseAdmin
    .from('checkouts')
    .select('contract_url')
    .eq('id', checkoutId)
    .single()

  if (error || !checkout?.contract_url) {
    return NextResponse.json({ error: 'Contract not found' }, { status: 404 })
  }

  const { data: signedUrl, error: urlError } = await supabaseAdmin.storage
    .from('contracts')
    .createSignedUrl(checkout.contract_url, 60 * 60)

  if (urlError || !signedUrl) {
    return NextResponse.json({ error: 'Could not generate contract URL' }, { status: 500 })
  }

  return NextResponse.json({ url: signedUrl.signedUrl })
}
