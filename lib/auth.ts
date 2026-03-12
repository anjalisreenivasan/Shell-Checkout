import { headers } from 'next/headers'
import { betterAuth } from 'better-auth'
import { nextCookies } from 'better-auth/next-js'
import { Pool } from 'pg'

export const auth = betterAuth({
  database: new Pool({
    connectionString: process.env.DATABASE_URL,
  }),
  emailAndPassword: { enabled: true },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    },
  },
  plugins: [nextCookies()],
})

/** Get the current user ID from the session (for server components/API routes). */
export async function getSession() {
  return auth.api.getSession({ headers: await headers() })
}

export async function getAuthUserId(): Promise<string | null> {
  const session = await getSession()
  return session?.user?.id ?? null
}
