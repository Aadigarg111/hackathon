import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';
import mongoose from 'mongoose';

// Define an extended Request interface to add typed user
interface ExtendedRequest extends Request {
  user?: IUser;
  userId?: string;
}

// Middleware to authenticate JWT token
export const authenticateJWT = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
  try {
    // Log all cookies for debugging
    console.log('Auth cookies received:', req.cookies);
    console.log('Auth headers:', { 
      authorization: req.header('Authorization'),
      cookie: req.header('Cookie')
    });

    // Get token from cookies or Authorization header
    const token = req.cookies?.token || req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      console.log('Authentication failed: No token provided in cookies or headers');
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    try {
      console.log('Attempting to verify token:', token.substring(0, 10) + '...');
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
      
      if (!decoded || !decoded.id) {
        console.log('Authentication failed: Token decoded but no user ID found');
        res.status(401).json({ message: 'Invalid token format' });
        return;
      }
      
      console.log('JWT verified, finding user with ID:', decoded.id);
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        console.log('Authentication failed: User not found for ID:', decoded.id);
        res.status(404).json({ message: 'User not found' });
        return;
      }

      // Set the user and userId properties
      req.user = user;
      // Get the ID as a string, whether it's from Mongoose _id or a regular id property
      req.userId = user._id?.toString();
      
      console.log('User authenticated successfully:', {
        id: req.userId,
        username: user.username
      });
      
      next();
    } catch (jwtError) {
      console.log('JWT verification failed:', jwtError);
      // Set a new cookie to clear the invalid one
      res.cookie('token', '', { expires: new Date(0), httpOnly: true });
      res.status(401).json({ message: 'Invalid token', error: (jwtError as Error).message });
      return;
    }
  } catch (error) {
    console.error('Authentication middleware error:', error);
    res.status(500).json({ message: 'Server error during authentication', error: (error as Error).message });
    return;
  }
};

// Simple middleware to check if user is authenticated with passport
export const isAuthenticated = (req: ExtendedRequest, res: Response, next: NextFunction) => {
  if (req.isAuthenticated && req.isAuthenticated() || req.user) {
    return next();
  }
  console.log('Authentication failed: User not authenticated');
  res.status(401).json({ message: 'Authentication required' });
  return;
};

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
      userId?: string;
    }
  }
}