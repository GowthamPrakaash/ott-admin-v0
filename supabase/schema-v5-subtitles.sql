-- Add subtitles column to movies table
ALTER TABLE public.movies
ADD COLUMN subtitles JSONB DEFAULT '[]'::jsonb;

-- Add subtitles column to episodes table
ALTER TABLE public.episodes
ADD COLUMN subtitles JSONB DEFAULT '[]'::jsonb;

-- Update existing rows to have empty array for subtitles
UPDATE public.movies SET subtitles = '[]'::jsonb WHERE subtitles IS NULL;
UPDATE public.episodes SET subtitles = '[]'::jsonb WHERE subtitles IS NULL;

-- Add comment to explain the structure
COMMENT ON COLUMN public.movies.subtitles IS 'Array of subtitle objects with language, label, and src properties';
COMMENT ON COLUMN public.episodes.subtitles IS 'Array of subtitle objects with language, label, and src properties';
