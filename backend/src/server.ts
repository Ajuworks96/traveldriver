import { createApp } from './app.js';
import { ENV, validateEnv } from './config/env.js';
import { connectDatabase } from './config/database.js';
import { logger } from './utils/logger.js';

validateEnv();

const app = createApp();

const startServer = async () => {
  try {
    // 1. Establish PostgreSQL Database connection via Prisma
    await connectDatabase();
    logger.info('Connected to PostgreSQL Database successfully');

    // 2. Start HTTP Server
    app.listen(ENV.PORT, () => {
      logger.info(`Server running in [${ENV.NODE_ENV}] mode on http://localhost:${ENV.PORT}`);
      logger.info(`API Base URL: http://localhost:${ENV.PORT}/api/v1`);
      logger.info(`Health check: http://localhost:${ENV.PORT}/api/v1/health`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
