const express = require('express');
const Chat = require('../models/Chat');
const Item = require('../models/Item');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/conversations', auth, async (req, res) => {
  try {
    const conversations = await Chat.find({
      participants: req.user._id
    })
    .populate('participants', 'name email avatar')
    .populate('item', 'title type')
    .sort({ lastMessageTime: -1 });

    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/item/:itemId', auth, async (req, res) => {
  try {
    const item = await Item.findById(req.params.itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    let chat = await Chat.findOne({
      item: req.params.itemId,
      participants: { $all: [req.user._id, item.owner] }
    })
    .populate('participants', 'name email avatar')
    .populate('messages.senderId', 'name email avatar');

    if (!chat) {
      chat = new Chat({
        participants: [req.user._id, item.owner],
        item: req.params.itemId,
        messages: []
      });
      await chat.save();
      await chat.populate('participants', 'name email avatar');
    }

    res.json(chat);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/start/:itemId', auth, async (req, res) => {
  try {
    const item = await Item.findById(req.params.itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (item.owner.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot start chat with yourself' });
    }

    let chat = await Chat.findOne({
      item: req.params.itemId,
      participants: { $all: [req.user._id, item.owner] }
    });

    if (chat) {
      return res.json(chat);
    }

    chat = new Chat({
      participants: [req.user._id, item.owner],
      item: req.params.itemId,
      messages: []
    });

    await chat.save();
    await chat.populate('participants', 'name email avatar');
    await chat.populate('item', 'title type');

    res.status(201).json(chat);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
