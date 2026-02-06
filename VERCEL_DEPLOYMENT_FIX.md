# Vercel Deployment Fix Guide

## Common Vercel Deployment Issues

### Issue: Build Fails with "Command not found" or "npm: command not found"

**Solution:** Configure Vercel Project Settings:

1. Go to Vercel Dashboard → Your Project → Settings → General
2. Set **Root Directory** to: `frontend`
3. Set **Build Command** to: `npm run build`
4. Set **Output Directory** to: `dist`
5. Set **Install Command** to: `npm install`
6. Set **Framework Preset** to: `Vite`

### Issue: Build Fails with Missing Environment Variables

**Solution:** Add Environment Variables in Vercel:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add these variables:
   - `VITE_SUPABASE_URL` = Your Supabase project URL
   - `VITE_SUPABASE_PUBLISHABLE_KEY` = Your Supabase anon key
3. Select **all environments** (Production, Preview, Development)
4. Click **Save**
5. **Redeploy** the project

### Issue: Build Fails with "Cannot find module" or Dependency Errors

**Solution:** Ensure package.json exists and dependencies are correct:

1. Check that `frontend/package.json` exists
2. Verify all dependencies are listed
3. Try clearing Vercel build cache:
   - Go to Settings → General
   - Scroll to "Clear Build Cache"
   - Click "Clear"

### Issue: Sync Workflow Creates Orphaned Commits

**Solution:** Already fixed in `sync-to-vercel-repo.yml`:
- Workflow now creates proper branch before committing
- Uses explicit branch reference for push

### Manual Vercel Configuration (If vercel.json doesn't work)

If the `vercel.json` file isn't being recognized, configure manually:

1. **Root Directory:** `frontend`
2. **Build Command:** `npm run build`
3. **Output Directory:** `dist`
4. **Install Command:** `npm install`
5. **Framework:** Vite

### Check Deployment Logs

1. Go to Vercel Dashboard → Deployments
2. Click on the failed deployment
3. Check the "Build Logs" tab for specific errors
4. Common errors:
   - Missing environment variables → Add them in Settings
   - Build command fails → Check Root Directory setting
   - Dependencies not found → Verify package.json exists

### Quick Fix Checklist

- [ ] Root Directory set to `frontend` in Vercel Settings
- [ ] Environment variables added (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`)
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `dist`
- [ ] Framework: Vite
- [ ] Clear build cache if needed
- [ ] Redeploy after making changes
