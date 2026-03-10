-- Migration: 20260309130000_rename_waiver_to_contract
-- Renames waiver_url to contract_url in checkouts
-- Renames storage bucket from waivers to contracts

ALTER TABLE public.checkouts
  RENAME COLUMN waiver_url TO contract_url;

-- Rename storage bucket
UPDATE storage.buckets SET id = 'contracts', name = 'contracts' WHERE id = 'waivers';

-- Drop old storage policies
DROP POLICY IF EXISTS "Shellers can upload waivers" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can read waivers" ON storage.objects;

-- Recreate with new bucket name
CREATE POLICY "Shellers can upload contracts"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'contracts'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated can read contracts"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'contracts'
    AND auth.role() = 'authenticated'
  );
