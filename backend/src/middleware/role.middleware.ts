import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { AppError } from './error.middleware.js';

export const authorize = (...allowedRoles: Role[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AppError('Unauthorized access: User context missing', 401);
    }

    // SUPER_ADMIN automatically inherits ADMIN permissions
    const userRole = req.user.role;
    const isSuperAdmin = userRole === Role.SUPER_ADMIN;
    const isAllowed = allowedRoles.includes(userRole) || (isSuperAdmin && allowedRoles.includes(Role.ADMIN));

    if (!isAllowed) {
      throw new AppError(`Forbidden: Access restricted to ${allowedRoles.join(', ')} roles`, 403);
    }

    next();
  };
};

export const requireRoles = authorize;
