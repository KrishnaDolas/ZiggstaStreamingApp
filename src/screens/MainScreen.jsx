import { View, Alert, Platform, StatusBar } from 'react-native';
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
import StreamRoom from '../components/StreamRoom';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const MainScreen = ({ onLogout, address, userData }) => {
  const insetsTop = useSafeAreaInsets();
  const [joined, setJoined] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);
  const [isStreaming, setIsStreaming] = useState(false);
  const [viewers, setViewers] = useState([]);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState(new Map());
  const [isMuted, setIsMuted] = useState(false);
  const [isFrontCamera, setIsFrontCamera] = useState(true);
  const [hasRequestedStream, setHasRequestedStream] = useState(false);
  const [activeStreamers, setActiveStreamers] = useState([]);
  const [roomchat, setRoomchat] = useState([]);
  const { theme } = useContext(ThemeContext);

  const localStreamRef = useRef(null);
  const peerConnections = useRef({});

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
      socket.emit('Errorlogs',`Permission error:`,err);
      console.log(err);
      throw err;
    }
  };

  // Connect to a streamer function
  const connectToStreamer = async (streamerId) => {
    if (streamerId === socket.id) {
      console.log(`Skipping connection to self: ${streamerId}`);
      return;
    }
  
    const existingPC = peerConnections.current[streamerId];
  
    // Reconnect or restart ICE if a connection exists but is broken
    if (existingPC) {
      const state = existingPC.iceConnectionState;
      console.log(`[${streamerId}] Existing PC found. ICE state: ${state}`);
  
      if (state === 'connected' || state === 'checking') {
        console.log(`[${streamerId}] Already connected or connecting`);
        return;
      }
  
      if (state === 'disconnected' || state === 'failed') {
        console.warn(`[${streamerId}] Attempting ICE restart`);
        try {
          const offer = await existingPC.createOffer({ iceRestart: true });
          await existingPC.setLocalDescription(offer);
          socket.emit('offer', {
            target: streamerId,
            sdp: existingPC.localDescription,
          });
          return;
        } catch (err) {
          console.error(`[${streamerId}] ICE restart failed:`, err);
        }
      }
  
      // Close bad or undefined state connections
      console.warn(`[${streamerId}] Closing existing broken PC`);
      existingPC.close();
      delete peerConnections.current[streamerId];
    }
  
    // =============================
    // ✅ New PeerConnection Setup
    // =============================
  
    const isPolite = socket.id > streamerId; // Arbitrary polite logic
    const pc = new RTCPeerConnection(iceServers);
    peerConnections.current[streamerId] = pc;
  
    let makingOffer = false;
  
    // Add tracks if sending stream
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, localStreamRef.current);
      });
    } else {
      pc.addTransceiver('video', { direction: 'recvonly' });
      pc.addTransceiver('audio', { direction: 'recvonly' });
    }
  
    // Handle negotiationneeded
    pc.onnegotiationneeded = async () => {
      try {
        makingOffer = true;
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit('offer', { target: streamerId, sdp: pc.localDescription });
      } catch (err) {
        console.error(`[${streamerId}] Negotiation failed:`, err);
      } finally {
        makingOffer = false;
      }
    };
  
    // ICE candidate handler
    pc.onicecandidate = event => {
      if (event.candidate) {
        socket.emit('ice-candidate', {
          target: streamerId,
          candidate: event.candidate,
        });
      }
    };
  
    // Remote stream handler
    pc.ontrack = event => {
      if (event.streams[0]) {
        console.log(`[${streamerId}] Received stream`);
        setRemoteStreams(prev => new Map(prev).set(streamerId, event.streams[0]));
      }
    };
  
    // ICE state monitor with restart handling
    pc.oniceconnectionstatechange = async () => {
      const state = pc.iceConnectionState;
      console.log(`[${streamerId}] ICE State: ${state}`);
      socket.emit('Errorlogs', 'ICE state change', `[${streamerId}] ${state}`);
  
      if (state === 'disconnected') {
        try {
          const offer = await pc.createOffer({ iceRestart: true });
          await pc.setLocalDescription(offer);
          socket.emit('offer', { target: streamerId, sdp: pc.localDescription });
        } catch (err) {
          console.error(`[${streamerId}] ICE restart failed:`, err);
        }
      }
  
      if (state === 'failed' || state === 'closed') {
        console.log(`[${streamerId}] Cleaning up PC`);
        pc.close();
        delete peerConnections.current[streamerId];
        setRemoteStreams(prev => {
          const updated = new Map(prev);
          updated.delete(streamerId);
          return updated;
        });
      }
    };
  
    // Attach flags (optional for offer collision handling)
    pc._isPolite = isPolite;
    pc._makingOffer = makingOffer;
  
    console.log(`[${streamerId}] New PeerConnection created`);
  };
  
  

  useEffect(() => {
    checkAndRequestPermissions().catch(err => console.error('Initial permission check failed:', err));

    const handlesocketconnect = () => {
      socket.emit('identify', userData.userid, userData.screenName);
    };

    const handleRoomCreated = ({ roomId, socketid }) => {
      console.log(`Room created with ID: ${roomId}, Host ID: ${socketid}`);
      setJoined(true);
      setIsHost(true);
    };

    const handleRoomJoined = ({ roomId, hostId, isHostStreaming, viewerCount, approvedViewerIds, isViewerStreaming, messages }) => {
      console.log(`Joined room ${roomId}, hostId: ${hostId}, isHostStreaming: ${isHostStreaming}`);
      setIsStreaming(isHostStreaming);
      setJoined(true);
      setIsHost(false);
      setRoomchat(messages);
      setViewerCount(viewerCount);

      // Identify all active streamers
      const streamers = [];
      if (isHostStreaming) streamers.push(hostId);
      streamers.push(...approvedViewerIds.filter(id => isViewerStreaming.includes(id)));
      setActiveStreamers(prev => {
        const newStreamers = [...new Set([...prev, ...streamers])]; // Avoid duplicates
        console.log('Updated active streamers:', newStreamers);
        return newStreamers;
      });

      // Connect only to new streamers
      streamers.forEach(streamerId => {
        if (streamerId !== socket.id && !peerConnections.current[streamerId]) {
          console.log(`Connecting to streamer ${streamerId}`);
          connectToStreamer(streamerId);
        }
      });
    };


    const handleRoomInfo = (props) => {
      const { hostId, isHostStreaming, viewerCount, isViewerStreaming } = props;
      setViewerCount(viewerCount);
      const streamers = [];
      if (isHostStreaming) streamers.push(hostId);
      streamers.push(...isViewerStreaming);
      setActiveStreamers(streamers);
    };

    const handleUserJoined = (viewerId, name) => {
      setViewers(prev => [...prev, viewerId]);
    };

    const handleUserLeft = (viewerId) => {
      setViewers(prev => prev.filter(id => id !== viewerId));
      if (peerConnections.current[viewerId]) {
        peerConnections.current[viewerId].close();
        delete peerConnections.current[viewerId];
        setRemoteStreams(prev => {
          const newStreams = new Map(prev);
          newStreams.delete(viewerId);
          return newStreams;
        });
      }
    };

    const handleHostStartedStreaming = (hostId) => {
      setIsStreaming(true);
      if (hostId !== socket.id) {
        connectToStreamer(hostId);
      }
    };

    const handleViewerStartedStreaming = (viewerId) => {
      setActiveStreamers(prev => [...new Set([...prev, viewerId])]);
    
      if (peerConnections.current[viewerId]) {
        const pc = peerConnections.current[viewerId];
        if (localStreamRef.current) {
          localStreamRef.current.getTracks().forEach(track => {
            pc.addTrack(track, localStreamRef.current);
          });
        }
    
        // Trigger ICE restart to negotiate new stream
        pc.createOffer({ iceRestart: true }).then(offer => {
          return pc.setLocalDescription(offer);
        }).then(() => {
          socket.emit('offer', { target: viewerId, sdp: pc.localDescription });
        });
      } else {
        connectToStreamer(viewerId);
      }
    };
    

    const handleViewerStoppedStreaming = (viewerId) => {
      if (peerConnections.current[viewerId]) {
        peerConnections.current[viewerId].close();
        delete peerConnections.current[viewerId];
      }
      setRemoteStreams(prev => {
        const newStreams = new Map(prev);
        newStreams.delete(viewerId);
        return newStreams;
      });
      setActiveStreamers(prev => prev.filter(id => id !== viewerId));
    };

    const handlehostleftstream = (hostid) => {
      setIsStreaming(false);
      setRemoteStreams(new Map());
      setActiveStreamers([]);
      setHasRequestedStream(false);
      setLocalStream(null);
      localStreamRef.current = null;
      if (socket.id !== hostid) {
        Alert.alert("Stream Ended", "The host has Leave the room. You can now leave the room");
      }
      console.log(`Host ${hostid} has left the stream, closing connections...`);
      // Close all peer connections and reset state
      closePeerConnections(peerConnections, localStream, setLocalStream, () => setRemoteStreams(new Map()));
    }
    const handleIceCandidate = async ({ candidate, sender }) => {
      try {
        const pc = peerConnections.current[sender];
        if (pc && candidate) {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        }
      } catch (err) {
        socket.emit('Errorlogs', `ICE error for ${sender}`, err);
        console.error('ICE candidate error:', err);
      }
    };

    const handleOffer = async ({ sdp, sender }) => {
      let pc = peerConnections.current[sender];
      const isPolite = socket.id > sender;
    
      if (!pc) {
        pc = new RTCPeerConnection(iceServers);
        peerConnections.current[sender] = pc;
    
        if (localStreamRef.current) {
          localStreamRef.current.getTracks().forEach(track => {
            pc.addTrack(track, localStreamRef.current);
          });
        } else {
          pc.addTransceiver('video', { direction: 'recvonly' });
          pc.addTransceiver('audio', { direction: 'recvonly' });
        }
    
        pc.onicecandidate = event => {
          if (event.candidate) {
            socket.emit('ice-candidate', { target: sender, candidate: event.candidate });
          }
        };
    
        pc.ontrack = event => {
          if (event.streams[0]) {
            setRemoteStreams(prev => new Map(prev).set(sender, event.streams[0]));
          }
        };
    
        pc._isPolite = isPolite;
      }
    
      try {
        const offerCollision = pc._makingOffer || pc.signalingState !== 'stable';
    
        if (!pc._isPolite && offerCollision) {
          pc._ignoreOffer = true;
          console.log(`Ignoring offer from ${sender} due to collision`);
          return;
        }
    
        pc._ignoreOffer = false;
    
        await pc.setRemoteDescription(new RTCSessionDescription(sdp));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit('answer', { target: sender, sdp: pc.localDescription });
      } catch (err) {
        socket.emit('Errorlogs', 'handleOffer error', err);
        console.error('Error handling offer:', err);
      }
    };
    

    const handleAnswer = async ({ sdp, sender }) => {
      try {
        const pc = peerConnections.current[sender];
        if (pc) {
          await pc.setRemoteDescription(new RTCSessionDescription(sdp));
        }
      } catch (err) {
        socket.emit('Errorlogs', `Answer error for ${sender}`, err);
        console.error('Answer error:', err);
      }
    };

    const handleHostLeft = () => {
      setJoined(false);
      setIsStreaming(false);
      closePeerConnections(peerConnections, localStream, setLocalStream, () => setRemoteStreams(new Map()));
    };

    const handleRoomClosed = () => {
      setJoined(false);
      setIsStreaming(false);
      closePeerConnections(peerConnections, localStream, setLocalStream, () => setRemoteStreams(new Map()));
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
        await startViewerStreaming(roomId, hostId);
        setHasRequestedStream(true);
      } else {
        setHasRequestedStream(false);
        Alert.alert("Request Rejected", "Host declined your stream request.");
      }
    };

    const Handleroomchat = ({ userName, message, id }) => {
      setRoomchat(prev => [...prev, {
        id: id,
        userProfile: require('../../assets/images/LS-2.jpg'),
        userName: userName,
        message: message,
      }]);
    };

    // Socket event listeners
    socket.on('connect', handlesocketconnect);
    socket.on('room-created', handleRoomCreated);
    socket.on('room-joined', handleRoomJoined);
    socket.on('room-full', () => Alert.alert('Room Full', 'The room is full. Please try again later.', [{ text: 'OK' }]));
    socket.on('invalid-room', () => Alert.alert('Stream Closed', 'Stream has been ended.', [{ text: 'OK' }]));
    socket.on('room-info', handleRoomInfo);
    socket.on('user-joined', handleUserJoined);
    socket.on('user-left', handleUserLeft);
    socket.on('host-started-streaming', handleHostStartedStreaming);
    socket.on('viewer-started-streaming', handleViewerStartedStreaming);
    socket.on('ice-candidate', handleIceCandidate);
    socket.on('offer', handleOffer);
    socket.on('answer', handleAnswer);
    socket.on('host-left', handleHostLeft);
    socket.on('room-closed', handleRoomClosed);
    socket.on('incoming-stream-request', handleIncomingStreamRequest);
    socket.on('stream-request-response', handleStreamRequestResponse);
    socket.on('viewer-stopped-streaming', handleViewerStoppedStreaming);
    socket.on('host-stopped-streaming', handlehostleftstream);
    socket.on('new-message', Handleroomchat);
    socket.on('socket-id-in-use', () => {
      Alert.alert("User Already Logged In", "Please Logout From Other Device", [
        { text: "OK", onPress: () => onLogout() }
      ]);
    });

    return () => {
      // Clean up all socket listeners
      const events = [
        'connect', 'room-created', 'room-joined', 'room-info', 
        'user-joined', 'user-left', 'host-started-streaming', 
        'viewer-started-streaming', 'ice-candidate', 'offer', 
        'answer', 'host-left', 'room-closed', 'incoming-stream-request',
        'stream-request-response', 'viewer-stopped-streaming',
        'host-stopped-streaming', 'new-message', 'socket-id-in-use','Errorlogs'
      ];
      
      events.forEach(event => socket.off(event));
    };
  }, [isHost]);

  const createRoom = (roomId) => {
    socket.emit('create-room', roomId);
    setTimeout(() => {
      startStreaming(roomId)
    }, 1000);
  };

  const joinRoom = (targetRoomId) => {
    if (targetRoomId.trim()) {
      socket.emit('join-room', targetRoomId);
    }
  };

  const requestStreamPermission = () => {
    if (!hasRequestedStream) {
      socket.emit('request-stream');
      setHasRequestedStream(true);
    }
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
      socket.emit('Errorlogs',`Streaming error:`, err);
      console.error('Streaming error:', err);
    }
  };

  const startViewerStreaming = async (roomId, hostId) => {
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

      // Connect to all existing streamers
      activeStreamers.forEach(streamerId => {
        if (streamerId !== socket.id) {
          connectToStreamer(streamerId);
        }
      });
    } catch (err) {
      console.error('Viewer streaming error:', err);
    }
  };

  const HandleChatmessages = (message) => {
    socket.emit('send-message', {
      userName: userData?.screenName,
      message: message,
      id: userData.userid
    });
  };

  const leaveRoom = () => {
    socket.emit('leave-room');
    setJoined(false);
    setIsStreaming(false);
    setViewers([]);
    setHasRequestedStream(false);
    setActiveStreamers([]);
    closePeerConnections(peerConnections, localStream, setLocalStream, () => setRemoteStreams(new Map()));
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
      }
    }
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