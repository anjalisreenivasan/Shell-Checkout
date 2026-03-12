'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatNY, formatDate, formatTime } from '@/lib/timezone'
import { Calendar, Clock, RotateCcw } from 'lucide-react'
import type { Checkout } from '@/types'

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  approved: 'bg-green-50 text-green-700 border-green-200',
  denied: 'bg-red-50 text-red-600 border-red-200',
  returned: 'bg-blue-50 text-blue-700 border-blue-200',
  return_confirmed: 'bg-shell-black/5 text-shell-black/60 border-shell-black/10',
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  approved: 'Approved',
  denied: 'Denied',
  returned: 'Awaiting Confirmation',
  return_confirmed: 'Returned',
}

export default function MyRequestsPage() {
  const [checkouts, setCheckouts] = useState<Checkout[]>([])
  const [loading, setLoading] = useState(true)

  const fetchCheckouts = async () => {
    const res = await fetch('/api/checkouts')
    const data = await res.json()
    setCheckouts(data.checkouts ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchCheckouts() }, [])

  const handleMarkReturned = async (id: string) => {
    const res = await fetch(`/api/checkouts/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'returned' }),
    })
    const data = await res.json().catch(() => ({}))
    if (res.ok) {
      toast.success('Marked as returned. A board member will confirm it.')
      fetchCheckouts()
    } else {
      toast.error(data.error ?? 'Failed to mark as returned.')
    }
  }

  const active = checkouts.filter(c => ['pending', 'approved', 'returned'].includes(c.status))
  const history = checkouts.filter(c => ['denied', 'return_confirmed'].includes(c.status))

  if (loading) {
    return (
      <div className="text-center py-24 text-shell-black/20">
        <div className="w-5 h-5 border-2 border-shell-black/20 border-t-shell-red rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm">Loading requests...</p>
      </div>
    )
  }

  const renderCheckout = (c: Checkout) => (
    <div key={c.id} className="bg-white rounded-xl border border-shell-black/10 p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <span className="font-medium text-shell-black">
          {(c.item as { name: string })?.name ?? 'Unknown Item'}
        </span>
        <Badge variant="outline" className={`text-[10px] ${STATUS_COLORS[c.status]}`}>
          {STATUS_LABELS[c.status]}
        </Badge>
      </div>
      <div className="flex flex-col gap-1 text-sm text-shell-black/50">
        <span className="flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-shell-black/20" />
          Checked out {formatNY(c.checkout_at)}
        </span>
        <span className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-shell-black/20" />
          Due {formatDate(c.return_date)} at {formatTime(c.return_time)}
        </span>
      </div>
      {c.status === 'approved' && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleMarkReturned(c.id)}
          className="gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Mark as Returned
        </Button>
      )}
    </div>
  )

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-shell-black">My Requests</h1>
        <p className="text-sm text-shell-black/40 mt-1">Track your checkout requests.</p>
      </div>

      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">Active ({active.length})</TabsTrigger>
          <TabsTrigger value="history">History ({history.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="active" className="space-y-3 mt-4">
          {active.length === 0 ? (
            <div className="text-center py-16 text-shell-black/20 text-sm">No active requests.</div>
          ) : active.map(renderCheckout)}
        </TabsContent>
        <TabsContent value="history" className="space-y-3 mt-4">
          {history.length === 0 ? (
            <div className="text-center py-16 text-shell-black/20 text-sm">No history yet.</div>
          ) : history.map(renderCheckout)}
        </TabsContent>
      </Tabs>
    </div>
  )
}
