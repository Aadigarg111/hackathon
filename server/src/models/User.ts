import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

// Define interface for the user document
export interface IUser extends Document {
  email: string;
  username: string;
  password?: string;
  displayName?: string;
  avatar?: string;
  githubId?: string;
  comparePassword: (password: string) => Promise<boolean>;
}

const UserSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    minlength: 6,
  },
  displayName: {
    type: String,
    trim: true,
  },
  avatar: {
    type: String,
  },
  githubId: {
    type: String,
    unique: true,
    sparse: true,
  },
}, {
  timestamps: true,
});

// Password hashing middleware
UserSchema.pre('save', async function(next) {
  const user = this;
  
  if (!user.isModified('password') || !user.password) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function(password: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(password, this.password);
};

const User = mongoose.model<IUser>('User', UserSchema);

// Extend Express User type
declare global {
  namespace Express {
    interface User extends IUser {}
  }
}

export default User; 