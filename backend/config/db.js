import mongoose from 'mongoose';
import logger from '../utils/logger.js';

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    logger.success('✅ MongoDB Connected');
  } catch (err) {
    logger.error(`❌ DB connection failed: ${err.message}`);
    // process.exit(1);
  }
};

export default connectDB;
