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
  return_confirmed: 'bg-gray-50 text-gray-600 border-gray-200',
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
    if (res.ok) {
      toast.success('Marked as returned. A board member will confirm it.')
      fetchCheckouts()
    } else {
      toast.error('Failed to mark as returned.')
    }
  }

  const active = checkouts.filter(c => ['pending', 'approved', 'returned'].includes(c.status))
  const history = checkouts.filter(c => ['denied', 'return_confirmed'].includes(c.status))

  if (loading) {
    return (
      <div className="text-center py-24 text-gray-300">
        <div className="w-5 h-5 border-2 border-gray-300 border-t-orange-600 rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm">Loading requests...</p>
      </div>
    )
  }

  const renderCheckout = (c: Checkout) => (
    <div key={c.id} className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <span className="font-medium text-gray-900">
          {(c.item as { name: string })?.name ?? 'Unknown Item'}
        </span>
        <Badge variant="outline" className={`text-[10px] ${STATUS_COLORS[c.status]}`}>
          {STATUS_LABELS[c.status]}
        </Badge>
      </div>
      <div className="flex flex-col gap-1 text-sm text-gray-500">
        <span className="flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-gray-300" />
          Checked out {formatNY(c.checkout_at)}
        </span>
        <span className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-gray-300" />
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
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Requests</h1>
        <p className="text-sm text-gray-400 mt-1">Track your checkout requests.</p>
      </div>

      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">Active ({active.length})</TabsTrigger>
          <TabsTrigger value="history">History ({history.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="active" className="space-y-3 mt-4">
          {active.length === 0 ? (
            <div className="text-center py-16 text-gray-300 text-sm">No active requests.</div>
          ) : active.map(renderCheckout)}
        </TabsContent>
        <TabsContent value="history" className="space-y-3 mt-4">
          {history.length === 0 ? (
            <div className="text-center py-16 text-gray-300 text-sm">No history yet.</div>
          ) : history.map(renderCheckout)}
        </TabsContent>
      </Tabs>
    </div>
  )
}
