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

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Request Checkout</h1>
        <p className="text-gray-500 mt-1">
          Submitting a request for <span className="font-medium text-gray-700">{item.name}</span>
        </p>
      </div>
      <CheckoutForm item={item} />
    </div>
  )
}
