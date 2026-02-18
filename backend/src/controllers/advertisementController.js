const Advertisement = require('../models/Advertisement');
const path = require('path');

// Upload media (image/video) for advertisements – returns public URL
exports.uploadMedia = async (req, res) => {
  try {
    if (!req.file || !req.file.filename) {
      return res.status(400).json({
        status: 'error',
        message: 'No file uploaded'
      });
    }
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const url = `${baseUrl}/uploads/advertisements/${req.file.filename}`;
    res.status(200).json({
      status: 'success',
      data: { url }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get all active advertisements
exports.getAllAdvertisements = async (req, res) => {
  try {
    const { position } = req.query;
    
    const query = { 
      isActive: true,
      $or: [
        { endDate: { $exists: false } },
        { endDate: { $gte: new Date() } }
      ]
    };
    
    if (position) {
      query.position = position;
    }

    const advertisements = await Advertisement.find(query)
      .sort('-priority -createdAt')
      .limit(10);

    res.json({
      status: 'success',
      data: { advertisements }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get single advertisement
exports.getAdvertisementById = async (req, res) => {
  try {
    const advertisement = await Advertisement.findById(req.params.id);

    if (!advertisement) {
      return res.status(404).json({
        status: 'error',
        message: 'Advertisement not found'
      });
    }

    res.json({
      status: 'success',
      data: { advertisement }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Upload media for advertisement (image or video)
exports.uploadAdvertisementMedia = (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      status: 'error',
      message: 'No file uploaded. Use field name "media".'
    });
  }
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  const url = `${baseUrl}/uploads/advertisements/${req.file.filename}`;
  res.status(200).json({
    status: 'success',
    data: { url }
  });
};

// Create advertisement
exports.createAdvertisement = async (req, res) => {
  try {
    const advertisement = await Advertisement.create(req.body);

    res.status(201).json({
      status: 'success',
      data: { advertisement }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Update advertisement
exports.updateAdvertisement = async (req, res) => {
  try {
    const advertisement = await Advertisement.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!advertisement) {
      return res.status(404).json({
        status: 'error',
        message: 'Advertisement not found'
      });
    }

    res.json({
      status: 'success',
      data: { advertisement }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Delete advertisement
exports.deleteAdvertisement = async (req, res) => {
  try {
    const advertisement = await Advertisement.findByIdAndDelete(req.params.id);

    if (!advertisement) {
      return res.status(404).json({
        status: 'error',
        message: 'Advertisement not found'
      });
    }

    res.json({
      status: 'success',
      message: 'Advertisement deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};
