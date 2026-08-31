import dotenv from 'dotenv';

dotenv.config();

const VERIFIED_SUPABASE_POOLER_URL =
  'postgresql://postgres:Velvetbyte%402026@db.vbhoyjhsttgsvqzxchhu.supabase.co:6543/postgres?pgbouncer=true';

const rawDbUrl = process.env.DATABASE_URL || '';
let resolvedDbUrl = VERIFIED_SUPABASE_POOLER_URL;

if (rawDbUrl.includes('Velvetbyte')) {
  // If Render env var has port 5432, replace with pooler port 6543 for IPv4 compatibility
  resolvedDbUrl = rawDbUrl.replace(':5432', ':6543');
  if (!resolvedDbUrl.includes('pgbouncer=true')) {
    resolvedDbUrl += (resolvedDbUrl.includes('?') ? '&' : '?') + 'pgbouncer=true';
  }
}

export const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  DATABASE_URL: resolvedDbUrl,
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
  console.log('[INFO] Resolved IPv4 Supabase Pooler DATABASE_URL:', ENV.DATABASE_URL);
};
