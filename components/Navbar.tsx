'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import { Suspense, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Menu, LogOut } from 'lucide-react'
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
  const { data: session } = authClient.useSession()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isBoard, setIsBoard] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [showDiscordPrompt, setShowDiscordPrompt] = useState(false)
  const isSignedIn = !!session

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
        pathname === href ? 'text-shell-red' : 'text-shell-black/50'
      }`}
    >
      {label}
    </Link>
  )

  return (
    <nav className="bg-shell-cream/80 backdrop-blur-md border-b border-shell-black/5 sticky top-0 z-50">
      <div className="flex max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2.5">
          <img src="/startup-shell-logo-red.svg" alt="Startup Shell" className="h-7" />
          <span className="text-xl font-bold text-shell-red">Shell</span>
          <span className="text-xl font-semibold text-shell-black">Checkout</span>
        </Link>

        <div className="hidden sm:flex items-center gap-8">
          {links.map(l => navLink(l.href, l.label))}
        </div>

        <div className="flex items-center gap-3">
          {isSignedIn ? (
            <div className="flex items-center gap-3">
              <Avatar size="sm" className="size-7">
                <AvatarImage src={session.user?.image ?? undefined} alt="" />
                <AvatarFallback className="bg-shell-red/20 text-shell-red text-xs">
                  {(session.user?.name ?? session.user?.email ?? '?').slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-shell-black/70 truncate max-w-32">
                {session.user?.email ?? session.user?.name}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={async () => {
                  await authClient.signOut()
                  window.location.href = '/sign-in'
                }}
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <Link href="/sign-in">
              <Button size="sm" className="bg-shell-red hover:bg-shell-red-dark text-white shadow-sm">
                Sign In
              </Button>
            </Link>
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
        <div className="sm:hidden flex flex-col gap-3 pb-4 pt-1 border-t border-shell-black/5 mt-1 px-4">
          {links.map(l => navLink(l.href, l.label))}
        </div>
      )}

      <DiscordPrompt open={showDiscordPrompt} onComplete={() => setShowDiscordPrompt(false)} />
    </nav>
  )
}
