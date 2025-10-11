const express = require('express');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const User = require('../models/User');
const { protect, rateLimiter } = require('../middleware/auth');
const { validateUserRegistration, validateUserLogin } = require('../middleware/validation');
const { body, validationResult } = require('express-validator');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

const router = express.Router();

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '24h'
  });
};

// @desc    Register userl̥
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { firstName, lastName, email, password, role = 'student' } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'EMAIL_EXISTS',
        message: 'An account with this email already exists. Please use a different email or log in.'
      });
    }

    // Create user
    const user = await User.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      password,
      role,
      isActive: true,
      emailVerified: false,
      verificationToken: crypto.randomBytes(20).toString('hex'),
      verificationExpires: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
    });

    // Generate token
    const token = generateToken(user._id);

    // Send verification email
    try {
      const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${user.verificationToken}`;
      
      await sendEmail({
        to: user.email,
        subject: 'Verify Your Email - Gurukul Platform',
        html: `
          <h2>Welcome to Gurukul Platform!</h2>
          <p>Please verify your email by clicking the link below:</p>
          <a href="${verificationUrl}" style="display: inline-block; padding: 10px 20px; background: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">
            Verify Email
          </a>
          <p>Or copy and paste this link in your browser:</p>
          <p>${verificationUrl}</p>
          <p>This link will expire in 24 hours.</p>
        `
      });
    } catch (emailError) {
      console.error('Error sending verification email:', emailError);
      // Don't fail the registration if email sending fails
    }

    // Remove sensitive data before sending response
    user.password = undefined;
    user.verificationToken = undefined;
    user.verificationExpires = undefined;

    res.status(201).json({
      success: true,
      message: 'Registration successful! Please check your email to verify your account.',
      token,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user and include password
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Check password
    const isPasswordMatch = await user.comparePassword(password);
    
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    user.lastLoginAt = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        lastLoginAt: user.lastLoginAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('joinedCommunities', 'name type coverImage')
      .populate('enrolledCourses', 'title thumbnail creator');

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, bio, avatar } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        firstName: firstName || req.user.firstName,
        lastName: lastName || req.user.lastName,
        bio: bio !== undefined ? bio : req.user.bio,
        avatar: avatar || req.user.avatar
      },
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};

// Additional auth routes
router.post('/forgot-password', [
  body('email').isEmail().withMessage('Please provide a valid email')
], async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save({ validateBeforeSave: false });

    // Send email with reset link
    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
    
    await sendEmail({
      to: user.email,
      subject: 'Password Reset Request - Gurukul Platform',
      html: `
        <h2>Password Reset Request</h2>
        <p>You are receiving this email because you (or someone else) has requested a password reset.</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">
          Reset Password
        </a>
        <p>Or copy and paste this link in your browser:</p>
        <p>${resetUrl}</p>
        <p>This link will expire in 10 minutes.</p>
        <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
      `
    });

    res.status(200).json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Error processing forgot password request'
    });
  }
});

router.post('/reset-password', [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { token, password } = req.body;
    
    // Hash the token from the URL to match the hashed token in the database
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_TOKEN',
        message: 'Invalid or expired reset token'
      });
    }

    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    // Send confirmation email
    await sendEmail({
      to: user.email,
      subject: 'Password Reset Successful - Gurukul Platform',
      html: `
        <h2>Password Reset Successful</h2>
        <p>Your password has been successfully reset. If you did not make this change, please contact support immediately.</p>
      `
    });

    res.status(200).json({
      success: true,
      message: 'Password reset successful. You can now log in with your new password.'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Error resetting password'
    });
  }
});

// Email verification route
router.get('/verify-email', async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_TOKEN',
        message: 'Verification token is required'
      });
    }

    const user = await User.findOne({
      verificationToken: token,
      verificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_TOKEN',
        message: 'Invalid or expired verification token'
      });
    }

    // Update user
    user.emailVerified = true;
    user.verificationToken = undefined;
    user.verificationExpires = undefined;
    await user.save();

    // Redirect to login page with success message
    res.redirect(`${process.env.CLIENT_URL}/login?verified=true`);
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Error verifying email'
    });
  }
});

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// Export the router and route handlers
router.post('/register', [validateUserRegistration, authLimiter], register);
router.post('/login', [validateUserLogin, authLimiter], login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/logout', protect, logout);

module.exports = {
  router,
  register,
  login,
  getMe,
  updateProfile,
  logout
};


module.exports = router;
