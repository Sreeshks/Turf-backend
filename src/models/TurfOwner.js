const mongoose = require('mongoose');

const turfOwnerSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  turfLocation: { type: String, required: true },
  sports: [{ type: String, enum: ['Football', 'Cricket', 'Tennis', 'Badminton'], required: true }],
  resetPasswordCode: { type: String },
  resetPasswordExpires: { type: Date },
  image: { type: String }
});

module.exports = mongoose.model('TurfOwner', turfOwnerSchema); 