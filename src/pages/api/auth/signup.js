// src/pages/api/auth/signup.js
const jwt = require('jsonwebtoken');
const { userService } = require('../../../data/users');

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username, email, password, confirmPassword, firstName, lastName } = req.body;

    // Validate input
    if (!username || !email || !password || !firstName || !lastName) {
      return res.status(400).json({ 
        error: 'All fields are required' 
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ 
        error: 'Passwords do not match' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'Password must be at least 6 characters long' 
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        error: 'Please enter a valid email address' 
      });
    }

    // Username validation
    if (username.length < 3) {
      return res.status(400).json({ 
        error: 'Username must be at least 3 characters long' 
      });
    }

    // Create new user
    const user = await userService.createUser({
      username,
      email,
      password,
      firstName,
      lastName
    });

    // Create JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Send response
    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      user,
      token
    });

  } catch (error) {
    console.error('Signup error:', error);
    
    if (error.message === 'User already exists') {
      return res.status(409).json({ error: 'Email or username already exists' });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
}
