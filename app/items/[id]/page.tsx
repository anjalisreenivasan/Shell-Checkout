import { supabaseAdmin } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import ItemCalendar from '@/components/ItemCalendar'
import { formatDate, formatTime } from '@/lib/timezone'
import { ArrowLeft, Calendar, User, ExternalLink } from 'lucide-react'
import type { Item, Checkout, Blockout } from '@/types'

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

async function getItemBlockouts(itemId: string): Promise<Blockout[]> {
  const { data } = await supabaseAdmin
    .from('blockouts')
    .select('*')
    .eq('item_id', itemId)
    .order('start_at', { ascending: true })
  return data ?? []
}

export default async function ItemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [item, checkouts, blockouts] = await Promise.all([getItem(id), getItemCheckouts(id), getItemBlockouts(id)])

  if (!item) notFound()

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <Link href="/items" className="inline-flex items-center gap-1.5 text-sm text-shell-black/40 hover:text-shell-black/70 transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to items
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-shell-black">{item.name}</h1>
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
          <p className="text-sm text-shell-black/40">{item.description ?? 'No description.'}</p>
          <p className="text-xs text-shell-black/30">Quantity: {item.quantity}</p>
        </div>
        <div className="flex flex-col gap-2 shrink-0">
          {item.name === 'Digital Resources' && process.env.NEXT_PUBLIC_KNOWLEDGE_BASE_URL ? (
            <a
              href={process.env.NEXT_PUBLIC_KNOWLEDGE_BASE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-shell-red hover:bg-shell-red-dark text-white text-sm font-medium px-5 h-9 transition-colors shadow-sm"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Open Knowledge Base
            </a>
          ) : (
            <Link
              href={`/checkout/${item.id}`}
              className="inline-flex items-center justify-center rounded-lg bg-shell-red hover:bg-shell-red-dark text-white text-sm font-medium px-5 h-9 transition-colors shadow-sm"
            >
              Request Checkout
            </Link>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-shell-black/10 p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-shell-black/70 mb-4">Availability</h2>
        <ItemCalendar checkouts={checkouts} blockouts={blockouts} />
      </div>

      {checkouts.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-shell-black/70">Active Checkouts</h2>
          <div className="divide-y divide-shell-black/5 rounded-xl border border-shell-black/10 bg-white overflow-hidden">
            {checkouts.map(c => (
              <div key={c.id} className="flex items-center justify-between px-4 py-3 text-sm">
                <span className="flex items-center gap-2 text-shell-black/70">
                  <User className="w-3.5 h-3.5 text-shell-black/30" />
                  {(c.sheller as { name: string })?.name}
                </span>
                <span className="flex items-center gap-2 text-shell-black/40">
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
