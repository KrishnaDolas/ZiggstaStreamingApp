import { View, Alert, Platform, StatusBar } from 'react-native';
import React, { useState, useEffect, useRef, useContext } from 'react';
import { mediaDevices, RTCPeerConnection, RTCSessionDescription, RTCIceCandidate } from 'react-native-webrtc';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { PermissionsAndroid } from 'react-native';
import { ThemeContext } from '../context/ThemeContext';
import { styles } from '../../assets/styles/ThemeStyles';
import themeColors from '../../assets/styles/Colors';
import { socket, iceServers } from '../utils/constant';
import LinearGradient from 'react-native-linear-gradient';
import StreamList from '../components/StreamList';
import StreamRoom from '../components/StreamRoom';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Utility to close peer connections and clean up streams
const closePeerConnections = (peerConnections, localStream, setLocalStream, setRemoteStreams) => {
  Object.values(peerConnections.current).forEach(pc => {
    if (pc.signalingState !== 'closed') pc.close();
  });
  peerConnections.current = {};
  if (localStream) {
    localStream.getTracks().forEach(track => track.stop());
    setLocalStream(null);
  }
  setRemoteStreams(new Map());
};

export const MainScreen = ({ onLogout, address, userData }) => {
  const insetsTop = useSafeAreaInsets();
  const { theme } = useContext(ThemeContext);
  const [joined, setJoined] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);
  const [isStreaming, setIsStreaming] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState(new Map());
  const [isMuted, setIsMuted] = useState(false);
  const [isFrontCamera, setIsFrontCamera] = useState(true);
  const [hasRequestedStream, setHasRequestedStream] = useState(false);
  const [activeStreamers, setActiveStreamers] = useState([]);
  const [roomchat, setRoomchat] = useState([]);

  const localStreamRef = useRef(null);
  const peerConnections = useRef({});

  // Check and request camera/microphone permissions
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
      console.error('Permission error:', err);
      Alert.alert('Permission Denied', err.message);
      throw err;
    }
  };

  // Create and configure a peer connection
  const createPeerConnection = (streamerId, isInitiator = false) => {
    if (peerConnections.current[streamerId]) {
      console.log(`Closing existing peer connection for ${streamerId}`);
      if (peerConnections.current[streamerId].signalingState !== 'closed') {
        peerConnections.current[streamerId].close();
      }
      delete peerConnections.current[streamerId];
    }

    const pc = new RTCPeerConnection(iceServers);
    peerConnections.current[streamerId] = pc;

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => pc.addTrack(track, localStreamRef.current));
    }

    pc.onicecandidate = event => {
      if (event.candidate) {
        socket.emit('ice-candidate', { target: streamerId, candidate: event.candidate });
      }
    };

    pc.ontrack = event => {
      if (event.streams[0]) {
        console.log(`Received stream from ${streamerId}`);
        setRemoteStreams(prev => new Map(prev).set(streamerId, event.streams[0]));
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log(`ICE state for ${streamerId}: ${pc.iceConnectionState}`);
      if (pc.iceConnectionState === 'disconnected') {
        console.warn(`ICE disconnected for ${streamerId}, attempting ICE restart`);
        if (pc.signalingState !== 'closed') {
          pc.restartIce();
        }
        setTimeout(() => {
          if (pc.iceConnectionState !== 'connected' && peerConnections.current[streamerId]) {
            console.log(`Retrying connection to ${streamerId}`);
            connectToStreamer(streamerId);
          }
        }, 3000);
      } else if (pc.iceConnectionState === 'failed') {
        console.warn(`ICE failed for ${streamerId}, initiating full reconnection`);
        if (peerConnections.current[streamerId]) {
          connectToStreamer(streamerId);
        }
      } else if (pc.iceConnectionState === 'closed') {
        delete peerConnections.current[streamerId];
        setRemoteStreams(prev => {
          const newStreams = new Map(prev);
          newStreams.delete(streamerId);
          return newStreams;
        });
      }
    };

    return pc;
  };

  // Connect to a streamer
  const connectToStreamer = async (streamerId) => {
    if (streamerId === socket.id) return;

    try {
      const pc = createPeerConnection(streamerId, true);
      if (pc.signalingState === 'closed') {
        console.warn(`Peer connection for ${streamerId} is closed, aborting offer creation`);
        return;
      }
      const offer = await pc.createOffer({
        offerToReceiveVideo: true,
        offerToReceiveAudio: true,
      });
      if (pc.signalingState !== 'closed') {
        await pc.setLocalDescription(offer);
        socket.emit('offer', { target: streamerId, sdp: offer });
        console.log(`Sent offer to ${streamerId}`);
      } else {
        console.warn(`Peer connection for ${streamerId} closed before setting offer`);
      }
    } catch (err) {
      console.error(`Error connecting to ${streamerId}:`, err);
      delete peerConnections.current[streamerId];
    }
  };

  useEffect(() => {
    checkAndRequestPermissions().catch(err => console.error('Initial permission check failed:', err));

    const handleSocketConnect = () => {
      socket.emit('identify', userData.userid, userData.screenName);
    };

    const handleRoomCreated = ({ roomId }) => {
      setJoined(true);
      setIsHost(true);
      setTimeout(() => startStreaming(roomId), 1000);
    };

    const handleRoomJoined = ({ roomId, hostId, isHostStreaming, viewerCount, approvedViewerIds, isViewerStreaming, messages }) => {
      setJoined(true);
      setIsHost(false);
      setViewerCount(viewerCount);
      setIsStreaming(isHostStreaming);
      setRoomchat(messages);

      const streamers = [];
      if (isHostStreaming) streamers.push(hostId);
      streamers.push(...approvedViewerIds.filter(id => isViewerStreaming.includes(id)));
      setActiveStreamers(streamers);

      streamers.forEach(streamerId => {
        if (streamerId !== socket.id) connectToStreamer(streamerId);
      });
    };

    const handleRoomInfo = ({ viewerCount, isHostStreaming, isViewerStreaming, hostId }) => {
      setViewerCount(viewerCount);
      const streamers = [];
      if (isHostStreaming) streamers.push(hostId);
      streamers.push(...isViewerStreaming);
      setActiveStreamers(streamers);
    };

    const handleUserJoined = (viewerId) => {
      setViewerCount(prev => prev + 1);
    };

    const handleUserLeft = (viewerId) => {
      setViewerCount(prev => prev - 1);
      if (peerConnections.current[viewerId]) {
        if (peerConnections.current[viewerId].signalingState !== 'closed') {
          peerConnections.current[viewerId].close();
        }
        delete peerConnections.current[viewerId];
      }
      setRemoteStreams(prev => {
        const newStreams = new Map(prev);
        newStreams.delete(viewerId);
        return newStreams;
      });
    };

    const handleHostStartedStreaming = (hostId) => {
      setIsStreaming(true);
      if (hostId !== socket.id) connectToStreamer(hostId);
    };

    const handleViewerStartedStreaming = (viewerId) => {
      setActiveStreamers(prev => [...new Set([...prev, viewerId])]);
      if (viewerId !== socket.id) {
        console.log(`Viewer ${viewerId} started streaming, connecting...`);
        setTimeout(() => connectToStreamer(viewerId), 500); // Slight delay to stabilize signaling
      }
    };

    const handleViewerStoppedStreaming = (viewerId) => {
      if (peerConnections.current[viewerId]) {
        if (peerConnections.current[viewerId].signalingState !== 'closed') {
          peerConnections.current[viewerId].close();
        }
        delete peerConnections.current[viewerId];
      }
      setRemoteStreams(prev => {
        const newStreams = new Map(prev);
        newStreams.delete(viewerId);
        return newStreams;
      });
      setActiveStreamers(prev => prev.filter(id => id !== viewerId));
    };

    const handleHostStoppedStreaming = () => {
      setIsStreaming(false);
      setRemoteStreams(new Map());
      setActiveStreamers([]);
      setHasRequestedStream(false);
      setLocalStream(null);
      localStreamRef.current = null;
      closePeerConnections(peerConnections, localStream, setLocalStream, setRemoteStreams);
      Alert.alert('Stream Ended', 'The host has left the room.');
    };

    const handleIceCandidate = async ({ candidate, sender }) => {
      try {
        const pc = peerConnections.current[sender];
        if (pc && candidate && pc.signalingState !== 'closed') {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
          console.log(`Added ICE candidate from ${sender}`);
        }
      } catch (err) {
        console.error(`ICE candidate error for ${sender}:`, err);
      }
    };

    const handleOffer = async ({ sdp, sender }) => {
      try {
        console.log(`Received offer from ${sender}`);
        const pc = createPeerConnection(sender);
        if (pc.signalingState !== 'closed') {
          await pc.setRemoteDescription(new RTCSessionDescription(sdp));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socket.emit('answer', { target: sender, sdp: answer });
          console.log(`Sent answer to ${sender}`);
        }
      } catch (err) {
        console.error(`Offer handling error for ${sender}:`, err);
      }
    };

    const handleAnswer = async ({ sdp, sender }) => {
      try {
        console.log(`Received answer from ${sender}`);
        const pc = peerConnections.current[sender];
        if (pc && pc.signalingState !== 'closed') {
          await pc.setRemoteDescription(new RTCSessionDescription(sdp));
          console.log(`Set remote description for ${sender}`);
        }
      gmt
      } catch (err) {
        console.error(`Answer error for ${sender}:`, err);
      }
    };

    const handleHostLeft = () => {
      setJoined(false);
      setIsStreaming(false);
      closePeerConnections(peerConnections, localStream, setLocalStream, setRemoteStreams);
      Alert.alert('Host Left', 'The host has left the room.');
    };

    const handleRoomClosed = () => {
      setJoined(false);
      setIsStreaming(false);
      closePeerConnections(peerConnections, localStream, setLocalStream, setRemoteStreams);
      Alert.alert('Room Closed', 'The room has been closed.');
    };

    const handleIncomingStreamRequest = ({ viewerId, name }) => {
      if (!isHost) return;
      Alert.alert(
        'Stream Request',
        `${name} wants to start streaming.`,
        [
          { text: 'Reject', onPress: () => socket.emit('respond-stream-request', { viewerId, accepted: false }) },
          { text: 'Accept', onPress: () => socket.emit('respond-stream-request', { viewerId, accepted: true }) },
        ]
      );
    };

    const handleStreamRequestResponse = async ({ accepted, roomId, hostId }) => {
      if (accepted) {
        await startViewerStreaming(roomId);
      } else {
        setHasRequestedStream(false);
        Alert.alert('Request Rejected', 'Host declined your stream request.');
      }
    };

    const handleNewMessage = ({ userName, message, id }) => {
      const chatData = {
        id,
        userProfile: require('../../assets/images/LS-2.jpg'),
        userName,
        message,
      };
      setRoomchat(prev => [...prev, chatData]);
    };

    socket.on('connect', handleSocketConnect);
    socket.on('room-created', handleRoomCreated);
    socket.on('room-joined', handleRoomJoined);
    socket.on('room-full', () => Alert.alert('Room Full', 'The room is full. Please try again later.'));
    socket.on('invalid-room', () => Alert.alert('Stream Closed', 'Stream has been ended.'));
    socket.on('room-info', handleRoomInfo);
    socket.on('user-joined', handleUserJoined);
    socket.on('user-left', handleUserLeft);
    socket.on('host-started-streaming', handleHostStartedStreaming);
    socket.on('viewer-started-streaming', handleViewerStartedStreaming);
    socket.on('viewer-stopped-streaming', handleViewerStoppedStreaming);
    socket.on('host-stopped-streaming', handleHostStoppedStreaming);
    socket.on('ice-candidate', handleIceCandidate);
    socket.on('offer', handleOffer);
    socket.on('answer', handleAnswer);
    socket.on('host-left', handleHostLeft);
    socket.on('room-closed', handleRoomClosed);
    socket.on('incoming-stream-request', handleIncomingStreamRequest);
    socket.on('stream-request-response', handleStreamRequestResponse);
    socket.on('new-message', handleNewMessage);
    socket.on('socket-id-in-use', () => {
      Alert.alert('User Already Logged In', 'Please logout from other device.', [{ text: 'OK', onPress: onLogout }]);
    });

    return () => {
      socket.off('connect', handleSocketConnect);
      socket.off('room-created', handleRoomCreated);
      socket.off('room-joined', handleRoomJoined);
      socket.off('room-full');
      socket.off('invalid-room');
      socket.off('room-info', handleRoomInfo);
      socket.off('user-joined', handleUserJoined);
      socket.off('user-left', handleUserLeft);
      socket.off('host-started-streaming', handleHostStartedStreaming);
      socket.off('viewer-started-streaming', handleViewerStartedStreaming);
      socket.off('viewer-stopped-negotiating', handleViewerStoppedStreaming);
      socket.off('host-stopped-streaming', handleHostStoppedStreaming);
      socket.off('ice-candidate', handleIceCandidate);
      socket.off('offer', handleOffer);
      socket.off('answer', handleAnswer);
      socket.off('host-left', handleHostLeft);
      socket.off('room-closed', handleRoomClosed);
      socket.off('incoming-stream-request', handleIncomingStreamRequest);
      socket.off('stream-request-response', handleStreamRequestResponse);
      socket.off('new-message', handleNewMessage);
      socket.off('socket-id-in-use');
    };
  }, []);

  const createRoom = (roomId) => {
    socket.emit('create-room', roomId);
  };

  const joinRoom = (targetRoomId) => {
    if (!targetRoomId.trim()) {
      Alert.alert('Error', 'Please enter a room ID.');
      return;
    }
    socket.emit('join-room', targetRoomId);
  };

  const requestStreamPermission = () => {
    if (hasRequestedStream) {
      Alert.alert('Stream Request', 'You have already requested to stream.');
      return;
    }
    socket.emit('request-stream');
    setHasRequestedStream(true);
  };

  const startStreaming = async (roomId) => {
    try {
      await checkAndRequestPermissions();
      const stream = await mediaDevices.getUserMedia({
        video: { width: 1280, height: 720, facingMode: 'user' },
        audio: true,
      });
      setLocalStream(stream);
      localStreamRef.current = stream;
      socket.emit('host-streaming', roomId);
      setIsStreaming(true);
    } catch (err) {
      console.error('Streaming error:', err);
      Alert.alert('Error', 'Failed to start streaming: ' + err.message);
    }
  };

  const startViewerStreaming = async (roomId) => {
    try {
      await checkAndRequestPermissions();
      const stream = await mediaDevices.getUserMedia({
        video: { width: 1280, height: 720, facingMode: 'user' },
        audio: true,
      });
      setLocalStream(stream);
      localStreamRef.current = stream;
      socket.emit('viewer-streaming', roomId);
      setIsStreaming(true);

      // Update existing peer connections with new stream
      Object.entries(peerConnections.current).forEach(([streamerId, pc]) => {
        if (pc.signalingState !== 'closed') {
          stream.getTracks().forEach(track => pc.addTrack(track, stream));
          pc.createOffer({ offerToReceiveVideo: true, offerToReceiveAudio: true })
            .then(offer => {
              if (pc.signalingState !== 'closed') {
                return pc.setLocalDescription(offer).then(() => {
                  socket.emit('offer', { target: streamerId, sdp: offer });
                  console.log(`Renegotiated offer sent to ${streamerId}`);
                });
              }
            })
            .catch(err => console.error(`Renegotiation error for ${streamerId}:`, err));
        }
      });

      // Connect to all active streamers
      activeStreamers.forEach(streamerId => {
        if (streamerId !== socket.id && !peerConnections.current[streamerId]) {
          connectToStreamer(streamerId);
        }
      });
    } catch (err) {
      console.error('Viewer streaming error:', err);
      Alert.alert('Error', 'Failed to start viewer streaming: ' + err.message);
    }
  };

  const HandleChatmessages = (message) => {
    socket.emit('send-message', {
      userName: userData?.screenName,
      message,
      id: userData.userid,
    });
  };

  const leaveRoom = () => {
    socket.emit('leave-room');
    setJoined(false);
    setIsStreaming(false);
    setViewerCount(0);
    setHasRequestedStream(false);
    setActiveStreamers([]);
    closePeerConnections(peerConnections, localStream, setLocalStream, setRemoteStreams);
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
        Alert.alert('Camera Error', 'Unable to switch camera.');
      }
    }
  };

  return (
    <LinearGradient colors={[themeColors.headerGradientTop, themeColors.headerGradientBottom]} style={{ height: '100%', width: '100%', paddingTop: insetsTop.top }}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.container}>
        {!joined ? (
          <StreamList theme={theme} joinRoom={joinRoom} createRoom={createRoom} userData={userData} address={address} />
        ) : (
          <StreamRoom
            remoteStreams={remoteStreams}
            localStream={localStream}
            isStreaming={isStreaming}
            requestStreamPermission={requestStreamPermission}
            isFrontCamera={isFrontCamera}
            viewerCount={viewerCount}
            toggleMute={toggleMute}
            switchCamera={switchCamera}
            leaveRoom={leaveRoom}
            isMuted={isMuted}
            isHost={isHost}
            HandleChatmessages={HandleChatmessages}
            roomchat={roomchat}
          />
        )}
      </View>
    </LinearGradient>
  );
};