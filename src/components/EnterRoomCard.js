// src/components/EnterRoomCard.js
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';

const EnterRoomCard = () => {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  
  const [formData, setFormData] = useState({
    roomId: '',
    roomPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (error) setError('');
  };

  const validateForm = () => {
    if (!isAuthenticated) {
      setError("Please log in to join a room");
      return false;
    }
    
    if (!formData.roomId.trim()) {
      setError("Room ID is required");
      return false;
    }
    
    if (!formData.roomPassword) {
      setError("Room password is required");
      return false;
    }
    
    return true;
  };

  const checkRoomExists = async (roomId) => {
    try {
      const response = await fetch(`http://192.168.1.13:4000/api/room/${roomId}`);
      
      if (response.ok) {
        const roomData = await response.json();
        return roomData;
      } else if (response.status === 404) {
        throw new Error('Room not found');
      } else {
        throw new Error('Failed to verify room');
      }
    } catch (err) {
      throw new Error(err.message || 'Failed to connect to server');
    }
  };

  const handleJoinRoom = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setError('');

    try {
      // First, check if the room exists
      const roomData = await checkRoomExists(formData.roomId.trim());
      
      console.log('Room found:', roomData);
      
      // If room exists, redirect to the room page with credentials
      // No need to pass username since it comes from the authenticated user
      router.push({
        pathname: `/room/${formData.roomId.trim()}`,
        query: {
          roomId: formData.roomId.trim(),
          roomPassword: formData.roomPassword,
          maxUsers: roomData.maxUsers,
        },
      });
      
    } catch (err) {
      setError(err.message || 'Failed to join room. Please try again.');
      console.error('Error joining room:', err);
    } finally {
      setLoading(false);
    }
  };

  const goToCreateRoom = () => {
    if (!isAuthenticated) {
      setError("Please log in to create a room");
      return;
    }
    router.push('/create-room');
  };

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="bg-black text-white p-6 rounded-lg shadow-lg max-w-md mx-auto">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🔐</div>
          <h3 className="text-2xl font-bold">Authentication Required</h3>
          <p className="text-gray-300 text-sm">Please log in to join or create rooms</p>
        </div>
        
        <div className="space-y-3">
          <button
            onClick={() => router.push('/login')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded font-semibold transition-colors"
          >
            Login
          </button>
          <button
            onClick={() => router.push('/signup')}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded font-semibold transition-colors"
          >
            Sign Up
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black text-white p-6 rounded-lg shadow-lg max-w-md mx-auto">
      <div className="text-center mb-6">
        <div className="text-4xl mb-2">🚪</div>
        <h3 className="text-2xl font-bold">Join Room</h3>
        <p className="text-gray-300 text-sm">
          Joining as: <span className="text-blue-400 font-semibold">{user?.firstName} {user?.lastName}</span>
        </p>
      </div>

      {error && (
        <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded mb-4">
          <p className="text-sm">{error}</p>
        </div>
      )}
      
      <div className="space-y-5">
        {/* Room ID */}
        <div>
          <label htmlFor="roomId" className="block text-sm font-medium mb-2">
            Room ID *
          </label>
          <input
            type="text"
            id="roomId"
            name="roomId"
            value={formData.roomId}
            onChange={handleInputChange}
            className="w-full p-3 bg-gray-800 text-white rounded border border-gray-700 focus:border-blue-500 focus:outline-none transition-colors"
            placeholder="Enter Room ID"
            required
            disabled={loading}
          />
          <p className="text-xs text-gray-400 mt-1">8-character room code</p>
        </div>

        {/* Room Password */}
        <div>
          <label htmlFor="roomPassword" className="block text-sm font-medium mb-2">
            Room Password *
          </label>
          <input
            type={showPassword ? 'text' : 'password'}
            id="roomPassword"
            name="roomPassword"
            value={formData.roomPassword}
            onChange={handleInputChange}
            className="w-full p-3 bg-gray-800 text-white rounded border border-gray-700 focus:border-blue-500 focus:outline-none transition-colors"
            placeholder="Enter Room Password"
            required
            disabled={loading}
          />
        </div>

        {/* Show Password Toggle */}
        <label className="flex items-center text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={showPassword}
            onChange={() => setShowPassword(!showPassword)}
            className="mr-2 w-4 h-4"
            disabled={loading}
          />
          Show password
        </label>

        {/* Submit Button */}
        <button
          onClick={handleJoinRoom}
          disabled={loading}
          className={`w-full py-3 rounded font-semibold transition-all duration-200 ${
            loading
              ? 'bg-gray-600 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 transform hover:scale-[1.02]'
          } text-white`}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Joining Room...
            </div>
          ) : (
            'Join Room'
          )}
        </button>
      </div>

      {/* Create Room Link */}
      <div className="mt-6 text-center">
        <p className="text-gray-400 text-sm mb-2">Don't have a room?</p>
        <button
          onClick={goToCreateRoom}
          className="text-blue-400 hover:text-blue-300 hover:underline transition-colors"
          disabled={loading}
        >
          Create New Room
        </button>
      </div>

      {/* Room ID Format Help */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          Room IDs are 8-character codes (e.g., "abc12345")
        </p>
      </div>
    </div>
  );
};

export default EnterRoomCard;