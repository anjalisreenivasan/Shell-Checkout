import { supabaseAdmin } from './supabase'
import type { Sheller } from '@/types'

// Find sheller by email (e.g. existing board member row added before first sign-in)
async function getShellerByEmail(email: string): Promise<Sheller | null> {
  if (!email) return null
  const { data, error } = await supabaseAdmin
    .from('shellers')
    .select('*')
    .eq('email', email)
    .maybeSingle()
  if (error) return null
  return data
}

// Upsert a sheller record from auth user data (called on sign-in).
// If a row already exists for this email (e.g. board member added manually), we link it to this user.
export async function upsertSheller(userId: string, email: string, name: string): Promise<Sheller | null> {
  const existingByEmail = await getShellerByEmail(email)
  if (existingByEmail) {
    const { data, error } = await supabaseAdmin
      .from('shellers')
      .update({ auth_user_id: userId, name })
      .eq('id', existingByEmail.id)
      .select()
      .single()
    if (error) {
      console.error('Error updating sheller:', error)
      return null
    }
    return data
  }
  const { data, error } = await supabaseAdmin
    .from('shellers')
    .upsert(
      { auth_user_id: userId, email, name },
      { onConflict: 'auth_user_id', ignoreDuplicates: false }
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
    .eq('auth_user_id', userId)
    .single()

  if (error) return null
  return data
}

// Check if a sheller is a board member
export async function isBoardMember(userId: string): Promise<boolean> {
  const sheller = await getSheller(userId)
  return sheller?.is_board_member ?? false
}
