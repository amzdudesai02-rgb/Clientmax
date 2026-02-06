# User Account Setup Guide

This guide explains how to create employee and client user accounts.

## Pre-created Users

### CEO (Admin)
- **Email:** `junaid@amzdudes.com`
- **Password:** `admin123` (change after first login)
- **Role:** CEO (Full admin access)
- **Access:** Full access to all features including admin panel (Settings → Accounts)

### Employee: Zafar
- **Email:** `zafar@amzdudes.com`
- **Password:** `password123` (change after first login)
- **Role:** Employee (Regular employee)
- **Access:** Employee dashboard and features (but not admin panel)

### Client: Josh
- **Email:** `josh@company.com`
- **Password:** `password123` (change after first login)
- **Role:** Client
- **Access:** Client portal only (`/smart-portal`)

## Creating Users

### Option 1: Using Script (Recommended)

Run the user creation script:

```bash
node scripts/create-users.mjs
```

This will create:
- Employee: Zafar
- Client: Josh

### Option 2: Using Admin Panel (CEO Only)

1. Log in as CEO (`junaid@amzdudes.com`)
2. Go to **Settings → Accounts**
3. Select **Employee** or **Client** tab
4. Choose an existing record or create new
5. Set password and create account

## Access Control

### CEO (junaid@amzdudes.com)
- ✅ Full access to all employee routes
- ✅ Admin panel (Settings → Accounts)
- ✅ All dashboard features
- ✅ Can manage all users

### Regular Employees (e.g., zafar@amzdudes.com)
- ✅ Access to employee dashboard
- ✅ Can view clients, reports, etc.
- ❌ Cannot access admin panel (Settings → Accounts)
- ❌ Cannot manage users

### Clients (e.g., josh@company.com)
- ✅ Access to client portal (`/smart-portal`)
- ✅ Can view their own data
- ❌ Cannot access employee dashboard
- ❌ Cannot access admin features

## Login Instructions

1. Open the application
2. Select user type:
   - **Employee** for CEO and regular employees
   - **Client** for clients
3. Enter email and password
4. After first login, change password in **Settings → Security**

## Notes

- All users should change their passwords after first login
- CEO has full admin access to manage all accounts
- Regular employees can access employee features but not admin panel
- Clients only see their portal and cannot access employee features
