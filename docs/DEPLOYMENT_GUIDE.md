# GymApp Deployment Guide

## Overview

This guide covers deploying the GymApp project, which consists of three main components:
- **Backend API** (Express.js + MongoDB)
- **Mobile App** (React Native + Expo)
- **Web Admin Panel** (React.js + Vite)

## Prerequisites

- Node.js 18+ and npm
- MongoDB (local or Atlas)
- Git
- For mobile app: Expo CLI and Expo Go app
- For production: PM2, Nginx (optional)

## Environment Setup

### Backend Environment Variables

Create `.env` file in the `backend/` directory:

```env
# Server Configuration
PORT=3001
NODE_ENV=production

# Database
MONGODB_URI=mongodb://localhost:27017/gymapp
# For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/gymapp

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:3000,http://localhost:19006

# Stripe Configuration (for payments)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# AI Configuration (optional)
AI_API_KEY=your_ai_api_key

# File Upload Configuration
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Web Admin Environment Variables

Create `.env` file in the `web-admin/` directory:

```env
VITE_API_URL=http://localhost:3001/api
VITE_APP_NAME=GymApp Admin
VITE_APP_VERSION=1.0.0
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_NOTIFICATIONS=true
```

### Mobile App Environment Variables

Create `.env` file in the `mobile-app/` directory:

```env
EXPO_PUBLIC_API_URL=http://localhost:3001/api
EXPO_PUBLIC_APP_NAME=GymApp
EXPO_PUBLIC_APP_VERSION=1.0.0
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

## Local Development Setup

### 1. Backend Setup

```bash
cd backend
npm install
npm run dev
```

The backend will start on `http://localhost:3001`

### 2. Web Admin Setup

```bash
cd web-admin
npm install
npm run dev
```

The web admin will start on `http://localhost:5173`

### 3. Mobile App Setup

```bash
cd mobile-app
npm install
npx expo start
```

Scan the QR code with Expo Go app on your mobile device.

## Production Deployment

### Backend Deployment

#### Option 1: Using PM2 (Recommended)

1. **Install PM2 globally:**
```bash
npm install -g pm2
```

2. **Build the backend:**
```bash
cd backend
npm run build
```

3. **Create PM2 ecosystem file:**
```bash
# Create ecosystem.config.js in backend directory
```

```javascript
module.exports = {
  apps: [{
    name: 'gymapp-backend',
    script: 'dist/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
```

4. **Start with PM2:**
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### Option 2: Using Docker

1. **Create Dockerfile in backend directory:**
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3001

CMD ["node", "dist/server.js"]
```

2. **Build and run:**
```bash
docker build -t gymapp-backend .
docker run -p 3001:3001 --env-file .env gymapp-backend
```

### Web Admin Deployment

#### Option 1: Static Hosting (Vercel/Netlify)

1. **Build the project:**
```bash
cd web-admin
npm run build
```

2. **Deploy to Vercel:**
```bash
npm install -g vercel
vercel --prod
```

3. **Deploy to Netlify:**
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

#### Option 2: Using Nginx

1. **Build the project:**
```bash
cd web-admin
npm run build
```

2. **Configure Nginx:**
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/web-admin/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Mobile App Deployment

#### Development Build

1. **Start Expo development server:**
```bash
cd mobile-app
npx expo start
```

2. **Build for development:**
```bash
npx expo build:android
npx expo build:ios
```

#### Production Build

1. **Configure app.json for production:**
```json
{
  "expo": {
    "name": "GymApp",
    "slug": "gymapp",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "updates": {
      "fallbackToCacheTimeout": 0
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.yourcompany.gymapp"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#FFFFFF"
      },
      "package": "com.yourcompany.gymapp"
    },
    "web": {
      "favicon": "./assets/favicon.png"
    }
  }
}
```

2. **Build for production:**
```bash
# Android
npx expo build:android --type apk

# iOS
npx expo build:ios --type archive
```

3. **Submit to app stores:**
```bash
# Android (Google Play)
npx expo upload:android

# iOS (App Store)
npx expo upload:ios
```

## Database Setup

### MongoDB Atlas (Recommended for Production)

1. **Create MongoDB Atlas account**
2. **Create a new cluster**
3. **Configure network access (whitelist IPs)**
4. **Create database user**
5. **Get connection string**
6. **Update MONGODB_URI in .env**

### Local MongoDB

1. **Install MongoDB:**
```bash
# macOS
brew tap mongodb/brew
brew install mongodb-community

# Ubuntu
sudo apt-get install mongodb

