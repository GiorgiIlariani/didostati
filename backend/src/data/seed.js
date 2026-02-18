const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Category = require('../models/Category');
const Product = require('../models/Product');
const categoriesData = require('./categories');
const productsData = require('./products');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Category.deleteMany({});
    await Product.deleteMany({});
    console.log('✅ Cleared old data');

    // Insert categories: first top-level, then subcategories with parent
    console.log('📁 Creating categories...');
    const topLevel = categoriesData.filter(c => !c.parentSlug);
    const subcategoriesData = categoriesData.filter(c => c.parentSlug);
    const topLevelCategories = await Category.insertMany(topLevel);
    const slugToId = {};
    topLevelCategories.forEach(cat => {
      slugToId[cat.slug] = cat._id;
    });
    const subcategoriesToInsert = subcategoriesData.map(({ parentSlug, ...rest }) => ({
      ...rest,
      parent: slugToId[parentSlug] || null
    }));
    const subcategories = await Category.insertMany(subcategoriesToInsert);
    const allCategories = [...topLevelCategories, ...subcategories];
    const categoryMap = {};
    allCategories.forEach(cat => {
      categoryMap[cat.name] = cat._id;
    });
    console.log(`✅ Created ${allCategories.length} categories (${topLevel.length} top-level, ${subcategories.length} subcategories)`);

    // Insert products with category references (categoryName -> id); include size, purpose
    // Rating and reviewsCount are not seeded — they stay 0 until real reviews exist
    console.log('🛍️  Creating products...');
    const productsWithCategories = productsData.map(({ categoryName, reviews, rating, ...product }) => ({
      ...product,
      category: categoryMap[categoryName],
      rating: 0,
      reviewsCount: 0,
      reviews: []
    }));

    const products = await Product.insertMany(productsWithCategories);
    console.log(`✅ Created ${products.length} products`);

    // Summary
    console.log('\n🎉 Database seeded successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - Categories: ${allCategories.length}`);
    console.log(`   - Products: ${products.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
