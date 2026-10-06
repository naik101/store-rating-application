const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middlewares/authMiddleware');
const { checkRole } = require('../middlewares/roleMiddleware');
const { validateAddUser, validateAddStore } = require('../middlewares/validator');

// All admin routes require ADMIN role
router.use(authMiddleware, checkRole('ADMIN'));

// Dashboard stats: total users, stores, ratings
router.get('/stats', adminController.getDashboardStats);

// Users management
router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUserDetails);
router.post('/users', validateAddUser, adminController.addUser);

// Stores management
router.get('/stores', adminController.getStores);
router.post('/stores', validateAddStore, adminController.addStore);

// Store owner rating information
router.get('/owner-ratings', adminController.getStoreOwnerRatings);

module.exports = router;
