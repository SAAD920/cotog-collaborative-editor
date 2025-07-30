// src/components/Chat.js - FIXED VERSION WITH PROPER SCROLLING
import React, { useState, useRef, useEffect } from 'react';
import { useRoom } from '@/contexts/RoomContext';

const Chat = () => {
  const { 
    messages, 
    sendMessage, 
    sendTyping,
    currentUser,
    users,
    typingUsers,
    isConnected,
    roomInfo 
  } = useRoom();

  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end'
      });
    }
  };

  // Scroll to bottom on new messages and component mount
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initial scroll to bottom when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Handle message input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    setMessage(value);

    // Send typing indicator
    if (value.trim() && !isTyping) {
      setIsTyping(true);
      sendTyping(true);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      sendTyping(false);
    }, 1000);
  };

  // Handle message submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (message.trim() && isConnected) {
      const success = sendMessage(message);
      if (success) {
        setMessage('');
        setIsTyping(false);
        sendTyping(false);
        
        // Clear typing timeout
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
      }
    }
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Get message style based on type
  const getMessageStyle = (msg) => {
    if (msg.type === 'system') {
      return 'bg-blue-50 text-blue-700 text-center italic text-sm py-2 px-3 mx-2';
    }
    if (msg.sender === currentUser) {
      return 'bg-green-50 border-l-4 border-green-400 ml-4 mr-2';
    }
    return 'bg-gray-50 mr-4 ml-2';
  };

  // Get sender color
  const getSenderColor = (sender) => {
    if (sender === currentUser) return 'text-green-600';
    if (sender === 'System') return 'text-blue-600';
    return 'text-purple-600';
  };

  return (
    <div className="h-full bg-white flex flex-col">
      {/* Chat Header - Fixed height */}
      <div className="flex-shrink-0 bg-gray-100 border-b border-gray-200 px-3 py-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-800 flex items-center">
            💬 Team Chat
          </h3>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-xs text-gray-600">
              {users.length} online
            </span>
          </div>
        </div>

        {/* Room Info - Compact */}
        {roomInfo && (
          <div className="mt-1 text-xs text-gray-600 truncate">
            <span className="font-medium">{roomInfo.roomName}</span>
            {roomInfo.description && (
              <span className="ml-1 text-gray-500">• {roomInfo.description}</span>
            )}
          </div>
        )}
      </div>

      {/* Online Users - Collapsible, Fixed height */}
      <div className="flex-shrink-0 bg-gray-50 border-b border-gray-200 px-3 py-2 max-h-16 overflow-hidden">
        <div className="flex flex-wrap gap-1">
          {users.slice(0, 4).map((user, index) => (
            <div
              key={index}
              className="flex items-center space-x-1 bg-white px-2 py-1 rounded-full text-xs border border-gray-200"
            >
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
              <span className={`font-medium ${user.username === currentUser ? 'text-green-600' : 'text-gray-700'}`}>
                {user.username.length > 8 ? user.username.substring(0, 8) + '...' : user.username}
                {user.role === 'owner' && ' 👑'}
                {user.role === 'moderator' && ' 🛡️'}
              </span>
            </div>
          ))}
          {users.length > 4 && (
            <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              +{users.length - 4} more
            </div>
          )}
        </div>
      </div>

      {/* Messages Area - Scrollable with fixed height */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto min-h-0 px-2 py-2 space-y-2"
        style={{
          maxHeight: 'calc(100% - 140px)', // Reserve space for header, users, and input
          scrollBehavior: 'smooth'
        }}
      >
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8 px-4">
            <div className="text-2xl mb-2">💬</div>
            <p className="text-sm font-medium">Welcome to the chat!</p>
            <p className="text-xs">Start the conversation with your team.</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={msg.id || index}
              className={`p-2 rounded-lg transition-all duration-200 ${getMessageStyle(msg)}`}
            >
              {msg.type !== 'system' && (
                <div className="flex items-center justify-between mb-1">
                  <span className={`font-semibold text-xs ${getSenderColor(msg.sender)}`}>
                    {msg.sender}
                    {msg.senderRole === 'owner' && ' 👑'}
                    {msg.senderRole === 'moderator' && ' 🛡️'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
              )}
              <div className={`${msg.type === 'system' ? 'text-xs' : 'text-sm'} break-words`}>
                {msg.message}
              </div>
              {msg.type === 'system' && (
                <div className="text-xs text-gray-400 mt-1 text-center">
                  {formatTime(msg.timestamp)}
                </div>
              )}
            </div>
          ))
        )}

        {/* Typing Indicators */}
        {typingUsers.length > 0 && (
          <div className="flex items-center space-x-2 text-xs text-gray-500 bg-gray-50 p-2 rounded-lg mx-2">
            <div className="flex space-x-1">
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
            <span>
              {typingUsers.length === 1 
                ? `${typingUsers[0]} is typing...`
                : `${typingUsers.slice(0, -1).join(', ')} and ${typingUsers[typingUsers.length - 1]} are typing...`
              }
            </span>
          </div>
        )}

        {/* Scroll anchor - This ensures auto-scroll to bottom */}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input - Fixed at bottom */}
      <div className="flex-shrink-0 border-t border-gray-200 p-3">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={message}
              onChange={handleInputChange}
              placeholder={isConnected ? "Type a message..." : "Connecting..."}
              disabled={!isConnected}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              maxLength={500}
            />
            {message.length > 400 && (
              <div className="absolute -top-5 right-0 text-xs text-gray-500">
                {message.length}/500
              </div>
            )}
          </div>
          <button
            type="submit"
            disabled={!message.trim() || !isConnected}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            <span className="hidden sm:inline text-sm">Send</span>
          </button>
        </form>

        {/* Connection Status */}
        {!isConnected && (
          <div className="mt-2 text-center">
            <div className="inline-flex items-center space-x-2 text-xs text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full">
              <div className="animate-spin rounded-full h-3 w-3 border border-yellow-600 border-t-transparent"></div>
              <span>Reconnecting to chat...</span>
            </div>
          </div>
        )}

        {/* Chat Guidelines */}
        <div className="mt-2 text-center">
          <span className="text-xs text-gray-500">💡 Tip: Use chat to coordinate your coding session!</span>
        </div>
      </div>
    </div>
  );
};

export default Chat;