import { getSession } from './auth'
import { ensureShellerForAuthUser } from './sheller-sync'
import { supabaseAdmin } from './supabase'
import type { Sheller } from '@/types'

export { ensureShellerForAuthUser as upsertSheller }

// Get a sheller by their auth user ID
export async function getSheller(userId: string): Promise<Sheller | null> {
  const { data, error } = await supabaseAdmin
    .from('shellers')
    .select('*')
    .eq('auth_user_id', userId)
    .single()

  if (error) return null
  return data
}

export async function getCurrentSheller(): Promise<Sheller | null> {
  const session = await getSession()
  if (!session?.user) return null

  const { id, email, name } = session.user
  const existing = await getSheller(id)
  if (existing) return existing

  if (!email) return null
  return ensureShellerForAuthUser(id, email, name ?? email)
}

// Check if a sheller is a board member
export async function isBoardMember(userId: string): Promise<boolean> {
  const sheller = await getSheller(userId)
  return sheller?.is_board_member ?? false
}
