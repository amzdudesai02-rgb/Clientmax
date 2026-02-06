# Render Keep-Alive Configuration

## Problem
Render.com free tier services automatically sleep after **15 minutes of inactivity**. When a service is sleeping, the first request takes 30-60 seconds to wake it up.

## Solutions

### Option 1: Self-Ping (Recommended)
The backend includes a built-in keep-alive mechanism that pings itself every 5 minutes.

**Setup:**
1. Go to Render Dashboard → Your Web Service → Environment
2. Add environment variable:
   - **Key**: `RENDER_SERVICE_URL`
   - **Value**: `https://your-service-name.onrender.com` (your actual Render URL)
3. The service will automatically ping itself every 5 minutes

**Optional Configuration:**
- `KEEP_ALIVE_ENABLED`: Set to `false` to disable (default: `true`)
- `KEEP_ALIVE_INTERVAL`: Ping interval in seconds (default: `300` = 5 minutes)

### Option 2: External Cron Service (Alternative)

If you prefer not to use self-ping, use an external service to ping your health endpoint:

#### Using cron-job.org (Free)
1. Go to https://cron-job.org
2. Create a free account
3. Create a new cron job:
   - **URL**: `https://your-service-name.onrender.com/api/health`
   - **Schedule**: Every 10-14 minutes (e.g., `*/12 * * * *` = every 12 minutes)
   - **Method**: GET
4. Save and activate

#### Using UptimeRobot (Free)
1. Go to https://uptimerobot.com
2. Create a free account
3. Add a new monitor:
   - **Monitor Type**: HTTP(s)
   - **URL**: `https://your-service-name.onrender.com/api/health`
   - **Monitoring Interval**: 5 minutes (free tier minimum)
4. Save

#### Using GitHub Actions (Free)
Create `.github/workflows/keep-alive.yml`:
```yaml
name: Keep Render Alive

on:
  schedule:
    - cron: '*/10 * * * *'  # Every 10 minutes
  workflow_dispatch:

jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - name: Ping Render service
        run: |
          curl -f https://your-service-name.onrender.com/api/health || exit 1
```

### Option 3: Upgrade to Paid Plan
Render paid plans ($7/month+) keep services always awake without sleep.

## Verify Keep-Alive is Working

1. Check Render logs - you should see:
   ```
   [Keep-Alive] Successfully pinged https://your-service.onrender.com/api/health
   ```

2. Test the endpoint:
   ```bash
   curl https://your-service-name.onrender.com/api/health
   ```

3. Wait 15+ minutes and make a request - if it responds immediately, keep-alive is working!

## Troubleshooting

**Service still sleeping?**
- Verify `RENDER_SERVICE_URL` is set correctly in Render Dashboard
- Check Render logs for keep-alive ping messages
- Ensure the URL uses `https://` (not `http://`)
- Try using an external cron service instead

**Self-ping not working?**
- Make sure `RENDER_SERVICE_URL` matches your exact Render service URL
- Check that `KEEP_ALIVE_ENABLED` is not set to `false`
- Verify the service is deployed and accessible

## Endpoints

- `/api/health` - Detailed health check (use for external pings)
- `/api/keepalive` - Simple keep-alive endpoint (lightweight)

Both endpoints return 200 OK and can be used by external ping services.
