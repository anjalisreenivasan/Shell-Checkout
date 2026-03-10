'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  { href: '/board', label: 'Requests' },
  { href: '/board/items', label: 'Items' },
  { href: '/board/blockouts', label: 'Blockouts' },
  { href: '/board/history', label: 'History' },
  { href: '/board/members', label: 'Members' },
]

export default function BoardNav() {
  const pathname = usePathname()

  return (
    <nav className="flex gap-1 mt-4 bg-gray-100 rounded-lg p-1 w-fit">
      {tabs.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className={`text-sm font-medium px-3 py-1.5 rounded-md transition-colors ${
            pathname === href
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {label}
        </Link>
      ))}
    </nav>
  )
}
