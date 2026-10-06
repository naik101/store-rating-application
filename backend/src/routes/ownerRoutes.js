const express = require('express');
const router = express.Router();
const ownerController = require('../controllers/ownerController');
const authMiddleware = require('../middlewares/authMiddleware');
const { checkRole } = require('../middlewares/roleMiddleware');

// Store owner portal
router.use(authMiddleware, checkRole('STORE_OWNER'));

router.get('/dashboard', ownerController.getOwnerDashboard);

module.exports = router;
