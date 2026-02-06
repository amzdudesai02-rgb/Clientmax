# Environment Variables Guide - All .env Files

## 📁 You Need 2 .env Files:

### 1. Frontend .env File
**Location:** `frontend/.env`

**For:** Vercel deployment and local development

**Variables:**
```env
VITE_SUPABASE_URL=https://nhbtywdbnivgpsjplgsm.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-public-key-here
VITE_API_URL=http://localhost:8000
```

**How to create:**
1. Copy `frontend/.env.example` to `frontend/.env`
2. Replace `your-anon-public-key-here` with your actual Supabase anon key
3. Update `VITE_API_URL` to your Render backend URL after deployment

**Where to get values:**
- Supabase Dashboard → Settings → API → `anon public` key

---

### 2. Backend .env File
**Location:** `backend/.env`

**For:** Local development only (Render uses Dashboard environment variables)

**Variables:**
```env
SUPABASE_URL=https://nhbtywdbnivgpsjplgsm.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
API_HOST=0.0.0.0
API_PORT=8000
```

**How to create:**
1. Copy `backend/.env.example` to `backend/.env`
2. Replace `your-service-role-key-here` with your actual Supabase service_role key

**Where to get values:**
- Supabase Dashboard → Settings → API → `service_role` key (NOT anon key!)

---

## 🚀 For Deployments:

### Vercel (Frontend):
- Add environment variables in Vercel Dashboard:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_PUBLISHABLE_KEY`
  - `VITE_API_URL` (your Render backend URL)

### Render (Backend):
- Add environment variables in Render Dashboard:
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `PORT` (automatically set by Render)

---

## 📝 Quick Setup:

### Local Development:

1. **Frontend:**
   ```bash
   cd frontend
   cp .env.example .env
   # Edit .env with your Supabase credentials
   ```

2. **Backend:**
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your Supabase service_role key
   ```

---

## 🔑 Key Differences:

| Variable | Frontend | Backend |
|----------|----------|---------|
| **Supabase Key** | `anon` (public) | `service_role` (secret) |
| **Purpose** | Client-side access | Server-side operations |
| **Security** | Safe to expose | Keep secret! |
| **Where** | Vercel Dashboard | Render Dashboard |

---

## ⚠️ Important Notes:

1. **Never commit .env files** - They're in `.gitignore`
2. **Use .env.example as template** - Copy and fill in values
3. **Service Role Key is SECRET** - Never use in frontend
4. **Anon Key is PUBLIC** - Safe for frontend code

---

## 📍 File Locations:

```
amzdudes-main/
├── frontend/
│   ├── .env          ← Create this (copy from .env.example)
│   └── .env.example  ← Template file
├── backend/
│   ├── .env          ← Create this (copy from .env.example)
│   └── .env.example  ← Template file
└── .gitignore        ← .env files are ignored
```

