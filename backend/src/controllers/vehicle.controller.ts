import { Request, Response, NextFunction } from 'express';
import { VehicleService } from '../services/vehicle.service.js';

export class VehicleController {
  static async getAvailableVehicles(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const vehicles = await VehicleService.getAvailableVehicles();
      res.status(200).json({
        success: true,
        data: vehicles,
      });
    } catch (error) {
      next(error);
    }
  }
}
