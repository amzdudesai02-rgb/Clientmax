# Complete Environment Variables Setup Guide

## 📋 Overview

This guide shows you exactly which environment variables to add in **Vercel** (frontend) and **Render** (backend).

---

## 🎨 VERCEL - Frontend Environment Variables

### Where to Add:
1. Go to **Vercel Dashboard** → Your project (`amzdudes`)
2. Click **Settings** → **Environment Variables**
3. Click **Add New**

### Required Variables:

#### 1. VITE_SUPABASE_URL
- **Key:** `VITE_SUPABASE_URL`
- **Value:** `https://nhbtywdbnivgpsjplgsm.supabase.co`
- **Environment:** ✅ Production, ✅ Preview, ✅ Development
- **Click Save**

#### 2. VITE_SUPABASE_PUBLISHABLE_KEY
- **Key:** `VITE_SUPABASE_PUBLISHABLE_KEY`
- **Value:** Your Supabase `anon` public key
  - Get it from: Supabase Dashboard → Settings → API → `anon public` key
- **Environment:** ✅ Production, ✅ Preview, ✅ Development
- **Click Save**

#### 3. VITE_API_URL (Optional - for backend API)
- **Key:** `VITE_API_URL`
- **Value:** Your Render backend URL (e.g., `https://your-app.onrender.com`)
- **Environment:** ✅ Production, ✅ Preview, ✅ Development
- **Click Save**

### After Adding:
1. **Redeploy** your project:
   - Go to **Deployments** tab
   - Click **⋯** (three dots) on latest deployment
   - Click **Redeploy**

---

## 🐍 RENDER - Backend Environment Variables

### Where to Add:
1. Go to **Render Dashboard** → Your Web Service (backend)
2. Click **Environment** tab
3. Click **Add Environment Variable**

### Required Variables:

#### 1. SUPABASE_URL
- **Key:** `SUPABASE_URL`
- **Value:** `https://nhbtywdbnivgpsjplgsm.supabase.co`
- **Click Save**

#### 2. SUPABASE_SERVICE_ROLE_KEY
- **Key:** `SUPABASE_SERVICE_ROLE_KEY`
- **Value:** Your Supabase `service_role` key
  - Get it from: Supabase Dashboard → Settings → API → `service_role` key
  - ⚠️ **IMPORTANT:** This is different from the anon key!
- **Click Save**

#### 3. PORT (Optional - Render sets this automatically)
- **Key:** `PORT`
- **Value:** Leave empty (Render sets this automatically)
- Or manually set: `8000`

### After Adding:
- Render will **automatically redeploy** when you save environment variables

---

## 🔑 How to Get Your Supabase Keys:

### Step-by-Step:

1. **Go to Supabase Dashboard:**
   - Visit: https://supabase.com/dashboard
   - Select your project

2. **Navigate to API Settings:**
   - Click **Settings** (gear icon) in the left sidebar
   - Click **API**

3. **Find Your Keys:**

   **For Vercel (Frontend):**
   - **Project URL** → Copy this → Use for `VITE_SUPABASE_URL`
   - **anon public** key → Copy this → Use for `VITE_SUPABASE_PUBLISHABLE_KEY`
   
   **For Render (Backend):**
   - **Project URL** → Copy this → Use for `SUPABASE_URL`
   - **service_role** key → Click "Reveal" → Copy → Use for `SUPABASE_SERVICE_ROLE_KEY`

---

## 📝 Quick Reference Table

| Platform | Variable Name | Value Source | Where to Get |
|----------|--------------|-------------|--------------|
| **Vercel** | `VITE_SUPABASE_URL` | Supabase Dashboard → Settings → API → Project URL | Frontend |
| **Vercel** | `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase Dashboard → Settings → API → anon public key | Frontend |
| **Vercel** | `VITE_API_URL` | Your Render backend URL | Frontend (optional) |
| **Render** | `SUPABASE_URL` | Supabase Dashboard → Settings → API → Project URL | Backend |
| **Render** | `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Settings → API → service_role key | Backend |

---

## ✅ Verification Checklist

### Vercel:
- [ ] `VITE_SUPABASE_URL` added
- [ ] `VITE_SUPABASE_PUBLISHABLE_KEY` added
- [ ] `VITE_API_URL` added (optional)
- [ ] All variables set for Production, Preview, Development
- [ ] Project redeployed

### Render:
- [ ] `SUPABASE_URL` added
- [ ] `SUPABASE_SERVICE_ROLE_KEY` added
- [ ] Service automatically redeployed

---

## 🚨 Important Security Notes:

### Frontend (Vercel):
- ✅ `anon` key is **safe** to expose in client-side code
- ✅ These keys are public and meant for frontend use
- ✅ They have limited permissions (RLS policies apply)

### Backend (Render):
- ⚠️ `service_role` key is **SECRET** - never expose in frontend!
- ⚠️ This key has full database access
- ⚠️ Only use in server-side code (Render backend)
- ⚠️ Never commit to Git or expose publicly

---

## 🔧 Troubleshooting

### Error: "supabaseUrl is required"
- **Cause:** `VITE_SUPABASE_URL` not set in Vercel
- **Fix:** Add the variable and redeploy

### Error: "Invalid API key"
- **Cause:** Wrong key type (using service_role in frontend or vice versa)
- **Fix:** Use `anon` key for Vercel, `service_role` for Render

### Backend not connecting to Supabase
- **Cause:** `SUPABASE_SERVICE_ROLE_KEY` not set in Render
- **Fix:** Add the variable in Render Environment tab

---

## 📞 Need Help?

If you encounter issues:
1. Check that all variables are spelled correctly
2. Verify you're using the right key type (anon vs service_role)
3. Ensure you've redeployed after adding variables
4. Check build logs for specific error messages

