import http from 'http';
import { createApp } from '../app.js';
import { disconnectDatabase } from '../config/database.js';

async function testFoundationHealth() {
  console.log('--- Verifying Phase 1: Backend Foundation & Database Connection ---');

  const app = createApp();
  const server = http.createServer(app);

  await new Promise<void>((resolve) => {
    server.listen(5098, () => {
      resolve();
    });
  });

  const baseUrl = 'http://localhost:5098/api/v1';

  try {
    console.log('Testing GET /api/v1/health ...');
    const res = await fetch(`${baseUrl}/health`);
    const json = (await res.json()) as any;

    console.log('Response Status:', res.status);
    console.log('Response Payload:', JSON.stringify(json, null, 2));

    if (res.status !== 200) {
      throw new Error(`Expected status 200, got ${res.status}`);
    }

    if (!json.success || json.data.database.status !== 'connected') {
      throw new Error('Health check failed or database is not connected');
    }

    console.log('\n✅ PHASE 1 BACKEND FOUNDATION AND DATABASE CONNECTION VERIFIED SUCCESSFULLY');
  } finally {
    server.close();
    await disconnectDatabase();
  }
}

testFoundationHealth().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
