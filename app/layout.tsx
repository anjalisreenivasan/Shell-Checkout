import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { Toaster } from '@/components/ui/sonner'
import Navbar from '@/components/Navbar'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Shell Checkout',
  description: 'Startup Shell resource checkout system',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${inter.className} min-h-screen bg-gray-50/50`}>
          <Navbar />
          <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            {children}
          </main>
          <Toaster position="top-right" richColors />
        </body>
      </html>
    </ClerkProvider>
  )
}
