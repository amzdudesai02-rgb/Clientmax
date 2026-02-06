#!/usr/bin/env node
/**
 * One-time setup: create CEO auth user and link to employees record.
 * Run after applying migration 20260127120000_ceo_junaid.sql
 *
 * Usage (from repo root):
 *   node scripts/create-ceo-user.mjs
 *   (Loads backend/.env automatically if SUPABASE_* are not set.)
 *   Or: node --env-file=backend/.env scripts/create-ceo-user.mjs
 *
 * CEO login: junaid@amzdudes.com / admin123 (change after first login via Settings → Security)
 */

import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..');

// Load backend/.env if vars not set
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  const envPath = join(repoRoot, 'backend', '.env');
  if (existsSync(envPath)) {
    const buf = readFileSync(envPath, 'utf8');
    for (const line of buf.split('\n')) {
      const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.+)\s*$/);
      if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '').trim();
    }
  }
}

const SUPABASE_URL = process.env.SUPABASE_URL?.replace(/\/$/, '');
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const CEO_EMAIL = 'junaid@amzdudes.com';
const CEO_PASSWORD = 'admin123';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Set them in backend/.env or as env vars.');
  process.exit(1);
}

const authUrl = `${SUPABASE_URL}/auth/v1`;
const restUrl = `${SUPABASE_URL}/rest/v1`;
const headersAuth = {
  apikey: SUPABASE_SERVICE_ROLE_KEY,
  Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
  'Content-Type': 'application/json',
};

async function createAuthUser() {
  const res = await fetch(`${authUrl}/admin/users`, {
    method: 'POST',
    headers: headersAuth,
    body: JSON.stringify({
      email: CEO_EMAIL,
      password: CEO_PASSWORD,
      email_confirm: true,
    }),
  });
  const json = await res.json();
  if (!res.ok) {
    if (json.msg && (json.msg.includes('already') || json.message?.includes('registered'))) {
      return { existing: true };
    }
    throw new Error(json.msg || json.message || res.statusText);
  }
  const id = json.id ?? json.user?.id;
  return id ? { id } : { existing: true };
}

async function findAuthUserByEmail() {
  const res = await fetch(`${authUrl}/admin/users?per_page=1000`, {
    headers: headersAuth,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.msg || json.message || res.statusText);
  const u = (json.users || []).find((x) => x.email === CEO_EMAIL);
  return u ? u.id : null;
}

async function linkEmployee(authUserId) {
  const res = await fetch(
    `${restUrl}/employees?email=eq.${encodeURIComponent(CEO_EMAIL)}`,
    {
      method: 'PATCH',
      headers: { ...headersAuth, Prefer: 'return=minimal' },
      body: JSON.stringify({ auth_user_id: authUserId }),
    }
  );
  if (!res.ok) {
    const t = await res.text();
    throw new Error(t || res.statusText);
  }
}

async function main() {
  console.log('Creating CEO auth user:', CEO_EMAIL);

  let authUserId;
  try {
    const out = await createAuthUser();
    if (out.existing) {
      console.log('Auth user already exists. Looking up by email...');
      authUserId = await findAuthUserByEmail();
      if (!authUserId) throw new Error('Could not find existing user by email');
    } else {
      authUserId = out.id;
    }
  } catch (e) {
    console.error('Auth error:', e.message);
    if (e.cause) console.error('  Cause:', e.cause.message || e.cause);
    if (e.code) console.error('  Code:', e.code);
    console.error('\nCheck: 1) Internet connection 2) SUPABASE_URL in backend/.env is correct');
    console.error('  URL was:', authUrl + '/admin/users');
    process.exit(1);
  }

  await linkEmployee(authUserId);
  console.log('Employee record updated with auth_user_id.');
  console.log('');
  console.log('CEO can sign in with:');
  console.log('  Email:    ', CEO_EMAIL);
  console.log('  Password: admin123 (change after first login in Settings → Security)');
}

main();
