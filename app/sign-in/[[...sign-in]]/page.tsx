'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function SignInPage() {
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect_url') ?? '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error: err } = await authClient.signIn.email({
      body: { email, password, callbackURL: redirect },
    })
    setLoading(false)
    if (err) setError(err.message ?? 'Sign in failed')
  }

  const handleGoogleSignIn = () => {
    authClient.signIn.social({
      provider: 'google',
      callbackURL: redirect,
    })
  }

  return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="w-full max-w-sm space-y-6">
        <h2 className="text-2xl font-bold text-center">Sign in</h2>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleGoogleSignIn}
        >
          Sign in with Google
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-shell-black/10" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-shell-cream px-2 text-shell-black/50">Or continue with email</span>
          </div>
        </div>

        <form onSubmit={handleEmailSignIn} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="mt-1"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" className="w-full bg-shell-red hover:bg-shell-red-dark" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>

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
