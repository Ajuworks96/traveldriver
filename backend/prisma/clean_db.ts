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

  // 3. Delete non-seeded drivers
  const deletedDrivers = await prisma.user.deleteMany({
    where: {
      role: Role.DRIVER,
      email: { not: 'driver1@travelagency.com' },
    },
  });
  console.log(`Cleared ${deletedDrivers.count} extra driver accounts.`);

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

  // 5. Ensure Agency Admin account exists
  const adminPasswordHash = await bcrypt.hash('Admin@123456', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@travelagency.com' },
    update: {
      passwordHash: adminPasswordHash,
      status: UserStatus.ACTIVE,
    },
    create: {
      email: 'admin@travelagency.com',
      name: 'Travel Operations Admin',
      phone: '+919876543210',
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
    },
  });

  // 6. Ensure default Driver account exists for mobile app login
  const driverPasswordHash = await bcrypt.hash('Driver@123456', 12);
  const driver = await prisma.user.upsert({
    where: { email: 'driver1@travelagency.com' },
    update: {
      passwordHash: driverPasswordHash,
      status: UserStatus.ACTIVE,
    },
    create: {
      email: 'driver1@travelagency.com',
      name: 'Ramesh Kumar',
      phone: '+919123456789',
      passwordHash: driverPasswordHash,
      role: Role.DRIVER,
      status: UserStatus.ACTIVE,
    },
  });

  console.log(`Master Super Admin Active: ${superAdmin.email}`);
  console.log(`Agency Admin Active: ${admin.email}`);
  console.log(`Driver Account Active: ${driver.email}`);
  console.log('Database credentials verified and reset for live production!');
}

main()
  .catch((e) => {
    console.error('Error cleaning database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
