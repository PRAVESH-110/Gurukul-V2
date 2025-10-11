# Gurukul Platform Installation Guide

## Prerequisites

Before installing the Gurukul platform, ensure you have the following installed:

- **Node.js** (v16 or higher)
- **MongoDB** (v5.0 or higher)
- **npm** or **yarn** package manager
- **ImageKit.io** account for media handling

## Environment Setup

### 1. Clone and Setup Backend

```bash
cd gurukul-platform/backend
npm install
```

### 2. Environment Configuration

Create a `.env` file in the backend directory:

```bash
cp .env.example .env
```

Update the `.env` file with your configuration:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/gurukul
DB_NAME=gurukul

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_secure
JWT_EXPIRE=24h

# Server Configuration
PORT=5000
NODE_ENV=development

# ImageKit Configuration
IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_imagekit_id

# CORS Configuration
CLIENT_URL=http://localhost:3000

# File Upload Limits
MAX_IMAGE_SIZE=10485760
MAX_VIDEO_SIZE=1048576000
```

### 3. Setup Frontend

```bash
cd ../frontend
npm install
```

Create a `.env` file in the frontend directory:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

## Database Setup

### 1. Start MongoDB

Make sure MongoDB is running on your system:

```bash
# On Windows (if installed as service)
net start MongoDB

# On macOS (using Homebrew)
brew services start mongodb-community

# On Linux (using systemd)
sudo systemctl start mongod
```

### 2. Database Initialization

The application will automatically create the necessary collections and indexes when you first run it.

## ImageKit.io Setup

1. Sign up for a free account at [ImageKit.io](https://imagekit.io/)
2. Get your API credentials from the dashboard:
   - Public Key
   - Private Key
   - URL Endpoint
3. Update your `.env` file with these credentials

## Running the Application

### 1. Start the Backend Server

```bash
cd backend
npm run dev
```

The backend server will start on `http://localhost:5000`

### 2. Start the Frontend Development Server

```bash
cd frontend
npm start
```

The frontend will start on `http://localhost:3000`

## Testing the Installation

1. Open your browser and navigate to `http://localhost:3000`
2. You should see the Gurukul homepage
3. Try registering a new account
4. Test both student and creator roles

## Production Deployment

### Backend Deployment

1. Set `NODE_ENV=production` in your environment
2. Use a process manager like PM2:

```bash
npm install -g pm2
pm2 start server.js --name "gurukul-backend"
```

### Frontend Deployment

1. Build the production version:

```bash
npm run build
```

2. Serve the build folder using a web server like Nginx or Apache

### Database Security

For production, ensure your MongoDB instance:
- Has authentication enabled
- Uses SSL/TLS connections
- Has proper firewall rules
- Regular backups are configured

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check the connection string in `.env`
   - Verify network connectivity

2. **ImageKit Upload Errors**
   - Verify API credentials
   - Check file size limits
   - Ensure proper permissions

3. **CORS Issues**
   - Verify `CLIENT_URL` in backend `.env`
   - Check frontend API URL configuration

4. **Port Already in Use**
   - Change the port in `.env` file
   - Kill existing processes using the port

### Logs

Check application logs for detailed error information:

```bash
# Backend logs
cd backend
npm run dev

# Frontend logs
cd frontend
npm start
```

## Development Tips

1. **Hot Reloading**: Both frontend and backend support hot reloading during development
2. **API Testing**: Use tools like Postman to test API endpoints
3. **Database GUI**: Use MongoDB Compass for database management
4. **Code Quality**: Run linting and formatting tools before commits

## Support

If you encounter issues during installation:

1. Check the troubleshooting section above
2. Verify all prerequisites are installed correctly
3. Ensure environment variables are set properly
4. Check the console logs for specific error messages

## Next Steps

After successful installation:

1. Create test accounts for both student and creator roles
2. Upload sample courses and create communities
3. Test video upload functionality
4. Explore the dashboard features
5. Customize the platform according to your needs
