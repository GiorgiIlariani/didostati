require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const Product = require('../models/Product');

// Safety guard: this wipes ALL products. Usage: npm run delete-products -- --confirm
if (!process.argv.includes('--confirm')) {
  console.error('❌ This deletes ALL products. Re-run with:  npm run delete-products -- --confirm');
  process.exit(2);
}

async function deleteAllProducts() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const result = await Product.deleteMany({});
    console.log(`✅ Deleted ${result.deletedCount} product(s)`);
    console.log('📁 Categories were not touched.');

    await mongoose.connection.close();
    console.log('👋 Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

deleteAllProducts();
