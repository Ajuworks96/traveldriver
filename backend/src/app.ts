import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { ENV } from './config/env.js';
import { apiRoutes } from './routes/index.js';
import { errorHandler } from './middleware/error.middleware.js';

export const createApp = (): Express => {
  const app = express();

  // Security and base middlewares with permissive CORS for Vercel and local client web apps
  app.use(helmet({ crossOriginResourcePolicy: false, crossOriginOpenerPolicy: false }));
  app.use(
    cors({
      origin: '*',
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  if (ENV.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
  }

  // Mount API routers for both /api/v1 and /api for convenience
  app.use('/api/v1', apiRoutes);
  app.use('/api', apiRoutes);

  // 404 Fallback
  app.use('*', (req, res) => {
    res.status(404).json({
      success: false,
      message: `Route ${req.originalUrl} not found`,
    });
  });

  // Centralized Error Handler
  app.use(errorHandler);

  return app;
};
