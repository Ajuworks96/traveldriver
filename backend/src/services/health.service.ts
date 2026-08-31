import { prisma } from '../config/database.js';

export class HealthService {
  static async checkHealth() {
    let dbStatus = 'disconnected';
    let dbLatencyMs = null;
    let dbError = null;

    try {
      const startTime = Date.now();
      await prisma.$queryRaw`SELECT 1`;
      dbLatencyMs = Date.now() - startTime;
      dbStatus = 'connected';
    } catch (err: any) {
      dbStatus = 'error';
      dbError = err.message || String(err);
    }

    return {
      status: 'OK',
      service: 'Travel & Driver Trip Management API',
      timestamp: new Date().toISOString(),
      database: {
        status: dbStatus,
        latencyMs: dbLatencyMs,
        error: dbError,
      },
      uptime: process.uptime(),
    };
  }
}
