// src/pages/api/auth/login.js
const jwt = require('jsonwebtoken');
const { userService } = require('../../../data/users');

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password, rememberMe } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Validate user credentials
    const user = await userService.validateCredentials(email, password);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Update last login
    userService.updateLastLogin(user.id);

    // Create JWT token
    const tokenExpiry = rememberMe ? '30d' : '1d';
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: tokenExpiry }
    );

    // Send response (excluding password)
    res.status(200).json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        role: user.role,
        preferences: user.preferences
      },
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
