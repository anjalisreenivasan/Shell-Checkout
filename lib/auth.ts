import { headers } from 'next/headers'
import { betterAuth } from 'better-auth'
import { nextCookies } from 'better-auth/next-js'
import { Pool } from 'pg'
import { ensureShellerForAuthUser } from './sheller-sync'

type AuthUser = {
  id?: string
  email?: string
  name?: string
}

async function syncShellerFromAuthUser(user: AuthUser | null) {
  if (!user?.id || !user.email) return

  const sheller = await ensureShellerForAuthUser(user.id, user.email, user.name ?? user.email)
  if (!sheller) {
    console.error('Failed to sync sheller for auth user:', user.id)
  }
}

export const auth = betterAuth({
  database: new Pool({
    connectionString: process.env.DATABASE_URL,
  }),
  databaseHooks: {
    user: {
      create: {
        after: syncShellerFromAuthUser,
      },
      update: {
        after: syncShellerFromAuthUser,
      },
    },
  },
  emailAndPassword: { enabled: false },
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
