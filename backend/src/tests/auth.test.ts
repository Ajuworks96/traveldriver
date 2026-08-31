import http from 'http';
import { createApp } from '../app.js';
import { disconnectDatabase } from '../config/database.js';

async function testAuthenticationAndAuthorization() {
  console.log('--- Verifying Phase 3: Authentication and Authorization ---');

  const app = createApp();
  const server = http.createServer(app);

  await new Promise<void>((resolve) => {
    server.listen(5097, () => {
      resolve();
    });
  });

  const baseUrl = 'http://localhost:5097/api/v1/auth';

  try {
    // 1. Admin Login
    console.log('[Test 1] POST /api/auth/login (Admin)...');
    const adminLoginRes = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@travelagency.com',
        password: 'Admin@123456',
      }),
    });
    const adminLoginJson = (await adminLoginRes.json()) as any;
    if (adminLoginRes.status !== 200 || !adminLoginJson.data.accessToken) {
      throw new Error(`Admin login failed: ${JSON.stringify(adminLoginJson)}`);
    }
    if (adminLoginJson.data.user.passwordHash) {
      throw new Error('SECURITY VIOLATION: passwordHash returned in login response!');
    }
    const adminToken = adminLoginJson.data.accessToken;
    console.log('✓ Admin login successful. JWT token issued.');

    // 2. GET /api/auth/me (Admin)
    console.log('[Test 2] GET /api/auth/me (Admin Profile)...');
    const adminMeRes = await fetch(`${baseUrl}/me`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const adminMeJson = (await adminMeRes.json()) as any;
    if (adminMeRes.status !== 200 || adminMeJson.data.role !== 'ADMIN') {
      throw new Error(`GET /me failed: ${JSON.stringify(adminMeJson)}`);
    }
    if (adminMeJson.data.passwordHash) {
      throw new Error('SECURITY VIOLATION: passwordHash returned in /me response!');
    }
    console.log('✓ Admin profile fetched successfully. No passwordHash leaked.');

    // 3. Admin Creating a New Driver User
    console.log('[Test 3] POST /api/auth/register (Admin creating new driver)...');
    const newDriverEmail = `newdriver_${Date.now()}@travelagency.com`;
    const createDriverRes = await fetch(`${baseUrl}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: 'New Test Driver',
        email: newDriverEmail,
        password: 'DriverPassword@123',
        phone: `+9199${Math.floor(10000000 + Math.random() * 90000000)}`,
        role: 'DRIVER',
      }),
    });
    const createDriverJson = (await createDriverRes.json()) as any;
    if (createDriverRes.status !== 201 || !createDriverJson.data.id) {
      throw new Error(`Admin driver creation failed: ${JSON.stringify(createDriverJson)}`);
    }
    console.log('✓ Driver account created successfully by Admin (HTTP 201).');

    // 4. Newly Created Driver Login
    console.log('[Test 4] POST /api/auth/login (New Driver)...');
    const driverLoginRes = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: newDriverEmail,
        password: 'DriverPassword@123',
      }),
    });
    const driverLoginJson = (await driverLoginRes.json()) as any;
    if (driverLoginRes.status !== 200 || driverLoginJson.data.user.role !== 'DRIVER') {
      throw new Error(`Driver login failed: ${JSON.stringify(driverLoginJson)}`);
    }
    const driverToken = driverLoginJson.data.accessToken;
    console.log('✓ New Driver logged in successfully.');

    // 5. Authorization Check: Driver trying to create users (Admin route)
    console.log('[Test 5] Authorization check: Driver attempting Admin route...');
    const forbiddenRes = await fetch(`${baseUrl}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${driverToken}`,
      },
      body: JSON.stringify({
        name: 'Hacker',
        email: 'hacker@travelagency.com',
        password: 'HackPassword@123',
        role: 'ADMIN',
      }),
    });
    if (forbiddenRes.status !== 403) {
      throw new Error(`Expected HTTP 403 Forbidden, got ${forbiddenRes.status}`);
    }
    console.log('✓ Authorization enforced: Driver correctly blocked with HTTP 403 Forbidden.');

    // 6. Unauthenticated Access Check
    console.log('[Test 6] Authentication check: Requesting /me without token...');
    const unauthRes = await fetch(`${baseUrl}/me`);
    if (unauthRes.status !== 401) {
      throw new Error(`Expected HTTP 401 Unauthorized, got ${unauthRes.status}`);
    }
    console.log('✓ Authentication enforced: Unauthenticated request rejected with HTTP 401.');

    // 7. Invalid Credentials Check
    console.log('[Test 7] Login check: Wrong password...');
    const wrongPassRes = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@travelagency.com',
        password: 'WrongPassword!',
      }),
    });
    if (wrongPassRes.status !== 401) {
      throw new Error(`Expected HTTP 401 for wrong password, got ${wrongPassRes.status}`);
    }
    console.log('✓ Invalid password correctly rejected with HTTP 401.');

    // 8. Logout Strategy
    console.log('[Test 8] POST /api/auth/logout ...');
    const logoutRes = await fetch(`${baseUrl}/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${driverToken}` },
    });
    if (logoutRes.status !== 200) {
      throw new Error(`Expected 200 for logout, got ${logoutRes.status}`);
    }
    console.log('✓ Logout endpoint responded successfully (HTTP 200).');

    console.log('\n==================================================================');
    console.log('✅ ALL PHASE 3 AUTHENTICATION & AUTHORIZATION TESTS PASSED 100%');
    console.log('==================================================================');
  } finally {
    server.close();
    await disconnectDatabase();
  }
}

testAuthenticationAndAuthorization().catch((err) => {
  console.error('Phase 3 verification failed:', err);
  process.exit(1);
});
