# Database Setup Guide

This project uses **Supabase** as the database backend. Follow these steps to set up your database.

## Prerequisites

1. A Supabase account (sign up at https://supabase.com)
2. A new Supabase project created

## Setup Steps

### 1. Create Supabase Project

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Fill in:
   - **Project Name**: `amzdudes` (or your preferred name)
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to your users
4. Click "Create new project"
5. Wait for project to be created (2-3 minutes)

### 2. Get Your Supabase Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (for client-side access)
   - **service_role key** (for server-side access - keep secret!)

### 3. Configure Environment Variables

Create a `.env` file in the root of your project:

```env
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### 4. Run Database Migrations

You have two options:

#### Option A: Using Supabase CLI (Recommended)

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Login to Supabase:
   ```bash
   supabase login
   ```

3. Link your project:
   ```bash
   supabase link --project-ref your-project-ref
   ```

4. Run migrations:
   ```bash
   supabase db push
   ```

#### Option B: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run each migration file in order:
   - `20260121145818_3e4b1d08-28d2-4772-ab2e-97c5b6482e60.sql`
   - `20260121163101_80fa0793-91cb-414c-a4ef-fdea5c806157.sql`
   - `20260121173845_39f0291c-67b5-4e46-bdef-0e93f8f2c55a.sql`
   - `20260121203128_96895e7f-7100-4b34-a2cd-d61d1213c643.sql`

### 5. Verify Database Setup

1. Go to **Table Editor** in Supabase dashboard
2. You should see these tables:
   - `clients`
   - `employees`
   - `team_leads`
   - `daily_updates`
   - `weekly_summaries`
   - `client_documents`
   - `client_meetings`
   - `client_tasks`
   - `client_plans`
   - `client_onboarding`
   - `dashboard_metrics`
   - `email_notification_log`
   - `user_roles`

## Database Schema Overview

### Core Tables

- **clients**: Main client information
- **employees**: Team member data
- **team_leads**: Team leadership structure
- **user_roles**: Role-based access control

### Client Management

- **daily_updates**: Employee daily updates per client
- **weekly_summaries**: AI-generated weekly summaries
- **client_documents**: Document storage and links
- **client_meetings**: Meeting scheduling
- **client_tasks**: Task management
- **client_plans**: Service plans and pricing

### System Tables

- **dashboard_metrics**: Dashboard KPIs
- **email_notification_log**: Email tracking
- **client_onboarding**: Client onboarding flow

## Next Steps

1. Update your `.env` file with Supabase credentials
2. Test the connection by running the app
3. Seed initial data if needed (see `SEED_DATA.md`)

## Troubleshooting

- **Connection issues**: Verify your `.env` variables are correct
- **Migration errors**: Check that migrations run in order
- **RLS policies**: Ensure Row Level Security is configured correctly

