import { Request, Response } from 'express';
import PeerGroup, { IPeerGroup } from '../models/PeerGroup';
import mongoose from 'mongoose';

// Create a new peer group
export const createPeerGroup = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const { name, description, maxMembers, isPublic, category } = req.body;

    // Basic validation
    if (!name || !description || !category) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Create the peer group
    const peerGroupData: Partial<IPeerGroup> = {
      name,
      description,
      creator: req.user.id || (req.user as any)._id,
      members: [req.user.id || (req.user as any)._id], // Add creator as the first member
      isPublic: isPublic !== undefined ? isPublic : true,
      category,
    };

    // Add max members if provided
    if (maxMembers) {
      peerGroupData.maxMembers = parseInt(maxMembers as unknown as string, 10);
    }

    const peerGroup = await PeerGroup.create(peerGroupData);

    res.status(201).json(peerGroup);
  } catch (error) {
    console.error('Error creating peer group:', error);
    res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};

// Get all public peer groups
export const getAllPeerGroups = async (req: Request, res: Response) => {
  try {
    const { category } = req.query;
    
    // Filter by category if provided
    const filter: any = { isPublic: true };
    if (category) {
      filter.category = category;
    }
    
    const peerGroups = await PeerGroup.find(filter)
      .sort({ createdAt: -1 })
      .populate('creator', 'username displayName avatar')
      .select('-members'); // Don't send members list for privacy

    res.json(peerGroups);
  } catch (error) {
    console.error('Error getting peer groups:', error);
    res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};

// Get peer groups the user is a member of
export const getUserPeerGroups = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const userId = req.user.id || (req.user as any)._id;
    
    const peerGroups = await PeerGroup.find({ members: userId })
      .sort({ createdAt: -1 })
      .populate('creator', 'username displayName avatar')
      .populate('members', 'username displayName avatar');

    res.json(peerGroups);
  } catch (error) {
    console.error('Error getting user peer groups:', error);
    res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};

// Get a single peer group by ID
export const getPeerGroupById = async (req: Request, res: Response) => {
  try {
    const { groupId } = req.params;

    const peerGroup = await PeerGroup.findById(groupId)
      .populate('creator', 'username displayName avatar')
      .populate('members', 'username displayName avatar');

    if (!peerGroup) {
      return res.status(404).json({ message: 'Peer group not found' });
    }

    // If not public, check if user is a member
    if (!peerGroup.isPublic && req.user) {
      const userId = req.user.id || (req.user as any)._id;
      const isMember = peerGroup.members.some(member => {
        return member._id?.toString() === userId?.toString() || 
               (member as any)?.id?.toString() === userId?.toString();
      });
      
      if (!isMember) {
        return res.status(403).json({ message: 'Not authorized to view this group' });
      }
    }

    res.json(peerGroup);
  } catch (error) {
    console.error('Error getting peer group:', error);
    res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};

// Join a peer group
export const joinPeerGroup = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const userId = req.user.id || (req.user as any)._id;
    const { groupId } = req.params;

    // Find the group
    const peerGroup = await PeerGroup.findById(groupId);

    if (!peerGroup) {
      return res.status(404).json({ message: 'Peer group not found' });
    }

    // Check if the group is public
    if (!peerGroup.isPublic) {
      return res.status(403).json({ message: 'Cannot join a private group' });
    }

    // Check if the group is full
    if (peerGroup.members.length >= peerGroup.maxMembers) {
      return res.status(400).json({ message: 'Group is full' });
    }

    // Check if user is already a member
    const isMember = peerGroup.members.some(memberId => memberId.toString() === userId.toString());
    
    if (isMember) {
      return res.status(400).json({ message: 'You are already a member of this group' });
    }

    // Add user to the group
    peerGroup.members.push(userId);
    await peerGroup.save();

    res.json({ message: 'Successfully joined the group', peerGroup });
  } catch (error) {
    console.error('Error joining peer group:', error);
    res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};

// Leave a peer group
export const leavePeerGroup = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const userId = req.user.id || (req.user as any)._id;
    const { groupId } = req.params;

    // Find the group
    const peerGroup = await PeerGroup.findById(groupId);

    if (!peerGroup) {
      return res.status(404).json({ message: 'Peer group not found' });
    }

    // Check if user is a member
    const isMember = peerGroup.members.some(memberId => memberId.toString() === userId.toString());
    
    if (!isMember) {
      return res.status(400).json({ message: 'You are not a member of this group' });
    }

    // Cannot leave if you're the creator
    if (peerGroup.creator.toString() === userId.toString()) {
      return res.status(400).json({ message: 'Creators cannot leave their groups. Delete the group instead.' });
    }

    // Remove user from the group
    peerGroup.members = peerGroup.members.filter(memberId => memberId.toString() !== userId.toString());
    await peerGroup.save();

    res.json({ message: 'Successfully left the group' });
  } catch (error) {
    console.error('Error leaving peer group:', error);
    res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
}; 