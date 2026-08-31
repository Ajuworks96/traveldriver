# Production Setup & Deployment Documentation

## System Architecture

The **Travel & Driver Trip Management System** consists of 3 production components:
1. **Backend API**: Node.js + Express + TypeScript + Prisma ORM (`/backend`)
2. **Admin Web Dashboard**: React + Vite + TypeScript (`/admin-dashboard`)
3. **Driver Android Application**: Flutter + Dart (`/driver-app`)
4. **Relational Database**: PostgreSQL 14+

---

## 1. Environment & Database Configuration

### A. Environment Configuration
Copy `.env.example` to `.env` in the `/backend` directory:
```bash
cd backend
cp .env.example .env
```

Edit `.env` and set high-entropy secrets:
```env
PORT=5001
NODE_ENV=production
DATABASE_URL="postgresql://postgres:PROD_PASSWORD@db-host:5432/travel_driver_db?schema=public&sslmode=require"
CORS_ORIGIN="https://admin.youragency.com"
JWT_SECRET="GENERATE_HIGH_ENTROPY_SECRET_AT_LEAST_32_CHARACTERS"
JWT_EXPIRES_IN="1d"
JWT_REFRESH_SECRET="GENERATE_HIGH_ENTROPY_REFRESH_SECRET_MIN_32_CHARS"
JWT_REFRESH_EXPIRES_IN="7d"
LOG_LEVEL="info"
```

### B. Database Migration & Initial Seeding
1. Execute database schema migrations:
   ```bash
   cd backend
   npx prisma migrate deploy
   ```
2. Seed initial production admin user & initial fleet vehicles:
   ```bash
   npm run prisma:seed
   ```

---

## 2. Backend Production Deployment

### A. Build TypeScript Server Bundle
```bash
cd backend
npm install --production=false
npm run build
```

### B. Process Manager Setup (PM2)
Install PM2 globally on the host server:
```bash
npm install -g pm2
```

Start the application with PM2:
```bash
cd backend
pm2 start dist/server.js --name "travel-driver-backend" --instances max --exec-mode cluster
pm2 save
pm2 startup
```

---

## 3. Admin Web Dashboard Deployment

### A. Build Production Static Assets
```bash
cd admin-dashboard
npm install
npm run build
```
The compiled production bundle will be generated in `admin-dashboard/dist/`.

### B. Serve via Nginx Reverse Proxy
Example Nginx site configuration (`/etc/nginx/sites-available/travel-admin`):
```nginx
server {
    listen 80;
    server_name admin.youragency.com;

    root /var/www/travel-driver-management/admin-dashboard/dist;
    index index.html;

    # Static SPA Routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API Requests to Node.js Backend Port 5001
    location /api/ {
        proxy_pass http://127.0.0.1:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site and reload Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/travel-admin /etc/nginx/sites-available/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 4. Driver Android APK Build Instructions

To build the standalone release APK for driver Android mobile devices:

1. Open the `/driver-app` directory:
   ```bash
   cd driver-app
   ```

2. Fetch Flutter package dependencies:
   ```bash
   flutter pub get
   ```

3. Build Release Android APK with Production Backend URL:
   ```bash
   flutter build apk --release --dart-define=API_URL=https://api.youragency.com/api/v1
   ```

4. **APK File Location**:
   The compiled APK binary will be located at:
   `driver-app/build/app/outputs/flutter-apk/app-release.apk`

5. Distribute `app-release.apk` directly to driver mobile devices via internal distribution or direct download.

---

## 5. Final Production Deployment Checklist

- [x] **Backend Build**: Compiled clean without TypeScript errors (`npm run build`).
- [x] **Admin Dashboard Build**: Generated production minified bundle in `admin-dashboard/dist/`.
- [x] **Database Schema**: Schema defined, indexed (`driverId`, `vehicleId`, `status`), and foreign key constraints enforced.
- [x] **Security & Roles**: Zero-trust RBAC enforced (`ADMIN` vs `DRIVER`).
- [x] **Odometer Integrity**: Server-side start KM vs last closing KM validation & backend `totalKm` calculation.
- [x] **Atomic Transactions**: Single active trip restriction per driver and vehicle protected via database transactions.
- [x] **Environment Security**: No hardcoded credentials or plain text passwords. Secrets loaded via environment variables.
- [x] **Compile-time Flutter API URL Injection**: Support for `--dart-define=API_URL=...` during Android APK build.
