const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Course title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  subtitle: {
    type: String,
    trim: true,
    maxlength: [500, 'Subtitle cannot exceed 500 characters']
  },
  description: {
    type: String,
    required: [true, 'Course description is required'],
    maxlength: [5000, 'Description cannot exceed 5000 characters']
  },
  thumbnail: {
    type: String,
    default: null
  },
  previewVideo: {
    url: String,
    fileId: String
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Creator is required']
  },
  community: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Community',
    default: null
  },
  instructors: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  price: {
    type: Number,
    default: 0,
    min: [0, 'Price cannot be negative']
  },
  isFree: {
    type: Boolean,
    default: true
  },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: [true, 'Course level is required'],
    default: 'beginner'
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  subcategory: {
    type: String,
    trim: true
  },
  language: {
    type: String,
    default: 'English'
  },
  tags: [{
    type: String,
    trim: true
  }],
  sections: [{
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: String,
    order: {
      type: Number,
      default: 0
    },
    lectures: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Video'
    }]
  }],
  enrolledStudents: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    enrolledAt: {
      type: Date,
      default: Date.now
    },
    completedVideos: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Video'
    }],
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  }],
  enrollmentCount: {
    type: Number,
    default: 0
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  reviews: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      maxlength: [1000, 'Review comment cannot exceed 1000 characters']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  isPublished: {
    type: Boolean,
    default: false
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['draft', 'pending', 'published', 'rejected'],
    default: 'draft'
  },
  visibility: {
    type: String,
    enum: ['public', 'private'],
    default: 'private'
  },
  duration: {
    type: Number, // in minutes
    default: 0
  },
  totalVideos: {
    type: Number,
    default: 0
  },
  resources: [{
    title: String,
    url: String,
    type: {
      type: String,
      enum: ['file', 'link', 'document']
    },
    fileId: String
  }],
  requirements: [{
    type: String,
    trim: true
  }],
  learningOutcomes: [{
    type: String,
    trim: true
  }],
  certificateTemplate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CertificateTemplate'
  },
  settings: {
    allowPreview: {
      type: Boolean,
      default: true
    },
    enableQnA: {
      type: Boolean,
      default: true
    },
    enableNotes: {
      type: Boolean,
      default: true
    },
    enableDownloads: {
      type: Boolean,
      default: false
    },
    completionThreshold: {
      type: Number,
      default: 80,
      min: 0,
      max: 100
    }
  },
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String]
  },
  stats: {
    totalViews: {
      type: Number,
      default: 0
    },
    totalWatchTime: {
      type: Number, // in minutes
      default: 0
    },
    completionRate: {
      type: Number,
      default: 0
    }
  },
  deletedAt: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
courseSchema.index({ creator: 1 });
courseSchema.index({ category: 1, level: 1 });
courseSchema.index({ isPublished: 1 });
courseSchema.index({ status: 1 });
courseSchema.index({ 'enrolledStudents.user': 1 });
courseSchema.index({ title: 'text', description: 'text', tags: 'text' });

// Text index for search
courseSchema.index({
  title: 'text',
  subtitle: 'text',
  description: 'text',
  'instructors.name': 'text',
  tags: 'text'
});

// Calculate average rating
courseSchema.methods.calculateAverageRating = function () {
  if (this.reviews.length === 0) {
    this.rating.average = 0;
    this.rating.count = 0;
    return 0;
  }

  const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
  this.rating.average = Math.round((totalRating / this.reviews.length) * 10) / 10;
  this.rating.count = this.reviews.length;
  return this.rating.average;
};

