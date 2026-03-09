import { supabaseAdmin } from './supabase'
import type { Sheller } from '@/types'

// Upsert a sheller record from Clerk user data (called on sign-in)
export async function upsertSheller(clerkUserId: string, email: string, name: string): Promise<Sheller | null> {
  const { data, error } = await supabaseAdmin
    .from('shellers')
    .upsert(
      { clerk_user_id: clerkUserId, email, name },
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

// Get a sheller by their Clerk user ID
export async function getSheller(clerkUserId: string): Promise<Sheller | null> {
  const { data, error } = await supabaseAdmin
    .from('shellers')
    .select('*')
    .eq('clerk_user_id', clerkUserId)
    .single()

  if (error) return null
  return data
}

// Check if a sheller is a board member
export async function isBoardMember(clerkUserId: string): Promise<boolean> {
  const sheller = await getSheller(clerkUserId)
  return sheller?.is_board_member ?? false
}
