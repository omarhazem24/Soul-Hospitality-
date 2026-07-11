import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Unit from '../models/Unit.js';

dotenv.config();

const migrateBasePrice = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/soul-hospitality');
    console.log('Connected to MongoDB');

    // Find all units that don't have basePrice but have pricePerNight
    const unitsWithoutBasePrice = await Unit.find({ 
      basePrice: { $exists: false },
      pricePerNight: { $exists: true, $ne: null }
    });

    console.log(`Found ${unitsWithoutBasePrice.length} units without basePrice`);

    if (unitsWithoutBasePrice.length === 0) {
      console.log('No units need migration. All units already have basePrice.');
      return;
    }

    // Update each unit
    for (const unit of unitsWithoutBasePrice) {
      unit.basePrice = unit.pricePerNight;
      await unit.save();
      console.log(`Updated unit ${unit.uniqueId} (${unit._id}): basePrice set to ${unit.basePrice}`);
    }

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

migrateBasePrice();
