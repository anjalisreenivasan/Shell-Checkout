import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
      <div className="space-y-6 max-w-md">
        <div className="space-y-4">
          <img src="/startup-shell-logo-red.svg" alt="Startup Shell" className="h-14 mx-auto" />
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-shell-black">
            Shell <span className="text-shell-red">Checkout</span>
          </h1>
          <p className="text-shell-black/40 text-base">
            Reserve and manage Startup Shell resources
          </p>
        </div>

        <Link href="/sign-in">
          <Button
            size="lg"
            className="bg-shell-red hover:bg-shell-red-dark text-white px-8 text-base h-12 gap-2 shadow-sm"
          >
            Sign in to get started
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </div>
  )
}
