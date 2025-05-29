const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Schemas
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true }
});
const User = mongoose.model('User', userSchema);

const turfOwnerSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  turfLocation: { type: String, required: true },
  sports: [{ type: String, enum: ['Football', 'Cricket', 'Tennis', 'Badminton'], required: true }]
});
const TurfOwner = mongoose.model('TurfOwner', turfOwnerSchema);

// Swagger configuration
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Turf Booking API',
      version: '1.0.0',
      description: 'API for user and turf owner registration, login, and turf management without authentication',
    },
    servers: [
      { url: 'http://localhost:3000', description: 'Local server' }
    ]
  },
  apis: [path.join(__dirname, 'index.js')],
};
const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

/**
 * @swagger
 * /user/register:
 *   post:
 *     summary: Register a new user
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *               name:
 *                 type: string
 *                 example: John Doe
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: User already exists or invalid input
 *       500:
 *         description: Server error
 */
app.post('/user/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Email, password, and name are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword, name });
    await user.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

/**
 * @swagger
 * /user/login:
 *   post:
 *     summary: Login a user
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Server error
 */
app.post('/user/login', async (req, res) => {
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

    res.json({ message: 'Login successful' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

/**
 * @swagger
 * /user/profile/{email}:
 *   get:
 *     summary: Get user profile by email
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         description: Email of the user
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 email:
 *                   type: string
 *                 name:
 *                   type: string
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
app.get('/user/profile/:email', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email }).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

/**
 * @swagger
 * /user/profile/{email}:
 *   put:
 *     summary: Update user profile
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         description: Email of the user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               password:
 *                 type: string
 *                 example: newpassword123
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
app.put('/user/profile/:email', async (req, res) => {
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
});

/**
 * @swagger
 * /turf-owner/register:
 *   post:
 *     summary: Register a new turf owner
 *     tags: [Turf Owner]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: owner@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *               name:
 *                 type: string
 *                 example: Jane Doe
 *               turfLocation:
 *                 type: string
 *                 example: 123 Sports Lane, Bangalore
 *               sports:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [Football, Cricket, Tennis, Badminton]
 *                 example: [Football, Cricket]
 *     responses:
 *       201:
 *         description: Turf owner registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Turf owner already exists or invalid input
 *       500:
 *         description: Server error
 */
app.post('/turf-owner/register', async (req, res) => {
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
});

/**
 * @swagger
 * /turf-owner/login:
 *   post:
 *     summary: Login a turf owner
 *     tags: [Turf Owner]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: owner@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Server error
 */
app.post('/turf-owner/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const owner = await TurfOwner.findOne({ email });
    if (!owner) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, owner.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.json({ message: 'Login successful' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

/**
 * @swagger
 * /turf-owner/profile/{email}:
 *   get:
 *     summary: Get turf owner profile by email
 *     tags: [Turf Owner]
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         description: Email of the turf owner
 *     responses:
 *       200:
 *         description: Turf owner profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 email:
 *                   type: string
 *                 name:
 *                   type: string
 *                 turfLocation:
 *                   type: string
 *                 sports:
 *                   type: array
 *                   items:
 *                     type: string
 *       404:
 *         description: Turf owner not found
 *       500:
 *         description: Server error
 */
app.get('/turf-owner/profile/:email', async (req, res) => {
  try {
    const owner = await TurfOwner.findOne({ email: req.params.email }).select('-password');
    if (!owner) {
      return res.status(404).json({ message: 'Turf owner not found' });
    }
    res.json(owner);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

/**
 * @swagger
 * /turf-owner/profile/{email}:
 *   put:
 *     summary: Update turf owner profile
 *     tags: [Turf Owner]
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         description: Email of the turf owner
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Jane Doe
 *               password:
 *                 type: string
 *                 example: newpassword123
 *               turfLocation:
 *                 type: string
 *                 example: 456 Sports Avenue, Mumbai
 *               sports:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [Football, Cricket, Tennis, Badminton]
 *                 example: [Football, Tennis]
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid sports provided
 *       404:
 *         description: Turf owner not found
 *       500:
 *         description: Server error
 */
app.put('/turf-owner/profile/:email', async (req, res) => {
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
});

/**
 * @swagger
 * /turfs:
 *   get:
 *     summary: List all turfs
 *     tags: [Turf]
 *     responses:
 *       200:
 *         description: List of turfs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   email:
 *                     type: string
 *                   name:
 *                     type: string
 *                   turfLocation:
 *                     type: string
 *                   sports:
 *                     type: array
 *                     items:
 *                       type: string
 *       500:
 *         description: Server error
 */
app.get('/turfs', async (req, res) => {
  try {
    const turfs = await TurfOwner.find().select('-password');
    res.json(turfs);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Swagger UI available at http://localhost:${PORT}/api-docs`);
});