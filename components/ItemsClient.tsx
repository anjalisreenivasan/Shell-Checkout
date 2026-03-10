'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, Package, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import type { Item } from '@/types'

interface Props {
  items: Item[]
  initialQuery: string
}

export default function ItemsClient({ items, initialQuery }: Props) {
  const router = useRouter()
  const [query, setQuery] = useState(initialQuery)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (query.trim()) params.set('q', query.trim())
    router.push(`/items?${params.toString()}`)
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSearch} className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search items..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="pl-10 h-10 bg-white border-gray-200 shadow-sm"
        />
      </form>

      {items.length === 0 ? (
        <div className="text-center py-24 text-gray-300">
          <Package className="w-10 h-10 mx-auto mb-3" />
          <p className="text-sm">No items found.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map(item => (
            <Link
              key={item.id}
              href={`/items/${item.id}`}
              className="group block bg-white rounded-xl border border-gray-200 p-4 hover:border-orange-200 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="font-medium text-gray-900 group-hover:text-orange-600 transition-colors">
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
              <p className="text-sm text-gray-400 line-clamp-2 mb-3">
                {item.description ?? 'No description.'}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Qty: {item.quantity}</span>
                <span className="text-xs text-orange-600 font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.name === 'Digital Resources' ? 'Details' : 'View'} <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
