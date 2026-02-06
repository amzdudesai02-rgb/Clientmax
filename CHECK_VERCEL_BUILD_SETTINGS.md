# Check Vercel Build Settings After Root Directory is Set

## ✅ Root Directory is Set Correctly
You have Root Directory = `frontend` ✅

**IMPORTANT:** Click **"Save"** button to save this setting!

## Next: Verify Build Settings

After saving Root Directory, check these settings:

### Step 1: Check Build Command

1. In the same **Build and Deployment** settings page
2. Find **"Build Command"**
3. It should be: `npm run build`
4. **It should NOT have `--prefix frontend`**
5. If it has `--prefix frontend`, remove it and save

### Step 2: Check Output Directory

1. Find **"Output Directory"**
2. It should be: `dist`
3. **It should NOT be `frontend/dist`**
4. If it's `frontend/dist`, change it to `dist` and save

### Step 3: Check Install Command

1. Find **"Install Command"**
2. It should be: `npm install`
3. **It should NOT have `--prefix frontend`**
4. If it has `--prefix frontend`, remove it and save

### Step 4: Check Framework Preset

1. Find **"Framework Preset"**
2. It should be: `Vite`
3. If not, select `Vite` and save

## Why This Matters

When Root Directory is `frontend`:
- Vercel **changes directory** to `frontend` first
- Then runs commands from **inside** `frontend/`
- So commands should **NOT** have `--prefix frontend`
- Output Directory should be `dist` (relative to `frontend/`)

## After Fixing Settings

1. **Click "Save"** on Root Directory (if you haven't already)
2. **Save** any other changes you made
3. Go to **Deployments** tab
4. Click three dots (⋯) on latest deployment
5. Click **Redeploy**
6. Wait for deployment to complete

## Check Build Logs

After redeploying, check Build Logs:

1. Click on the deployment
2. Go to **Build Logs** tab
3. Look for:
   - ✅ "Build completed successfully"
   - ❌ Any error messages
4. Common errors:
   - "npm: command not found" → Build Command issue
   - "Cannot find module" → Dependencies issue
   - "Output directory not found" → Output Directory issue
   - "supabaseUrl is required" → Environment variables missing

## Quick Checklist

- [ ] Root Directory = `frontend` ✅ (You have this)
- [ ] Clicked "Save" on Root Directory
- [ ] Build Command = `npm run build` (no `--prefix`)
- [ ] Output Directory = `dist` (not `frontend/dist`)
- [ ] Install Command = `npm install` (no `--prefix`)
- [ ] Framework = `Vite`
- [ ] Environment variables set
- [ ] Redeployed after changes
