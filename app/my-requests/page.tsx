'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatNY, formatDate, formatTime } from '@/lib/timezone'
import type { Checkout } from '@/types'

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  approved: 'bg-green-100 text-green-800 border-green-200',
  denied: 'bg-red-100 text-red-800 border-red-200',
  returned: 'bg-blue-100 text-blue-800 border-blue-200',
  return_confirmed: 'bg-gray-100 text-gray-700 border-gray-200',
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
    return <div className="text-center py-20 text-gray-400">Loading your requests...</div>
  }

  const renderCheckout = (c: Checkout) => (
    <Card key={c.id} className="border border-gray-200">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base text-gray-900">
            {(c.item as { name: string })?.name ?? 'Unknown Item'}
          </CardTitle>
          <Badge variant="outline" className={STATUS_COLORS[c.status]}>
            {STATUS_LABELS[c.status]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-1 text-sm text-gray-600">
        <p>
          <span className="font-medium text-gray-700">Checked out: </span>
          {formatNY(c.checkout_at)}
        </p>
        <p>
          <span className="font-medium text-gray-700">Due back: </span>
          {formatDate(c.return_date)} at {formatTime(c.return_time)}
        </p>
        {c.status === 'approved' && (
          <div className="pt-2">
            <Button
              size="sm"
              onClick={() => handleMarkReturned(c.id)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Mark as Returned
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Requests</h1>
        <p className="text-gray-500 mt-1">Track your active and past checkout requests.</p>
      </div>

      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">Active ({active.length})</TabsTrigger>
          <TabsTrigger value="history">History ({history.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="active" className="space-y-4 mt-4">
          {active.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-gray-400">
                No active requests.
              </CardContent>
            </Card>
          ) : active.map(renderCheckout)}
        </TabsContent>
        <TabsContent value="history" className="space-y-4 mt-4">
          {history.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-gray-400">
                No history yet.
              </CardContent>
            </Card>
          ) : history.map(renderCheckout)}
        </TabsContent>
      </Tabs>
    </div>
  )
}
