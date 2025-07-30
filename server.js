// server.js - COMPLETE VERSION WITH AUDIO PERMISSION SYSTEM
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { userService } = require('./src/data/users');

const app = express();
const server = http.createServer(app);

// Create a new Socket.IO server with CORS support
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000','http://192.168.1.13:3000','https://cotog-36p5aess3-saad-khans-projects-c6ee1320.vercel.app'  ],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000' ,'http://192.168.1.13:3000','https://cotog-36p5aess3-saad-khans-projects-c6ee1320.vercel.app'  ],
  credentials: true
}));
app.use(express.json());

const PORT = 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

// Enhanced data structures
const rooms = {}; // { roomId: [ { id, username, userId, joinedAt, role } ] }
const roomsData = {}; // { roomId: { roomName, password, maxUsers, createdAt, createdBy, isPrivate, description, currentLanguage, currentCode } }
const messageHistory = {}; // { roomId: [ { sender, message, timestamp, id, userId } ] }
const userSessions = {}; // { socketId: { userId, roomId, username } }

// Audio permission system
const audioPermissions = {}; // { roomId: { username: boolean } }
const pendingAudioRequests = {}; // { roomId: [ { username, timestamp } ] }
const audioUsers = {}; // { roomId: [ { username, socketId, isMuted, isConnected } ] }
const speakingUsers = {}; // { roomId: [ username ] }

// Authentication middleware for REST endpoints
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

// Socket authentication middleware
const authenticateSocket = (socket, next) => {
  const token = socket.handshake.auth.token;
  
  if (!token) {
    return next(new Error('Authentication token required'));
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return next(new Error('Invalid authentication token'));
    }

    const user = userService.findById(decoded.userId);
    if (!user || !user.isActive) {
      return next(new Error('User not found or inactive'));
    }

    socket.userId = user.id;
    socket.username = user.username;
    socket.userRole = user.role;
    next();
  });
};

// Utility functions
const generateRoomId = () => {
  return Math.random().toString(36).substring(2, 10);
};

const cleanupEmptyRooms = () => {
  for (const roomId in rooms) {
    if (!rooms[roomId] || rooms[roomId].length === 0) {
      delete rooms[roomId];
      delete roomsData[roomId];
      delete messageHistory[roomId];
      delete audioPermissions[roomId];
      delete pendingAudioRequests[roomId];
      delete audioUsers[roomId];
      delete speakingUsers[roomId];
      console.log(`🧹 Cleaned up empty room: ${roomId}`);
    }
  }
};

const isRoomOwner = (userId, roomId) => {
  return roomsData[roomId]?.createdBy === userId;
};

const isRoomModerator = (userId, roomId) => {
  const user = rooms[roomId]?.find(u => u.userId === userId);
  return user && (user.role === 'moderator' || user.role === 'owner');
};

// Audio permission helper functions
const initializeRoomAudio = (roomId) => {
  if (!audioPermissions[roomId]) {
    audioPermissions[roomId] = {};
  }
  if (!pendingAudioRequests[roomId]) {
    pendingAudioRequests[roomId] = [];
  }
  if (!audioUsers[roomId]) {
    audioUsers[roomId] = [];
  }
  if (!speakingUsers[roomId]) {
    speakingUsers[roomId] = [];
  }
};

const broadcastAudioPermissions = (roomId) => {
  const roomPermissions = audioPermissions[roomId] || {};
  io.to(roomId).emit('audioPermissionsUpdate', {
    permissions: roomPermissions
  });
};

const broadcastPendingRequests = (roomId, targetRole = null) => {
  const requests = pendingAudioRequests[roomId] || [];
  
  if (targetRole) {
    // Send only to room owners/moderators
    rooms[roomId]?.forEach(user => {
      if (user.role === 'owner' || user.role === 'moderator') {
        const socket = io.sockets.sockets.get(user.id);
        if (socket) {
          socket.emit('audioPermissionRequest', requests[requests.length - 1]);
        }
      }
    });
  } else {
    io.to(roomId).emit('pendingAudioRequestsUpdate', { requests });
  }
};

const broadcastAudioUsers = (roomId) => {
  const roomAudioUsers = audioUsers[roomId] || [];
  io.to(roomId).emit('audioUsersUpdate', {
    audioUsers: roomAudioUsers
  });
};

