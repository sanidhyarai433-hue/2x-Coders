const express = require('express');
const { sendOtp, verifyOtp, signup, getMe, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/send-otp', sendOtp);
router.post('/request-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/signup', signup);
router.post('/create-profile', signup);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

module.exports = router;
