const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: true
  },
  messages: [{
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    message: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  lastMessage: {
    type: String
  },
  lastMessageTime: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

chatSchema.index({ item: 1, participants: 1 }, { unique: true });

module.exports = mongoose.model('Chat', chatSchema);
