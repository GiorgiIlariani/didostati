const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find user by email and make them admin
    const email = 'gio@gmail.com';
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      console.log(`❌ User with email ${email} not found!`);
      console.log('💡 Please register this email first, then run this script again.');
      process.exit(1);
    }

    if (user.role === 'admin') {
      console.log('✅ User is already an admin!');
      console.log(`   Email: ${user.email}`);
      console.log(`   Name: ${user.name}`);
      console.log(`   Role: ${user.role}`);
      process.exit(0);
    }

    // Update user to admin
    user.role = 'admin';
    await user.save();

    console.log('\n🎉 User promoted to admin successfully!');
    console.log(`📧 Email: ${user.email}`);
    console.log(`👤 Name: ${user.name}`);
    console.log(`👑 Role: ${user.role}`);
    console.log('\n💡 You can now log in and access admin features.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

createAdmin();
