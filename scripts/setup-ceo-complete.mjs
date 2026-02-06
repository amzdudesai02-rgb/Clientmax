#!/usr/bin/env node
/**
 * Complete CEO Account Setup Script
 * Creates both the employee record AND the auth user with password
 * 
 * Usage (from repo root):
 *   node scripts/setup-ceo-complete.mjs
 *   (Loads backend/.env automatically if SUPABASE_* are not set.)
 * 
 * This script:
 * 1. Creates/updates employee record in database
 * 2. Creates auth user with password
 * 3. Links them together
 * 
 * CEO login credentials:
 *   Email: junaid@amzdudes.com
 *   Password: admin123 (change after first login)
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
const CEO_NAME = 'Junaid';
const CEO_ROLE = 'CEO';

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

async function createOrUpdateEmployee() {
  console.log('📝 Creating/updating employee record...');
  console.log('   URL:', `${restUrl}/employees`);
  try {
    const res = await fetch(`${restUrl}/employees`, {
      method: 'POST',
      headers: { ...headersAuth, Prefer: 'resolution=merge-duplicates' },
      body: JSON.stringify({
        name: CEO_NAME,
        email: CEO_EMAIL,
        role: CEO_ROLE,
      }),
    });
    
    const responseText = await res.text();
    console.log('   Response status:', res.status, res.statusText);
    console.log('   Response length:', responseText.length);
    
    if (!res.ok) {
      // Try PATCH if POST fails (record might exist)
      console.log('   POST failed, trying PATCH...');
      const patchRes = await fetch(
        `${restUrl}/employees?email=eq.${encodeURIComponent(CEO_EMAIL)}`,
        {
          method: 'PATCH',
          headers: { ...headersAuth, Prefer: 'return=representation' },
          body: JSON.stringify({
            name: CEO_NAME,
            role: CEO_ROLE,
          }),
        }
      );
      const patchText = await patchRes.text();
      console.log('   PATCH status:', patchRes.status, patchRes.statusText);
      console.log('   PATCH response:', patchText.substring(0, 200));
      if (!patchRes.ok) {
        throw new Error(`Failed to create/update employee (${patchRes.status}): ${patchText || patchRes.statusText}`);
      }
      if (!patchText || patchText.trim() === '') {
        // Empty response might be OK for PATCH with return=minimal
        // Try to fetch the record to verify
        const getRes = await fetch(
          `${restUrl}/employees?email=eq.${encodeURIComponent(CEO_EMAIL)}&select=*`,
          { headers: headersAuth }
        );
        const getText = await getRes.text();
        if (getRes.ok && getText) {
          return JSON.parse(getText);
        }
        throw new Error('PATCH succeeded but could not retrieve updated record');
      }
      try {
        return JSON.parse(patchText);
      } catch (e) {
        throw new Error(`Invalid JSON response from PATCH: ${patchText.substring(0, 200)}`);
      }
    }
    
    if (!responseText || responseText.trim() === '') {
      // Empty response - try to fetch the created record
      const getRes = await fetch(
        `${restUrl}/employees?email=eq.${encodeURIComponent(CEO_EMAIL)}&select=*`,
        { headers: headersAuth }
      );
      const getText = await getRes.text();
      if (getRes.ok && getText) {
        return JSON.parse(getText);
      }
      throw new Error('POST succeeded but response was empty and could not retrieve created record');
    }
    
    try {
      return JSON.parse(responseText);
    } catch (e) {
      throw new Error(`Invalid JSON response from POST: ${responseText.substring(0, 200)}`);
    }
  } catch (e) {
    if (e.message.includes('fetch failed') || e.message.includes('ERR_NAME_NOT_RESOLVED')) {
      throw new Error(`Network error: Cannot reach Supabase. Check SUPABASE_URL: ${SUPABASE_URL}`);
    }
    throw e;
  }
}

async function createAuthUser() {
  console.log('👤 Creating auth user...');
  try {
    const res = await fetch(`${authUrl}/admin/users`, {
      method: 'POST',
      headers: headersAuth,
      body: JSON.stringify({
        email: CEO_EMAIL,
        password: CEO_PASSWORD,
        email_confirm: true,
      }),
    });
    
    const responseText = await res.text();
    let json;
    try {
      json = JSON.parse(responseText);
    } catch (e) {
      throw new Error(`Invalid JSON response from auth API (${res.status}): ${responseText.substring(0, 200)}`);
    }
    
    if (!res.ok) {
      if (json.msg && (json.msg.includes('already') || json.message?.includes('registered'))) {
        return { existing: true };
      }
      throw new Error(json.msg || json.message || res.statusText);
    }
    const id = json.id ?? json.user?.id;
    return id ? { id } : { existing: true };
  } catch (e) {
    if (e.message.includes('fetch failed') || e.message.includes('ERR_NAME_NOT_RESOLVED')) {
      throw new Error(`Network error: Cannot reach Supabase Auth. Check SUPABASE_URL: ${SUPABASE_URL}`);
    }
    throw e;
  }
}

async function findAuthUserByEmail() {
  try {
    const res = await fetch(`${authUrl}/admin/users?per_page=1000`, {
      headers: headersAuth,
    });
    const responseText = await res.text();
    let json;
    try {
      json = JSON.parse(responseText);
    } catch (e) {
      throw new Error(`Invalid JSON response from auth API (${res.status}): ${responseText.substring(0, 200)}`);
    }
    if (!res.ok) throw new Error(json.msg || json.message || res.statusText);
    const user = (json.users || []).find((x) => x.email === CEO_EMAIL);
    return user ? user.id : null;
  } catch (e) {
    if (e.message.includes('fetch failed') || e.message.includes('ERR_NAME_NOT_RESOLVED')) {
      throw new Error(`Network error: Cannot reach Supabase Auth. Check SUPABASE_URL: ${SUPABASE_URL}`);
    }
    throw e;
  }
}

async function linkEmployeeToAuth(employeeId, authUserId) {
  console.log('🔗 Linking employee record to auth user...');
  try {
    const res = await fetch(
      `${restUrl}/employees?id=eq.${employeeId}`,
      {
        method: 'PATCH',
        headers: { ...headersAuth, Prefer: 'return=representation' },
        body: JSON.stringify({ auth_user_id: authUserId }),
      }
    );
    const responseText = await res.text();
    if (!res.ok) {
      throw new Error(`Failed to link employee (${res.status}): ${responseText || res.statusText}`);
    }
    try {
      return JSON.parse(responseText);
    } catch (e) {
      throw new Error(`Invalid JSON response from PATCH: ${responseText.substring(0, 200)}`);
    }
  } catch (e) {
    if (e.message.includes('fetch failed') || e.message.includes('ERR_NAME_NOT_RESOLVED')) {
      throw new Error(`Network error: Cannot reach Supabase. Check SUPABASE_URL: ${SUPABASE_URL}`);
    }
    throw e;
  }
}

async function main() {
  console.log('🚀 Complete CEO Account Setup\n');
  console.log('Email:', CEO_EMAIL);
  console.log('Password:', CEO_PASSWORD);
  console.log('─'.repeat(50));

  try {
    // Step 1: Create/update employee record
    const employeeResult = await createOrUpdateEmployee();
    const employee = Array.isArray(employeeResult) ? employeeResult[0] : employeeResult;
    const employeeId = employee.id;
    console.log('✅ Employee record:', {
      id: employeeId,
      name: employee.name,
      email: employee.email,
      role: employee.role,
    });

    // Step 2: Create auth user
    let authUserId;
    const authResult = await createAuthUser();
    if (authResult.existing) {
      console.log('ℹ️  Auth user already exists. Looking up...');
      authUserId = await findAuthUserByEmail();
      if (!authUserId) throw new Error('Could not find existing auth user');
      console.log('✅ Found existing auth user:', authUserId);
    } else {
      authUserId = authResult.id;
      console.log('✅ Created auth user:', authUserId);
    }

    // Step 3: Link employee to auth user
    const linkedResult = await linkEmployeeToAuth(employeeId, authUserId);
    const linkedEmployee = Array.isArray(linkedResult) ? linkedResult[0] : linkedResult;
    console.log('✅ Employee linked to auth user:', {
      employee_id: linkedEmployee.id,
      auth_user_id: linkedEmployee.auth_user_id,
    });

    console.log('\n✅ Setup Complete!\n');
    console.log('CEO account is ready to use:');
    console.log('  Email:    ', CEO_EMAIL);
    console.log('  Password: admin123');
    console.log('\n⚠️  Important: Change password after first login in Settings → Security');

  } catch (e) {
    console.error('\n❌ Error:', e.message);
    if (e.cause) console.error('  Cause:', e.cause.message || e.cause);
    if (e.code) console.error('  Code:', e.code);
    console.error('\nTroubleshooting:');
    console.error('  1) Check internet connection');
    console.error('  2) Verify backend/.env exists and contains:');
    console.error('     SUPABASE_URL=https://your-project.supabase.co');
    console.error('     SUPABASE_SERVICE_ROLE_KEY=your-service-role-key');
    console.error('  3) Current SUPABASE_URL:', SUPABASE_URL || '(not set)');
    console.error('  4) Verify your Supabase project is active (not paused)');
    console.error('  5) Check that SUPABASE_SERVICE_ROLE_KEY is the service_role key (not anon key)');
    process.exit(1);
  }
}

main();
