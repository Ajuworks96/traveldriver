import { PrismaClient, Role, UserStatus, VehicleStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Phase 2 database entities...');

  const adminPasswordHash = await bcrypt.hash('Admin@123456', 12);
  const driverPasswordHash = await bcrypt.hash('Driver@123456', 12);

  const superAdminPasswordHash = await bcrypt.hash('SuperAdmin@123456', 12);

  // 1. Create Default Super Admin
  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@travelagency.com' },
    update: {},
    create: {
      email: 'superadmin@travelagency.com',
      name: 'Executive Super Admin',
      phone: '+919999999999',
      passwordHash: superAdminPasswordHash,
      role: Role.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
    },
  });
  console.log(`Created/Verified Super Admin User: ${superAdmin.name} (${superAdmin.email})`);

  // 2. Create Default Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@travelagency.com' },
    update: {},
    create: {
      email: 'admin@travelagency.com',
      name: 'System Administrator',
      phone: '+919876543210',
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
    },
  });
  console.log(`Created/Verified Admin User: ${admin.name} (${admin.email})`);

  // 2. Create Demo Drivers
  const driver1 = await prisma.user.upsert({
    where: { email: 'driver1@travelagency.com' },
    update: {},
    create: {
      email: 'driver1@travelagency.com',
      name: 'Ramesh Kumar',
      phone: '+919876543211',
      passwordHash: driverPasswordHash,
      role: Role.DRIVER,
      status: UserStatus.ACTIVE,
    },
  });
  console.log(`Created/Verified Driver 1: ${driver1.name} (${driver1.email})`);

  const driver2 = await prisma.user.upsert({
    where: { email: 'driver2@travelagency.com' },
    update: {},
    create: {
      email: 'driver2@travelagency.com',
      name: 'Suresh Babu',
      phone: '+919876543212',
      passwordHash: driverPasswordHash,
      role: Role.DRIVER,
      status: UserStatus.ACTIVE,
    },
  });
  console.log(`Created/Verified Driver 2: ${driver2.name} (${driver2.email})`);

  // 3. Create Demo Vehicles
  const vehicle1 = await prisma.vehicle.upsert({
    where: { vehicleNumber: 'KA-01-AB-1234' },
    update: {},
    create: {
      vehicleNumber: 'KA-01-AB-1234',
      vehicleName: 'Toyota Innova Crysta',
      model: '2023',
      status: VehicleStatus.ACTIVE,
    },
  });
  console.log(`Created/Verified Vehicle 1: ${vehicle1.vehicleNumber} - ${vehicle1.vehicleName}`);

  const vehicle2 = await prisma.vehicle.upsert({
    where: { vehicleNumber: 'KA-01-XY-5678' },
    update: {},
    create: {
      vehicleNumber: 'KA-01-XY-5678',
      vehicleName: 'Maruti Suzuki Dzire',
      model: '2022',
      status: VehicleStatus.ACTIVE,
    },
  });
  console.log(`Created/Verified Vehicle 2: ${vehicle2.vehicleNumber} - ${vehicle2.vehicleName}`);

  console.log('Phase 2 Database seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
