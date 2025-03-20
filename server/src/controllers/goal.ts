import { Request, Response } from 'express';
import Goal, { IGoal } from '../models/Goal';
import mongoose from 'mongoose';

// Create a new goal
export const createGoal = async (req: Request, res: Response) => {
  try {
    console.log('Creating goal - Request received');
    
    // Check authentication
    if (!req.user) {
      console.log('Goal creation failed: User not authenticated');
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    // Log request details
    console.log('Goal creation - Request body:', req.body);
    console.log('Goal creation - User:', req.user);
    
    const { title, description, deadline, stakeAmount, peerGroupId } = req.body;
    
    // Log request parameters
    console.log('Goal creation request details:', {
      title: title || 'missing',
      description: description ? 'provided' : 'missing',
      deadline: deadline || 'missing',
      stakeAmount: stakeAmount !== undefined ? stakeAmount : 'missing',
      peerGroupId: peerGroupId || 'not provided',
      user: req.user._id ? 'exists' : 'missing',
      userId: req.userId || 'missing'
    });

    // Basic validation
    if (!title || !description || !deadline || stakeAmount === undefined) {
      console.log('Goal creation failed: Missing required fields');
      res.status(400).json({ message: 'Please provide all required fields' });
      return;
    }

    // Extract user ID - prefer req.userId, then fall back to user._id
    const userId = req.userId || (req.user as any)._id?.toString();
    
    if (!userId) {
      console.log('Goal creation failed: Could not determine user ID');
      res.status(400).json({ message: 'User ID is missing or invalid' });
      return;
    }

    try {
      // Create goal object
      const goalData: Partial<IGoal> = {
        title,
        description,
        deadline: new Date(deadline),
        stakeAmount: parseFloat(stakeAmount.toString()),
        user: new mongoose.Types.ObjectId(userId),
        status: 'active',
      };

      // Add peer group if provided
      if (peerGroupId) {
        console.log('Adding peer group to goal:', peerGroupId);
        
        // Validate the peer group exists if provided
        if (peerGroupId) {
          try {
            const peerGroupExists = await mongoose.Types.ObjectId.isValid(peerGroupId);
            if (!peerGroupExists) {
              console.log('Goal creation failed: Invalid peer group ID format');
              res.status(400).json({ message: 'Invalid peer group ID format' });
              return;
            }
            // Only add a valid ObjectId to prevent schema validation errors
            goalData.peerGroup = new mongoose.Types.ObjectId(peerGroupId);
          } catch (idError) {
            console.error('Error validating peer group ID:', idError);
            res.status(400).json({ message: 'Invalid peer group ID' });
            return;
          }
        }
      }

      console.log('Creating goal with data:', JSON.stringify(goalData));
      
      // Create the goal
      const goal = await Goal.create(goalData);
      console.log('Goal created successfully:', goal._id);

      // Return the created goal
      res.status(201).json(goal);
    } catch (mongooseError) {
      console.error('Mongoose error creating goal:', mongooseError);
      res.status(400).json({ 
        message: 'Error creating goal', 
        error: (mongooseError as Error).message
      });
    }
  } catch (error) {
    console.error('Unhandled error in goal creation:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: (error as Error).message,
      stack: process.env.NODE_ENV === 'development' ? (error as Error).stack : undefined
    });
  }
};

// Get all goals for a user
export const getUserGoals = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const userId = req.userId || (req.user as any)._id;
    
    const goals = await Goal.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate('peerGroup', 'name');

    res.json(goals);
  } catch (error) {
    console.error('Error getting user goals:', error);
    res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};

// Get a single goal by ID
export const getGoalById = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const userId = req.userId || (req.user as any)._id;
    const { goalId } = req.params;

    const goal = await Goal.findOne({
      _id: goalId,
      user: userId,
    }).populate('peerGroup');

    if (!goal) {
      res.status(404).json({ message: 'Goal not found' });
      return;
    }

    res.json(goal);
  } catch (error) {
    console.error('Error getting goal:', error);
    res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};

// Update a goal
export const updateGoal = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const userId = req.userId || (req.user as any)._id;
    const { goalId } = req.params;
    const { title, description, deadline, status } = req.body;

    // Find the goal and ensure it belongs to this user
    const goal = await Goal.findOne({
      _id: goalId,
      user: userId,
    });

    if (!goal) {
      res.status(404).json({ message: 'Goal not found' });
      return;
    }

    // Only allow updates to active goals
    if (goal.status !== 'active' && status !== 'completed' && status !== 'failed') {
      res.status(400).json({ message: 'Cannot update a completed or failed goal' });
      return;
    }

    // Update fields if provided
    if (title) goal.title = title;
    if (description) goal.description = description;
    if (deadline) goal.deadline = new Date(deadline);
    if (status && (status === 'active' || status === 'completed' || status === 'failed')) {
      goal.status = status;
    }

    await goal.save();

    res.json(goal);
  } catch (error) {
    console.error('Error updating goal:', error);
    res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};

// Delete a goal
export const deleteGoal = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const userId = req.userId || (req.user as any)._id;
    const { goalId } = req.params;

    const goal = await Goal.findOneAndDelete({
      _id: goalId,
      user: userId,
      status: 'active', // Only allow deleting active goals
    });

    if (!goal) {
      res.status(404).json({ message: 'Goal not found or cannot be deleted' });
      return;
    }

    res.json({ message: 'Goal deleted successfully' });
  } catch (error) {
    console.error('Error deleting goal:', error);
    res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
}; 