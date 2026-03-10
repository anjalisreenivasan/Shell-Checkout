import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { isBoardMember } from '@/lib/sheller'
import BoardNav from '@/components/BoardNav'

export default async function BoardLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')
  if (!(await isBoardMember(userId))) redirect('/')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Board Dashboard</h1>
        <BoardNav />
      </div>
      {children}
    </div>
  )
}
