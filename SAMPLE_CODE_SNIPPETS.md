# Sample Code Snippets for Gurukul Platform

## Critical Implementation Examples

### 1. User Authentication with JWT

```javascript
// Backend - JWT Token Generation
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '24h'
  });
};

// Frontend - API Call with Auth
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### 2. Video Upload with ImageKit.io Integration

```javascript
// Backend - Video Upload Handler
const uploadVideo = async (req, res, next) => {
  try {
    const { title, description, courseId, order, isPreview } = req.body;

    // Upload to GridFS
    const uploadStream = bucket.openUploadStream(req.file.originalname, {
      metadata: {
        courseId,
        uploadedBy: req.user._id,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype
      }
    });

    uploadStream.end(req.file.buffer);

    uploadStream.on('finish', async () => {
      // Upload to ImageKit for optimization
      const imagekitResponse = await imagekit.upload({
        file: req.file.buffer,
        fileName: `${Date.now()}_${req.file.originalname}`,
        folder: `/courses/${courseId}/videos`
      });

      // Create video record
      const video = await Video.create({
        title,
        description,
        course: courseId,
        videoFileId: uploadStream.id,
        videoUrl: imagekitResponse.url,
        thumbnail: imagekitResponse.thumbnailUrl,
        order: parseInt(order),
        isPreview: isPreview === 'true',
        fileSize: req.file.size,
        mimeType: req.file.mimetype
      });

      res.status(201).json({
        success: true,
        message: 'Video uploaded successfully',
        video
      });
    });
  } catch (error) {
    next(error);
  }
};
```

### 3. Community Post Creation

```javascript
// Backend - Community Post Creation
const createPost = async (req, res, next) => {
  try {
    const { title, content, images } = req.body;
    const { communityId } = req.params;

    const community = req.community; // Set by middleware

    // For private communities, only admins can post
    if (community.type === 'private' && !community.isAdmin(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Only admins can post in private communities'
      });
    }

    const post = await Post.create({
      title,
      content,
      images: images || [],
      author: req.user._id,
      community: communityId
    });

    await post.populate('author', 'firstName lastName avatar');

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      post
    });
  } catch (error) {
    next(error);
  }
};

// Frontend - Post Creation Form
const CreatePostForm = ({ communityId, onSuccess }) => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [images, setImages] = useState([]);

  const onSubmit = async (data) => {
    try {
      const response = await communityAPI.createPost(communityId, {
        ...data,
        images
      });
      toast.success('Post created successfully!');
      onSuccess();
    } catch (error) {
      toast.error('Failed to create post');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <input
        {...register('title', { required: 'Title is required' })}
        placeholder="Post title"
        className="input w-full"
      />
      <textarea
        {...register('content', { required: 'Content is required' })}
        placeholder="What's on your mind?"
        className="textarea w-full"
        rows={4}
      />
      <button type="submit" className="btn-primary">
        Create Post
      </button>
    </form>
  );
};
```

### 4. Role-Based Access Control

```javascript
// Backend - Authorization Middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};

// Usage in routes
router.post('/courses', protect, authorize('creator'), createCourse);
router.get('/my-courses', protect, authorize('student'), getMyCourses);

// Frontend - Protected Route Component
const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner size="lg" />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};
```

### 5. Real-time Progress Tracking

```javascript
// Backend - Video Progress Update
const updateWatchProgress = async (req, res, next) => {
  try {
    const { progress } = req.body;
    const video = await Video.findById(req.params.id)
      .populate('course', 'enrolledStudents');

    if (!video.course.enrolledStudents.includes(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'You must be enrolled to track progress'
      });
    }

    video.updateProgress(req.user._id, progress);
    await video.save();

    res.status(200).json({
      success: true,
      message: 'Progress updated successfully',
      progress,
      completed: progress >= 90
    });
  } catch (error) {
    next(error);
  }
};

