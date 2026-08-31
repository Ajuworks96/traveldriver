import { prisma } from '../config/database.js';
import { AppError } from '../middleware/error.middleware.js';
import { hashPassword } from '../utils/password.js';
import { Role, UserStatus, VehicleStatus, TripStatus, Prisma } from '@prisma/client';

export class AdminService {
  // 1. Dashboard Statistics
  static async getDashboardStats(startDate?: string, endDate?: string) {
    const dateFilter: Prisma.TripWhereInput = {};
    if (startDate || endDate) {
      const endDateTime = endDate ? new Date(endDate) : undefined;
      if (endDateTime) {
        endDateTime.setHours(23, 59, 59, 999);
      }
      dateFilter.startTime = {
        ...(startDate ? { gte: new Date(startDate) } : {}),
        ...(endDateTime ? { lte: endDateTime } : {}),
      };
    }

    const [
      totalDrivers,
      activeDrivers,
      totalVehicles,
      activeVehicles,
      activeTrips,
      completedTripsCount,
      completedTripsAggregate,
    ] = await Promise.all([
      prisma.user.count({ where: { role: Role.DRIVER } }),
      prisma.user.count({ where: { role: Role.DRIVER, status: UserStatus.ACTIVE } }),
      prisma.vehicle.count(),
      prisma.vehicle.count({ where: { status: VehicleStatus.ACTIVE } }),
      prisma.trip.count({ where: { status: TripStatus.ACTIVE } }),
      prisma.trip.count({
        where: {
          status: TripStatus.COMPLETED,
          ...dateFilter,
        },
      }),
      prisma.trip.aggregate({
        where: {
          status: TripStatus.COMPLETED,
          ...dateFilter,
        },
        _sum: {
          totalKm: true,
          cashAmount: true,
        },
      }),
    ]);

    return {
      totalDrivers,
      activeDrivers,
      totalVehicles,
      activeVehicles,
      activeTrips,
      completedTrips: completedTripsCount,
      totalKm: Number(completedTripsAggregate._sum.totalKm || 0),
      totalCash: Number(completedTripsAggregate._sum.cashAmount || 0),
    };
  }

  // 2. Driver Management
  static async getDrivers(query: { page: number; limit: number; search?: string; status?: UserStatus }) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.max(1, Math.min(100, query.limit || 10));
    const skip = (page - 1) * limit;

