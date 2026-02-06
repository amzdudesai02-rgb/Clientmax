# Complete Vercel Setup Guide - Fix Deployment Failures

## Critical: Configure Vercel Dashboard Settings

The `vercel.json` file alone may not be enough. You **MUST** configure these settings in the Vercel Dashboard:

### Step-by-Step Dashboard Configuration

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Select your project: `amzdudes` (or the synced repo)

2. **Navigate to Settings → General**

3. **Configure Root Directory** (CRITICAL)
   - Find "Root Directory"
   - Click "Edit"
   - Set to: `frontend`
   - Click "Save"
   - ⚠️ **This is the most common cause of build failures!**

4. **Verify Build Settings** (should auto-detect after setting root directory)
   - **Build Command:** `npm run build` (should auto-detect)
   - **Output Directory:** `dist` (should auto-detect)
   - **Install Command:** `npm install` (should auto-detect)
   - **Framework Preset:** `Vite` (should auto-detect)

5. **Environment Variables** (CRITICAL)
   - Go to **Settings → Environment Variables**
   - Add these variables:
     ```
     VITE_SUPABASE_URL=https://nhbtywdbnivgpsjplgsm.supabase.co
     VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key-here
     ```
   - Select **all environments** (Production, Preview, Development)
   - Click **Save**

6. **Clear Build Cache**
   - Go to **Settings → General**
   - Scroll to "Clear Build Cache"
   - Click "Clear"
   - This removes any cached build artifacts that might cause issues

7. **Redeploy**
   - Go to **Deployments** tab
   - Click the three dots (⋯) on the latest deployment
   - Click **Redeploy**
   - Or wait for the next sync from GitHub

## Why This Fails

### Common Error: "Cannot find module" or "Command not found"
**Cause:** Root Directory not set to `frontend`
**Fix:** Set Root Directory = `frontend` in Vercel Settings

### Common Error: "supabaseUrl is required"
**Cause:** Missing environment variables
**Fix:** Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in Settings

### Common Error: Build command fails
**Cause:** Vercel trying to build from root instead of frontend directory
**Fix:** Set Root Directory = `frontend`

## Verify Configuration

After configuring, check:

1. **Root Directory** = `frontend` ✅
2. **Build Command** = `npm run build` ✅
3. **Output Directory** = `dist` ✅
4. **Environment Variables** = Both Supabase variables set ✅
5. **Build Cache** = Cleared ✅

## Testing

1. Make a small change and push to trigger sync
2. Check Vercel Dashboard → Deployments
3. Click on the new deployment
4. Check "Build Logs" tab
5. Should see successful build messages

## If Still Failing

1. **Check Build Logs:**
   - Go to Deployments → Click failed deployment → Build Logs
   - Look for specific error messages
   - Common errors:
     - "npm: command not found" → Root Directory issue
     - "Cannot find module" → Root Directory or dependencies issue
     - "supabaseUrl is required" → Environment variables missing

2. **Verify Repository Structure:**
   - The synced repo should have `frontend/` directory
   - `frontend/package.json` should exist
   - `frontend/src/` should exist

3. **Check Sync Workflow:**
   - Go to GitHub Actions
   - Check if sync workflow completed successfully
   - Verify files were synced correctly

## Quick Checklist

- [ ] Root Directory set to `frontend` in Vercel Dashboard
- [ ] Environment variables added (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`)
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `dist`
- [ ] Framework: Vite
- [ ] Build cache cleared
- [ ] Redeployed after changes

## Alternative: Use Vercel CLI

If dashboard configuration doesn't work, you can use Vercel CLI:

```bash
# Install Vercel CLI
npm i -g vercel

# Link to your project
vercel link

# Set root directory
vercel --cwd frontend

# Deploy
vercel --prod
```

But the dashboard configuration is recommended as it's persistent and easier to manage.
