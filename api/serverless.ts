if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL =
    'postgresql://postgres:Velvetbyte%402026@db.vbhoyjhsttgsvqzxchhu.supabase.co:5432/postgres?sslmode=no-verify';
}
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'travel_driver_default_jwt_secret_min_32_chars';
}

import { createApp } from '../backend/src/app.js';

const app = createApp();

export default app;
