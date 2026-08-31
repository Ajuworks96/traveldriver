import http from 'http';
import { createApp } from '../app.js';
import { prisma, disconnectDatabase } from '../config/database.js';

async function testDriverTripManagement() {
  console.log('--- Verifying Phase 4: Driver Trip Management API ---');

  const app = createApp();
  const server = http.createServer(app);

  await new Promise<void>((resolve) => {
    server.listen(5096, () => {
      resolve();
    });
  });

  // Reset trip state for clean test execution
  await prisma.trip.deleteMany();

  const baseUrl = 'http://localhost:5096/api/v1';

  try {
    // 1. Authenticate Driver 1 & Driver 2
    console.log('[Setup] Authenticating Driver 1 & Driver 2...');
    const driver1Res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'driver1@travelagency.com',
        password: 'Driver@123456',
      }),
    });
    const driver1Json = (await driver1Res.json()) as any;
    const driver1Token = driver1Json.data.accessToken;

    const driver2Res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'driver2@travelagency.com',
        password: 'Driver@123456',
      }),
    });
    const driver2Json = (await driver2Res.json()) as any;
    const driver2Token = driver2Json.data.accessToken;

    // Fetch active vehicle ID from database seed
    const vehicle = await prisma.vehicle.findFirst({
      where: { vehicleNumber: 'KA-01-AB-1234' },
    });
    if (!vehicle) throw new Error('Vehicle seed data not found');

    // 2. Start Trip Test
    console.log('[Test 1] POST /api/trips (Start Trip)...');
    const startRes = await fetch(`${baseUrl}/trips`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${driver1Token}`,
      },
      body: JSON.stringify({
        vehicleId: vehicle.id,
        startKm: 5000.0,
        destination: 'Bangalore Airport (BLR)',
        notes: 'Morning pick-up trip',
      }),
    });
    const startJson = (await startRes.json()) as any;
    if (startRes.status !== 201 || !startJson.data.id) {
      throw new Error(`Start trip failed: ${JSON.stringify(startJson)}`);
    }
    const tripId = startJson.data.id;
    if (startJson.data.status !== 'ACTIVE' || startJson.data.totalKm !== null) {
      throw new Error(`Invalid initial trip status or totalKm: ${JSON.stringify(startJson)}`);
    }
    console.log('✓ Trip started successfully (HTTP 201, status: ACTIVE).');

    // 3. Duplicate Active Trip Rejection
    console.log('[Test 2] POST /api/trips (Prevent second active trip for same driver)...');
    const dupStartRes = await fetch(`${baseUrl}/trips`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${driver1Token}`,
      },
      body: JSON.stringify({
        vehicleId: vehicle.id,
        startKm: 5050.0,
        destination: 'Mysore Road',
      }),
    });
    if (dupStartRes.status !== 400) {
      throw new Error(`Expected HTTP 400 for duplicate active trip, got ${dupStartRes.status}`);
    }
    console.log('✓ Second active trip correctly rejected (HTTP 400).');

    // 4. View Active Trip
    console.log('[Test 3] GET /api/trips/active ...');
    const activeRes = await fetch(`${baseUrl}/trips/active`, {
      headers: { Authorization: `Bearer ${driver1Token}` },
    });
    const activeJson = (await activeRes.json()) as any;
    if (activeRes.status !== 200 || activeJson.data.id !== tripId) {
      throw new Error(`Get active trip failed: ${JSON.stringify(activeJson)}`);
    }
    console.log('✓ Active trip retrieved successfully.');

    // 5. Validation Check: Closing KM < Starting KM
    console.log('[Test 4] PATCH /api/trips/:id/close (Reject closingKm < startKm)...');
    const invalidCloseRes = await fetch(`${baseUrl}/trips/${tripId}/close`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${driver1Token}`,
      },
      body: JSON.stringify({
        closingKm: 4950.0, // Lower than 5000.0
        cashAmount: 500.0,
      }),
    });
    if (invalidCloseRes.status !== 400) {
      throw new Error(`Expected HTTP 400 for invalid closing KM, got ${invalidCloseRes.status}`);
    }
    console.log('✓ Invalid closing KM correctly rejected (HTTP 400).');

    // 6. Ownership Security Check: Driver 2 trying to close Driver 1's trip
    console.log('[Test 5] Ownership check: Driver 2 attempting to close Driver 1 trip...');
    const forbiddenCloseRes = await fetch(`${baseUrl}/trips/${tripId}/close`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${driver2Token}`,
      },
      body: JSON.stringify({
        closingKm: 5100.0,
        cashAmount: 500.0,
      }),
    });
    if (forbiddenCloseRes.status !== 403) {
      throw new Error(`Expected HTTP 403 Forbidden for unowned trip close, got ${forbiddenCloseRes.status}`);
    }
    console.log('✓ Unowned trip close correctly blocked with HTTP 403 Forbidden.');

    // 7. Successful Close Trip
    console.log('[Test 6] PATCH /api/trips/:id/close (Valid Close Trip)...');
    const closeRes = await fetch(`${baseUrl}/trips/${tripId}/close`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${driver1Token}`,
      },
      body: JSON.stringify({
        closingKm: 5150.5,
        cashAmount: 1250.0,
        notes: 'Trip completed on schedule',
      }),
    });
    const closeJson = (await closeRes.json()) as any;
    if (closeRes.status !== 200 || closeJson.data.status !== 'COMPLETED') {
      throw new Error(`Close trip failed: ${JSON.stringify(closeJson)}`);
    }
    if (Number(closeJson.data.totalKm) !== 150.5) { // 2150.5 - 2000.0 = 150.5
      throw new Error(`Incorrect totalKm calculated. Expected 150.5, got ${closeJson.data.totalKm}`);
    }
    console.log('✓ Trip completed successfully (status: COMPLETED, totalKm: 150.5 calculated on backend).');

    // 8. Completed Trip Modification Rejection
    console.log('[Test 7] Prevent editing completed trip...');
    const recloseRes = await fetch(`${baseUrl}/trips/${tripId}/close`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${driver1Token}`,
      },
      body: JSON.stringify({
        closingKm: 1200.0,
        cashAmount: 2000.0,
      }),
    });
    if (recloseRes.status !== 400) {
      throw new Error(`Expected HTTP 400 when modifying completed trip, got ${recloseRes.status}`);
    }
    console.log('✓ Modifying completed trip correctly blocked (HTTP 400).');

    // 9. View Trip History & Details
    console.log('[Test 8] GET /api/trips (Trip History) & GET /api/trips/:id ...');
    const historyRes = await fetch(`${baseUrl}/trips?status=COMPLETED`, {
      headers: { Authorization: `Bearer ${driver1Token}` },
    });
    const historyJson = (await historyRes.json()) as any;
    if (historyRes.status !== 200 || historyJson.data.length === 0) {
      throw new Error(`Trip history failed: ${JSON.stringify(historyJson)}`);
    }

    const detailRes = await fetch(`${baseUrl}/trips/${tripId}`, {
      headers: { Authorization: `Bearer ${driver1Token}` },
    });
    const detailJson = (await detailRes.json()) as any;
    if (detailRes.status !== 200 || detailJson.data.id !== tripId) {
      throw new Error(`Trip details failed: ${JSON.stringify(detailJson)}`);
    }
    console.log('✓ Trip history and trip details retrieved successfully.');

    console.log('\n================================================================');
    console.log('✅ ALL PHASE 4 DRIVER TRIP MANAGEMENT API TESTS PASSED 100%');
    console.log('================================================================');
  } finally {
    server.close();
    await disconnectDatabase();
  }
}

testDriverTripManagement().catch((err) => {
  console.error('Phase 4 verification failed:', err);
  process.exit(1);
});
