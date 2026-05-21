const express = require('express');
const router = express.Router();
const { 
  createItinerary, 
  getMyItineraries, 
  getItineraryById, 
  getSharedItinerary,
  deleteItinerary
} = require('../controllers/itineraryController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Protected routes
router.post('/', protect, upload.array('documents', 5), createItinerary);
router.get('/', protect, getMyItineraries);
router.get('/:id', protect, getItineraryById);
router.delete('/:id', protect, deleteItinerary);

// Public route for shared itineraries
router.get('/shared/:shareId', getSharedItinerary);

module.exports = router;
