'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Plus, Trash2, Package } from 'lucide-react'
import type { Item } from '@/types'

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
})
type FormData = z.infer<typeof schema>

export default function BoardItemsPage() {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Item | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { quantity: 1 },
  })

  const fetchItems = async () => {
    const res = await fetch('/api/items')
    const data = await res.json()
    setItems(data.items ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchItems() }, [])

  const onSubmit = async (data: FormData) => {
    setSubmitting(true)
    const res = await fetch('/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    setSubmitting(false)
    if (res.ok) {
      toast.success('Item added.')
      reset()
      setShowForm(false)
      fetchItems()
    } else {
      toast.error('Failed to add item.')
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    const res = await fetch(`/api/items/${deleteTarget.id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success(`"${deleteTarget.name}" removed.`)
      setDeleteTarget(null)
      fetchItems()
    } else {
      toast.error('Failed to remove item.')
    }
  }

  const toggleAvailability = async (item: Item) => {
    const res = await fetch(`/api/items/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_available: !item.is_available }),
    })
    if (res.ok) {
      toast.success(`"${item.name}" updated.`)
      fetchItems()
    }
  }

  if (loading) {
    return (
      <div className="text-center py-24 text-gray-300">
        <div className="w-5 h-5 border-2 border-gray-300 border-t-orange-600 rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm">Loading items...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">Items</h2>
        <Button onClick={() => setShowForm(true)} size="sm" className="bg-orange-600 hover:bg-orange-700 text-white gap-1.5">
          <Plus className="w-3.5 h-3.5" /> Add Item
        </Button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-orange-200 p-5 space-y-4">
          <span className="text-sm font-medium text-gray-800">New Item</span>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-sm text-gray-600">Name <span className="text-red-500">*</span></Label>
              <Input placeholder="e.g. DSLR Camera" {...register('name')} />
              {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm text-gray-600">Description</Label>
              <Textarea placeholder="Optional description..." {...register('description')} rows={2} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm text-gray-600">Quantity <span className="text-red-500">*</span></Label>
              <Input type="number" min={1} {...register('quantity', { valueAsNumber: true })} className="w-20" />
              {errors.quantity && <p className="text-xs text-red-500">{errors.quantity.message}</p>}
            </div>
            <div className="flex gap-2 pt-1">
              <Button type="submit" disabled={submitting} size="sm" className="bg-orange-600 hover:bg-orange-700 text-white">
                {submitting ? 'Adding...' : 'Add Item'}
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={() => { setShowForm(false); reset() }}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {items.length === 0 ? (
        <div className="text-center py-24 text-gray-300">
          <Package className="w-8 h-8 mx-auto mb-2" />
          <p className="text-sm">No items yet.</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white overflow-hidden">
          {items.map(item => (
            <div key={item.id} className="flex items-center justify-between gap-4 px-4 py-3.5">
              <div className="min-w-0 space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm text-gray-900 truncate">{item.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] shrink-0 ${item.is_available
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : 'bg-red-50 text-red-600 border-red-200'}`}
                  >
                    {item.is_available ? 'Available' : 'Unavailable'}
                  </Badge>
                </div>
                {item.description && <p className="text-xs text-gray-400 truncate">{item.description}</p>}
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => toggleAvailability(item)}>
                  {item.is_available ? 'Unavail' : 'Avail'}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-red-500 hover:text-red-600 hover:bg-red-50 h-7 w-7 p-0"
                  onClick={() => setDeleteTarget(item)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Remove Item</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500">
            Remove <span className="font-medium text-gray-700">{deleteTarget?.name}</span>? History will be preserved.
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
