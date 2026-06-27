import { NextResponse } from 'next/server'
import { getCurrentSheller } from '@/lib/sheller'

const CLIENT_ID = process.env.DISCORD_CLIENT_ID

export async function GET() {
  const sheller = await getCurrentSheller()
  if (!sheller) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

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
    state: sheller.auth_user_id,
  })

  return NextResponse.redirect(`https://discord.com/oauth2/authorize?${params.toString()}`)
}
