'use client'

import { useState } from 'react'
import Link from 'next/link'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error: err } = await authClient.signUp.email({
      body: { email, password, name: name || undefined },
    })
    setLoading(false)
    if (err) setError(err.message ?? 'Sign up failed')
    else setSuccess(true)
  }

  const handleGoogleSignUp = () => {
    authClient.signIn.social({ provider: 'google', callbackURL: '/' })
  }

  if (success) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Check your email</h2>
          <p className="text-shell-black/60">
            We sent a verification link to {email}. Click it to finish signing up.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="w-full max-w-sm space-y-6">
        <h2 className="text-2xl font-bold text-center">Create an account</h2>

        <Button type="button" variant="outline" className="w-full" onClick={handleGoogleSignUp}>
          Sign up with Google
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-shell-black/10" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-shell-cream px-2 text-shell-black/50">Or continue with email</span>
          </div>
        </div>

        <form onSubmit={handleSignUp} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="mt-1"
            />
          </div>
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
              minLength={8}
              className="mt-1"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" className="w-full bg-shell-red hover:bg-shell-red-dark" disabled={loading}>
            {loading ? 'Creating account...' : 'Sign up'}
          </Button>
        </form>

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
