const mongoose = require('mongoose');

module.exports = mongoose.model('Alert', new mongoose.Schema({
  userName: String,
  contacts: [String],
  active: { type: Boolean, default: true },
  lastLocation: { lat: Number, lng: Number, at: Date },
  path: [{ lat: Number, lng: Number, at: Date }],
  createdAt: { type: Date, default: Date.now }
}));