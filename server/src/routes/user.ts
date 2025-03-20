import express, { Router } from 'express';
import { getUserProfile, updateUserProfile, createUserDirectory } from '../controllers/user';
import { authenticateJWT } from '../middleware/auth';

const router: Router = express.Router();

// Apply authentication middleware to all user routes
router.use(authenticateJWT as express.RequestHandler);

// Get user profile
router.get('/profile', getUserProfile as express.RequestHandler);

// Update user profile
router.put('/profile', updateUserProfile as express.RequestHandler);

// Create user directory
router.post('/directory', createUserDirectory as express.RequestHandler);

export default router; 