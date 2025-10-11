# Gurukul Platform Deployment Guide

## Production Deployment Options

### Option 1: Traditional VPS/Server Deployment

#### Prerequisites
- Ubuntu 20.04+ or CentOS 8+ server
- Node.js 16+ installed
- MongoDB 5.0+ installed
- Nginx for reverse proxy
- SSL certificate (Let's Encrypt recommended)
- Domain name configured

#### Backend Deployment

1. **Server Setup**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-5.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/5.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-5.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

2. **Deploy Backend**
```bash
# Clone repository
git clone <your-repo-url>
cd gurukul-platform/backend

# Install dependencies
npm install --production

# Create production environment file
cp .env.example .env
# Edit .env with production values

# Install PM2 for process management
sudo npm install -g pm2

# Start application
pm2 start server.js --name "gurukul-backend"
pm2 startup
pm2 save
```

3. **Nginx Configuration**
```nginx
server {
    listen 80;
    server_name api.yourdomian.com;
    
    location / {
        proxy_pass http://localhost:5000;
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

#### Frontend Deployment

1. **Build Frontend**
```bash
cd ../frontend
npm install
npm run build
```

2. **Nginx Configuration for Frontend**
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /path/to/gurukul-platform/frontend/build;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /static/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

3. **SSL Setup with Let's Encrypt**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d api.yourdomain.com
```

### Option 2: Docker Deployment

#### Docker Compose Configuration

```yaml
# docker-compose.yml
version: '3.8'

services:
  mongodb:
    image: mongo:5.0
    container_name: gurukul-mongo
    restart: unless-stopped
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: your_secure_password
    volumes:
      - mongodb_data:/data/db
    networks:
      - gurukul-network

  backend:
    build: ./backend
    container_name: gurukul-backend
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://admin:your_secure_password@mongodb:27017/gurukul?authSource=admin
      - JWT_SECRET=your_jwt_secret
      - IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
      - IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
      - IMAGEKIT_URL_ENDPOINT=your_imagekit_endpoint
    depends_on:
      - mongodb
    networks:
      - gurukul-network
    ports:
      - "5000:5000"

  frontend:
    build: ./frontend
    container_name: gurukul-frontend
    restart: unless-stopped
    ports:
      - "80:80"
    depends_on:
      - backend
    networks:
      - gurukul-network

volumes:
  mongodb_data:

networks:
  gurukul-network:
    driver: bridge
```

#### Backend Dockerfile

```dockerfile
# backend/Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["node", "server.js"]
```

#### Frontend Dockerfile

```dockerfile
# frontend/Dockerfile
FROM node:18-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Option 3: Cloud Platform Deployment

#### Heroku Deployment

1. **Backend Deployment**
```bash
# Install Heroku CLI
# Create Heroku app
heroku create gurukul-backend

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your_jwt_secret
heroku config:set MONGODB_URI=your_mongodb_atlas_uri
heroku config:set IMAGEKIT_PUBLIC_KEY=your_key
heroku config:set IMAGEKIT_PRIVATE_KEY=your_key
heroku config:set IMAGEKIT_URL_ENDPOINT=your_endpoint

# Deploy
git subtree push --prefix backend heroku main
```

2. **Frontend Deployment (Netlify)**
```bash
# Build command: npm run build
# Publish directory: build
# Environment variables: REACT_APP_API_URL=https://your-backend.herokuapp.com/api
```

#### AWS Deployment

1. **Backend on EC2**
- Launch EC2 instance (t3.medium recommended)
- Install Node.js, MongoDB, and Nginx
- Follow traditional deployment steps
- Use RDS for MongoDB or MongoDB Atlas

2. **Frontend on S3 + CloudFront**
```bash
# Build the app
npm run build

# Upload to S3
aws s3 sync build/ s3://your-bucket-name --delete

# Configure CloudFront distribution
# Set origin to S3 bucket
# Configure custom error pages for SPA routing
```

## Database Configuration

### MongoDB Atlas (Recommended for Production)

1. Create MongoDB Atlas cluster
2. Configure network access (whitelist your server IPs)
3. Create database user
4. Get connection string
5. Update MONGODB_URI in environment variables

### Self-hosted MongoDB Security

```bash
# Enable authentication
sudo nano /etc/mongod.conf

# Add:
security:
  authorization: enabled

# Create admin user
mongo
use admin
db.createUser({
  user: "admin",
  pwd: "secure_password",
  roles: ["userAdminAnyDatabase", "dbAdminAnyDatabase", "readWriteAnyDatabase"]
})

# Create application user
use gurukul
db.createUser({
  user: "gurukul_user",
  pwd: "app_password",
  roles: ["readWrite"]
})
```

## Environment Variables for Production

### Backend (.env)
```env
NODE_ENV=production
PORT=5000

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/gurukul

# JWT
JWT_SECRET=your_super_long_and_secure_jwt_secret_key_here
JWT_EXPIRE=24h

# ImageKit
IMAGEKIT_PUBLIC_KEY=public_key_here
IMAGEKIT_PRIVATE_KEY=private_key_here
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_id

# CORS
CLIENT_URL=https://yourdomain.com

# File Limits
MAX_IMAGE_SIZE=10485760
MAX_VIDEO_SIZE=1048576000
```

### Frontend (.env.production)
```env
REACT_APP_API_URL=https://api.yourdomain.com/api
```

## Security Checklist

- [ ] Use HTTPS everywhere
- [ ] Set secure JWT secret (32+ characters)
- [ ] Enable MongoDB authentication
- [ ] Configure proper CORS origins
- [ ] Set up rate limiting
- [ ] Use security headers (Helmet.js)
- [ ] Validate and sanitize all inputs
- [ ] Keep dependencies updated
- [ ] Set up monitoring and logging
- [ ] Configure firewall rules
- [ ] Regular security audits

## Monitoring and Logging

### Application Monitoring
```javascript
// Add to server.js
const morgan = require('morgan');

if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'));
}
```

### PM2 Monitoring
```bash
# Monitor processes
pm2 monit

