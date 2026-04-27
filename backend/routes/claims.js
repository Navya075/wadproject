const express = require('express');
const Item = require('../models/Item');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/:itemId', auth, async (req, res) => {
  try {
    const { message } = req.body;
    const item = await Item.findById(req.params.itemId);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (item.owner.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot claim your own item' });
    }

    const existingClaim = item.claims.find(
      claim => claim.user.toString() === req.user._id.toString()
    );

    if (existingClaim) {
      return res.status(400).json({ message: 'You have already claimed this item' });
    }

    item.claims.push({
      user: req.user._id,
      message,
      status: 'pending'
    });

    await item.save();
    await item.populate('claims.user', 'name email');

    const owner = await User.findById(item.owner);
    owner.notifications.push({
      type: 'claim',
      message: `${req.user.name} has claimed your item: ${item.title}`,
      itemId: item._id
    });
    await owner.save();

    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/:itemId/:claimId', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const item = await Item.findById(req.params.itemId);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (item.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const claim = item.claims.id(req.params.claimId);
    if (!claim) {
      return res.status(404).json({ message: 'Claim not found' });
    }

    claim.status = status;

    if (status === 'accepted') {
      item.status = 'claimed';
      
      const claimant = await User.findById(claim.user);
      claimant.notifications.push({
        type: 'claim_accepted',
        message: `Your claim for ${item.title} has been accepted!`,
        itemId: item._id
      });
      await claimant.save();

      item.claims.forEach(otherClaim => {
        if (otherClaim._id.toString() !== req.params.claimId && otherClaim.status === 'pending') {
          otherClaim.status = 'rejected';
        }
      });
    } else if (status === 'rejected') {
      const claimant = await User.findById(claim.user);
      claimant.notifications.push({
        type: 'claim_rejected',
        message: `Your claim for ${item.title} has been rejected.`,
        itemId: item._id
      });
      await claimant.save();
    }

    await item.save();
    await item.populate('claims.user', 'name email');

    res.json(item);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/user/:userId', auth, async (req, res) => {
  try {
    const items = await Item.find({
      'claims.user': req.params.userId
    })
    .populate('owner', 'name email')
    .populate('claims.user', 'name email')
    .sort({ createdAt: -1 });

    const claims = items.flatMap(item => 
      item.claims
        .filter(claim => claim.user._id.toString() === req.params.userId)
        .map(claim => ({
          ...claim.toObject(),
          item: {
            _id: item._id,
            title: item.title,
            description: item.description,
            category: item.category,
            type: item.type,
            location: item.location,
            date: item.date,
            image: item.image,
            status: item.status,
            owner: item.owner
          }
        }))
    );

    res.json(claims);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
