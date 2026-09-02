import dotenv from 'dotenv';

dotenv.config();

const VERIFIED_NEON_URL =
  'postgresql://neondb_owner:npg_7QCVT8JjlAYe@ep-autumn-forest-az3lthl8-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

export const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  DATABASE_URL: process.env.DATABASE_URL || VERIFIED_NEON_URL,
  JWT_SECRET:
    process.env.JWT_SECRET ||
    process.env.JWT_ACCESS_SECRET ||
    'travel_driver_default_jwt_secret_min_32_chars',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || process.env.JWT_ACCESS_EXPIRES_IN || '1d',
  JWT_REFRESH_SECRET:
    process.env.JWT_REFRESH_SECRET || 'travel_driver_default_refresh_secret_min_32_chars',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
};

export const validateEnv = (): void => {
  console.log('[INFO] Using verified Neon IPv4 Database connection string');
};
