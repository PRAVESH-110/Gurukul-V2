const mongoose = require('mongoose');

const communitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Community name is required'],
    trim: true,
    maxlength: [100, 'Community name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Community description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  type: {
    type: String,
    enum: ['public', 'private'],
    required: [true, 'Community type is required'],
    default: 'public'
  },
  coverImage: {
    type: String,
    default: null
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Creator is required']
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    role: {
      type: String,
      enum: ['admin', 'member','creator'],
      default: 'member'
    }
  }],
  memberCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  rules: {
    type: String,
    maxlength: [2000, 'Rules cannot exceed 2000 characters'],
    default: ''
  }
}, {
  timestamps: true
});

// Indexes for performance
communitySchema.index({ creator: 1 });
communitySchema.index({ type: 1 });
communitySchema.index({ 'members.user': 1 });
communitySchema.index({ name: 'text', description: 'text' });

// Update member count before saving
communitySchema.pre('save', function(next) {
  this.memberCount = this.members.length;
  next();
});

// Check if user is member
communitySchema.methods.isMember = function(userId) {
  return this.members.some(member => member.user.toString() === userId.toString());
};

// Check if user is admin
communitySchema.methods.isAdmin = function(userId) {
  const member = this.members.find(member => member.user.toString() === userId.toString());
  return member && member.role === 'admin';
};

// Add member method
communitySchema.methods.addMember = function(userId, role = 'member') {
  if (!this.isMember(userId)) {
    this.members.push({
      user: userId,
      role: role,
      joinedAt: new Date()
    });
  }
};

// Remove member method
communitySchema.methods.removeMember = function(userId) {
  this.members = this.members.filter(member => member.user.toString() !== userId.toString());
};

module.exports = mongoose.model('Community', communitySchema);
