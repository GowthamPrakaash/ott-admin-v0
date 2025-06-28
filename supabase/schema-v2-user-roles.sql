-- Version 2: User Roles and Invite Tokens Schema
-- This file adds user roles and invite tokens functionality

-- Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'editor', 'viewer')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    UNIQUE(user_id)
);

-- Create invite_tokens table
CREATE TABLE IF NOT EXISTS public.invite_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token TEXT NOT NULL UNIQUE,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'editor', 'viewer'))
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invite_tokens ENABLE ROW LEVEL SECURITY;

-- Create policies for user_roles
CREATE POLICY "Allow read access to all authenticated users" ON public.user_roles
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admin users to manage roles" ON public.user_roles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Create policies for invite_tokens
CREATE POLICY "Allow read access to all authenticated users" ON public.invite_tokens
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admin users to manage invite tokens" ON public.invite_tokens
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Create function to set initial admin user
CREATE OR REPLACE FUNCTION public.set_initial_admin()
RETURNS TRIGGER AS $$
BEGIN
    -- If this is the first user, make them an admin
    IF NOT EXISTS (SELECT 1 FROM public.user_roles) THEN
        INSERT INTO public.user_roles (user_id, role)
        VALUES (NEW.id, 'admin');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to set initial admin user
DROP TRIGGER IF EXISTS set_initial_admin_trigger ON auth.users;
CREATE TRIGGER set_initial_admin_trigger
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.set_initial_admin();
