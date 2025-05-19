import React, { useEffect, useRef, useState, createContext, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { RTCView, mediaDevices, RTCPeerConnection, RTCSessionDescription, RTCIceCandidate } from 'react-native-webrtc';
import io from 'socket.io-client';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
const ThemeContext = createContext();

const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Socket.IO client initialization
const socket = io('https://streamalong.live', {
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
});

// WebRTC ICE configuration with STUN and TURN servers
const iceServers = {
  iceServers: [{
      urls: 'turn:coturn.streamalong.live:3478?transport=udp',
      username: 'vikram',
      credential: 'vikram',
    },
  ],
};

// Utility to clean up WebRTC resources
const closePeerConnections = (peerConnections, peerConnectionRef, localStream, setLocalStream, setRemoteStream) => {
  try {
    Object.values(peerConnections.current).forEach(pc => pc.close());
    peerConnections.current = {};
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    if(setRemoteStream){
    setRemoteStream(null);
    }
  } catch (err) {
    console.error('Error cleaning up WebRTC resources:', err);
  }
};

// Login Form Component
const LoginForm = ({ onLogin, onToggleForm, setError }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { theme } = useContext(ThemeContext);

  const handleLogin = () => {
    if (email === 'vikram' && password === 'Test@123') {
      onLogin();
    } else {
      setError('Invalid email or password');
    }
  };

  return (
    <View style={[styles.formContainer, themeStyles[theme].formContainer]}>
      <Text style={[styles.formTitle, themeStyles[theme].text]}>Login</Text>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={[styles.input, themeStyles[theme].input]}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholderTextColor={themeStyles[theme].placeholder.color}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        style={[styles.input, themeStyles[theme].input]}
        secureTextEntry
        placeholderTextColor={themeStyles[theme].placeholder.color}
      />
      <TouchableOpacity style={[styles.button, themeStyles[theme].button]} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onToggleForm}>
        <Text style={[styles.toggleText, themeStyles[theme].linkText]}>Don't have an account? Register</Text>
      </TouchableOpacity>
    </View>
  );
};

// Register Form Component
const RegisterForm = ({ onRegister, onToggleForm, setError }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { theme } = useContext(ThemeContext);

  const handleRegister = () => {
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (email && password) {
      onRegister();
    } else {
      setError('Please fill all fields');
    }
  };

  return (
    <View style={[styles.formContainer, themeStyles[theme].formContainer]}>
      <Text style={[styles.formTitle, themeStyles[theme].text]}>Register</Text>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={[styles.input, themeStyles[theme].input]}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholderTextColor={themeStyles[theme].placeholder.color}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        style={[styles.input, themeStyles[theme].input]}
        secureTextEntry
        placeholderTextColor={themeStyles[theme].placeholder.color}
      />
      <TextInput
        placeholder="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        style={[styles.input, themeStyles[theme].input]}
        secureTextEntry
        placeholderTextColor={themeStyles[theme].placeholder.color}
      />
      <TouchableOpacity style={[styles.button, themeStyles[theme].button]} onPress={handleRegister}>
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onToggleForm}>
        <Text style={[styles.toggleText, themeStyles[theme].linkText]}>Already have an account? Login</Text>
      </TouchableOpacity>
    </View>
  );
};

// Auth Screen Component
const AuthScreen = ({ onLogin }) => {
  const [showLogin, setShowLogin] = useState(true);
  const [error, setError] = useState('');
  const { theme } = useContext(ThemeContext);

  const toggleForm = () => setShowLogin(!showLogin);

  return (
    <View style={[styles.authContainer, themeStyles[theme].container]}>
      <Text style={[styles.title, themeStyles[theme].text]}>🎥 ZIGGSTA</Text>
      {showLogin ? (
        <LoginForm onLogin={onLogin} onToggleForm={toggleForm} setError={setError} />
      ) : (
        <RegisterForm onRegister={onLogin} onToggleForm={toggleForm} setError={setError} />
      )}
      {error ? <Text style={[styles.error, themeStyles[theme].error]}>{error}</Text> : null}
    </View>
  );
};

