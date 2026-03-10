'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, Package } from 'lucide-react'
import Link from 'next/link'
import type { Item } from '@/types'

interface Props {
  items: Item[]
  initialQuery: string
}

export default function ItemsClient({ items: initialItems, initialQuery }: Props) {
  const router = useRouter()
  const [query, setQuery] = useState(initialQuery)
  const [items, setItems] = useState<Item[]>(initialItems)

  useEffect(() => {
    const timeout = setTimeout(async () => {
      const url = query.trim()
        ? `/api/items?q=${encodeURIComponent(query.trim())}`
        : '/api/items'
      const res = await fetch(url)
      const data = await res.json()
      setItems(data.items ?? [])
    }, 200)

    return () => clearTimeout(timeout)
  }, [query])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (query.trim()) params.set('q', query.trim())
    router.push(`/items?${params.toString()}`)
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSearch} className="relative max-w-md mx-auto">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-shell-black/30" />
        <Input
          placeholder="Search items..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="pl-10 h-10 bg-white border-shell-black/10 shadow-sm"
        />
      </form>

      {items.length === 0 ? (
        <div className="text-center py-24 text-shell-black/20">
          <Package className="w-10 h-10 mx-auto mb-3" />
          <p className="text-sm">No items found.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map(item => (
            <Link
              key={item.id}
              href={`/items/${item.id}`}
              className="group block bg-white rounded-xl border border-shell-black/10 p-4 hover:border-shell-red/30 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="font-medium text-shell-black group-hover:text-shell-red transition-colors">
                  {item.name}
                </span>
                <Badge
                  variant="outline"
                  className={`text-[10px] shrink-0 ${
                    item.is_available
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : 'bg-red-50 text-red-600 border-red-200'
                  }`}
                >
                  {item.is_available ? 'Available' : 'Unavailable'}
                </Badge>
              </div>
              <p className="text-sm text-shell-black/40 line-clamp-2 mb-3">
                {item.description ?? 'No description.'}
              </p>
              <span className="text-xs text-shell-black/30">Qty: {item.quantity}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
