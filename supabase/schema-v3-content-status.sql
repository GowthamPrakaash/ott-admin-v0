-- Version 3: Add status field to content tables
-- This file adds a status field to movies, series, and episodes tables

-- Add status column to movies table
ALTER TABLE public.movies 
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'draft' 
CHECK (status IN ('draft', 'published'));

-- Add status column to series table
ALTER TABLE public.series 
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'draft' 
CHECK (status IN ('draft', 'published'));

-- Add status column to episodes table
ALTER TABLE public.episodes 
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'draft' 
CHECK (status IN ('draft', 'published'));

-- Create indexes for filtering by status
CREATE INDEX IF NOT EXISTS idx_movies_status ON public.movies(status);
CREATE INDEX IF NOT EXISTS idx_series_status ON public.series(status);
CREATE INDEX IF NOT EXISTS idx_episodes_status ON public.episodes(status);
