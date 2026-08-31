import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';
import { loginSchema, createUserSchema } from '../validators/auth.validator.js';
import { Role } from '@prisma/client';

const router = Router();

// Public Authentication Endpoints
router.post('/login', validateRequest(loginSchema), AuthController.login);

// Protected Authentication Endpoints
router.get('/me', authenticate, AuthController.getMe);
router.post('/logout', authenticate, AuthController.logout);

// Admin-controlled user registration/creation
router.post(
  '/register',
  authenticate,
  authorize(Role.ADMIN),
  validateRequest(createUserSchema),
  AuthController.register
);

export const authRoutes = router;
