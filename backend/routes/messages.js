const express = require('express');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Item = require('../models/Item');
const auth = require('../middleware/auth');

const router = express.Router();

// Get or create conversation for an item
router.post('/conversation/:itemId', auth, async (req, res) => {
  try {
    const { itemId } = req.params;
    
    // Check if item exists
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Check if user is not the owner
    if (item.owner.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot start conversation with yourself' });
    }

    // Try to find existing conversation
    let conversation = await Conversation.findOne({
      item: itemId,
      participants: { $all: [req.user._id, item.owner] }
    }).populate('participants', 'name email')
      .populate('item', 'title');

    if (!conversation) {
      // Create new conversation
      conversation = new Conversation({
        participants: [req.user._id, item.owner],
        item: itemId
      });
      await conversation.save();
      
      // Populate after save
      conversation = await Conversation.findById(conversation._id)
        .populate('participants', 'name email')
        .populate('item', 'title');
    }

    res.json(conversation);
  } catch (error) {
    console.error('Error creating/getting conversation:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all conversations for current user
router.get('/conversations', auth, async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id
    })
    .populate('participants', 'name email')
    .populate('item', 'title type')
    .sort({ lastMessageTime: -1 });

    res.json(conversations);
  } catch (error) {
    console.error('Error getting conversations:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get messages for a conversation
router.get('/messages/:conversationId', auth, async (req, res) => {
  try {
    const { conversationId } = req.params;
    
    // Check if user is part of this conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    if (!conversation.participants.includes(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to access this conversation' });
    }

    // Get messages
    const messages = await Message.find({ conversation: conversationId })
      .populate('sender', 'name email')
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    console.error('Error getting messages:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Send a message
router.post('/messages/:conversationId', auth, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Message content is required' });
    }

    // Check if user is part of this conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    if (!conversation.participants.includes(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to send messages in this conversation' });
    }

    // Create new message
    const message = new Message({
      conversation: conversationId,
      sender: req.user._id,
      content: content.trim()
    });

    await message.save();

    // Update conversation's last message
    conversation.lastMessage = content.trim();
    conversation.lastMessageTime = new Date();
    await conversation.save();

    // Populate and return the message
    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name email');

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Mark messages as read
router.put('/messages/:conversationId/read', auth, async (req, res) => {
  try {
    const { conversationId } = req.params;
    
    // Check if user is part of this conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    if (!conversation.participants.includes(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to access this conversation' });
    }

    // Mark unread messages as read
    await Message.updateMany(
      { 
        conversation: conversationId, 
        sender: { $ne: req.user._id }, 
        read: false 
      },
      { 
        read: true, 
        readAt: new Date() 
      }
    );

    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
