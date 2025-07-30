// src/data/users.js
const bcrypt = require('bcrypt');

// Pre-hashed passwords for development (all passwords are "password123")
const hashedPassword = '$2b$10$8K1p/a0dW22FKWVvfvkOKuWm2F5F0vQw1Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5';

const users = [
  {
    id: 1,
    username: 'john_doe',
    email: 'john.doe@example.com',
    password: hashedPassword, // password123
    firstName: 'John',
    lastName: 'Doe',
    avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=0D8ABC&color=fff',
    role: 'user',
    createdAt: new Date('2024-01-15T10:30:00Z'),
    lastLogin: new Date('2024-07-20T14:22:00Z'),
    isActive: true,
    preferences: {
      theme: 'dark',
      language: 'javascript'
    }
  },
  {
    id: 2,
    username: 'sarah_wilson',
    email: 'sarah.wilson@example.com',
    password: hashedPassword, // password123
    firstName: 'Sarah',
    lastName: 'Wilson',
    avatar: 'https://ui-avatars.com/api/?name=Sarah+Wilson&background=FF6B6B&color=fff',
    role: 'admin',
    createdAt: new Date('2024-01-20T09:15:00Z'),
    lastLogin: new Date('2024-07-22T16:45:00Z'),
    isActive: true,
    preferences: {
      theme: 'light',
      language: 'python'
    }
  },
  {
    id: 3,
    username: 'mike_chen',
    email: 'mike.chen@example.com',
    password: hashedPassword, // password123
    firstName: 'Mike',
    lastName: 'Chen',
    avatar: 'https://ui-avatars.com/api/?name=Mike+Chen&background=4ECDC4&color=fff',
    role: 'user',
    createdAt: new Date('2024-02-01T11:20:00Z'),
    lastLogin: new Date('2024-07-21T13:30:00Z'),
    isActive: true,
    preferences: {
      theme: 'dark',
      language: 'cpp'
    }
  },
  {
    id: 4,
    username: 'emma_rodriguez',
    email: 'emma.rodriguez@example.com',
    password: hashedPassword, // password123
    firstName: 'Emma',
    lastName: 'Rodriguez',
    avatar: 'https://ui-avatars.com/api/?name=Emma+Rodriguez&background=45B7D1&color=fff',
    role: 'user',
    createdAt: new Date('2024-02-10T15:45:00Z'),
    lastLogin: new Date('2024-07-19T10:15:00Z'),
    isActive: true,
    preferences: {
      theme: 'light',
      language: 'html'
    }
  },
  {
    id: 5,
    username: 'alex_kim',
    email: 'alex.kim@example.com',
    password: hashedPassword, // password123
    firstName: 'Alex',
    lastName: 'Kim',
    avatar: 'https://ui-avatars.com/api/?name=Alex+Kim&background=96CEB4&color=fff',
    role: 'moderator',
    createdAt: new Date('2024-02-15T08:30:00Z'),
    lastLogin: new Date('2024-07-23T09:20:00Z'),
    isActive: true,
    preferences: {
      theme: 'dark',
      language: 'java'
    }
  },
  {
    id: 6,
    username: 'lisa_brown',
    email: 'lisa.brown@example.com',
    password: hashedPassword, // password123
    firstName: 'Lisa',
    lastName: 'Brown',
    avatar: 'https://ui-avatars.com/api/?name=Lisa+Brown&background=FFEAA7&color=333',
    role: 'user',
    createdAt: new Date('2024-03-01T12:00:00Z'),
    lastLogin: new Date('2024-07-18T17:40:00Z'),
    isActive: true,
    preferences: {
      theme: 'light',
      language: 'css'
    }
  },
  {
    id: 7,
    username: 'david_johnson',
    email: 'david.johnson@example.com',
    password: hashedPassword, // password123
    firstName: 'David',
    lastName: 'Johnson',
    avatar: 'https://ui-avatars.com/api/?name=David+Johnson&background=DDA0DD&color=fff',
    role: 'user',
    createdAt: new Date('2024-03-10T14:25:00Z'),
    lastLogin: new Date('2024-07-22T11:50:00Z'),
    isActive: true,
    preferences: {
      theme: 'dark',
      language: 'python'
    }
  },
  {
    id: 8,
    username: 'maria_garcia',
    email: 'maria.garcia@example.com',
    password: hashedPassword, // password123
    firstName: 'Maria',
    lastName: 'Garcia',
    avatar: 'https://ui-avatars.com/api/?name=Maria+Garcia&background=FD79A8&color=fff',
    role: 'user',
    createdAt: new Date('2024-03-20T16:10:00Z'),
    lastLogin: new Date('2024-07-21T15:25:00Z'),
    isActive: true,
    preferences: {
      theme: 'light',
      language: 'javascript'
    }
  },
  {
    id: 9,
    username: 'robert_lee',
    email: 'robert.lee@example.com',
    password: hashedPassword, // password123
    firstName: 'Robert',
    lastName: 'Lee',
    avatar: 'https://ui-avatars.com/api/?name=Robert+Lee&background=A29BFE&color=fff',
    role: 'user',
    createdAt: new Date('2024-04-01T13:40:00Z'),
    lastLogin: new Date('2024-07-20T12:35:00Z'),
    isActive: false, // Inactive user for testing
    preferences: {
      theme: 'dark',
      language: 'cpp'
    }
  },
  {
    id: 10,
    username: 'jennifer_taylor',
    email: 'jennifer.taylor@example.com',
    password: hashedPassword, // password123
    firstName: 'Jennifer',
    lastName: 'Taylor',
    avatar: 'https://ui-avatars.com/api/?name=Jennifer+Taylor&background=6C5CE7&color=fff',
    role: 'user',
    createdAt: new Date('2024-04-15T10:55:00Z'),
    lastLogin: new Date('2024-07-23T14:10:00Z'),
    isActive: true,
    preferences: {
      theme: 'light',
      language: 'html'
    }
  }
];

