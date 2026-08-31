import { PrismaClient, Role, UserStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Cleaning database for fresh production onboarding...');

  // 1. Delete all trips
  const deletedTrips = await prisma.trip.deleteMany({});
  console.log(`Cleared ${deletedTrips.count} trip records.`);

  // 2. Delete all demo vehicles
  const deletedVehicles = await prisma.vehicle.deleteMany({});
  console.log(`Cleared ${deletedVehicles.count} vehicle records.`);

  // 3. Delete all drivers (keep only ADMIN & SUPER_ADMIN)
  const deletedDrivers = await prisma.user.deleteMany({
    where: {
      role: Role.DRIVER,
    },
  });
  console.log(`Cleared ${deletedDrivers.count} driver accounts.`);

  // 4. Ensure master Super Admin account exists
  const superAdminPasswordHash = await bcrypt.hash('SuperAdmin@123456', 12);
  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@travelagency.com' },
    update: {
      passwordHash: superAdminPasswordHash,
      status: UserStatus.ACTIVE,
    },
    create: {
      email: 'superadmin@travelagency.com',
      name: 'Master Agency Administrator',
      phone: '+919999999999',
      passwordHash: superAdminPasswordHash,
      role: Role.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
    },
  });

  console.log(`Master Super Admin Active: ${superAdmin.email}`);
  console.log('Database successfully reset to a clean state for live production onboarding!');
}

main()
  .catch((e) => {
    console.error('Error cleaning database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
