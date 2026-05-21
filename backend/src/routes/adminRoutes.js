const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const {
  getStats,
  getAllUsers,
  updateUserRole,
  deleteUser,
  getAllItineraries,
  deleteItinerary
} = require('../controllers/adminController');

// All routes below require protect and admin authorization
router.use(protect);
router.use(admin);

router.get('/stats', getStats);
router.get('/users', getAllUsers);
router.put('/users/role', updateUserRole);
router.delete('/users/:id', deleteUser);
router.get('/itineraries', getAllItineraries);
router.delete('/itineraries/:id', deleteItinerary);

module.exports = router;
