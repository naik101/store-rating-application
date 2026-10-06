const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const optionalAuthMiddleware = require('../middlewares/optionalAuthMiddleware');

// Get all stores (includes current user rating if logged in)
router.get('/', optionalAuthMiddleware, storeController.getAllStores);

// Get single store details
router.get('/:id', optionalAuthMiddleware, storeController.getStoreById);

module.exports = router;
