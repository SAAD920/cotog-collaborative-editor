// src/pages/create-room.js - REPLACE your existing file with this complete version
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Navbar from '@/components/Navbar';
import { useAuth, ProtectedRoute } from '@/contexts/AuthContext';

const CreateRoomPage = () => {
  const router = useRouter();
  const { user, authenticatedFetch } = useAuth();
  
  const [formData, setFormData] = useState({
    roomName: '',
    maxUsers: 2,
    roomPassword: '',
    confirmPassword: '',
    isPrivate: true,
    description: ''
  });
  
  const [roomData, setRoomData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (name === 'maxUsers' ? Number(value) : value)
    }));
    
    // Clear error when user starts typing
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.roomName.trim()) {
      setError("Room name is required");
      return false;
    }
    
    if (formData.roomName.length < 3) {
      setError("Room name must be at least 3 characters");
      return false;
    }
    
    if (!formData.roomPassword) {
      setError("Room password is required");
      return false;
    }
    
    if (formData.roomPassword.length < 4) {
      setError("Password must be at least 4 characters");
      return false;
    }
    
    if (formData.roomPassword !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    
    return true;
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setError('');

    try {
      const response = await authenticatedFetch('/api/rooms/create', {
        method: 'POST',
        body: JSON.stringify({
          roomName: formData.roomName.trim(),
          password: formData.roomPassword,
          maxUsers: formData.maxUsers,
          isPrivate: formData.isPrivate,
          description: formData.description.trim(),
          createdBy: user.id
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create room');
      }

      setRoomData(data.roomData);
      console.log('Room created successfully:', data);
      
    } catch (err) {
      setError(err.message || 'Failed to create room. Please try again.');
      console.error('Error creating room:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyRoomLink = async () => {
    if (!roomData) return;
    
    const roomLink = `${window.location.origin}/room/${roomData.roomId}`;
    
    try {
      await navigator.clipboard.writeText(roomLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = roomLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const joinRoom = () => {
    if (!roomData) return;
    
    router.push({
      pathname: `/room/${roomData.roomId}`,
      query: {
        username: user.username,
        roomId: roomData.roomId,
        roomPassword: formData.roomPassword,
        maxUsers: formData.maxUsers,
      },
    });
  };

  const createAnotherRoom = () => {
    setRoomData(null);
    setFormData({
      roomName: '',
      maxUsers: 2,
      roomPassword: '',
      confirmPassword: '',
      isPrivate: true,
      description: ''
    });
    setError('');
  };

  // Success view after room creation
  if (roomData) {
    return (
      <ProtectedRoute>
        <div>
          <Navbar />
          <div className="container mx-auto p-4">
            <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-lg max-w-md mx-auto mt-10">
              <div className="text-center mb-6">
                <div className="text-4xl mb-2">🎉</div>
                <h1 className="text-2xl font-bold text-green-600 mb-2">Room Created!</h1>
                <p className="text-gray-600">Your collaboration room is ready</p>
              </div>

              <div className="space-y-4 mb-6">
                <div className="bg-gray-50 p-4 rounded border">
                  <h3 className="font-semibold mb-2 text-gray-800">Room Details:</h3>
                  <div className="space-y-1 text-sm">
                    <p><strong>Room Name:</strong> {roomData.roomName}</p>
                    <p><strong>Room ID:</strong> <code className="bg-gray-200 px-1 rounded">{roomData.roomId}</code></p>
                    <p><strong>Max Users:</strong> {roomData.maxUsers}</p>
                    <p><strong>Created by:</strong> {user.firstName} {user.lastName}</p>
                    <p><strong>Privacy:</strong> {formData.isPrivate ? 'Private' : 'Public'}</p>
                    {formData.description && (
                      <p><strong>Description:</strong> {formData.description}</p>
                    )}
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded border border-blue-200">
                  <h3 className="font-semibold mb-2 text-blue-800">Share this link:</h3>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={`${window.location.origin}/room/${roomData.roomId}`}
                      readOnly
                      className="flex-1 p-2 bg-white border border-blue-300 text-gray-700 rounded text-sm"
                    />
                    <button
                      onClick={copyRoomLink}
                      className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                        copied 
                          ? 'bg-green-500 text-white' 
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      {copied ? '✓ Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={joinRoom}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded font-semibold transition-colors"
                >
                  Join Room Now
                </button>
                
                <button
                  onClick={createAnotherRoom}
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 rounded transition-colors"
                >
                  Create Another Room
                </button>
                
                <button
                  onClick={() => router.push('/')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition-colors"
                >
                  Back to Home
                </button>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // Room creation form
  return (
    <ProtectedRoute>
      <div>
        <Navbar />
        <div className="container mx-auto p-4">
          <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-lg max-w-md mx-auto mt-10">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold mb-2 text-gray-800">Create Collaboration Room</h1>
              <p className="text-gray-600">Set up a new room for real-time coding collaboration</p>
            </div>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-red-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            )}
            
            <form onSubmit={handleCreateRoom} className="space-y-5">
              {/* Room Name */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Room Name *
                </label>
                <input
                  type="text"
                  name="roomName"
                  value={formData.roomName}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 text-gray-900 rounded-md focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                  placeholder="Enter a descriptive room name"
                  required
                  disabled={loading}
                  maxLength="50"
                />
                <p className="text-xs text-gray-500 mt-1">3-50 characters</p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Description (Optional)
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full p-3 border border-gray-300 text-gray-900 rounded-md focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                  placeholder="Describe what this room is for..."
                  disabled={loading}
                  maxLength="200"
                />
                <p className="text-xs text-gray-500 mt-1">Up to 200 characters</p>
              </div>

              {/* Max Users */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Maximum Users
                </label>
                <select
                  name="maxUsers"
                  value={formData.maxUsers}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 text-gray-900 rounded-md focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                  disabled={loading}
                >
                  {[2, 3, 4, 5, 6, 8, 10].map(n => (
                    <option key={n} value={n}>{n} users</option>
                  ))}
                </select>
              </div>

              {/* Privacy Setting */}
              <div className="flex items-center">
                <input
                  id="isPrivate"
                  name="isPrivate"
                  type="checkbox"
                  checked={formData.isPrivate}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={loading}
                />
                <label htmlFor="isPrivate" className="ml-2 block text-sm text-gray-900">
                  Private room (requires invitation link)
                </label>
              </div>

              {/* Room Password */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Room Password *
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="roomPassword"
                  value={formData.roomPassword}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 text-gray-900 rounded-md focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                  placeholder="Create a secure password"
                  required
                  disabled={loading}
                  minLength="4"
                />
                <p className="text-xs text-gray-500 mt-1">At least 4 characters</p>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Confirm Password *
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 text-gray-900 rounded-md focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                  placeholder="Confirm your password"
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
                Show passwords
              </label>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 rounded font-semibold transition-all duration-200 ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed text-white'
                    : 'bg-blue-600 hover:bg-blue-700 transform hover:scale-[1.02] text-white'
                } focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Creating Room...
                  </div>
                ) : (
                  'Create Room'
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                Only authenticated users can create and join rooms.
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Share the room link with team members to collaborate!
              </p>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default CreateRoomPage;
