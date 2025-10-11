const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Post title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Post content is required'],
    maxlength: [5000, 'Content cannot exceed 5000 characters']
  },
  images: [{
    type: String // ImageKit URLs
  }],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Author is required']
  },
  community: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Community',
    required: [true, 'Community is required']
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      maxlength: [1000, 'Comment cannot exceed 1000 characters']
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    likes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  }],
  isPinned: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  likeCount: {
    type: Number,
    default: 0
  },
  commentCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for performance
postSchema.index({ community: 1, createdAt: -1 });
postSchema.index({ author: 1 });
postSchema.index({ isPinned: -1, createdAt: -1 });

// Update counts before saving
postSchema.pre('save', function(next) {
  this.likeCount = this.likes.length;
  this.commentCount = this.comments.length;
  next();
});

// Check if user has liked post
postSchema.methods.hasLiked = function(userId) {
  return this.likes.some(likeId => likeId.toString() === userId.toString());
};

// Toggle like
postSchema.methods.toggleLike = function(userId) {
  const hasLiked = this.hasLiked(userId);
  if (hasLiked) {
    this.likes = this.likes.filter(likeId => likeId.toString() !== userId.toString());
  } else {
    this.likes.push(userId);
  }
  return !hasLiked;
};

// Add comment
postSchema.methods.addComment = function(userId, content) {
  this.comments.push({
    author: userId,
    content: content,
    createdAt: new Date()
  });
};

module.exports = mongoose.model('Post', postSchema);
