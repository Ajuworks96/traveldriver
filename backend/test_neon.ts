import { PrismaClient } from '@prisma/client';

async function testNeon() {
  const url =
    'postgresql://neondb_owner:npg_7QCVT8JjlAYe@ep-autumn-forest-az3lthl8-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';
  console.log('Testing Neon DB connection...');

  const prisma = new PrismaClient({
    datasourceUrl: url,
  });

  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('[SUCCESS]: Connected to Neon PostgreSQL database!');
  } catch (err: any) {
    console.error('[FAIL]:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

testNeon();
