'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Search, Package } from 'lucide-react'
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
      <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
        <Input
          placeholder="Search items..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white">
          <Search className="w-4 h-4" />
        </Button>
      </form>

      {items.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Package className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="text-lg">No items found.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map(item => (
            <Card key={item.id} className="border border-gray-200 hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base text-gray-900">{item.name}</CardTitle>
                  <Badge
                    className={
                      item.is_available
                        ? 'bg-green-100 text-green-800 border-green-200'
                        : 'bg-red-100 text-red-800 border-red-200'
                    }
                    variant="outline"
                  >
                    {item.is_available ? 'Available' : 'Unavailable'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="text-sm text-gray-500">
                <p>{item.description ?? 'No description provided.'}</p>
                <p className="mt-2 text-gray-700 font-medium">Qty: {item.quantity}</p>
              </CardContent>
              <CardFooter>
                <Link
                  href={`/items/${item.id}`}
                  className="inline-flex items-center justify-center w-full rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-[0.8rem] font-medium px-2.5 h-7 transition-colors"
                >
                  View &amp; Request
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
