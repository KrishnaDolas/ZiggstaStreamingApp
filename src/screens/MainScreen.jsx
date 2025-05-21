import {View,Text,
TouchableOpacity,ScrollView,Alert,Platform} from 'react-native';
import React, { useState, useEffect, useRef, useContext } from 'react';
import { RTCView, mediaDevices, RTCPeerConnection, RTCSessionDescription, RTCIceCandidate } from 'react-native-webrtc';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { PermissionsAndroid } from 'react-native';
import { ThemeContext } from '../context/ThemeContext';
import { styles, themeStyles } from '../../assets/styles/ThemeStyles';
import { closePeerConnections, iceServers, socket } from '../utils/constant';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import Topbar from '../components/Topbar';
import StreamList from '../components/StreamList';
export const MainScreen = ({onLogout}) => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    const confirmLogout = () => {
      Alert.alert(
        'Logout',
        'Are you sure you want to logout?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'OK',
            onPress: onLogout,
          },
        ],
        { cancelable: false }
      );
    }
  
    return (
      <LinearGradient colors={['rgb(160, 0, 223)', 'rgba(252, 70, 146, 1)']} style={{height: '100%', width: '100%'}}>
      <ScrollView contentContainerStyle={[styles.container]}>
        <Topbar/>
        <TouchableOpacity 
          onPress={confirmLogout} 
          style={{ position: 'relative', top: 40, right: 20 }}
        >
          <Ionicons name="log-out-outline" size={28} color="#ff3333" />
        </TouchableOpacity>

        {!joined ? (
        <StreamList theme={theme} lobbyLoading={lobbyLoading}lobbyError={lobbyError}rooms={rooms}joinRoom={joinRoom} createRoom={createRoom} roomId={roomId} setRoomId={setRoomId}loading={loading}error={error}/>
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
        {/* Footer */}
        <Footer/>
      </ScrollView>
      </LinearGradient>

    );
  };

  