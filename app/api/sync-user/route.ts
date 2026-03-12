import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { upsertSheller } from '@/lib/sheller'

// Called after sign-in to sync user into shellers table
export async function POST() {
  const session = await getSession()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, email, name } = session.user
  const sheller = await upsertSheller(id, email ?? '', name ?? email ?? '')

  if (!sheller) return NextResponse.json({ error: 'Failed to sync user' }, { status: 500 })

  return NextResponse.json({ sheller })
}
