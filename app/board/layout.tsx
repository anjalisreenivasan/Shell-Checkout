import { getAuthUserId } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getCurrentSheller } from '@/lib/sheller'
import BoardNav from '@/components/BoardNav'

export default async function BoardLayout({ children }: { children: React.ReactNode }) {
  const userId = await getAuthUserId()
  if (!userId) redirect('/sign-in')

  const sheller = await getCurrentSheller()
  if (!sheller?.is_board_member) redirect('/')

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
