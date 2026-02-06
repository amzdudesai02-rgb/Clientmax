# Vercel Environment Variables Setup

## Error: "supabaseUrl is required"

This error occurs because Supabase environment variables are not configured in Vercel.

## Required Environment Variables

Add these in your Vercel Dashboard:

### Steps:

1. Go to your Vercel Dashboard
2. Select your project: **amzdudes**
3. Go to **Settings** → **Environment Variables**
4. Click **Add New**
5. Add each variable:

### Variable 1:
- **Key:** `VITE_SUPABASE_URL`
- **Value:** `https://nhbtywdbnivgpsjplgsm.supabase.co`
- **Environment:** Select all (Production, Preview, Development)
- Click **Save**

### Variable 2:
- **Key:** `VITE_SUPABASE_PUBLISHABLE_KEY`
- **Value:** Your Supabase anon/public key
- **Environment:** Select all (Production, Preview, Development)
- Click **Save**

## How to Get Your Supabase Keys:

1. Go to: https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → Use for `VITE_SUPABASE_URL`
   - **anon public** key → Use for `VITE_SUPABASE_PUBLISHABLE_KEY`

## After Adding Variables:

1. **Redeploy** your project:
   - Go to **Deployments** tab
   - Click the three dots (⋯) on the latest deployment
   - Click **Redeploy**
   - Or push a new commit to trigger auto-deploy

2. The app should now load correctly with Supabase connection

## Important Notes:

- ✅ Environment variables are encrypted and secure
- ✅ They're only available at build time and runtime
- ✅ Changes require a redeploy to take effect
- ⚠️ Never commit `.env` files with real keys to Git

