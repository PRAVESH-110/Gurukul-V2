const mongoose = require('mongoose');

const membershipSchema = new mongoose.Schema(
  {
    community: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Community',
      required: [true, 'Community reference is required'],
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    role: {
      type: String,
      enum: ['admin', 'member', 'creator'],
      default: 'member',
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

// Prevent duplicate membership for the same user in a community
membershipSchema.index({ community: 1, user: 1 }, { unique: true });
// Fast query for "communities I have joined"
membershipSchema.index({ user: 1, joinedAt: -1 });

module.exports = mongoose.model('Membership', membershipSchema);
