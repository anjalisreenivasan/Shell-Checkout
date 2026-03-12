import { getAuthUserId } from '@/lib/auth'
import { NextResponse } from 'next/server'

const CLIENT_ID = process.env.DISCORD_CLIENT_ID

export async function GET() {
  const userId = await getAuthUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (!CLIENT_ID) {
    return NextResponse.json({ error: 'Discord OAuth not configured' }, { status: 500 })
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const redirectUri = `${baseUrl.replace(/^http:\/\/(?!localhost)/, 'https://')}/api/auth/discord/callback`

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'identify',
    state: userId,
  })

  return NextResponse.redirect(`https://discord.com/oauth2/authorize?${params.toString()}`)
}
