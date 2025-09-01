import express from 'express';
import {
  googleAuth,
  googleAuthCallback,
  logout,
  getCurrentUser,
} from '../controllers/authController.js';
import { verifyJWT } from '../middleware/verifyJWT.js';

const router = express.Router();

// Google OAuth routes
router.get('/google', googleAuth);
router.get('/google/callback', googleAuthCallback);

// Logout route
router.post('/logout', logout);

// Get current user (protected route)
router.get('/me', verifyJWT, getCurrentUser);

export default router;