# Windows
# Download from https://www.mongodb.com/try/download/community
```

2. **Start MongoDB:**
```bash
# macOS
brew services start mongodb-community

# Ubuntu
sudo systemctl start mongod

# Windows
# Start MongoDB service
```

3. **Create database:**
```bash
mongo
use gymapp
```

## SSL/HTTPS Setup

### Using Let's Encrypt (Free SSL)

1. **Install Certbot:**
```bash
sudo apt-get install certbot python3-certbot-nginx
```

2. **Obtain SSL certificate:**
```bash
sudo certbot --nginx -d your-domain.com
```

3. **Auto-renewal:**
```bash
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Using Cloudflare (Recommended)

1. **Add domain to Cloudflare**
2. **Update nameservers**
3. **Enable SSL/TLS encryption**
4. **Configure page rules for API**

## Monitoring and Logging

### PM2 Monitoring

```bash
# Monitor processes
pm2 monit

# View logs
pm2 logs

# Restart application
pm2 restart gymapp-backend
```

### Application Logs

```bash
# Backend logs
tail -f backend/logs/combined.log

# Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### Health Checks

The API includes a health check endpoint:
```bash
curl http://localhost:3001/api/health
```

## Performance Optimization

### Backend Optimization

1. **Enable compression:**
```javascript
app.use(compression());
```

2. **Use Redis for caching:**
```bash
npm install redis
```

3. **Database indexing:**
```javascript
// Add indexes in models
UserSchema.index({ email: 1 });
ClassSchema.index({ type: 1, status: 1 });
```

### Frontend Optimization

1. **Code splitting:**
```javascript
const LazyComponent = React.lazy(() => import('./Component'));
```

2. **Image optimization:**
```javascript
// Use WebP format
// Implement lazy loading
```

3. **Bundle analysis:**
```bash
npm run build -- --analyze
```

## Security Checklist

- [ ] Change default JWT secret
- [ ] Use strong database passwords
- [ ] Enable HTTPS
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Enable security headers
- [ ] Regular security updates
- [ ] Database backup strategy
- [ ] Environment variables secured
- [ ] API endpoints protected

## Backup Strategy

### Database Backup

```bash
# MongoDB backup
mongodump --uri="mongodb://localhost:27017/gymapp" --out=./backup

# Restore
mongorestore --uri="mongodb://localhost:27017/gymapp" ./backup/gymapp
```

### Automated Backups

```bash
# Create backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mongodump --uri="mongodb://localhost:27017/gymapp" --out=./backups/backup_$DATE
find ./backups -name "backup_*" -mtime +7 -delete
```

## Troubleshooting

### Common Issues

1. **Port already in use:**
```bash
lsof -ti:3001 | xargs kill -9
```

2. **MongoDB connection failed:**
```bash
# Check if MongoDB is running
sudo systemctl status mongod
```

3. **Build failures:**
```bash
# Clear npm cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

4. **Permission issues:**
```bash
sudo chown -R $USER:$USER /path/to/project
```

### Log Analysis

```bash
# Check PM2 logs
pm2 logs --lines 100

# Check system resources
htop
df -h
free -h
```

## Scaling Considerations

### Horizontal Scaling

1. **Load Balancer (Nginx):**
```nginx
upstream backend {
    server 127.0.0.1:3001;
    server 127.0.0.1:3002;
    server 127.0.0.1:3003;
}
```

2. **Database Replication:**
```javascript
// MongoDB replica set
const uri = "mongodb://primary:27017,secondary:27017,arbiter:27017/gymapp?replicaSet=rs0";
```

3. **Redis Cluster:**
```javascript
// Redis cluster for session storage
const redis = new Redis.Cluster([
  { host: '127.0.0.1', port: 7000 },
  { host: '127.0.0.1', port: 7001 },
  { host: '127.0.0.1', port: 7002 }
]);
```

### Vertical Scaling

1. **Increase server resources**
2. **Optimize database queries**
3. **Implement caching strategies**
4. **Use CDN for static assets**

## Maintenance

### Regular Tasks

- [ ] Update dependencies monthly
- [ ] Monitor disk space
- [ ] Check error logs
- [ ] Backup database weekly
- [ ] Security updates
- [ ] Performance monitoring
- [ ] SSL certificate renewal

### Update Process

1. **Backup current version**
2. **Test updates in staging**
3. **Deploy to production**
4. **Monitor for issues**
5. **Rollback if necessary**

This deployment guide provides a comprehensive approach to deploying and maintaining the GymApp project in both development and production environments.
