const express = require('express');
const {
  getGrievances,
  getGrievance,
  createGrievance,
  updateGrievance,
  analyzeGrievance,
  checkDeadline,
  timeLeap,
  getPortalsAPI,
  generateAppealAPI,
  submitAppealAPI
} = require('../controllers/grievanceController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/get-portals', getPortalsAPI);
router.post('/generate-appeal', generateAppealAPI);
router.post('/get-appeal-portals', getPortalsAPI);

router.use(protect); // Secure remaining routes

router.route('/')
  .get(getGrievances)
  .post(createGrievance);

router.post('/classify', analyzeGrievance);
router.post('/get-portals', getPortalsAPI);
router.post('/generate-appeal', generateAppealAPI);
router.post('/:id/submit-appeal', submitAppealAPI);
router.post('/:id/check-deadline', checkDeadline);
router.post('/:id/time-leap', timeLeap);

router.route('/:id')
  .get(getGrievance)
  .put(updateGrievance);

module.exports = router;
