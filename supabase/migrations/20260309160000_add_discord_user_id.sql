-- Migration: 20260309160000_add_discord_user_id
-- Adds discord_user_id column for verified OAuth-linked Discord accounts

ALTER TABLE public.shellers
  ADD COLUMN discord_user_id text;
