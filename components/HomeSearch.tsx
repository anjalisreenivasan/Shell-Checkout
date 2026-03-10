'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import Link from 'next/link'
import type { Item } from '@/types'

export default function HomeSearch() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Item[]>([])
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (query.trim().length < 1) {
      setResults([])
      setOpen(false)
      return
    }

    const timeout = setTimeout(async () => {
      const res = await fetch(`/api/items?q=${encodeURIComponent(query.trim())}`)
      const data = await res.json()
      setResults(data.items ?? [])
      setOpen(true)
    }, 200)

    return () => clearTimeout(timeout)
  }, [query])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setOpen(false)
    if (query.trim()) {
      router.push(`/items?q=${encodeURIComponent(query.trim())}`)
    } else {
      router.push('/items')
    }
  }

  return (
    <div ref={wrapperRef} className="relative w-full max-w-lg">
      <form onSubmit={handleSubmit}>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-shell-black/30 z-10" />
        <Input
          placeholder="Search for an item..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          className="pl-10 h-11 bg-white border-shell-black/10 shadow-sm focus:border-shell-red/40 focus:ring-shell-red/20"
        />
      </form>

      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-shell-black/10 shadow-lg overflow-hidden z-50 max-h-72 overflow-y-auto">
          {results.map(item => (
            <Link
              key={item.id}
              href={`/items/${item.id}`}
              onClick={() => setOpen(false)}
              className="flex items-center justify-between px-4 py-3 hover:bg-shell-red/5 transition-colors border-b border-shell-black/5 last:border-0"
            >
              <div className="min-w-0">
                <span className="text-sm font-medium text-shell-black">{item.name}</span>
                {item.description && (
                  <p className="text-xs text-shell-black/40 truncate">{item.description}</p>
                )}
              </div>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full border shrink-0 ml-3 ${
                item.is_available
                  ? 'bg-green-50 text-green-700 border-green-200'
                  : 'bg-red-50 text-red-600 border-red-200'
              }`}>
                {item.is_available ? 'Available' : 'Unavailable'}
              </span>
            </Link>
          ))}
        </div>
      )}

      {open && query.trim().length > 0 && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-shell-black/10 shadow-lg z-50 px-4 py-6 text-center text-sm text-shell-black/30">
          No items found
        </div>
      )}
    </div>
  )
}