const broadcastSpeakingUsers = (roomId) => {
  const roomSpeakingUsers = speakingUsers[roomId] || [];
  io.to(roomId).emit('speakingUsersUpdate', {
    speakingUsers: roomSpeakingUsers
  });
};

const getLastRoomActivity = (roomId) => {
  const messages = messageHistory[roomId];
  if (!messages || messages.length === 0) {
    return null;
  }
  return messages[messages.length - 1].timestamp;
};

// Authentication Routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    console.log('🔍 Login attempt for:', email);

    // Validate user credentials
    const user = await userService.validateCredentials(email, password);
    
    if (!user) {
      console.log('❌ Login failed for:', email);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    console.log('✅ Login successful for:', email);

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
});

// Signup route
app.post('/api/auth/signup', async (req, res) => {
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
});

// Token verification route
app.post('/api/auth/verify', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Get user data
    const user = userService.findById(decoded.userId);
    
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Return user data (excluding password)
    const { password, ...userWithoutPassword } = user;
    
    res.status(200).json({
      success: true,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Token verification error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
});

// REST API endpoints

// Create room (authenticated users only)
app.post('/api/rooms/create', authenticateToken, (req, res) => {
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
  
  // Store room metadata with language and code tracking
  roomsData[roomId] = {
    roomId,
    roomName: roomName.trim(),
    password,
    maxUsers: parseInt(maxUsers) || 2,
    createdAt: new Date(),
    createdBy: userId,
    createdByUsername: user.username,
    isPrivate: Boolean(isPrivate),
    description: description?.trim() || '',
    isActive: true,
    currentLanguage: 'javascript', // Default language
    currentCode: '// Welcome to collaborative coding!\n// Start typing to share your code with the team...'
  };
  
  // Initialize room structures
  rooms[roomId] = [];
  messageHistory[roomId] = [];
  initializeRoomAudio(roomId);
  
  console.log(`🏠 Room created: ${roomId} (${roomName}) by ${user.username}`);
  
  res.json({ 
    success: true,
    message: 'Room created successfully',
    roomData: {
      roomId,
      roomName: roomsData[roomId].roomName,
      maxUsers: roomsData[roomId].maxUsers,
      createdBy: user.username,
      isPrivate: roomsData[roomId].isPrivate,
      description: roomsData[roomId].description,
      currentLanguage: roomsData[roomId].currentLanguage
    }
  });
});

// Get room info
app.get('/api/room/:roomId', (req, res) => {
  const { roomId } = req.params;
  const room = roomsData[roomId];
  
  if (!room || !room.isActive) {
    return res.status(404).json({ error: 'Room not found' });
  }
  
  res.json({
    roomId,
    roomName: room.roomName,
    maxUsers: room.maxUsers,
    currentUsers: rooms[roomId]?.length || 0,
    createdBy: room.createdByUsername,
    createdAt: room.createdAt,
    isPrivate: room.isPrivate,
    description: room.description,
    currentLanguage: room.currentLanguage
  });
});

// Get user's rooms (authenticated)
app.get('/api/rooms/my-rooms', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  
  const userRooms = Object.values(roomsData)
    .filter(room => room.createdBy === userId && room.isActive)
    .map(room => ({
      roomId: room.roomId,
      roomName: room.roomName,
      maxUsers: room.maxUsers,
      currentUsers: rooms[room.roomId]?.length || 0,
      createdAt: room.createdAt,
      isPrivate: room.isPrivate,
      description: room.description,
      currentLanguage: room.currentLanguage,
      lastActivity: getLastRoomActivity(room.roomId)
    }))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.json({
    success: true,
    rooms: userRooms,
    totalRooms: userRooms.length
  });
});

