const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course reference is required'],
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    enrolledAt: {
      type: Date,
      default: Date.now,
    },
    completedVideos: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Video',
      },
    ],
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
  },
);

// Prevent duplicate enrollments for the same user and course
enrollmentSchema.index({ course: 1, user: 1 }, { unique: true });
// Fast query for "my enrolled courses"
enrollmentSchema.index({ user: 1, enrolledAt: -1 });

module.exports = mongoose.model('Enrollment', enrollmentSchema);
