import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';

// Generate JWT token
const generateToken = (id: string): string => {
  return jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: '30d',
  });
};

// Set cookie with JWT token
const setTokenCookie = (res: Response, token: string) => {
  // Set cookie options for better compatibility
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax' as 'none' | 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    path: '/',
  };
  
  console.log('Setting auth cookie with options:', cookieOptions);
  res.cookie('token', token, cookieOptions);
};

// Register a new user
export const register = async (req: Request, res: Response) => {
  try {
    const { email, username, password } = req.body;

    if (!email || !username || !password) {
      res.status(400).json({ message: 'Please provide all required fields' });
      return;
    }

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });

    if (existingUser) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    // Create new user
    const user = await User.create({
      email,
      username,
      password,
      displayName: username,
    });

    // Generate token
    const token = generateToken(user.id);
    setTokenCookie(res, token);

    res.status(201).json({
      _id: user._id,
      email: user.email,
      username: user.username,
      displayName: user.displayName,
      avatar: user.avatar,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};

// Login user
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Please provide email and password' });
      return;
    }

    // Find user by email
    const user = await User.findOne({ email });

    if (!user || !user.password) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    // Check password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    // Generate token
    const token = generateToken(user.id);
    setTokenCookie(res, token);

    res.json({
      _id: user._id,
      email: user.email,
      username: user.username,
      displayName: user.displayName,
      avatar: user.avatar,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};

// Logout user
export const logout = (req: Request, res: Response) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  req.logout((err) => {
    if (err) {
      res.status(500).json({ message: 'Error logging out' });
      return;
    }
    res.status(200).json({ message: 'Logged out successfully' });
  });
};

// Get current user
export const getCurrentUser = (req: Request, res: Response) => {
  try {
    if (!req.user) {
      console.log('Current user check failed: No user in request');
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    console.log('Current user check successful:', {
      id: req.user.id || (req.user as any)._id,
      username: req.user.username
    });
    
    res.json(req.user);
  } catch (error) {
    console.error('Error fetching current user:', error);
    res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};

// Handle GitHub OAuth Success
export const githubAuthSuccess = (req: Request, res: Response) => {
  try {
    console.log('GitHub auth callback received', { 
      user: req.user ? 'exists' : 'missing',
      session: req.session ? 'exists' : 'missing',
      cookies: req.cookies
    });
    
    if (!req.user) {
      console.error('GitHub auth failed: No user data');
      res.redirect(`${process.env.CLIENT_URL}/login?error=auth_failed&reason=no_user_data`);
      return;
    }

    // Generate JWT token
    const userId = req.user.id || (req.user as any)._id?.toString();
    if (!userId) {
      console.error('GitHub auth failed: No user ID', { user: req.user });
      res.redirect(`${process.env.CLIENT_URL}/login?error=user_id_missing`);
      return;
    }
    
    const token = generateToken(userId);
    setTokenCookie(res, token);

    // Log the authentication success
    console.log(`GitHub auth successful for user ID: ${userId}`, {
      redirectingTo: `${process.env.CLIENT_URL}/challenges`
    });
    
    // Redirect to challenges page after successful GitHub authentication
    res.redirect(`${process.env.CLIENT_URL}/challenges`);
  } catch (error) {
    console.error('GitHub auth error:', error);
    res.redirect(`${process.env.CLIENT_URL}/login?error=server_error&message=${encodeURIComponent((error as Error).message)}`);
  }
}; 