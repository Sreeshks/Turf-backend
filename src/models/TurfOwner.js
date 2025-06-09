const mongoose = require('mongoose');

const turfOwnerSchema = new mongoose.Schema({
name: { type: String, required: true },
turfLocation: { type: String, required: true },
sports: [{ type: String, enum: ['Football', 'Cricket', 'Tennis', 'Badminton'], required: true }],
image: { type: String },
userid: {
  type: mongoose.ObjectId,
  ref: "User"
}
});

module.exports = mongoose.model('TurfOwner', turfOwnerSchema);