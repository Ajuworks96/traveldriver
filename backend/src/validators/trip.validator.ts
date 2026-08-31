import { z } from 'zod';
import { TripStatus } from '@prisma/client';

export const startTripSchema = z.object({
  body: z.object({
    vehicleId: z.string().uuid('Valid vehicle ID is required'),
    startKm: z.number().min(0, 'Starting KM must be zero or greater'),
    destination: z.string().min(2, 'Destination must be at least 2 characters long'),
    notes: z.string().optional(),
  }),
});

export const closeTripSchema = z.object({
  body: z.object({
    closingKm: z.number().min(0, 'Closing KM must be zero or greater'),
    cashAmount: z.number().min(0, 'Cash amount cannot be negative').default(0),
    notes: z.string().optional(),
  }),
  params: z.object({
    id: z.string().uuid('Valid trip ID is required'),
  }),
});

export const getTripByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Valid trip ID is required'),
  }),
});

export const getTripHistorySchema = z.object({
  query: z.object({
    page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
    status: z.nativeEnum(TripStatus).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  }),
});

export type StartTripInput = z.infer<typeof startTripSchema>['body'];
export type CloseTripInput = z.infer<typeof closeTripSchema>['body'];
