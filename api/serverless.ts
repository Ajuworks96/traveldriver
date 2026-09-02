if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL =
    'postgresql://neondb_owner:npg_7QCVT8JjlAYe@ep-autumn-forest-az3lthl8-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';
}
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'travel_driver_default_jwt_secret_min_32_chars';
}

import { createApp } from '../backend/src/app.js';

const app = createApp();

export default function handler(req: any, res: any) {
  return app(req, res);
}
