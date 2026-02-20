-- Allow forcing password change after first sign-in (e.g. when using default password)
ALTER TABLE public.user_roles
ADD COLUMN IF NOT EXISTS must_change_password boolean NOT NULL DEFAULT false;

-- Users may set their own must_change_password to false (after they change password)
CREATE POLICY "Users can clear own must_change_password"
ON public.user_roles
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow insert with must_change_password (for admin creating accounts)
-- Already covered by "Admins can manage all roles" for insert.
