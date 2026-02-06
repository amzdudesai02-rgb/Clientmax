# Render Python Version Configuration

## Issue
Render is using Python 3.13 by default, which causes `pydantic-core` to build from source (requiring Rust), leading to build failures.

## Solution
Configure Render to use Python 3.11 or 3.12 instead.

## How to Set Python Version in Render:

### Option 1: Using runtime.txt (Recommended)
I've created `backend/runtime.txt` with `python-3.11.9`. Render will automatically detect this file.

### Option 2: Manual Configuration in Render Dashboard
1. Go to your Render Dashboard
2. Select your Web Service
3. Go to **Settings** tab
4. Scroll to **Environment** section
5. Find **Python Version** setting
6. Change it to: `3.11.9` or `3.12.x`
7. Save and redeploy

## Why Python 3.11/3.12?
- More stable and widely supported
- Pre-built wheels available for all packages
- No need to compile from source
- Faster build times

## After Changing Python Version:
Render will automatically rebuild with the new Python version.

