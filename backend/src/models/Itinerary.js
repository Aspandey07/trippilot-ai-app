const mongoose = require('mongoose');
const fallbackDb = require('../utils/fallbackDb');

const itinerarySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  documents: [{
    filename: String,
    originalname: String,
    mimetype: String,
    path: String,
  }],
  destination: String,
  travelDates: {
    checkIn: Date,
    checkOut: Date,
  },
  flightDetails: {
    flightNumber: String,
    departureTime: String,
    arrivalTime: String,
  },
  hotelDetails: {
    hotelName: String,
    address: String,
  },
  itinerarySummary: mongoose.Schema.Types.Mixed, // Generated day-by-day JSON or string structure
  liveWeather: {
    temp: Number,
    condition: String,
    suitability: String
  },
  suggestedHotels: [{
    name: String,
    address: String
  }],
  shareId: { // For public share link
    type: String,
    unique: true
  }
}, { timestamps: true });

const ItineraryMongooseModel = mongoose.model('Itinerary', itinerarySchema);

// Export a Proxy that dynamically selects between Mongoose and local fallback DB
module.exports = new Proxy(ItineraryMongooseModel, {
  get(target, prop) {
    if (mongoose.connection.readyState === 1) {
      return target[prop];
    }
    // Fallback to mock local DB
    return fallbackDb.Itinerary[prop];
  }
});
