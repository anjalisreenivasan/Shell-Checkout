'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatNY, formatDate, formatTime } from '@/lib/timezone'
import { FileText, Calendar, Clock, User, Mail, Check, X, Pencil, RotateCcw } from 'lucide-react'
import type { Checkout } from '@/types'

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  approved: 'bg-green-50 text-green-700 border-green-200',
  denied: 'bg-red-50 text-red-600 border-red-200',
  returned: 'bg-blue-50 text-blue-700 border-blue-200',
  return_confirmed: 'bg-gray-50 text-gray-600 border-gray-200',
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

  const handleViewContract = async (checkoutId: string) => {
    const res = await fetch(`/api/board/contract/${checkoutId}`)
    if (res.ok) {
      const { url } = await res.json()
      window.open(url, '_blank')
    } else {
      toast.error('Could not load contract.')
    }
  }

  const handleConfirmReturn = async (checkout: Checkout) => {
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

  if (loading) {
    return (
      <div className="text-center py-24 text-gray-300">
        <div className="w-5 h-5 border-2 border-gray-300 border-t-orange-600 rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm">Loading requests...</p>
      </div>
    )
  }

  const renderCheckout = (c: Checkout, actions: React.ReactNode) => (
    <div key={c.id} className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <div className="space-y-1">
          <span className="font-medium text-gray-900">
            {(c.item as { name: string })?.name ?? 'Unknown Item'}
          </span>
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" />
              {(c.sheller as { name: string })?.name}
            </span>
            <span className="flex items-center gap-1">
              <Mail className="w-3 h-3" />
              {(c.sheller as { email: string })?.email}
            </span>
          </div>
        </div>
        <Badge variant="outline" className={`text-[10px] ${STATUS_COLORS[c.status]}`}>
          {c.status.replace('_', ' ')}
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

      <div className="flex items-center gap-3 text-xs">
        {c.contract_url ? (
          <button
            onClick={() => handleViewContract(c.id)}
            className="inline-flex items-center gap-1 text-orange-600 hover:text-orange-700 font-medium"
          >
            <FileText className="w-3.5 h-3.5" />
            View contract
          </button>
        ) : (
          <span className="text-gray-300 italic">No contract</span>
        )}
        <span className="text-gray-200">|</span>
        <span className={c.rental_consent ? 'text-green-600' : 'text-red-400'}>
          {c.rental_consent ? 'Agreed to terms' : 'No consent'}
        </span>
      </div>

      <div className="flex gap-2 flex-wrap pt-1">{actions}</div>
    </div>
  )

  return (
    <div className="space-y-4 max-w-3xl">
      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
          <TabsTrigger value="active">Active ({active.length})</TabsTrigger>
          <TabsTrigger value="returns">Returns ({awaitingReturn.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-3 mt-4">
          {pending.length === 0 ? (
            <div className="text-center py-16 text-gray-300 text-sm">No pending requests.</div>
          ) : pending.map(c => renderCheckout(c, <>
            <Button size="sm" onClick={() => updateStatus(c.id, 'approved')} className="gap-1.5 bg-green-600 hover:bg-green-700 text-white">
              <Check className="w-3.5 h-3.5" /> Approve
            </Button>
            <Button size="sm" variant="destructive" onClick={() => updateStatus(c.id, 'denied')} className="gap-1.5">
              <X className="w-3.5 h-3.5" /> Deny
            </Button>
            <Button size="sm" variant="outline" onClick={() => { setEditTarget(c); setEditDate(c.return_date); setEditTime(c.return_time) }} className="gap-1.5">
              <Pencil className="w-3.5 h-3.5" /> Edit Dates
            </Button>
          </>))}
        </TabsContent>

        <TabsContent value="active" className="space-y-3 mt-4">
          {active.length === 0 ? (
            <div className="text-center py-16 text-gray-300 text-sm">No active checkouts.</div>
          ) : active.map(c => renderCheckout(c, <>
            <Button size="sm" variant="outline" onClick={() => { setEditTarget(c); setEditDate(c.return_date); setEditTime(c.return_time) }} className="gap-1.5">
              <Pencil className="w-3.5 h-3.5" /> Edit Dates
            </Button>
          </>))}
        </TabsContent>

        <TabsContent value="returns" className="space-y-3 mt-4">
          {awaitingReturn.length === 0 ? (
            <div className="text-center py-16 text-gray-300 text-sm">No returns awaiting confirmation.</div>
          ) : awaitingReturn.map(c => renderCheckout(c, <>
            <Button size="sm" onClick={() => handleConfirmReturn(c)} className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white">
              <RotateCcw className="w-3.5 h-3.5" /> Confirm Return
            </Button>
          </>))}
        </TabsContent>
      </Tabs>

      <Dialog open={!!editTarget} onOpenChange={() => setEditTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit Return Dates</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-sm text-gray-600">Return Date</Label>
              <Input type="date" value={editDate} onChange={e => setEditDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm text-gray-600">Return Time</Label>
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
