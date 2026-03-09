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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Plus, Trash2 } from 'lucide-react'
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

  if (loading) return <div className="text-center py-20 text-gray-400">Loading...</div>

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">Manage Items</h2>
        <Button onClick={() => setShowForm(true)} className="bg-orange-600 hover:bg-orange-700 text-white">
          <Plus className="w-4 h-4 mr-1" /> Add Item
        </Button>
      </div>

      {/* Add item form */}
      {showForm && (
        <Card className="border-orange-200">
          <CardHeader>
            <CardTitle className="text-base">New Item</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1">
                <Label>Name <span className="text-red-500">*</span></Label>
                <Input placeholder="e.g. DSLR Camera" {...register('name')} />
                {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
              </div>
              <div className="space-y-1">
                <Label>Description</Label>
                <Textarea placeholder="Optional description..." {...register('description')} />
              </div>
              <div className="space-y-1">
                <Label>Quantity <span className="text-red-500">*</span></Label>
                <Input type="number" min={1} {...register('quantity', { valueAsNumber: true })} className="w-24" />
                {errors.quantity && <p className="text-sm text-red-500">{errors.quantity.message}</p>}
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={submitting} className="bg-orange-600 hover:bg-orange-700 text-white">
                  {submitting ? 'Adding...' : 'Add Item'}
                </Button>
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); reset() }}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Items list */}
      {items.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-400">
            No items yet. Add one above.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map(item => (
            <Card key={item.id} className="border border-gray-200">
              <CardContent className="py-4 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{item.name}</span>
                    <Badge
                      variant="outline"
                      className={item.is_available
                        ? 'bg-green-100 text-green-800 border-green-200 text-xs'
                        : 'bg-red-100 text-red-800 border-red-200 text-xs'}
                    >
                      {item.is_available ? 'Available' : 'Unavailable'}
                    </Badge>
                  </div>
                  {item.description && <p className="text-sm text-gray-500">{item.description}</p>}
                  <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleAvailability(item)}
                  >
                    {item.is_available ? 'Mark Unavailable' : 'Mark Available'}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => setDeleteTarget(item)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Confirm delete dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Item</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">
            Are you sure you want to remove <span className="font-medium">"{deleteTarget?.name}"</span>?
            Existing checkout history will be preserved.
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
