const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema({
  familyId: {
    type: String,
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  tokenHash: {
    type: String,
    required: true,
    unique: true
  },
  csrfNonce: {
    type: String,
    required: true
  },
  consumedAt: {
    type: Date,
    default: null
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 }
  }
}, { timestamps: true });

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);
