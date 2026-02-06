-- ============================================
-- CEO Account Setup SQL Script
-- Run this in Supabase SQL Editor to set up the CEO account
-- ============================================
-- 
-- This script:
-- 1. Creates/updates the employee record
-- 2. Note: Auth user and password must be created via scripts/create-ceo-user.mjs
--    (Supabase doesn't allow direct password insertion via SQL for security)
--
-- After running this SQL, run: node scripts/create-ceo-user.mjs
-- ============================================

-- Ensure the employee record exists with CEO role
INSERT INTO public.employees (name, email, role)
VALUES ('Junaid', 'junaid@amzdudes.com', 'CEO')
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role;

-- Verify the record was created/updated
SELECT 
  id,
  name,
  email,
  role,
  auth_user_id,
  created_at
FROM public.employees
WHERE email = 'junaid@amzdudes.com';

-- ============================================
-- Next Steps:
-- ============================================
-- 1. Run this SQL script in Supabase SQL Editor
-- 2. Then run: node scripts/create-ceo-user.mjs
--    This will create the auth user with password 'admin123'
--    and link it to the employee record above
-- ============================================
