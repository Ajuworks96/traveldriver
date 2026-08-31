import { Request, Response, NextFunction } from 'express';
import { AdminService } from '../services/admin.service.js';

export class AdminController {
  // Dashboard
  static async getDashboardStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { startDate, endDate } = req.query as { startDate?: string; endDate?: string };
      const stats = await AdminService.getDashboardStats(startDate, endDate);
      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  // Driver Management
  static async getDrivers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AdminService.getDrivers(req.query as any);
      res.status(200).json({
        success: true,
        data: result.drivers,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  static async createDriver(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const driver = await AdminService.createDriver(req.body);
      res.status(201).json({
        success: true,
        message: 'Driver account created successfully',
        data: driver,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getDriverById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const driver = await AdminService.getDriverById(req.params.id);
      res.status(200).json({
        success: true,
        data: driver,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateDriver(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const updated = await AdminService.updateDriver(req.params.id, req.body);
      res.status(200).json({
        success: true,
        message: 'Driver details updated successfully',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateDriverStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const updated = await AdminService.updateDriverStatus(req.params.id, req.body.status);
      res.status(200).json({
        success: true,
        message: 'Driver status updated successfully',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteDriver(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AdminService.deleteDriver(req.params.id);
      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  static async bulkDeleteDrivers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { ids } = req.body as { ids: string[] };
      const result = await AdminService.bulkDeleteDrivers(ids);
      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  // Vehicle Management
  static async getVehicles(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AdminService.getVehicles(req.query as any);
      res.status(200).json({
        success: true,
        data: result.vehicles,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  static async createVehicle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const vehicle = await AdminService.createVehicle(req.body);
      res.status(201).json({
        success: true,
        message: 'Vehicle added to fleet successfully',
        data: vehicle,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getVehicleById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const vehicle = await AdminService.getVehicleById(req.params.id);
      res.status(200).json({
        success: true,
        data: vehicle,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateVehicle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const updated = await AdminService.updateVehicle(req.params.id, req.body);
      res.status(200).json({
        success: true,
        message: 'Vehicle details updated successfully',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateVehicleStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const updated = await AdminService.updateVehicleStatus(req.params.id, req.body.status);
      res.status(200).json({
        success: true,
        message: 'Vehicle status updated successfully',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteVehicle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AdminService.deleteVehicle(req.params.id);
      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  static async bulkDeleteVehicles(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { ids } = req.body as { ids: string[] };
      const result = await AdminService.bulkDeleteVehicles(ids);
      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  // Trip Management for Admin
  static async getTrips(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AdminService.getTrips(req.query as any);
      res.status(200).json({
        success: true,
        data: result.trips,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getTripById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const trip = await AdminService.getTripById(req.params.id);
      res.status(200).json({
        success: true,
        data: trip,
      });
    } catch (error) {
      next(error);
    }
  }

  static async adminCorrectTrip(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const updatedTrip = await AdminService.adminCorrectTrip(req.params.id, req.body);
      res.status(200).json({
        success: true,
        message: 'Trip record corrected successfully by Admin',
        data: updatedTrip,
      });
    } catch (error) {
      next(error);
    }
  }

  // Staff Management (Admins & Super Admin Profile)
  static async createStaff(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const staff = await AdminService.createStaff(req.body);
      res.status(201).json({
        success: true,
        message: 'Staff account created successfully',
        data: staff,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getStaffMembers(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const staff = await AdminService.getStaffMembers();
      res.status(200).json({
        success: true,
        data: staff,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getStaffProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(200).json({
        success: true,
        data: req.user,
      });
    } catch (error) {
      next(error);
    }
  }
}
