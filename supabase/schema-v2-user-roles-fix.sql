-- Version 2.1: Fixed User Roles and Invite Tokens Schema
-- This file fixes the infinite recursion in the user_roles policy

-- First, drop the problematic policies if they exist
DROP POLICY IF EXISTS "Allow admin users to manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Allow admin users to manage invite tokens" ON public.invite_tokens;

-- Create a more permissive policy for user_roles
-- This allows all authenticated users to read user_roles
CREATE POLICY "Allow read access to all authenticated users" ON public.user_roles
    FOR SELECT USING (auth.role() = 'authenticated');

-- This allows users to manage their own role
CREATE POLICY "Allow users to manage their own role" ON public.user_roles
    FOR ALL USING (auth.uid() = user_id);

-- For the first user (admin), we'll rely on the trigger function to set their role
-- For subsequent users, we'll use the invite token system

-- Create policies for invite_tokens
-- Allow all authenticated users to read invite tokens
CREATE POLICY "Allow read access to all authenticated users" ON public.invite_tokens
    FOR SELECT USING (auth.role() = 'authenticated');

-- Allow users to manage invite tokens they created
CREATE POLICY "Allow users to manage their own invite tokens" ON public.invite_tokens
    FOR ALL USING (auth.uid() = created_by);

-- Create a special policy to allow users to update invite tokens when they use them
CREATE POLICY "Allow users to mark tokens as used" ON public.invite_tokens
    FOR UPDATE USING (true)
    WITH CHECK (used_by = auth.uid() AND used_at IS NOT NULL);
