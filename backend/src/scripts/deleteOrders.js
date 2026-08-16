require("dotenv").config({
  path: require("path").join(__dirname, "../../.env"),
});
const mongoose = require("mongoose");
const Order = require("../models/Order");
const Product = require("../models/Product");
const ProductView = require("../models/ProductView");
const Notification = require("../models/Notification");

const ORDER_NOTIFICATION_TYPES = [
  "order_pending",
  "order_confirmed",
  "order_processing",
  "order_ready_to_ship",
  "order_shipped",
  "order_delivered",
  "order_cancelled",
  "payment_received",
  "payment_failed",
  "admin_new_order",
];

async function resetStorefront() {
  try {
    console.log("🔗 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    const orders = await Order.deleteMany({});
    console.log(`✅ Deleted ${orders.deletedCount} order(s)`);

    const notifications = await Notification.deleteMany({
      type: { $in: ORDER_NOTIFICATION_TYPES },
    });
    console.log(
      `✅ Deleted ${notifications.deletedCount} order notification(s)`,
    );

    const views = await ProductView.deleteMany({});
    console.log(`✅ Deleted ${views.deletedCount} product view record(s)`);

    const products = await Product.updateMany(
      {},
      { $set: { viewCount: 0, soldCount: 0 } },
    );
    console.log(
      `✅ Reset viewCount/soldCount on ${products.modifiedCount} product(s)`,
    );

    await mongoose.connection.close();
    console.log("👋 Disconnected from MongoDB");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

resetStorefront();
