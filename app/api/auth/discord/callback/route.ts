import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

const CLIENT_ID = process.env.DISCORD_CLIENT_ID
const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const userId = searchParams.get('state')

  if (!code || !userId) {
    return NextResponse.redirect(new URL('/?discord=error', req.url))
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const redirectUri = `${baseUrl.replace(/^http:\/\/(?!localhost)/, 'https://')}/api/auth/discord/callback`

  const tokenRes = await fetch('https://discord.com/api/v10/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: CLIENT_ID ?? '',
      client_secret: CLIENT_SECRET ?? '',
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
    }),
  })

  if (!tokenRes.ok) {
    console.error('Discord token exchange failed:', await tokenRes.text())
    return NextResponse.redirect(new URL('/?discord=error', req.url))
  }

  const tokenData = await tokenRes.json()

  const userRes = await fetch('https://discord.com/api/v10/users/@me', {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  })

  if (!userRes.ok) {
    console.error('Discord user fetch failed:', await userRes.text())
    return NextResponse.redirect(new URL('/?discord=error', req.url))
  }

  const discordUser = await userRes.json()

  const { error } = await supabaseAdmin
    .from('shellers')
    .update({
      discord_handle: discordUser.username,
      discord_user_id: discordUser.id,
    })
    .eq('auth_user_id', userId)

  if (error) {
    console.error('Failed to save Discord info:', error)
    return NextResponse.redirect(new URL('/?discord=error', req.url))
  }

  return NextResponse.redirect(new URL('/?discord=linked', req.url))
}
