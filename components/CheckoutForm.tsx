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
import { ExternalLink, Upload, CheckCircle2 } from 'lucide-react'
import type { Item } from '@/types'

const schema = z.object({
  return_date: z.string().min(1, 'Return date is required'),
  return_time: z.string().min(1, 'Return time is required'),
  rental_consent: z.boolean().refine(val => val === true, {
    message: 'You must agree to the rental agreement',
  }),
})

type FormData = z.infer<typeof schema>

interface Props {
  item: Item
}

export default function CheckoutForm({ item }: Props) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [waiverFile, setWaiverFile] = useState<File | null>(null)
  const [waiverUploaded, setWaiverUploaded] = useState(false)
  const checkoutAt = nowInNY()

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { rental_consent: false },
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null
    setWaiverFile(file)
    setWaiverUploaded(false)
  }

  const onSubmit = async (data: FormData) => {
    if (!waiverFile) {
      toast.error('Please upload your signed waiver before submitting.')
      return
    }

    setSubmitting(true)
    try {
      // Step 1: upload waiver file
      const formData = new FormData()
      formData.append('file', waiverFile)
      const uploadRes = await fetch('/api/upload/waiver', {
        method: 'POST',
        body: formData,
      })

      if (!uploadRes.ok) {
        const err = await uploadRes.json()
        throw new Error(err.error ?? 'Failed to upload waiver')
      }

      const { path: waiverPath } = await uploadRes.json()
      setWaiverUploaded(true)

      // Step 2: submit checkout request with waiver path
      const checkoutRes = await fetch('/api/checkouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item_id: item.id,
          checkout_at: checkoutAt,
          return_date: data.return_date,
          return_time: data.return_time,
          waiver_url: waiverPath,
          rental_consent: data.rental_consent,
        }),
      })

      if (!checkoutRes.ok) {
        const err = await checkoutRes.json()
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

          {/* Waiver */}
          <div className="space-y-3 rounded-lg border border-orange-200 bg-orange-50 p-4">
            <div className="space-y-1">
              <Label className="text-gray-700 font-semibold">
                Rental Waiver <span className="text-red-500">*</span>
              </Label>
              <p className="text-sm text-gray-500">
                You must complete the waiver and upload the signed copy before submitting.
              </p>
            </div>

            {/* Step 1: open waiver */}
            <a
              href={process.env.NEXT_PUBLIC_WAIVER_URL ?? '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-orange-600 hover:text-orange-700 underline underline-offset-2"
            >
              <ExternalLink className="w-4 h-4" />
              Step 1: Open and complete the waiver
            </a>

            {/* Step 2: upload signed waiver */}
            <div className="space-y-1">
              <Label htmlFor="waiver_file" className="text-gray-700">
                Step 2: Upload signed waiver (PDF, JPG, or PNG)
              </Label>
              <div className="flex items-center gap-3">
                <label
                  htmlFor="waiver_file"
                  className="flex items-center gap-2 cursor-pointer rounded-lg border border-dashed border-gray-300 bg-white px-4 py-2 text-sm text-gray-600 hover:border-orange-400 hover:text-orange-600 transition-colors"
                >
                  {waiverUploaded ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  {waiverFile ? waiverFile.name : 'Choose file...'}
                  <input
                    id="waiver_file"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
                {waiverFile && !waiverUploaded && (
                  <span className="text-xs text-gray-400">Ready to upload on submit</span>
                )}
              </div>
            </div>
          </div>

          {/* Rental agreement consent */}
          <div className="space-y-1">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                className="mt-0.5 w-4 h-4 accent-orange-600 cursor-pointer"
                {...register('rental_consent')}
              />
              <span className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">
                I agree to the Startup Shell rental agreement and take responsibility for the safe
                return of this item in the same condition it was borrowed.{' '}
                <span className="text-red-500">*</span>
              </span>
            </label>
            {errors.rental_consent && (
              <p className="text-sm text-red-500 pl-7">{errors.rental_consent.message}</p>
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
