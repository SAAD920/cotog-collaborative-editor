// src/components/Audio.js - ENHANCED VERSION WITH PERMISSION SYSTEM
import React, { useState, useEffect, useRef } from 'react';
import { useRoom } from '@/contexts/RoomContext';

const Audio = () => {
  const { 
    toggleAudio, 
    toggleMute, 
    audioConnected, 
    isMuted, 
    audioUsers, 
    isConnected,
    currentUser,
    users,
    isRoomOwner,
    isRoomModerator,
    sendAudioPermissionRequest,
    sendAudioPermissionResponse,
    audioPermissions,
    pendingAudioRequests,
    speakingUsers
  } = useRoom();

  const [isSupported, setIsSupported] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState('prompt');
  const [deviceError, setDeviceError] = useState('');
  const [availableDevices, setAvailableDevices] = useState([]);
  const [showPermissionPanel, setShowPermissionPanel] = useState(false);
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);
  const [audioLevels, setAudioLevels] = useState({});
  const [selectedDevice, setSelectedDevice] = useState('default');

  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const streamRef = useRef(null);

  // Check if audio is supported and enumerate devices
  useEffect(() => {
    const checkAudioSupport = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setIsSupported(false);
          setDeviceError('Media devices not supported in this browser');
          return;
        }

        setIsSupported(true);

        // Check for available audio input devices
        try {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const audioInputs = devices.filter(device => device.kind === 'audioinput');
          setAvailableDevices(audioInputs);
          
          if (audioInputs.length === 0) {
            setDeviceError('No microphone devices found on this system');
            setPermissionStatus('no-device');
          } else {
            setDeviceError('');
            console.log('Found audio devices:', audioInputs.map(d => d.label || 'Unknown device'));
          }
        } catch (enumError) {
          console.warn('Could not enumerate devices:', enumError);
          setDeviceError('Unable to detect audio devices');
        }
      } catch (error) {
        console.error('Audio support check failed:', error);
        setIsSupported(false);
        setDeviceError('Audio system initialization failed');
      }
    };

    checkAudioSupport();
  }, []);

  // Audio level monitoring
  useEffect(() => {
    if (audioConnected && streamRef.current) {
      setupAudioAnalysis();
    }
    
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [audioConnected]);

  const setupAudioAnalysis = () => {
    try {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      
      const source = audioContextRef.current.createMediaStreamSource(streamRef.current);
      source.connect(analyserRef.current);
      
      analyserRef.current.fftSize = 256;
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      const updateAudioLevel = () => {
        if (analyserRef.current) {
          analyserRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
          const normalizedLevel = Math.min(100, (average / 128) * 100);
          
          setAudioLevels(prev => ({
            ...prev,
            [currentUser]: normalizedLevel
          }));
          
          requestAnimationFrame(updateAudioLevel);
        }
      };
      
      updateAudioLevel();
    } catch (error) {
      console.error('Audio analysis setup failed:', error);
    }
  };

  // Request microphone permission with better error handling
  const requestMicrophonePermission = async () => {
    try {
      setDeviceError('');
      
      if (availableDevices.length === 0) {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioInputs = devices.filter(device => device.kind === 'audioinput');
        
        if (audioInputs.length === 0) {
          setDeviceError('No microphone found. Please connect a microphone and refresh.');
          setPermissionStatus('no-device');
          return false;
        }
      }

      const constraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          deviceId: selectedDevice !== 'default' ? { exact: selectedDevice } : undefined
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      setPermissionStatus('granted');
      setDeviceError('');
      return true;
      
    } catch (error) {
      console.error('Microphone permission error:', error);
      
      switch (error.name) {
        case 'NotFoundError':
          setDeviceError('No microphone found. Please connect a microphone and try again.');
          setPermissionStatus('no-device');
          break;
        case 'NotAllowedError':
          setDeviceError('Microphone access denied. Please allow microphone access in your browser settings.');
          setPermissionStatus('denied');
          break;
        case 'NotReadableError':
          setDeviceError('Microphone is being used by another application.');
          setPermissionStatus('busy');
          break;
        case 'OverconstrainedError':
          setDeviceError('Microphone does not meet the required specifications.');
          setPermissionStatus('incompatible');
          break;
        default:
          setDeviceError(`Microphone error: ${error.message}`);
          setPermissionStatus('error');
      }
      return false;
    }
  };

  // Handle audio permission request
  const handleAudioPermissionRequest = async () => {
    if (!isSupported) {
      alert('Audio is not supported in your browser');
      return;
    }

    if (availableDevices.length === 0) {
      alert('No microphone found. Please connect a microphone and refresh the page.');
      return;
    }

    // Check if user already has permission
    const hasPermission = audioPermissions?.[currentUser];
    
    if (isRoomOwner() || isRoomModerator()) {
      // Room owner/moderator can enable audio directly
      const micPermission = await requestMicrophonePermission();
      if (micPermission) {
        toggleAudio();
      }
    } else if (hasPermission) {
      // User has permission, can toggle directly
      if (!audioConnected) {
        const micPermission = await requestMicrophonePermission();
        if (micPermission) {
          toggleAudio();
        }
      } else {
        toggleAudio();
      }
    } else {
      // Request permission from room owner
      setIsRequestingPermission(true);
      sendAudioPermissionRequest();
    }
  };

  // Handle permission response (owner/moderator only)
  const handlePermissionResponse = (username, granted) => {
    sendAudioPermissionResponse(username, granted);
  };

  // Handle mute toggle
  const handleToggleMute = () => {
    if (audioConnected) {
      toggleMute();
    }
  };

  // Get audio status for user
  const getUserAudioStatus = (username) => {
    const isConnected = audioUsers.some(u => u.username === username);
    const isSpeaking = speakingUsers?.includes(username);
    const hasPermission = audioPermissions?.[username];
    const audioLevel = audioLevels[username] || 0;
    
    return {
      isConnected,
      isSpeaking,
      hasPermission,
      audioLevel
    };
  };

  // Get device status message
  const getDeviceStatusMessage = () => {
    if (!isSupported) return 'Audio not supported';
    if (permissionStatus === 'no-device') return 'No microphone found';
    if (permissionStatus === 'denied') return 'Permission denied';
    if (permissionStatus === 'busy') return 'Microphone in use';
    if (permissionStatus === 'incompatible') return 'Incompatible device';
    if (permissionStatus === 'error') return 'Device error';
    if (audioConnected) return 'Audio active';
    if (isRequestingPermission) return 'Requesting permission...';
    return 'Ready to connect';
  };

  return (
    <div className="h-full bg-white border-t border-gray-200 flex flex-col">
      {/* Audio Header */}
      <div className="bg-gray-100 border-b border-gray-200 px-3 py-2 flex-shrink-0">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-800 flex items-center">
            🎵 Voice Chat
            <div className={`ml-auto w-2 h-2 rounded-full ${audioConnected ? 'bg-green-500' : 'bg-gray-400'}`}></div>
          </h3>
          {(isRoomOwner() || isRoomModerator()) && pendingAudioRequests?.length > 0 && (
            <button
              onClick={() => setShowPermissionPanel(!showPermissionPanel)}
              className="text-xs bg-orange-500 text-white px-2 py-1 rounded-full hover:bg-orange-600 transition-colors"
            >
              {pendingAudioRequests.length} requests
            </button>
          )}
        </div>
      </div>

      {/* Permission Panel (Owner/Moderator only) */}
      {showPermissionPanel && (isRoomOwner() || isRoomModerator()) && (
        <div className="bg-orange-50 border-b border-orange-200 p-3">
          <div className="text-sm font-medium text-orange-800 mb-2">🎤 Audio Permission Requests:</div>
          <div className="space-y-2">
            {pendingAudioRequests?.map((request, index) => (
              <div key={index} className="flex items-center justify-between bg-white p-2 rounded border border-orange-200">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {request.username.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium">{request.username}</span>
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => handlePermissionResponse(request.username, true)}
                    className="bg-green-500 hover:bg-green-600 text-white text-xs px-2 py-1 rounded transition-colors"
                  >
                    ✓ Allow
                  </button>
                  <button
                    onClick={() => handlePermissionResponse(request.username, false)}
                    className="bg-red-500 hover:bg-red-600 text-white text-xs px-2 py-1 rounded transition-colors"
                  >
                    ✗ Deny
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Audio Content - User List */}
      <div className="flex-1 p-3 overflow-y-auto">
        <div className="space-y-3">
          {/* Device Status */}
          <div className="text-center">
            <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs ${
              audioConnected ? 'bg-green-100 text-green-700' : 
              isRequestingPermission ? 'bg-yellow-100 text-yellow-700' :
              permissionStatus === 'no-device' ? 'bg-red-100 text-red-700' :
              permissionStatus === 'denied' ? 'bg-yellow-100 text-yellow-700' :
              'bg-gray-100 text-gray-600'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                audioConnected ? 'bg-green-500' : 
                isRequestingPermission ? 'bg-yellow-500 animate-pulse' :
                permissionStatus === 'no-device' ? 'bg-red-500' :
                permissionStatus === 'denied' ? 'bg-yellow-500' :
                'bg-gray-400'
              }`}></div>
              <span>{getDeviceStatusMessage()}</span>
            </div>
          </div>

          {/* Users Audio Status List */}
          <div>
            <div className="text-xs font-medium text-gray-700 mb-2 flex items-center justify-between">
              <span>👥 Users ({users.length})</span>
              {audioUsers.length > 0 && (
                <span className="text-green-600">{audioUsers.length} connected</span>
              )}
            </div>
            
            <div className="space-y-1">
              {users.map((user, index) => {
                const audioStatus = getUserAudioStatus(user.username);
                const isCurrentUser = user.username === currentUser;
                
                return (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-2 rounded-lg border transition-all duration-200 ${
                      audioStatus.isSpeaking 
                        ? 'bg-green-50 border-green-200 shadow-sm' 
                        : audioStatus.isConnected 
                        ? 'bg-blue-50 border-blue-200' 
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center space-x-2 flex-1">
                      {/* User Avatar */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold relative ${
                        audioStatus.isSpeaking ? 'bg-green-500' : 
                        audioStatus.isConnected ? 'bg-blue-500' : 
                        'bg-gray-400'
                      }`}>
                        {user.username.charAt(0).toUpperCase()}
                        
                        {/* Speaking indicator */}
                        {audioStatus.isSpeaking && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                        )}
                        
                        {/* Audio level indicator */}
                        {audioStatus.isConnected && audioStatus.audioLevel > 5 && (
                          <div 
                            className="absolute inset-0 rounded-full border-2 border-green-400 animate-pulse"
                            style={{
                              opacity: Math.min(1, audioStatus.audioLevel / 50)
                            }}
                          ></div>
                        )}
                      </div>
                      
                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-1">
                          <span className={`text-sm font-medium truncate ${
                            isCurrentUser ? 'text-green-600' : 'text-gray-700'
                          }`}>
                            {user.username}
                            {isCurrentUser && ' (You)'}
                          </span>
                          
                          {/* Role badges */}
                          {user.role === 'owner' && <span className="text-xs">👑</span>}
                          {user.role === 'moderator' && <span className="text-xs">🛡️</span>}
                        </div>
                        
                        {/* Audio status */}
                        <div className="text-xs text-gray-500">
                          {audioStatus.isSpeaking ? (
                            <span className="text-green-600 font-medium">🎙️ Speaking</span>
                          ) : audioStatus.isConnected ? (
                            <span className="text-blue-600">🔗 Connected</span>
                          ) : audioStatus.hasPermission ? (
                            <span className="text-gray-600">✓ Permitted</span>
                          ) : (
                            <span className="text-gray-400">⚪ Offline</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Audio Controls (for current user) */}
                    {isCurrentUser && audioStatus.isConnected && (
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={handleToggleMute}
                          className={`p-1 rounded text-xs transition-colors ${
                            isMuted 
                              ? 'bg-red-500 hover:bg-red-600 text-white' 
                              : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                          }`}
                          title={isMuted ? 'Unmute' : 'Mute'}
                        >
                          {isMuted ? '🔇' : '🎙️'}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Device Error Display */}
          {deviceError && (
            <div className="bg-red-50 border border-red-200 rounded p-2">
              <div className="text-xs text-red-800">
                <div className="flex items-center space-x-1 mb-1">
                  <span>⚠️</span>
                  <span className="font-medium">Device Issue:</span>
                </div>
                <p>{deviceError}</p>
              </div>
            </div>
          )}

          {/* Device Selection */}
          {availableDevices.length > 1 && (isRoomOwner() || isRoomModerator() || audioPermissions?.[currentUser]) && (
            <div className="bg-blue-50 border border-blue-200 rounded p-2">
              <div className="text-xs text-blue-800">
                <div className="font-medium mb-1">🎙️ Microphone:</div>
                <select
                  value={selectedDevice}
                  onChange={(e) => setSelectedDevice(e.target.value)}
                  className="w-full text-xs p-1 border border-blue-300 rounded bg-white"
                  disabled={audioConnected}
                >
                  <option value="default">Default Microphone</option>
                  {availableDevices.map((device, index) => (
                    <option key={device.deviceId} value={device.deviceId}>
                      {device.label || `Microphone ${index + 1}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Audio Permissions Info */}
          {!isRoomOwner() && !isRoomModerator() && !audioPermissions?.[currentUser] && !isRequestingPermission && (
            <div className="bg-yellow-50 border border-yellow-200 rounded p-2">
              <div className="text-xs text-yellow-800">
                <div className="font-medium mb-1">🔒 Permission Required:</div>
                <p>You need permission from the room owner to use voice chat.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Audio Controls - Fixed at bottom */}
      <div className="flex-shrink-0 p-3 border-t border-gray-200 space-y-2">
        {/* Main Audio Toggle */}
        <button
          onClick={handleAudioPermissionRequest}
          disabled={!isConnected || !isSupported || permissionStatus === 'no-device' || isRequestingPermission}
          className={`w-full py-2 px-3 rounded text-sm font-medium transition-colors duration-200 ${
            audioConnected
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : isRequestingPermission
              ? 'bg-yellow-500 text-white cursor-not-allowed'
              : permissionStatus === 'no-device' 
              ? 'bg-gray-400 cursor-not-allowed text-white'
              : 'bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-400 disabled:cursor-not-allowed'
          }`}
        >
          {audioConnected ? (
            <span className="flex items-center justify-center space-x-1">
              <span>🔌</span>
              <span>Disconnect</span>
            </span>
          ) : isRequestingPermission ? (
            <span className="flex items-center justify-center space-x-1">
              <div className="animate-spin rounded-full h-3 w-3 border border-white border-t-transparent"></div>
              <span>Requesting...</span>
            </span>
          ) : permissionStatus === 'no-device' ? (
            <span className="flex items-center justify-center space-x-1">
              <span>🚫</span>
              <span>No Microphone</span>
            </span>
          ) : (
            <span className="flex items-center justify-center space-x-1">
              <span>🎙️</span>
              <span>
                {isRoomOwner() || isRoomModerator() 
                  ? 'Connect Audio' 
                  : audioPermissions?.[currentUser] 
                  ? 'Connect Audio'
                  : 'Request Audio'
                }
              </span>
            </span>
          )}
        </button>

        {/* Mute/Unmute Toggle */}
        {audioConnected && (
          <button
            onClick={handleToggleMute}
            className={`w-full py-1.5 px-3 rounded text-sm font-medium transition-colors duration-200 ${
              isMuted
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            {isMuted ? (
              <span className="flex items-center justify-center space-x-1">
                <span>🔇</span>
                <span>Unmute</span>
              </span>
            ) : (
              <span className="flex items-center justify-center space-x-1">
                <span>🎙️</span>
                <span>Mute</span>
              </span>
            )}
          </button>
        )}

        {/* Room Owner Controls */}
        {(isRoomOwner() || isRoomModerator()) && (
          <div className="text-center text-xs text-gray-500">
            👑 You control audio permissions
          </div>
        )}

        {/* Connection Notice */}
        {!isConnected && (
          <div className="text-center text-[10px] text-gray-500">
            ⚠️ Room connection required
          </div>
        )}
      </div>
    </div>
  );
};

export default Audio;