// Frontend - Video Player with Progress Tracking
const VideoPlayer = ({ videoId }) => {
  const [progress, setProgress] = useState(0);

  const handleProgress = useCallback(
    debounce(async (currentProgress) => {
      try {
        await videoAPI.updateWatchProgress(videoId, currentProgress);
        setProgress(currentProgress);
      } catch (error) {
        console.error('Failed to update progress:', error);
      }
    }, 5000),
    [videoId]
  );

  return (
    <ReactPlayer
      url={videoUrl}
      controls
      width="100%"
      height="400px"
      onProgress={({ played }) => {
        const progressPercent = Math.round(played * 100);
        handleProgress(progressPercent);
      }}
    />
  );
};
```

### 6. Search Implementation

```javascript
// Backend - Global Search
const globalSearch = async (req, res, next) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;
    const searchLimit = Math.ceil(limit / 4);

    // Search communities
    const communities = await Community.find({
      $and: [
        { isActive: true },
        { type: 'public' },
        {
          $or: [
            { name: { $regex: q, $options: 'i' } },
            { description: { $regex: q, $options: 'i' } }
          ]
        }
      ]
    }).populate('creator', 'firstName lastName avatar').limit(searchLimit);

    // Search courses
    const courses = await Course.find({
      $and: [
        { isPublished: true },
        {
          $or: [
            { title: { $regex: q, $options: 'i' } },
            { description: { $regex: q, $options: 'i' } },
            { category: { $regex: q, $options: 'i' } }
          ]
        }
      ]
    }).populate('creator', 'firstName lastName avatar').limit(searchLimit);

    res.status(200).json({
      success: true,
      results: {
        communities: communities.map(c => ({ ...c.toObject(), type: 'community' })),
        courses: courses.map(c => ({ ...c.toObject(), type: 'course' }))
      },
      totalResults: communities.length + courses.length
    });
  } catch (error) {
    next(error);
  }
};
```

### 7. Dashboard Analytics

```javascript
// Backend - Creator Dashboard Analytics
const getCreatorDashboard = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Get creator's courses with analytics
    const courseAnalytics = await Promise.all(
      createdCourses.map(async (course) => {
        const totalVideos = await Video.countDocuments({ 
          course: course._id, 
          isActive: true 
        });

        const totalWatches = await Video.aggregate([
          { $match: { course: course._id, isActive: true } },
          { $unwind: '$watchedBy' },
          { $group: { _id: null, count: { $sum: 1 } } }
        ]);

        return {
          courseId: course._id,
          title: course.title,
          enrollments: course.enrollmentCount,
          totalVideos,
          totalWatches: totalWatches[0]?.count || 0,
          revenue: course.price * course.enrollmentCount,
          rating: course.rating
        };
      })
    );

    res.status(200).json({
      success: true,
      dashboard: {
        user: req.user,
        stats: {
          totalCourses: createdCourses.length,
          totalEnrollments,
          totalRevenue
        },
        courseAnalytics
      }
    });
  } catch (error) {
    next(error);
  }
};
```

### 8. Error Handling

```javascript
// Backend - Global Error Handler
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = { message, statusCode: 404 };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = { message, statusCode: 400 };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = { message, statusCode: 400 };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// Frontend - Error Boundary
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Something went wrong
          </h2>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="btn-primary"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

## Key Features Implemented

1. **JWT Authentication**: Secure user authentication with role-based access
2. **Video Upload & Streaming**: GridFS storage with ImageKit optimization
3. **Community Management**: Public/private communities with role-based posting
4. **Course Management**: Complete course creation and enrollment system
5. **Progress Tracking**: Real-time video watch progress tracking
6. **Search Functionality**: Global search across all content types
7. **Dashboard Analytics**: Comprehensive analytics for creators
8. **Error Handling**: Robust error handling on both frontend and backend
9. **File Upload**: Image and video upload with size limits and validation
10. **Real-time Features**: Live updates for posts, comments, and progress

## Security Considerations

- JWT tokens with expiration
- Input validation and sanitization
- File type and size validation
- Role-based access control
- CORS configuration
- Rate limiting
- Password hashing with bcrypt
- Secure headers with Helmet.js

## Performance Optimizations

- Database indexing for faster queries
- Image optimization with ImageKit
- Pagination for large datasets
- Debounced progress updates
- Lazy loading for components
- Caching strategies
- Compression middleware
