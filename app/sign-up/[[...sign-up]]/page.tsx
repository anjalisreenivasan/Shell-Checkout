'use client'

import Link from 'next/link'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'

export default function SignUpPage() {
  const handleGoogleSignUp = () => {
    authClient.signIn.social({ provider: 'google', callbackURL: '/' })
  }

  return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="w-full max-w-sm space-y-6">
        <h2 className="text-2xl font-bold text-center">Create an account</h2>

        <Button type="button" variant="outline" className="w-full" onClick={handleGoogleSignUp}>
          Sign up with Google
        </Button>

        <p className="text-center text-sm text-shell-black/60">
          Already have an account?{' '}
          <Link href="/sign-in" className="text-shell-red font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
