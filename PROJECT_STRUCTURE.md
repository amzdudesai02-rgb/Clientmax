# ClientMax Pro - Project Structure

## Overview

The project has been reorganized into a clear frontend/backend structure:

```
amzdudes-main/
├── frontend/          # React + TypeScript frontend application
├── backend/           # Python FastAPI backend API
├── supabase/          # Database migrations and Edge Functions
└── .github/          # CI/CD workflows
```

## Frontend Structure

```
frontend/
├── src/
│   ├── pages/         # Page components
│   │   ├── Login.tsx  # Unified login system for ClientMax
│   │   ├── Dashboard.tsx
│   │   └── ...
│   ├── components/    # Reusable components
│   ├── hooks/         # Custom React hooks
│   ├── integrations/  # Supabase client
│   └── ...
├── public/            # Static assets
├── package.json       # Dependencies
└── vite.config.ts    # Vite configuration
```

## Backend Structure

```
backend/
├── main.py            # FastAPI application entry point
├── requirements.txt   # Python dependencies
├── .env.example       # Environment variables template
└── README.md          # Backend documentation
```

## Login System

A unified login system has been created at `/login` that supports:

1. **Employee Login**
   - Sign in/Sign up for agency employees
   - Access to client management dashboard
   - Redirects to main dashboard after login

2. **Client Login**
   - Sign in for clients (sign up disabled - must be created by account manager)
   - Access to client portal
   - Redirects to smart portal after login

### Features:
- User type selection (Employee/Client)
- Form validation with Zod
- Error handling
- Loading states
- Responsive design
- Modern UI with shadcn/ui components

## Environment Variables

### Frontend (frontend/.env)
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key-here
VITE_API_URL=http://localhost:8000
```

### Backend (backend/.env)
```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
API_HOST=0.0.0.0
API_PORT=8000
```

## Setup Instructions

### Quick Setup (Windows)
```powershell
.\setup.ps1
```

### Quick Setup (Linux/Mac)
```bash
chmod +x setup.sh
./setup.sh
```

### Manual Setup

1. **Frontend:**
   ```bash
   cd frontend
   npm install
   cp .env.example .env
   # Edit .env with your credentials
   npm run dev
   ```

2. **Backend:**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   pip install -r requirements.txt
   cp .env.example .env
   # Edit .env with your credentials
   python main.py
   ```

## Development Workflow

1. Start backend: `cd backend && python main.py`
2. Start frontend: `cd frontend && npm run dev`
3. Access app: http://localhost:8080
4. Login: http://localhost:8080/login

## Migration Notes

- All frontend files moved from root to `frontend/` folder
- Backend created in `backend/` folder
- Login system created at `frontend/src/pages/Login.tsx`
- Routes updated in `frontend/src/App.tsx` to include `/login`
- Configuration files updated for new structure

## Next Steps

1. Update `.env` files with actual Supabase credentials
2. Test login system
3. Connect backend API endpoints
4. Deploy frontend and backend separately

