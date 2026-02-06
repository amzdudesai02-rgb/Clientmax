# ClientMax Pro - Backend API

Python FastAPI backend for ClientMax Pro application.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Fill in your Supabase credentials in `.env`

4. Run the server:
```bash
python main.py
```

Or with uvicorn:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## API Documentation

Once the server is running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Endpoints

- `GET /` - Health check
- `GET /api/health` - Detailed health check
- `GET /api/clients` - Get all clients
- `GET /api/clients/{client_id}` - Get specific client

## Development

The backend uses:
- FastAPI for the web framework
- Supabase for database operations
- Pydantic for data validation
- Python-dotenv for environment variables

