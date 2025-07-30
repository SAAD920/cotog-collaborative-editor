// src/pages/room/[roomId].js - COMPLETE UPDATED VERSION WITH FIXED LAYOUT
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Navbar from '@/components/Navbar';
import CollaborativeCodeEditor from '@/components/CollaborativeCodeEditor';
import Chat from '@/components/Chat';
import Audio from '@/components/Audio';
import { useAuth, ProtectedRoute } from '@/contexts/AuthContext';
import { RoomProvider, useRoom } from '@/contexts/RoomContext';

// Room content component (uses RoomContext)
const RoomContent = () => {
  const router = useRouter();
  const { roomId } = router.query;
  const { user } = useAuth();
  const { 
    isLoading, 
    error, 
    isConnected, 
    roomInfo, 
    users, 
    joinRoom, 
    leaveRoom,
    currentUser,
    userRole
  } = useRoom();

  const [debugInfo, setDebugInfo] = useState([]);
  const [hasTriedJoin, setHasTriedJoin] = useState(false);

  // Debug logging function
  const addDebugLog = (message) => {
    console.log(`🐛 [Room Debug]: ${message}`);
    setDebugInfo(prev => [...prev.slice(-9), `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  // Auto-join room when component mounts
  useEffect(() => {
    addDebugLog(`useEffect triggered - roomId: ${roomId}, user: ${!!user}, hasTriedJoin: ${hasTriedJoin}`);
    
    if (roomId && user && router.query.roomPassword && !hasTriedJoin) {
      const { roomPassword } = router.query;
      
      addDebugLog(`Attempting to join room: ${roomId} with password: ${roomPassword ? 'PROVIDED' : 'MISSING'}`);
      setHasTriedJoin(true);
      
      joinRoom(roomId, roomPassword)
        .then(success => {
          addDebugLog(`Join room result: ${success}`);
        })
        .catch(err => {
          addDebugLog(`Join room error: ${err.message}`);
        });
    } else {
      addDebugLog(`Join conditions not met: roomId=${!!roomId}, user=${!!user}, password=${!!router.query.roomPassword}, hasTriedJoin=${hasTriedJoin}`);
    }
  }, [roomId, user, router.query.roomPassword, hasTriedJoin, joinRoom]);

  // Debug current state
  useEffect(() => {
    addDebugLog(`State update - isLoading: ${isLoading}, isConnected: ${isConnected}, error: ${error}, roomInfo: ${!!roomInfo}`);
  }, [isLoading, isConnected, error, roomInfo]);

  // Loading state with debug info
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Joining Room</h2>
            <p className="text-gray-600 mb-4">Connecting to collaborative workspace...</p>
            
            {/* Debug Information */}
            <div className="bg-gray-50 rounded-lg p-4 text-left">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">🐛 Debug Info:</h3>
              <div className="space-y-1 text-xs text-gray-600 max-h-32 overflow-y-auto">
                <div>Room ID: {roomId || 'Not set'}</div>
                <div>User: {user?.username || 'Not authenticated'}</div>
                <div>Password: {router.query.roomPassword ? 'Provided' : 'Missing'}</div>
                <div>Has Tried Join: {hasTriedJoin.toString()}</div>
                <div>Is Connected: {isConnected.toString()}</div>
                <div>Current User: {currentUser || 'None'}</div>
                <div className="border-t pt-2 mt-2">
                  <div className="font-semibold">Recent logs:</div>
                  {debugInfo.slice(-5).map((log, i) => (
                    <div key={i} className="text-xs">{log}</div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-1 text-sm text-gray-500">
              <p>🔌 Establishing connection...</p>
              <p>💬 Initializing chat...</p>
              <p>💻 Loading code editor...</p>
              <p>🎵 Setting up audio...</p>
            </div>

            {/* Emergency Actions */}
            <div className="mt-6 space-x-2">
              <button
                onClick={() => {
                  addDebugLog('Manual refresh triggered');
                  window.location.reload();
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
              >
                🔄 Refresh
              </button>
              <button
                onClick={() => {
                  addDebugLog('Manual retry triggered');
                  setHasTriedJoin(false);
                }}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm"
              >
                🔁 Retry Join
              </button>
              <button
                onClick={() => router.push('/')}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm"
              >
                🏠 Go Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold mb-2 text-red-600">Connection Error</h2>
            <p className="text-gray-700 mb-6">{error}</p>
            
            {/* Debug Information for Errors */}
            <div className="bg-red-50 rounded-lg p-4 text-left mb-6">
              <h3 className="text-sm font-semibold text-red-700 mb-2">🐛 Error Debug:</h3>
              <div className="space-y-1 text-xs text-red-600">
                <div>Room ID: {roomId}</div>
                <div>User: {user?.username}</div>
                <div>Auth Token: {localStorage.getItem('auth_token') ? 'Present' : 'Missing'}</div>
                <div>Server URL: http://localhost:4000</div>
                <div className="border-t pt-2 mt-2">
                  <div className="font-semibold">Debug logs:</div>
                  {debugInfo.map((log, i) => (
                    <div key={i} className="text-xs">{log}</div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => {
                  addDebugLog('Retry button clicked');
                  setHasTriedJoin(false);
                  window.location.reload();
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors mr-3"
              >
                🔄 Try Again
              </button>
              <button
                onClick={() => router.push('/')}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                🏠 Go Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main room interface
  return (
    <div className="min-h-screen bg-gray-100 room-page">
      <Navbar />
      
      {/* Room Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                  {roomInfo?.roomName || `Room ${roomId}`}
                  {userRole === 'owner' && <span className="ml-2 text-lg">👑</span>}
                  {userRole === 'moderator' && <span className="ml-2 text-lg">🛡️</span>}
                </h1>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span className="flex items-center">
                    {isConnected ? (
                      <span className="text-green-600 flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                        Connected
                      </span>
                    ) : (
                      <span className="text-red-600 flex items-center">
                        <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                        Disconnected
                      </span>
                    )}
                  </span>
                  {roomInfo && (
                    <>
                      <span>👥 {users.length}/{roomInfo.maxUsers} users</span>
                      <span>👤 Created by {roomInfo.createdBy}</span>
                      {roomInfo.isPrivate && <span>🔒 Private</span>}
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                Room ID: <code className="font-mono font-semibold">{roomId}</code>
              </div>
              <button
                onClick={leaveRoom}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center space-x-2"
              >
                <span>🚪</span>
                <span>Leave Room</span>
              </button>
            </div>
          </div>
          
          {roomInfo?.description && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-blue-800 text-sm">
                <span className="font-semibold">Description:</span> {roomInfo.description}
              </p>
            </div>
          )}

          {/* Debug Panel (can be removed in production) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <details className="text-sm">
                <summary className="font-semibold text-yellow-800 cursor-pointer">🐛 Debug Info</summary>
                <div className="mt-2 space-y-1 text-yellow-700 text-xs">
                  <div>Connected: {isConnected.toString()}</div>
                  <div>Current User: {currentUser}</div>
                  <div>User Role: {userRole}</div>
                  <div>Users Count: {users.length}</div>
                  <div>Room Loaded: {!!roomInfo}</div>
                  <div className="max-h-20 overflow-y-auto">
                    Recent logs: {debugInfo.slice(-3).join(' | ')}
                  </div>
                </div>
              </details>
            </div>
          )}
        </div>
      </div>

      {/* Room Content Layout - UPDATED WITH NEW CSS CLASSES */}
      <div className="container mx-auto p-4 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 room-content" style={{ height: 'calc(100vh - 320px)' }}>
          
          {/* Left Sidebar - Chat and Audio with Fixed Heights */}
          <div className="lg:col-span-1 room-sidebar">
            
            {/* Chat Component - Uses chat-container class for fixed height */}
            <div className="chat-container">
              <Chat />
            </div>

            {/* Audio Component - Uses audio-container class for fixed height */}
            <div className="audio-container">
              <Audio />
            </div>
            
          </div>

          {/* Main Content - Code Editor */}
          <div className="lg:col-span-3 h-full">
            <div className="h-full bg-white rounded-lg shadow-lg overflow-hidden">
              <CollaborativeCodeEditor />
            </div>
          </div>
          
        </div>
      </div>

      {/* Room Status Bar - Enhanced and more responsive */}
      <div id="room-status-bar" className="fixed bottom-0 left-0 right-0 bg-gray-800 text-white py-2 px-4 z-50 transition-transform duration-300">
        <div className="container mx-auto">
          {/* Enhanced Status Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="flex items-center">
                <div className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
                <span className="text-sm font-medium">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </span>
              <span className="text-sm">Room: <code className="bg-gray-700 px-1 rounded">{roomId}</code></span>
              <span className="text-sm hidden md:inline">User: <span className="font-medium">{currentUser}</span></span>
              <span className="text-sm hidden lg:inline">Role: <span className="capitalize font-medium">{userRole}</span></span>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm">👥 {users.length} online</span>
              {roomInfo && (
                <span className="text-sm hidden sm:inline">
                  {roomInfo.maxUsers} max
                </span>
              )}
              
              {/* Status Bar Controls */}
              <div className="flex items-center space-x-2">
                {/* Connection Indicator */}
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} 
                     title={isConnected ? 'Connected to room' : 'Disconnected from room'}>
                </div>
                
                {/* Minimize Button */}
                <button 
                  onClick={() => {
                    const statusBar = document.getElementById('room-status-bar');
                    const isMinimized = statusBar.classList.contains('minimized');
                    if (isMinimized) {
                      statusBar.classList.remove('minimized');
                      statusBar.style.transform = 'translateY(0)';
                    } else {
                      statusBar.classList.add('minimized');
                      statusBar.style.transform = 'translateY(calc(100% - 8px))';
                    }
                  }}
                  className="text-xs hover:bg-gray-700 px-2 py-1 rounded transition-colors"
                  title="Minimize/Maximize status bar"
                >
                  ⬇️
                </button>
                
                {/* Quick Leave Button */}
                <button
                  onClick={leaveRoom}
                  className="text-xs hover:bg-red-600 bg-red-700 px-2 py-1 rounded transition-colors"
                  title="Leave room"
                >
                  🚪
                </button>
              </div>
            </div>
          </div>
          
          {/* Additional Status Info (visible when expanded) */}
          <div className="mt-1 text-xs text-gray-300 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {roomInfo && (
                <>
                  <span>📝 {roomInfo.roomName}</span>
                  {roomInfo.isPrivate && <span>🔒 Private</span>}
                </>
              )}
            </div>
            <div className="flex items-center space-x-2 text-xs">
              <span>Server: localhost:4000</span>
              <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main room page component
const RoomPage = () => {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent(router.asPath)}`);
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <RoomProvider>
        <RoomContent />
      </RoomProvider>
    </ProtectedRoute>
  );
};

export default RoomPage;