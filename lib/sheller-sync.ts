import { supabaseAdmin } from './supabase'
import type { Sheller } from '@/types'

async function getShellerByEmail(email: string): Promise<Sheller | null> {
  if (!email) return null
  const { data, error } = await supabaseAdmin
    .from('shellers')
    .select('*')
    .ilike('email', email.toLowerCase())
    .maybeSingle()

  if (error) {
    console.error('Error finding sheller by email:', error)
    return null
  }
  return data
}

export async function ensureShellerForAuthUser(
  userId: string,
  email: string,
  name: string,
): Promise<Sheller | null> {
  if (!userId || !email) return null

  const normalizedEmail = email.toLowerCase()
  const displayName = name || normalizedEmail

  const { data: existingByAuthId, error: authIdError } = await supabaseAdmin
    .from('shellers')
    .select('*')
    .eq('auth_user_id', userId)
    .maybeSingle()

  if (authIdError) {
    console.error('Error finding sheller by auth user id:', authIdError)
    return null
  }

  if (existingByAuthId) {
    const { data, error } = await supabaseAdmin
      .from('shellers')
      .update({ email: normalizedEmail, name: displayName })
      .eq('id', existingByAuthId.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating sheller from auth user:', error)
      return null
    }
    return data
  }

  const existingByEmail = await getShellerByEmail(normalizedEmail)
  if (existingByEmail) {
    const { data, error } = await supabaseAdmin
      .from('shellers')
      .update({ auth_user_id: userId, email: normalizedEmail, name: displayName })
      .eq('id', existingByEmail.id)
      .select()
      .single()

    if (error) {
      console.error('Error linking sheller to auth user:', error)
      return null
    }
    return data
  }

  const { data, error } = await supabaseAdmin
    .from('shellers')
    .insert({ auth_user_id: userId, email: normalizedEmail, name: displayName })
    .select()
    .single()

  if (error) {
    console.error('Error creating sheller from auth user:', error)
    return null
  }
  return data
}
