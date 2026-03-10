import { supabaseAdmin } from '@/lib/supabase'
import { auth } from '@clerk/nextjs/server'
import { notFound, redirect } from 'next/navigation'
import CheckoutForm from '@/components/CheckoutForm'
import type { Item } from '@/types'

async function getItem(id: string): Promise<Item | null> {
  const { data } = await supabaseAdmin
    .from('items')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single()
  return data
}

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ itemId: string }>
}) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const { itemId } = await params
  const item = await getItem(itemId)
  if (!item) notFound()

  return <CheckoutForm item={item} />
}
