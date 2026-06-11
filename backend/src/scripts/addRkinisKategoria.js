require("dotenv").config({
  path: require("path").join(__dirname, "../../.env"),
});
const mongoose = require("mongoose");
const Category = require("../models/Category");

const category = {
  name: "რკინა",
  slug: "rkinis-kategoria",
  description:
    "ლითონის პროფილები, არმატურა, თუნუქი, მავთულის ბადე და სხვა რკინის მასალები სამშენებლო და სარემონტო სამუშაოებისთვის.",
  image: "/assets/images/rkinis-kategoria.jpeg",
  isActive: true,
};

async function addCategory() {
  try {
    console.log("🔗 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    const result = await Category.findOneAndUpdate(
      { slug: category.slug },
      { $set: category },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    console.log(`✅ Category ready: ${result.name} (${result._id})`);

    await mongoose.connection.close();
    console.log("👋 Disconnected from MongoDB");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

addCategory();
