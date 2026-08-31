import { z } from 'zod';
import { UserStatus, VehicleStatus, TripStatus } from '@prisma/client';

export const dashboardQuerySchema = z.object({
  query: z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  }),
});

// Driver validators
export const createDriverSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Valid email address is required'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    phone: z.string().optional(),
    status: z.nativeEnum(UserStatus).optional(),
  }),
});

export const updateDriverSchema = z.object({
  params: z.object({
    id: z.string().uuid('Valid driver ID is required'),
  }),
  body: z.object({
    name: z.string().min(2).optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
  }),
});

export const updateDriverStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid('Valid driver ID is required'),
  }),
  body: z.object({
    status: z.nativeEnum(UserStatus),
  }),
});

export const getDriversQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
    search: z.string().optional(),
    status: z.nativeEnum(UserStatus).optional(),
  }),
});

// Vehicle validators
export const createVehicleSchema = z.object({
  body: z.object({
    vehicleNumber: z.string().min(3, 'Vehicle number is required'),
    vehicleName: z.string().min(2, 'Vehicle name is required'),
    model: z.string().min(1, 'Model is required'),
    status: z.nativeEnum(VehicleStatus).optional(),
  }),
});

export const updateVehicleSchema = z.object({
  params: z.object({
    id: z.string().uuid('Valid vehicle ID is required'),
  }),
  body: z.object({
    vehicleNumber: z.string().min(3).optional(),
    vehicleName: z.string().min(2).optional(),
    model: z.string().min(1).optional(),
  }),
});

export const updateVehicleStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid('Valid vehicle ID is required'),
  }),
  body: z.object({
    status: z.nativeEnum(VehicleStatus),
  }),
});

export const getVehiclesQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
    search: z.string().optional(),
    status: z.nativeEnum(VehicleStatus).optional(),
  }),
});

// Trip query validator for Admin
export const getAdminTripsQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
    driverId: z.string().uuid().optional(),
    vehicleId: z.string().uuid().optional(),
    status: z.nativeEnum(TripStatus).optional(),
    destination: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  }),
});

export const getByIdParamsSchema = z.object({
  params: z.object({
    id: z.string().uuid('Valid UUID ID is required'),
  }),
});

export const createStaffSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Valid email address is required'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    phone: z.string().optional(),
    role: z.enum(['ADMIN', 'SUPER_ADMIN']).optional(),
  }),
});

export const adminUpdateTripSchema = z.object({
  params: z.object({
    id: z.string().uuid('Valid trip ID is required'),
  }),
  body: z.object({
    destination: z.string().min(2).optional(),
    startKm: z.number().min(0, 'Starting KM cannot be negative').optional(),
    closingKm: z.number().min(0, 'Closing KM cannot be negative').optional(),
    cashAmount: z.number().min(0, 'Cash collection cannot be negative').optional(),
    notes: z.string().optional(),
  }),
});