// Main Screen Component
const MainScreen = () => {
  const [roomId, setRoomId] = useState('');
  const [joined, setJoined] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [hostId, setHostId] = useState('');
  const [viewerCount, setViewerCount] = useState(0);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState('');
  const [viewers, setViewers] = useState([]);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isFrontCamera, setIsFrontCamera] = useState(true);
  const [loading, setLoading] = useState(false);
  const [streamRequest, setStreamRequest] = useState(null);
  const [hasRequestedStream, setHasRequestedStream] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [lobbyLoading, setLobbyLoading] = useState(false);
  const [lobbyError, setLobbyError] = useState('');
  const { theme, toggleTheme } = useContext(ThemeContext);

  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const peerConnections = useRef({});

  // Fetch room list from API
  const fetchRooms = async () => {
    setLobbyLoading(true);
    setLobbyError('');
    try {
      const response = await fetch('https://streamalong.live/rooms', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (data.status === 'ok') {
        setRooms(data.rooms || []);
      } else {
        setLobbyError('Failed to fetch rooms');
      }
    } catch (err) {
      setLobbyError('Error fetching rooms: ' + err.message);
    } finally {
      setLobbyLoading(false);
    }
  };
  useEffect(()=>{
      fetchRooms();
  },[])
  // Unified permission handling for iOS and Android
  const checkAndRequestPermissions = async () => {
    try {
      if (Platform.OS === 'ios') {
        const cameraStatus = await check(PERMISSIONS.IOS.CAMERA);
        const micStatus = await check(PERMISSIONS.IOS.MICROPHONE);

        if (cameraStatus !== RESULTS.GRANTED) {
          const result = await request(PERMISSIONS.IOS.CAMERA);
          if (result !== RESULTS.GRANTED) throw new Error('Camera permission denied');
        }
        if (micStatus !== RESULTS.GRANTED) {
          const result = await request(PERMISSIONS.IOS.MICROPHONE);
          if (result !== RESULTS.GRANTED) throw new Error('Microphone permission denied');
        }
      } else {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.CAMERA,
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        ]);
        if (
          granted[PermissionsAndroid.PERMISSIONS.CAMERA] !== PermissionsAndroid.RESULTS.GRANTED ||
          granted[PermissionsAndroid.PERMISSIONS.RECORD_AUDIO] !== PermissionsAndroid.RESULTS.GRANTED
        ) {
          throw new Error('Camera or microphone permission denied');
        }
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    // Initial permission check
    checkAndRequestPermissions().catch(err => console.error('Initial permission check failed:', err));

    // Fetch rooms on mount
    fetchRooms();

    // Socket event handlers
    const handleRoomCreated = ({ roomId }) => {
      setJoined(true);
      setIsHost(true);
      setHostId(socket.id);
      setLoading(false);
      fetchRooms(); // Refresh room list
    };

    const handleRoomJoined = ({ roomId, hostId, isHostStreaming, viewerCount }) => {
      setIsStreaming(isHostStreaming);
      setJoined(true);
      setIsHost(false);
      setHostId(hostId);
      setViewerCount(viewerCount);
      setLoading(false);
    };

    const handleRoomFull = () => {
      setError('Room is full. Cannot join.');
      setLoading(false);
    };

    const handleInvalidRoom = () => {
      setError('Invalid room ID.');
      setLoading(false);
    };

    const handleRoomExists = () => {
      setError('Room already exists.');
      setLoading(false);
    };

    const handleRoomInfo = ({ viewerCount }) => setViewerCount(viewerCount);

    const handleUserJoined = async (viewerId) => {
      if (!localStreamRef.current || localStreamRef.current.getTracks().length === 0) {
        console.warn('Viewer joined but local stream not ready');
        return;
      }

      try {
        const peerConnection = new RTCPeerConnection(iceServers);
        peerConnection.oniceconnectionstatechange = () => {
          if (peerConnection.iceConnectionState === 'failed') {
            setError('WebRTC connection failed. Please try again.');
            peerConnection.close();
            delete peerConnections.current[viewerId];
          }
        };
        localStreamRef.current.getTracks().forEach(track => {
          peerConnection.addTrack(track, localStreamRef.current);
        });
        peerConnection.onicecandidate = event => {
          if (event.candidate) {
            socket.emit('ice-candidate', { target: viewerId, candidate: event.candidate });
          }
        };
        peerConnections.current[viewerId] = peerConnection;
        const offer = await peerConnection.createOffer({
          offerToReceiveAudio: false,
          offerToReceiveVideo: false,
        });
        await peerConnection.setLocalDescription(offer);
        socket.emit('offer', { target: viewerId, sdp: offer });
      } catch (err) {
        console.error('Offer error:', err);
        setError('Failed to connect to viewer.');
      }
    };

    const handleUserLeft = (viewerId) => {
      setViewers(prev => prev.filter(id => id !== viewerId));
      if (peerConnections.current[viewerId]) {
        peerConnections.current[viewerId].close();
        delete peerConnections.current[viewerId];
      }
    };

    const handleHostStartedStreaming = () => setIsStreaming(true);

    const handleIceCandidate = async ({ candidate, sender }) => {
      try {
        const pc = peerConnections.current[sender] || peerConnectionRef.current;
        if (pc && candidate) {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        }
      } catch (err) {
        console.error('ICE candidate error:', err);
      }
    };

    const handleOffer = async ({ sdp, sender }) => {
      try {
        const peerConnection = new RTCPeerConnection(iceServers);
        peerConnection.ontrack = event => {
          setRemoteStream(event.streams[0]);
        };
        peerConnection.onicecandidate = event => {
          if (event.candidate) {
            socket.emit('ice-candidate', { target: sender, candidate: event.candidate });
          }
        };
        peerConnection.oniceconnectionstatechange = () => {
          if (peerConnection.iceConnectionState === 'failed') {
            setError('WebRTC connection failed. Please try again.');
            peerConnection.close();
            peerConnectionRef.current = null;
          }
        };
        await peerConnection.setRemoteDescription(new RTCSessionDescription(sdp));
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        socket.emit('answer', { target: sender, sdp: answer });
        peerConnectionRef.current = peerConnection;
      } catch (err) {
        console.error('Offer handling error:', err);
        setError('Failed to process stream offer.');
      }
    };

    const handleAnswer = async ({ sdp, sender }) => {
      try {
        const pc = peerConnections.current[sender];
        if (pc) {
          await pc.setRemoteDescription(new RTCSessionDescription(sdp));
        }
      } catch (err) {
        console.error('Answer error:', err);
        setError('Failed to process stream answer.');
      }
    };

    const handleHostLeft = () => {
      setError('Host has left the room.');
      setJoined(false);
      setIsStreaming(false);
      closePeerConnections(peerConnections, peerConnectionRef, localStream, setLocalStream, setRemoteStream);
    };

    const handleRoomClosed = () => {
      setError('Room has been closed.');
      setJoined(false);
      setIsStreaming(false);
      closePeerConnections(peerConnections, peerConnectionRef, localStream, setLocalStream, setRemoteStream);
    };

    const handleStreamRequest = ({ viewerId }) => {
      if (isHost) {
        setStreamRequest({ viewerId });
        Alert.alert(
          'Stream Request',
          `Viewer ${viewerId} wants to stream. Allow?`,
          [
            {
              text: 'Allow',
              onPress: () => {
                socket.emit('stream-permission', { viewerId, allowed: true });
                setStreamRequest(null);
              },
            },
            {
              text: 'Deny',
              onPress: () => {
                socket.emit('stream-permission', { viewerId, allowed: false });
                setStreamRequest(null);
              },
            },
          ],
          { cancelable: false }
        );
      }
    };

    const handleStreamPermission = ({ allowed }) => {
      if (allowed) {
        startStreaming();
        setHasRequestedStream(false);
      } else {
        setError('Streaming permission denied by host.');
        setHasRequestedStream(false);
      }
    };

    // Register socket listeners
    socket.on('room-created', handleRoomCreated);
    socket.on('room-joined', handleRoomJoined);
    socket.on('room-full', handleRoomFull);
    socket.on('invalid-room', handleInvalidRoom);
    socket.on('room-exists', handleRoomExists);
    socket.on('room-info', handleRoomInfo);
    socket.on('user-joined', handleUserJoined);
    socket.on('user-left', handleUserLeft);
    socket.on('host-started-streaming', handleHostStartedStreaming);
    socket.on('ice-candidate', handleIceCandidate);
    socket.on('offer', handleOffer);
    socket.on('answer', handleAnswer);
    socket.on('host-left', handleHostLeft);
    socket.on('room-closed', handleRoomClosed);
    socket.on('stream-request', handleStreamRequest);
    socket.on('stream-permission', handleStreamPermission);

    // Cleanup on unmount
    return () => {
      socket.off('room-created', handleRoomCreated);
      socket.off('room-joined', handleRoomJoined);
      socket.off('room-full', handleRoomFull);
      socket.off('invalid-room', handleInvalidRoom);
      socket.off('room-exists', handleRoomExists);
      socket.off('room-info', handleRoomInfo);
      socket.off('user-joined', handleUserJoined);
      socket.off('user-left', handleUserLeft);
      socket.off('host-started-streaming', handleHostStartedStreaming);
      socket.off('ice-candidate', handleIceCandidate);
      socket.off('offer', handleOffer);
      socket.off('answer', handleAnswer);
      socket.off('host-left', handleHostLeft);
      socket.off('room-closed', handleRoomClosed);
      socket.off('stream-request', handleStreamRequest);
      socket.off('stream-permission', handleStreamPermission);
      closePeerConnections(peerConnections, peerConnectionRef, localStream, setLocalStream, setRemoteStream);
    };
  }, []);

  const createRoom = () => {
    if (!roomId.trim()) {
      setError('Please enter a room ID.');
      return;
    }
    setLoading(true);
    socket.emit('create-room', roomId);
  };

  const joinRoom = (id) => {
    const targetRoomId = id || roomId;
    if (!targetRoomId.trim()) {
      setError('Please enter a room ID.');
      return;
    }
    setRoomId(targetRoomId);
    setLoading(true);
    socket.emit('join-room', targetRoomId);
  };

  const requestStreamPermission = () => {
    socket.emit('stream-request', { roomId, viewerId: socket.id });
    setHasRequestedStream(true);
  };

  const startStreaming = async () => {
    try {
      await checkAndRequestPermissions();
      const stream = await mediaDevices.getUserMedia({
        video: { width: 1280, height: 720, facingMode: 'user' },
        audio: true,
      });
      setLocalStream(stream);
      localStreamRef.current = stream;

      const peerConnection = new RTCPeerConnection(iceServers);
      stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));
      peerConnection.onicecandidate = event => {
        if (event.candidate) {
          socket.emit('ice-candidate', { target: hostId, candidate: event.candidate });
        }
      };
      peerConnection.oniceconnectionstatechange = () => {
        if (peerConnection.iceConnectionState === 'failed') {
          setError('WebRTC connection failed. Please try again.');
          peerConnection.close();
          peerConnectionRef.current = null;
        }
      };
      peerConnectionRef.current = peerConnection;
      socket.emit('host-streaming', roomId);
      setIsStreaming(true);
    } catch (err) {
      console.error('Streaming error:', err);
      setError('Failed to start streaming: ' + err.message);
    }
  };

  const stopStreaming = () => {
    closePeerConnections(peerConnections, peerConnectionRef, localStream, setLocalStream, setRemoteStream);
    setIsStreaming(false);
    socket.emit('stop-streaming', roomId);
  };

  const leaveRoom = () => {
    socket.emit('leave-room');
    setJoined(false);
    setIsStreaming(false);
    setViewers([]);
    setRoomId('');
    setHasRequestedStream(false);
    closePeerConnections(peerConnections, peerConnectionRef, localStream,setRemoteStream);
    setTimeout(() => setError(''), 4000);
    fetchRooms(); // Refresh room list
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(prev => !prev);
    }
  };

  const switchCamera = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack && typeof videoTrack._switchCamera === 'function') {
        videoTrack._switchCamera();
        setIsFrontCamera(prev => !prev);
      } else {
        setError('Camera switch not supported on this device.');
      }
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, themeStyles[theme].container]}>
      <Text style={[styles.title, themeStyles[theme].text]}>🎥   ZIGGSTA</Text>
      <TouchableOpacity style={[styles.themeButton]} onPress={toggleTheme}>
        <Text>{theme !== 'light' ? <FontAwesome name="sun-o" size={25} color="#FFA500" /> : <FontAwesome name="moon-o" size={30} color="#000" />}</Text>
      </TouchableOpacity>
      <View style={styles.mainBox}>
        {joined ? <Text style={[styles.roomText, themeStyles[theme].text]}>👁️ {viewerCount}</Text> : null}
        {joined ? <Text style={[styles.roomText, themeStyles[theme].text]}>Room ID: {roomId}</Text> : null}
        {joined ? <Text style={[styles.roomText, themeStyles[theme].text]}>You are the {isHost ? 'Host' : 'Viewer'}</Text> : null}
      </View>
      {!joined ? (
        <View style={[styles.formContainer, themeStyles[theme].formContainer]}>
          <Text style={[styles.lobbyTitle, themeStyles[theme].text]}>Available Rooms</Text>
          {lobbyLoading ? (
            <ActivityIndicator size="large" color={themeStyles[theme].primary} style={styles.loader} />
          ) : lobbyError ? (
            <Text style={[styles.error, themeStyles[theme].error]}>{lobbyError}</Text>
          ) : rooms.length === 0 ? (
            <Text style={[styles.roomText, themeStyles[theme].text]}>No rooms available</Text>
          ) : (
            <ScrollView style={styles.roomList}>
              {rooms.map(room => (
                <View key={room.roomId} style={[styles.roomItem, themeStyles[theme].roomItem]}>
                  <View>
                    <Text style={[styles.roomText, themeStyles[theme].text]}>Room ID: {room.roomId}</Text>
                    <Text style={[styles.roomText, themeStyles[theme].text]}>Viewers: {room.viewerCount}</Text>
                    <Text style={[styles.roomText, themeStyles[theme].text]}>
                      Status: {room.isStreaming ? 'Streaming' : 'Not Streaming'}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.joinButton, themeStyles[theme].button]}
                    onPress={() => joinRoom(room.roomId)}
                  >
                    <Text style={styles.buttonText}>Join</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}
          <Text style={[styles.lobbyTitle, themeStyles[theme].text]}>Create or Join Room</Text>
          <TextInput
            placeholder="Enter Room ID"
            value={roomId}
            onChangeText={setRoomId}
            style={[styles.input, themeStyles[theme].input]}
            placeholderTextColor={themeStyles[theme].placeholder.color}
          />
          {loading ? (
            <ActivityIndicator size="large" color={themeStyles[theme].primary} style={styles.loader} />
          ) : (
            <>
              <TouchableOpacity style={[styles.button, themeStyles[theme].button]} onPress={createRoom}>
                <Text style={styles.buttonText}>Create Room</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, themeStyles[theme].button]} onPress={() => joinRoom()}>
                <Text style={styles.buttonText}>Join Room</Text>
              </TouchableOpacity>
            </>
          )}
          {error ? <Text style={[styles.error, themeStyles[theme].error]}>{error}</Text> : null}
        </View>
      ) : (
        <View style={styles.roomInfo}>
          {isHost && (
            <View style={styles.streamBox}>
              {localStream && (
                <RTCView
                  streamURL={localStream.toURL()}
                  style={styles.fullScreenVideo}
                  objectFit="cover"
                  mirror={isFrontCamera}
                />
              )}
              {isStreaming ? (
                <View style={styles.controls}>
                  <TouchableOpacity style={[styles.controlButton, themeStyles[theme].button]} onPress={toggleMute}>
                    <Text style={styles.buttonText}>{isMuted ? 'Unmute' : 'Mute'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.controlButton, themeStyles[theme].button]} onPress={switchCamera}>
                    <Text style={styles.buttonText}>Switch Camera</Text>
                  </TouchableOpacity>
                </View>
              ) : null}
              <View style={styles.streamControls}>
                {!isStreaming ? (
                  <TouchableOpacity style={[styles.startStreamingButton, themeStyles[theme].startButton]} onPress={startStreaming}>
                    <Text style={styles.buttonText}>Start Streaming</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity style={[styles.stopStreamingButton, themeStyles[theme].stopButton]} onPress={stopStreaming}>
                    <Text style={styles.buttonText}>Stop Streaming</Text>
                  </TouchableOpacity>
                )}
              </View>
              {isStreaming && (
                <Text style={[styles.streamingText, themeStyles[theme].success]}>🔴 Streaming Live</Text>
              )}
            </View>
          )}
          {!isHost && (
            <View style={styles.streamBox}>
              {isStreaming && remoteStream ? (
                <>
                  <RTCView
                    streamURL={remoteStream.toURL()}
                    style={styles.fullScreenVideo}
                    objectFit="cover"
                    mirror={true}
                  />
                  <Text style={[styles.viewingText, themeStyles[theme].text]}>📡 Watching stream...</Text>
                </>
              ) : localStream ? (
                <RTCView
                  streamURL={localStream.toURL()}
                  style={styles.fullScreenVideo}
                  objectFit="cover"
                  mirror={isFrontCamera}
                />
              ) : null}
              {!isStreaming && (
                <TouchableOpacity
                  style={[styles.startStreamingButton, hasRequestedStream && styles.disabledButton, themeStyles[theme].startButton]}
                  onPress={requestStreamPermission}
                  disabled={hasRequestedStream}
                >
                  <Text style={styles.buttonText}>
                    {hasRequestedStream ? 'Awaiting Permission...' : 'Request to Stream'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
          <TouchableOpacity style={[styles.leaveButton, themeStyles[theme].stopButton]} onPress={leaveRoom}>
            <Text style={styles.buttonText}>Leave Room</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

// Main App Component
const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  return (
    <ThemeProvider>
      {isAuthenticated ? <MainScreen /> : <AuthScreen onLogin={handleLogin} />}
    </ThemeProvider>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    padding: 20,
    flexGrow: 1,
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
    alignItems: 'center',
    borderRadius: 12,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    width: '100%',
    marginVertical: 10,
    fontSize: 16,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginVertical: 10,
    width: '100%',
    alignItems: 'center',
  },
  themeButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginVertical: 10,
    alignSelf: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  toggleText: {
    fontSize: 14,
    marginTop: 10,
  },
  error: {
    marginTop: 10,
    fontSize: 14,
    textAlign: 'center',
  },
  loader: {
    marginVertical: 20,
  },
  roomInfo: {
    marginTop: 30,
    alignItems: 'center',
  },
  roomText: {
    fontSize: 18,
    marginVertical: 5,
  },
  mainBox: {
    position: 'absolute',
    width: '100%',
    top: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  streamBox: {
    width: '100%',
    position: 'relative',
  },
  fullScreenVideo: {
    width: '100%',
    height: 600,
    backgroundColor: '#000',
    borderRadius: 12,
    marginBottom: 15,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginVertical: 10,
  },
  streamControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginVertical: 10,
  },
  controlButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  startStreamingButton: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginHorizontal: 5,
    width: '45%',
    alignItems: 'center',
  },
  stopStreamingButton: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginHorizontal: 5,
    width: '45%',
    alignItems: 'center',
  },
  streamingText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
  },
  viewingText: {
    fontSize: 18,
    marginTop: 10,
    textAlign: 'center',
  },
  leaveButton: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginTop: 20,
    width: '80%',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  lobbyTitle: {
    fontSize: 22,
    fontWeight: '600',
    marginVertical: 15,
    textAlign: 'center',
  },
  roomList: {
    maxHeight: 200,
    width: '100%',
    marginBottom: 20,
  },
  roomItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    marginVertical: 5,
  },
  joinButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
});

