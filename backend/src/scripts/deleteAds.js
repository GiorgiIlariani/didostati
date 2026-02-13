require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const Advertisement = require('../models/Advertisement');

async function deleteAllAdvertisements() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Delete all advertisements
    const result = await Advertisement.deleteMany({});
    console.log(`✅ Deleted ${result.deletedCount} advertisement(s)`);

    await mongoose.connection.close();
    console.log('👋 Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// If you want to delete just one ad by ID, uncomment and use this:
async function deleteOneAdvertisement(id) {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const result = await Advertisement.findByIdAndDelete(id);
    if (result) {
      console.log(`✅ Deleted advertisement: ${result.title}`);
    } else {
      console.log('❌ Advertisement not found');
    }

    await mongoose.connection.close();
    console.log('👋 Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run delete all
deleteAllAdvertisements();

// To delete a specific ad, comment the line above and uncomment this:
// deleteOneAdvertisement('PUT_AD_ID_HERE');
