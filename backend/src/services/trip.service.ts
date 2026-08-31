import { prisma } from '../config/database.js';
import { AppError } from '../middleware/error.middleware.js';
import { StartTripInput, CloseTripInput } from '../validators/trip.validator.js';
import { TripStatus, Prisma } from '@prisma/client';

export class TripService {
  static async startTrip(driverId: string, data: StartTripInput) {
    return prisma.$transaction(async (tx) => {
      // 1. Verify vehicle exists and is active
      const vehicle = await tx.vehicle.findUnique({
        where: { id: data.vehicleId },
      });

      if (!vehicle) {
        throw new AppError('Vehicle not found', 404);
      }

      if (vehicle.status !== 'ACTIVE') {
        throw new AppError('Vehicle is inactive and cannot be assigned to a trip', 400);
      }

      // 2. Check if driver already has an ACTIVE trip
      const existingDriverTrip = await tx.trip.findFirst({
        where: {
          driverId,
          status: TripStatus.ACTIVE,
        },
      });

      if (existingDriverTrip) {
        throw new AppError('Driver already has an active trip in progress', 400);
      }

      // 3. Check if vehicle already has an ACTIVE trip
      const existingVehicleTrip = await tx.trip.findFirst({
        where: {
          vehicleId: data.vehicleId,
          status: TripStatus.ACTIVE,
        },
      });

      if (existingVehicleTrip) {
        throw new AppError('Vehicle is currently assigned to another active trip', 400);
      }

      // 4. Vehicle Odometer Regression Protection
      const lastCompletedTrip = await tx.trip.findFirst({
        where: {
          vehicleId: data.vehicleId,
          status: TripStatus.COMPLETED,
        },
        orderBy: { endTime: 'desc' },
      });

      if (lastCompletedTrip && lastCompletedTrip.closingKm) {
        const lastClosingKmNum = Number(lastCompletedTrip.closingKm);
        if (data.startKm < lastClosingKmNum) {
          throw new AppError(
            `Starting KM (${data.startKm}) cannot be lower than the vehicle's last recorded closing KM (${lastClosingKmNum})`,
            400
          );
        }
      }

      // 5. Create new ACTIVE trip
      const trip = await tx.trip.create({
        data: {
          driverId,
          vehicleId: data.vehicleId,
          startKm: new Prisma.Decimal(data.startKm),
          destination: data.destination,
          notes: data.notes,
          status: TripStatus.ACTIVE,
          startTime: new Date(),
        },
        include: {
          vehicle: {
            select: {
              id: true,
              vehicleNumber: true,
              vehicleName: true,
              model: true,
            },
          },
        },
      });

      return trip;
    });
  }

  static async getActiveTrip(driverId: string) {
    const activeTrip = await prisma.trip.findFirst({
      where: {
        driverId,
        status: TripStatus.ACTIVE,
      },
      include: {
        vehicle: {
          select: {
            id: true,
            vehicleNumber: true,
            vehicleName: true,
            model: true,
          },
        },
      },
    });

    return activeTrip;
  }

  static async closeTrip(driverId: string, tripId: string, data: CloseTripInput) {
    return prisma.$transaction(async (tx) => {
      // 1. Fetch trip
      const trip = await tx.trip.findUnique({
        where: { id: tripId },
        include: {
          vehicle: {
            select: {
              id: true,
              vehicleNumber: true,
              vehicleName: true,
              model: true,
            },
          },
        },
      });

      if (!trip) {
        throw new AppError('Trip record not found', 404);
      }

      // 2. Ownership Check
      if (trip.driverId !== driverId) {
        throw new AppError('Forbidden: You can only close your own trips', 403);
      }

      // 3. Verify trip status is ACTIVE
      if (trip.status !== TripStatus.ACTIVE) {
        throw new AppError('Trip is already completed and cannot be modified', 400);
      }

      const startKmNum = Number(trip.startKm);
      const closingKmNum = data.closingKm;

      // 4. Validate closingKm >= startKm
      if (closingKmNum < startKmNum) {
        throw new AppError(
          `Closing KM (${closingKmNum}) cannot be lower than starting KM (${startKmNum})`,
          400
        );
      }

      // 5. Backend calculated totalKm
      const calculatedTotalKm = closingKmNum - startKmNum;

      // 6. Update trip record to COMPLETED
      const updatedTrip = await tx.trip.update({
        where: { id: tripId },
        data: {
          closingKm: new Prisma.Decimal(closingKmNum),
          totalKm: new Prisma.Decimal(calculatedTotalKm),
          cashAmount: new Prisma.Decimal(data.cashAmount),
          notes: data.notes ? data.notes : trip.notes,
          endTime: new Date(),
          status: TripStatus.COMPLETED,
        },
        include: {
          vehicle: {
            select: {
              id: true,
              vehicleNumber: true,
              vehicleName: true,
              model: true,
            },
          },
        },
      });

      return updatedTrip;
    });
  }

  static async getDriverTrips(
    driverId: string,
    query: { page: number; limit: number; status?: TripStatus; startDate?: string; endDate?: string }
  ) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.max(1, Math.min(100, query.limit || 10));
    const skip = (page - 1) * limit;

    const whereClause: Prisma.TripWhereInput = {
      driverId,
      ...(query.status ? { status: query.status } : {}),
      ...(query.startDate || query.endDate
        ? {
            startTime: {
              ...(query.startDate ? { gte: new Date(query.startDate) } : {}),
              ...(query.endDate ? { lte: new Date(query.endDate) } : {}),
            },
          }
        : {}),
    };

    const [trips, totalCount] = await Promise.all([
      prisma.trip.findMany({
        where: whereClause,
        orderBy: { startTime: 'desc' },
        skip,
        take: limit,
        include: {
          vehicle: {
            select: {
              id: true,
              vehicleNumber: true,
              vehicleName: true,
              model: true,
            },
          },
        },
      }),
      prisma.trip.count({ where: whereClause }),
    ]);

    return {
      trips,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  }

  static async getTripById(driverId: string, tripId: string) {
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        vehicle: {
          select: {
            id: true,
            vehicleNumber: true,
            vehicleName: true,
            model: true,
          },
        },
        driver: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!trip) {
      throw new AppError('Trip record not found', 404);
    }

    if (trip.driverId !== driverId) {
      throw new AppError('Forbidden: You can only view your own trip details', 403);
    }

    return trip;
  }
}
