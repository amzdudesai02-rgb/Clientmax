#!/usr/bin/env node
/**
 * Create Employee and Client Users
 * Creates auth users and links them to employee/client records
 * 
 * Usage (from repo root):
 *   node scripts/create-users.mjs
 *   (Loads backend/.env automatically if SUPABASE_* are not set.)
 * 
 * Creates:
 * - Employee: zafar@amzdudes.com / password123
 * - Client: josh@company.com / password123
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

// User configurations
const USERS = [
  {
    type: 'employee',
    name: 'Zafar',
    email: 'zafar@amzdudes.com',
    password: 'password123',
    role: 'employee', // Regular employee (not CEO)
    clientType: null,
  },
  {
    type: 'client',
    name: 'Josh',
    email: 'josh@company.com',
    password: 'password123',
    role: null,
    clientType: 'brand_owner',
    companyName: 'Josh Company',
  }
];

async function createAuthUser(email, password) {
  console.log(`  Creating auth user: ${email}`);
  const res = await fetch(`${authUrl}/admin/users`, {
    method: 'POST',
    headers: headersAuth,
    body: JSON.stringify({
      email,
      password,
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

async function findAuthUserByEmail(email) {
  const res = await fetch(`${authUrl}/admin/users?per_page=1000`, {
    headers: headersAuth,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.msg || json.message || res.statusText);
  const user = (json.users || []).find((x) => x.email === email);
  return user ? user.id : null;
}

async function createOrUpdateEmployee(name, email, role, authUserId) {
  console.log(`  Creating/updating employee record: ${name}`);
  try {
    const res = await fetch(`${restUrl}/employees`, {
      method: 'POST',
      headers: { ...headersAuth, Prefer: 'resolution=merge-duplicates' },
      body: JSON.stringify({
        name,
        email,
        role,
        auth_user_id: authUserId,
      }),
    });
    
    const responseText = await res.text();
    console.log(`  POST status: ${res.status} ${res.statusText}`);
    
    if (!res.ok) {
      // Try PATCH if POST fails
      console.log(`  POST failed, trying PATCH...`);
      const patchRes = await fetch(
        `${restUrl}/employees?email=eq.${encodeURIComponent(email)}`,
        {
          method: 'PATCH',
          headers: { ...headersAuth, Prefer: 'return=representation' },
          body: JSON.stringify({
            name,
            role,
            auth_user_id: authUserId,
          }),
        }
      );
      const patchText = await patchRes.text();
      console.log(`  PATCH status: ${patchRes.status} ${patchRes.statusText}`);
      console.log(`  PATCH response: ${patchText.substring(0, 200)}`);
      
      if (!patchRes.ok) {
        throw new Error(`Failed to create/update employee (${patchRes.status}): ${patchText || patchRes.statusText}`);
      }
      
      if (!patchText || patchText.trim() === '') {
        // Empty response - try to fetch the updated record
        const getRes = await fetch(
          `${restUrl}/employees?email=eq.${encodeURIComponent(email)}&select=*`,
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
        `${restUrl}/employees?email=eq.${encodeURIComponent(email)}&select=*`,
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

async function createOrUpdateClient(name, email, companyName, clientType, authUserId) {
  console.log(`  Creating/updating client record: ${companyName}`);
  try {
    const res = await fetch(`${restUrl}/clients`, {
      method: 'POST',
      headers: { ...headersAuth, Prefer: 'resolution=merge-duplicates' },
      body: JSON.stringify({
        contact_name: name,
        email,
        company_name: companyName,
        client_type: clientType,
        auth_user_id: authUserId,
        health_score: 75,
        health_status: 'good',
        mrr: 0,
      }),
    });
    
    const responseText = await res.text();
    console.log(`  POST status: ${res.status} ${res.statusText}`);
    
    if (!res.ok) {
      // Try PATCH if POST fails
      console.log(`  POST failed, trying PATCH...`);
      const patchRes = await fetch(
        `${restUrl}/clients?email=eq.${encodeURIComponent(email)}`,
        {
          method: 'PATCH',
          headers: { ...headersAuth, Prefer: 'return=representation' },
          body: JSON.stringify({
            contact_name: name,
            company_name: companyName,
            client_type: clientType,
            auth_user_id: authUserId,
          }),
        }
      );
      const patchText = await patchRes.text();
      console.log(`  PATCH status: ${patchRes.status} ${patchRes.statusText}`);
      console.log(`  PATCH response: ${patchText.substring(0, 200)}`);
      
      if (!patchRes.ok) {
        throw new Error(`Failed to create/update client (${patchRes.status}): ${patchText || patchRes.statusText}`);
      }
      
      if (!patchText || patchText.trim() === '') {
        // Empty response - try to fetch the updated record
        const getRes = await fetch(
          `${restUrl}/clients?email=eq.${encodeURIComponent(email)}&select=*`,
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
        `${restUrl}/clients?email=eq.${encodeURIComponent(email)}&select=*`,
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

async function setupUser(user) {
  console.log(`\n📝 Setting up ${user.type}: ${user.name}`);
  console.log('─'.repeat(50));

  try {
    // Step 1: Create auth user
    let authUserId;
    const authResult = await createAuthUser(user.email, user.password);
    if (authResult.existing) {
      console.log('  ℹ️  Auth user already exists. Looking up...');
      authUserId = await findAuthUserByEmail(user.email);
      if (!authUserId) throw new Error('Could not find existing auth user');
      console.log('  ✅ Found existing auth user');
    } else {
      authUserId = authResult.id;
      console.log('  ✅ Created auth user');
    }

    // Step 2: Create/update employee or client record
    if (user.type === 'employee') {
      const employeeResult = await createOrUpdateEmployee(user.name, user.email, user.role, authUserId);
      const employee = Array.isArray(employeeResult) ? employeeResult[0] : employeeResult;
      console.log('  ✅ Employee record:', {
        id: employee.id,
        name: employee.name,
        email: employee.email,
        role: employee.role,
        auth_user_id: employee.auth_user_id,
      });
    } else if (user.type === 'client') {
      const clientResult = await createOrUpdateClient(
        user.name,
        user.email,
        user.companyName,
        user.clientType,
        authUserId
      );
      const client = Array.isArray(clientResult) ? clientResult[0] : clientResult;
      console.log('  ✅ Client record:', {
        id: client.id,
        name: client.contact_name,
        email: client.email,
        company: client.company_name,
        auth_user_id: client.auth_user_id,
      });
    }

    console.log(`\n✅ ${user.name} account setup complete!`);
    console.log(`   Email:    ${user.email}`);
    console.log(`   Password: ${user.password}`);

  } catch (e) {
    console.error(`\n❌ Error setting up ${user.name}:`, e.message);
    if (e.cause) console.error('  Cause:', e.cause.message || e.cause);
    throw e;
  }
}

async function main() {
  console.log('🚀 Creating Employee and Client Users\n');
  console.log('Users to create:');
  USERS.forEach(user => {
    console.log(`  - ${user.type}: ${user.name} (${user.email})`);
  });
  console.log('─'.repeat(50));

  try {
    for (const user of USERS) {
      await setupUser(user);
    }

    console.log('\n✅ All users created successfully!\n');
    console.log('Login Credentials:');
    console.log('─'.repeat(50));
    USERS.forEach(user => {
      console.log(`${user.name} (${user.type}):`);
      console.log(`  Email:    ${user.email}`);
      console.log(`  Password: ${user.password}`);
      console.log('');
    });
    console.log('Note: Users should change their passwords after first login.');

  } catch (e) {
    console.error('\n❌ Setup failed:', e.message);
    if (e.cause) console.error('  Cause:', e.cause.message || e.cause);
    console.error('\nCheck: 1) Internet connection 2) SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in backend/.env');
    process.exit(1);
  }
}

main();
