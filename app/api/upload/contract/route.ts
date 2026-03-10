import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null

  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: 'Only PDF, JPG, PNG, and WEBP files are allowed' }, { status: 400 })
  }

  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: 'File must be under 10MB' }, { status: 400 })
  }

  const ext = file.name.split('.').pop()
  const path = `${userId}/${Date.now()}.${ext}`

  const { error } = await supabaseAdmin.storage
    .from('contracts')
    .upload(path, file, { contentType: file.type, upsert: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ path })
}
