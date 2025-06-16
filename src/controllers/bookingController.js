
const User = require('../models/User');
const TurfOwner = require('../models/TurfOwner');
const Booking = require('../models/Booking');

exports.booking = async (req, res) => {
    try {
      const { userid, turfId, date, startTime, endTime, sport, amount } = req.body;
  
      if (!userid || !turfId || !date || !startTime || !endTime || !sport || !amount) {
        return res.status(400).json({ message: 'All fields are required' });
      }
  
      // Find user and turf
      const user = await User.findById( userid );
      const turf = await TurfOwner.findById({ turfId });
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      if (!turf) {
        return res.status(404).json({ message: 'Turf not found' });
      }
      if (!turf.sports.includes(sport)) {
        return res.status(400).json({ message: 'This sport is not available at this turf' });
      }
      const existingBooking = await Booking.findOne({
        turf: turf._id,
        date: new Date(date),
        startTime,
        endTime,
        status: { $ne: 'cancelled' }
      });
  
      if (existingBooking) {
        return res.status(400).json({ message: 'This time slot is already booked' });
      }
  
      
      const newBooking = new Booking({
        user: user._id,
        turf: turf._id,
        date: new Date(date),
        startTime,
        endTime,
        sport,
        amount
      });
  
      await newBooking.save();
  
      res.status(201).json({
        message: 'Booking successful',
        booking: {
          id: newBooking._id,
          date: newBooking.date,
          startTime: newBooking.startTime,
          endTime: newBooking.endTime,
          sport: newBooking.sport,
          amount: newBooking.amount,
          status: newBooking.status
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };