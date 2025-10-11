# Database Schema Design

## MongoDB Collections and Relationships

### 1. Users Collection
```javascript
{
  _id: ObjectId,
  email: String (unique, required),
  password: String (hashed, required),
  firstName: String (required),
  lastName: String (required),
  role: String (enum: ['student', 'creator'], required),
  avatar: String (ImageKit URL, optional),
  bio: String (optional),
  joinedCommunities: [ObjectId] (ref: Community),
  enrolledCourses: [ObjectId] (ref: Course),
  createdAt: Date,
  updatedAt: Date
}
```

### 2. Communities Collection
```javascript
{
  _id: ObjectId,
  name: String (required),
  description: String (required),
  type: String (enum: ['public', 'private'], required),
  coverImage: String (ImageKit URL, optional),
  creator: ObjectId (ref: User, required),
  members: [{
    user: ObjectId (ref: User),
    joinedAt: Date,
    role: String (enum: ['admin', 'member'], default: 'member')
  }],
  memberCount: Number (default: 0),
  createdAt: Date,
  updatedAt: Date
}
```

### 3. Posts Collection
```javascript
{
  _id: ObjectId,
  title: String (required),
  content: String (required),
  images: [String] (ImageKit URLs),
  author: ObjectId (ref: User, required),
  community: ObjectId (ref: Community, required),
  likes: [ObjectId] (ref: User),
  comments: [{
    author: ObjectId (ref: User),
    content: String,
    createdAt: Date
  }],
  isPinned: Boolean (default: false),
  createdAt: Date,
  updatedAt: Date
}
```

### 4. Courses Collection
```javascript
{
  _id: ObjectId,
  title: String (required),
  description: String (required),
  thumbnail: String (ImageKit URL, optional),
  creator: ObjectId (ref: User, required),
  community: ObjectId (ref: Community, optional),
  price: Number (default: 0),
  level: String (enum: ['beginner', 'intermediate', 'advanced']),
  category: String,
  tags: [String],
  enrolledStudents: [ObjectId] (ref: User),
  enrollmentCount: Number (default: 0),
  rating: Number (default: 0),
  reviews: [{
    student: ObjectId (ref: User),
    rating: Number (1-5),
    comment: String,
    createdAt: Date
  }],
  isPublished: Boolean (default: false),
  createdAt: Date,
  updatedAt: Date
}
```

### 5. Videos Collection
```javascript
{
  _id: ObjectId,
  title: String (required),
  description: String,
  course: ObjectId (ref: Course, required),
  videoFileId: ObjectId (GridFS file ID),
  videoUrl: String (ImageKit optimized URL),
  thumbnail: String (ImageKit URL),
  duration: Number (seconds),
  order: Number (sequence in course),
  isPreview: Boolean (default: false),
  watchedBy: [{
    student: ObjectId (ref: User),
    watchedAt: Date,
    progress: Number (percentage)
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### 6. Events Collection
```javascript
{
  _id: ObjectId,
  title: String (required),
  description: String (required),
  startDate: Date (required),
  endDate: Date (required),
  meetingLink: String (optional),
  community: ObjectId (ref: Community, required),
  creator: ObjectId (ref: User, required),
  attendees: [{
    user: ObjectId (ref: User),
    status: String (enum: ['going', 'maybe', 'not_going'])
  }],
  isRecurring: Boolean (default: false),
  recurrencePattern: String (optional),
  createdAt: Date,
  updatedAt: Date
}
```

### 7. Enrollments Collection
```javascript
{
  _id: ObjectId,
  student: ObjectId (ref: User, required),
  course: ObjectId (ref: Course, required),
  enrolledAt: Date (required),
  progress: Number (percentage, default: 0),
  completedVideos: [ObjectId] (ref: Video),
  lastAccessedAt: Date,
  certificateIssued: Boolean (default: false)
}
```

### 8. Community Memberships Collection
```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: User, required),
  community: ObjectId (ref: Community, required),
  role: String (enum: ['admin', 'member'], default: 'member'),
  joinedAt: Date (required),
  status: String (enum: ['active', 'pending', 'blocked'], default: 'active')
}
```

## Relationships Summary

1. **User → Communities**: Many-to-Many (through Community Memberships)
2. **User → Courses**: Many-to-Many (through Enrollments)
3. **Community → Posts**: One-to-Many
4. **Community → Events**: One-to-Many
5. **Course → Videos**: One-to-Many
6. **User → Posts**: One-to-Many (author)
7. **Community → Courses**: One-to-Many (optional)

## Indexes for Performance

```javascript
// Users Collection
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ role: 1 })

// Communities Collection
db.communities.createIndex({ creator: 1 })
db.communities.createIndex({ type: 1 })
db.communities.createIndex({ "members.user": 1 })

// Posts Collection
db.posts.createIndex({ community: 1, createdAt: -1 })
db.posts.createIndex({ author: 1 })

// Courses Collection
db.courses.createIndex({ creator: 1 })
db.courses.createIndex({ community: 1 })
db.courses.createIndex({ category: 1, level: 1 })

// Videos Collection
db.videos.createIndex({ course: 1, order: 1 })

// Events Collection
db.events.createIndex({ community: 1, startDate: 1 })

// Enrollments Collection
db.enrollments.createIndex({ student: 1, course: 1 }, { unique: true })
db.enrollments.createIndex({ course: 1 })

// Community Memberships Collection
db.communitymemberships.createIndex({ user: 1, community: 1 }, { unique: true })
```
