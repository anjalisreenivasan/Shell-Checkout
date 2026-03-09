import { SignInButton } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] text-center space-y-8">
      <div className="space-y-3">
        <h1 className="text-6xl font-bold tracking-tight text-gray-900">
          Shell <span className="text-orange-600">Checkout</span>
        </h1>
        <p className="text-gray-400 text-lg">
          Startup Shell resource management
        </p>
      </div>

      <SignInButton mode="modal">
        <Button
          size="lg"
          className="bg-orange-600 hover:bg-orange-700 text-white px-10 text-base h-11"
        >
          Sign in with your Startup Shell email
        </Button>
      </SignInButton>
    </div>
  )
}
