const TurfOwner = require('../models/TurfOwner');
const {imageUpload}=require('../utils/imageupload')
const bcrypt = require('bcrypt');


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
const turfs = await TurfOwner.find();
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
    const {name, location, sports, turfImage ,userid } = req.body;

    if (!name || !location || !sports ) {
      return res.status(400).json({ message: 'Name, location, sports are required' });
    }

    const validSports = ['Football', 'Cricket', 'Tennis', 'Badminton'];
    if (!Array.isArray(sports) || !sports.every(sport => validSports.includes(sport))) {
      return res.status(400).json({ message: 'Invalid sports provided' });
    }
    let imageUrl;
    if (req.file) {
      imageUrl = await imageUpload(req.file.path);
    } else if (turfImage) {
      imageUrl = turfImage;
    }

    const newTurf = {
      name,
      location,
      sports,
      image: imageUrl,
      userid: userid
    };
    const user = new TurfOwner(newTurf);
    await user.save();

    res.status(200).json({
      message: 'Turf added successfully',
      turf: user
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