    const whereClause: Prisma.UserWhereInput = {
      role: Role.DRIVER,
      ...(query.status ? { status: query.status } : {}),
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: 'insensitive' } },
              { email: { contains: query.search, mode: 'insensitive' } },
              { phone: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [drivers, totalCount] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: { trips: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.user.count({ where: whereClause }),
    ]);

    return {
      drivers,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  }

  static async createDriver(data: { name: string; email: string; password: string; phone?: string; status?: UserStatus }) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase().trim() },
    });

    if (existingUser) {
      throw new AppError('User with this email already exists', 400);
    }

    const passwordHash = await hashPassword(data.password);

    const driver = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase().trim(),
        phone: data.phone,
        passwordHash,
        role: Role.DRIVER,
        status: data.status || UserStatus.ACTIVE,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    return driver;
  }

  static async getDriverById(id: string) {
    const driver = await prisma.user.findFirst({
      where: { id, role: Role.DRIVER },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        trips: {
          take: 5,
          orderBy: { startTime: 'desc' },
          include: {
            vehicle: {
              select: {
                vehicleNumber: true,
                vehicleName: true,
              },
            },
          },
        },
        _count: {
          select: { trips: true },
        },
      },
    });

    if (!driver) {
      throw new AppError('Driver not found', 404);
    }

    return driver;
  }

  static async updateDriver(id: string, data: { name?: string; email?: string; phone?: string }) {
    const driver = await prisma.user.findFirst({
      where: { id, role: Role.DRIVER },
    });

    if (!driver) {
      throw new AppError('Driver not found', 404);
    }

    if (data.email && data.email.toLowerCase().trim() !== driver.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: data.email.toLowerCase().trim() },
      });
      if (emailExists) {
        throw new AppError('Email is already taken by another user', 400);
      }
    }

    const updatedDriver = await prisma.user.update({
      where: { id },
      data: {
        ...(data.name ? { name: data.name } : {}),
        ...(data.email ? { email: data.email.toLowerCase().trim() } : {}),
        ...(data.phone !== undefined ? { phone: data.phone } : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        updatedAt: true,
      },
    });

    return updatedDriver;
  }

  static async updateDriverStatus(id: string, status: UserStatus) {
    const driver = await prisma.user.findFirst({
      where: { id, role: Role.DRIVER },
    });

    if (!driver) {
      throw new AppError('Driver not found', 404);
    }

    const updatedDriver = await prisma.user.update({
      where: { id },
      data: { status },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        updatedAt: true,
      },
    });

    return updatedDriver;
  }

  static async deleteDriver(id: string) {
    const driver = await prisma.user.findFirst({
      where: { id, role: Role.DRIVER },
    });

    if (!driver) {
      throw new AppError('Driver record not found', 404);
    }

    const activeTrip = await prisma.trip.findFirst({
      where: { driverId: id, status: TripStatus.ACTIVE },
    });

    if (activeTrip) {
      throw new AppError('Cannot delete driver while an active trip is in progress', 400);
    }

    await prisma.$transaction([
      prisma.trip.deleteMany({ where: { driverId: id } }),
      prisma.user.delete({ where: { id } }),
    ]);

    return { message: 'Driver record deleted successfully' };
  }

  static async bulkDeleteDrivers(ids: string[]) {
    if (!ids || ids.length === 0) {
      throw new AppError('No driver IDs provided for bulk deletion', 400);
    }

    const activeTrip = await prisma.trip.findFirst({
      where: {
        driverId: { in: ids },
        status: TripStatus.ACTIVE,
      },
    });

    if (activeTrip) {
      throw new AppError('Cannot delete selected drivers because one or more have an active trip in progress', 400);
    }

    await prisma.$transaction([
      prisma.trip.deleteMany({ where: { driverId: { in: ids } } }),
      prisma.user.deleteMany({ where: { id: { in: ids }, role: Role.DRIVER } }),
    ]);

    return { message: `${ids.length} driver records deleted successfully` };
  }

  // 3. Vehicle Management
  static async getVehicles(query: { page: number; limit: number; search?: string; status?: VehicleStatus }) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.max(1, Math.min(100, query.limit || 10));
    const skip = (page - 1) * limit;

    const whereClause: Prisma.VehicleWhereInput = {
      ...(query.status ? { status: query.status } : {}),
      ...(query.search
        ? {
            OR: [
              { vehicleNumber: { contains: query.search, mode: 'insensitive' } },
              { vehicleName: { contains: query.search, mode: 'insensitive' } },
              { model: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [vehicles, totalCount] = await Promise.all([
      prisma.vehicle.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          _count: {
            select: { trips: true },
          },
        },
      }),
      prisma.vehicle.count({ where: whereClause }),
    ]);

    return {
      vehicles,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  }

  static async createVehicle(data: { vehicleNumber: string; vehicleName: string; model: string; status?: VehicleStatus }) {
    const existingVehicle = await prisma.vehicle.findUnique({
      where: { vehicleNumber: data.vehicleNumber.toUpperCase().trim() },
    });

    if (existingVehicle) {
      throw new AppError('Vehicle with this registration number already exists', 400);
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        vehicleNumber: data.vehicleNumber.toUpperCase().trim(),
        vehicleName: data.vehicleName,
        model: data.model,
        status: data.status || VehicleStatus.ACTIVE,
      },
    });

    return vehicle;
  }

  static async getVehicleById(id: string) {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      include: {
        trips: {
          take: 5,
          orderBy: { startTime: 'desc' },
          include: {
            driver: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: { trips: true },
        },
      },
    });

    if (!vehicle) {
      throw new AppError('Vehicle not found', 404);
    }

    return vehicle;
  }

  static async updateVehicle(id: string, data: { vehicleNumber?: string; vehicleName?: string; model?: string }) {
    const vehicle = await prisma.vehicle.findUnique({ where: { id } });
    if (!vehicle) {
      throw new AppError('Vehicle not found', 404);
    }

    if (data.vehicleNumber && data.vehicleNumber.toUpperCase().trim() !== vehicle.vehicleNumber) {
      const exists = await prisma.vehicle.findUnique({
        where: { vehicleNumber: data.vehicleNumber.toUpperCase().trim() },
      });
      if (exists) {
        throw new AppError('Vehicle number already exists', 400);
      }
    }

    const updatedVehicle = await prisma.vehicle.update({
      where: { id },
      data: {
        ...(data.vehicleNumber ? { vehicleNumber: data.vehicleNumber.toUpperCase().trim() } : {}),
        ...(data.vehicleName ? { vehicleName: data.vehicleName } : {}),
        ...(data.model ? { model: data.model } : {}),
      },
    });

    return updatedVehicle;
  }

  static async updateVehicleStatus(id: string, status: VehicleStatus) {
    const vehicle = await prisma.vehicle.findUnique({ where: { id } });
    if (!vehicle) {
      throw new AppError('Vehicle not found', 404);
    }

    const updatedVehicle = await prisma.vehicle.update({
      where: { id },
      data: { status },
    });

    return updatedVehicle;
  }

  static async deleteVehicle(id: string) {
    const vehicle = await prisma.vehicle.findUnique({ where: { id } });
    if (!vehicle) {
      throw new AppError('Vehicle record not found', 404);
    }

    const activeTrip = await prisma.trip.findFirst({
      where: { vehicleId: id, status: TripStatus.ACTIVE },
    });

    if (activeTrip) {
      throw new AppError('Cannot delete vehicle while an active trip is in progress', 400);
    }

    await prisma.$transaction([
      prisma.trip.deleteMany({ where: { vehicleId: id } }),
      prisma.vehicle.delete({ where: { id } }),
    ]);

    return { message: 'Vehicle record deleted successfully' };
  }

  static async bulkDeleteVehicles(ids: string[]) {
    if (!ids || ids.length === 0) {
      throw new AppError('No vehicle IDs provided for bulk deletion', 400);
    }

    const activeTrip = await prisma.trip.findFirst({
      where: {
        vehicleId: { in: ids },
        status: TripStatus.ACTIVE,
      },
    });

    if (activeTrip) {
      throw new AppError('Cannot delete selected vehicles because one or more are assigned to an active trip', 400);
    }

    await prisma.$transaction([
      prisma.trip.deleteMany({ where: { vehicleId: { in: ids } } }),
      prisma.vehicle.deleteMany({ where: { id: { in: ids } } }),
    ]);

    return { message: `${ids.length} vehicle records deleted successfully` };
  }

  // 4. Trip Management for Admin
  static async getTrips(query: {
    page: number;
    limit: number;
    driverId?: string;
    vehicleId?: string;
    status?: TripStatus;
    destination?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.max(1, Math.min(100, query.limit || 10));
    const skip = (page - 1) * limit;

    const whereClause: Prisma.TripWhereInput = {
      ...(query.driverId ? { driverId: query.driverId } : {}),
      ...(query.vehicleId ? { vehicleId: query.vehicleId } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.destination ? { destination: { contains: query.destination, mode: 'insensitive' } } : {}),
      ...(query.startDate || query.endDate
        ? {
            startTime: {
              ...(query.startDate ? { gte: new Date(query.startDate) } : {}),
              ...(query.endDate ? { lte: (() => { const d = new Date(query.endDate); d.setHours(23, 59, 59, 999); return d; })() } : {}),
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
          driver: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
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

  static async getTripById(id: string) {
    const trip = await prisma.trip.findUnique({
      where: { id },
      include: {
        driver: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            status: true,
          },
        },
        vehicle: {
          select: {
            id: true,
            vehicleNumber: true,
            vehicleName: true,
            model: true,
            status: true,
          },
        },
      },
    });

    if (!trip) {
      throw new AppError('Trip record not found', 404);
    }

    return trip;
  }

  // 5. Staff Management (Admins / Super Admins)
  static async createStaff(data: { name: string; email: string; password: string; phone?: string; role?: Role }) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase().trim() },
    });

    if (existingUser) {
      throw new AppError('User with this email already exists', 400);
    }

    const passwordHash = await hashPassword(data.password);
    const staffRole = data.role === Role.SUPER_ADMIN ? Role.SUPER_ADMIN : Role.ADMIN;

    const staff = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase().trim(),
        phone: data.phone,
        passwordHash,
        role: staffRole,
        status: UserStatus.ACTIVE,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    return staff;
  }

  static async getStaffMembers() {
    const staff = await prisma.user.findMany({
      where: {
        role: { in: [Role.ADMIN, Role.SUPER_ADMIN] },
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return staff;
  }

  // 6. Admin / Super Admin Trip Correction & Audit Edits
  static async adminCorrectTrip(
    tripId: string,
    updates: { destination?: string; startKm?: number; closingKm?: number; cashAmount?: number; notes?: string }
  ) {
    const trip = await prisma.trip.findUnique({ where: { id: tripId } });
    if (!trip) {
      throw new AppError('Trip record not found', 404);
    }

    const newStartKm = updates.startKm !== undefined ? updates.startKm : Number(trip.startKm);
    const newClosingKm = updates.closingKm !== undefined ? updates.closingKm : (trip.closingKm ? Number(trip.closingKm) : undefined);

    let newTotalKm = trip.totalKm ? Number(trip.totalKm) : undefined;
    if (newClosingKm !== undefined && newStartKm !== undefined) {
      if (newClosingKm < newStartKm) {
        throw new AppError(`Closing KM (${newClosingKm}) cannot be less than starting KM (${newStartKm})`, 400);
      }
      newTotalKm = newClosingKm - newStartKm;
    }

    const updatedTrip = await prisma.trip.update({
      where: { id: tripId },
      data: {
        ...(updates.destination ? { destination: updates.destination } : {}),
        ...(updates.startKm !== undefined ? { startKm: updates.startKm } : {}),
        ...(updates.closingKm !== undefined ? { closingKm: updates.closingKm } : {}),
        ...(newTotalKm !== undefined ? { totalKm: newTotalKm } : {}),
        ...(updates.cashAmount !== undefined ? { cashAmount: updates.cashAmount } : {}),
        ...(updates.notes !== undefined ? { notes: updates.notes } : {}),
      },
      include: {
        driver: {
          select: { id: true, name: true, email: true, phone: true },
        },
        vehicle: {
          select: { id: true, vehicleNumber: true, vehicleName: true, model: true },
        },
      },
    });

    return updatedTrip;
  }
}
