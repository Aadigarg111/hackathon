import express, { Router, Request, Response, NextFunction } from 'express';
import { createGoal, getUserGoals, getGoalById, updateGoal, deleteGoal } from '../controllers/goal';
import { authenticateJWT } from '../middleware/auth';

const router: Router = express.Router();

// All goal routes require authentication
router.use(authenticateJWT);

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

// Create a new goal
router.post('/', asyncHandler(createGoal));

// Get all goals for current user
router.get('/', asyncHandler(getUserGoals));

// Get a specific goal
router.get('/:goalId', asyncHandler(getGoalById));

// Update a goal
router.put('/:goalId', asyncHandler(updateGoal));

// Delete a goal
router.delete('/:goalId', asyncHandler(deleteGoal));

export default router; 