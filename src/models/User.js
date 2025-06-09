const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  time: { type: String},
  usertype: { type: String, required: true, enum: ["Admin", "User"], default: "User" },
  resetPasswordCode: { type: String },
  resetPasswordExpires: { type: Date }
});


module.exports = mongoose.model('User', userSchema); 