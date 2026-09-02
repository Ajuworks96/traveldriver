import { PrismaClient } from '@prisma/client';

const regions = [
  'aws-0-ap-south-1',
  'aws-0-ap-southeast-1',
  'aws-0-ap-northeast-1',
  'aws-0-eu-central-1',
  'aws-0-eu-west-1',
  'aws-0-us-east-1',
  'aws-0-us-west-1',
  'aws-0-sa-east-1',
  'aws-0-ca-central-1',
];

async function checkPooler(region: string) {
  const host = `${region}.pooler.supabase.com`;
  const url = `postgresql://postgres.vbhoyjhsttgsvqzxchhu:Velvetbyte%402026@${host}:6543/postgres?pgbouncer=true&sslmode=require`;
  
  const prisma = new PrismaClient({
    datasourceUrl: url,
  });

  try {
    const startTime = Date.now();
    const user = await prisma.user.findFirst();
    const duration = Date.now() - startTime;
    console.log(`\n========================================`);
    console.log(`[SUCCESS!!!] MATCH FOUND: ${host}`);
    console.log(`URL: ${url}`);
    console.log(`Query Latency: ${duration}ms`);
    console.log(`User Email: ${user?.email}`);
    console.log(`========================================\n`);
    return url;
  } catch (err: any) {
    console.log(`[FAIL] ${host} -> ${err.message.split('\n')[0]}`);
    return null;
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  console.log('Scanning all Supabase AWS Region Poolers for project vbhoyjhsttgsvqzxchhu...\n');
  for (const region of regions) {
    const workingUrl = await checkPooler(region);
    if (workingUrl) {
      process.exit(0);
    }
  }
  console.log('No regional pooler match found.');
}

main();