// Theme Styles
const themeStyles = {
  light: {
    container: { backgroundColor: '#f0f4f8' },
    formContainer: { backgroundColor: '#fff' },
    text: { color: '#333' },
    input: { borderColor: '#ddd', backgroundColor: '#fff', color: 'black' },
    button: { backgroundColor: '#1a73e8' },
    startButton: { backgroundColor: '#34a853' },
    stopButton: { backgroundColor: '#ea4335' },
    linkText: { color: '#1a73e8' },
    error: { color: 'red' },
    success: { color: 'green' },
    primary: { color: '#1a73e8' },
    placeholder: { color: '#999' },
    roomItem: { backgroundColor: '#f5f5f5' },
  },
  dark: {
    container: { backgroundColor: '#121212' },
    formContainer: { backgroundColor: '#1e1e1e' },
    text: { color: '#fff' },
    input: { borderColor: '#444', backgroundColor: '#2a2a2a', color: 'white' },
    button: { backgroundColor: '#1a73e8' },
    startButton: { backgroundColor: '#34a853' },
    stopButton: { backgroundColor: '#ea4335' },
    linkText: { color: '#1a73e8' },
    error: { color: '#ff5555' },
    success: { color: '#55ff55' },
    primary: { color: '#1a73e8' },
    placeholder: { color: '#aaa' },
    roomItem: { backgroundColor: '#2a2a2a' },
  },
};

export default App;