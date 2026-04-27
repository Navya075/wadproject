const express = require('express');
const User = require('../models/User');
const Item = require('../models/Item');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/dashboard', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    
    const totalItems = await Item.countDocuments({ owner: userId });
    const lostItems = await Item.countDocuments({ owner: userId, type: 'lost' });
    const foundItems = await Item.countDocuments({ owner: userId, type: 'found' });
    
    const claimsReceived = await Item.aggregate([
      { $match: { owner: userId } },
      { $unwind: '$claims' },
      { $group: { _id: null, count: { $sum: 1 } } }
    ]);
    
    const acceptedClaims = await Item.aggregate([
      { $match: { owner: userId } },
      { $unwind: '$claims' },
      { $match: { 'claims.status': 'accepted' } },
      { $group: { _id: null, count: { $sum: 1 } } }
    ]);
    
    const recoveryRate = totalItems > 0 
      ? Math.round((acceptedClaims[0]?.count || 0) / totalItems * 100)
      : 0;

    res.json({
      totalItems,
      lostItems,
      foundItems,
      claimsReceived: claimsReceived[0]?.count || 0,
      acceptedClaims: acceptedClaims[0]?.count || 0,
      recoveryRate
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/favorites/:itemId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const itemId = req.params.itemId;

    if (user.favorites.includes(itemId)) {
      user.favorites = user.favorites.filter(fav => fav.toString() !== itemId);
    } else {
      user.favorites.push(itemId);
    }

    await user.save();
    res.json({ favorites: user.favorites });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/favorites', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('favorites');
    res.json(user.favorites);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/notifications/:notificationId/read', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const notification = user.notifications.id(req.params.notificationId);
    
    if (notification) {
      notification.read = true;
      await user.save();
    }

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/notifications', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const unreadCount = user.notifications.filter(n => !n.read).length;
    
    res.json({
      notifications: user.notifications.sort((a, b) => b.createdAt - a.createdAt),
      unreadCount
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
