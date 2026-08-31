import { Router } from 'express';
import { healthRoutes } from './health.routes.js';
import { authRoutes } from './auth.routes.js';
import { tripRoutes } from './trip.routes.js';
import { adminRoutes } from './admin.routes.js';
import { vehicleRoutes } from './vehicle.routes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/trips', tripRoutes);
router.use('/admin', adminRoutes);
router.use('/vehicles', vehicleRoutes);

export const apiRoutes = router;
