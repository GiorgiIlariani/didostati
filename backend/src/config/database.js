const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/didostati",
    );

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Fix for phone login: the old `users.email_1` index was created as
    // unique but NOT sparse (email used to be required). Phone-only accounts
    // have no email, so the SECOND phone user could never register
    // (E11000 duplicate key { email: null }). Mongoose never alters an
    // existing index with different options, so sync explicitly. This is
    // idempotent — a no-op once the indexes match the schema.
    try {
      const User = require("../models/User");
      const rebuilt = await User.syncIndexes();
      if (rebuilt.length) {
        console.log(`🔧 users: rebuilt stale index(es): ${rebuilt.join(", ")}`);
      }
    } catch (indexError) {
      console.error(`⚠️  users index sync failed: ${indexError.message}`);
    }
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
