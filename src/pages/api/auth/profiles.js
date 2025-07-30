// src/pages/api/auth/profile.js
const jwt = require('jsonwebtoken');
const { userService } = require('../../../data/users');

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

// Middleware to authenticate requests
const authenticate = (req) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('No token provided');
  }
  
  const token = authHeader.substring(7);
  const decoded = jwt.verify(token, JWT_SECRET);
  
  const user = userService.findById(decoded.userId);
  if (!user || !user.isActive) {
    throw new Error('User not found or inactive');
  }
  
  return user;
};

export default async function handler(req, res) {
  try {
    const user = authenticate(req);

    if (req.method === 'GET') {
      // Get user profile
      const { password, ...userWithoutPassword } = user;
      return res.status(200).json({
        success: true,
        user: userWithoutPassword
      });
    }

    if (req.method === 'PUT') {
      // Update user profile
      const updates = req.body;
      const allowedUpdates = ['firstName', 'lastName', 'preferences'];
      
      // Filter only allowed updates
      const filteredUpdates = {};
      allowedUpdates.forEach(field => {
        if (updates[field] !== undefined) {
          filteredUpdates[field] = updates[field];
        }
      });

      // Update user
      Object.assign(user, filteredUpdates);
      
      const { password, ...userWithoutPassword } = user;
      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        user: userWithoutPassword
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Profile API error:', error);
    
    if (error.message === 'No token provided' || error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
}
