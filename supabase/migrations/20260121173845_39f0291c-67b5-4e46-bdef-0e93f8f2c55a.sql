-- Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'founder', 'team_lead', 'employee');

-- Create user_roles table for role-based access control
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles table
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Add auth_user_id column to employees table to link with Supabase auth
ALTER TABLE public.employees 
ADD COLUMN auth_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL UNIQUE;

-- Update employees RLS to allow employees to see/edit their own data
CREATE POLICY "Employees can view their own record"
ON public.employees
FOR SELECT
USING (auth.uid() = auth_user_id OR auth.uid() IS NULL);

CREATE POLICY "Employees can update their own record"
ON public.employees
FOR UPDATE
USING (auth.uid() = auth_user_id);

-- Update daily_updates RLS for employee ownership
DROP POLICY IF EXISTS "Allow public access to daily_updates" ON public.daily_updates;

CREATE POLICY "Employees can view updates for their clients"
ON public.daily_updates
FOR SELECT
USING (
  auth.uid() IS NULL OR
  EXISTS (
    SELECT 1 FROM public.employees e
    JOIN public.clients c ON c.assigned_employee_id = e.id
    WHERE e.auth_user_id = auth.uid()
    AND c.id = daily_updates.client_id
  ) OR
  public.has_role(auth.uid(), 'admin') OR
  public.has_role(auth.uid(), 'founder')
);

CREATE POLICY "Employees can insert updates for their clients"
ON public.daily_updates
FOR INSERT
WITH CHECK (
  auth.uid() IS NULL OR
  EXISTS (
    SELECT 1 FROM public.employees e
    WHERE e.auth_user_id = auth.uid()
    AND e.id = daily_updates.employee_id
  ) OR
  public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Employees can update their own updates"
ON public.daily_updates
FOR UPDATE
USING (
  auth.uid() IS NULL OR
  EXISTS (
    SELECT 1 FROM public.employees e
    WHERE e.auth_user_id = auth.uid()
    AND e.id = daily_updates.employee_id
  ) OR
  public.has_role(auth.uid(), 'admin')
);