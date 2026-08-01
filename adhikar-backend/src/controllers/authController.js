const jwt = require('jsonwebtoken');
const User = require('../models/User');

// In-memory store for active OTP validation
const activeOtps = new Map();

// Helper to sign JWT
const getSignedJwtToken = (user) => {
  return jwt.sign(
    {
      id: user._id || user.id,
      phone: user.phone,
      firstName: user.firstName,
      lastName: user.lastName,
      gender: user.gender,
      dob: user.dob,
      state: user.state,
      district: user.district
    },
    process.env.JWT_SECRET || 'supersecretjwtkeyforadhikarai123!',
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// @desc    Send OTP to phone number (Simulated)
// @route   POST /api/auth/send-otp
// @access  Public
exports.sendOtp = async (req, res) => {
  const { phone } = req.body;

  if (!phone || !/^[6-9]\d{9}$/.test(phone)) {
    return res.status(400).json({ success: false, message: 'Please enter a valid 10-digit Indian mobile number' });
  }

  // Generate 4-digit OTP code
  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  activeOtps.set(phone, otp);

  // Print to console for server transparency
  console.log(`[SMS Gateway Simulator] Sent verification code ${otp} to phone ${phone}`);

  // In development/test mode, we return it in response to show a simulator popup on frontend
  res.status(200).json({
    success: true,
    message: 'OTP sent successfully',
    otp // Dummy return for frontend display
  });
};

// @desc    Verify OTP and log in / redirect to signup
// @route   POST /api/auth/verify-otp
// @access  Public
exports.verifyOtp = async (req, res) => {
  const { phone, otp } = req.body;

  if (!phone || !otp) {
    return res.status(400).json({ success: false, message: 'Please provide phone and OTP' });
  }

  const storedOtp = activeOtps.get(phone);

  // OTP check (allow '1234' as universal master bypass code for testing)
  if (otp !== '1234' && otp !== storedOtp) {
    return res.status(400).json({ success: false, message: 'Invalid verification code. Use the dummy code shown.' });
  }

  // Clear OTP once used
  activeOtps.delete(phone);

  try {
    let user;
    try {
      user = await User.findOne({ phone });
    } catch (dbErr) {
      console.warn('Database offline, checking against mock login');
    }

    // Default registered mock user
    if (!user && phone === '9876543210') {
      user = {
        _id: 'mock_citizen_id_12345',
        phone: '9876543210',
        firstName: 'Adhikar',
        lastName: 'Demo Citizen',
        gender: 'Male',
        dob: '1995-05-15',
        state: 'Maharashtra',
        district: 'Mumbai',
        role: 'citizen'
      };
    }

    if (user) {
      const token = getSignedJwtToken(user);
      return res.status(200).json({
        success: true,
        registered: true,
        token,
        user: {
          id: user._id || user.id,
          phone: user.phone,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: user.fullName || `${user.firstName} ${user.lastName}`,
          state: user.state,
          district: user.district
        }
      });
    } else {
      // User does not exist, tell frontend to show signup fields
      return res.status(200).json({
        success: true,
        registered: false,
        message: 'Phone number verified. Please complete your registration profile.'
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Register a new citizen profile
// @route   POST /api/auth/signup
// @access  Public
exports.signup = async (req, res) => {
  const { phone, firstName, lastName, gender, dob, state, district } = req.body;

  if (!phone || !firstName || !lastName || !gender || !dob || !state || !district) {
    return res.status(400).json({ success: false, message: 'Please fill in all profile fields' });
  }

  try {
    let user;
    try {
      user = await User.create({
        phone,
        firstName,
        lastName,
        gender,
        dob,
        state,
        district
      });
    } catch (dbErr) {
      console.warn('Database offline, simulating dynamic registration record');
      user = {
        _id: 'mock_user_' + Math.random().toString(36).substr(2, 9),
        phone,
        firstName,
        lastName,
        gender,
        dob,
        state,
        district
      };
    }

    const token = getSignedJwtToken(user);
    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id || user.id,
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: `${user.firstName} ${user.lastName}`,
        state: user.state,
        district: user.district
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    data: req.user
  });
};
