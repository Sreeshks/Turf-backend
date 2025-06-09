const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const userRoutes = require('./routes/userRoutes');
const turfOwnerRoutes = require('./routes/turfOwnerRoutes');
const slotRoutes = require('./routes/slotsRoutes')

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/user', userRoutes);
app.use('/turf-owner', turfOwnerRoutes);
app.use('/turf-slots',slotRoutes);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
console.log("Server running on port" ,{PORT});
});