# Environment Variables Setup

## Create .env file

Create a `.env` file in the root of your project with the following content:

```env
# Supabase Configuration
# Get these values from your Supabase project dashboard: Settings → API

# Your Supabase Project URL
VITE_SUPABASE_URL=https://your-project-id.supabase.co

# Your Supabase Anon/Public Key
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-public-key-here
```

## How to get your Supabase credentials:

1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → Use for `VITE_SUPABASE_URL`
   - **anon public** key → Use for `VITE_SUPABASE_PUBLISHABLE_KEY`

## Example .env file:

```env
VITE_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjIzOTAyMiwiZXhwIjoxOTMxODE1MDIyfQ.example-key-here
```

## Important Notes:

- ✅ The `.env` file is already in `.gitignore` (won't be committed to Git)
- ✅ Never commit your actual `.env` file with real credentials
- ✅ The `anon` key is safe to use in client-side code
- ⚠️ Keep your `service_role` key secret (only for server-side)

## After creating .env:

1. Restart your development server: `npm run dev`
2. The app will automatically load these environment variables
3. Your Supabase connection will be configured

