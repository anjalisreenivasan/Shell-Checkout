'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
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
    <form onSubmit={handleSearch} className="flex gap-2 max-w-lg">
      <Input
        placeholder="Search for an item to check out..."
        value={query}
        onChange={e => setQuery(e.target.value)}
        className="flex-1 h-11 text-base"
      />
      <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white h-11 px-5">
        <Search className="w-4 h-4 mr-1" />
        Search
      </Button>
    </form>
  )
}