// Delete room (owner only)
app.delete('/api/rooms/:roomId', authenticateToken, (req, res) => {
  const { roomId } = req.params;
  const userId = req.user.userId;
  
  const room = roomsData[roomId];
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }
  
  if (room.createdBy !== userId) {
    return res.status(403).json({ error: 'Only room owner can delete the room' });
  }
  
  // Mark room as inactive and disconnect all users
  room.isActive = false;
  
  // Notify all users in the room
  io.to(roomId).emit('roomDeleted', {
    message: 'This room has been deleted by the owner',
    roomId
  });
  
  // Disconnect all users from the room
  if (rooms[roomId]) {
    rooms[roomId].forEach(user => {
      const socket = io.sockets.sockets.get(user.id);
      if (socket) {
        socket.leave(roomId);
      }
    });
  }
  
  // Clean up room data
  setTimeout(() => {
    delete rooms[roomId];
    delete roomsData[roomId];
    delete messageHistory[roomId];
    delete audioPermissions[roomId];
    delete pendingAudioRequests[roomId];
    delete audioUsers[roomId];
    delete speakingUsers[roomId];
  }, 5000); // Give time for clients to handle the deletion event
  
  console.log(`🗑️ Room deleted: ${roomId} by ${req.user.email}`);
  
  res.json({
    success: true,
    message: 'Room deleted successfully'
  });
});

// Socket.IO connection handling with authentication
io.use(authenticateSocket);

