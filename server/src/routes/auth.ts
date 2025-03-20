import express, { Router, Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { register, login, logout, getCurrentUser, githubAuthSuccess } from '../controllers/auth';
import { authenticateJWT, isAuthenticated } from '../middleware/auth';
import dotenv from 'dotenv';

// Ensure environment variables are loaded
dotenv.config();

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

// Register a new user
router.post('/register', asyncHandler(register));

// Login user
router.post('/login', asyncHandler(login));

// Logout user
router.post('/logout', asyncHandler(logout));

// Get current user
router.get('/me', authenticateJWT, asyncHandler(getCurrentUser));

// Check if GitHub OAuth is configured
const githubClientId = process.env.GITHUB_CLIENT_ID;
const githubClientSecret = process.env.GITHUB_CLIENT_SECRET;
const isGithubConfigured = Boolean(githubClientId && githubClientSecret);

console.log('GitHub OAuth Configuration Status:', {
  clientIdPresent: Boolean(githubClientId),
  clientSecretPresent: Boolean(githubClientSecret),
  isConfigured: isGithubConfigured
});

// GitHub OAuth Routes - Only set up if configured
if (isGithubConfigured) {
  console.log('Setting up GitHub OAuth routes with:', {
    clientId: githubClientId,
    callbackUrl: `${process.env.SERVER_URL}/api/auth/github/callback`
  });

  router.get('/github',
    (req, res, next) => {
      console.log('GitHub auth route accessed');
      next();
    },
    passport.authenticate('github', { 
      scope: ['user:email'],
      session: true
    })
  );

  router.get('/github/callback',
    (req, res, next) => {
      console.log('GitHub callback route accessed');
      next();
    },
    passport.authenticate('github', { 
      failureRedirect: `${process.env.CLIENT_URL}/login?error=github_auth_failed`,
      session: true 
    }),
    githubAuthSuccess
  );
} else {
  console.warn('GitHub OAuth is not properly configured:', {
    clientId: githubClientId ? 'present' : 'missing',
    clientSecret: githubClientSecret ? 'present' : 'missing'
  });

  // Fallback routes that inform the user that GitHub OAuth is not configured
  router.get('/github', (req: Request, res: Response) => {
    res.status(503).json({ 
      message: 'GitHub authentication is not configured on the server',
      error: 'Missing GitHub OAuth credentials',
      details: {
        clientId: githubClientId ? 'present' : 'missing',
        clientSecret: githubClientSecret ? 'present' : 'missing'
      }
    });
  });
  
  router.get('/github/callback', (req: Request, res: Response) => {
    res.redirect(`${process.env.CLIENT_URL}/login?error=github_not_configured`);
  });
}

// Debug endpoint to check authentication cookies and headers
router.get('/debug', (req: Request, res: Response) => {
  try {
    const debugInfo = {
      cookies: req.cookies,
      authHeader: req.header('Authorization'),
      isAuthenticated: req.isAuthenticated ? req.isAuthenticated() : false,
      user: req.user ? 'exists' : 'missing',
      sessionID: req.sessionID,
      githubConfigured: isGithubConfigured,
      env: {
        clientIdPresent: Boolean(process.env.GITHUB_CLIENT_ID),
        clientSecretPresent: Boolean(process.env.GITHUB_CLIENT_SECRET),
        serverUrl: process.env.SERVER_URL,
        clientUrl: process.env.CLIENT_URL
      }
    };
    
    console.log('Auth debug info:', debugInfo);
    res.json(debugInfo);
  } catch (error) {
    console.error('Error in debug endpoint:', error);
    res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
});

export default router; 