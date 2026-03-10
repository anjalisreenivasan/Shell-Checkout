'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

export default function HomeSearch() {
  const router = useRouter()
  const [query, setQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/items?q=${encodeURIComponent(query.trim())}`)
    } else {
      router.push('/items')
    }
  }

  return (
    <form onSubmit={handleSearch} className="relative max-w-lg">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      <Input
        placeholder="Search for an item..."
        value={query}
        onChange={e => setQuery(e.target.value)}
        className="pl-10 h-11 bg-white border-gray-200 shadow-sm focus:border-orange-300 focus:ring-orange-200"
      />
    </form>
  )
}
