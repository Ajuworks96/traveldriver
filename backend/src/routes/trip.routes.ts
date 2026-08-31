import { Router } from 'express';
import { TripController } from '../controllers/trip.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import {
  startTripSchema,
  closeTripSchema,
  getTripByIdSchema,
  getTripHistorySchema,
} from '../validators/trip.validator.js';
import { Role } from '@prisma/client';

const router = Router();

// Protect all driver trip routes with Driver authentication & authorization
router.use(authenticate);
router.use(authorize(Role.DRIVER));

// Driver Trip Management Endpoints
router.post('/', validateRequest(startTripSchema), TripController.startTrip);
router.get('/active', TripController.getActiveTrip);
router.patch('/:id/close', validateRequest(closeTripSchema), TripController.closeTrip);
router.get('/', validateRequest(getTripHistorySchema), TripController.getTripHistory);
router.get('/:id', validateRequest(getTripByIdSchema), TripController.getTripById);

export const tripRoutes = router;
