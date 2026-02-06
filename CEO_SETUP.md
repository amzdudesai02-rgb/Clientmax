# CEO Access Setup

Only users with **role = 'CEO'** in the `employees` table can access the internal app (dashboard, clients, settings, etc.). Clients still sign in and use the client portal only.

## CEO user: Junaid

- **Login email:** `junaid@amzdudes.com`
- **Temporary password:** `admin123` (must be changed after first login via **Settings → Security**)

## Quick Setup (Recommended)

**One command to set up everything:**

```bash
node scripts/setup-ceo-complete.mjs
```

This script will:
- Create/update the employee record in the database
- Create the auth user with password `admin123`
- Link them together
- Save everything to the database

## Manual Setup (Alternative)

### Option 1: SQL + Script

1. **Run SQL in Supabase Dashboard → SQL Editor:**
   ```sql
   -- Run scripts/setup-ceo-account.sql
   INSERT INTO public.employees (name, email, role)
   VALUES ('Junaid', 'junaid@amzdudes.com', 'CEO')
   ON CONFLICT (email) DO UPDATE SET
     name = EXCLUDED.name,
     role = EXCLUDED.role;
   ```

2. **Then run the script:**
   ```bash
   node scripts/create-ceo-user.mjs
   ```

### Option 2: Migration + Script

1. **Apply the migration:**
   ```bash
   # If using Supabase CLI
   supabase db push
   
   # Or run in Supabase Dashboard → SQL Editor:
   # supabase/migrations/20260127120000_ceo_junaid.sql
   ```

2. **Create auth user and link:**
   ```bash
   node scripts/create-ceo-user.mjs
   ```

This creates the Supabase Auth user with the temporary password and sets `employees.auth_user_id` for the CEO row.

## Troubleshooting: Fix Employee Record

If you see "Account Setup Issue" error after logging in, run the diagnostic/fix script:

```bash
node scripts/fix-ceo-employee.mjs
```

This script will:
- Check if the auth user exists
- Check if the employee record exists
- Create the employee record if missing
- Link the employee record to the auth user
- Verify the role is set to "CEO"

## 3. First login

1. Open the app and choose **Employee** on the login screen.
2. Sign in with `junaid@amzdudes.com` / `admin123`.
3. Go to **Settings → Security** and change the password.

## Notes

- Non-CEO employees who sign in are redirected to the login page with a “Access restricted to CEO” message and are signed out.
- Clients are unchanged: they sign in as **Client** and only see the client portal.
