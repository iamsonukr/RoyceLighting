const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Config
const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  console.error('Missing MONGODB_URI environment variable.');
  process.exit(1);
}

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'thesonukumar357@gmail.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'thesonukumar357';
const ADMIN_NAME = process.env.ADMIN_NAME || 'Admin';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin', 'vendor'], default: 'user' },
  isActive: { type: Boolean, default: true },
  shopName: String,
  shopDescription: String,
  phone: String,
  address: String,
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function run() {
  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const hashed = await bcrypt.hash(ADMIN_PASSWORD, 10);

    const existing = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() });
    if (existing) {
      existing.password = hashed;
      existing.role = 'admin';
      existing.isActive = true;
      existing.name = ADMIN_NAME;
      await existing.save();
      console.log(`Updated existing admin user: ${ADMIN_EMAIL}`);
    } else {
      await User.create({
        name: ADMIN_NAME,
        email: ADMIN_EMAIL.toLowerCase(),
        password: hashed,
        role: 'admin',
        isActive: true,
      });
      console.log(`Created admin user: ${ADMIN_EMAIL}`);
    }
  } catch (err) {
    console.error('Error seeding admin user:', err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

run();
