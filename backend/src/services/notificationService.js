const Notification = require('../models/Notification');

/**
 * Create a notification for a user
 */
const createNotification = async (userId, type, title, message, link = null, metadata = {}) => {
  try {
    const notification = await Notification.create({
      user: userId,
      type,
      title,
      message,
      link,
      metadata
    });
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};

/**
 * Create order status notification
 */
const createOrderNotification = async (userId, orderNumber, status, orderId) => {
  const statusMessages = {
    confirmed: {
      title: 'შეკვეთა დადასტურებულია',
      message: `თქვენი შეკვეთა ${orderNumber} დადასტურებულია და მუშავდება.`
    },
    processing: {
      title: 'შეკვეთა მუშავდება',
      message: `თქვენი შეკვეთა ${orderNumber} მუშავდება.`
    },
    shipped: {
      title: 'შეკვეთა გაგზავნილია',
      message: `თქვენი შეკვეთა ${orderNumber} გაგზავნილია.`
    },
    delivered: {
      title: 'შეკვეთა მიწოდებულია',
      message: `თქვენი შეკვეთა ${orderNumber} წარმატებით მიწოდებულია.`
    },
    cancelled: {
      title: 'შეკვეთა გაუქმებულია',
      message: `თქვენი შეკვეთა ${orderNumber} გაუქმებულია.`
    }
  };

  const notificationType = `order_${status}`;
  const { title, message } = statusMessages[status] || {
    title: 'შეკვეთის სტატუსი შეიცვალა',
    message: `თქვენი შეკვეთა ${orderNumber} - ${status}`
  };

  return createNotification(
    userId,
    notificationType,
    title,
    message,
    `/orders/${orderId}`,
    { orderId, orderNumber }
  );
};

/**
 * Create payment status notification
 */
const createPaymentNotification = async (userId, orderNumber, paymentStatus, orderId) => {
  const paymentMessages = {
    paid: {
      title: 'გადახდა მიღებულია',
      message: `თქვენი შეკვეთის ${orderNumber} გადახდა წარმატებით მიღებულია.`
    },
    failed: {
      title: 'გადახდა ვერ მოხერხდა',
      message: `თქვენი შეკვეთის ${orderNumber} გადახდა ვერ მოხერხდა. გთხოვთ სცადოთ თავიდან.`
    }
  };

  const notificationType = `payment_${paymentStatus}`;
  const { title, message } = paymentMessages[paymentStatus] || {
    title: 'გადახდის სტატუსი',
    message: `თქვენი შეკვეთის ${orderNumber} გადახდის სტატუსი: ${paymentStatus}`
  };

  return createNotification(
    userId,
    notificationType,
    title,
    message,
    `/orders/${orderId}`,
    { orderId, orderNumber }
  );
};

/**
 * Create wishlist notification
 */
const createWishlistNotification = async (userId, productId, productName, type, link = null) => {
  const typeMessages = {
    price_drop: {
      title: 'ფასი შემცირდა',
      message: `${productName} - ფასი შემცირდა! შეამოწმეთ ახალი ფასი.`
    },
    back_in_stock: {
      title: 'პროდუქტი კვლავ ხელმისაწვდომია',
      message: `${productName} კვლავ ხელმისაწვდომია!`
    },
    low_stock: {
      title: 'მცირე რაოდენობა',
      message: `${productName} - მცირე რაოდენობა დარჩა!`
    },
    out_of_stock: {
      title: 'არ არის მარაგში',
      message: `${productName} ამჟამად არ არის მარაგში.`
    }
  };

  const notificationType = `wishlist_${type}`;
  const { title, message } = typeMessages[type] || {
    title: 'პროდუქტის განახლება',
    message: `${productName} - განახლება`
  };

  return createNotification(
    userId,
    notificationType,
    title,
    message,
    link || `/products/${productId}`,
    { productId, productName }
  );
};

/**
 * Create promotion notification
 */
const createPromotionNotification = async (userId, promotionTitle, message, link = '/products') => {
  return createNotification(
    userId,
    'promotion_new',
    `ახალი აქცია: ${promotionTitle}`,
    message,
    link,
    { promotionTitle }
  );
};

module.exports = {
  createNotification,
  createOrderNotification,
  createPaymentNotification,
  createWishlistNotification,
  createPromotionNotification
};
