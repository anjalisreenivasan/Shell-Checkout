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
      <div className="text-center">
        <h1 className="text-2xl font-bold text-shell-black">Board Dashboard</h1>
        <div className="flex justify-center">
          <BoardNav />
        </div>
      </div>
      {children}
    </div>
  )
}
