const express = require('express');
const router = express.Router();

// ✅ correct imports
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// ✅ routes
router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);

// ✅ export
module.exports = router;


