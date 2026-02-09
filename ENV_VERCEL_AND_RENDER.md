# Environment Variables: Vercel (Frontend) & Render (Backend)

Use this guide to add environment variables in **Vercel** (frontend) and **Render** (backend).

---

## 1. Vercel – Frontend (ClientMax app)

**Where:** Vercel Dashboard → Your Project → **Settings** → **Environment Variables**

| Variable | Description | Example | Environments |
|----------|-------------|---------|--------------|
| `VITE_SUPABASE_URL` | Supabase project URL | `https://xxxxx.supabase.co` | Production, Preview, Development |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase **anon** (public) key | `eyJhbGc...` | Production, Preview, Development |
| `VITE_API_URL` | Backend API base URL (Render) | `https://clientmax.onrender.com` or `https://api.clientmax.amzdudes.io` | Production, Preview, Development |

**How to add in Vercel:**
1. Open your project → **Settings** → **Environment Variables**.
2. Click **Add New** (or **Add**).
3. **Key:** e.g. `VITE_API_URL`
4. **Value:** your backend URL (no trailing slash), e.g. `https://clientmax.onrender.com`.
5. Select **Production**, **Preview**, and **Development** if you want the same value everywhere.
6. Click **Save**.
7. Repeat for the other two variables if not already set.

**Important:** In Vite, only variables starting with `VITE_` are exposed to the browser. Do **not** put secrets that must stay server-only in the frontend (e.g. no `SUPABASE_SERVICE_ROLE_KEY` in Vercel).

After changing env vars, **redeploy** the project (Deployments → ⋮ on latest → Redeploy) so the new values are used.

---

## 2. Render – Backend (API service)

**Where:** Render Dashboard → Your Web Service (e.g. **clientmax**) → **Environment** tab

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `SUPABASE_URL` | Supabase project URL | `https://xxxxx.supabase.co` | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase **service_role** key (secret) | `eyJhbGc...` | Yes |
| `RENDER_SERVICE_URL` | Public URL of this Render service (for keep-alive) | `https://clientmax.onrender.com` | Optional but recommended |
| `KEEP_ALIVE_ENABLED` | Enable self-ping to reduce free-tier sleep | `true` | Optional |
| `KEEP_ALIVE_INTERVAL` | Seconds between pings | `300` | Optional |

**How to add in Render:**
1. Open **Render Dashboard** → select your **Web Service** (backend).
2. Go to the **Environment** tab.
3. Click **Add Environment Variable**.
4. **Key:** e.g. `SUPABASE_URL`
5. **Value:** e.g. `https://nhbtywdbnivgpsjplgsm.supabase.co` (your real Supabase URL).
6. Add **SUPABASE_SERVICE_ROLE_KEY** the same way (get it from Supabase Dashboard → Settings → API → `service_role` key).
7. Optionally add **RENDER_SERVICE_URL** = `https://clientmax.onrender.com` (or your custom domain when it works).

**Important:** Use the **service_role** key only in the backend (Render). Never add it to Vercel or any frontend.

After saving, Render will redeploy the service automatically.

---

## 3. Quick reference

| Use case | Where | Variables |
|----------|--------|-----------|
| Frontend (Vite) | **Vercel** | `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_API_URL` |
| Backend (FastAPI) | **Render** | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `RENDER_SERVICE_URL` (optional) |

**Get Supabase values:**  
Supabase Dashboard → **Settings** → **API**  
- **Project URL** → `VITE_SUPABASE_URL` (Vercel) and `SUPABASE_URL` (Render)  
- **anon public** → `VITE_SUPABASE_PUBLISHABLE_KEY` (Vercel only)  
- **service_role** → `SUPABASE_SERVICE_ROLE_KEY` (Render only, keep secret)

**Frontend calling backend:**  
Set `VITE_API_URL` in Vercel to your Render URL (e.g. `https://clientmax.onrender.com`) or your custom domain (e.g. `https://api.clientmax.amzdudes.io`) once it’s verified.