// Update enrollment count before saving
courseSchema.pre('save', function (next) {
  // Handle both array formats for backward compatibility
  if (this.enrolledStudents && this.enrolledStudents.length > 0) {
    // If enrolledStudents contains objects with user property
    if (this.enrolledStudents[0] && typeof this.enrolledStudents[0] === 'object' && this.enrolledStudents[0].user) {
      this.enrollmentCount = this.enrolledStudents.length;
    } else {
      // If enrolledStudents contains direct ObjectIds
      this.enrollmentCount = this.enrolledStudents.length;
    }
  } else {
    this.enrollmentCount = 0;
  }

  // Calculate duration from videos
  if (this.isModified('sections')) {
    this.totalVideos = this.sections.reduce(
      (total, section) => total + (section.lectures?.length || 0),
      0
    );
  }

  // Ensure price is a number
  if (typeof this.price === 'string') {
    this.price = parseFloat(this.price) || 0;
  }

  // Set isFree based on price
  this.isFree = this.price <= 0;

  // Sync isPublished with visibility
  if (this.isModified('visibility')) {
    this.isPublished = this.visibility === 'public';
    // Also update status for backward compatibility if needed
    if (this.visibility === 'public') {
      this.status = 'published';
    } else if (this.status === 'published' && this.visibility === 'private') {
      this.status = 'draft';
    }
  } else if (this.isModified('isPublished')) {
    // If isPublished is modified directly (legacy support), sync visibility
    this.visibility = this.isPublished ? 'public' : 'private';
  }

  next();
});

// Add a method to check if a user is enrolled
courseSchema.methods.isEnrolled = function (userId) {
  if (!userId) return false;
  return this.enrolledStudents.some(student =>
    student.user && student.user.toString() === userId.toString()
  );
};

// Add a method to get user progress
courseSchema.methods.getUserProgress = function (userId) {
  const enrollment = this.enrolledStudents.find(student =>
    student.user && student.user.toString() === userId.toString()
  );

  if (!enrollment) return 0;

  if (this.totalVideos === 0) return 0;

  const progress = Math.round((enrollment.completedVideos.length / this.totalVideos) * 100);
  return Math.min(progress, 100);
};

// Add a method to mark a video as completed
courseSchema.methods.markVideoCompleted = async function (userId, videoId) {
  const enrollment = this.enrolledStudents.find(student =>
    student.user && student.user.toString() === userId.toString()
  );

  if (!enrollment) {
    throw new Error('User is not enrolled in this course');
  }

  // Check if video is already marked as completed
  const videoExists = enrollment.completedVideos.some(vid =>
    vid.toString() === videoId.toString()
  );

  if (!videoExists) {
    enrollment.completedVideos.push(videoId);

    // Calculate new progress
    if (this.totalVideos > 0) {
      const progress = Math.round((enrollment.completedVideos.length / this.totalVideos) * 100);
      enrollment.progress = Math.min(progress, 100);
    }

    await this.save();
  }

  return enrollment.progress;
};

// Add a method to get course duration in hours and minutes
courseSchema.virtual('durationFormatted').get(function () {
  const hours = Math.floor(this.duration / 60);
  const minutes = this.duration % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
});

// Add a method to get the first video in the course
courseSchema.methods.getFirstVideo = async function () {
  const course = await this.populate({
    path: 'sections.lectures',
    select: 'title url duration isPublished',
    match: { isPublished: true },
    options: { sort: { order: 1 }, limit: 1 }
  }).execPopulate();

  for (const section of course.sections) {
    if (section.lectures && section.lectures.length > 0) {
      return section.lectures[0];
    }
  }

  return null;
};

// Note: calculateAverageRating and isEnrolled methods are defined above

// Enroll student
courseSchema.methods.enrollStudent = function (userId) {
  if (!this.isEnrolled(userId)) {
    this.enrolledStudents.push({
      user: userId,
      enrolledAt: new Date(),
      completedVideos: [],
      progress: 0
    });
  }
};

// Unenroll student
courseSchema.methods.unenrollStudent = function (userId) {
  this.enrolledStudents = this.enrolledStudents.filter(
    student => student.user.toString() !== userId.toString()
  );
};

module.exports = mongoose.model('Course', courseSchema);
