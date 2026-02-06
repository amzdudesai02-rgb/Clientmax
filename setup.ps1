# PowerShell setup script for ClientMax Pro

Write-Host "🚀 Setting up ClientMax Pro..." -ForegroundColor Cyan

# Frontend setup
Write-Host "`n📦 Setting up frontend..." -ForegroundColor Yellow
Set-Location frontend

if (-not (Test-Path ".env")) {
    Write-Host "Creating frontend .env file..." -ForegroundColor Green
    @"
VITE_SUPABASE_URL=https://nhbtywdbnivgpsjplgsm.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key-here
VITE_API_URL=http://localhost:8000
"@ | Out-File -FilePath ".env" -Encoding utf8
    Write-Host "✅ Frontend .env created. Please update with your Supabase credentials." -ForegroundColor Green
}

npm install
Set-Location ..

# Backend setup
Write-Host "`n🐍 Setting up backend..." -ForegroundColor Yellow
Set-Location backend

if (-not (Test-Path ".env")) {
    Write-Host "Creating backend .env file..." -ForegroundColor Green
    @"
SUPABASE_URL=https://nhbtywdbnivgpsjplgsm.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
API_HOST=0.0.0.0
API_PORT=8000
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
"@ | Out-File -FilePath ".env" -Encoding utf8
    Write-Host "✅ Backend .env created. Please update with your Supabase credentials." -ForegroundColor Green
}

if (-not (Test-Path "venv")) {
    Write-Host "Creating Python virtual environment..." -ForegroundColor Green
    python -m venv venv
}

Write-Host "`n✅ Setup complete!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. Update frontend\.env with your Supabase credentials"
Write-Host "2. Update backend\.env with your Supabase credentials"
Write-Host "3. Run 'cd frontend; npm run dev' to start frontend"
Write-Host "4. Run 'cd backend; python main.py' to start backend"

