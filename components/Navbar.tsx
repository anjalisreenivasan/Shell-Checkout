'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useUser, UserButton, SignInButton } from '@clerk/nextjs'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

export default function Navbar() {
  const { isSignedIn, user } = useUser()
  const pathname = usePathname()
  const [isBoard, setIsBoard] = useState(false)

  useEffect(() => {
    if (!isSignedIn) return
    // Sync user and check board status
    fetch('/api/sync-user', { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        if (data.sheller?.is_board_member) setIsBoard(true)
      })
  }, [isSignedIn])

  const navLink = (href: string, label: string) => (
    <Link
      key={href}
      href={href}
      className={`text-sm font-medium transition-colors hover:text-orange-600 ${
        pathname === href ? 'text-orange-600' : 'text-gray-600'
      }`}
    >
      {label}
    </Link>
  )

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-orange-600">Shell</span>
            <span className="text-xl font-semibold text-gray-800">Checkout</span>
          </Link>

          {/* Nav links */}
          <div className="hidden sm:flex items-center gap-6">
            {navLink('/', 'Home')}
            {navLink('/items', 'Items')}
            {isSignedIn && navLink('/my-requests', 'My Requests')}
            {isBoard && navLink('/board', 'Board')}
          </div>

          {/* Auth */}
          <div className="flex items-center gap-3">
            {isSignedIn ? (
              <UserButton />
            ) : (
              <SignInButton mode="modal">
                <Button size="sm" className="bg-orange-600 hover:bg-orange-700 text-white">
                  Sign In
                </Button>
              </SignInButton>
            )}
          </div>
        </div>

        {/* Mobile nav */}
        <div className="sm:hidden flex gap-4 pb-3">
          {navLink('/', 'Home')}
          {navLink('/items', 'Items')}
          {isSignedIn && navLink('/my-requests', 'My Requests')}
          {isBoard && navLink('/board', 'Board')}
        </div>
      </div>
    </nav>
  )
}
