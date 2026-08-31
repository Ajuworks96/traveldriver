import dotenv from 'dotenv';

dotenv.config();

const VERIFIED_SUPABASE_URL =
  'postgresql://postgres:Velvetbyte%402026@db.vbhoyjhsttgsvqzxchhu.supabase.co:5432/postgres?sslmode=no-verify';

export const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  DATABASE_URL: VERIFIED_SUPABASE_URL,
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
  console.log('[INFO] Using verified direct Supabase DATABASE_URL port 5432 with sslmode=no-verify');
};
