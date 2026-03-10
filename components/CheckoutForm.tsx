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
import { formatNY, nowInNY } from '@/lib/timezone'
import { ExternalLink, Upload, CheckCircle2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import type { Item } from '@/types'

const schema = z.object({
  return_date: z.string().min(1, 'Return date is required'),
  return_time: z.string().min(1, 'Return time is required'),
  rental_consent: z.boolean().refine(val => val === true, {
    message: 'You must agree to the rental terms and conditions',
  }),
})

type FormData = z.infer<typeof schema>

interface Props {
  item: Item
}

export default function CheckoutForm({ item }: Props) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [contractFile, setContractFile] = useState<File | null>(null)
  const [contractUploaded, setContractUploaded] = useState(false)
  const checkoutAt = nowInNY()

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { rental_consent: false },
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null
    setContractFile(file)
    setContractUploaded(false)
  }

  const onSubmit = async (data: FormData) => {
    if (!contractFile) {
      toast.error('Please upload your signed rental contract before submitting.')
      return
    }

    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('file', contractFile)
      const uploadRes = await fetch('/api/upload/contract', {
        method: 'POST',
        body: formData,
      })

      if (!uploadRes.ok) {
        const err = await uploadRes.json()
        throw new Error(err.error ?? 'Failed to upload contract')
      }

      const { path: contractPath } = await uploadRes.json()
      setContractUploaded(true)

      const checkoutRes = await fetch('/api/checkouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item_id: item.id,
          checkout_at: checkoutAt,
          return_date: data.return_date,
          return_time: data.return_time,
          contract_url: contractPath,
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
    <div className="max-w-lg mx-auto space-y-6">
      <Link href={`/items/${item.id}`} className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to {item.name}
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Request Checkout</h1>
        <p className="text-sm text-gray-400 mt-1">{item.name}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-5 shadow-sm">
          {/* Checkout time */}
          <div className="space-y-1.5">
            <Label className="text-sm text-gray-600">Checkout Time</Label>
            <Input
              value={formatNY(checkoutAt)}
              disabled
              className="bg-gray-50 text-gray-400 text-sm"
            />
          </div>

          {/* Return date */}
          <div className="space-y-1.5">
            <Label htmlFor="return_date" className="text-sm text-gray-600">
              Return Date <span className="text-red-500">*</span>
            </Label>
            <Input
              id="return_date"
              type="date"
              min={new Date().toISOString().split('T')[0]}
              {...register('return_date')}
            />
            {errors.return_date && (
              <p className="text-xs text-red-500">{errors.return_date.message}</p>
            )}
          </div>

          {/* Return time */}
          <div className="space-y-1.5">
            <Label htmlFor="return_time" className="text-sm text-gray-600">
              Return Time <span className="text-red-500">*</span>
            </Label>
            <select
              id="return_time"
              {...register('return_time')}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">Select a time</option>
              {Array.from({ length: 24 * 4 }, (_, i) => {
                const h = Math.floor(i / 4)
                const m = (i % 4) * 15
                const value = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
                const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h
                const ampm = h < 12 ? 'AM' : 'PM'
                const label = `${hour12}:${String(m).padStart(2, '0')} ${ampm}`
                return <option key={value} value={value}>{label}</option>
              })}
            </select>
            {errors.return_time && (
              <p className="text-xs text-red-500">{errors.return_time.message}</p>
            )}
          </div>
        </div>

        {/* Contract section */}
        <div className="bg-orange-50/70 rounded-xl border border-orange-200 p-5 space-y-4">
          <div>
            <span className="text-sm font-semibold text-gray-800">Rental Contract</span>
            <p className="text-xs text-gray-500 mt-0.5">
              Complete the rental contract and upload the signed copy.
            </p>
          </div>

          <a
            href={process.env.NEXT_PUBLIC_CONTRACT_URL ?? '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-orange-600 hover:text-orange-700"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Open rental contract
          </a>

          <div className="space-y-1.5">
            <Label htmlFor="contract_file" className="text-sm text-gray-600">
              Upload signed contract
            </Label>
            <label
              htmlFor="contract_file"
              className="flex items-center gap-2 cursor-pointer rounded-lg border border-dashed border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-500 hover:border-orange-400 hover:text-orange-600 transition-colors w-fit"
            >
              {contractUploaded ? (
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              {contractFile ? contractFile.name : 'Choose file (PDF, JPG, PNG)'}
              <input
                id="contract_file"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.webp"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          </div>
        </div>

        {/* Consent */}
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            className="mt-0.5 w-4 h-4 accent-orange-600 cursor-pointer rounded"
            {...register('rental_consent')}
          />
          <span className="text-sm text-gray-500 group-hover:text-gray-700 transition-colors leading-relaxed">
            By submitting this form, you agree to our rental terms and conditions. When you
            rent a resource, you are responsible for its safekeeping and any damage that may
            occur during your use. <span className="text-red-500">*</span>
          </span>
        </label>
        {errors.rental_consent && (
          <p className="text-xs text-red-500 pl-7">{errors.rental_consent.message}</p>
        )}

        <Button
          type="submit"
          disabled={submitting}
          className="w-full bg-orange-600 hover:bg-orange-700 text-white h-10 shadow-sm"
        >
          {submitting ? 'Submitting...' : 'Submit Request'}
        </Button>
      </form>
    </div>
  )
}
