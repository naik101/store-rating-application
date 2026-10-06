const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/ratingController');
const authMiddleware = require('../middlewares/authMiddleware');
const { checkRole } = require('../middlewares/roleMiddleware');
const { validateRating } = require('../middlewares/validator');

// Normal users submit / modify rating (1 to 5)
router.post(
  '/',
  authMiddleware,
  checkRole('USER'),
  validateRating,
  ratingController.submitOrUpdateRating
);

module.exports = router;
