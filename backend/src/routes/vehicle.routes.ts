import { Router } from 'express';
import { VehicleController } from '../controllers/vehicle.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);
router.use(authorize(Role.DRIVER, Role.ADMIN));

router.get('/', VehicleController.getAvailableVehicles);

export const vehicleRoutes = router;
