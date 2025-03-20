import { Request, Response } from 'express';
import User from '../models/User';
import fs from 'fs';
import path from 'path';

// Get user profile
export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.userId).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};

// Update user profile
export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    const { displayName, username } = req.body;

    // Find user and update
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if username is taken (if being updated)
    if (username && username !== user.username) {
      const usernameExists = await User.findOne({ username });
      if (usernameExists) {
        return res.status(400).json({ message: 'Username already taken' });
      }
      user.username = username;
    }

    if (displayName) {
      user.displayName = displayName;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      email: updatedUser.email,
      username: updatedUser.username,
      displayName: updatedUser.displayName,
      avatar: updatedUser.avatar,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};

// Create user directory
export const createUserDirectory = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Create directory path
    const dirPath = path.join(__dirname, '../../../index', userId);
    
    // Check if directory already exists
    if (fs.existsSync(dirPath)) {
      return res.status(200).json({ message: 'Directory already exists', path: `/index/${userId}` });
    }
    
    // Create directory
    fs.mkdirSync(dirPath, { recursive: true });
    
    // Create a basic index.html file
    const indexPath = path.join(dirPath, 'index.html');
    
    fs.writeFileSync(indexPath, `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Welcome ${req.user?.displayName || req.user?.username || 'User'}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
          .container { max-width: 800px; margin: 0 auto; }
          h1 { color: #333; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Welcome to your personal space, ${req.user?.displayName || req.user?.username || 'User'}!</h1>
          <p>This is your personal directory where you can store your content.</p>
        </div>
      </body>
      </html>
    `);
    
    res.status(201).json({ 
      message: 'Directory created successfully',
      path: `/index/${userId}`
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
}; 