import { View, Alert, Platform, SafeAreaView, StatusBar } from 'react-native';
import React, { useState, useEffect, useRef, useContext } from 'react';
import { mediaDevices, RTCPeerConnection, RTCSessionDescription, RTCIceCandidate } from 'react-native-webrtc';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { PermissionsAndroid } from 'react-native';
import { ThemeContext } from '../context/ThemeContext';
import { styles } from '../../assets/styles/ThemeStyles';
import themeColors from '../../assets/styles/Colors';
import { closePeerConnections, iceServers, socket } from '../utils/constant';
import LinearGradient from 'react-native-linear-gradient';
import StreamList from '../components/StreamList';
import Hostscreen from '../streamscreen/Hostscreen'; // Not directly used in MainScreen, but kept for context
import Viewerscreen from '../streamscreen/Viewerscreen'; // Not directly used in MainScreen, but kept for context
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import StreamRoom from '../components/StreamRoom';

export const MainScreen = ({ onLogout, userData }) => {
  const insetsTop = useSafeAreaInsets();
  const [roomId, setRoomId] = useState('');
  const [joined, setJoined] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [hostId, setHostId] = useState('');
  const [viewerCount, setViewerCount] = useState(0);
  const [isStreaming, setIsStreaming] = useState(false); // Refers to host's own stream status
  const [isViewerStreaming, setIsViewerStreaming] = useState(false); // Refers to viewer's own stream status
  const [error, setError] = useState('');
  // Use a Map for activeStreamers to quickly lookup and manage.
  // The value can be true/false or even an object with more info like name if needed.
  const [activeStreamers, setActiveStreamers] = useState(new Map());
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState(new Map()); // Maps socket.id to MediaStream
  const [isMuted, setIsMuted] = useState(false);
  const [isFrontCamera, setIsFrontCamera] = useState(true);
  const [hasRequestedStream, setHasRequestedStream] = useState(false);
  const [isViewer, setIsViewer] = useState(false);
  const { theme } = useContext(ThemeContext);

  const localStreamRef = useRef(null);
  const peerConnections = useRef({}); // Maps remote_socket.id to RTCPeerConnection

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

  // Helper to create a new PeerConnection for a given remoteId
  const createPeerConnection = (remoteId) => {
    const pc = new RTCPeerConnection(iceServers);

    // Add local stream tracks if available
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, localStreamRef.current);
      });
    }

    pc.onicecandidate = event => {
      if (event.candidate) {
        console.log(`Sending ICE candidate from ${socket.id} to ${remoteId}`);
        socket.emit('ice-candidate', { target: remoteId, candidate: event.candidate });
      }
    };

    pc.ontrack = event => {
      console.log(`Received remote stream from ${remoteId}:`, event.streams[0]);
      setRemoteStreams(prev => {
        const newStreams = new Map(prev);
        newStreams.set(remoteId, event.streams[0]);
        return newStreams;
      });
    };

    pc.oniceconnectionstatechange = () => {
      console.log(`ICE connection state for ${remoteId}: ${pc.iceConnectionState}`);
      if (pc.iceConnectionState === 'failed' || pc.iceConnectionState === 'disconnected' || pc.iceConnectionState === 'closed') {
        console.warn(`WebRTC connection failed/closed for ${remoteId}. Cleaning up.`);
        pc.close();
        delete peerConnections.current[remoteId];
        setRemoteStreams(prev => {
          const newStreams = new Map(prev);
          newStreams.delete(remoteId);
          return newStreams;
        });
        // Optionally, alert if it's a critical connection like the host's
        if (remoteId === hostId && !isHost) {
          setError('Connection with host lost.');
        }
      }
    };

    peerConnections.current[remoteId] = pc;
    return pc;
  };


  useEffect(() => {
    checkAndRequestPermissions().catch(err => console.error('Initial permission check failed:', err));

    const handlesocketconnect = () => {
      socket.emit('identify', userData.userid, userData.screenName);
    };

    const handleRoomCreated = ({ roomId, socketid }) => {
      setJoined(true);
      setIsHost(true);
      setHostId(socketid);
      // Host is the first active streamer
      setActiveStreamers(prev => new Map(prev).set(socketid, true));
    };

    // Modified handleRoomJoined to process all initial active streamers
    const handleRoomJoined = ({ roomId, hostId, isHostStreaming, viewerCount, approvedViewerIds, activeStreamers: initialActiveStreamers }) => {
      setRoomId(roomId);
      setHostId(hostId);
      setIsViewer(true);
      setIsStreaming(isHostStreaming); // Host's streaming status
      setJoined(true);
      setIsHost(false);
      setViewerCount(viewerCount);
      setIsViewerStreaming(approvedViewerIds.includes(socket.id));

      const newActiveStreamers = new Map();
      initialActiveStreamers.forEach(id => {
        newActiveStreamers.set(id, true);
      });
      setActiveStreamers(newActiveStreamers);

      // Initiate connections to all existing active streamers
      initialActiveStreamers.forEach(async (streamerId) => {
        if (streamerId !== socket.id) { // Don't try to connect to self
          console.log(`Joining room: Initiating connection with existing streamer ${streamerId}`);
          // Viewer should create an offer to receive from existing streamers
          const pc = createPeerConnection(streamerId);
          const offer = await pc.createOffer({
            offerToReceiveAudio: true,
            offerToReceiveVideo: true,
          });
          await pc.setLocalDescription(offer);
          socket.emit('offer', { target: streamerId, sdp: offer });
        }
      });
    };

    const handleRoomFull = () => {
      setError('Room is full. Cannot join.');
    };

    const handleRoomExists = () => {
      setError('Room already exists.');
    };

    const handleRoomInfo = ({ viewerCount, isViewerStreaming, approvedViewerIds, activeStreamers: currentActiveStreamers }) => {
      setViewerCount(viewerCount);
      setIsViewerStreaming(isViewerStreaming.includes(socket.id));
      // Update active streamers map
      const newActiveStreamers = new Map();
      currentActiveStreamers.forEach(id => newActiveStreamers.set(id, true));
      setActiveStreamers(newActiveStreamers);
    };

    // **NEW EVENT**: When any user (host or viewer) joins the room
    const handleUserJoinedRoom = async (newUserId) => {
      console.log(`User ${newUserId} joined the room. Current user ${socket.id}`);
      // If I am currently streaming, I need to offer my stream to the new user
      if ((isHost && isStreaming) || (isViewer && isViewerStreaming)) {
        console.log(`I am streaming. Offering my stream to new user: ${newUserId}`);
        const pc = createPeerConnection(newUserId);
        const offer = await pc.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true,
        });
        await pc.setLocalDescription(offer);
        socket.emit('offer', { target: newUserId, sdp: offer });
      }
    };


    // **NEW EVENT**: Triggered when any new stream becomes available (host or viewer)
    const handleNewStreamAvailable = async (streamerId) => {
      if (streamerId === socket.id) {
        console.log("Received new-stream-available for myself, ignoring.");
        return; // Don't connect to yourself
      }
      if (peerConnections.current[streamerId]) {
        console.log(`Peer connection already exists for ${streamerId}.`);
        return; // Already setting up connection or connected
      }
      console.log(`New stream available from ${streamerId}. Initiating connection.`);
      const pc = createPeerConnection(streamerId);
      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });
      await pc.setLocalDescription(offer);
      socket.emit('offer', { target: streamerId, sdp: offer });
    };

    // Old `handleUserJoined` and `handleViewerJoined` are effectively replaced by `handleNewStreamAvailable` and `handleUserJoinedRoom`
    // However, if you have specific logic for host/viewer connections that differs beyond just signaling, keep them and adapt.
    // For general multi-stream, `handleNewStreamAvailable` and `handleUserJoinedRoom` are more generic.
    // I will simplify and consolidate them.

    const handleHostStartedStreaming = () => {
      setIsStreaming(true); // Your own host streaming status
      // `handleNewStreamAvailable` will handle initiating connection to host for viewers
    };

    const handleViewerStartedStreaming = async (viewerId) => {
      // This event tells you a viewer has permission to stream and *has started* trying to stream.
      // `handleNewStreamAvailable` will handle initiating connection for everyone else to this viewer.
      console.log(`Viewer ${viewerId} is now streaming.`);
      setActiveStreamers(prev => new Map(prev).set(viewerId, true));
    };


    const handleIceCandidate = async ({ candidate, sender }) => {
      try {
        const pc = peerConnections.current[sender];
        if (pc && candidate) {
          console.log(`Adding ICE candidate from ${sender} to ${socket.id}`);
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } else {
          console.warn(`No peer connection found for ICE candidate sender: ${sender}`);
        }
      } catch (err) {
        console.error('ICE candidate handling error:', err);
      }
    };

    const handleOffer = async ({ sdp, sender }) => {
      try {
        let pc = peerConnections.current[sender];
        if (!pc) {
          console.log(`Received offer from ${sender}, creating new peer connection.`);
          pc = createPeerConnection(sender);
        } else {
          console.log(`Received offer from ${sender}, using existing peer connection.`);
        }

        await pc.setRemoteDescription(new RTCSessionDescription(sdp));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit('answer', { target: sender, sdp: answer });
      } catch (err) {
        console.error('Offer handling error:', err);
        setError('Failed to process stream offer.');
      }
    };

    const handleAnswer = async ({ sdp, sender }) => {
      try {
        const pc = peerConnections.current[sender];
        if (pc) {
          if (pc.signalingState !== 'have-local-offer' && pc.signalingState !== 'stable') {
            console.warn(`Cannot set remote answer in signaling state: ${pc.signalingState} for sender: ${sender}`);
            return;
          }
          await pc.setRemoteDescription(new RTCSessionDescription(sdp));
          console.log(`Successfully set remote answer for sender: ${sender}`);
        } else {
          console.warn(`No peer connection found for answer sender: ${sender}`);
        }
      } catch (err) {
        console.error('Answer handling error:', err);
        setError('Failed to process stream answer: ' + err.message);
      }
    };

    const handleHostLeft = () => {
      setError('Host has left the room.');
      setJoined(false);
      setIsStreaming(false);
      setIsViewerStreaming(false);
      // Cleanup all connections and streams
      Object.values(peerConnections.current).forEach(pc => pc.close());
      peerConnections.current = {};
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
        localStreamRef.current = null;
        setLocalStream(null);
      }
      setRemoteStreams(new Map());
      setActiveStreamers(new Map());
      setRoomId('');
      setHasRequestedStream(false);
    };

    const handleRoomClosed = () => {
      setError('Room has been closed.');
      setJoined(false);
      setIsStreaming(false);
      setIsViewerStreaming(false);
      // Cleanup all connections and streams
      Object.values(peerConnections.current).forEach(pc => pc.close());
      peerConnections.current = {};
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
        localStreamRef.current = null;
        setLocalStream(null);
      }
      setRemoteStreams(new Map());
      setActiveStreamers(new Map());
      setRoomId('');
      setHasRequestedStream(false);
    };

    const handleIncomingStreamRequest = ({ viewerId, name }) => {
      if (!isHost) return;
      Alert.alert(
        "Stream Request",
        `${name} wants to start streaming.`,
        [
          {
            text: "Reject",
            onPress: () => socket.emit("respond-stream-request", { viewerId, accepted: false }),
            style: "cancel",
          },
          {
            text: "Accept",
            onPress: () => socket.emit("respond-stream-request", { viewerId, accepted: true }),
          },
        ]
      );
    };

    const handleStreamRequestResponse = async ({ accepted, roomId, hostId }) => {
      if (accepted) {
        console.log(`Stream request accepted for room ${roomId}`);
        await startViewerStreaming(roomId, hostId);
        setHasRequestedStream(false);
      } else {
        setHasRequestedStream(false);
        Alert.alert("Request Rejected", "Host declined your stream request.");
      }
    };

    // **MODIFIED EVENT**: Centralized stream removal
    const handleStreamRemoved = (streamerId) => {
      console.log(`Stream from ${streamerId} has been removed.`);
      if (peerConnections.current[streamerId]) {
        peerConnections.current[streamerId].close();
        delete peerConnections.current[streamerId];
      }
      setRemoteStreams(prev => {
        const newStreams = new Map(prev);
        newStreams.delete(streamerId);
        return newStreams;
      });
      setActiveStreamers(prev => {
        const newActive = new Map(prev);
        newActive.delete(streamerId);
        return newActive;
      });
      // If it was our own viewer stream that was stopped by host
      if (streamerId === socket.id && isViewerStreaming) {
        setIsViewerStreaming(false);
        if (localStreamRef.current) {
          localStreamRef.current.getTracks().forEach(track => track.stop());
          setLocalStream(null);
          localStreamRef.current = null;
        }
      }
    };


    socket.on('connect', handlesocketconnect);
    socket.on('room-created', handleRoomCreated);
    socket.on('room-joined', handleRoomJoined);
    socket.on('room-full', handleRoomFull);
    socket.on('invalid-room', () => setError('Invalid room ID.'));
    socket.on('room-exists', handleRoomExists);
    socket.on('room-info', handleRoomInfo);
    // New event listeners for multi-party
    socket.on('new-stream-available', handleNewStreamAvailable);
    socket.on('user-joined-room', handleUserJoinedRoom); // When *any* user joins, existing streamers might need to connect

    // Removed specific 'user-joined' and 'viewer-joined' as `new-stream-available` handles connection initiation
    // socket.on('user-joined', handleUserJoined); // Host receiving new viewer
    // socket.on('viewer-joined', handleViewerJoined); // Viewer receiving host
    socket.on('user-left', handleStreamRemoved); // User leaving means their stream is removed
    socket.on('host-started-streaming', handleHostStartedStreaming);
    socket.on('viewer-started-streaming', handleViewerStartedStreaming); // Just to update UI state, connection handled by new-stream-available
    socket.on('ice-candidate', handleIceCandidate);
    socket.on('offer', handleOffer);
    socket.on('answer', handleAnswer);
    socket.on('host-left', handleHostLeft);
    socket.on('room-closed', handleRoomClosed);
    socket.on('incoming-stream-request', handleIncomingStreamRequest);
    socket.on('stream-request-response', handleStreamRequestResponse);
    socket.on('viewer-stopped-streaming', handleStreamRemoved); // Consolidated with stream-removed
    socket.on('stream-removed', handleStreamRemoved); // NEW: Centralized stream removal
    socket.on('you-stopped-streaming', () => { // Event from server to tell viewer their stream was stopped by host
      setIsViewerStreaming(false);
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
        setLocalStream(null);
        localStreamRef.current = null;
      }
    });
    socket.on('socket-id-in-use', () => {
      Alert.alert("User Already Logged In", "Please Logout From Other Device", [
        { text: "OK", onPress: () => onLogout() }
      ]);
    });

    return () => {
      socket.off('connect', handlesocketconnect);
      socket.off('room-created', handleRoomCreated);
      socket.off('room-joined', handleRoomJoined);
      socket.off('room-full', handleRoomFull);
      socket.off('invalid-room');
      socket.off('room-exists', handleRoomExists);
      socket.off('room-info', handleRoomInfo);
      socket.off('new-stream-available', handleNewStreamAvailable);
      socket.off('user-joined-room', handleUserJoinedRoom);
      // socket.off('user-joined', handleUserJoined);
      // socket.off('viewer-joined', handleViewerJoined);
      socket.off('user-left', handleStreamRemoved);
      socket.off('host-started-streaming', handleHostStartedStreaming);
      socket.off('viewer-started-streaming', handleViewerStartedStreaming);
      socket.off('ice-candidate', handleIceCandidate);
      socket.off('offer', handleOffer);
      socket.off('answer', handleAnswer);
      socket.off('host-left', handleHostLeft);
      socket.off('room-closed', handleRoomClosed);
      socket.off('incoming-stream-request', handleIncomingStreamRequest);
      socket.off('stream-request-response', handleStreamRequestResponse);
      socket.off('viewer-stopped-streaming', handleStreamRemoved);
      socket.off('stream-removed', handleStreamRemoved);
      socket.off('you-stopped-streaming');
      socket.off('socket-id-in-use');

      // Ensure all peer connections are closed on unmount
      Object.values(peerConnections.current).forEach(pc => pc.close());
      peerConnections.current = {};
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
        localStreamRef.current = null;
        setLocalStream(null);
      }
      setRemoteStreams(new Map());
      setActiveStreamers(new Map());
    };
  }, [isHost, isViewer, isStreaming, isViewerStreaming]); // Added dependencies to re-run effect for accurate state

  // Helper function to get local media stream
  const getLocalStream = async () => {
    try {
      await checkAndRequestPermissions();
      const stream = await mediaDevices.getUserMedia({
        video: { width: 1280, height: 720, facingMode: isFrontCamera ? 'user' : 'environment' },
        audio: true,
      });
      setLocalStream(stream);
      localStreamRef.current = stream;
      return stream;
    } catch (err) {
      console.error('Failed to get local stream:', err);
      setError('Failed to access camera/mic: ' + err.message);
      return null;
    }
  };

  const createRoom = async (roomId) => {
    console.log('Creating room with ID:', roomId);
    socket.emit('create-room', roomId);
    // Allow server to create room, then start streaming after confirmation
    // The `host-streaming` event will be emitted by the server after room creation.
    // We will trigger `startStreaming` once the room is confirmed created by the server.
  };

  const joinRoom = (targetRoomId) => {
    if (!targetRoomId.trim()) {
      setError('Please enter a room ID.');
      return;
    }
    setRoomId(targetRoomId);
    socket.emit('join-room', targetRoomId);
  };

  const requestStreamPermission = () => {
    socket.emit('request-stream');
    setHasRequestedStream(true);
  };

  const startStreaming = async (isHostStream = true) => {
    if (localStreamRef.current) {
      console.log("Local stream already exists, reusing it for new connections.");
      // If we already have a local stream, we just need to add its tracks to new peer connections.
      // This is primarily for a host who just created a room and now wants to stream.
      // Or a viewer who just got permission and needs to start sending their stream.
    } else {
      console.log("Getting local stream for the first time.");
      const stream = await getLocalStream();
      if (!stream) {
        return; // Failed to get stream
      }
    }

    if (isHostStream) {
      setIsStreaming(true);
      socket.emit('host-streaming', roomId); // Notify server host is streaming
    } else {
      setIsViewerStreaming(true);
      socket.emit('viewer-streaming', roomId); // Notify server viewer is streaming
    }

    // Now, establish connections with all other active streamers (including yourself if setting up for everyone)
    // For a host, they will establish connection with viewers when viewers join.
    // For a viewer, they need to establish connection with host and other approved viewers.

    // If I just started streaming, I need to send my stream to everyone else in the room
    const currentRoomId = roomId; // Ensure we use the latest roomId state
    socket.emit('request-all-peers-to-connect', {roomId: currentRoomId, senderId: socket.id}); // New custom event
  };


  const stopStreaming = () => {
    // If you are the host, stopping streaming means stopping your broadcast.
    // If you are a viewer, stopping streaming means stopping your personal broadcast.
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      setLocalStream(null);
      localStreamRef.current = null;
    }
    setIsStreaming(false); // Only affects host status
    setIsViewerStreaming(false); // Only affects viewer status

    // Signal to everyone that THIS user's stream is no longer active
    socket.emit('stop-my-stream', { roomId, streamerId: socket.id });

    // Clean up all peer connections where *this* client was the sender or receiver
    Object.values(peerConnections.current).forEach(pc => pc.close());
    peerConnections.current = {};
    setRemoteStreams(new Map());
  };

  const leaveRoom = () => {
    socket.emit('leave-room');
    setJoined(false);
    setIsStreaming(false);
    setIsViewerStreaming(false);
    setRoomId('');
    setHasRequestedStream(false);

    // Clean up all connections and streams
    Object.values(peerConnections.current).forEach(pc => pc.close());
    peerConnections.current = {};
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
      setLocalStream(null);
    }
    setRemoteStreams(new Map());
    setActiveStreamers(new Map());
    setTimeout(() => setError(''), 4000);
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
  };

  return (
    <LinearGradient colors={[themeColors.headerGradientTop, themeColors.headerGradientBottom]} style={{ height: '100%', width: '100%', paddingTop: insetsTop.top }}>
      <StatusBar
        hidden={false}
        barStyle="dark-content"
        backgroundColor="#fff"
      />
      <View style={[styles.container]}>
        {!joined ? (
          <StreamList theme={theme} joinRoom={joinRoom} createRoom={createRoom} userData={userData} />
        ) : (
          <StreamRoom
            remoteStreams={remoteStreams} // All incoming streams
            localStream={localStream} // Your outgoing stream
            isStreaming={isStreaming || isViewerStreaming} // Whether *you* are streaming
            // Renamed and combined from isStreaming (host) and isViewerStreaming (viewer)
            requestStreamPermission={requestStreamPermission}
            hasRequestedStream={hasRequestedStream}
            isFrontCamera={isFrontCamera}
            theme={theme}
            viewerCount={viewerCount} // Total viewers, not necessarily streamers
            toggleMute={toggleMute}
            switchCamera={switchCamera}
            leaveRoom={leaveRoom}
            isMuted={isMuted}
            hostId={hostId}
            activeStreamers={activeStreamers} // Pass all active streamers to StreamRoom
            isHost={isHost}
            stopStreaming={stopStreaming} // New prop for stopping own stream
          />
        )}
      </View>
    </LinearGradient>
  );
};