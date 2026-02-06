#!/usr/bin/env node
/**
 * Diagnostic and fix script for CEO employee record
 * Checks and fixes the employee record linking issue
 *
 * Usage (from repo root):
 *   node scripts/fix-ceo-employee.mjs
 *   (Loads backend/.env automatically if SUPABASE_* are not set.)
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

async function findAuthUserByEmail() {
  console.log('🔍 Looking up auth user by email:', CEO_EMAIL);
  const res = await fetch(`${authUrl}/admin/users?per_page=1000`, {
    headers: headersAuth,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.msg || json.message || res.statusText);
  const user = (json.users || []).find((x) => x.email === CEO_EMAIL);
  return user ? { id: user.id, email: user.email, confirmed: user.email_confirmed_at !== null } : null;
}

async function findEmployeeByEmail() {
  console.log('🔍 Looking up employee record by email:', CEO_EMAIL);
  const res = await fetch(
    `${restUrl}/employees?email=eq.${encodeURIComponent(CEO_EMAIL)}&select=*`,
    { headers: headersAuth }
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  const data = await res.json();
  return data && data.length > 0 ? data[0] : null;
}

async function createEmployeeRecord(authUserId) {
  console.log('➕ Creating employee record...');
  const res = await fetch(`${restUrl}/employees`, {
    method: 'POST',
    headers: headersAuth,
    body: JSON.stringify({
      name: 'Junaid',
      email: CEO_EMAIL,
      role: 'CEO',
      auth_user_id: authUserId,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  return await res.json();
}

async function updateEmployeeAuthUserId(employeeId, authUserId) {
  console.log('🔗 Linking employee record to auth user...');
  const res = await fetch(
    `${restUrl}/employees?id=eq.${employeeId}`,
    {
      method: 'PATCH',
      headers: { ...headersAuth, Prefer: 'return=representation' },
      body: JSON.stringify({ auth_user_id: authUserId }),
    }
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  return await res.json();
}

async function main() {
  console.log('🔧 CEO Employee Record Diagnostic & Fix Tool\n');
  console.log('Email:', CEO_EMAIL);
  console.log('─'.repeat(50));

  try {
    // Step 1: Find auth user
    const authUser = await findAuthUserByEmail();
    if (!authUser) {
      console.error('\n❌ Auth user not found!');
      console.error('   Run: node scripts/create-ceo-user.mjs');
      process.exit(1);
    }
    console.log('✅ Auth user found:', {
      id: authUser.id,
      email: authUser.email,
      confirmed: authUser.confirmed ? 'Yes' : 'No',
    });

    // Step 2: Find employee record
    const employee = await findEmployeeByEmail();
    if (!employee) {
      console.log('\n⚠️  Employee record not found!');
      console.log('   Creating employee record...');
      const newEmployee = await createEmployeeRecord(authUser.id);
      console.log('✅ Employee record created:', {
        id: newEmployee[0]?.id || newEmployee.id,
        email: newEmployee[0]?.email || newEmployee.email,
        role: newEmployee[0]?.role || newEmployee.role,
        auth_user_id: newEmployee[0]?.auth_user_id || newEmployee.auth_user_id,
      });
      console.log('\n✅ Setup complete! CEO can now log in.');
      return;
    }

    console.log('✅ Employee record found:', {
      id: employee.id,
      email: employee.email,
      role: employee.role,
      auth_user_id: employee.auth_user_id || '(not linked)',
    });

    // Step 3: Check if linked
    if (!employee.auth_user_id) {
      console.log('\n⚠️  Employee record not linked to auth user!');
      console.log('   Linking now...');
      const updated = await updateEmployeeAuthUserId(employee.id, authUser.id);
      console.log('✅ Employee record linked:', {
        id: updated[0]?.id || updated.id,
        auth_user_id: updated[0]?.auth_user_id || updated.auth_user_id,
      });
    } else if (employee.auth_user_id !== authUser.id) {
      console.log('\n⚠️  Employee record linked to different auth user!');
      console.log('   Current auth_user_id:', employee.auth_user_id);
      console.log('   Expected auth_user_id:', authUser.id);
      console.log('   Updating to correct auth user...');
      const updated = await updateEmployeeAuthUserId(employee.id, authUser.id);
      console.log('✅ Employee record updated:', {
        id: updated[0]?.id || updated.id,
        auth_user_id: updated[0]?.auth_user_id || updated.auth_user_id,
      });
    } else {
      console.log('\n✅ Employee record is correctly linked!');
    }

    // Step 4: Verify role
    if (employee.role !== 'CEO') {
      console.log('\n⚠️  Employee role is not "CEO"!');
      console.log('   Current role:', employee.role);
      console.log('   Updating role to CEO...');
      const res = await fetch(
        `${restUrl}/employees?id=eq.${employee.id}`,
        {
          method: 'PATCH',
          headers: { ...headersAuth, Prefer: 'return=representation' },
          body: JSON.stringify({ role: 'CEO' }),
        }
      );
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || res.statusText);
      }
      console.log('✅ Role updated to CEO');
    } else {
      console.log('✅ Role is correct: CEO');
    }

    console.log('\n✅ All checks passed! CEO account is properly configured.');
    console.log('\nCEO can sign in with:');
    console.log('  Email:    ', CEO_EMAIL);
    console.log('  Password: admin123 (change after first login)');

  } catch (e) {
    console.error('\n❌ Error:', e.message);
    if (e.cause) console.error('  Cause:', e.cause.message || e.cause);
    if (e.code) console.error('  Code:', e.code);
    console.error('\nCheck: 1) Internet connection 2) SUPABASE_URL in backend/.env is correct');
    process.exit(1);
  }
}

main();
