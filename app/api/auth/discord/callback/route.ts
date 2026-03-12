import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

const CLIENT_ID = process.env.DISCORD_CLIENT_ID
const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const { searchParams } = url
  const code = searchParams.get('code')
  const userId = searchParams.get('state')

  if (!code || !userId) {
    return NextResponse.redirect(new URL('/?discord=error', req.url))
  }

  // Use the actual callback URL so it matches exactly what Discord used in the auth request
  const redirectUri = `${url.origin}/api/auth/discord/callback`

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

  const { data, error } = await supabaseAdmin
    .from('shellers')
    .update({
      discord_handle: discordUser.username ?? null,
      discord_user_id: String(discordUser.id),
    })
    .eq('auth_user_id', userId)
    .select('id')
    .maybeSingle()

  if (error) {
    console.error('Failed to save Discord info:', error)
    return NextResponse.redirect(new URL('/?discord=error', req.url))
  }
  if (!data) {
    console.error('No sheller row found for auth_user_id:', userId)
    return NextResponse.redirect(new URL('/?discord=error', req.url))
  }

  return NextResponse.redirect(new URL('/?discord=linked', req.url))
}
