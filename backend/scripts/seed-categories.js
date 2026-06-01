const mongoose = require('mongoose');

require('dotenv').config();
const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  console.error('Missing MONGODB_URI environment variable.');
  process.exit(1);
}

const defaults = [
  { name: 'Wall Lights',              slug: 'wall-lights',              emoji: '💡', sortOrder: 1 },
  { name: 'Hanging Lights',           slug: 'hanging-lights',           emoji: '🏮', sortOrder: 2 },
  { name: 'Chandeliers',              slug: 'chandeliers',              emoji: '✨', sortOrder: 3 },
  { name: 'Table Lamps',              slug: 'table-lamps',              emoji: '🛋️', sortOrder: 4 },
  { name: 'Floor Lamps',              slug: 'floor-lamps',              emoji: '🪔', sortOrder: 5 },
  { name: 'Outdoor Lights',           slug: 'outdoor-lights',           emoji: '🌳', sortOrder: 6 },
  { name: 'Facade Lights',            slug: 'facade-lights',            emoji: '🏢', sortOrder: 7 },
  { name: 'Garden Lights',            slug: 'garden-lights',            emoji: '🌿', sortOrder: 8 },
  { name: 'LED Spotlights',           slug: 'led-spotlights',           emoji: '🔦', sortOrder: 9 },
  { name: 'Magnetic Track Lights',    slug: 'magnetic-track-lights',    emoji: '🛤️', sortOrder: 10 },
  { name: 'Profile Lights',           slug: 'profile-lights',           emoji: '📏', sortOrder: 11 },
  { name: 'LED Strip Lights',         slug: 'led-strip-lights',         emoji: '🌈', sortOrder: 12 },
  { name: 'Ceiling Fans',             slug: 'ceiling-fans',             emoji: '🌀', sortOrder: 13 },
  { name: 'Mirror Lights',            slug: 'mirror-lights',            emoji: '🪞', sortOrder: 14 },
  { name: 'Fairy Lights',             slug: 'fairy-lights',             emoji: '🎇', sortOrder: 15 },
  { name: 'Solar Lights',             slug: 'solar-lights',             emoji: '☀️', sortOrder: 16 },
  { name: 'Decor Lights',             slug: 'decor-lights',             emoji: '🏠', sortOrder: 17 },
  { name: 'Artifacts',                slug: 'artifacts',                emoji: '🗿', sortOrder: 18 },
  { name: 'Furniture',                slug: 'furniture',                emoji: '🪑', sortOrder: 19 },
  { name: 'Other',                    slug: 'other',                    emoji: '🛍️', sortOrder: 20 },
];

async function run() {
  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const Category = mongoose.model(
      'Category',
      new mongoose.Schema({
        name: String,
        slug: String,
        description: String,
        image: String,
        emoji: String,
        sortOrder: Number,
        isActive: Boolean,
      }),
      'categories'
    );

    let created = 0;
    for (const cat of defaults) {
      const exists = await Category.findOne({ slug: cat.slug });
      if (!exists) {
        await Category.create({ ...cat, isActive: true });
        created++;
        console.log('Created category', cat.slug);
      } else {
        console.log('Already exists', cat.slug);
      }
    }

    console.log(`Seed complete — created ${created} categories`);
  } catch (err) {
    console.error('Error seeding categories:', err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

run();
