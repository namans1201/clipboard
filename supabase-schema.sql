-- Clipboard Easy Database Setup
-- Run this in your Supabase SQL Editor

-- Create groups table
CREATE TABLE IF NOT EXISTS public.groups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create clips table
CREATE TABLE IF NOT EXISTS public.clips (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    title TEXT,
    is_pinned BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    group_id UUID REFERENCES public.groups(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_clips_user_id ON public.clips(user_id);
CREATE INDEX IF NOT EXISTS idx_clips_group_id ON public.clips(group_id);
CREATE INDEX IF NOT EXISTS idx_clips_is_deleted ON public.clips(is_deleted);
CREATE INDEX IF NOT EXISTS idx_clips_is_pinned ON public.clips(is_pinned);
CREATE INDEX IF NOT EXISTS idx_groups_user_id ON public.groups(user_id);

-- Enable Row Level Security
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clips ENABLE ROW LEVEL SECURITY;

-- RLS Policies for groups table
CREATE POLICY "Users can view their own groups"
    ON public.groups FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own groups"
    ON public.groups FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own groups"
    ON public.groups FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own groups"
    ON public.groups FOR DELETE
    USING (auth.uid() = user_id);

-- RLS Policies for clips table
CREATE POLICY "Users can view their own clips"
    ON public.clips FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own clips"
    ON public.clips FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own clips"
    ON public.clips FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own clips"
    ON public.clips FOR DELETE
    USING (auth.uid() = user_id);

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public;

-- Trigger for auto-updating updated_at on clips
DROP TRIGGER IF EXISTS set_updated_at ON public.clips;
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.clips
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
