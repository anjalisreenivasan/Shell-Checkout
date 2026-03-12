import { supabaseAdmin } from './supabase'
import type { Sheller } from '@/types'

// Upsert a sheller record from auth user data (called on sign-in)
export async function upsertSheller(userId: string, email: string, name: string): Promise<Sheller | null> {
  const { data, error } = await supabaseAdmin
    .from('shellers')
    .upsert(
      { clerk_user_id: userId, email, name },
      { onConflict: 'clerk_user_id', ignoreDuplicates: false }
    )
    .select()
    .single()

  if (error) {
    console.error('Error upserting sheller:', error)
    return null
  }
  return data
}

// Get a sheller by their auth user ID
export async function getSheller(userId: string): Promise<Sheller | null> {
  const { data, error } = await supabaseAdmin
    .from('shellers')
    .select('*')
    .eq('clerk_user_id', userId)
    .single()

  if (error) return null
  return data
}

// Check if a sheller is a board member
export async function isBoardMember(userId: string): Promise<boolean> {
  const sheller = await getSheller(userId)
  return sheller?.is_board_member ?? false
}
