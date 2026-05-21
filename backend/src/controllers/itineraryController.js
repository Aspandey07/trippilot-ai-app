const Itinerary = require('../models/Itinerary');
const { extractAndGenerateItinerary } = require('../services/aiService');
const crypto = require('crypto');

const createItinerary = async (req, res) => {
  try {
    const files = req.files;
    const title = req.body.title || 'My Amazing Trip';

    if (!files || files.length === 0) {
      return res.status(400).json({ message: 'No documents uploaded' });
    }

    // Pass files to AI for extraction and generation
    const aiData = await extractAndGenerateItinerary(files, title);

    const shareId = crypto.randomBytes(8).toString('hex');

    const newItinerary = await Itinerary.create({
      user: req.user.id,
      title,
      documents: files.map(file => ({
        filename: file.originalname,
        originalname: file.originalname,
        mimetype: file.mimetype,
      })),
      destination: aiData.extractedDetails.destination,
      travelDates: aiData.extractedDetails.travelDates,
      flightDetails: aiData.extractedDetails.flightDetails,
      hotelDetails: aiData.extractedDetails.hotelDetails,
      itinerarySummary: aiData.itinerary,
      liveWeather: aiData.liveWeather,
      suggestedHotels: aiData.suggestedHotels,
      shareId
    });

    res.status(201).json(newItinerary);
  } catch (error) {
    console.error('Error creating itinerary:', error);
    res.status(500).json({ message: error.message || 'Error creating itinerary' });
  }
};

const getMyItineraries = async (req, res) => {
  try {
    const itineraries = await Itinerary.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(itineraries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getItineraryById = async (req, res) => {
  try {
    const itinerary = await Itinerary.findById(req.params.id);
    if (!itinerary) {
      return res.status(404).json({ message: 'Itinerary not found' });
    }
    
    // Ensure the user owns this itinerary
    if (itinerary.user.toString() !== req.user.id) {
       return res.status(401).json({ message: 'Not authorized' });
    }

    res.json(itinerary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSharedItinerary = async (req, res) => {
  try {
    const itinerary = await Itinerary.findOne({ shareId: req.params.shareId }).populate('user', 'name');
    if (!itinerary) {
      return res.status(404).json({ message: 'Shared itinerary not found' });
    }
    res.json(itinerary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteItinerary = async (req, res) => {
  try {
    const itinerary = await Itinerary.findById(req.params.id);
    if (!itinerary) {
      return res.status(404).json({ message: 'Itinerary not found' });
    }
    
    // Ensure the user owns this itinerary
    if (itinerary.user.toString() !== req.user.id) {
       return res.status(401).json({ message: 'Not authorized' });
    }

    await Itinerary.findByIdAndDelete(req.params.id);
    res.json({ message: 'Itinerary successfully deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createItinerary,
  getMyItineraries,
  getItineraryById,
  getSharedItinerary,
  deleteItinerary
};
