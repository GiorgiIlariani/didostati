const Advertisement = require('../models/Advertisement');

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
