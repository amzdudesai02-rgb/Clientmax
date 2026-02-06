#!/bin/bash
# Setup script for ClientMax Pro

echo "🚀 Setting up ClientMax Pro..."

# Frontend setup
echo "📦 Setting up frontend..."
cd frontend
if [ ! -f .env ]; then
    echo "Creating frontend .env file..."
    cat > .env << EOF
VITE_SUPABASE_URL=https://nhbtywdbnivgpsjplgsm.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key-here
VITE_API_URL=http://localhost:8000
EOF
    echo "✅ Frontend .env created. Please update with your Supabase credentials."
fi
npm install
cd ..

# Backend setup
echo "🐍 Setting up backend..."
cd backend
if [ ! -f .env ]; then
    echo "Creating backend .env file..."
    cat > .env << EOF
SUPABASE_URL=https://nhbtywdbnivgpsjplgsm.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
API_HOST=0.0.0.0
API_PORT=8000
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
EOF
    echo "✅ Backend .env created. Please update with your Supabase credentials."
fi

if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

source venv/bin/activate
pip install -r requirements.txt
cd ..

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update frontend/.env with your Supabase credentials"
echo "2. Update backend/.env with your Supabase credentials"
echo "3. Run 'cd frontend && npm run dev' to start frontend"
echo "4. Run 'cd backend && python main.py' to start backend"

