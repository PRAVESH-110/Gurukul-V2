
const express = require('express');
const Event = require('../models/Event');
const Community = require('../models/Community');
const { protect, checkCommunityMembership, authorize } = require('../middleware/auth');
const { validateEvent, validateObjectId } = require('../middleware/validation');

const router = express.Router({ mergeParams: true });

// @desc    Get community events
// @route   GET /api/communities/:communityId/events
// @access  Private (Community members only or Admin)
const getCommunityEvents = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, upcoming = true } = req.query;
    const { communityId } = req.params;

    const query = { 
      community: communityId, 
      isActive: true 
    };

    // Filter for upcoming events
    if (upcoming === 'true') {
      query.startDate = { $gte: new Date() };
    }

    const events = await Event.find(query)
      .populate('creator', 'firstName lastName avatar')
      .populate('attendees.user', 'firstName lastName avatar')
      .sort({ startDate: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Event.countDocuments(query);

    res.status(200).json({
      success: true,
      count: events.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      },
      events
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new event
// @route   POST /api/communities/:communityId/events
// @access  Private (Community admin only or Admin)
const createEvent = async (req, res, next) => {
  try {
    const {
      title,
      description,
      startDate,
      endDate,
      meetingLink,
      location,
      maxAttendees,
      isRecurring,
      recurrencePattern
    } = req.body;
    const { communityId } = req.params;

    const community = req.community; // Set by checkCommunityMembership middleware

    // Check if user is admin of the community or system admin
    if (!community.isAdmin(req.user._id) && community.creator.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only community admins can create events'
      });
    }

    const eventData = {
      title,
      description,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      meetingLink,
      location,
      maxAttendees,
      isRecurring,
      community: communityId,
      creator: req.user._id
    };

    // Only include recurrencePattern if isRecurring is true
    if (isRecurring) {
      if (!recurrencePattern) {
        return res.status(400).json({
          success: false,
          message: 'Recurrence pattern is required for recurring events'
        });
      }
      eventData.recurrencePattern = recurrencePattern;
    }

    const event = await Event.create(eventData);

    await event.populate('creator', 'firstName lastName avatar');

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      event
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get event by ID
// @route   GET /api/events/:id
// @access  Private (Community members only or Admin)
const getEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('creator', 'firstName lastName avatar')
      .populate('attendees.user', 'firstName lastName avatar')
      .populate('community', 'name type');

    if (!event || !event.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if user is member of the community or admin
    const community = await Community.findById(event.community._id);
    const isMember = community.isMember(req.user._id);
    const isCreator = community.creator.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isMember && !isCreator && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You must be a member to view this event'
      });
    }

    res.status(200).json({
      success: true,
      event: {
        ...event.toObject(),
        userRSVP: event.attendees.find(a => a.user._id.toString() === req.user._id.toString())?.status || null
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private (Creator only or Admin)
const updateEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event || !event.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if user is creator or admin
    if (event.creator.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this event'
      });
    }

    const {
      title,
      description,
      startDate,
      endDate,
      meetingLink,
      location,
      maxAttendees,
      isRecurring,
      recurrencePattern
    } = req.body;

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      {
        title: title || event.title,
        description: description || event.description,
        startDate: startDate ? new Date(startDate) : event.startDate,
        endDate: endDate ? new Date(endDate) : event.endDate,
        meetingLink: meetingLink !== undefined ? meetingLink : event.meetingLink,
        location: location !== undefined ? location : event.location,
        maxAttendees: maxAttendees !== undefined ? maxAttendees : event.maxAttendees,
        isRecurring: isRecurring !== undefined ? isRecurring : event.isRecurring,
        recurrencePattern: recurrencePattern !== undefined ? recurrencePattern : event.recurrencePattern
      },
      {
        new: true,
        runValidators: true
      }
    ).populate('creator', 'firstName lastName avatar');

    res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      event: updatedEvent
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private (Creator only or Admin)
const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if user is creator or admin
    if (event.creator.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this event'
      });
    }

    // Soft delete
    event.isActive = false;
    await event.save();

    res.status(200).json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    RSVP to event
// @route   POST /api/events/:id/attend
// @access  Private (Community members only or Admin)
const rsvpToEvent = async (req, res, next) => {
  try {
    const { status } = req.body; // 'going', 'maybe', 'not_going'
    const event = await Event.findById(req.params.id);

    if (!event || !event.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if user is member of the community or admin
    const community = await Community.findById(event.community);
    const isMember = community.isMember(req.user._id);
    const isCreator = community.creator.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isMember && !isCreator && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You must be a member to RSVP to this event'
      });
    }

    // Check if event has max attendees limit
    if (event.maxAttendees && status === 'going') {
      const goingCount = event.attendees.filter(a => a.status === 'going').length;
      if (goingCount >= event.maxAttendees) {
        return res.status(400).json({
          success: false,
          message: 'Event has reached maximum capacity'
        });
      }
    }

    // Validate status
    if (!['going', 'maybe', 'not_going'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid RSVP status'
      });
    }

    // Update RSVP
    event.updateRSVP(req.user._id, status);
    await event.save();

    res.status(200).json({
      success: true,
      message: `RSVP updated to ${status}`,
      status
    });
  } catch (error) {
    next(error);
  }
};

// Routes
router.get('/', protect, checkCommunityMembership, getCommunityEvents);
router.post('/', protect, checkCommunityMembership, validateEvent, createEvent);
router.get('/:id', protect, validateObjectId('id'), getEvent);
router.put('/:id', protect, validateObjectId('id'), updateEvent);
router.delete('/:id', protect, validateObjectId('id'), deleteEvent);
router.post('/:id/attend', protect, validateObjectId('id'), rsvpToEvent);

module.exports = router;
