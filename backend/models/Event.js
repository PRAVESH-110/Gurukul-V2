const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Event description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  meetingLink: {
    type: String,
    default: null
  },
  community: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Community',
    required: [true, 'Community is required']
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Creator is required']
  },
  attendees: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: ['going', 'maybe', 'not_going'],
      default: 'going'
    },
    rsvpAt: {
      type: Date,
      default: Date.now
    }
  }],
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurrencePattern: {
    type: String,
    enum: {
      values: ['daily', 'weekly', 'monthly', 'yearly'],
      message: 'Recurrence pattern must be one of: daily, weekly, monthly, yearly'
    },
    required: [
      function() { return this.isRecurring === true; },
      'Recurrence pattern is required for recurring events'
    ]
  },
  location: {
    type: String,
    default: null
  },
  maxAttendees: {
    type: Number,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  attendeeCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for performance
eventSchema.index({ community: 1, startDate: 1 });
eventSchema.index({ creator: 1 });
eventSchema.index({ startDate: 1, endDate: 1 });

// Validate end date is after start date
eventSchema.pre('save', function(next) {
  if (this.endDate <= this.startDate) {
    return next(new Error('End date must be after start date'));
  }
  this.attendeeCount = this.attendees.length;
  next();
});

// Check if user is attending
eventSchema.methods.isAttending = function(userId) {
  return this.attendees.some(attendee => 
    attendee.user.toString() === userId.toString() && attendee.status === 'going'
  );
};

// Update RSVP
eventSchema.methods.updateRSVP = function(userId, status) {
  const existingAttendee = this.attendees.find(attendee => 
    attendee.user.toString() === userId.toString()
  );
  
  if (existingAttendee) {
    existingAttendee.status = status;
    existingAttendee.rsvpAt = new Date();
  } else {
    this.attendees.push({
      user: userId,
      status: status,
      rsvpAt: new Date()
    });
  }
};

module.exports = mongoose.model('Event', eventSchema);
