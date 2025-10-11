# Gurukul Platform Testing Script

## Manual Testing Checklist

### Prerequisites
- [ ] MongoDB is running locally
- [ ] Node.js and npm are installed
- [ ] Backend dependencies installed (`npm install` in backend folder)
- [ ] Frontend dependencies installed (`npm install` in frontend folder)
- [ ] Environment files (.env) are configured

### Backend Testing

#### 1. Server Startup
```bash
cd backend
npm start
```
Expected: Server starts on port 5000 without errors

#### 2. Database Connection
- Check console for "MongoDB Connected" message
- Verify no connection errors

#### 3. API Endpoints Testing

**Authentication Endpoints:**
```bash
# Register new user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "Creator",
    "email": "creator@test.com",
    "password": "password123",
    "role": "creator"
  }'

# Login user
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "creator@test.com",
    "password": "password123"
  }'
```

### Frontend Testing

#### 1. Development Server
```bash
cd frontend
npm start
```
Expected: React app starts on port 3000

#### 2. UI Component Testing
- [ ] Homepage loads correctly
- [ ] Navigation works
- [ ] Login/Register forms display
- [ ] Responsive design works

#### 3. Authentication Flow
- [ ] Register new account (both student and creator)
- [ ] Login with valid credentials
- [ ] Access protected routes
- [ ] Logout functionality

#### 4. Dashboard Testing
- [ ] Student dashboard displays correctly
- [ ] Creator dashboard shows (if implemented)
- [ ] Navigation between sections works

### Integration Testing

#### 1. Full User Journey - Student
1. Register as student
2. Login successfully
3. Access student dashboard
4. Browse available courses
5. Join a community
6. View course content

#### 2. Full User Journey - Creator
1. Register as creator
2. Login successfully
3. Access creator dashboard
4. Create a new community
5. Upload a course
6. Manage content

### Error Handling Testing

#### 1. Backend Error Handling
- [ ] Invalid login credentials
- [ ] Duplicate email registration
- [ ] Unauthorized access attempts
- [ ] Invalid data validation

#### 2. Frontend Error Handling
- [ ] Network connection errors
- [ ] Invalid form submissions
- [ ] 404 page displays
- [ ] Loading states work

### Performance Testing

#### 1. Load Testing
- [ ] Multiple concurrent users
- [ ] Large file uploads
- [ ] Database query performance
- [ ] Memory usage monitoring

#### 2. Frontend Performance
- [ ] Page load times
- [ ] Component rendering speed
- [ ] Bundle size optimization
- [ ] Image loading performance

## Common Issues and Solutions

### Backend Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running: `mongod`
   - Check connection string in .env
   - Verify database permissions

2. **Port Already in Use**
   - Change PORT in .env file
   - Kill existing process: `netstat -ano | findstr :5000`

3. **Missing Dependencies**
   - Run `npm install` in backend directory
   - Check package.json for required packages

### Frontend Issues

1. **API Connection Error**
   - Verify backend is running
   - Check REACT_APP_API_URL in .env
   - Inspect network tab in browser

2. **Build Errors**
   - Clear node_modules and reinstall
   - Check for syntax errors
   - Verify all imports are correct

3. **Routing Issues**
   - Check React Router configuration
   - Verify protected route logic
   - Test navigation components

## Test Results Template

### Backend Test Results
- [ ] Server starts successfully
- [ ] Database connects properly
- [ ] Authentication endpoints work
- [ ] CRUD operations function
- [ ] Error handling works
- [ ] File upload works

### Frontend Test Results
- [ ] React app starts successfully
- [ ] All pages render correctly
- [ ] Authentication flow works
- [ ] API integration functions
- [ ] Responsive design works
- [ ] Error boundaries work

### Integration Test Results
- [ ] Student user journey complete
- [ ] Creator user journey complete
- [ ] Cross-browser compatibility
- [ ] Mobile responsiveness
- [ ] Performance acceptable

## Next Steps After Testing

1. **Bug Fixes**: Address any identified issues
2. **Performance Optimization**: Improve slow areas
3. **Security Review**: Check for vulnerabilities
4. **Documentation**: Update based on findings
5. **Deployment Preparation**: Ready for production

## Automated Testing Setup

### Backend Testing with Jest
```bash
npm install --save-dev jest supertest
```

### Frontend Testing with React Testing Library
```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom
```

### End-to-End Testing with Cypress
```bash
npm install --save-dev cypress
```
