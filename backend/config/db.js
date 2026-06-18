import mongoose from 'mongoose';
import logger from '../utils/logger.js';

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined. Check your .env file in the backend/ directory.');
    }
    await mongoose.connect(process.env.MONGO_URI);
    logger.success('✅ MongoDB Connected');
  } catch (err) {
    logger.error(`❌ DB connection failed: ${err.message}`);
    // process.exit(1);
  }
};

export default connectDB;
