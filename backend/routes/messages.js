import express from 'express';
import Message from '../models/Message.js';

const router = express.Router();

// Get messages for a room
router.get('/:room', async (req, res) => {
  try {
    const messages = await Message.find({ room: req.params.room })
      .populate('sender', 'username avatar')
      .sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching messages' });
  }
});

// Send a message
router.post('/', async (req, res) => {
  try {
    const { content, sender, room } = req.body;
    const message = new Message({
      content,
      sender,
      room
    });
    await message.save();
    
    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'username avatar');
    
    res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(500).json({ message: 'Error sending message' });
  }
});

export default router;