const Order = require('../models/Order');
const Product = require('../models/Product');
const { createOrderNotification, createPaymentNotification } = require('../services/notificationService');
const { ensureHttpsImageUrls } = require('../utils/imageUrl');
const { escapeRegex } = require('../utils/escapeRegex');
const { verifyOtpToken, normalizePhone } = require('../controllers/otpController');
const { getDeliveryFee } = require('../utils/deliveryFee');

// Anti-abuse: caps how many orders one phone/account can place per day.
const MAX_ORDERS_PER_DAY = 3;

// Admin: Get all orders
exports.getAllOrders = async (req, res) => {
  try {
    const {
      status,
      city,
      dateFrom,
      dateTo,
      search,
    } = req.query;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(200, Math.max(1, parseInt(req.query.limit, 10) || 20));

    const query = {};
    if (status && VALID_ORDER_STATUSES.includes(String(status))) {
      query.status = String(status);
    }
    if (city) {
      query['shippingAddress.city'] = new RegExp(`^${escapeRegex(String(city).trim())}$`, 'i');
    }
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) {
        const end = new Date(dateTo);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }
    if (search && String(search).trim()) {
      const s = escapeRegex(String(search).trim());
      query.$or = [
        { orderNumber: new RegExp(s, 'i') },
        { 'customer.name': new RegExp(s, 'i') },
        { 'customer.phone': new RegExp(s, 'i') },
        { 'customer.email': new RegExp(s, 'i') },
      ];
    }

    const orders = await Order.find(query)
      .populate('items.product', 'name images brand')
      .populate('user', 'name email')
      .populate('assignedManager', 'name email')
      .sort('-createdAt')
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .exec();

    const total = await Order.countDocuments(query);

    res.json(
      ensureHttpsImageUrls({
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
      })
    );
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Admin: Get single order
exports.getAdminOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product', 'name images brand')
      .populate('user', 'name email')
      .populate('assignedManager', 'name email')
      .populate('statusHistory.changedBy', 'name email');

    if (!order) {
      return res.status(404).json({
        status: 'error',
        message: 'Order not found'
      });
    }

    res.json(
      ensureHttpsImageUrls({
        status: 'success',
        data: { order }
      })
    );
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

const VALID_ORDER_STATUSES = [
  'pending',
  'confirmed',
  'processing',
  'ready_to_ship',
  'shipped',
  'delivered',
  'cancelled',
];

// Admin: Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, paymentStatus, assignedManager, note } = req.body;
    const orderId = req.params.id;

    if (!status && !paymentStatus && assignedManager === undefined) {
      return res.status(400).json({
        status: 'error',
        message: 'Status, paymentStatus, or assignedManager is required'
      });
    }

    const oldOrder = await Order.findById(orderId);
    if (!oldOrder) {
      return res.status(404).json({
        status: 'error',
        message: 'Order not found'
      });
    }

    const setFields = {};
    if (status) {
      if (!VALID_ORDER_STATUSES.includes(status)) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid status'
        });
      }
      setFields.status = status;
    }

    if (paymentStatus) {
      const validPaymentStatuses = ['pending', 'paid', 'failed'];
      if (!validPaymentStatuses.includes(paymentStatus)) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid payment status'
        });
      }
      setFields.paymentStatus = paymentStatus;
    }

    if (assignedManager !== undefined) {
      setFields.assignedManager = assignedManager || null;
    }

    const updateOps = {};
    if (Object.keys(setFields).length > 0) {
      updateOps.$set = setFields;
    }

    // Stock bookkeeping: createOrder reserved stock for every item, so a
    // cancellation must give it back, and un-cancelling must reserve it again
    // (only if there is still enough left).
    const becomesCancelled =
      status === 'cancelled' && oldOrder.status !== 'cancelled';
    const leavesCancelled =
      status && status !== 'cancelled' && oldOrder.status === 'cancelled';

    const reReserved = [];
    const releaseReReserved = () =>
      Promise.all(
        reReserved.map(({ productId, quantity }) =>
          Product.updateOne({ _id: productId }, { $inc: { stock: quantity } })
        )
      );

    if (leavesCancelled) {
      for (const item of oldOrder.items) {
        const product = await Product.findOneAndUpdate(
          { _id: item.product, stock: { $gte: item.quantity } },
          { $inc: { stock: -item.quantity } }
        );
        if (!product) {
          await releaseReReserved();
          return res.status(400).json({
            status: 'error',
            message: `„${item.name || 'პროდუქტი'}“ — მარაგი არასაკმარისია შეკვეთის აღდგენისთვის`,
          });
        }
        reReserved.push({ productId: item.product, quantity: item.quantity });
      }
    }

    if (status && oldOrder.status !== status) {
      updateOps.$push = {
        statusHistory: {
          status,
          changedBy: req.user?._id,
          note: note || '',
          at: new Date(),
        },
      };
    }

    let order;
    try {
      order = await Order.findByIdAndUpdate(orderId, updateOps, {
        new: true,
        runValidators: true,
      })
        .populate('items.product', 'name images brand')
        .populate('user', 'name email')
        .populate('assignedManager', 'name email')
        .populate('statusHistory.changedBy', 'name email');
    } catch (updateError) {
      // Stock was re-reserved above for an un-cancel — give it back if the
      // order document itself failed to update.
      await releaseReReserved();
      throw updateError;
    }

    if (becomesCancelled) {
      await Promise.all(
        oldOrder.items.map((item) =>
          Product.updateOne({ _id: item.product }, { $inc: { stock: item.quantity } })
        )
      );
    }

    // Create notifications if user exists and status changed
    if (order.user) {
      if (status && oldOrder.status !== status) {
        await createOrderNotification(
          order.user._id,
          order.orderNumber,
          status,
          order._id.toString()
        );
      }

      if (paymentStatus && oldOrder.paymentStatus !== paymentStatus) {
        await createPaymentNotification(
          order.user._id,
          order.orderNumber,
          paymentStatus,
          order._id.toString()
        );
      }
    }

    res.json(
      ensureHttpsImageUrls({
        status: 'success',
        data: { order }
      })
    );
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
      notes,
      otpToken,
    } = req.body;

    // OTP verification — required unless logged-in user phone matches customer phone
    let verifiedPhone = verifyOtpToken(otpToken, 'order');
    if (!verifiedPhone && req.user?.phone) {
      const userPhone = normalizePhone(req.user.phone);
      const requestPhone = normalizePhone(
        req.body.customer?.phone || req.body.phone || ''
      );
      if (userPhone && requestPhone && userPhone === requestPhone) {
        verifiedPhone = userPhone;
      }
    }
    if (!verifiedPhone) {
      return res.status(401).json({
        status: 'error',
        message: 'ტელეფონის დადასტურება საჭიროა (OTP) ან შესვლა ნომრით',
      });
    }

    // Must be logged in
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'შეკვეთისთვის ავტორიზაცია სავალდებულოა',
      });
    }

    // Anti-abuse: cap orders per phone/account within a rolling 24h window.
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentOrderCount = await Order.countDocuments({
      createdAt: { $gte: oneDayAgo },
      status: { $ne: 'cancelled' },
      $or: [
        { user: req.user._id },
        { 'customer.phone': verifiedPhone },
      ],
    });
    if (recentOrderCount >= MAX_ORDERS_PER_DAY) {
      return res.status(429).json({
        status: 'error',
        message: `დღეში მაქსიმუმ ${MAX_ORDERS_PER_DAY} შეკვეთის გაფორმება შესაძლებელია. სცადეთ მოგვიანებით ან დაგვიკავშირდით.`,
      });
    }

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

    // Customer snapshot from form, with auth user fallbacks
    const customerInfo = {
      name: (req.body.customer?.name || req.body.name || req.user.name || '').trim(),
      email: (
        req.body.customer?.email ||
        req.body.email ||
        req.user.email ||
        ''
      )
        .trim()
        .toLowerCase(),
      phone: req.body.customer?.phone || req.body.phone || req.user.phone || '',
    };

    if (!customerInfo.name || !customerInfo.phone) {
      return res.status(400).json({
        status: 'error',
        message: 'სახელი და ტელეფონი სავალდებულოა',
      });
    }

    // Phone-only accounts may have no email — use stable placeholder
    if (!customerInfo.email) {
      customerInfo.email = `${verifiedPhone}@phone.didostati.local`;
    }

    const customerPhone = normalizePhone(customerInfo.phone);
    if (!customerPhone || customerPhone !== verifiedPhone) {
      return res.status(400).json({
        status: 'error',
        message: 'OTP ტელეფონი არ ემთხვევა შეკვეთის ტელეფონს',
      });
    }
    customerInfo.phone = customerPhone;

    const deliveryType = ['standard', 'express', 'pickup'].includes(req.body.deliveryType)
      ? req.body.deliveryType
      : 'standard';
    // Never trust the client-sent fee — recompute it server-side from *how*
    // the cart priced delivery (tariff city or GPS coords). The free-text
    // shippingAddress.city is only consulted when the client sent neither
    // (drafts saved before this field existed); it must NOT override GPS
    // pricing, otherwise a geocoded "ქუთაისი" would jump from ₾5 to ₾200.
    const hasPricingHint = Boolean(req.body.deliveryCity || req.body.deliveryCoords);
    const deliveryFee = getDeliveryFee(
      deliveryType,
      hasPricingHint
        ? { city: req.body.deliveryCity, coords: req.body.deliveryCoords }
        : { city: shippingAddress.city }
    );
    if (deliveryFee === null) {
      return res.status(400).json({
        status: 'error',
        message: 'მიწოდების ფასი ვერ დადგინდა — აირჩიეთ ქალაქი სიიდან ან ჩართეთ ლოკაცია',
      });
    }

    // Validate products and reserve stock atomically. Each item's decrement
    // only succeeds if enough stock is still available at that moment, so two
    // concurrent orders can't both take the last unit (no read-then-write race).
    let subtotal = 0;
    const orderItems = [];
    const reserved = []; // { productId, quantity } — for rollback on failure

    const releaseReserved = async () => {
      await Promise.all(
        reserved.map(({ productId, quantity }) =>
          Product.updateOne({ _id: productId }, { $inc: { stock: quantity } })
        )
      );
    };

    for (const item of items) {
      const quantity = Number(item.quantity);
      const product = await Product.findOneAndUpdate(
        {
          _id: item.productId,
          isDeleted: { $ne: true },
          isActive: { $ne: false },
          inStock: { $ne: false },
          stock: { $gte: quantity },
        },
        { $inc: { stock: -quantity } },
        { new: true }
      );

      if (!product) {
        await releaseReserved();
        // Distinguish "gone" from "not enough left" for a useful message.
        const existing = await Product.findById(item.productId).select('name isDeleted isActive');
        if (!existing || existing.isDeleted || !existing.isActive) {
          return res.status(404).json({
            status: 'error',
            message: 'ერთი ან მეტი პროდუქტი აღარ არის ხელმისაწვდომი',
          });
        }
        return res.status(400).json({
          status: 'error',
          message: `„${existing.name}“ — მარაგი არასაკმარისია`,
        });
      }

      reserved.push({ productId: product._id, quantity });

      const itemPrice = product.price;
      const itemSubtotal = itemPrice * quantity;
      subtotal += itemSubtotal;

      orderItems.push({
        product: product._id,
        name: product.name,
        price: itemPrice,
        quantity,
        subtotal: itemSubtotal
      });
    }

    const totalAmount = subtotal + deliveryFee;

    const orderDoc = {
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
      statusHistory: [
        {
          status: 'pending',
          note: 'შეკვეთა შექმნილია',
          at: new Date(),
        },
      ],
      notes: notes || '',
      user: req.user._id,
    };

    let order;
    try {
      // orderNumber is random (DID-YYYYMMDD-XXXXXX) with a unique index, so a
      // collision is possible; retry a few times before giving up.
      for (let attempt = 0; ; attempt++) {
        try {
          order = await Order.create(orderDoc);
          break;
        } catch (createError) {
          const isDuplicateOrderNumber =
            createError?.code === 11000 &&
            createError?.keyPattern &&
            createError.keyPattern.orderNumber;
          if (!isDuplicateOrderNumber || attempt >= 4) throw createError;
        }
      }
    } catch (createError) {
      // Stock was already decremented above — give it back if the order
      // document itself failed to save.
      await releaseReserved();
      throw createError;
    }

    // Populate order for response
    const populatedOrder = await Order.findById(order._id)
      .populate('items.product', 'name images brand');

    // Create order confirmation notification if user exists
    if (order.user) {
      await createOrderNotification(
        order.user._id,
        order.orderNumber,
        'pending',
        order._id.toString()
      );
    }

    res.status(201).json(
      ensureHttpsImageUrls({
        status: 'success',
        data: { order: populatedOrder }
      })
    );
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

    // Match by user id; email fallback only for legacy orders without `user`,
    // and only when the account has an email (phone-only accounts don't).
    const ownerConditions = [{ user: req.user._id }];
    if (req.user.email) {
      ownerConditions.push({ user: { $exists: false }, 'customer.email': req.user.email });
    }
    const orders = await Order.find({ $or: ownerConditions })
      .populate('items.product', 'name images brand')
      .sort('-createdAt')
      .exec();

    res.json(
      ensureHttpsImageUrls({
        status: 'success',
        data: { orders }
      })
    );
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

    // Ownership check — route is behind `protect`, so req.user always exists.
    // Email fallback only for legacy orders that pre-date the `user` field,
    // and only when the account actually has an email (phone-only accounts
    // must never match orders via an empty/undefined email).
    // The email fallback must only apply to orders that have no owner at
    // all — customer.email is free text from the checkout form, so an order
    // owned by someone else must never be readable via a matching email.
    const hasAccess =
      order.user?.toString() === req.user._id.toString() ||
      (!order.user && !!req.user.email && order.customer.email === req.user.email);

    if (!hasAccess) {
      return res.status(403).json({
        status: 'error',
        message: 'ამ შეკვეთაზე წვდომა არ გაქვთ'
      });
    }

    res.json(
      ensureHttpsImageUrls({
        status: 'success',
        data: { order }
      })
    );
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};
