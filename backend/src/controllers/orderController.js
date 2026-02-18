const Order = require('../models/Order');
const Product = require('../models/Product');
const { createOrderNotification, createPaymentNotification } = require('../services/notificationService');

// Admin: Get all orders
exports.getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    
    const query = {};
    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate('items.product', 'name images brand')
      .populate('user', 'name email')
      .sort('-createdAt')
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .exec();

    const total = await Order.countDocuments(query);

    res.json({
      status: 'success',
      data: {
        orders,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(total / limit),
          totalOrders: total,
          hasMore: Number(page) * Number(limit) < total
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Admin: Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, paymentStatus } = req.body;
    const orderId = req.params.id;

    if (!status && !paymentStatus) {
      return res.status(400).json({
        status: 'error',
        message: 'Status or paymentStatus is required'
      });
    }

    const updateData = {};
    if (status) {
      const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid status'
        });
      }
      updateData.status = status;
    }

    if (paymentStatus) {
      const validPaymentStatuses = ['pending', 'paid', 'failed'];
      if (!validPaymentStatuses.includes(paymentStatus)) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid payment status'
        });
      }
      updateData.paymentStatus = paymentStatus;
    }

    // Get old order to check what changed
    const oldOrder = await Order.findById(orderId);
    
    const order = await Order.findByIdAndUpdate(
      orderId,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('items.product', 'name images brand')
      .populate('user', 'name email');

    if (!order) {
      return res.status(404).json({
        status: 'error',
        message: 'Order not found'
      });
    }

    // Create notifications if user exists and status changed
    if (order.user) {
      // Order status notification
      if (status && oldOrder.status !== status) {
        await createOrderNotification(
          order.user._id,
          order.orderNumber,
          status,
          order._id.toString()
        );
      }

      // Payment status notification
      if (paymentStatus && oldOrder.paymentStatus !== paymentStatus) {
        await createPaymentNotification(
          order.user._id,
          order.orderNumber,
          paymentStatus,
          order._id.toString()
        );
      }
    }

    res.json({
      status: 'success',
      data: { order }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Create a new order
exports.createOrder = async (req, res) => {
  try {
    const {
      items,
      shippingAddress,
      paymentMethod,
      notes
    } = req.body;

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Order must contain at least one item'
      });
    }

    if (!shippingAddress || !shippingAddress.city) {
      return res.status(400).json({
        status: 'error',
        message: 'Shipping address with city is required'
      });
    }

    if (!paymentMethod || !['cash', 'card', 'bank_transfer'].includes(paymentMethod)) {
      return res.status(400).json({
        status: 'error',
        message: 'Valid payment method is required'
      });
    }

    // Get user info (if logged in) or use customer info from request
    let customerInfo = {};
    if (req.user) {
      customerInfo = {
        name: req.user.name,
        email: req.user.email,
        phone: req.body.phone || req.user.phone || ''
      };
    } else {
      customerInfo = {
        name: req.body.customer?.name || req.body.name || '',
        email: req.body.customer?.email || req.body.email || '',
        phone: req.body.customer?.phone || req.body.phone || ''
      };
    }

    if (!customerInfo.name || !customerInfo.email || !customerInfo.phone) {
      return res.status(400).json({
        status: 'error',
        message: 'Customer name, email, and phone are required'
      });
    }

    // Calculate totals and validate products
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({
          status: 'error',
          message: `Product ${item.productId} not found`
        });
      }

      if (!product.inStock || product.stock < item.quantity) {
        return res.status(400).json({
          status: 'error',
          message: `Insufficient stock for ${product.name}`
        });
      }

      const itemPrice = product.price;
      const itemSubtotal = itemPrice * item.quantity;
      subtotal += itemSubtotal;

      orderItems.push({
        product: product._id,
        name: product.name,
        price: itemPrice,
        quantity: item.quantity,
        subtotal: itemSubtotal
      });
    }

    const deliveryFee = req.body.deliveryFee ?? 0;
    const deliveryType = ['standard', 'express', 'pickup'].includes(req.body.deliveryType)
      ? req.body.deliveryType
      : 'standard';
    const totalAmount = subtotal + deliveryFee;

    const order = await Order.create({
      customer: customerInfo,
      items: orderItems,
      shippingAddress: {
        street: shippingAddress.street || '',
        city: shippingAddress.city,
        region: shippingAddress.region || '',
        postalCode: shippingAddress.postalCode || '',
        country: shippingAddress.country || 'Georgia'
      },
      totalAmount,
      deliveryFee,
      deliveryType,
      paymentMethod,
      paymentStatus: 'pending',
      status: 'pending',
      notes: notes || '',
      ...(req.user && { user: req.user._id })
    });

    // Update product stock
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity }
      });
    }

    // Populate order for response
    const populatedOrder = await Order.findById(order._id)
      .populate('items.product', 'name images brand');

    // Create order confirmation notification if user exists
    if (order.user) {
      await createOrderNotification(
        order.user._id,
        order.orderNumber,
        'confirmed',
        order._id.toString()
      );
    }

    res.status(201).json({
      status: 'success',
      data: { order: populatedOrder }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get user's orders
exports.getUserOrders = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    // For now, match by email (since user field might not be set on old orders)
    const orders = await Order.find({
      $or: [
        { 'customer.email': req.user.email },
        { user: req.user._id }
      ]
    })
      .populate('items.product', 'name images brand')
      .sort('-createdAt')
      .exec();

    res.json({
      status: 'success',
      data: { orders }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get single order by ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product', 'name images brand description price');

    if (!order) {
      return res.status(404).json({
        status: 'error',
        message: 'Order not found'
      });
    }

    // Check if user has access (if logged in)
    if (req.user) {
      const hasAccess = 
        order.user?.toString() === req.user._id.toString() ||
        order.customer.email === req.user.email;
      
      if (!hasAccess) {
        return res.status(403).json({
          status: 'error',
          message: 'Access denied'
        });
      }
    }

    res.json({
      status: 'success',
      data: { order }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};
