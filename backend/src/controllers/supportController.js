const SupportRequest = require('../models/SupportRequest');
const Notification = require('../models/Notification');

// Create a new support/consultation request
exports.createSupportRequest = async (req, res) => {
  try {
    const { name, phone, email, message, productId, requestType } = req.body;

    if (!name || !phone || !message) {
      return res.status(400).json({
        status: 'error',
        message: 'Name, phone and message are required',
      });
    }

    const payload = {
      name,
      phone,
      email,
      message,
    };

    if (productId) {
      payload.product = productId;
    }
    if (['general', 'consultation', 'technical'].includes(requestType)) {
      payload.requestType = requestType;
    }

    if (req.user) {
      payload.user = req.user._id;
    }

    const supportRequest = await SupportRequest.create(payload);

    res.status(201).json({
      status: 'success',
      data: { supportRequest },
    });
  } catch (error) {
    console.error('Support request error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Could not submit support request',
    });
  }
};

// Admin: Get all support requests
exports.getAllSupportRequests = async (req, res) => {
  try {
    const { status, limit = 50 } = req.query;
    
    const query = {};
    if (status) {
      query.status = status;
    }

    const supportRequests = await SupportRequest.find(query)
      .populate('product', 'name images brand')
      .populate('user', 'name email')
      .populate('respondedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json({
      status: 'success',
      data: { supportRequests },
    });
  } catch (error) {
    console.error('Get support requests error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Could not fetch support requests',
    });
  }
};

// Admin: Update support request (status and/or admin response)
exports.updateSupportRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminResponse } = req.body;

    const updateData = {};
    if (status) {
      updateData.status = status;
    }
    if (adminResponse !== undefined) {
      updateData.adminResponse = adminResponse;
      updateData.respondedBy = req.user._id;
      updateData.respondedAt = new Date();
    }

    const supportRequest = await SupportRequest.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('product', 'name images brand')
      .populate('user', 'name email')
      .populate('respondedBy', 'name email');

    if (!supportRequest) {
      return res.status(404).json({
        status: 'error',
        message: 'Support request not found',
      });
    }

    // If admin added a response and the request is linked to a user, create a notification
    if (adminResponse && supportRequest.user) {
      try {
        await Notification.create({
          user: supportRequest.user._id || supportRequest.user,
          type: 'support_response',
          title: 'კონსულტაციაზე პასუხი მიღებული გაქვთ',
          message: supportRequest.product
            ? `ჩვენი გუნდის წევრმა გაგცა პასუხი პროდუქტზე: ${supportRequest.product.name}`
            : 'თქვენს კონსულტაციის მოთხოვნაზე პასუხი უკვე მზად არის.',
          link: supportRequest.product
            ? `/products/${supportRequest.product._id || supportRequest.product}`
            : null,
          metadata: {
            supportRequestId: supportRequest._id,
            productId: supportRequest.product?._id || supportRequest.product || null,
          },
        });
      } catch (notifError) {
        console.error('Failed to create support response notification:', notifError);
        // Do not fail the main request because of notification error
      }
    }

    res.json({
      status: 'success',
      data: { supportRequest },
    });
  } catch (error) {
    console.error('Update support request error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Could not update support request',
    });
  }
};

