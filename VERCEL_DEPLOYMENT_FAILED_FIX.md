# Fix Vercel Deployment Failure

## Problem
Vercel deployment is failing even though `vercel.json` is configured correctly.

## Root Cause
Vercel might be ignoring `vercel.json` if Root Directory isn't set in Dashboard settings. The `--prefix frontend` commands won't work if Vercel doesn't know where the frontend is.

## Solution: Configure Vercel Dashboard Settings

### Step 1: Check Deployment Error Details

1. Click the **"Details"** link in the error popup (or go to Vercel Dashboard)
2. Go to **Deployments** → Click on failed deployment
3. Check **Build Logs** tab
4. Look for specific error messages:
   - "npm: command not found" → Root Directory issue
   - "Cannot find module" → Root Directory or dependencies issue
   - "supabaseUrl is required" → Environment variables missing

### Step 2: Configure Root Directory (CRITICAL)

1. Go to: https://vercel.com/dashboard
2. Select project: `amzdudes`
3. Go to: **Settings → General**
4. Find **"Root Directory"**
5. Click **"Edit"**
6. Set to: `frontend`
7. Click **"Save"**
8. ⚠️ **This is the #1 cause of deployment failures!**

### Step 3: Verify Build Settings

After setting Root Directory, verify these auto-detected settings:

- **Build Command:** `npm run build` (should NOT have `--prefix`)
- **Output Directory:** `dist` (should NOT have `frontend/`)
- **Install Command:** `npm install` (should NOT have `--prefix`)
- **Framework Preset:** `Vite`

**Important:** When Root Directory is `frontend`, Vercel runs commands FROM the frontend directory, so you don't need `--prefix`.

### Step 4: Update vercel.json (Optional)

If Root Directory is set to `frontend`, you can simplify `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/((?!.*\\.).*)$",
      "destination": "/index.html",
      "has": [
        {
          "type": "header",
          "key": "accept",
          "value": "text/html"
        }
      ]
    }
  ],
  "headers": [
    {
      "source": "/(.*\\.(png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|css|js|json|xml|txt|webp))",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=3600, must-revalidate"
        },
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        }
      ]
    },
    {
      "source": "/index.html",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-cache, no-store, must-revalidate"
        }
      ]
    }
  ]
}
```

### Step 5: Check Environment Variables

1. Go to: **Settings → Environment Variables**
2. Ensure these are set:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
3. If missing, add them and select **all environments**

### Step 6: Clear Build Cache and Redeploy

1. Go to: **Settings → Caches**
2. Click: **Clear Build Cache**
3. Go to: **Deployments**
4. Click three dots (⋯) on latest deployment
5. Click: **Redeploy**
6. Wait for deployment to complete

## Quick Fix Checklist

- [ ] Root Directory set to `frontend` in Vercel Dashboard
- [ ] Build Command: `npm run build` (no `--prefix`)
- [ ] Output Directory: `dist` (no `frontend/`)
- [ ] Environment variables configured
- [ ] Build cache cleared
- [ ] Redeployed

## Common Errors and Fixes

### Error: "npm: command not found"
**Fix:** Set Root Directory to `frontend` in Dashboard

### Error: "Cannot find module 'vite'"
**Fix:** Root Directory not set, or dependencies not installed

### Error: "supabaseUrl is required"
**Fix:** Add environment variables in Settings

### Error: "Build output directory not found"
**Fix:** Output Directory should be `dist` (not `frontend/dist`) when Root Directory is `frontend`

## After Fixing

1. Check Build Logs for success
2. Deployment should show "Ready"
3. Test the site (clear browser cache first)
4. Should see black theme login page
