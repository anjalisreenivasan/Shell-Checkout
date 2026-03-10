'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { useUser, UserButton, SignInButton } from '@clerk/nextjs'
import { Suspense, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Menu } from 'lucide-react'
import { toast } from 'sonner'
import DiscordPrompt from '@/components/DiscordPrompt'

export default function Navbar() {
  return (
    <Suspense>
      <NavbarInner />
    </Suspense>
  )
}

function NavbarInner() {
  const { isSignedIn } = useUser()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isBoard, setIsBoard] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [showDiscordPrompt, setShowDiscordPrompt] = useState(false)

  useEffect(() => {
    const discordStatus = searchParams.get('discord')
    if (discordStatus === 'linked') {
      toast.success('Discord account linked!')
      window.history.replaceState({}, '', pathname)
    } else if (discordStatus === 'error') {
      toast.error('Failed to link Discord. Try again.')
      window.history.replaceState({}, '', pathname)
    }
  }, [searchParams, pathname])

  useEffect(() => {
    if (!isSignedIn) return
    fetch('/api/sync-user', { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        if (data.sheller?.is_board_member) setIsBoard(true)
        if (data.sheller && !data.sheller.discord_user_id) setShowDiscordPrompt(true)
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
      className={`text-sm font-medium transition-colors hover:text-shell-red ${
        pathname === href
          ? 'text-shell-red'
          : 'text-shell-black/50'
      }`}
    >
      {label}
    </Link>
  )

  return (
    <nav className="bg-shell-cream/80 backdrop-blur-md border-b border-shell-black/5 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-1.5">
            <span className="text-lg font-bold text-shell-red">Shell</span>
            <span className="text-lg font-semibold text-shell-black">Checkout</span>
          </Link>

          <div className="hidden sm:flex items-center gap-8">
            {links.map(l => navLink(l.href, l.label))}
          </div>

          <div className="flex items-center gap-3">
            {isSignedIn ? (
              <UserButton />
            ) : (
              <SignInButton mode="modal">
                <Button size="sm" className="bg-shell-red hover:bg-shell-red-dark text-white shadow-sm">
                  Sign In
                </Button>
              </SignInButton>
            )}
            <button
              className="sm:hidden p-1.5 text-shell-black/50 hover:text-shell-black"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="sm:hidden flex flex-col gap-3 pb-4 pt-1 border-t border-shell-black/5 mt-1">
            {links.map(l => navLink(l.href, l.label))}
          </div>
        )}
      </div>

      <DiscordPrompt open={showDiscordPrompt} onComplete={() => setShowDiscordPrompt(false)} />
    </nav>
  )
}
