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
    <form onSubmit={handleSearch} className="relative w-full max-w-lg">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-shell-black/30" />
      <Input
        placeholder="Search for an item..."
        value={query}
        onChange={e => setQuery(e.target.value)}
        className="pl-10 h-11 bg-white border-shell-black/10 shadow-sm focus:border-shell-red/40 focus:ring-shell-red/20"
      />
    </form>
  )
}
