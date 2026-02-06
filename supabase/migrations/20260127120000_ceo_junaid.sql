-- CEO user: Junaid (email used for login; auth user and password are created via scripts/create-ceo-user.mjs)
-- Run this migration first, then run: node scripts/create-ceo-user.mjs
-- Temporary password is set by the script to: admin123 (user should change after first login)

INSERT INTO public.employees (name, email, role)
VALUES ('Junaid', 'junaid@amzdudes.com', 'CEO')
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role;
