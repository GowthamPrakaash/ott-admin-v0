-- Version 1: Create all basic tables
-- This file creates tables for movies, series, episodes, genres

-- Create movies table
CREATE TABLE IF NOT EXISTS public.movies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    meta_title TEXT,
    meta_description TEXT,
    duration INTEGER NOT NULL,
    release_year INTEGER NOT NULL,
    genre TEXT NOT NULL,
    video_id TEXT NOT NULL,
    poster_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create series table
CREATE TABLE IF NOT EXISTS public.series (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    meta_title TEXT,
    meta_description TEXT,
    release_year INTEGER NOT NULL,
    genre TEXT NOT NULL,
    poster_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create episodes table
CREATE TABLE IF NOT EXISTS public.episodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    series_id UUID NOT NULL REFERENCES public.series(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    meta_title TEXT,
    meta_description TEXT,
    season_number INTEGER NOT NULL,
    episode_number INTEGER NOT NULL,
    duration INTEGER NOT NULL,
    video_id TEXT NOT NULL,
    poster_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create genres table
CREATE TABLE IF NOT EXISTS public.genres (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_movies_created_at ON public.movies(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_series_created_at ON public.series(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_episodes_series_id ON public.episodes(series_id);
CREATE INDEX IF NOT EXISTS idx_episodes_season_episode ON public.episodes(series_id, season_number, episode_number);
CREATE INDEX IF NOT EXISTS idx_genres_name ON public.genres(name);

-- Set up Row Level Security (RLS)
ALTER TABLE public.movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.series ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.episodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genres ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Allow full access to authenticated users" ON public.movies
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow full access to authenticated users" ON public.series
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow full access to authenticated users" ON public.episodes
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow full access to authenticated users" ON public.genres
    FOR ALL USING (auth.role() = 'authenticated');

-- Insert some default genres
INSERT INTO public.genres (name, description)
VALUES 
    ('Action', 'Action films are characterized by high energy, big-budget physical stunts and chases, possibly with rescues, battles, fights, escapes, destructive crises, etc.'),
    ('Comedy', 'Comedy films are designed to make the audience laugh through amusement and most often work by exaggerating characteristics for humorous effect.'),
    ('Drama', 'Drama films are serious presentations or stories with settings or life situations that portray realistic characters in conflict with either themselves, others, or forces of nature.'),
    ('Horror', 'Horror films are designed to frighten and to invoke our hidden worst fears, often in a terrifying, shocking finale.'),
    ('Romance', 'Romance films are romantic love stories recorded in visual media that focus on passion, emotion, and the affectionate romantic involvement of the main characters.'),
    ('Science Fiction', 'Science fiction films are speculative fictions based on current or projected science and technology.'),
    ('Thriller', 'Thriller films are characterized by fast pacing, frequent action, and resourceful heroes who must thwart the plans of more-powerful and better-equipped villains.'),
    ('Documentary', 'Documentary films are non-fictional motion pictures intended to document reality, primarily for the purposes of instruction, education, or maintaining a historical record.'),
    ('Animation', 'Animation is a method in which figures are manipulated to appear as moving images.'),
    ('Fantasy', 'Fantasy films are films that belong to the fantasy genre with fantastic themes, usually magic, supernatural events, mythology, folklore, or exotic fantasy worlds.')
ON CONFLICT (name) DO NOTHING;