io.on('connection', (socket) => {
  console.log(`🔌 Authenticated connection: ${socket.username} (${socket.id})`);

  // Store user session
  userSessions[socket.id] = {
    userId: socket.userId,
    username: socket.username,
    userRole: socket.userRole,
    roomId: null
  };

  // When a client joins a room
  socket.on('joinRoom', ({ roomId, roomPassword }) => {
    try {
      // Validate room exists and is active
      if (!roomsData[roomId] || !roomsData[roomId].isActive) {
        socket.emit('error', { message: 'Room not found or no longer active' });
        return;
      }

      const room = roomsData[roomId];
      
      // Validate password
      if (room.password !== roomPassword) {
        socket.emit('error', { message: 'Invalid room password' });
        return;
      }

      // Check if room is full
      const currentUsers = rooms[roomId] || [];
      if (currentUsers.length >= room.maxUsers) {
        socket.emit('error', { message: 'Room is full' });
        return;
      }

      // Check for duplicate username in room (allow same user multiple connections)
      const existingUser = currentUsers.find(user => user.userId === socket.userId);
      if (existingUser) {
        socket.emit('error', { message: 'You are already in this room' });
        return;
      }

      // Join the room
      socket.join(roomId);
      userSessions[socket.id].roomId = roomId;
      
      // Determine user role in room
      let userRole = 'member';
      if (room.createdBy === socket.userId) {
        userRole = 'owner';
        // Room owner gets automatic audio permission
        if (!audioPermissions[roomId]) {
          initializeRoomAudio(roomId);
        }
        audioPermissions[roomId][socket.username] = true;
      } else if (socket.userRole === 'admin') {
        userRole = 'moderator';
        // Admins get automatic audio permission as moderators
        if (!audioPermissions[roomId]) {
          initializeRoomAudio(roomId);
        }
        audioPermissions[roomId][socket.username] = true;
      }
      
      // Add user to room
      if (!rooms[roomId]) rooms[roomId] = [];
      rooms[roomId].push({ 
        id: socket.id, 
        userId: socket.userId,
        username: socket.username,
        joinedAt: new Date(),
        role: userRole
      });

      console.log(`📥 ${socket.username} joined room ${roomId} (${room.roomName}) as ${userRole}`);

      // Send chat history to new user
      if (messageHistory[roomId]) {
        socket.emit('chatHistory', messageHistory[roomId]);
      }

      // Send current room code and language to new user
      socket.emit('codeUpdate', {
        code: room.currentCode,
        language: room.currentLanguage,
        username: 'System',
        timestamp: new Date().toISOString()
      });

      // Send welcome message to new user
      const welcomeMessage = {
        id: Date.now(),
        sender: 'System',
        message: `Welcome to ${room.roomName}, ${socket.username}!`,
        timestamp: new Date().toISOString(),
        type: 'system'
      };
      socket.emit('message', welcomeMessage);

      // Notify others about new user
      const joinMessage = {
        id: Date.now() + 1,
        sender: 'System',
        message: `${socket.username} has joined the room.`,
        timestamp: new Date().toISOString(),
        type: 'system'
      };
      socket.to(roomId).emit('message', joinMessage);

      // Update user list for everyone in the room
      io.to(roomId).emit('roomUsers', rooms[roomId]);

      // Send current audio permissions and pending requests
      socket.emit('audioPermissionsUpdate', {
        permissions: audioPermissions[roomId] || {}
      });

      // Send pending audio requests to owners/moderators
      if (userRole === 'owner' || userRole === 'moderator') {
        socket.emit('pendingAudioRequestsUpdate', {
          requests: pendingAudioRequests[roomId] || []
        });
      }

      // Send join confirmation with room info
      socket.emit('joinSuccess', {
        roomId,
        username: socket.username,
        userRole,
        roomInfo: {
          roomName: room.roomName,
          maxUsers: room.maxUsers,
          currentUsers: rooms[roomId].length,
          description: room.description,
          isPrivate: room.isPrivate,
          currentLanguage: room.currentLanguage
        },
        audioPermissions: audioPermissions[roomId] || {}
      });

      // Broadcast current audio users and speaking status
      broadcastAudioUsers(roomId);
      broadcastSpeakingUsers(roomId);

    } catch (error) {
      console.error('Error joining room:', error);
      socket.emit('error', { message: 'Failed to join room' });
    }
  });

  // When a message is sent
  socket.on('chatMessage', ({ roomId, message }) => {
    try {
      const userSession = userSessions[socket.id];
      
      if (!userSession || userSession.roomId !== roomId) {
        socket.emit('error', { message: 'You are not in this room' });
        return;
      }

      const user = rooms[roomId]?.find(u => u.id === socket.id);
      if (!user) {
        socket.emit('error', { message: 'User not found in room' });
        return;
      }

      const msgData = {
        id: Date.now(),
        sender: user.username,
        message: message.trim(),
        timestamp: new Date().toISOString(),
        type: 'user',
        userId: user.userId,
        senderRole: user.role
      };

      // Store message in history
      if (!messageHistory[roomId]) messageHistory[roomId] = [];
      messageHistory[roomId].push(msgData);
      
      // Keep only last 100 messages per room
      if (messageHistory[roomId].length > 100) {
        messageHistory[roomId] = messageHistory[roomId].slice(-100);
      }

      // Broadcast to everyone in the room
      io.to(roomId).emit('message', msgData);
      
      console.log(`✉️ ${user.username} sent message to room ${roomId}: ${message}`);
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Typing indicator
  socket.on('typing', ({ roomId, isTyping }) => {
    const userSession = userSessions[socket.id];
    
    if (userSession && userSession.roomId === roomId) {
      socket.to(roomId).emit('userTyping', {
        username: userSession.username,
        isTyping
      });
    }
  });

  // Code synchronization
  socket.on('codeChange', ({ roomId, code, language, cursorPosition }) => {
    const userSession = userSessions[socket.id];
    
    if (userSession && userSession.roomId === roomId) {
      // Update room's current code
      if (roomsData[roomId]) {
        roomsData[roomId].currentCode = code;
        if (language) {
          roomsData[roomId].currentLanguage = language;
        }
      }

      socket.to(roomId).emit('codeUpdate', {
        code,
        language: language || roomsData[roomId]?.currentLanguage,
        cursorPosition,
        userId: userSession.userId,
        username: userSession.username,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Language change handling
  socket.on('languageChange', (data) => {
    console.log('🚨 [SERVER] RAW languageChange event received:', {
      data,
      socketId: socket.id,
      username: socket.username
    });
    
    const { roomId, language, code, userId, username } = data;
    
    try {
      // Basic validation
      if (!roomId || !language || !username) {
        console.log('❌ [SERVER] Missing required fields');
        socket.emit('error', { message: 'Missing required fields' });
        return;
      }
      
      // Check if room exists
      if (!roomsData[roomId]) {
        console.log('❌ [SERVER] Room not found:', roomId);
        socket.emit('error', { message: 'Room not found' });
        return;
      }
      
      // Find user in room
      const user = rooms[roomId]?.find(u => u.id === socket.id);
      if (!user) {
        console.log('❌ [SERVER] User not in room. Room users:', rooms[roomId]?.map(u => u.username));
        socket.emit('error', { message: 'User not found in room' });
        return;
      }
      
      // Check permissions
      if (user.role !== 'owner' && user.role !== 'moderator') {
        console.log(`❌ [SERVER] No permission. User role: ${user.role}`);
        socket.emit('error', { message: 'Only room owner or moderator can change language' });
        return;
      }
      
      // Validate language
      const validLanguages = ['javascript', 'python', 'html', 'css', 'cpp', 'java'];
      if (!validLanguages.includes(language)) {
        console.log('❌ [SERVER] Invalid language:', language);
        socket.emit('error', { message: 'Invalid language selected' });
        return;
      }
      
      // Update room language
      const oldLanguage = roomsData[roomId].currentLanguage;
      roomsData[roomId].currentLanguage = language;
      if (code !== undefined) {
        roomsData[roomId].currentCode = code;
      }
      console.log(`✅ [SERVER] Updated room ${roomId} language from ${oldLanguage} to ${language}`);
      
      // Create payload
      const payload = {
        language,
        code: code || roomsData[roomId].currentCode || '',
        username,
        userId,
        timestamp: new Date().toISOString()
      };
      
      console.log('📡 [SERVER] Broadcasting languageUpdate to room:', roomId, 'with payload:', {
        language: payload.language,
        codeLength: payload.code?.length,
        username: payload.username,
        usersInRoom: rooms[roomId]?.length || 0
      });
      
      // Broadcast to room
      io.to(roomId).emit('languageUpdate', payload);
      
      // Send system message
      const langChangeMessage = {
        id: Date.now(),
        sender: 'System',
        message: `${username} changed the coding language to ${language.toUpperCase()}`,
        timestamp: new Date().toISOString(),
        type: 'system'
      };
      
      if (!messageHistory[roomId]) messageHistory[roomId] = [];
      messageHistory[roomId].push(langChangeMessage);
      io.to(roomId).emit('message', langChangeMessage);
      
      // Send success confirmation
      socket.emit('languageChangeSuccess', { 
        language,
        message: `Language changed to ${language.toUpperCase()}` 
      });
      
      console.log(`🎉 [SERVER] Language change COMPLETE: ${oldLanguage} → ${language} in room ${roomId}`);
      
    } catch (error) {
      console.error('❌ [SERVER] Language change error:', error);
      socket.emit('error', { message: 'Language change failed' });
    }
  });

  // Audio permission request handling
  socket.on('audioPermissionRequest', ({ roomId, username }) => {
    try {
      console.log(`🎤 [SERVER] Audio permission request from ${username} in room ${roomId}`);
      
      if (!roomId || !username) {
        socket.emit('error', { message: 'Missing required fields' });
        return;
      }

      const userSession = userSessions[socket.id];
      if (!userSession || userSession.roomId !== roomId) {
        socket.emit('error', { message: 'You are not in this room' });
        return;
      }

      // Initialize room audio data if needed
      initializeRoomAudio(roomId);

      // Check if user already has permission
      if (audioPermissions[roomId][username]) {
        socket.emit('error', { message: 'You already have audio permission' });
        return;
      }

      // Check if request already pending
      const existingRequest = pendingAudioRequests[roomId].find(req => req.username === username);
      if (existingRequest) {
        socket.emit('error', { message: 'Permission request already pending' });
        return;
      }

      // Add to pending requests
      const request = {
        username,
        timestamp: new Date().toISOString()
      };
      
      pendingAudioRequests[roomId].push(request);

      // Notify room owners/moderators
      rooms[roomId]?.forEach(user => {
        if (user.role === 'owner' || user.role === 'moderator') {
          const targetSocket = io.sockets.sockets.get(user.id);
          if (targetSocket) {
            targetSocket.emit('audioPermissionRequest', request);
          }
        }
      });

      console.log(`🎤 [SERVER] Audio permission request sent to moderators for ${username}`);

    } catch (error) {
      console.error('Error handling audio permission request:', error);
      socket.emit('error', { message: 'Failed to process audio permission request' });
    }
  });

  // Audio permission response handling
  socket.on('audioPermissionResponse', ({ roomId, username, granted }) => {
    try {
      console.log(`🎤 [SERVER] Audio permission response: ${username} = ${granted}`);
      
      const userSession = userSessions[socket.id];
      if (!userSession || userSession.roomId !== roomId) {
        socket.emit('error', { message: 'You are not in this room' });
        return;
      }

      const currentUser = rooms[roomId]?.find(u => u.id === socket.id);
      if (!currentUser || (currentUser.role !== 'owner' && currentUser.role !== 'moderator')) {
        socket.emit('error', { message: 'You do not have permission to grant audio access' });
        return;
      }

      // Initialize room audio data if needed
      initializeRoomAudio(roomId);

      // Remove from pending requests
      pendingAudioRequests[roomId] = pendingAudioRequests[roomId].filter(
        req => req.username !== username
      );

      // Update permissions
      audioPermissions[roomId][username] = granted;

      // Notify the requesting user
      const targetUser = rooms[roomId]?.find(u => u.username === username);
      if (targetUser) {
        const targetSocket = io.sockets.sockets.get(targetUser.id);
        if (targetSocket) {
          targetSocket.emit('audioPermissionResponse', {
            username,
            granted,
            respondedBy: currentUser.username
          });
        }
      }

      // Broadcast updated permissions to all room users
      broadcastAudioPermissions(roomId);

      // Send system message
      const permissionMessage = {
        id: Date.now(),
        sender: 'System',
        message: `${currentUser.username} ${granted ? 'granted' : 'denied'} audio permission to ${username}`,
        timestamp: new Date().toISOString(),
        type: 'system'
      };
      
      if (!messageHistory[roomId]) messageHistory[roomId] = [];
      messageHistory[roomId].push(permissionMessage);
      io.to(roomId).emit('message', permissionMessage);

      console.log(`🎤 [SERVER] Audio permission ${granted ? 'granted' : 'denied'} to ${username} by ${currentUser.username}`);

    } catch (error) {
      console.error('Error handling audio permission response:', error);
      socket.emit('error', { message: 'Failed to process audio permission response' });
    }
  });

  // Audio toggle handling
  socket.on('audioToggle', ({ roomId, username, connected }) => {
    try {
      console.log(`🎤 [SERVER] Audio toggle: ${username} = ${connected}`);
      
      const userSession = userSessions[socket.id];
      if (!userSession || userSession.roomId !== roomId) {
        return;
      }

      // Initialize room audio data if needed
      initializeRoomAudio(roomId);

      // Check if user has permission (except for owner/moderator)
      const currentUser = rooms[roomId]?.find(u => u.id === socket.id);
      if (!currentUser) return;

      const hasPermission = currentUser.role === 'owner' || 
                          currentUser.role === 'moderator' || 
                          audioPermissions[roomId][username];

      if (!hasPermission) {
        socket.emit('error', { message: 'You do not have audio permission' });
        return;
      }

      if (connected) {
        // Add user to audio users
        const existingAudioUser = audioUsers[roomId].find(u => u.username === username);
        if (!existingAudioUser) {
          audioUsers[roomId].push({
            username,
            socketId: socket.id,
            isMuted: true, // Start muted by default
            isConnected: true
          });
        }
      } else {
        // Remove user from audio users
        audioUsers[roomId] = audioUsers[roomId].filter(u => u.username !== username);
        // Also remove from speaking users
        speakingUsers[roomId] = speakingUsers[roomId].filter(u => u !== username);
      }

      // Broadcast updated audio users
      broadcastAudioUsers(roomId);
      broadcastSpeakingUsers(roomId);

      console.log(`🎤 [SERVER] ${username} audio ${connected ? 'connected' : 'disconnected'}`);

    } catch (error) {
      console.error('Error handling audio toggle:', error);
    }
  });

  // Audio mute handling
  socket.on('audioMute', ({ roomId, username, muted }) => {
    try {
      const userSession = userSessions[socket.id];
      if (!userSession || userSession.roomId !== roomId) {
        return;
      }

      initializeRoomAudio(roomId);

      // Update mute status
      const audioUser = audioUsers[roomId]?.find(u => u.username === username);
      if (audioUser) {
        audioUser.isMuted = muted;
        
        // If muted, remove from speaking users
        if (muted) {
          speakingUsers[roomId] = speakingUsers[roomId].filter(u => u !== username);
        }
      }

      // Broadcast updated audio users and speaking status
      broadcastAudioUsers(roomId);
      broadcastSpeakingUsers(roomId);

      console.log(`🎤 [SERVER] ${username} ${muted ? 'muted' : 'unmuted'}`);

    } catch (error) {
      console.error('Error handling audio mute:', error);
    }
  });

  // Speaking status update
  socket.on('speakingUpdate', ({ roomId, username, isSpeaking }) => {
    try {
      const userSession = userSessions[socket.id];
      if (!userSession || userSession.roomId !== roomId) {
        return;
      }

      initializeRoomAudio(roomId);

      // Check if user is connected to audio and not muted
      const audioUser = audioUsers[roomId]?.find(u => u.username === username);
      if (!audioUser || !audioUser.isConnected || audioUser.isMuted) {
        return;
      }

      if (isSpeaking) {
        // Add to speaking users if not already there
        if (!speakingUsers[roomId].includes(username)) {
          speakingUsers[roomId].push(username);
        }
      } else {
        // Remove from speaking users
        speakingUsers[roomId] = speakingUsers[roomId].filter(u => u !== username);
      }

      // Broadcast updated speaking status
      broadcastSpeakingUsers(roomId);

    } catch (error) {
      console.error('Error handling speaking update:', error);
    }
  });

  // When user disconnects
  socket.on('disconnect', () => {
    console.log(`🔌 User disconnected: ${socket.username || 'Unknown'} (${socket.id})`);
    
    const userSession = userSessions[socket.id];
    if (userSession && userSession.roomId) {
      const roomId = userSession.roomId;
      const userIndex = rooms[roomId]?.findIndex(u => u.id === socket.id);
      
      if (userIndex !== -1) {
        const username = rooms[roomId][userIndex].username;
        rooms[roomId].splice(userIndex, 1);
        
        // Clean up audio data
        if (audioUsers[roomId]) {
          audioUsers[roomId] = audioUsers[roomId].filter(u => u.username !== username);
        }
        if (speakingUsers[roomId]) {
          speakingUsers[roomId] = speakingUsers[roomId].filter(u => u !== username);
        }
        
        console.log(`❌ ${username} left room ${roomId}`);

        // Notify remaining users
        const leaveMessage = {
          id: Date.now(),
          sender: 'System',
          message: `${username} has left the room.`,
          timestamp: new Date().toISOString(),
          type: 'system'
        };
        socket.to(roomId).emit('message', leaveMessage);

        // Update user list and audio status
        io.to(roomId).emit('roomUsers', rooms[roomId]);
        broadcastAudioUsers(roomId);
        broadcastSpeakingUsers(roomId);
      }
    }
    
    // Clean up user session
    delete userSessions[socket.id];
    
    // Clean up empty rooms after a delay
    setTimeout(cleanupEmptyRooms, 5000);
  });

  // Handle client errors
  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });

  // Room management events (owner/moderator only)
  socket.on('kickUser', ({ roomId, targetUserId }) => {
    const userSession = userSessions[socket.id];
    
    if (!userSession || userSession.roomId !== roomId) {
      socket.emit('error', { message: 'You are not in this room' });
      return;
    }

    const currentUser = rooms[roomId]?.find(u => u.id === socket.id);
    if (!currentUser || (currentUser.role !== 'owner' && currentUser.role !== 'moderator')) {
      socket.emit('error', { message: 'You do not have permission to kick users' });
      return;
    }

    const targetUser = rooms[roomId]?.find(u => u.userId === targetUserId);
    if (!targetUser) {
      socket.emit('error', { message: 'User not found in room' });
      return;
    }

    if (targetUser.role === 'owner') {
      socket.emit('error', { message: 'Cannot kick room owner' });
      return;
    }

    // Find the target socket and disconnect them
    const targetSocket = io.sockets.sockets.get(targetUser.id);
    if (targetSocket) {
      targetSocket.emit('kicked', {
        message: `You have been removed from the room by ${currentUser.username}`,
        roomId
      });
      targetSocket.leave(roomId);
    }

    // Remove user from room
    const userIndex = rooms[roomId].findIndex(u => u.userId === targetUserId);
    if (userIndex !== -1) {
      rooms[roomId].splice(userIndex, 1);
      
      // Clean up audio data
      if (audioUsers[roomId]) {
        audioUsers[roomId] = audioUsers[roomId].filter(u => u.username !== targetUser.username);
      }
      if (speakingUsers[roomId]) {
        speakingUsers[roomId] = speakingUsers[roomId].filter(u => u !== targetUser.username);
      }
      
      // Notify remaining users
      const kickMessage = {
        id: Date.now(),
        sender: 'System',
        message: `${targetUser.username} was removed from the room.`,
        timestamp: new Date().toISOString(),
        type: 'system'
      };
      io.to(roomId).emit('message', kickMessage);
      io.to(roomId).emit('roomUsers', rooms[roomId]);
      broadcastAudioUsers(roomId);
      broadcastSpeakingUsers(roomId);
    }

    console.log(`👢 ${targetUser.username} was kicked from room ${roomId} by ${currentUser.username}`);
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    rooms: Object.keys(roomsData).length,
    activeConnections: Object.keys(userSessions).length,
    audioSessions: Object.keys(audioUsers).reduce((total, roomId) => total + audioUsers[roomId].length, 0)
  });
});

// Get server statistics (admin only)
app.get('/api/admin/stats', authenticateToken, (req, res) => {
  const user = userService.findById(req.user.userId);
  
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const stats = {
    totalRooms: Object.keys(roomsData).length,
    activeRooms: Object.values(roomsData).filter(room => room.isActive).length,
    totalConnections: Object.keys(userSessions).length,
    totalMessages: Object.values(messageHistory).reduce((total, messages) => total + messages.length, 0),
    audioStats: {
      totalAudioUsers: Object.keys(audioUsers).reduce((total, roomId) => total + audioUsers[roomId].length, 0),
      totalSpeakingUsers: Object.keys(speakingUsers).reduce((total, roomId) => total + speakingUsers[roomId].length, 0),
      pendingRequests: Object.keys(pendingAudioRequests).reduce((total, roomId) => total + pendingAudioRequests[roomId].length, 0)
    },
    userStats: userService.getUserStats(),
    roomsByUser: Object.values(roomsData).reduce((acc, room) => {
      acc[room.createdByUsername] = (acc[room.createdByUsername] || 0) + 1;
      return acc;
    }, {}),
    serverUptime: process.uptime(),
    memoryUsage: process.memoryUsage()
  };

  res.json({
    success: true,
    stats
  });
});

// Cleanup empty rooms every 10 minutes
setInterval(cleanupEmptyRooms, 10 * 60 * 1000);

// Cleanup inactive rooms every hour
setInterval(() => {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  
  for (const roomId in roomsData) {
    const room = roomsData[roomId];
    const lastActivity = getLastRoomActivity(roomId);
    
    // If room has no activity for 1 hour and no users, mark as inactive
    if ((!lastActivity || new Date(lastActivity) < oneHourAgo) && 
        (!rooms[roomId] || rooms[roomId].length === 0)) {
      room.isActive = false;
      console.log(`⏰ Room ${roomId} marked as inactive due to inactivity`);
    }
  }
}, 60 * 60 * 1000);

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Express error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// Handle 404 routes
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Graceful shutdown
const gracefulShutdown = () => {
  console.log('🛑 Server shutting down gracefully');
  
  // Notify all connected users
  io.emit('serverShutdown', {
    message: 'Server is shutting down for maintenance. Please reconnect in a few minutes.'
  });
  
  // Close server
  server.close(() => {
    console.log('✅ Server closed gracefully');
    process.exit(0);
  });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

server.listen(PORT, () => {
  console.log(`✅ COTOG Server listening on http://localhost:${PORT}`);
  console.log(`📡 Socket.IO ready for authenticated connections`);
  console.log(`🔐 Authentication required for room features`);
  console.log(`👥 ${userService.getUserStats().totalUsers} users in database`);
  console.log(`🔧 Language switching enabled for room owners/moderators`);
  console.log(`🎤 Audio permission system enabled`);
  console.log('');
  console.log('📋 Available Features:');
  console.log('   • User Authentication & Authorization');
  console.log('   • Real-time Collaborative Code Editor');
  console.log('   • Integrated Chat System');
  console.log('   • Audio Permission Management');
  console.log('   • Speaking Indicators & Voice Chat');
  console.log('   • Room Management & Controls');
  console.log('   • Multi-language Support');
  console.log('   • Session Management & Cleanup');
  console.log('');
  console.log('🎤 Audio System Features:');
  console.log('   • Permission-based audio access');
  console.log('   • Real-time speaking indicators');
  console.log('   • Owner/moderator audio controls');
  console.log('   • User audio status visualization');
  console.log('   • Automatic permission management');
});

module.exports = { app, server, io };