import express, { Router, Request, Response, NextFunction } from 'express';
import { 
  createPeerGroup, 
  getAllPeerGroups, 
  getUserPeerGroups, 
  getPeerGroupById, 
  joinPeerGroup,
  leavePeerGroup
} from '../controllers/peerGroup';
import { authenticateJWT } from '../middleware/auth';

const router: Router = express.Router();

// Define a type-safe wrapper to handle controllers that may or may not return promises
const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = fn(req, res, next);
      if (result instanceof Promise) {
        result.catch(next);
      }
    } catch (error) {
      next(error);
    }
  };
};

// Get all public peer groups - no auth required
router.get('/public', asyncHandler(getAllPeerGroups));

// All other routes require authentication
router.use(authenticateJWT);

// Create a new peer group
router.post('/', asyncHandler(createPeerGroup));

// Get peer groups for current user
router.get('/', asyncHandler(getUserPeerGroups));

// Get a specific peer group
router.get('/:groupId', asyncHandler(getPeerGroupById));

// Join a peer group
router.post('/:groupId/join', asyncHandler(joinPeerGroup));

// Leave a peer group
router.post('/:groupId/leave', asyncHandler(leavePeerGroup));

export default router; 