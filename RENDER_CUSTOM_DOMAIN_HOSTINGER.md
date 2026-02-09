# Fix Render Custom Domain (api.clientmax.amzdudes.io) with Hostinger DNS

Your **Vercel** frontend deploy is done. The issue is only the **Render** custom domain verification for `api.clientmax.amzdudes.io` when DNS is managed on **Hostinger**.

## What’s happening

- **Render subdomain works:** `https://clientmax.onrender.com`
- **Custom domain shows:** "Verification Error" and "Waiting for Verification" for `api.clientmax.amzdudes.io`
- **Cause:** DNS for `api.clientmax.amzdudes.io` is not correctly pointing to Render, or records are missing/wrong in Hostinger.

---

## Step 1: Get the correct target from Render

1. In **Render Dashboard** → your service (e.g. **clientmax**) → **Settings** → **Custom Domains**.
2. Note the exact host Render tells you to use for the custom domain (often a **CNAME** target like `clientmax.onrender.com` or similar).
3. If Render shows “Add CNAME record” or “Point your domain to…”, copy that **exact** value (e.g. `clientmax.onrender.com`).

---

## Step 2: Configure DNS in Hostinger

1. Log in to **Hostinger** → **Domains** → select **amzdudes.io** (or the domain that owns `api.clientmax.amzdudes.io`).
2. Open **DNS / DNS Zone / Manage DNS**.
3. Add or fix the record for the **api** subdomain:

   **Option A – CNAME (recommended if Render says CNAME)**  
   - **Type:** CNAME  
   - **Name:** `api` (or `api.clientmax` if you use a subdomain like `api.clientmax.amzdudes.io`; use whatever Hostinger uses for “subdomain” so the full name is `api.clientmax.amzdudes.io`).  
   - **Target / Points to:** the value from Render (e.g. `clientmax.onrender.com`).  
   - **TTL:** 3600 or default.  
   - Remove any other **A** or **CNAME** for the same name that might conflict.

   **Option B – A record (only if Render explicitly gives you an IP)**  
   - **Type:** A  
   - **Name:** `api` (or whatever gives you `api.clientmax.amzdudes.io`).  
   - **Value:** the IP Render provides.  
   - Use this only if Render’s custom domain instructions say “A record” and give an IP.

4. Save the DNS changes in Hostinger.

---

## Step 3: Wait and re-verify on Render

- DNS can take **5–30 minutes** (sometimes up to 48 hours).
- In Render → **Custom Domains** → find `api.clientmax.amzdudes.io` → use **Refresh/Verify** (or “Verify”).
- When verification succeeds, Render will issue the certificate and “Waiting for Verification” will change to a success state.

---

## Step 4: If it still shows “Verification Error”

- **Double-check in Hostinger:**  
  - The **Name** of the record really matches the host you’re verifying (e.g. `api` for `api.clientmax.amzdudes.io` if the zone is `clientmax.amzdudes.io`, or `api.clientmax` if the zone is `amzdudes.io`).  
  - The **Target** is exactly what Render shows (no typo, no `https://`, no trailing dot unless Render shows it).

- **Check from your machine:**  
  ```bash
  nslookup api.clientmax.amzdudes.io
  ```  
  You should see the Render host (e.g. `clientmax.onrender.com`) or the Render IP if you used an A record.

- **Remove and re-add the domain on Render:**  
  In Render, remove `api.clientmax.amzdudes.io` and add it again, then wait a few minutes and verify again.

---

## Summary

| Item | Where | Action |
|------|--------|--------|
| Frontend | Vercel | Already deployed. |
| Backend URL | Render | Use `https://clientmax.onrender.com` until custom domain is verified. |
| Custom domain | Hostinger DNS | Add/update CNAME (or A if required) for `api.clientmax.amzdudes.io` → Render’s target, then verify in Render. |

After the custom domain verifies on Render, you can use `https://api.clientmax.amzdudes.io` for your API and point the frontend (e.g. in Vercel env) to that URL if needed.
