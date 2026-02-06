-- Add auth_user_id to clients table for client login
ALTER TABLE public.clients 
ADD COLUMN auth_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX idx_clients_auth_user_id ON public.clients(auth_user_id);

-- Add 'client' role to the app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'client';