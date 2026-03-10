import { SignInButton } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
      <div className="space-y-6 max-w-md">
        <div className="space-y-2">
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-gray-900">
            Shell <span className="text-orange-600">Checkout</span>
          </h1>
          <div className="h-1 w-12 bg-orange-600 rounded-full mx-auto" />
          <p className="text-gray-400 text-base pt-2">
            Reserve and manage Startup Shell resources
          </p>
        </div>

        <SignInButton mode="modal">
          <Button
            size="lg"
            className="bg-orange-600 hover:bg-orange-700 text-white px-8 text-base h-12 gap-2 shadow-sm"
          >
            Sign in to get started
            <ArrowRight className="w-4 h-4" />
          </Button>
        </SignInButton>
      </div>
    </div>
  )
}
