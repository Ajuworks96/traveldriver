import http from 'http';
import { createApp } from '../app.js';
import { prisma, disconnectDatabase } from '../config/database.js';

interface TestCaseResult {
  category: string;
  testCase: string;
  expectedResult: string;
  actualResult: string;
  passed: boolean;
}

async function runFunctionalTestChecklist() {
  console.log('========================================================================');
  console.log('     RUNNING FULL FUNCTIONAL TEST SUITE & VERIFICATION CHECKLIST');
  console.log('========================================================================\n');

  const app = createApp();
  const server = http.createServer(app);

  await new Promise<void>((resolve) => {
    server.listen(5093, () => {
      resolve();
    });
  });

  // Clean state for functional checklist suite
  await prisma.trip.deleteMany();

  const baseUrl = 'http://localhost:5093/api/v1';
  const results: TestCaseResult[] = [];

  function record(category: string, testCase: string, expected: string, actual: string, passed: boolean) {
    results.push({ category, testCase, expectedResult: expected, actualResult: actual, passed });
    const mark = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`[${mark}] ${category} -> ${testCase}`);
  }

  try {
    // ------------------------------------------------------------------------
    // CATEGORY 1: AUTHENTICATION
    // ------------------------------------------------------------------------
    // 1. Admin Login
    const adminLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@travelagency.com', password: 'Admin@123456' }),
    });
    const adminLoginJson = (await adminLoginRes.json()) as any;
    const adminToken = adminLoginJson.data?.accessToken;
    record(
      'AUTHENTICATION',
      'Admin login with valid credentials',
      'HTTP 200 OK & JWT access token returned with role ADMIN',
      `HTTP ${adminLoginRes.status} - Role: ${adminLoginJson.data?.user?.role}`,
      adminLoginRes.status === 200 && adminLoginJson.data?.user?.role === 'ADMIN'
    );

    // 2. Driver Login
    const driver1LoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'driver1@travelagency.com', password: 'Driver@123456' }),
    });
    const driver1LoginJson = (await driver1LoginRes.json()) as any;
    const driver1Token = driver1LoginJson.data?.accessToken;
    const driver1Id = driver1LoginJson.data?.user?.id;
    record(
      'AUTHENTICATION',
      'Driver login with valid credentials',
      'HTTP 200 OK & JWT access token returned with role DRIVER',
      `HTTP ${driver1LoginRes.status} - Role: ${driver1LoginJson.data?.user?.role}`,
      driver1LoginRes.status === 200 && driver1LoginJson.data?.user?.role === 'DRIVER'
    );

    // 3. Invalid Login
    const invalidLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'driver1@travelagency.com', password: 'WrongPassword!' }),
    });
    record(
      'AUTHENTICATION',
      'Login with invalid password',
      'HTTP 401 Unauthorized',
      `HTTP ${invalidLoginRes.status}`,
      invalidLoginRes.status === 401
    );

    // 4. Logout
    const logoutRes = await fetch(`${baseUrl}/auth/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${driver1Token}` },
    });
    record(
      'AUTHENTICATION',
      'Logout request with active token',
      'HTTP 200 OK with success confirmation message',
      `HTTP ${logoutRes.status}`,
      logoutRes.status === 200
    );

    // 5. Unauthorized API Access
    const unauthRes = await fetch(`${baseUrl}/auth/me`);
    record(
      'AUTHENTICATION',
      'Protected API request without token',
      'HTTP 401 Unauthorized',
      `HTTP ${unauthRes.status}`,
      unauthRes.status === 401
    );

    // Driver 2 login for testing
    const driver2LoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'driver2@travelagency.com', password: 'Driver@123456' }),
    });
    const driver2LoginJson = (await driver2LoginRes.json()) as any;
    const driver2Token = driver2LoginJson.data?.accessToken;
    const driver2Id = driver2LoginJson.data?.user?.id;

    // Vehicle lookup
    const vehicle1 = await prisma.vehicle.findFirst({ where: { vehicleNumber: 'KA-01-AB-1234' } });

    // ------------------------------------------------------------------------
    // CATEGORY 2: DRIVER TRIP WORKFLOW
    // ------------------------------------------------------------------------
    // 6. Start Trip
    const startTripRes = await fetch(`${baseUrl}/trips`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${driver1Token}` },
      body: JSON.stringify({
        vehicleId: vehicle1?.id,
        startKm: 5000.0,
        destination: 'Kochi Port',
        notes: 'Express cargo passenger trip',
      }),
    });
    const startTripJson = (await startTripRes.json()) as any;
    const activeTripId = startTripJson.data?.id;
    record(
      'DRIVER',
      'Start trip with valid parameters',
      'HTTP 201 Created with status ACTIVE',
      `HTTP ${startTripRes.status} - Status: ${startTripJson.data?.status}`,
      startTripRes.status === 201 && startTripJson.data?.status === 'ACTIVE'
    );

    // 7. Invalid Starting KM (Negative)
    const invalidStartKmRes = await fetch(`${baseUrl}/trips`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${driver2Token}` },
      body: JSON.stringify({
        vehicleId: vehicle1?.id,
        startKm: -50.0,
        destination: 'Kochi Port',
      }),
    });
    record(
      'DRIVER',
      'Start trip with negative starting KM',
      'HTTP 400 Bad Request validation error',
      `HTTP ${invalidStartKmRes.status}`,
      invalidStartKmRes.status === 400
    );

    // 8. Missing Destination
    const missingDestRes = await fetch(`${baseUrl}/trips`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${driver2Token}` },
      body: JSON.stringify({
        vehicleId: vehicle1?.id,
        startKm: 5000.0,
      }),
    });
    record(
      'DRIVER',
      'Start trip with missing destination',
      'HTTP 400 Bad Request validation error',
      `HTTP ${missingDestRes.status}`,
      missingDestRes.status === 400
    );

    // 9. Invalid Vehicle
    const invalidVehRes = await fetch(`${baseUrl}/trips`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${driver2Token}` },
      body: JSON.stringify({
        vehicleId: '00000000-0000-0000-0000-000000000000',
        startKm: 5000.0,
        destination: 'Kochi Port',
      }),
    });
    record(
      'DRIVER',
      'Start trip with non-existent vehicle ID',
      'HTTP 404 Not Found',
      `HTTP ${invalidVehRes.status}`,
      invalidVehRes.status === 404
    );

    // 10. Duplicate Active Trip for Driver
    const dupDriverTripRes = await fetch(`${baseUrl}/trips`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${driver1Token}` },
      body: JSON.stringify({
        vehicleId: vehicle1?.id,
        startKm: 5100.0,
        destination: 'Trivandrum',
      }),
    });
    record(
      'DRIVER',
      'Driver starting second active trip',
      'HTTP 400 Bad Request - Active trip already in progress',
      `HTTP ${dupDriverTripRes.status}`,
      dupDriverTripRes.status === 400
    );

    // 11. View Active Trip
    const activeTripRes = await fetch(`${baseUrl}/trips/active`, {
      headers: { Authorization: `Bearer ${driver1Token}` },
    });
    const activeTripJson = (await activeTripRes.json()) as any;
    record(
      'DRIVER',
      'View current active trip details',
      'HTTP 200 OK returning active trip object with vehicle',
      `HTTP ${activeTripRes.status} - Destination: ${activeTripJson.data?.destination}`,
      activeTripRes.status === 200 && activeTripJson.data?.id === activeTripId
    );

    // 12. Invalid Closing KM (< Start KM)
    const invalidClosingKmRes = await fetch(`${baseUrl}/trips/${activeTripId}/close`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${driver1Token}` },
      body: JSON.stringify({
        closingKm: 4900.0, // Lower than 5000.0
        cashAmount: 1000.0,
      }),
    });
    record(
      'DRIVER',
      'Close trip with closing KM lower than starting KM',
      'HTTP 400 Bad Request',
      `HTTP ${invalidClosingKmRes.status}`,
      invalidClosingKmRes.status === 400
    );

    // 13. Negative Cash Collection
    const negCashRes = await fetch(`${baseUrl}/trips/${activeTripId}/close`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${driver1Token}` },
      body: JSON.stringify({
        closingKm: 5300.0,
        cashAmount: -500.0,
      }),
    });
    record(
      'DRIVER',
      'Close trip with negative cash collection',
      'HTTP 400 Bad Request',
      `HTTP ${negCashRes.status}`,
      negCashRes.status === 400
    );

    // 14. Close Trip & Total KM Calculation
    const closeTripRes = await fetch(`${baseUrl}/trips/${activeTripId}/close`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${driver1Token}` },
      body: JSON.stringify({
        closingKm: 5350.5,
        cashAmount: 2400.0,
        notes: 'Trip completed successfully',
      }),
    });
    const closeTripJson = (await closeTripRes.json()) as any;
    const totalKmCalculated = Number(closeTripJson.data?.totalKm);
    record(
      'DRIVER',
      'Close trip with valid closing KM and cash',
      'HTTP 200 OK with totalKm = 350.5 KM calculated on backend',
      `HTTP ${closeTripRes.status} - totalKm: ${totalKmCalculated} KM`,
      closeTripRes.status === 200 && totalKmCalculated === 350.5 && closeTripJson.data?.status === 'COMPLETED'
    );

    // 15. Completed Trip History
    const historyRes = await fetch(`${baseUrl}/trips?status=COMPLETED`, {
      headers: { Authorization: `Bearer ${driver1Token}` },
    });
    const historyJson = (await historyRes.json()) as any;
    record(
      'DRIVER',
      'View completed trip history',
      'HTTP 200 OK returning completed trip array',
      `HTTP ${historyRes.status} - Total count: ${historyJson.data?.length}`,
      historyRes.status === 200 && historyJson.data?.length > 0
    );

    // ------------------------------------------------------------------------
    // CATEGORY 3: ADMIN MANAGEMENT & REPORTING
    // ------------------------------------------------------------------------
    // 16. Dashboard Statistics
    const dashRes = await fetch(`${baseUrl}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const dashJson = (await dashRes.json()) as any;
    record(
      'ADMIN',
      'Get executive dashboard statistics',
      'HTTP 200 OK with drivers, vehicles, trips, totalKm, and totalCash',
      `HTTP ${dashRes.status} - Drivers: ${dashJson.data?.totalDrivers}, Cash: ₹${dashJson.data?.totalCash}`,
      dashRes.status === 200 && dashJson.data?.totalDrivers !== undefined
    );

    // 17. Driver Management (List & Create)
    const listDriversRes = await fetch(`${baseUrl}/admin/drivers?page=1&limit=5`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    record(
      'ADMIN',
      'List drivers with pagination',
      'HTTP 200 OK with driver array and pagination object',
      `HTTP ${listDriversRes.status}`,
      listDriversRes.status === 200
    );

    // 18. Vehicle Management (List & Create)
    const listVehiclesRes = await fetch(`${baseUrl}/admin/vehicles?page=1&limit=5`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    record(
      'ADMIN',
      'List vehicle fleet registry',
      'HTTP 200 OK with vehicle array and pagination object',
      `HTTP ${listVehiclesRes.status}`,
      listVehiclesRes.status === 200
    );

    // 19. Active Trips in Admin
    const adminActiveTripsRes = await fetch(`${baseUrl}/admin/trips?status=ACTIVE`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    record(
      'ADMIN',
      'Admin querying active trips',
      'HTTP 200 OK with active trips list',
      `HTTP ${adminActiveTripsRes.status}`,
      adminActiveTripsRes.status === 200
    );

    // 20. Completed Trips in Admin
    const adminCompletedTripsRes = await fetch(`${baseUrl}/admin/trips?status=COMPLETED`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    record(
      'ADMIN',
      'Admin querying completed trips',
      'HTTP 200 OK with completed trips list',
      `HTTP ${adminCompletedTripsRes.status}`,
      adminCompletedTripsRes.status === 200
    );

    // 21. Trip Details in Admin
    const adminTripDetailRes = await fetch(`${baseUrl}/admin/trips/${activeTripId}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const adminTripDetailJson = (await adminTripDetailRes.json()) as any;
    record(
      'ADMIN',
      'Admin inspecting specific trip details',
      'HTTP 200 OK with closingKm, totalKm, cashAmount, driver, and vehicle',
      `HTTP ${adminTripDetailRes.status} - totalKm: ${adminTripDetailJson.data?.totalKm}`,
      adminTripDetailRes.status === 200 && Number(adminTripDetailJson.data?.totalKm) === 350.5
    );

    // ------------------------------------------------------------------------
    // CATEGORY 4: SECURITY & BACKEND BUSINESS RULES
    // ------------------------------------------------------------------------
    // 22. Driver Accessing Another Driver's Trip
    const crossDriverRes = await fetch(`${baseUrl}/trips/${activeTripId}`, {
      headers: { Authorization: `Bearer ${driver2Token}` },
    });
    record(
      'SECURITY',
      'Driver 2 accessing Driver 1 trip details',
      'HTTP 403 Forbidden',
      `HTTP ${crossDriverRes.status}`,
      crossDriverRes.status === 403
    );

    // 23. Driver Accessing Admin APIs
    const driverOnAdminRes = await fetch(`${baseUrl}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${driver1Token}` },
    });
    record(
      'SECURITY',
      'Driver accessing /admin/dashboard',
      'HTTP 403 Forbidden',
      `HTTP ${driverRoleOnAdminResStatus(driverOnAdminRes.status)}`,
      driverOnAdminRes.status === 403
    );

    // 24. Driver Modifying Completed Trip
    const recloseRes = await fetch(`${baseUrl}/trips/${activeTripId}/close`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${driver1Token}` },
      body: JSON.stringify({ closingKm: 6000.0, cashAmount: 5000.0 }),
    });
    record(
      'SECURITY',
      'Driver attempting to re-close/edit completed trip',
      'HTTP 400 Bad Request',
      `HTTP ${recloseRes.status}`,
      recloseRes.status === 400
    );

    // 25. Driver Manipulating totalKm or driverId in payload
    const spoofRes = await fetch(`${baseUrl}/trips`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${driver2Token}` },
      body: JSON.stringify({
        vehicleId: vehicle1?.id,
        startKm: 6000.0,
        destination: 'Goa',
        driverId: driver1Id, // Spoofed driverId in body
        totalKm: 9999.0,     // Spoofed totalKm in body
      }),
    });
    const spoofJson = (await spoofRes.json()) as any;
    record(
      'SECURITY',
      'Payload with spoofed driverId and totalKm',
      'Backend uses authenticated JWT driverId and ignores spoofed values',
      `HTTP ${spoofRes.status} - Assigned DriverId: ${spoofJson.data?.driverId}`,
      spoofRes.status === 201 && spoofJson.data?.driverId === driver2Id && spoofJson.data?.totalKm === null
    );
    const spoofedTripId = spoofJson.data?.id;

    // Clean up spoofed trip
    if (spoofedTripId) {
      await fetch(`${baseUrl}/trips/${spoofedTripId}/close`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${driver2Token}` },
        body: JSON.stringify({ closingKm: 6100.0, cashAmount: 100.0 }),
      });
    }

    // ------------------------------------------------------------------------
    // CATEGORY 5: NETWORK RESILIENCE & FAILURE RECOVERY
    // ------------------------------------------------------------------------
    // 26. Malformed JSON Body
    const malformedJsonRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{ email: "invalid-json", password: ',
    });
    record(
      'NETWORK',
      'Handling malformed JSON request body',
      'HTTP 400 Bad Request error handling without server crash',
      `HTTP ${malformedJsonRes.status}`,
      malformedJsonRes.status === 400
    );

    // 27. Duplicate Submission Recovery / Idempotent Reject
    const dupCloseRes = await fetch(`${baseUrl}/trips/${activeTripId}/close`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${driver1Token}` },
      body: JSON.stringify({ closingKm: 5350.5, cashAmount: 2400.0 }),
    });
    record(
      'NETWORK',
      'Duplicate trip completion submission recovery',
      'HTTP 400 Bad Request returning clear error message',
      `HTTP ${dupCloseRes.status}`,
      dupCloseRes.status === 400
    );

  } finally {
    server.close();
    await disconnectDatabase();
  }

  function driverRoleOnAdminResStatus(status: number) {
    return status;
  }

  // Print Summary Checklist Table
  console.log('\n========================================================================');
  console.log('                 COMPLETE FUNCTIONAL TEST CHECKLIST TABLE');
  console.log('========================================================================\n');
  console.table(
    results.map((r) => ({
      Category: r.category,
      TestCase: r.testCase,
      ExpectedResult: r.expectedResult,
      ActualResult: r.actualResult,
      Status: r.passed ? 'PASS' : 'FAIL',
    }))
  );

  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  console.log(`\nTOTAL FUNCTIONAL TEST CASES: ${total} | PASSED: ${passed} | FAILED: ${total - passed}`);

  if (passed !== total) {
    process.exit(1);
  }
}

runFunctionalTestChecklist().catch((err) => {
  console.error('Checklist execution failed:', err);
  process.exit(1);
});
