# Render Backend Deployment - Environment Variables

## ⚠️ Important: Don't Upload .env File

**Render doesn't use .env files.** Instead, you add environment variables directly in the Render Dashboard.

## Environment Variables to Add in Render

When deploying your backend to Render, add these environment variables in the **Environment** section:

### Required Variables:

1. **SUPABASE_URL**
   - Value: `https://nhbtywdbnivgpsjplgsm.supabase.co`
   - Description: Your Supabase project URL

2. **SUPABASE_SERVICE_ROLE_KEY**
   - Value: Your Supabase Service Role Key (get from Supabase Dashboard)
   - Description: Service role key for backend operations (KEEP SECRET!)
   - ⚠️ **Important**: This is different from the anon key. Get it from Supabase Dashboard → Settings → API → `service_role` key

### Optional Variables (Render sets these automatically):

- `PORT` - Render automatically sets this (don't add manually)
- `PYTHON_VERSION` - Set to `3.11` or `3.12` in Build Settings

## How to Add Environment Variables in Render:

1. Go to your Render Dashboard
2. Select your Web Service (backend)
3. Click on **Environment** tab
4. Click **Add Environment Variable**
5. Add each variable:
   - **Key**: `SUPABASE_URL`
   - **Value**: `https://nhbtywdbnivgpsjplgsm.supabase.co`
6. Click **Add Environment Variable** again
7. Add:
   - **Key**: `SUPABASE_SERVICE_ROLE_KEY`
   - **Value**: Your service role key from Supabase

## How to Get Your Supabase Service Role Key:

1. Go to: https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** → **API**
4. Scroll down to **Project API keys**
5. Find **`service_role`** key (NOT the `anon` key)
6. Click **Reveal** and copy it
7. ⚠️ **Keep this secret!** Never expose it in frontend code

## Render Build Settings:

Make sure these are set in Render:

- **Root Directory**: `backend`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- **Environment**: `Python 3`

## Example Environment Variables in Render:

```
SUPABASE_URL=https://nhbtywdbnivgpsjplgsm.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5oYnR5d2Ribml2Z3BzanBsZ3NtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNTAyMzQ1MCwiZXhwIjoyMDUwNTk5NDUwfQ.your-service-role-key-here
```

## After Adding Variables:

1. Save the environment variables
2. Render will automatically redeploy
3. Check the logs to ensure the backend starts correctly
4. Test the API endpoint: `https://your-render-app.onrender.com/api/health`

## Security Notes:

- ✅ Service Role Key is safe to use in backend (Render)
- ❌ Never use Service Role Key in frontend code
- ✅ Anon Key is safe for frontend (Vercel)
- ✅ Environment variables in Render are encrypted and secure

