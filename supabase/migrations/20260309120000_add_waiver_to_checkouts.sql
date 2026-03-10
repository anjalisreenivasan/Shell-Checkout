-- Migration: 20260309120000_add_waiver_to_checkouts
-- Adds waiver file upload and rental consent to checkouts
-- Applied via: npm run db:push

-- Add waiver and consent columns to checkouts
ALTER TABLE public.checkouts
  ADD COLUMN waiver_url    text,
  ADD COLUMN rental_consent boolean default false not null;

-- Create private storage bucket for waiver files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'waivers',
  'waivers',
  false,
  10485760, -- 10MB limit
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated shellers to upload waiver files
CREATE POLICY "Shellers can upload waivers"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'waivers'
    AND auth.role() = 'authenticated'
  );

-- Allow authenticated users to read waivers (board uses service role anyway)
CREATE POLICY "Authenticated can read waivers"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'waivers'
    AND auth.role() = 'authenticated'
  );
