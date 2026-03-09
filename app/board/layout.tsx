import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { isBoardMember } from '@/lib/sheller'
import Link from 'next/link'

export default async function BoardLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')
  if (!(await isBoardMember(userId))) redirect('/')

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Board Dashboard</h1>
        <nav className="flex gap-6 mt-3">
          {[
            { href: '/board', label: 'Requests' },
            { href: '/board/items', label: 'Manage Items' },
            { href: '/board/history', label: 'Full History' },
            { href: '/board/members', label: 'Members' },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-sm font-medium text-gray-600 hover:text-orange-600 transition-colors"
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
      {children}
    </div>
  )
}
