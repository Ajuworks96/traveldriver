import { prisma } from '../config/database.js';
import { VehicleStatus } from '@prisma/client';

export class VehicleService {
  static async getAvailableVehicles() {
    const vehicles = await prisma.vehicle.findMany({
      where: {
        status: VehicleStatus.ACTIVE,
      },
      select: {
        id: true,
        vehicleNumber: true,
        vehicleName: true,
        model: true,
        status: true,
      },
      orderBy: { vehicleName: 'asc' },
    });

    return vehicles;
  }
}
