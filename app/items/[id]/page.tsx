import { supabaseAdmin } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import ItemCalendar from '@/components/ItemCalendar'
import { formatDate, formatTime } from '@/lib/timezone'
import { ArrowLeft, Calendar, User } from 'lucide-react'
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
    <div className="space-y-8 max-w-3xl">
      <Link href="/items" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to items
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{item.name}</h1>
            <Badge
              variant="outline"
              className={`text-xs ${
                item.is_available
                  ? 'bg-green-50 text-green-700 border-green-200'
                  : 'bg-red-50 text-red-600 border-red-200'
              }`}
            >
              {item.is_available ? 'Available' : 'Unavailable'}
            </Badge>
          </div>
          <p className="text-sm text-gray-400">{item.description ?? 'No description.'}</p>
          <p className="text-xs text-gray-400">Quantity: {item.quantity}</p>
        </div>
        <Link
          href={`/checkout/${item.id}`}
          className="inline-flex items-center justify-center rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium px-5 h-9 transition-colors shrink-0 shadow-sm"
        >
          Request Checkout
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Availability</h2>
        <ItemCalendar checkouts={checkouts} />
      </div>

      {checkouts.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-700">Active Checkouts</h2>
          <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white overflow-hidden">
            {checkouts.map(c => (
              <div key={c.id} className="flex items-center justify-between px-4 py-3 text-sm">
                <span className="flex items-center gap-2 text-gray-700">
                  <User className="w-3.5 h-3.5 text-gray-400" />
                  {(c.sheller as { name: string })?.name}
                </span>
                <span className="flex items-center gap-2 text-gray-400">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDate(c.return_date)} at {formatTime(c.return_time)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
