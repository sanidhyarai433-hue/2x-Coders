const express = require('express');
const {
  getGrievances,
  getGrievance,
  createGrievance,
  updateGrievance,
  analyzeGrievance,
  checkDeadline,
  timeLeap
} = require('../controllers/grievanceController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect); // Secure all routes

router.route('/')
  .get(getGrievances)
  .post(createGrievance);

router.post('/classify', analyzeGrievance);
router.post('/:id/check-deadline', checkDeadline);
router.post('/:id/time-leap', timeLeap);

router.route('/:id')
  .get(getGrievance)
  .put(updateGrievance);

module.exports = router;
