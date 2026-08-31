import { Request, Response, NextFunction } from 'express';
import { TripService } from '../services/trip.service.js';

export class TripController {
  static async startTrip(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const driverId = req.user!.userId;
      const trip = await TripService.startTrip(driverId, req.body);
      res.status(201).json({
        success: true,
        message: 'Trip started successfully',
        data: trip,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getActiveTrip(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const driverId = req.user!.userId;
      const activeTrip = await TripService.getActiveTrip(driverId);
      res.status(200).json({
        success: true,
        message: activeTrip ? 'Active trip retrieved' : 'No active trip in progress',
        data: activeTrip,
      });
    } catch (error) {
      next(error);
    }
  }

  static async closeTrip(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const driverId = req.user!.userId;
      const tripId = req.params.id;
      const closedTrip = await TripService.closeTrip(driverId, tripId, req.body);
      res.status(200).json({
        success: true,
        message: 'Trip completed successfully',
        data: closedTrip,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getTripHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const driverId = req.user!.userId;
      const result = await TripService.getDriverTrips(driverId, req.query as any);
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
      const driverId = req.user!.userId;
      const tripId = req.params.id;
      const trip = await TripService.getTripById(driverId, tripId);
      res.status(200).json({
        success: true,
        data: trip,
      });
    } catch (error) {
      next(error);
    }
  }
}
