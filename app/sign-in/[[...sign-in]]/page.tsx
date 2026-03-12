'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'

export default function SignInPage() {
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect_url') ?? '/'

  const handleGoogleSignIn = () => {
    authClient.signIn.social({
      provider: 'google',
      callbackURL: redirect,
    })
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
      <div className="w-full max-w-md space-y-10 text-center">
        <div className="flex justify-center">
          <img src="/startup-shell-logo-red.svg" alt="Startup Shell" className="h-20 w-20" />
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl sm:text-5xl font-bold text-shell-black tracking-tight">
            Shell Checkout
          </h1>
          <p className="text-lg text-shell-black/70">
            Sign in with startupshell.org email to request a resource.
          </p>
        </div>
        <div className="space-y-4 pt-4">
          <Button
            type="button"
            size="lg"
            className="w-full h-12 text-base bg-shell-red hover:bg-shell-red-dark text-white shadow-md"
            onClick={handleGoogleSignIn}
          >
            Sign in with Google
          </Button>
          <Link href="/sign-up" className="block">
            <Button type="button" variant="outline" size="lg" className="w-full h-12 text-base">
              Sign up
            </Button>
          </Link>
        </div>
        <p className="text-sm text-shell-black/50">
          Don&apos;t have an account? Use Sign up above.
        </p>
      </div>
    </div>
  )
}
