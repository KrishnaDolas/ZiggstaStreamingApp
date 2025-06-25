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
      const pc = new RTCPeerConnection(iceServers);
      pc.addTransceiver('video', { direction: 'recvonly' });
      pc.addTransceiver('audio', { direction: 'recvonly' });
      peerConnections.current[streamerId] = pc;

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
        if (event.streams[0]) {
          console.log(`Received stream from ${streamerId}:`, event.streams[0]);
          setRemoteStreams(prev => new Map(prev).set(streamerId, event.streams[0]));
        }
      };

      pc.onaddstream = event => {
        if (event.stream) {
          console.log(`[ONADDSTREAM] from ${streamerId}`, event.stream);
          setRemoteStreams(prev => new Map(prev).set(streamerId, event.stream));
        }
      };

      pc.oniceconnectionstatechange = () => {
        console.log(`ICE connection state for ${streamerId}: ${pc.iceConnectionState}`);
        if (pc.iceConnectionState === 'failed') {
          console.warn(`ICE connection failed with ${streamerId}`);
          pc.restartIce(); // Attempt ICE renegotiation
          setTimeout(() => {
            if (pc.iceConnectionState !== 'connected' && peerConnections.current[streamerId]) {
              console.log(`Retrying connection to ${streamerId}`);
              pc.close();
              delete peerConnections.current[streamerId];
              connectToStreamer(streamerId);
            }
          }, 10000); // Wait 10s for signaling to complete
        } else if (pc.iceConnectionState === 'disconnected') {
          console.warn(`ICE connection disconnected with ${streamerId}`);
          setTimeout(() => {
            if (pc.iceConnectionState !== 'connected' && peerConnections.current[streamerId]) {
              pc.restartIce();
            }
          }, 5000); // Wait 5s before retrying ICE
        } else if (pc.iceConnectionState === 'closed') {
          console.log(`Peer connection closed for ${streamerId}`);
          delete peerConnections.current[streamerId];
          setRemoteStreams(prev => {
            const newStreams = new Map(prev);
            newStreams.delete(streamerId);
            return newStreams;
          });
        } else if (pc.iceConnectionState === 'connected') {
          console.log(`Successfully connected to ${streamerId}`);
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
      setJoined(true);
      setIsHost(true);
    };

    const handleRoomJoined = ({ roomId, hostId, isHostStreaming, viewerCount, approvedViewerIds, isViewerStreaming }) => {
      console.log(`Joined room ${roomId}, hostId: ${hostId}, isHostStreaming: ${isHostStreaming}`);
      setIsStreaming(isHostStreaming);
      setJoined(true);
      setIsHost(false);
      setViewerCount(viewerCount);

      const streamers = [];
      if (isHostStreaming) {
        console.log(`Host ${hostId} is streaming; adding to active streamers`);
        streamers.push(hostId);
      }
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
      console.log(props);
      setViewerCount(viewerCount);

      // Update active streamers
      const streamers = [];
      if (isHostStreaming) streamers.push(hostId);
      streamers.push(...isViewerStreaming);
      setActiveStreamers(streamers);
    };

    // IMPORTANT: Reinstated user-joined handler
    const handleUserJoined = (viewerId, name) => {
      setViewers(prev => [...prev, viewerId]);
    };

    // IMPORTANT: Reinstated user-left handler
    const handleUserLeft = (viewerId) => {
      setViewers(prev => prev.filter(id => id !== viewerId));
      if (peerConnections.current[viewerId]) {
        peerConnections.current[viewerId].close();
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
      if (hostId !== socket.id) {
        connectToStreamer(hostId);
      }
    };

    const handleViewerStartedStreaming = (viewerId) => {
      setActiveStreamers(prev => [...prev, viewerId]);
      if (viewerId !== socket.id) {
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
          console.log(`Adding ICE candidate from ${sender}`);
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } else {
          console.warn(`No peer connection or invalid candidate for ${sender}`);
        }
      } catch (err) {
        console.error(`ICE candidate error for ${sender}:`, err);
      }
    };

    const handleOffer = async ({ sdp, sender }) => {
      try {
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
            console.log(`Received remote stream from ${sender}:`, event.streams[0]);
            setRemoteStreams(prev => new Map(prev).set(sender, event.streams[0]));
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
      console.log('Host has left the room.');
      setJoined(false);
      setIsStreaming(false);
      closePeerConnections(peerConnections, localStream, setLocalStream, () => setRemoteStreams(new Map()));
    };

    const handleRoomClosed = () => {
      console.log('Room has been closed.');
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
        console.log(`Stream request accepted for room ${roomId}`);
        await startViewerStreaming(roomId, hostId);
        setHasRequestedStream(true);
      } else {
        setHasRequestedStream(false);
        Alert.alert("Request Rejected", "Host declined your stream request.");
      }
    };

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
    socket.on('host-stopped-streaming', handlehostleftstream)
    socket.on('socket-id-in-use', () => {
      Alert.alert("User Already Logged In", "Please Logout From Other Device", [
        { text: "OK", onPress: () => onLogout() }
      ]);
    });

    return () => {
      socket.off('connect', handlesocketconnect);
      socket.off('room-created', handleRoomCreated);
      socket.off('room-joined', handleRoomJoined);
      socket.off('room-full', () => Alert.alert('Room Full', 'The room is full. Please try again later.', [{ text: 'OK' }]));
      socket.off('invalid-room');
      socket.off('room-info', handleRoomInfo);
      socket.off('user-joined', handleUserJoined);
      socket.off('user-left', handleUserLeft);
      socket.off('host-started-streaming', handleHostStartedStreaming);
      socket.off('viewer-started-streaming', handleViewerStartedStreaming);
      socket.off('ice-candidate', handleIceCandidate);
      socket.off('offer', handleOffer);
      socket.off('answer', handleAnswer);
      socket.off('host-left', handleHostLeft);
      socket.off('room-closed', handleRoomClosed);
      socket.off('incoming-stream-request', handleIncomingStreamRequest);
      socket.off('stream-request-response', handleStreamRequestResponse);
      socket.off('viewer-stopped-streaming', handleViewerStoppedStreaming);
      socket.off('host-stopped-streaming', handlehostleftstream)
      socket.off('socket-id-in-use', () => {
        Alert.alert("User Already Logged In", "Please Logout From Other Device", [
          { text: "OK", onPress: () => onLogout() }
        ]);
      });
    };
  }, [isHost]);

  const createRoom = (roomId) => {
    console.log('Creating room with ID:', roomId);
    socket.emit('create-room', roomId);
    console.log(socket);
    setTimeout(() => {
      startStreaming(roomId)
    }, 1000);
  };

  const joinRoom = (targetRoomId) => {
    if (!targetRoomId.trim()) {
      console.log('Please enter a room ID.');
      return;
    }
    socket.emit('join-room', targetRoomId);
  };

  const requestStreamPermission = () => {
    if (!hasRequestedStream) {
      socket.emit('request-stream');
      setHasRequestedStream(true);
    } else {
      Alert.alert('Stream Request', 'You Are already Streaming')
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

      // Connect to all existing streamers
      activeStreamers.forEach(streamerId => {
        if (streamerId !== socket.id) {
          connectToStreamer(streamerId);
        }
      });
    } catch (err) {
      console.error('Streaming error:', err);
      console.log('Failed to start streaming: ' + err.message);
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
      console.log('Failed to start viewer streaming: ' + err.message);
    }
  };
  const HandleChatmessages = (message) => {
    console.log(`New message from ${userData?.screenName}: ${message.text}`);
    socket.emit('send-message', {
      userName: userData?.screenName,
      message: message,
    });
  }

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
      } else {
        Alert.alert('Camera Error', 'Unable to switch camera. Please check your device settings.');
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
          />
        )}
      </View>
    </LinearGradient>
  );
};