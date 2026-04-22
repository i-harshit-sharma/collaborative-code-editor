import User from '../models/User.js';
import { verifyToken } from '@clerk/express';
import logger from '../utils/logger.js';

/**
 * Middleware to authenticate user using JWT and attach the user object to req.user
 */
export const authenticateUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized - No token found' });
  }

  const token = authHeader.split(' ')[1];
  
  try {
    const verifiedToken = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
    });
    
    if (!verifiedToken || !verifiedToken.sub) {
      return res.status(401).json({ error: 'Unauthorized - Invalid token' });
    }

    // Attach the auth payload sub (Clerk User ID) for reference
    req.authId = verifiedToken.sub;

    // Fetch the user object from MongoDB
    let user = await User.findOne({ userId: verifiedToken.sub });
    
    // Attach the user object to the request
    // Note: user might be null if it's their first time and hasn't been created in DB yet
    req.user = user;
    
    next();
  } catch (error) {
    logger.error(`Authentication Middleware Error: ${error.message}`);
    return res.status(401).json({ error: 'Unauthorized - Session invalid or expired' });
  }
};
