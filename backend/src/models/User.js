const mongoose = require('mongoose');
const fallbackDb = require('../utils/fallbackDb');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
}, { timestamps: true });

const UserMongooseModel = mongoose.model('User', userSchema);

// Export a Proxy that dynamically selects between Mongoose and local fallback DB
module.exports = new Proxy(UserMongooseModel, {
  get(target, prop) {
    if (mongoose.connection.readyState === 1) {
      return target[prop];
    }
    // Fallback to mock local DB
    return fallbackDb.User[prop];
  }
});
