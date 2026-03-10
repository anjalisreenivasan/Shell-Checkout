import { supabaseAdmin } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import ItemCalendar from '@/components/ItemCalendar'
import type { Item, Checkout } from '@/types'

async function getItem(id: string): Promise<Item | null> {
  const { data } = await supabaseAdmin
    .from('items')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single()
  return data
}

async function getItemCheckouts(itemId: string): Promise<Checkout[]> {
  const { data } = await supabaseAdmin
    .from('checkouts')
    .select('*, sheller:sheller_id(id, name)')
    .eq('item_id', itemId)
    .in('status', ['approved', 'returned'])
    .order('checkout_at', { ascending: true })
  return data ?? []
}

export default async function ItemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [item, checkouts] = await Promise.all([getItem(id), getItemCheckouts(id)])

  if (!item) notFound()

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Item details */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900">{item.name}</h1>
            <Badge
              variant="outline"
              className={
                item.is_available
                  ? 'bg-green-100 text-green-800 border-green-200'
                  : 'bg-red-100 text-red-800 border-red-200'
              }
            >
              {item.is_available ? 'Available' : 'Unavailable'}
            </Badge>
          </div>
          <p className="text-gray-500">{item.description ?? 'No description provided.'}</p>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Quantity:</span> {item.quantity}
          </p>
        </div>
        <Link
          href={`/checkout/${item.id}`}
          className="inline-flex items-center justify-center rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium px-4 h-8 transition-colors shrink-0"
        >
          Request Checkout
        </Link>
      </div>

      {/* Calendar */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Availability Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <ItemCalendar checkouts={checkouts} />
        </CardContent>
      </Card>

      {/* Current checkouts list */}
      {checkouts.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-800">Active Checkouts</h2>
          {checkouts.map(c => (
            <div key={c.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg text-sm">
              <span className="text-gray-700 font-medium">
                {(c.sheller as { name: string })?.name}
              </span>
              <span className="text-gray-500">
                Due {c.return_date} at {c.return_time.slice(0, 5)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
