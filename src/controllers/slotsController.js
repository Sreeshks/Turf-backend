const Slot = require("../models/slots");

function generateSlots(turfId, startDateTime, endDateTime) {
  const slots = [];
  let currentTime = new Date(startDateTime);
  const endTime = new Date(endDateTime);

  const startTimeIST = startDateTime.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  const endTimeIST = endDateTime.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

  while (currentTime < endTime) {
    const slotEndTime = new Date(currentTime.getTime() + 60 * 60 * 1000);
    const slotEndTimeIST = slotEndTime.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
 
    if (slotEndTime <= endTime) {
      const dateIST = currentTime.toLocaleDateString('en-IN', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).split('/').reverse().join('-');
      slots.push({
        turfId,
        date: dateIST, 
        startTime: currentTime.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
          timeZone: 'Asia/Kolkata'
        }),
        endTime: slotEndTime.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
          timeZone: 'Asia/Kolkata'
        }),
        isBooked: false
      });
    }
    currentTime = slotEndTime;
  }
  return slots;
}

const addSlots = async (req, res) => {
  try {
    const { turfId, startTime, endTime } = req.body;
    if (!turfId || !startTime || !endTime) {
      return res.status(400).json({ error: 'turfId, startTime, and endTime are required' });
    }

    const startDateTime = new Date(startTime);
    const endDateTime = new Date(endTime);

    const startTimeIST = startDateTime.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    const endTimeIST = endDateTime.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    if (isNaN(startDateTime) || isNaN(endDateTime)) {
      return res.status(400).json({ error: 'Invalid date format' });
    }

    if (startDateTime >= endDateTime) {
      return res.status(400).json({ error: 'startTime must be before endTime' });
    }

    const slots = generateSlots(turfId, startDateTime, endDateTime);
    const savedSlots = await Slot.insertMany(slots);
    res.status(201).json({
      message: 'Slots created successfully',
      slots: savedSlots
    });
  } catch (e) {
    console.error('Error creating slots:', e);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getallSlots = async (req, res) => {
  const slot= await Slot.find(req.query);
  res.json(slot)
  }

module.exports = {
  addSlots,
  getallSlots
};