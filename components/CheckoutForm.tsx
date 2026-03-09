'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatNY, nowInNY } from '@/lib/timezone'
import type { Item } from '@/types'

const schema = z.object({
  return_date: z.string().min(1, 'Return date is required'),
  return_time: z.string().min(1, 'Return time is required'),
})

type FormData = z.infer<typeof schema>

interface Props {
  item: Item
}

export default function CheckoutForm({ item }: Props) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const checkoutAt = nowInNY()

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setSubmitting(true)
    try {
      const res = await fetch('/api/checkouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item_id: item.id,
          checkout_at: checkoutAt,
          return_date: data.return_date,
          return_time: data.return_time,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Failed to submit request')
      }

      toast.success('Checkout request submitted! A board member will review it shortly.')
      router.push('/my-requests')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{item.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Checkout time — auto-filled */}
          <div className="space-y-1">
            <Label className="text-gray-700">Checkout Time (auto-filled, NYC time)</Label>
            <Input
              value={formatNY(checkoutAt)}
              disabled
              className="bg-gray-50 text-gray-500"
            />
          </div>

          {/* Return date */}
          <div className="space-y-1">
            <Label htmlFor="return_date" className="text-gray-700">
              Return Date <span className="text-red-500">*</span>
            </Label>
            <Input
              id="return_date"
              type="date"
              min={new Date().toISOString().split('T')[0]}
              {...register('return_date')}
            />
            {errors.return_date && (
              <p className="text-sm text-red-500">{errors.return_date.message}</p>
            )}
          </div>

          {/* Return time */}
          <div className="space-y-1">
            <Label htmlFor="return_time" className="text-gray-700">
              Return Time <span className="text-red-500">*</span>
            </Label>
            <Input
              id="return_time"
              type="time"
              {...register('return_time')}
            />
            {errors.return_time && (
              <p className="text-sm text-red-500">{errors.return_time.message}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={submitting}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white"
          >
            {submitting ? 'Submitting...' : 'Submit Request'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
