import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import {
  dashboardQuerySchema,
  createDriverSchema,
  updateDriverSchema,
  updateDriverStatusSchema,
  getDriversQuerySchema,
  createVehicleSchema,
  updateVehicleSchema,
  updateVehicleStatusSchema,
  getVehiclesQuerySchema,
  getAdminTripsQuerySchema,
  getByIdParamsSchema,
  createStaffSchema,
  adminUpdateTripSchema,
} from '../validators/admin.validator.js';
import { Role } from '@prisma/client';

const router = Router();

// Enforce Admin / Super Admin Authentication & Authorization across all routes
router.use(authenticate);
router.use(authorize(Role.ADMIN));

// 1. Dashboard
router.get('/dashboard', validateRequest(dashboardQuerySchema), AdminController.getDashboardStats);

// 2. Staff & Profile Management
router.get('/staff', AdminController.getStaffMembers);
router.post('/staff', validateRequest(createStaffSchema), AdminController.createStaff);
router.get('/staff/me', AdminController.getStaffProfile);

// 3. Driver Management
router.get('/drivers', validateRequest(getDriversQuerySchema), AdminController.getDrivers);
router.post('/drivers', validateRequest(createDriverSchema), AdminController.createDriver);
router.post('/drivers/bulk-delete', AdminController.bulkDeleteDrivers);
router.get('/drivers/:id', validateRequest(getByIdParamsSchema), AdminController.getDriverById);
router.patch('/drivers/:id', validateRequest(updateDriverSchema), AdminController.updateDriver);
router.patch('/drivers/:id/status', validateRequest(updateDriverStatusSchema), AdminController.updateDriverStatus);
router.delete('/drivers/:id', validateRequest(getByIdParamsSchema), AdminController.deleteDriver);

// 4. Vehicle Management
router.get('/vehicles', validateRequest(getVehiclesQuerySchema), AdminController.getVehicles);
router.post('/vehicles', validateRequest(createVehicleSchema), AdminController.createVehicle);
router.post('/vehicles/bulk-delete', AdminController.bulkDeleteVehicles);
router.get('/vehicles/:id', validateRequest(getByIdParamsSchema), AdminController.getVehicleById);
router.patch('/vehicles/:id', validateRequest(updateVehicleSchema), AdminController.updateVehicle);
router.patch('/vehicles/:id/status', validateRequest(updateVehicleStatusSchema), AdminController.updateVehicleStatus);
router.delete('/vehicles/:id', validateRequest(getByIdParamsSchema), AdminController.deleteVehicle);

// 5. Trip Management & Admin Trip Correction
router.get('/trips', validateRequest(getAdminTripsQuerySchema), AdminController.getTrips);
router.get('/trips/:id', validateRequest(getByIdParamsSchema), AdminController.getTripById);
router.patch('/trips/:id', validateRequest(adminUpdateTripSchema), AdminController.adminCorrectTrip);

export const adminRoutes = router;
