const express = require('express');
const router = express.Router();
const Gallery = require('../models/Gallery');
const MockGallery = require('../models/MockGallery');
const { authenticateToken, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { cloudinaryUpload, cloudinary } = require('../middleware/cloudinaryUpload');

// Determine which model to use based on environment
const GalleryModel = process.env.NODE_ENV === 'mock' || (process.env.MONGODB_URI && process.env.MONGODB_URI.includes('localhost'))
  ? MockGallery
  : Gallery;

// Get all gallery items
router.get('/', async (req, res) => {
  try {
    // If using Gallery model, sort and populate
    if (GalleryModel === Gallery) {
      const gallery = await GalleryModel.find().sort({ createdAt: -1 }).populate('uploadedBy', 'name role');
      return res.json(gallery);
    }

    // If using MockGallery, just get all items
    const gallery = await GalleryModel.find();
    res.json(gallery);
  } catch (error) {
    console.error('Error fetching gallery:', error);
    res.status(500).json({ message: 'Failed to fetch gallery' });
  }
});

// Get gallery item by ID
router.get('/:id', async (req, res) => {
  try {
    let galleryItem;

    // If using Gallery model, populate uploadedBy
    if (GalleryModel === Gallery) {
      galleryItem = await GalleryModel.findById(req.params.id).populate('uploadedBy', 'name role');
    } else {
      // If using MockGallery, just get by ID
      galleryItem = await GalleryModel.findById(req.params.id);
    }

    if (!galleryItem) {
      return res.status(404).json({ message: 'Gallery item not found' });
    }

    res.json(galleryItem);
  } catch (error) {
    console.error('Error fetching gallery item:', error);
    res.status(500).json({ message: 'Failed to fetch gallery item' });
  }
});

// Add a new gallery item (admin only)
router.post('/', authenticateToken, authorize(['admin']), cloudinaryUpload.single('image'), async (req, res) => {
  try {
    const { title, description, category, featured } = req.body;

    if (!title || !req.file) {
      return res.status(400).json({ message: 'Title and image are required' });
    }

    // Create new gallery item with Cloudinary URL
    const galleryItem = new Gallery({
      title,
      description: description || '',
      image: req.file.path, // Cloudinary URL
      imagePublicId: req.file.filename, // Store Cloudinary public ID for future reference
      category: category || 'other',
      featured: featured === 'true' || featured === true,
      uploadedBy: req.user.id
    });

    await galleryItem.save();

    // Populate the uploaded by field for the response
    await galleryItem.populate('uploadedBy', 'name role');

    res.status(201).json(galleryItem);
  } catch (error) {
    console.error('Error adding gallery item:', error);
    res.status(500).json({ message: 'Failed to add gallery item', error: error.message });
  }
});

// Update gallery item (admin only)
router.put('/:id', authenticateToken, authorize(['admin']), cloudinaryUpload.single('image'), async (req, res) => {
  try {
    const galleryItem = await Gallery.findById(req.params.id);

    if (!galleryItem) {
      return res.status(404).json({ message: 'Gallery item not found' });
    }

    // Update fields
    const fieldsToUpdate = ['title', 'description', 'category', 'featured'];

    fieldsToUpdate.forEach(field => {
      if (req.body[field] !== undefined) {
        if (field === 'featured') {
          galleryItem[field] = req.body[field] === 'true' || req.body[field] === true;
        } else {
          galleryItem[field] = req.body[field];
        }
      }
    });

    // Update image if provided
    if (req.file) {
      // Delete old image from Cloudinary if it exists
      if (galleryItem.imagePublicId) {
        try {
          await cloudinary.uploader.destroy(galleryItem.imagePublicId);
        } catch (err) {
          console.error('Error deleting old image from Cloudinary:', err);
        }
      }

      // Update with new Cloudinary URL
      galleryItem.image = req.file.path;
      galleryItem.imagePublicId = req.file.filename;
    }

    galleryItem.updatedAt = Date.now();
    await galleryItem.save();

    // Populate the uploaded by field for the response
    await galleryItem.populate('uploadedBy', 'name role');

    res.json(galleryItem);
  } catch (error) {
    console.error('Error updating gallery item:', error);
    res.status(500).json({ message: 'Failed to update gallery item', error: error.message });
  }
});

// Delete gallery item (admin only)
router.delete('/:id', authenticateToken, authorize(['admin']), async (req, res) => {
  try {
    const galleryItem = await Gallery.findById(req.params.id);

    if (!galleryItem) {
      return res.status(404).json({ message: 'Gallery item not found' });
    }

    // Delete image from Cloudinary if it exists
    if (galleryItem.imagePublicId) {
      try {
        await cloudinary.uploader.destroy(galleryItem.imagePublicId);
        console.log(`Deleted image from Cloudinary: ${galleryItem.imagePublicId}`);
      } catch (err) {
        console.error('Error deleting image from Cloudinary:', err);
      }
    }

    await Gallery.findByIdAndDelete(req.params.id);

    res.json({ message: 'Gallery item deleted successfully' });
  } catch (error) {
    console.error('Error deleting gallery item:', error);
    res.status(500).json({ message: 'Failed to delete gallery item' });
  }
});

module.exports = router;
