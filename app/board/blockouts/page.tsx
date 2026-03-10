'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Plus, Trash2, Ban, Calendar } from 'lucide-react'
import { formatNY } from '@/lib/timezone'
import type { Item, Blockout } from '@/types'

export default function BoardBlockoutsPage() {
  const [blockouts, setBlockouts] = useState<Blockout[]>([])
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Blockout | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const [formItemId, setFormItemId] = useState('')
  const [formTitle, setFormTitle] = useState('')
  const [formStartDate, setFormStartDate] = useState('')
  const [formStartTime, setFormStartTime] = useState('')
  const [formEndDate, setFormEndDate] = useState('')
  const [formEndTime, setFormEndTime] = useState('')

  const fetchAll = async () => {
    const [bRes, iRes] = await Promise.all([
      fetch('/api/blockouts'),
      fetch('/api/items'),
    ])
    const bData = await bRes.json()
    const iData = await iRes.json()
    setBlockouts(bData.blockouts ?? [])
    setItems(iData.items ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchAll() }, [])

  const resetForm = () => {
    setFormItemId('')
    setFormTitle('')
    setFormStartDate('')
    setFormStartTime('')
    setFormEndDate('')
    setFormEndTime('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formItemId || !formTitle || !formStartDate || !formStartTime || !formEndDate || !formEndTime) {
      toast.error('All fields are required.')
      return
    }

    setSubmitting(true)
    const res = await fetch('/api/blockouts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        item_id: formItemId,
        title: formTitle,
        start_at: `${formStartDate}T${formStartTime}:00`,
        end_at: `${formEndDate}T${formEndTime}:00`,
      }),
    })
    setSubmitting(false)

    if (res.ok) {
      toast.success('Blockout created.')
      resetForm()
      setShowForm(false)
      fetchAll()
    } else {
      toast.error('Failed to create blockout.')
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    const res = await fetch(`/api/blockouts/${deleteTarget.id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('Blockout removed.')
      setDeleteTarget(null)
      fetchAll()
    } else {
      toast.error('Failed to remove blockout.')
    }
  }

  const timeOptions = Array.from({ length: 17 * 4 + 1 }, (_, i) => {
    const h = Math.floor(i / 4) + 7
    const m = (i % 4) * 15
    if (h === 24 && m > 0) return null
    const displayH = h === 24 ? 0 : h
    const value = `${String(displayH).padStart(2, '0')}:${String(m).padStart(2, '0')}`
    const hour12 = displayH === 0 ? 12 : displayH > 12 ? displayH - 12 : displayH
    const ampm = displayH === 0 ? 'AM' : displayH >= 12 ? 'PM' : 'AM'
    const label = displayH === 0 ? '12:00 AM' : `${hour12}:${String(m).padStart(2, '0')} ${ampm}`
    return { value, label }
  }).filter(Boolean) as { value: string; label: string }[]

  if (loading) {
    return (
      <div className="text-center py-24 text-gray-300">
        <div className="w-5 h-5 border-2 border-gray-300 border-t-orange-600 rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm">Loading...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">Blockouts</h2>
        <Button onClick={() => setShowForm(true)} size="sm" className="bg-gray-900 hover:bg-gray-800 text-white gap-1.5">
          <Plus className="w-3.5 h-3.5" /> Block Time
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <span className="text-sm font-medium text-gray-800">New Blockout</span>

          <div className="space-y-1.5">
            <Label className="text-sm text-gray-600">Item <span className="text-red-500">*</span></Label>
            <select
              value={formItemId}
              onChange={e => setFormItemId(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">Select an item</option>
              {items.map(item => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm text-gray-600">Reason <span className="text-red-500">*</span></Label>
            <Input
              placeholder="e.g. Spring Event"
              value={formTitle}
              onChange={e => setFormTitle(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm text-gray-600">Start Date <span className="text-red-500">*</span></Label>
              <Input type="date" value={formStartDate} onChange={e => setFormStartDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm text-gray-600">Start Time <span className="text-red-500">*</span></Label>
              <select
                value={formStartTime}
                onChange={e => setFormStartTime(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">Select</option>
                {timeOptions.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm text-gray-600">End Date <span className="text-red-500">*</span></Label>
              <Input type="date" value={formEndDate} onChange={e => setFormEndDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm text-gray-600">End Time <span className="text-red-500">*</span></Label>
              <select
                value={formEndTime}
                onChange={e => setFormEndTime(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">Select</option>
                {timeOptions.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <Button type="submit" disabled={submitting} size="sm" className="bg-gray-900 hover:bg-gray-800 text-white">
              {submitting ? 'Creating...' : 'Create Blockout'}
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => { setShowForm(false); resetForm() }}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      {blockouts.length === 0 ? (
        <div className="text-center py-24 text-gray-300">
          <Ban className="w-8 h-8 mx-auto mb-2" />
          <p className="text-sm">No blockouts set.</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white overflow-hidden">
          {blockouts.map(b => (
            <div key={b.id} className="flex items-center justify-between gap-4 px-4 py-3.5">
              <div className="min-w-0 space-y-0.5">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-gray-900 text-white border-gray-900 text-[10px]">
                    Blocked
                  </Badge>
                  <span className="font-medium text-sm text-gray-900 truncate">
                    {(b.item as { name: string })?.name}
                  </span>
                </div>
                <p className="text-xs text-gray-500">{b.title}</p>
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatNY(b.start_at)} — {formatNY(b.end_at)}
                </p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="text-red-500 hover:text-red-600 hover:bg-red-50 h-7 w-7 p-0 shrink-0"
                onClick={() => setDeleteTarget(b)}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Remove Blockout</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500">
            Remove the blockout for <span className="font-medium text-gray-700">{(deleteTarget?.item as { name: string })?.name}</span>?
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Remove</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
