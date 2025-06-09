const TurfOwner = require('../models/TurfOwner');
const {imageUpload}=require('../utils/imageupload')
const bcrypt = require('bcrypt');

exports.register = async (req, res) => {
try {
const { email, password, name, turfLocation, sports  } =  req.body;

// if (!email || !password || !name || !turfLocation || !sports || !image ||!Array.isArray(sports)) {
//   return res.status(400).json({ message: 'All fields are required, and sports must be an array' });
// }

const validSports = ['Football', 'Cricket', 'Tennis', 'Badminton'];
if (!sports.every(sport => validSports.includes(sport))) {
return res.status(400).json({ message: 'Invalid sports provided' });
}

const existingOwner = await TurfOwner.findOne({ email });
if (existingOwner) {
return res.status(400).json({ message: 'Turf owner already exists' });
}
let imageUrl;
if(req.file){
imageUrl=await imageUpload(req.file.path)
}else{
imageUrl=null;
}

const hashedPassword = await bcrypt.hash(password, 10);
const owner = new TurfOwner({ email, password: hashedPassword, name, turfLocation, sports,image:imageUrl });
await owner.save();

res.status(201).json({
message: 'Turf owner registered successfully',
turfId: owner.turfId,
name: owner.name,
email: owner.email,
turfLocation: owner.turfLocation,
sports: owner.sports,
image:owner.image
});
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

res.json({
message: 'Login successful',
turfId: owner.turfId,
name: owner.name,
email: owner.email,
turfLocation: owner.turfLocation,
sports: owner.sports,
image:owner.image
});
} catch (error) {
res.status(500).json({ message: 'Server error', error });
}
};

exports.getProfile = async (req, res) => {
try {
const { email } = req.params;
const owner = await TurfOwner.findOne({ email }).select('-password -resetPasswordCode -resetPasswordExpires');

if (!owner) {
return res.status(404).json({ message: 'Turf owner not found' });
}

// Return complete profile details
res.json({
turfId: owner.turfId,
name: owner.name,
email: owner.email,
turfLocation: owner.turfLocation,
sports: owner.sports,
image:owner.image,
createdAt: owner.createdAt,
updatedAt: owner.updatedAt
});
} catch (error) {
res.status(500).json({ message: 'Server error', error });
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
sports: turf.sports
})));
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
resetCode: resetCode
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

exports.addturf = async (req, res) => {
  try {
    const { name, location, sports, pricePerHour, description } = req.body;
    const { email } = req.params;
    if (!name || !location || !sports || !pricePerHour) {
      return res.status(400).json({ message: 'Name, location, sports, and price per hour are required' });
    }

    const validSports = ['Football', 'Cricket', 'Tennis', 'Badminton'];
    if (!Array.isArray(sports) || !sports.every(sport => validSports.includes(sport))) {
      return res.status(400).json({ message: 'Invalid sports provided' });
    }

    const owner = await TurfOwner.findOne({ email });
    if (!owner) {
      return res.status(404).json({ message: 'Turf owner not found' });
    }
    let imageUrl;
    if (req.file) {
      imageUrl = await imageUpload(req.file.path);
    }
    const newTurf = {
      name,
      location,
      sports,
      pricePerHour,
      description: description || '',
      image: imageUrl,
      ownerId: owner.turfId
    };
    if (!owner.turfs) {
      owner.turfs = [];
    }
    owner.turfs.push(newTurf);
    await owner.save();

    res.status(201).json({
      message: 'Turf added successfully',
      turf: newTurf
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};