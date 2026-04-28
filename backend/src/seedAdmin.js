require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for seeding...");

    const email = "admin@blogify.com";
    const password = "admin123";

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email });
    if (existingAdmin) {
      console.log("Admin user already exists.");
      process.exit(0);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin user
    const adminUser = new User({
      name: "Admin User",
      email: email,
      password: hashedPassword,
      role: "admin",
      bio: "I am the platform administrator.",
    });

    await adminUser.save();
    console.log("Admin user seeded successfully!");
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);

  } catch (error) {
    console.error("Error seeding admin:", error);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
};

seedAdmin();
