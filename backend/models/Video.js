const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: { 
    type: String, 
    default: '',
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  // Video information from Cloudinary
  videoUrl: { 
    type: String, 
    required: [true, 'Video URL is required'] 
  },
  publicId: {
    type: String,
    required: [true, 'Cloudinary public ID is required']
  },
  format: {
    type: String,
    required: true
  },
  width: {
    type: Number,
    required: true
  },
  height: {
    type: Number,
    required: true
  },
  duration: { 
    type: Number, 
    min: [1, 'Duration must be at least 1 second']
  },
  bytes: {
    type: Number,
    required: true
  },
  thumbnailUrl: { 
    type: String, 
    default: '' 
  },
  // Size in bytes
  size: { 
    type: Number, 
    max: [104857600, 'File size cannot exceed 100MB']
  },
  course: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Course',
    required: [true, 'Course reference is required']
  },
  section: {
    type: String,
    trim: true,
    default: 'Main'
  },
  order: {
    type: Number,
    default: 0
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  isPreview: {
    type: Boolean,
    default: false
  },
  allowDownload: {
    type: Boolean,
    default: false
  },
  enableComments: {
    type: Boolean,
    default: true
  },
  objectives: {
    type: String,
    default: '',
    maxlength: [1000, 'Objectives cannot exceed 1000 characters']
  },
  resources: {
    type: String,
    default: '',
    maxlength: [2000, 'Resources cannot exceed 2000 characters']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  creator: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: [true, 'Creator is required'] 
  },
  views: {
    type: Number,
    default: 0
  },
  // Additional Cloudinary metadata
  metadata: {
    type: Object,
    select: false // Don't include this field by default in queries
  },
  status: {
    type: String,
    enum: ['processing', 'ready', 'error'],
    default: 'processing'
  },
  mimeType: {
    type: String
  },
  resolution: {
    width: Number,
    height: Number
  },
  tags: [{
    type: String,
    trim: true
  }],
  watchedBy: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    watchedAt: {
      type: Date,
      default: Date.now
    },
    completed: {
      type: Boolean,
      default: false
    },
    watchTime: {
      type: Number,
      default: 0
    },
    lastPosition: {
      type: Number,
      default: 0
    }
  }]
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
videoSchema.index({ course: 1, order: 1 });
videoSchema.index({ creator: 1 });
videoSchema.index({ isPublished: 1 });
videoSchema.index({ status: 1 });
videoSchema.index({ title: 'text', description: 'text', tags: 'text' });

// Virtual for video duration in minutes
videoSchema.virtual('durationInMinutes').get(function() {
  return this.duration ? Math.ceil(this.duration / 60) : 0;
});

// Update course's video count when video is saved
videoSchema.post('save', async function(doc) {
  const Course = mongoose.model('Course');
  await Course.findByIdAndUpdate(doc.course, {
    $inc: { videoCount: 1 },
    $set: { updatedAt: new Date() }
  });
});

// Update course's video count when video is removed
videoSchema.post('remove', async function(doc) {
  const Course = mongoose.model('Course');
  await Course.findByIdAndUpdate(doc.course, {
    $inc: { videoCount: -1 },
    $set: { updatedAt: new Date() }
  });
});

// Method to mark video as watched by a student
videoSchema.methods.markAsWatched = function(studentId, completed = false, watchTime = 0, position = 0) {
  const existingWatch = this.watchedBy.find(watch => 
    watch.student.toString() === studentId.toString()
  );
  
  if (existingWatch) {
    existingWatch.watchedAt = new Date();
    existingWatch.completed = completed;
    existingWatch.watchTime = watchTime;
    existingWatch.lastPosition = position;
  } else {
    this.watchedBy.push({
      student: studentId,
      watchedAt: new Date(),
      completed,
      watchTime,
      lastPosition: position
    });
  }
};

// Method to check if video is completed by a student
videoSchema.methods.isCompletedBy = function(studentId) {
  const watch = this.watchedBy.find(watch => 
    watch.student.toString() === studentId.toString()
  );
  return watch ? watch.completed : false;
};

// Method to get watch progress for a student
videoSchema.methods.getWatchProgress = function(studentId) {
  const watch = this.watchedBy.find(watch => 
    watch.student.toString() === studentId.toString()
  );
  return watch || null;
};

module.exports = mongoose.model('Video', videoSchema);
