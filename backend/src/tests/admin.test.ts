import http from 'http';
import { createApp } from '../app.js';
import { disconnectDatabase } from '../config/database.js';

async function testAdminManagementAPI() {
  console.log('--- Verifying Phase 5: Admin Management APIs ---');

  const app = createApp();
  const server = http.createServer(app);

  await new Promise<void>((resolve) => {
    server.listen(5095, () => {
      resolve();
    });
  });

  const baseUrl = 'http://localhost:5095/api/v1';

  try {
    // 1. Authenticate Admin & Driver
    console.log('[Setup] Authenticating Admin & Driver...');
    const adminLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@travelagency.com',
        password: 'Admin@123456',
      }),
    });
    const adminLoginJson = (await adminLoginRes.json()) as any;
    const adminToken = adminLoginJson.data.accessToken;

    const driverLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'driver1@travelagency.com',
        password: 'Driver@123456',
      }),
    });
    const driverLoginJson = (await driverLoginRes.json()) as any;
    const driverToken = driverLoginJson.data.accessToken;

    // 2. GET /api/admin/dashboard
    console.log('[Test 1] GET /api/admin/dashboard ...');
    const dashRes = await fetch(`${baseUrl}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const dashJson = (await dashRes.json()) as any;
    if (dashRes.status !== 200 || dashJson.data.totalDrivers === undefined) {
      throw new Error(`Dashboard stats failed: ${JSON.stringify(dashJson)}`);
    }
    console.log('✓ Dashboard stats retrieved:', dashJson.data);

    // 3. Driver Management APIs
    console.log('[Test 2] Driver Management (POST, GET, PATCH)...');
    const newEmail = `fleetdriver_${Date.now()}@travelagency.com`;
    const createDriverRes = await fetch(`${baseUrl}/admin/drivers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: 'Fleet Driver Test',
        email: newEmail,
        password: 'DriverPassword@123',
        phone: `+9199000${Math.floor(10000 + Math.random() * 90000)}`,
      }),
    });
    const createDriverJson = (await createDriverRes.json()) as any;
    if (createDriverRes.status !== 201 || !createDriverJson.data.id) {
      throw new Error(`Create driver failed: ${JSON.stringify(createDriverJson)}`);
    }
    const createdDriverId = createDriverJson.data.id;
    console.log('✓ Driver created successfully (HTTP 201).');

    // List drivers with search
    const listDriversRes = await fetch(`${baseUrl}/admin/drivers?search=Fleet Driver Test`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const listDriversJson = (await listDriversRes.json()) as any;
    if (listDriversRes.status !== 200 || listDriversJson.data.length === 0) {
      throw new Error(`List drivers failed: ${JSON.stringify(listDriversJson)}`);
    }

    // Update driver status
    const statusRes = await fetch(`${baseUrl}/admin/drivers/${createdDriverId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ status: 'INACTIVE' }),
    });
    const statusJson = (await statusRes.json()) as any;
    if (statusRes.status !== 200 || statusJson.data.status !== 'INACTIVE') {
      throw new Error(`Update driver status failed: ${JSON.stringify(statusJson)}`);
    }
    console.log('✓ Driver status updated to INACTIVE.');

    // 4. Vehicle Management APIs
    console.log('[Test 3] Vehicle Management (POST, GET, PATCH)...');
    const regNo = `KA-${Math.floor(10 + Math.random() * 89)}-ZZ-${Math.floor(1000 + Math.random() * 8999)}`;
    const createVehRes = await fetch(`${baseUrl}/admin/vehicles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        vehicleNumber: regNo,
        vehicleName: 'Force Urbania',
        model: '2024',
      }),
    });
    const createVehJson = (await createVehRes.json()) as any;
    if (createVehRes.status !== 201 || !createVehJson.data.id) {
      throw new Error(`Create vehicle failed: ${JSON.stringify(createVehJson)}`);
    }
    const vehicleId = createVehJson.data.id;
    console.log('✓ Vehicle created successfully (HTTP 201).');

    // List vehicles
    const listVehRes = await fetch(`${baseUrl}/admin/vehicles?search=${regNo}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const listVehJson = (await listVehRes.json()) as any;
    if (listVehRes.status !== 200 || listVehJson.data.length === 0) {
      throw new Error(`List vehicles failed: ${JSON.stringify(listVehJson)}`);
    }

    // Update vehicle detail
    const updateVehRes = await fetch(`${baseUrl}/admin/vehicles/${vehicleId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ vehicleName: 'Force Urbania Premium' }),
    });
    const updateVehJson = (await updateVehRes.json()) as any;
    if (updateVehRes.status !== 200 || updateVehJson.data.vehicleName !== 'Force Urbania Premium') {
      throw new Error(`Update vehicle failed: ${JSON.stringify(updateVehJson)}`);
    }
    console.log('✓ Vehicle details updated successfully.');

    // 5. Admin Trip Monitoring APIs
    console.log('[Test 4] Admin Trip Monitoring (GET /api/admin/trips)...');
    const tripsRes = await fetch(`${baseUrl}/admin/trips?page=1&limit=5`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const tripsJson = (await tripsRes.json()) as any;
    if (tripsRes.status !== 200 || !Array.isArray(tripsJson.data)) {
      throw new Error(`Admin list trips failed: ${JSON.stringify(tripsJson)}`);
    }
    console.log(`✓ Admin retrieved ${tripsJson.data.length} trips with pagination.`);

    // 6. Security Check: Driver token blocked from Admin API
    console.log('[Test 5] Security Check: Driver accessing Admin endpoints...');
    const forbiddenRes = await fetch(`${baseUrl}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${driverToken}` },
    });
    if (forbiddenRes.status !== 403) {
      throw new Error(`Expected HTTP 403 Forbidden for driver accessing admin dashboard, got ${forbiddenRes.status}`);
    }
    console.log('✓ Security enforced: Driver correctly blocked with HTTP 403 Forbidden.');

    console.log('\n==================================================================');
    console.log('✅ ALL PHASE 5 ADMIN MANAGEMENT API TESTS PASSED 100%');
    console.log('==================================================================');
  } finally {
    server.close();
    await disconnectDatabase();
  }
}

testAdminManagementAPI().catch((err) => {
  console.error('Phase 5 verification failed:', err);
  process.exit(1);
});
