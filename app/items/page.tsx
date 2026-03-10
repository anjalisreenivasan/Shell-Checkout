import { supabaseAdmin } from '@/lib/supabase'
import ItemsClient from '@/components/ItemsClient'
import type { Item } from '@/types'

async function getItems(query?: string): Promise<Item[]> {
  let builder = supabaseAdmin
    .from('items')
    .select('*')
    .is('deleted_at', null)
    .order('name')

  if (query) {
    builder = builder.or(`name.ilike.%${query}%,description.ilike.%${query}%`)
  }

  const { data } = await builder
  return data ?? []
}

export default async function ItemsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const items = await getItems(q)

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-shell-black">Items</h1>
        <p className="text-sm text-shell-black/40 mt-1">
          Browse resources and request a checkout.
        </p>
      </div>
      <ItemsClient items={items} initialQuery={q ?? ''} />
    </div>
  )
}
