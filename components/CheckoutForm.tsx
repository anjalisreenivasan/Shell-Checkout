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

      const uploadBody = await uploadRes.text()
      if (!uploadRes.ok) {
        let uploadError = 'Failed to upload contract'
        if (uploadRes.status === 413 || uploadBody.includes('Request Entity Too Large') || uploadBody.includes('too large')) {
          uploadError = 'File is too large. Try a smaller PDF or compress the file (under 10MB).'
        } else {
          try {
            const err = JSON.parse(uploadBody)
            uploadError = err.error ?? uploadError
          } catch {
            if (uploadBody) uploadError = uploadBody.slice(0, 100)
          }
        }
        throw new Error(uploadError)
      }

      let contractPath: string
      try {
        const data = JSON.parse(uploadBody)
        contractPath = data.path
      } catch {
        throw new Error('Invalid response from upload. Please try again.')
      }
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
      <Link href={`/items/${item.id}`} className="inline-flex items-center gap-1.5 text-sm text-shell-black/40 hover:text-shell-black/70 transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to {item.name}
      </Link>

      <div className="text-center">
        <h1 className="text-2xl font-bold text-shell-black">Request Checkout</h1>
        <p className="text-sm text-shell-black/40 mt-1">{item.name}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="bg-white rounded-xl border border-shell-black/10 p-5 space-y-5 shadow-sm">
          <div className="space-y-1.5">
            <Label className="text-sm text-shell-black/60">Checkout Time</Label>
            <Input
              value={formatNY(checkoutAt)}
              disabled
              className="bg-shell-cream text-shell-black/40 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="return_date" className="text-sm text-shell-black/60">
              Return Date <span className="text-shell-red">*</span>
            </Label>
            <Input
              id="return_date"
              type="date"
              min={new Date().toISOString().split('T')[0]}
              {...register('return_date')}
            />
            {errors.return_date && (
              <p className="text-xs text-shell-red">{errors.return_date.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="return_time" className="text-sm text-shell-black/60">
              Return Time <span className="text-shell-red">*</span>
            </Label>
            <select
              id="return_time"
              {...register('return_time')}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">Select a time</option>
              {Array.from({ length: 17 * 4 + 1 }, (_, i) => {
                const h = Math.floor(i / 4) + 7
                const m = (i % 4) * 15
                if (h === 24 && m > 0) return null
                const displayH = h === 24 ? 0 : h
                const value = `${String(displayH).padStart(2, '0')}:${String(m).padStart(2, '0')}`
                const hour12 = displayH === 0 ? 12 : displayH > 12 ? displayH - 12 : displayH
                const ampm = displayH === 0 || displayH >= 12 ? (displayH === 0 ? 'AM' : 'PM') : 'AM'
                const label = displayH === 0 ? '12:00 AM' : `${hour12}:${String(m).padStart(2, '0')} ${ampm}`
                return <option key={value} value={value}>{label}</option>
              })}
            </select>
            {errors.return_time && (
              <p className="text-xs text-shell-red">{errors.return_time.message}</p>
            )}
          </div>
        </div>

        <div className="bg-shell-red/5 rounded-xl border border-shell-red/15 p-5 space-y-4">
          <div>
            <span className="text-sm font-semibold text-shell-black">Rental Contract</span>
            <p className="text-xs text-shell-black/50 mt-0.5">
              Complete the rental contract and upload the signed copy.
            </p>
          </div>

          <a
            href={process.env.NEXT_PUBLIC_CONTRACT_URL ?? '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-shell-red hover:text-shell-red-dark"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Open rental contract
          </a>

          <div className="space-y-1.5">
            <Label htmlFor="contract_file" className="text-sm text-shell-black/60">
              Upload signed contract
            </Label>
            <label
              htmlFor="contract_file"
              className="flex items-center gap-2 cursor-pointer rounded-lg border border-dashed border-shell-black/20 bg-white px-4 py-2.5 text-sm text-shell-black/50 hover:border-shell-red/40 hover:text-shell-red transition-colors w-fit"
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

        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            className="mt-0.5 w-4 h-4 accent-shell-red cursor-pointer rounded"
            {...register('rental_consent')}
          />
          <span className="text-sm text-shell-black/50 group-hover:text-shell-black/70 transition-colors leading-relaxed">
            By submitting this form, you agree to our rental terms and conditions. When you
            rent a resource, you are responsible for its safekeeping and any damage that may
            occur during your use. <span className="text-shell-red">*</span>
          </span>
        </label>
        {errors.rental_consent && (
          <p className="text-xs text-shell-red pl-7">{errors.rental_consent.message}</p>
        )}

        <Button
          type="submit"
          disabled={submitting}
          className="w-full bg-shell-red hover:bg-shell-red-dark text-white h-10 shadow-sm"
        >
          {submitting ? 'Submitting...' : 'Submit Request'}
        </Button>
      </form>
    </div>
  )
}
