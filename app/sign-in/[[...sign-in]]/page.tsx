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
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="w-full max-w-sm space-y-6">
        <p className="text-center text-lg text-shell-black">
          Sign in with startupshell.org email to request a resource.
        </p>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleGoogleSignIn}
        >
          Sign in with Google
        </Button>

        <p className="text-center text-sm text-shell-black/60">
          Don&apos;t have an account?{' '}
          <Link href="/sign-up" className="text-shell-red font-medium hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
