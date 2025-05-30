const TurfOwner = require('../models/TurfOwner');
const bcrypt = require('bcrypt');

exports.register = async (req, res) => {
  try {
    const { email, password, name, turfLocation, sports } = req.body;
    if (!email || !password || !name || !turfLocation || !sports || !Array.isArray(sports)) {
      return res.status(400).json({ message: 'All fields are required, and sports must be an array' });
    }

    const validSports = ['Football', 'Cricket', 'Tennis', 'Badminton'];
    if (!sports.every(sport => validSports.includes(sport))) {
      return res.status(400).json({ message: 'Invalid sports provided' });
    }

    const existingOwner = await TurfOwner.findOne({ email });
    if (existingOwner) {
      return res.status(400).json({ message: 'Turf owner already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const owner = new TurfOwner({ email, password: hashedPassword, name, turfLocation, sports });
    await owner.save();

    res.status(201).json({ message: 'Turf owner registered successfully' });
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

    const owner = await TurfOwner.findOne({ email });
    if (!owner) {
      return res.status(401).json({ message: 'Invalid email' });
    }

    const isMatch = await bcrypt.compare(password, owner.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid Password' });
    }

    res.json({ message: 'Login successful' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const owner = await TurfOwner.findOne({ email: req.params.email }).select('-password');
    if (!owner) {
      return res.status(404).json({ message: 'Turf owner not found' });
    }
    res.json(owner);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, password, turfLocation, sports } = req.body;
    const { email } = req.params;

    const owner = await TurfOwner.findOne({ email });
    if (!owner) {
      return res.status(404).json({ message: 'Turf owner not found' });
    }

    if (name) owner.name = name;
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      owner.password = hashedPassword;
    }
    if (turfLocation) owner.turfLocation = turfLocation;
    if (sports) {
      const validSports = ['Football', 'Cricket', 'Tennis', 'Badminton'];
      if (!Array.isArray(sports) || !sports.every(sport => validSports.includes(sport))) {
        return res.status(400).json({ message: 'Invalid sports provided' });
      }
      owner.sports = sports;
    }

    await owner.save();
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

exports.getAllTurfs = async (req, res) => {
  try {
    const turfs = await TurfOwner.find().select('-password');
    res.json(turfs);
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

    const owner = await TurfOwner.findOne({ email });
    if (!owner) {
      return res.status(404).json({ message: 'Turf owner not found' });
    }

    // Generate a random 6-digit code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store the reset code and its expiry (15 minutes from now)
    owner.resetPasswordCode = resetCode;
    owner.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
    await owner.save();

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

    const owner = await TurfOwner.findOne({ 
      email,
      resetPasswordCode: resetCode,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!owner) {
      return res.status(400).json({ message: 'Invalid or expired reset code' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password and clear reset code fields
    owner.password = hashedPassword;
    owner.resetPasswordCode = undefined;
    owner.resetPasswordExpires = undefined;
    await owner.save();

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
}; 