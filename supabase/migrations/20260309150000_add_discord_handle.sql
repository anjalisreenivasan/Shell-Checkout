-- Migration: 20260309150000_add_discord_handle
-- Adds discord_handle column to shellers for bot DM integration

ALTER TABLE public.shellers
  ADD COLUMN discord_handle text;
