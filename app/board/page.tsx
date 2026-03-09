'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
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

export default function BoardRequestsPage() {
  const [checkouts, setCheckouts] = useState<Checkout[]>([])
  const [loading, setLoading] = useState(true)
  const [editTarget, setEditTarget] = useState<Checkout | null>(null)
  const [editDate, setEditDate] = useState('')
  const [editTime, setEditTime] = useState('')
  const [saving, setSaving] = useState(false)

  const fetchCheckouts = async () => {
    const res = await fetch('/api/checkouts')
    const data = await res.json()
    setCheckouts(data.checkouts ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchCheckouts() }, [])

  const updateStatus = async (id: string, status: string) => {
    const res = await fetch(`/api/checkouts/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (res.ok) {
      toast.success(`Request ${status}.`)
      fetchCheckouts()
    } else {
      toast.error('Action failed.')
    }
  }

  const handleEditDates = async () => {
    if (!editTarget) return
    setSaving(true)
    const res = await fetch(`/api/checkouts/${editTarget.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ return_date: editDate, return_time: editTime }),
    })
    setSaving(false)
    if (res.ok) {
      toast.success('Dates updated.')
      setEditTarget(null)
      fetchCheckouts()
    } else {
      toast.error('Failed to update dates.')
    }
  }

  const handleConfirmReturn = async (checkout: Checkout) => {
    // Find the return record for this checkout
    const res = await fetch(`/api/checkouts/${checkout.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'return_confirmed' }),
    })
    if (res.ok) {
      toast.success('Return confirmed.')
      fetchCheckouts()
    } else {
      toast.error('Failed to confirm return.')
    }
  }

  const pending = checkouts.filter(c => c.status === 'pending')
  const active = checkouts.filter(c => c.status === 'approved')
  const awaitingReturn = checkouts.filter(c => c.status === 'returned')

  if (loading) return <div className="text-center py-20 text-gray-400">Loading...</div>

  const renderCheckout = (c: Checkout, actions: React.ReactNode) => (
    <Card key={c.id} className="border border-gray-200">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div>
            <CardTitle className="text-base text-gray-900">
              {(c.item as { name: string })?.name ?? 'Unknown Item'}
            </CardTitle>
            <p className="text-sm text-gray-500 mt-0.5">
              Requested by <span className="font-medium text-gray-700">{(c.sheller as { name: string })?.name}</span>
              {' '}·{' '}
              <span className="text-gray-400">{(c.sheller as { email: string })?.email}</span>
            </p>
          </div>
          <Badge variant="outline" className={STATUS_COLORS[c.status]}>
            {c.status.replace('_', ' ')}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-gray-600">
        <p><span className="font-medium text-gray-700">Checkout: </span>{formatNY(c.checkout_at)}</p>
        <p><span className="font-medium text-gray-700">Due back: </span>{formatDate(c.return_date)} at {formatTime(c.return_time)}</p>
        <div className="flex gap-2 flex-wrap pt-1">{actions}</div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-4 max-w-4xl">
      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
          <TabsTrigger value="active">Active ({active.length})</TabsTrigger>
          <TabsTrigger value="returns">Awaiting Return ({awaitingReturn.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4 mt-4">
          {pending.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-gray-400">No pending requests.</CardContent></Card>
          ) : pending.map(c => renderCheckout(c, <>
            <Button size="sm" onClick={() => updateStatus(c.id, 'approved')} className="bg-green-600 hover:bg-green-700 text-white">Approve</Button>
            <Button size="sm" variant="destructive" onClick={() => updateStatus(c.id, 'denied')}>Deny</Button>
            <Button size="sm" variant="outline" onClick={() => { setEditTarget(c); setEditDate(c.return_date); setEditTime(c.return_time) }}>Edit Dates</Button>
          </>))}
        </TabsContent>

        <TabsContent value="active" className="space-y-4 mt-4">
          {active.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-gray-400">No active checkouts.</CardContent></Card>
          ) : active.map(c => renderCheckout(c, <>
            <Button size="sm" variant="outline" onClick={() => { setEditTarget(c); setEditDate(c.return_date); setEditTime(c.return_time) }}>Edit Dates</Button>
          </>))}
        </TabsContent>

        <TabsContent value="returns" className="space-y-4 mt-4">
          {awaitingReturn.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-gray-400">No returns awaiting confirmation.</CardContent></Card>
          ) : awaitingReturn.map(c => renderCheckout(c, <>
            <Button size="sm" onClick={() => handleConfirmReturn(c)} className="bg-blue-600 hover:bg-blue-700 text-white">Confirm Return</Button>
          </>))}
        </TabsContent>
      </Tabs>

      {/* Edit dates dialog */}
      <Dialog open={!!editTarget} onOpenChange={() => setEditTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Return Dates</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>Return Date</Label>
              <Input type="date" value={editDate} onChange={e => setEditDate(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Return Time</Label>
              <Input type="time" value={editTime} onChange={e => setEditTime(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTarget(null)}>Cancel</Button>
            <Button disabled={saving} onClick={handleEditDates} className="bg-orange-600 hover:bg-orange-700 text-white">
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
