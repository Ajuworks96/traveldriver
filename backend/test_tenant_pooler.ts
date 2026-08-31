import { PrismaClient } from '@prisma/client';

const regions = [
  'aws-0-ap-south-1.pooler.supabase.com',
  'aws-0-ap-southeast-1.pooler.supabase.com',
  'aws-0-eu-central-1.pooler.supabase.com',
  'aws-0-us-east-1.pooler.supabase.com',
  'aws-0-us-west-1.pooler.supabase.com',
  'db.vbhoyjhsttgsvqzxchhu.supabase.co',
];

async function testRegion(host: string) {
  const isDirect = host.includes('supabase.co');
  const userStr = isDirect ? 'postgres' : 'postgres.vbhoyjhsttgsvqzxchhu';
  const port = isDirect ? 5432 : 6543;
  const pgbouncer = isDirect ? '' : '?pgbouncer=true';
  const url = `postgresql://${userStr}:Velvetbyte%402026@${host}:${port}/postgres${pgbouncer}`;

  const prisma = new PrismaClient({ datasourceUrl: url });
  try {
    const user = await prisma.user.findFirst();
    console.log(`[SUCCESS] ${host}:${port} -> Found user ${user?.email}`);
    return true;
  } catch (err: any) {
    console.log(`[FAIL] ${host}:${port} -> ${err.message.split('\n')[0]}`);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  for (const host of regions) {
    await testRegion(host);
  }
}

main();
