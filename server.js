const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect('mongodb://localhost/hotel_management', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define room type schema
const roomTypeSchema = new mongoose.Schema({
  name: String,
});

// Define room schema
const roomSchema = new mongoose.Schema({
  name: String,
  roomType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RoomType',
  },
  price: Number,
});

// Define models
const RoomType = mongoose.model('RoomType', roomTypeSchema);
const Room = mongoose.model('Room', roomSchema);

app.use(bodyParser.json());

// POST endpoint to create room type
app.post('/api/v1/room-types', async (req, res) => {
  try {
    const roomType = new RoomType(req.body);
    await roomType.save();
    res.status(201).json(roomType);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// GET endpoint to fetch all room types
app.get('/api/v1/room-types', async (req, res) => {
  try {
    const roomTypes = await RoomType.find();
    res.json(roomTypes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST endpoint to create room
app.post('/api/v1/rooms', async (req, res) => {
  try {
    const room = new Room(req.body);
    await room.save();
    res.status(201).json(room);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// GET endpoint to fetch rooms with optional filters
app.get('/api/v1/rooms', async (req, res) => {
  try {
    let filter = {};
    if (req.query.search) {
      filter.name = { $regex: req.query.search, $options: 'i' };
    }
    if (req.query.roomType) {
      filter.roomType = req.query.roomType;
    }
    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice) {
        filter.price.$gte = req.query.minPrice;
      }
      if (req.query.maxPrice) {
        filter.price.$lte = req.query.maxPrice;
      } else {
        filter.price.$gte = 0;
      }
    }
    const rooms = await Room.find(filter);
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH endpoint to edit a room
app.patch('/api/v1/rooms/:roomId', async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.roomId, req.body, { new: true });
    res.json(room);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE endpoint to delete a room
app.delete('/api/v1/rooms/:roomId', async (req, res) => {
  try {
    await Room.findByIdAndDelete(req.params.roomId);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// GET endpoint to fetch a room by id
app.get('/api/v1/rooms/:roomId', async (req, res) => {
  try {
    const room = await Room.findById(req.params.roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    res.json(room);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});