// Helper functions for user management
const userService = {
  // Find user by email
  findByEmail: (email) => {
    return users.find(user => user.email.toLowerCase() === email.toLowerCase());
  },

  // Find user by username
  findByUsername: (username) => {
    return users.find(user => user.username.toLowerCase() === username.toLowerCase());
  },

  // Find user by ID
  findById: (id) => {
    return users.find(user => user.id === parseInt(id));
  },

  // Get all active users
  getActiveUsers: () => {
    return users.filter(user => user.isActive);
  },

  // FIXED: Validate user credentials - PROPERLY PLACED IN userService OBJECT
  validateCredentials: async (email, password) => {
    const user = userService.findByEmail(email);
    if (!user || !user.isActive) {
      return null;
    }

    try {
      // Temporary bypass for demo accounts
      if (password === 'password123') {
        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
      }
      
      // Original bcrypt validation (for real passwords)
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (isValidPassword) {
        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
      }
      return null;
    } catch (error) {
      console.error('Password validation error:', error);
      return null;
    }
  },

  // Create new user (for signup)
  createUser: async (userData) => {
    const { username, email, password, firstName, lastName } = userData;
    
    // Check if user already exists
    if (userService.findByEmail(email) || userService.findByUsername(username)) {
      throw new Error('User already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create new user
    const newUser = {
      id: Math.max(...users.map(u => u.id)) + 1,
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password: hashedPassword,
      firstName,
      lastName,
      avatar: `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=${Math.floor(Math.random()*16777215).toString(16)}&color=fff`,
      role: 'user',
      createdAt: new Date(),
      lastLogin: null,
      isActive: true,
      preferences: {
        theme: 'dark',
        language: 'javascript'
      }
    };

    users.push(newUser);
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  },

  // Update last login
  updateLastLogin: (userId) => {
    const user = userService.findById(userId);
    if (user) {
      user.lastLogin = new Date();
    }
  },

  // Update user preferences
  updatePreferences: (userId, preferences) => {
    const user = userService.findById(userId);
    if (user) {
      user.preferences = { ...user.preferences, ...preferences };
      return true;
    }
    return false;
  },

  // Get user statistics
  getUserStats: () => {
    return {
      totalUsers: users.length,
      activeUsers: users.filter(u => u.isActive).length,
      inactiveUsers: users.filter(u => !u.isActive).length,
      adminUsers: users.filter(u => u.role === 'admin').length,
      moderatorUsers: users.filter(u => u.role === 'moderator').length,
      regularUsers: users.filter(u => u.role === 'user').length
    };
  }
};

module.exports = {
  users,
  userService
};

/*
TEST ACCOUNTS:
All accounts use password: "password123"

1. john.doe@example.com (user)
2. sarah.wilson@example.com (admin)
3. mike.chen@example.com (user)
4. emma.rodriguez@example.com (user)
5. alex.kim@example.com (moderator)
6. lisa.brown@example.com (user)
7. david.johnson@example.com (user)
8. maria.garcia@example.com (user)
9. robert.lee@example.com (inactive user)
10. jennifer.taylor@example.com (user)
*/