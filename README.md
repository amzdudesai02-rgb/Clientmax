# ClientMax Pro

A comprehensive client management system for agencies managing Amazon sellers, brand owners, and wholesalers.

## Project Structure

```
amzdudes-main/
├── frontend/          # React + TypeScript frontend
│   ├── src/          # Source code
│   ├── public/       # Static assets
│   └── package.json  # Frontend dependencies
├── backend/          # Python FastAPI backend
│   ├── main.py       # FastAPI application
│   └── requirements.txt
├── supabase/         # Database migrations and functions
└── .github/          # CI/CD workflows
```

## Quick Start

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Add your Supabase credentials to `.env`:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key-here
```

5. Start development server:
```bash
npm run dev
```

Frontend will run on http://localhost:8080

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create virtual environment (recommended):
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create `.env` file:
```bash
cp .env.example .env
```

5. Add your Supabase credentials to `.env`:
```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

6. Start the server:
```bash
python main.py
```

Or with uvicorn:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Backend will run on http://localhost:8000

## Login System

The application includes a unified login system accessible at `/login`:

- **Employee Login**: For agency employees to manage clients
- **Client Login**: For clients to access their portal

## Database Setup

See `DATABASE_SETUP.md` for detailed database setup instructions.

## Environment Variables

### Frontend (.env in frontend folder)
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY` - Your Supabase anon/public key
- `VITE_API_URL` - Backend API URL (default: http://localhost:8000)

### Backend (.env in backend folder)
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (keep secret!)
- `API_HOST` - API host (default: 0.0.0.0)
- `API_PORT` - API port (default: 8000)

## Features

- ✅ Client Management Dashboard
- ✅ Employee Portal
- ✅ Client Portal
- ✅ Activity Tracking
- ✅ Reports Generation
- ✅ Team Utilization Tracking
- ✅ Supabase Integration
- ✅ Authentication System
- ✅ Real-time Updates

## Tech Stack

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- React Router
- TanStack Query
- Supabase Client

### Backend
- Python 3.11+
- FastAPI
- Supabase Python Client
- Pydantic
- Uvicorn

### Database
- Supabase (PostgreSQL)
- Row Level Security (RLS)

## Development

### Frontend Commands
```bash
cd frontend
npm run dev      # Start dev server
npm run build    # Build for production
npm run lint     # Run linter
npm run test     # Run tests
```

### Backend Commands
```bash
cd backend
python main.py                    # Start server
uvicorn main:app --reload         # Start with auto-reload
```

## CI/CD

The project includes GitHub Actions workflows:
- `.github/workflows/ci.yml` - Main CI/CD pipeline
- `.github/workflows/sync-to-vercel-repo.yml` - Sync to Vercel repository

## Deployment

### Frontend
- Deployed to Vercel: `max.amzdudes.io`
- Deployed to Hostinger via FTP

### Backend
- Can be deployed to:
  - Render
  - Railway
  - Heroku
  - AWS/GCP/Azure

## Documentation

- `DATABASE_SETUP.md` - Database setup guide
- `ENV_SETUP.md` - Environment variables guide
- `backend/README.md` - Backend API documentation

## License

Private - All rights reserved
