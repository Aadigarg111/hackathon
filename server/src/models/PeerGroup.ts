import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './User';

export interface IPeerGroup extends Document {
  name: string;
  description: string;
  creator: mongoose.Types.ObjectId | IUser;
  members: Array<mongoose.Types.ObjectId | IUser>;
  maxMembers: number;
  isPublic: boolean;
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

const PeerGroupSchema = new Schema<IPeerGroup>(
  {
    name: {
      type: String,
      required: [true, 'Group name is required'],
      trim: true,
      maxlength: [50, 'Group name cannot exceed 50 characters'],
    },
    description: {
      type: String,
      required: [true, 'Group description is required'],
      trim: true,
      maxlength: [500, 'Group description cannot exceed 500 characters'],
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    maxMembers: {
      type: Number,
      default: 5,
      min: [2, 'A group must have at least 2 members'],
      max: [20, 'A group cannot have more than 20 members'],
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['leetcode', 'project', 'learning', 'other'],
      default: 'other',
    },
  },
  {
    timestamps: true,
  }
);

// Add creator to members array if not already included
PeerGroupSchema.pre('save', function(next) {
  const group = this;
  
  // Convert all ObjectIds to strings for comparison
  const creatorId = group.creator.toString();
  const memberIds = group.members.map(member => member.toString());
  
  // If creator is not in members array, add them
  if (!memberIds.includes(creatorId)) {
    group.members.push(group.creator);
  }
  
  next();
});

const PeerGroup = mongoose.model<IPeerGroup>('PeerGroup', PeerGroupSchema);

export default PeerGroup; 