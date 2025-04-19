// middleware/clerkAuth.js
import dotenv from 'dotenv';
dotenv.config();

// const { ClerkExpressWithAuth } = require('@clerk/clerk-sdk-node');
// import { ClerkExpressWithAuth } from '@clerk/clerk-sdk-node';
import { requireAuth } from '@clerk/express';

// Clerk middleware
const clerkAuthMiddleware = requireAuth({
  // apiKey: process.env.CLERK_API_KEY,
  // Optional config here if needed
  
  // apiVersion: 2,
});

export default clerkAuthMiddleware;
