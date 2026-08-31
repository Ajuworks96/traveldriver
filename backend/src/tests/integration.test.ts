import http from 'http';
import { createApp } from '../app.js';
import { prisma, disconnectDatabase } from '../config/database.js';

async function runFullSystemIntegrationTest() {
  console.log('========================================================================');
  console.log('       STARTING PHASE 8: FULL END-TO-END SYSTEM INTEGRATION SUITE');
  console.log('========================================================================\n');

  const app = createApp();
  const server = http.createServer(app);

  await new Promise<void>((resolve) => {
    server.listen(5094, () => {
      resolve();
    });
  });

  // Clean state for integration suite
  await prisma.trip.deleteMany();

  const baseUrl = 'http://localhost:5094/api/v1';

  try {
    // ------------------------------------------------------------------------
    // TEST 1: Driver Login
    // ------------------------------------------------------------------------
    console.log('[E2E Test 1/18] Driver login...');
    const d1LoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'driver1@travelagency.com',
        password: 'Driver@123456',
      }),
    });
    const d1LoginJson = (await d1LoginRes.json()) as any;
    if (d1LoginRes.status !== 200 || d1LoginJson.data.user.role !== 'DRIVER') {
      throw new Error(`Test 1 Failed: Driver login unsuccessful: ${JSON.stringify(d1LoginJson)}`);
    }
    const driver1Token = d1LoginJson.data.accessToken;
    const driver1Id = d1LoginJson.data.user.id;
    console.log('✓ PASS: Driver 1 logged in successfully.');

    // ------------------------------------------------------------------------
    // TEST 2: Admin Login
    // ------------------------------------------------------------------------
    console.log('[E2E Test 2/18] Admin login...');
    const adminLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@travelagency.com',
        password: 'Admin@123456',
      }),
    });
    const adminLoginJson = (await adminLoginRes.json()) as any;
    if (adminLoginRes.status !== 200 || adminLoginJson.data.user.role !== 'ADMIN') {
      throw new Error(`Test 2 Failed: Admin login unsuccessful: ${JSON.stringify(adminLoginJson)}`);
    }
    const adminToken = adminLoginJson.data.accessToken;
    console.log('✓ PASS: Admin logged in successfully.');

    // Driver 2 Login for isolation checks
    const d2LoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'driver2@travelagency.com',
        password: 'Driver@123456',
      }),
    });
    const d2LoginJson = (await d2LoginRes.json()) as any;
    const driver2Token = d2LoginJson.data.accessToken;
    const driver2Id = d2LoginJson.data.user.id;

    // Fetch vehicle 1
    const vehicle1 = await prisma.vehicle.findFirst({
      where: { vehicleNumber: 'KA-01-AB-1234' },
    });
    if (!vehicle1) throw new Error('Vehicle 1 seed data not found');

    // ------------------------------------------------------------------------
    // TEST 3: Driver Starts a Trip
    // ------------------------------------------------------------------------
    console.log('[E2E Test 3/18] Driver starts a trip...');
    const startRes = await fetch(`${baseUrl}/trips`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${driver1Token}`,
      },
      body: JSON.stringify({
        vehicleId: vehicle1.id,
        startKm: 6000.0,
        destination: 'Chennai Central Station',
        notes: 'Interstate passenger trip',
      }),
    });
    const startJson = (await startRes.json()) as any;
    if (startRes.status !== 201 || !startJson.data.id) {
      throw new Error(`Test 3 Failed: Start trip failed: ${JSON.stringify(startJson)}`);
    }
    const activeTripId = startJson.data.id;
    if (startJson.data.status !== 'ACTIVE' || startJson.data.totalKm !== null) {
      throw new Error('Test 3 Failed: Initial trip status or totalKm incorrect');
    }
    console.log('✓ PASS: Driver 1 started trip successfully.');

    // ------------------------------------------------------------------------
    // TEST 4: Admin Sees Active Trip
    // ------------------------------------------------------------------------
    console.log('[E2E Test 4/18] Admin sees the active trip...');
    const adminActiveRes = await fetch(`${baseUrl}/admin/trips?status=ACTIVE`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const adminActiveJson = (await adminActiveRes.json()) as any;
    const foundActiveInAdmin = adminActiveJson.data.find((t: any) => t.id === activeTripId);
    if (adminActiveRes.status !== 200 || !foundActiveInAdmin) {
      throw new Error(`Test 4 Failed: Admin could not see active trip: ${JSON.stringify(adminActiveJson)}`);
    }
    console.log('✓ PASS: Admin real-time dashboard sees active trip.');

    // ------------------------------------------------------------------------
    // TEST 5: Driver Cannot Start a Second Active Trip
    // ------------------------------------------------------------------------
    console.log('[E2E Test 5/18] Driver cannot start a second active trip...');
    const dupStartRes = await fetch(`${baseUrl}/trips`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${driver1Token}`,
      },
      body: JSON.stringify({
        vehicleId: vehicle1.id,
        startKm: 6050.0,
        destination: 'Coimbatore',
      }),
    });
    if (dupStartRes.status !== 400) {
      throw new Error(`Test 5 Failed: Expected 400 Bad Request, got ${dupStartRes.status}`);
    }
    console.log('✓ PASS: Driver 2nd active trip blocked with HTTP 400.');

    // ------------------------------------------------------------------------
    // TEST 6: Another Driver Cannot Access First Driver's Trip
    // ------------------------------------------------------------------------
    console.log('[E2E Test 6/18] Another driver cannot access first driver trip...');
    const d2AccessRes = await fetch(`${baseUrl}/trips/${activeTripId}`, {
      headers: { Authorization: `Bearer ${driver2Token}` },
    });
    if (d2AccessRes.status !== 403) {
      throw new Error(`Test 6 Failed: Expected 403 Forbidden for cross-driver access, got ${d2AccessRes.status}`);
    }
    console.log('✓ PASS: Cross-driver trip access blocked with HTTP 403 Forbidden.');

    // ------------------------------------------------------------------------
    // TEST 7: Same Vehicle Cannot Be Used for Another Active Trip
    // ------------------------------------------------------------------------
    console.log('[E2E Test 7/18] Same vehicle cannot be used for another active trip...');
    const vDupRes = await fetch(`${baseUrl}/trips`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${driver2Token}`,
      },
      body: JSON.stringify({
        vehicleId: vehicle1.id, // Vehicle 1 already in active trip
        startKm: 7000.0,
        destination: 'Kochi',
      }),
    });
    if (vDupRes.status !== 400) {
      throw new Error(`Test 7 Failed: Expected 400 Bad Request for vehicle in use, got ${vDupRes.status}`);
    }
    console.log('✓ PASS: Vehicle active trip collision blocked with HTTP 400.');

    // ------------------------------------------------------------------------
    // TEST 8: Driver Closes the Trip
    // ------------------------------------------------------------------------
    console.log('[E2E Test 8/18] Driver closes the trip...');
    const closeRes = await fetch(`${baseUrl}/trips/${activeTripId}/close`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${driver1Token}`,
      },
      body: JSON.stringify({
        closingKm: 6250.0,
        cashAmount: 1500.0,
        notes: 'Trip completed smoothly',
      }),
    });
    const closeJson = (await closeRes.json()) as any;
    if (closeRes.status !== 200 || closeJson.data.status !== 'COMPLETED') {
      throw new Error(`Test 8 Failed: Close trip failed: ${JSON.stringify(closeJson)}`);
    }
    console.log('✓ PASS: Driver closed trip successfully.');

    // ------------------------------------------------------------------------
    // TEST 9: Backend Calculates totalKm
    // ------------------------------------------------------------------------
    console.log('[E2E Test 9/18] Backend calculates totalKm...');
    const calculatedTotal = Number(closeJson.data.totalKm);
    if (calculatedTotal !== 250.0) { // 6250.0 - 6000.0 = 250.0
      throw new Error(`Test 9 Failed: Incorrect totalKm calculated. Expected 250.0, got ${calculatedTotal}`);
    }
    console.log('✓ PASS: Backend computed totalKm = 250.0 KM accurately.');

    // ------------------------------------------------------------------------
    // TEST 10: Admin Sees Closing KM
    // ------------------------------------------------------------------------
    console.log('[E2E Test 10/18] Admin sees closing KM...');
    const adminTripDetailRes = await fetch(`${baseUrl}/admin/trips/${activeTripId}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const adminTripDetailJson = (await adminTripDetailRes.json()) as any;
    if (adminTripDetailRes.status !== 200 || Number(adminTripDetailJson.data.closingKm) !== 6250.0) {
      throw new Error(`Test 10 Failed: Admin detail closingKm mismatch: ${JSON.stringify(adminTripDetailJson)}`);
    }
    console.log('✓ PASS: Admin verified closing KM = 6250.00.');

    // ------------------------------------------------------------------------
    // TEST 11: Admin Sees Total KM
    // ------------------------------------------------------------------------
    console.log('[E2E Test 11/18] Admin sees total KM...');
    if (Number(adminTripDetailJson.data.totalKm) !== 250.0) {
      throw new Error('Test 11 Failed: Admin totalKm mismatch');
    }
    console.log('✓ PASS: Admin verified total KM = 250.00.');

    // ------------------------------------------------------------------------
    // TEST 12: Admin Sees Cash Collection
    // ------------------------------------------------------------------------
    console.log('[E2E Test 12/18] Admin sees cash collection...');
    if (Number(adminTripDetailJson.data.cashAmount) !== 1500.0) {
      throw new Error('Test 12 Failed: Admin cashAmount mismatch');
    }
    console.log('✓ PASS: Admin verified cash collection = ₹1500.00.');

    // ------------------------------------------------------------------------
    // TEST 13: Completed Trip Appears in History
    // ------------------------------------------------------------------------
    console.log('[E2E Test 13/18] Completed trip appears in driver history...');
    const historyRes = await fetch(`${baseUrl}/trips?status=COMPLETED`, {
      headers: { Authorization: `Bearer ${driver1Token}` },
    });
    const historyJson = (await historyRes.json()) as any;
    const inHistory = historyJson.data.find((t: any) => t.id === activeTripId);
    if (historyRes.status !== 200 || !inHistory) {
      throw new Error(`Test 13 Failed: Trip not found in history: ${JSON.stringify(historyJson)}`);
    }
    console.log('✓ PASS: Completed trip appears in driver trip history.');

    // ------------------------------------------------------------------------
    // TEST 14: Driver Cannot Modify Completed Trip
    // ------------------------------------------------------------------------
    console.log('[E2E Test 14/18] Driver cannot modify completed trip...');
    const recloseRes = await fetch(`${baseUrl}/trips/${activeTripId}/close`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${driver1Token}`,
      },
      body: JSON.stringify({
        closingKm: 1300.0,
        cashAmount: 2000.0,
      }),
    });
    if (recloseRes.status !== 400) {
      throw new Error(`Test 14 Failed: Expected 400 Bad Request for editing completed trip, got ${recloseRes.status}`);
    }
    console.log('✓ PASS: Modifying completed trip blocked with HTTP 400 Bad Request.');

    // ------------------------------------------------------------------------
    // TEST 15: Admin Can Filter Trips
    // ------------------------------------------------------------------------
    console.log('[E2E Test 15/18] Admin can filter trips...');
    const filterRes = await fetch(`${baseUrl}/admin/trips?driverId=${driver1Id}&status=COMPLETED&destination=Chennai`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const filterJson = (await filterRes.json()) as any;
    if (filterRes.status !== 200 || filterJson.data.length === 0) {
      throw new Error(`Test 15 Failed: Admin trip filtering failed: ${JSON.stringify(filterJson)}`);
    }
    console.log('✓ PASS: Admin filtered trips successfully.');

    // ------------------------------------------------------------------------
    // TEST 16: Admin Can View Driver Records
    // ------------------------------------------------------------------------
    console.log('[E2E Test 16/18] Admin can view driver records...');
    const adminDriversRes = await fetch(`${baseUrl}/admin/drivers/${driver1Id}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const adminDriverJson = (await adminDriversRes.json()) as any;
    if (adminDriversRes.status !== 200 || adminDriverJson.data.id !== driver1Id) {
      throw new Error(`Test 16 Failed: Admin view driver failed: ${JSON.stringify(adminDriverJson)}`);
    }
    console.log('✓ PASS: Admin retrieved driver record and trip counts.');

    // ------------------------------------------------------------------------
    // TEST 17: Admin Can View Vehicle Records
    // ------------------------------------------------------------------------
    console.log('[E2E Test 17/18] Admin can view vehicle records...');
    const adminVehicleRes = await fetch(`${baseUrl}/admin/vehicles/${vehicle1.id}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const adminVehicleJson = (await adminVehicleRes.json()) as any;
    if (adminVehicleRes.status !== 200 || adminVehicleJson.data.id !== vehicle1.id) {
      throw new Error(`Test 17 Failed: Admin view vehicle failed: ${JSON.stringify(adminVehicleJson)}`);
    }
    console.log('✓ PASS: Admin retrieved vehicle record and fleet status.');

    // ------------------------------------------------------------------------
    // TEST 18: Unauthorized Users Cannot Access Protected APIs
    // ------------------------------------------------------------------------
    console.log('[E2E Test 18/18] Unauthorized users cannot access protected APIs...');
    const noTokenRes = await fetch(`${baseUrl}/admin/dashboard`);
    if (noTokenRes.status !== 401) {
      throw new Error(`Test 18 Failed: Expected 401 for no token, got ${noTokenRes.status}`);
    }
    const driverRoleOnAdminRes = await fetch(`${baseUrl}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${driver1Token}` },
    });
    if (driverRoleOnAdminRes.status !== 403) {
      throw new Error(`Test 18 Failed: Expected 403 for driver accessing admin, got ${driverRoleOnAdminRes.status}`);
    }
    console.log('✓ PASS: Zero-trust authentication and role authorization enforced.');

    console.log('\n========================================================================');
    console.log('🎉 ALL 18 SYSTEM INTEGRATION VERIFICATION TESTS PASSED 100%');
    console.log('========================================================================\n');
  } finally {
    server.close();
    await disconnectDatabase();
  }
}

runFullSystemIntegrationTest().catch((err) => {
  console.error('Integration test suite failed:', err);
  process.exit(1);
});
