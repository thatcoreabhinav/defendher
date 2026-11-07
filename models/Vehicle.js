const mongoose = require('mongoose');

module.exports = mongoose.model('Vehicle', new mongoose.Schema({
  number: { type: String, unique: true, uppercase: true },
  type: String,
  driverName: String,
  phone: String,
  licenseNo: String
}));