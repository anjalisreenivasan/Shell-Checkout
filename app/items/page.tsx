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
    builder = builder.ilike('name', `%${query}%`)
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Browse Items</h1>
        <p className="text-gray-500 mt-1">
          Find a resource and submit a checkout request.
        </p>
      </div>
      <ItemsClient items={items} initialQuery={q ?? ''} />
    </div>
  )
}
