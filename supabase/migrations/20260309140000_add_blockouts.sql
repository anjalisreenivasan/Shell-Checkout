-- Migration: 20260309140000_add_blockouts
-- Adds blockouts table for board members to reserve items for events

CREATE TABLE IF NOT EXISTS public.blockouts (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id     uuid        REFERENCES public.items(id) ON DELETE CASCADE NOT NULL,
  title       text        NOT NULL,
  start_at    timestamptz NOT NULL,
  end_at      timestamptz NOT NULL,
  created_by  uuid        REFERENCES public.shellers(id) ON DELETE SET NULL,
  created_at  timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.blockouts ENABLE ROW LEVEL SECURITY;

-- Anyone can read blockouts (they show on public calendars)
CREATE POLICY "Anyone can read blockouts"
  ON public.blockouts FOR SELECT
  USING (true);

-- Board only: insert
CREATE POLICY "Board can insert blockouts"
  ON public.blockouts FOR INSERT
  WITH CHECK (public.is_board_member());

-- Board only: update
CREATE POLICY "Board can update blockouts"
  ON public.blockouts FOR UPDATE
  USING (public.is_board_member());

-- Board only: delete
CREATE POLICY "Board can delete blockouts"
  ON public.blockouts FOR DELETE
  USING (public.is_board_member());