# View logs
pm2 logs gurukul-backend

# Restart app
pm2 restart gurukul-backend
```

### Database Monitoring
- Set up MongoDB monitoring
- Configure alerts for high CPU/memory usage
- Monitor disk space
- Set up automated backups

## Backup Strategy

### Database Backup
```bash
# Create backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mongodump --uri="your_mongodb_uri" --out="/backups/gurukul_$DATE"
tar -czf "/backups/gurukul_$DATE.tar.gz" "/backups/gurukul_$DATE"
rm -rf "/backups/gurukul_$DATE"

# Keep only last 7 days of backups
find /backups -name "gurukul_*.tar.gz" -mtime +7 -delete
```

### Automated Backups
```bash
# Add to crontab
crontab -e

# Daily backup at 2 AM
0 2 * * * /path/to/backup-script.sh
```

## Performance Optimization

### Backend Optimizations
- Enable gzip compression
- Use Redis for session storage
- Implement caching strategies
- Optimize database queries
- Use CDN for static assets

### Frontend Optimizations
- Code splitting
- Lazy loading
- Image optimization
- Bundle analysis
- Service worker for caching

## Troubleshooting

### Common Issues

1. **502 Bad Gateway**
   - Check if backend service is running
   - Verify Nginx configuration
   - Check firewall settings

2. **Database Connection Errors**
   - Verify MongoDB is running
   - Check connection string
   - Verify network access

3. **File Upload Issues**
   - Check ImageKit credentials
   - Verify file size limits
   - Check disk space

### Log Locations
- Application logs: PM2 logs or container logs
- Nginx logs: `/var/log/nginx/`
- MongoDB logs: `/var/log/mongodb/`

## Scaling Considerations

### Horizontal Scaling
- Use load balancer (Nginx, AWS ALB)
- Multiple backend instances
- Database clustering/sharding
- CDN for static content

### Vertical Scaling
- Increase server resources
- Optimize database performance
- Use caching layers
- Monitor resource usage

This deployment guide provides multiple options for deploying the Gurukul platform in production environments with proper security, monitoring, and scaling considerations.
