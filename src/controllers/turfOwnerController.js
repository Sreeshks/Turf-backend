const TurfOwner = require('../models/TurfOwner');
const { imageUpload } = require('../utils/imageupload');
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
    let imageUrl;
    if (req.file) {
      imageUrl = await imageUpload(req.file.path);
    } else {
      imageUrl = null;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const owner = new TurfOwner({ email, password: hashedPassword, name, turfLocation, sports, image: imageUrl });
    await owner.save();

    res.status(201).json({ 
      message: 'Turf owner registered successfully',
      turfId: owner.turfId,
      name: owner.name,
      email: owner.email,
      turfLocation: owner.turfLocation,
      sports: owner.sports,
      image: owner.image
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
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

    res.json({ 
      message: 'Login successful',
      turfId: owner.turfId,
      name: owner.name,
      email: owner.email,
      turfLocation: owner.turfLocation,
      sports: owner.sports,
      image: owner.image
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getProfileById = async (req, res) => {
  try {
    const { turfId } = req.params;
    const owner = await TurfOwner.findOne({ turfId }).select('-password -resetPasswordCode -resetPasswordExpires');
    
    if (!owner) {
      return res.status(404).json({ message: 'Turf owner not found' });
    }

    res.json({
      turfId: owner.turfId,
      name: owner.name,
      email: owner.email,
      turfLocation: owner.turfLocation,
      sports: owner.sports,
      image: owner.image
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const { email } = req.params;
    const owner = await TurfOwner.findOne({ email }).select('-password -resetPasswordCode -resetPasswordExpires');
    
    if (!owner) {
      return res.status(404).json({ message: 'Turf owner not found' });
    }

    res.json({
      turfId: owner.turfId,
      name: owner.name,
      email: owner.email,
      turfLocation: owner.turfLocation,
      sports: owner.sports,
      image: owner.image,
      createdAt: owner.createdAt,
      updatedAt: owner.updatedAt
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
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
    res.json({ 
      message: 'Profile updated successfully',
      turfId: owner.turfId,
      name: owner.name,
      email: owner.email,
      turfLocation: owner.turfLocation,
      sports: owner.sports,
      image: owner.image
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getAllTurfs = async (req, res) => {
  try {
    const turfs = await TurfOwner.find().select('-password -resetPasswordCode -resetPasswordExpires');
    res.json(turfs.map(turf => ({
      turfId: turf.turfId,
      name: turf.name,
      email: turf.email,
      turfLocation: turf.turfLocation,
      sports: turf.sports,
      image: turf.image
    })));
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
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

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    owner.resetPasswordCode = resetCode;
    owner.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
    await owner.save();

    res.json({ 
      message: 'Password reset code sent successfully',
      resetCode: resetCode 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
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

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    owner.password = hashedPassword;
    owner.resetPasswordCode = undefined;
    owner.resetPasswordExpires = undefined;
    await owner.save();

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.addTurf = async (req, res) => {
  try {
    const { email, name, turfLocation, sports, password } = req.body;

    // Validate required fields
    if (!email || !name || !turfLocation || !sports || !Array.isArray(sports) || !password) {
      return res.status(400).json({ message: 'Email, name, turf location, sports (as an array), and password are required' });
    }

    // Validate sports
    const validSports = ['Football', 'Cricket', 'Tennis', 'Badminton'];
    if (!sports.every(sport => validSports.includes(sport))) {
      return res.status(400).json({ message: 'Invalid sports provided' });
    }

    // Check if turf owner already exists
    const existingOwner = await TurfOwner.findOne({ email });
    if (existingOwner) {
      return res.status(400).json({ message: 'Turf owner with this email already exists' });
    }

    // Handle image upload
    let imageUrl;
    if (req.file) {
      imageUrl = await imageUpload(req.file.path);
    } else {
      imageUrl = null;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new turf owner (turf)
    const owner = new TurfOwner({
      email,
      password: hashedPassword,
      name,
      turfLocation,
      sports,
      image: imageUrl
    });
    await owner.save();

    res.status(201).json({
      message: 'Turf added successfully',
      turfId: owner.turfId,
      name: owner.name,
      email: owner.email,
      turfLocation: owner.turfLocation,
      sports: owner.sports,
      image: owner.image
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};