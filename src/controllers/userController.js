const User = require('../models/User');
const TurfOwner = require('../models/TurfOwner');
const Booking = require('../models/Booking');
const bcrypt = require('bcrypt');

exports.register = async (req, res) => {
  try {
    const { email, password, name , usertype } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Email, password, and name are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword, name ,usertype });
    await user.save();

    res.status(200).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.json({  _id : user._id,
      name : user.name,
      email: user.email,
      usertype: user.usertype,
      message: 'Login successful' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email }).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, password } = req.body;
    const { email } = req.params;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name) user.name = name;
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }

    await user.save();
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate a random 6-digit code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store the reset code and its expiry (15 minutes from now)
    user.resetPasswordCode = resetCode;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save();

    // In a real application, you would send this code via email
    // For now, we'll just return it in the response
    res.json({ 
      message: 'Password reset code sent successfully',
      resetCode: resetCode // Remove this in production and implement email sending
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, resetCode, newPassword } = req.body;
    if (!email || !resetCode || !newPassword) {
      return res.status(400).json({ message: 'Email, reset code, and new password are required' });
    }

    const user = await User.findOne({ 
      email,
      resetPasswordCode: resetCode,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset code' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password and clear reset code fields
    user.password = hashedPassword;
    user.resetPasswordCode = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

exports.booking = async (req, res) => {
  try {
    const { email, turfId, date, startTime, endTime, sport, amount } = req.body;

    if (!email || !turfId || !date || !startTime || !endTime || !sport || !amount) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Find user and turf
    const user = await User.findOne({ email });
    const turf = await TurfOwner.findOne({ turfId });

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