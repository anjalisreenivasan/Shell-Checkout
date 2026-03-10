'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import type { Sheller } from '@/types'

export default function BoardMembersPage() {
  const [shellers, setShellers] = useState<Sheller[]>([])
  const [loading, setLoading] = useState(true)

  const fetchShellers = async () => {
    const res = await fetch('/api/board/members')
    const data = await res.json()
    setShellers(data.shellers ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchShellers() }, [])

  const toggleBoard = async (sheller: Sheller) => {
    const res = await fetch('/api/board/members', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sheller_id: sheller.id,
        is_board_member: !sheller.is_board_member,
      }),
    })
    if (res.ok) {
      toast.success(`${sheller.name} ${sheller.is_board_member ? 'removed from' : 'added to'} board.`)
      fetchShellers()
    } else {
      toast.error('Failed to update member.')
    }
  }

  if (loading) {
    return (
      <div className="text-center py-24 text-shell-black/20">
        <div className="w-5 h-5 border-2 border-shell-black/20 border-t-shell-red rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm">Loading members...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <h2 className="text-lg font-semibold text-shell-black">Members</h2>
      <div className="divide-y divide-shell-black/5 rounded-xl border border-shell-black/10 bg-white overflow-hidden">
        {shellers.map(sheller => (
          <div key={sheller.id} className="flex items-center justify-between gap-4 px-4 py-3.5">
            <div className="flex items-center gap-3 min-w-0">
              <Avatar className="w-8 h-8 shrink-0">
                <AvatarFallback className="bg-shell-red/10 text-shell-red text-xs font-semibold">
                  {sheller.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-shell-black truncate">{sheller.name}</span>
                  {sheller.is_board_member && (
                    <Badge variant="outline" className="bg-shell-red/10 text-shell-red border-shell-red/20 text-[10px]">
                      Board
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-shell-black/40 truncate">{sheller.email}</p>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              className={`text-xs shrink-0 ${!sheller.is_board_member ? 'bg-shell-red hover:bg-shell-red-dark text-white border-shell-red' : ''}`}
              onClick={() => toggleBoard(sheller)}
            >
              {sheller.is_board_member ? 'Remove' : 'Make Board'}
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
