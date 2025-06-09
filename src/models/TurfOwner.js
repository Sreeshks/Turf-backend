const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const turfOwnerSchema = new mongoose.Schema({
  turfId: { type: String, default: uuidv4, unique: true },
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