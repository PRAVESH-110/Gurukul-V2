# API Endpoints Documentation

## Authentication Routes
```
POST   /api/auth/register          - User registration
POST   /api/auth/login             - User login
POST   /api/auth/logout            - User logout
GET    /api/auth/me                - Get current user profile
PUT    /api/auth/profile           - Update user profile
POST   /api/auth/forgot-password   - Request password reset
POST   /api/auth/reset-password    - Reset password
```

## User Routes
`
GET    /api/users                  - Get all users (admin only)
GET    /api/users/:id              - Get user by ID
PUT    /api/users/:id              - Update user
DELETE /api/users/:id              - Delete user (admin only)
GET    /api/users/:id/communities  - Get user's communities
GET    /api/users/:id/courses      - Get user's enrolled courses
```

## Community Routes
```
GET    /api/communities            - Get all public communities
POST   /api/communities            - Create new community (creator only)
GET    /api/communities/:id        - Get community details
PUT    /api/communities/:id        - Update community (admin only)
DELETE /api/communities/:id        - Delete community (admin only)
POST   /api/communities/:id/join   - Join community
POST   /api/communities/:id/leave  - Leave community
GET    /api/communities/:id/members - Get community members
PUT    /api/communities/:id/members/:userId - Update member role (admin only)
DELETE /api/communities/:id/members/:userId - Remove member (admin only)
```

## Post Routes
```
GET    /api/communities/:id/posts  - Get community posts
POST   /api/communities/:id/posts  - Create new post
GET    /api/posts/:id              - Get post details
PUT    /api/posts/:id              - Update post (author/admin only)
DELETE /api/posts/:id              - Delete post (author/admin only)
POST   /api/posts/:id/like         - Like/unlike post
POST   /api/posts/:id/comments     - Add comment to post
PUT    /api/posts/:id/comments/:commentId - Update comment
DELETE /api/posts/:id/comments/:commentId - Delete comment
```

## Course Routes
```
GET    /api/courses                - Get all published courses
POST   /api/courses                - Create new course (creator only)
GET    /api/courses/:id            - Get course details
PUT    /api/courses/:id            - Update course (creator only)
DELETE /api/courses/:id            - Delete course (creator only)
POST   /api/courses/:id/enroll     - Enroll in course
GET    /api/courses/:id/videos     - Get course videos
POST   /api/courses/:id/videos     - Upload video to course (creator only)
GET    /api/courses/:id/students   - Get enrolled students (creator only)
POST   /api/courses/:id/review     - Add course review
```

## Video Routes
```
GET    /api/videos/:id             - Get video details
PUT    /api/videos/:id             - Update video (creator only)
DELETE /api/videos/:id             - Delete video (creator only)
POST   /api/videos/:id/watch       - Mark video as watched
GET    /api/videos/:id/stream      - Stream video content
POST   /api/videos/upload          - Upload video file (creator only)
```

## Event Routes
```
GET    /api/communities/:id/events - Get community events
POST   /api/communities/:id/events - Create new event (admin only)
GET    /api/events/:id             - Get event details
PUT    /api/events/:id             - Update event (creator only)
DELETE /api/events/:id             - Delete event (creator only)
POST   /api/events/:id/attend      - RSVP to event
```

## Dashboard Routes
```
GET    /api/dashboard/student      - Get student dashboard data
GET    /api/dashboard/creator      - Get creator dashboard data
GET    /api/dashboard/analytics    - Get analytics data (creator only)
```

## File Upload Routes
```
POST   /api/upload/image           - Upload image to ImageKit
POST   /api/upload/video           - Upload video to GridFS
POST   /api/upload/avatar          - Upload user avatar
```

## Search Routes
```
GET    /api/search/communities     - Search communities
GET    /api/search/courses         - Search courses
GET    /api/search/users           - Search users
GET    /api/search/posts           - Search posts
```

## Request/Response Examples

### User Registration
```javascript
// POST /api/auth/register
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "student"
}

// Response
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "_id": "...",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "role": "student"
  },
  "token": "jwt_token_here"
}
```

### Create Community
```javascript
// POST /api/communities
{
  "name": "Web Development Bootcamp",
  "description": "Learn full-stack web development",
  "type": "public",
  "coverImage": "imagekit_url"
}

// Response
{
  "success": true,
  "message": "Community created successfully",
  "community": {
    "_id": "...",
    "name": "Web Development Bootcamp",
    "description": "Learn full-stack web development",
    "type": "public",
    "creator": "...",
    "memberCount": 1
  }
}
```

### Upload Video
```javascript
// POST /api/videos/upload
// Form data with video file

// Response
{
  "success": true,
  "message": "Video uploaded successfully", 
  "video": {
    "_id": "...",
    "title": "Introduction to React",
    "videoUrl": "imagekit_optimized_url",
    "thumbnail": "imagekit_thumbnail_url",
    "duration": 1800
  }
}
```

## Error Response Format
```javascript
{
  "success": false,
  "message": "Error description",
  "errors": ["Specific error details"]
}
```

## Authentication
- All protected routes require JWT token in Authorization header
- Format: `Authorization: Bearer <token>`
- Token expires in 24 hours
- Refresh token mechanism for extended sessions

## Rate Limiting
- Authentication routes: 5 requests per minute
- File upload routes: 10 requests per hour
- General API routes: 100 requests per minute

## File Upload Limits
- Images: 10MB max
- Videos: 1000MB max
- Supported formats: Images (jpg, png, gif, webp), Videos (mp4, avi, mov)
