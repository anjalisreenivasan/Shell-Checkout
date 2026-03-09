'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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

  if (loading) return <div className="text-center py-20 text-gray-400">Loading...</div>

  return (
    <div className="space-y-4 max-w-2xl">
      <h2 className="text-xl font-semibold text-gray-800">All Members</h2>
      <div className="space-y-3">
        {shellers.map(sheller => (
          <Card key={sheller.id} className="border border-gray-200">
            <CardContent className="py-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Avatar className="w-9 h-9">
                  <AvatarFallback className="bg-orange-100 text-orange-700 text-sm font-semibold">
                    {sheller.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{sheller.name}</span>
                    {sheller.is_board_member && (
                      <Badge className="bg-orange-100 text-orange-700 border-orange-200 text-xs" variant="outline">
                        Board
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-400">{sheller.email}</p>
                </div>
              </div>
              <Button
                size="sm"
                variant={sheller.is_board_member ? 'outline' : 'default'}
                className={!sheller.is_board_member ? 'bg-orange-600 hover:bg-orange-700 text-white' : ''}
                onClick={() => toggleBoard(sheller)}
              >
                {sheller.is_board_member ? 'Remove from Board' : 'Make Board Member'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
