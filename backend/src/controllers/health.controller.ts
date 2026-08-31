import { Request, Response, NextFunction } from 'express';
import { HealthService } from '../services/health.service.js';

export class HealthController {
  static async checkHealth(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const healthData = await HealthService.checkHealth();
      const statusCode = healthData.database.status === 'connected' ? 200 : 503;
      res.status(statusCode).json({
        success: healthData.database.status === 'connected',
        message: 'Travel & Driver Management System API Health Check',
        data: healthData,
      });
    } catch (error) {
      next(error);
    }
  }
}
