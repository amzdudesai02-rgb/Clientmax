"""
ClientMax Pro - Backend API
FastAPI backend for ClientMax Pro application
"""

from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import Response
from pydantic import BaseModel, EmailStr
from typing import Optional, List
import os
import asyncio
import httpx
from contextlib import asynccontextmanager
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Keep-alive configuration
# Render free tier sleeps after 15 minutes of inactivity
# Ping every 5 minutes (300 seconds) to stay well under the threshold
KEEP_ALIVE_INTERVAL = int(os.getenv("KEEP_ALIVE_INTERVAL", "300"))  # Default: 5 minutes
KEEP_ALIVE_ENABLED = os.getenv("KEEP_ALIVE_ENABLED", "true").lower() == "true"

async def keep_alive_task():
    """Background task to ping the health endpoint to prevent Render from sleeping
    
    Note: For Render free tier, external traffic is required to prevent sleep.
    Set RENDER_SERVICE_URL environment variable to your public Render URL
    (e.g., https://your-service.onrender.com) for self-pinging.
    
    Alternatively, use an external cron service (cron-job.org, UptimeRobot)
    to ping /api/health every 10-14 minutes.
    """
    if not KEEP_ALIVE_ENABLED:
        return
    
    # Get the public service URL from environment
    # Set this in Render Dashboard → Environment → RENDER_SERVICE_URL
    service_url = os.getenv("RENDER_SERVICE_URL") or os.getenv("SERVICE_URL")
    
    if not service_url:
        print("[Keep-Alive] RENDER_SERVICE_URL not set. Self-ping disabled.")
        print("[Keep-Alive] To enable: Set RENDER_SERVICE_URL=https://your-service.onrender.com in Render Dashboard")
        print("[Keep-Alive] Or use external cron service to ping /api/health every 10-14 minutes")
        return
    
    health_endpoint = f"{service_url}/api/health"
    
    async with httpx.AsyncClient(timeout=10.0) as client:
        while True:
            try:
                # Ping the public health endpoint to keep the service awake
                response = await client.get(health_endpoint)
                if response.status_code == 200:
                    print(f"[Keep-Alive] Successfully pinged {health_endpoint}")
                else:
                    print(f"[Keep-Alive] Ping returned status {response.status_code}")
            except httpx.TimeoutException:
                print(f"[Keep-Alive] Ping timeout (service may be waking up)")
            except Exception as e:
                # Log but don't fail - this is just a keep-alive
                print(f"[Keep-Alive] Ping failed (non-critical): {e}")
            
            # Wait before next ping (ping every 5 minutes to stay well under 15min sleep threshold)
            await asyncio.sleep(KEEP_ALIVE_INTERVAL)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager to start/stop background tasks"""
    # Start keep-alive task
    if KEEP_ALIVE_ENABLED:
        keep_alive_task_instance = asyncio.create_task(keep_alive_task())
        print(f"[Startup] Keep-alive task started (pinging every {KEEP_ALIVE_INTERVAL}s)")
    
    yield
    
    # Cleanup (if needed)
    if KEEP_ALIVE_ENABLED:
        keep_alive_task_instance.cancel()
        try:
            await keep_alive_task_instance
        except asyncio.CancelledError:
            print("[Shutdown] Keep-alive task stopped")

app = FastAPI(
    title="ClientMax Pro API",
    description="Backend API for ClientMax Pro - Client Management System",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "http://localhost:5173", "https://max.amzdudes.io"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

# Supabase configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

# Pydantic models
class HealthCheck(BaseModel):
    status: str
    message: str

class ClientResponse(BaseModel):
    id: str
    company_name: str
    contact_name: str
    email: str
    client_type: str
    health_score: int
    health_status: str
    mrr: float

# Routes
@app.get("/", response_model=HealthCheck)
async def root():
    """Health check endpoint"""
    return {"status": "healthy", "message": "ClientMax Pro API is running"}

@app.get("/favicon.png")
@app.get("/favicon.ico")
async def favicon():
    """Handle favicon requests - return 204 No Content to prevent 401 errors
    
    Favicon should be served by the frontend (Vercel), not the backend.
    This endpoint prevents browsers from triggering 401 errors when
    they automatically request favicons from the backend URL.
    """
    return Response(status_code=204)

@app.get("/api/health")
async def health_check():
    """Detailed health check endpoint
    
    This endpoint can be pinged by external cron services (cron-job.org, UptimeRobot)
    every 10-14 minutes to prevent Render from sleeping.
    """
    return {
        "status": "healthy",
        "service": "ClientMax Pro API",
        "version": "1.0.0",
        "keep_alive": "active" if KEEP_ALIVE_ENABLED else "disabled"
    }

@app.get("/api/keepalive")
async def keepalive():
    """Simple keep-alive endpoint for external ping services
    
    Returns 200 OK. Use this endpoint with cron services to prevent Render sleep.
    Recommended ping interval: Every 10-14 minutes
    """
    return {"status": "ok", "message": "Service is awake"}

@app.get("/api/clients", response_model=List[ClientResponse])
async def get_clients():
    """Get all clients"""
    # TODO: Implement Supabase client fetching
    return []

@app.get("/api/clients/{client_id}", response_model=ClientResponse)
async def get_client(client_id: str):
    """Get a specific client by ID"""
    # TODO: Implement Supabase client fetching
    raise HTTPException(status_code=404, detail="Client not found")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

