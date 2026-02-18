const express = require('express');
const router = express.Router();
const advertisementController = require('../controllers/advertisementController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

// Get all advertisements (optionally filter by position)
router.get('/', advertisementController.getAllAdvertisements);

// Upload media (image/video) - must be before /:id
router.post('/upload', protect, restrictTo('admin'), upload.single('media'), advertisementController.uploadAdvertisementMedia);

// Get single advertisement
router.get('/:id', advertisementController.getAdvertisementById);

// Create advertisement (admin)
router.post('/', protect, restrictTo('admin'), advertisementController.createAdvertisement);

// Update advertisement (admin)
router.put('/:id', protect, restrictTo('admin'), advertisementController.updateAdvertisement);

// Delete advertisement (admin)
router.delete('/:id', protect, restrictTo('admin'), advertisementController.deleteAdvertisement);

module.exports = router;
