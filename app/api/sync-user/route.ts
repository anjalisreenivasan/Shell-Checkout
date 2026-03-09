import { auth, currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { upsertSheller } from '@/lib/sheller'

// Called after sign-in to sync Clerk user into shellers table
export async function POST() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await currentUser()
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const email = user.emailAddresses[0]?.emailAddress ?? ''
  const name = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || email

  const sheller = await upsertSheller(userId, email, name)
  if (!sheller) return NextResponse.json({ error: 'Failed to sync user' }, { status: 500 })

  return NextResponse.json({ sheller })
}
