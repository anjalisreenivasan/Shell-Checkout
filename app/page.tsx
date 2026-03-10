import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase'
import LandingPage from '@/components/LandingPage'
import Dashboard from '@/components/Dashboard'
import type { Checkout } from '@/types'

async function getActiveCheckouts(): Promise<Checkout[]> {
  const { data } = await supabaseAdmin
    .from('checkouts')
    .select('*, sheller:sheller_id(id, name), item:items(id, name, description)')
    .in('status', ['approved', 'returned'])
    .order('checkout_at', { ascending: false })

  return data ?? []
}

export default async function HomePage() {
  const { userId } = await auth()

  if (!userId) {
    return <LandingPage />
  }

  const checkouts = await getActiveCheckouts()
  return <Dashboard checkouts={checkouts} />
}
