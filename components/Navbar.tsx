'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useUser, UserButton, SignInButton } from '@clerk/nextjs'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Menu } from 'lucide-react'

export default function Navbar() {
  const { isSignedIn } = useUser()
  const pathname = usePathname()
  const [isBoard, setIsBoard] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    if (!isSignedIn) return
    fetch('/api/sync-user', { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        if (data.sheller?.is_board_member) setIsBoard(true)
      })
  }, [isSignedIn])

  const links = [
    { href: '/', label: 'Home', show: true },
    { href: '/items', label: 'Items', show: true },
    { href: '/my-requests', label: 'My Requests', show: !!isSignedIn },
    { href: '/board', label: 'Board', show: isBoard },
  ].filter(l => l.show)

  const navLink = (href: string, label: string) => (
    <Link
      key={href}
      href={href}
      onClick={() => setMobileOpen(false)}
      className={`text-sm font-medium transition-colors hover:text-orange-600 ${
        pathname === href
          ? 'text-orange-600'
          : 'text-gray-500'
      }`}
    >
      {label}
    </Link>
  )

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-1.5">
            <span className="text-lg font-bold text-orange-600">Shell</span>
            <span className="text-lg font-semibold text-gray-800">Checkout</span>
          </Link>

          <div className="hidden sm:flex items-center gap-8">
            {links.map(l => navLink(l.href, l.label))}
          </div>

          <div className="flex items-center gap-3">
            {isSignedIn ? (
              <UserButton />
            ) : (
              <SignInButton mode="modal">
                <Button size="sm" className="bg-orange-600 hover:bg-orange-700 text-white shadow-sm">
                  Sign In
                </Button>
              </SignInButton>
            )}
            <button
              className="sm:hidden p-1.5 text-gray-500 hover:text-gray-700"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="sm:hidden flex flex-col gap-3 pb-4 pt-1 border-t border-gray-100 mt-1">
            {links.map(l => navLink(l.href, l.label))}
          </div>
        )}
      </div>
    </nav>
  )
}
