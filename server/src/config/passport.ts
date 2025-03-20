import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2';
import dotenv from 'dotenv';
import User from '../models/User';

dotenv.config();

// Check if GitHub credentials are available
const githubClientId = process.env.GITHUB_CLIENT_ID;
const githubClientSecret = process.env.GITHUB_CLIENT_SECRET;
const serverUrl = process.env.SERVER_URL || 'http://localhost:5000';

if (githubClientId && githubClientSecret) {
  console.log('Configuring GitHub OAuth Strategy');
  
  passport.use(new GitHubStrategy({
    clientID: githubClientId,
    clientSecret: githubClientSecret,
    callbackURL: `${serverUrl}/api/auth/github/callback`,
    scope: ['user:email'],
  }, async (accessToken: string, refreshToken: string, profile: any, done: any) => {
    try {
      console.log('GitHub OAuth callback received:', { id: profile.id, username: profile.username });
      
      // Check if user already exists
      let user = await User.findOne({ githubId: profile.id });

      if (user) {
        console.log('Existing user found:', user.username);
        return done(null, user);
      }

      // Get primary email from GitHub
      const email = profile.emails && profile.emails[0]?.value;

      // Create a new user
      user = new User({
        githubId: profile.id,
        email: email,
        username: profile.username,
        displayName: profile.displayName || profile.username,
        avatar: profile.photos?.[0]?.value,
      });

      await user.save();
      console.log('New user created:', user.username);
      return done(null, user);
    } catch (error) {
      console.error('Error in GitHub strategy:', error);
      return done(error as Error);
    }
  }));

  // Serialize the entire user object
  passport.serializeUser((user: any, done) => {
    console.log('Serializing user:', user.id);
    done(null, user.id);
  });

  // Deserialize user with error handling
  passport.deserializeUser(async (id: string, done) => {
    try {
      console.log('Deserializing user:', id);
      const user = await User.findById(id);
      if (!user) {
        console.log('User not found during deserialization');
        return done(null, false);
      }
      console.log('User deserialized successfully:', user.username);
      done(null, user);
    } catch (error) {
      console.error('Error deserializing user:', error);
      done(error);
    }
  });

  console.log('GitHub OAuth strategy configured successfully');
} else {
  console.warn('GitHub OAuth is not configured. GitHub login will not work.');
  console.warn('Missing credentials:', {
    clientId: githubClientId ? 'present' : 'missing',
    clientSecret: githubClientSecret ? 'present' : 'missing'
  });
}

export default passport; 