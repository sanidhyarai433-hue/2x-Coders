const express = require('express');
const { getGrievances, getGrievance, createGrievance, updateGrievance } = require('../controllers/grievanceController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect); // Secure all routes

router.route('/')
  .get(getGrievances)
  .post(createGrievance);

router.route('/:id')
  .get(getGrievance)
  .put(updateGrievance);

module.exports = router;
