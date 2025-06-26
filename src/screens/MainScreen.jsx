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
      console.log(err);
      throw err;
    }
  };

  // Connect to a streamer function
  const connectToStreamer = async (streamerId) => {
    if (streamerId === socket.id || peerConnections.current[streamerId]) {
      console.log(`Skipping connection to ${streamerId}: Already connected or self`);
      return;
    }

    try {
      console.log(`Creating peer connection to ${streamerId}`);
      const pc = new RTCPeerConnection(iceServers);
      peerConnections.current[streamerId] = pc;

      // Add our stream if we have one
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => {
          pc.addTrack(track, localStreamRef.current);
        });
      }

      pc.onicecandidate = event => {
        if (event.candidate) {
          console.log(`Sending ICE candidate to ${streamerId}`);
          socket.emit('ice-candidate', { target: streamerId, candidate: event.candidate });
        }
      };

      pc.ontrack = event => {
        console.log(`Received track from ${streamerId}`);
        if (event.streams[0]) {
          setRemoteStreams(prev => {
            const newStreams = new Map(prev);
            newStreams.set(streamerId, event.streams[0]);
            return newStreams;
          });
        }
      };

      pc.oniceconnectionstatechange = () => {
        console.log(`ICE state for ${streamerId}: ${pc.iceConnectionState}`);
        if (pc.iceConnectionState === 'failed') {
          console.warn(`ICE failed for ${streamerId}, restarting ICE`);
          pc.restartIce();
        }
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      console.log(`Sending offer to ${streamerId}`);
      socket.emit('offer', { target: streamerId, sdp: offer });
    } catch (err) {
      console.error(`Error connecting to streamer ${streamerId}:`, err);
      delete peerConnections.current[streamerId];
    }
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
      
      setActiveStreamers(streamers);
      streamers.forEach(streamerId => {
        if (streamerId !== socket.id) {
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
      if (hostId !== socket.id && !peerConnections.current[hostId]) {
        connectToStreamer(hostId);
      }
    };

    const handleViewerStartedStreaming = (viewerId) => {
      setActiveStreamers(prev => [...new Set([...prev, viewerId])]);
      if (viewerId !== socket.id && !peerConnections.current[viewerId]) {
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
        Alert.alert("Stream Ended", "The host has left the room. You can now leave the room");
      }
      closePeerConnections(peerConnections, localStream, setLocalStream, () => setRemoteStreams(new Map()));
    };

    const handleIceCandidate = async ({ candidate, sender }) => {
      try {
        const pc = peerConnections.current[sender];
        if (pc && candidate) {
          console.log(`Adding ICE candidate from ${sender}`);
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        }
      } catch (err) {
        console.error(`ICE candidate error for ${sender}:`, err);
      }
    };

    const handleOffer = async ({ sdp, sender }) => {
      try {
        console.log(`Received offer from ${sender}`);

        let pc = peerConnections.current[sender];
        if (!pc) {
          pc = new RTCPeerConnection(iceServers);
          peerConnections.current[sender] = pc;

          if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => {
              pc.addTrack(track, localStreamRef.current);
            });
          }

          pc.onicecandidate = event => {
            if (event.candidate) {
              socket.emit('ice-candidate', { target: sender, candidate: event.candidate });
            }
          };

          pc.ontrack = event => {
            if (event.streams[0]) {
              setRemoteStreams(prev => {
                const newStreams = new Map(prev);
                newStreams.set(sender, event.streams[0]);
                return newStreams;
              });
            }
          };
        }

        await pc.setRemoteDescription(new RTCSessionDescription(sdp));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit('answer', { target: sender, sdp: answer });
      } catch (err) {
        console.error('Offer handling error:', err);
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
        'host-stopped-streaming', 'new-message', 'socket-id-in-use'
      ];
      
      events.forEach(event => socket.off(event));
    };
  }, []);

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