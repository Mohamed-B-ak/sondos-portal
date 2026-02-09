// =====================================================
// Seed Admin Account — Run once: node seedAdmin.js
// =====================================================

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../src/models/User');

// Load environment variables
dotenv.config();

const MONGO_URI = process.env.MONGO_DB_URI;
if (!MONGO_URI) {
  console.error('❌ MONGO_DB_URI is not set in .env');
  process.exit(1);
}

const ADMIN_PASSWORD = process.env.ADMIN_SEED_PASSWORD;
if (!ADMIN_PASSWORD) {
  console.error('❌ ADMIN_SEED_PASSWORD is not set in .env');
  process.exit(1);
}

const ADMIN = {
  name: 'Mohamed Admin',
  email: 'mohamed.ak@siyadah-ai.com',
  phone: '+966000000000',
  company: 'Sondos AI',
  password: ADMIN_PASSWORD,
  role: 'admin',
  isActive: true,
  settings: {
    language: 'ar',
    theme: 'dark',
    notifications: true
  }
};

async function seed() {
  try {
    await mongoose.connect(MONGO_URI, { dbName: process.env.DB_NAME || 'Sondos-Portal' });
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existing = await User.findOne({ email: ADMIN.email });
    if (existing) {
      console.log('⚠️  Admin already exists:', existing.email);
      console.log('   Role:', existing.role);
      
      // Update role to admin if not already
      if (existing.role !== 'admin') {
        existing.role = 'admin';
        await existing.save();
        console.log('✅ Updated role to admin');
      }
    } else {
      const admin = await User.create(ADMIN);
      console.log('✅ Admin created successfully!');
      console.log('   Email:', admin.email);
      console.log('   Role:', admin.role);
    }

    await mongoose.disconnect();
    console.log('✅ Done');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

seed();
