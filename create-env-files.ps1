# PowerShell script to create .env files from templates

Write-Host "Creating .env files..." -ForegroundColor Cyan

# Create frontend .env
if (-not (Test-Path "frontend\.env")) {
    Write-Host "`nCreating frontend/.env..." -ForegroundColor Yellow
    @"
# Frontend Environment Variables
VITE_SUPABASE_URL=https://nhbtywdbnivgpsjplgsm.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-public-key-here
VITE_API_URL=http://localhost:8000
"@ | Out-File -FilePath "frontend\.env" -Encoding utf8
    Write-Host "✅ Created frontend/.env" -ForegroundColor Green
    Write-Host "   ⚠️  Please update VITE_SUPABASE_PUBLISHABLE_KEY with your actual anon key" -ForegroundColor Yellow
} else {
    Write-Host "frontend/.env already exists" -ForegroundColor Gray
}

# Create backend .env
if (-not (Test-Path "backend\.env")) {
    Write-Host "`nCreating backend/.env..." -ForegroundColor Yellow
    @"
# Backend Environment Variables
SUPABASE_URL=https://nhbtywdbnivgpsjplgsm.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
API_HOST=0.0.0.0
API_PORT=8000
"@ | Out-File -FilePath "backend\.env" -Encoding utf8
    Write-Host "✅ Created backend/.env" -ForegroundColor Green
    Write-Host "   ⚠️  Please update SUPABASE_SERVICE_ROLE_KEY with your actual service_role key" -ForegroundColor Yellow
} else {
    Write-Host "backend/.env already exists" -ForegroundColor Gray
}

Write-Host "`n✅ Done! Remember to:" -ForegroundColor Cyan
Write-Host "1. Update frontend/.env with your Supabase anon key" -ForegroundColor White
Write-Host "2. Update backend/.env with your Supabase service_role key" -ForegroundColor White
Write-Host "3. Get keys from: https://supabase.com/dashboard → Settings → API" -ForegroundColor White

