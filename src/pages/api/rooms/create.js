// src/pages/api/rooms/create.js
const jwt = require('jsonwebtoken');
const { userService } = require('../../../data/users');

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

const generateRoomId = () => {
  return Math.random().toString(36).substring(2, 10);
};

export default async function handler(req, res) {
  // Apply authentication middleware
  authenticateToken(req, res, () => {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
      const { roomName, password, maxUsers, isPrivate, description } = req.body;
      const userId = req.user.userId;
      
      if (!roomName || !password) {
        return res.status(400).json({ error: 'Room name and password are required' });
      }

      if (roomName.length < 3) {
        return res.status(400).json({ error: 'Room name must be at least 3 characters' });
      }

      if (password.length < 4) {
        return res.status(400).json({ error: 'Password must be at least 4 characters' });
      }

      const roomId = generateRoomId();
      const user = userService.findById(userId);
      
      // For now, we'll create a simple response
      // In a real application, you'd store this in a database
      const roomData = {
        roomId,
        roomName: roomName.trim(),
        maxUsers: parseInt(maxUsers) || 2,
        createdBy: user.username,
        isPrivate: Boolean(isPrivate),
        description: description?.trim() || '',
        createdAt: new Date().toISOString()
      };
      
      console.log(`🏠 Room created: ${roomId} (${roomName}) by ${user.username}`);
      
      res.json({ 
        success: true,
        message: 'Room created successfully',
        roomData
      });

    } catch (error) {
      console.error('Room creation error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
}
