import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './User';

export interface IGoal extends Document {
  title: string;
  description: string;
  deadline: Date;
  stakeAmount: number;
  status: 'active' | 'completed' | 'failed';
  user: mongoose.Types.ObjectId | IUser;
  peerGroup?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const GoalSchema = new Schema<IGoal>(
  {
    title: {
      type: String,
      required: [true, 'Goal title is required'],
      trim: true,
      maxlength: [100, 'Goal title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Goal description is required'],
      trim: true,
      maxlength: [500, 'Goal description cannot exceed 500 characters'],
    },
    deadline: {
      type: Date,
      required: [true, 'Deadline is required'],
    },
    stakeAmount: {
      type: Number,
      required: [true, 'Stake amount is required'],
      min: [0, 'Stake amount cannot be negative'],
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'failed'],
      default: 'active',
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    peerGroup: {
      type: Schema.Types.ObjectId,
      ref: 'PeerGroup',
    },
  },
  {
    timestamps: true,
  }
);

const Goal = mongoose.model<IGoal>('Goal', GoalSchema);

export default Goal; 