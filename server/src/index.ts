import dotenv from 'dotenv';
import path from 'path';

// Load .env file from the server directory
dotenv.config({ path: path.join(__dirname, '../.env') });

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import passport from 'passport';
import fs from 'fs';

// Routes
import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import goalRoutes from './routes/goal';
import peerGroupRoutes from './routes/peerGroup';

// Config
import './config/passport';

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Verify environment variables are loaded
console.log('Environment Check:', {
  nodeEnv: process.env.NODE_ENV,
  githubId: process.env.GITHUB_CLIENT_ID ? 'present' : 'missing',
  githubSecret: process.env.GITHUB_CLIENT_SECRET ? 'present' : 'missing',
  serverUrl: process.env.SERVER_URL,
  clientUrl: process.env.CLIENT_URL
});

// Create index directory if it doesn't exist
const indexPath = path.join(__dirname, '../index');
if (!fs.existsSync(indexPath)) {
  fs.mkdirSync(indexPath, { recursive: true });
  console.log('Created index directory for user spaces');
}

// Middleware
app.use(express.json());
app.use(cookieParser());

// CORS Configuration
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'https://hackathon-aadigarg111.vercel.app',
  'https://github.com'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
}));

// Session setup for OAuth
app.use(session({
  secret: process.env.JWT_SECRET as string,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    domain: process.env.NODE_ENV === 'production' ? '.vercel.app' : undefined
  }
}));

// Initialize Passport and restore authentication state from session
app.use(passport.initialize());
app.use(passport.session());

// Debug middleware
app.use((req, res, next) => {
  console.log('Request cookies:', req.cookies);
  console.log('Session:', req.session);
  console.log('User:', req.user);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/peer-groups', peerGroupRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Index route directory
app.use('/index', express.static(path.join(__dirname, '../index')));

// Error handler middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global error handler caught:', err);
  
  // Ensure we always return JSON instead of HTML for errors
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {},
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// 404 handler - must be after all other routes
app.use((req, res) => {
  res.status(404).json({ 
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Connect to MongoDB
console.log('Attempting to connect to MongoDB at:', process.env.MONGODB_URI);
mongoose.connect(process.env.MONGODB_URI as string)
  .then(() => {
    console.log('Connected to MongoDB successfully');
    startServer();
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    console.log('Starting server without MongoDB...');
    startServer();
  });

function startServer() {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  }).on('error', (error: any) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use. Please try a different port or kill the process using that port.`);
      process.exit(1);
    } else {
      console.error('Server error:', error);
    }
  });
}

export default app; 