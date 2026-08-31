import { prisma } from '../config/database.js';

export class HealthService {
  static async checkHealth() {
    let dbStatus = 'disconnected';
    let dbLatencyMs = null;

    try {
      const startTime = Date.now();
      await prisma.$queryRaw`SELECT 1`;
      dbLatencyMs = Date.now() - startTime;
      dbStatus = 'connected';
    } catch {
      dbStatus = 'error';
    }

    return {
      status: 'OK',
      service: 'Travel & Driver Trip Management API',
      timestamp: new Date().toISOString(),
      database: {
        status: dbStatus,
        latencyMs: dbLatencyMs,
      },
      uptime: process.uptime(),
    };
  }
}
