const express = require('express');
const multer = require('multer');
const path = require('path');
const Item = require('../models/Item');
const auth = require('../middleware/auth');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (JPEG, JPG, PNG, GIF, WebP)'));
    }
  }
});

router.get('/', async (req, res) => {
  try {
    const { type, category, location, search } = req.query;
    let query = { status: 'active' };

    if (type) query.type = type;
    if (category) query.category = category;
    if (location) query.location = new RegExp(location, 'i');
    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') }
      ];
    }

    const items = await Item.find(query)
      .populate('owner', 'name email phone')
      .sort({ createdAt: -1 });

    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate('owner', 'name email phone')
      .populate('claims.user', 'name email');

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.json(item);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    const { title, description, category, type, location, date } = req.body;

    const item = new Item({
      title,
      description,
      category,
      type,
      location,
      date: new Date(date),
      image: req.file ? `/uploads/${req.file.filename}` : null,
      owner: req.user._id
    });

    await item.save();
    await item.populate('owner', 'name email phone');

    res.status(201).json(item);
  } catch (error) {
    console.error('Error creating item:', error);
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File size too large. Maximum size is 5MB.' });
    }
    if (error.message.includes('Only image files are allowed')) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/:id', auth, upload.single('image'), async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (item.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { title, description, category, type, location, date, status } = req.body;

    item.title = title || item.title;
    item.description = description || item.description;
    item.category = category || item.category;
    item.type = type || item.type;
    item.location = location || item.location;
    item.date = date ? new Date(date) : item.date;
    item.status = status || item.status;
    
    if (req.file) {
      item.image = `/uploads/${req.file.filename}`;
    }

    item.updatedAt = new Date();
    await item.save();
    await item.populate('owner', 'name email phone');

    res.json(item);
  } catch (error) {
    console.error('Error updating item:', error);
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File size too large. Maximum size is 5MB.' });
    }
    if (error.message.includes('Only image files are allowed')) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (item.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Item.findByIdAndDelete(req.params.id);
    res.json({ message: 'Item deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/user/:userId', async (req, res) => {
  try {
    const items = await Item.find({ owner: req.params.userId })
      .populate('owner', 'name email phone')
      .sort({ createdAt: -1 });

    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
