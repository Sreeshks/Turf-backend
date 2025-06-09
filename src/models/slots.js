const { Mongoose, default: mongoose } = require("mongoose");


const slotSchema = new mongoose.Schema({
    turfId: { type: String, required: true },
  date: { type: String, required: true }, 
  startTime: { type: String, required: true }, 
  endTime: { type: String, required: true },
  isBooked: { type: Boolean, default: false },
});
 const Slot = mongoose.model("Slot",slotSchema);

 module.exports = Slot