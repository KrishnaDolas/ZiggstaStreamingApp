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
import StreamRoom from '../components/StreamRoom';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const MainScreen = ({ onLogout, userData }) => {
  const insetsTop = useSafeAreaInsets();
  const [roomId, setRoomId] = useState('');
  const [joined, setJoined] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [hostId, setHostId] = useState('');
  const [viewerCount, setViewerCount] = useState(0);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isViewerStreaming, setIsViewerStreaming] = useState(false);
  const [error, setError] = useState('');
  const [viewers, setViewers] = useState([]);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState(new Map());
  const [isMuted, setIsMuted] = useState(false);
  const [isFrontCamera, setIsFrontCamera] = useState(true);
  const [hasRequestedStream, setHasRequestedStream] = useState(false);
  const [isViewer, setIsViewer] = useState(false);
  const { theme } = useContext(ThemeContext);

  const peerConnectionRef = useRef(null);
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
      setError(err.message);
      throw err;
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
      setHostId(socketid);
    };

    const handleRoomJoined = async ({ roomId, hostId, isHostStreaming, viewerCount, approvedViewerIds, isViewerStreaming }) => {
      setRoomId(roomId);
      setHostId(hostId);
      setIsViewer(true);
      setIsStreaming(isHostStreaming);
      setJoined(true);
      setIsHost(false);
      setViewerCount(viewerCount);
      setIsViewerStreaming(isViewerStreaming.includes(socket.id));
      setViewers([...isViewerStreaming, ...approvedViewerIds.filter(id => !isViewerStreaming.includes(id))]);

      // Initialize peer connections for all streaming viewers
      const streamingIds = isViewerStreaming.filter(id => id !== socket.id);
      for (const viewerId of streamingIds) {
        await handleViewerStartedStreaming(viewerId);
      }
      if (isHostStreaming) {
        await handleViewerJoined(hostId);
      }
    };

    const handleRoomFull = () => {
      setError('Room is full. Cannot join.');
    };

    const handleRoomExists = () => {
      setError('Room already exists.');
    };

    const handleRoomInfo = ({ viewerCount, isViewerStreaming, approvedViewerIds }) => {
      setViewerCount(viewerCount);
      setIsViewerStreaming(isViewerStreaming.includes(socket.id));
      setViewers([...isViewerStreaming, ...approvedViewerIds.filter(id => !isViewerStreaming.includes(id))]);
    };

    const handleUserJoined = async (viewerId) => {
      if (!isHost || !localStreamRef.current || localStreamRef.current.getTracks().length === 0) return;
      try {
        const peerConnection = new RTCPeerConnection(iceServers);
        peerConnection.oniceconnectionstatechange = () => {
          if (peerConnection.iceConnectionState === 'failed') {
            setError('WebRTC connection failed for viewer ' + viewerId);
            peerConnection.close();
            delete peerConnections.current[viewerId];
            setRemoteStreams(prev => {
              const newStreams = new Map(prev);
              newStreams.delete(viewerId);
              return newStreams;
            });
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
        peerConnection.ontrack = event => {
          console.log(`Host received stream from viewer ${viewerId}:`, event.streams[0]);
          setRemoteStreams(prev => new Map(prev).set(viewerId, event.streams[0]));
        };
        peerConnections.current[viewerId] = peerConnection;
        const offer = await peerConnection.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true,
        });
        await peerConnection.setLocalDescription(offer);
        socket.emit('offer', { target: viewerId, sdp: offer });
      } catch (err) {
        console.error('Offer error for viewer', viewerId, err);
        setError('Failed to connect to viewer.');
      }
    };

    const handleViewerJoined = async (hostId) => {
      if (!isViewer) return;
      try {
        const peerConnection = new RTCPeerConnection(iceServers);
        peerConnection.ontrack = event => {
          console.log('Viewer received host stream:', event.streams[0]);
          setRemoteStreams(prev => new Map(prev).set(hostId, event.streams[0]));
        };
        peerConnection.onicecandidate = event => {
          if (event.candidate) {
            socket.emit('ice-candidate', { target: hostId, candidate: event.candidate });
          }
        };
        peerConnection.oniceconnectionstatechange = () => {
          if (peerConnection.iceConnectionState === 'failed') {
            setError('WebRTC connection failed with host.');
            peerConnection.close();
            peerConnectionRef.current = null;
            setRemoteStreams(prev => {
              const newStreams = new Map(prev);
              newStreams.delete(hostId);
              return newStreams;
            });
          }
        };
        peerConnectionRef.current = peerConnection;
        peerConnections.current[hostId] = peerConnection;
      } catch (err) {
        console.error('Viewer joined error:', err);
        setError('Failed to initialize viewer stream.');
      }
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

    const handleHostStartedStreaming = () => {
      setIsStreaming(true);
    };

    const handleViewerStartedStreaming = async (viewerId) => {
      if (viewerId === socket.id || peerConnections.current[viewerId]) {
        console.log('Skipping duplicate peer connection for viewer:', viewerId);
        return;
      }
      try {
        const peerConnection = new RTCPeerConnection(iceServers);
        peerConnection.ontrack = event => {
          console.log(`Received stream from viewer ${viewerId}:`, event.streams[0]);
          setRemoteStreams(prev => new Map(prev).set(viewerId, event.streams[0]));
        };
        peerConnection.onicecandidate = event => {
          if (event.candidate) {
            socket.emit('ice-candidate', { target: viewerId, candidate: event.candidate });
          }
        };
        peerConnection.oniceconnectionstatechange = () => {
          if (peerConnection.iceConnectionState === 'failed') {
            setError('WebRTC connection failed for viewer ' + viewerId);
            peerConnection.close();
            delete peerConnections.current[viewerId];
            setRemoteStreams(prev => {
              const newStreams = new Map(prev);
              newStreams.delete(viewerId);
              return newStreams;
            });
          }
        };
        if (localStreamRef.current) {
          localStreamRef.current.getTracks().forEach(track => {
            peerConnection.addTrack(track, localStreamRef.current);
          });
        }
        peerConnections.current[viewerId] = peerConnection;
        const offer = await peerConnection.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true,
        });
        await peerConnection.setLocalDescription(offer);
        socket.emit('offer', { target: viewerId, sdp: offer });
      } catch (err) {
        console.error('Viewer streaming error:', err);
        setError('Failed to process viewer stream.');
      }
    };

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
        let peerConnection = peerConnections.current[sender];
        if (!peerConnection) {
          peerConnection = new RTCPeerConnection(iceServers);
          peerConnection.ontrack = event => {
            console.log(`Received remote stream from ${sender}:`, event.streams[0]);
            setRemoteStreams(prev => new Map(prev).set(sender, event.streams[0]));
          };
          peerConnection.onicecandidate = event => {
            if (event.candidate) {
              socket.emit('ice-candidate', { target: sender, candidate: event.candidate });
            }
          };
          peerConnection.oniceconnectionstatechange = () => {
            if (peerConnection.iceConnectionState === 'failed') {
              setError('WebRTC connection failed for ' + sender);
              peerConnection.close();
              delete peerConnections.current[sender];
              setRemoteStreams(prev => {
                const newStreams = new Map(prev);
                newStreams.delete(sender);
                return newStreams;
              });
            }
          };
          if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => {
              peerConnection.addTrack(track, localStreamRef.current);
            });
          }
          peerConnections.current[sender] = peerConnection;
          if (isViewer && sender === hostId) peerConnectionRef.current = peerConnection;
        }
        await peerConnection.setRemoteDescription(new RTCSessionDescription(sdp));
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        socket.emit('answer', { target: sender, sdp: answer });
      } catch (err) {
        console.error('Offer handling error:', err);
        setError('Failed to process stream offer.');
      }
    };

    const handleAnswer = async ({ sdp, sender }) => {
      try {
        const pc = peerConnections.current[sender] || peerConnectionRef.current;
        if (pc) {
          if (pc.signalingState !== 'have-local-offer') {
            console.warn(`Cannot set remote answer in signaling state: ${pc.signalingState}`);
            return;
          }
          await pc.setRemoteDescription(new RTCSessionDescription(sdp));
          console.log(`Successfully set remote answer for sender: ${sender}`);
        } else {
          console.warn(`No peer connection found for sender: ${sender}`);
        }
      } catch (err) {
        console.error('Answer error:', err);
        setError('Failed to process stream answer: ' + err.message);
      }
    };

    const handleHostLeft = () => {
      setError('Host has left the room.');
      setJoined(false);
      setIsStreaming(false);
      setIsViewerStreaming(false);
      closePeerConnections(peerConnections, peerConnectionRef, localStream, setLocalStream, () => setRemoteStreams(new Map()));
    };

    const handleRoomClosed = () => {
      setError('Room has been closed.');
      setJoined(false);
      setIsStreaming(false);
      setIsViewerStreaming(false);
      closePeerConnections(peerConnections, peerConnectionRef, localStream, setLocalStream, () => setRemoteStreams(new Map()));
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

    const handleViewerStoppedStreaming = (viewerId) => {
      setIsViewerStreaming(false);
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

    const stopViewerStream = (viewerId) => {
      if (!isHost) return;
      socket.emit('stop-viewer-stream', viewerId);
    };

    socket.on('connect', handlesocketconnect);
    socket.on('room-created', handleRoomCreated);
    socket.on('room-joined', handleRoomJoined);
    socket.on('room-full', handleRoomFull);
    socket.on('invalid-room', () => setError('Invalid room ID.'));
    socket.on('room-exists', handleRoomExists);
    socket.on('room-info', handleRoomInfo);
    socket.on('user-joined', handleUserJoined);
    socket.on('viewer-joined', handleViewerJoined);
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
      socket.off('user-joined', handleUserJoined);
      socket.off('viewer-joined', handleViewerJoined);
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
      socket.off('socket-id-in-use');
      closePeerConnections(peerConnections, peerConnectionRef, localStream, setLocalStream, () => setRemoteStreams(new Map()));
    };
  }, [isHost, isViewer]);

  const createRoom = (roomId) => {
    console.log('Creating room with ID:', roomId);
    socket.emit('create-room', roomId);
    setTimeout(() => {
      startStreaming(roomId);
    }, 3000);
  };

  const joinRoom = (targetRoomId, hostID) => {
    if (!targetRoomId.trim()) {
      setError('Please enter a room ID.');
      return;
    }
    setRoomId(targetRoomId);
    setHostId(hostID);
    socket.emit('join-room', targetRoomId);
  };

  const requestStreamPermission = () => {
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
      setError('Failed to start streaming: ' + err.message);
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

      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }

      const peerConnection = new RTCPeerConnection(iceServers);
      stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));
      peerConnection.onicecandidate = event => {
        if (event.candidate) {
          socket.emit('ice-candidate', { target: hostId, candidate: event.candidate });
        }
      };
      peerConnection.oniceconnectionstatechange = () => {
        if (peerConnection.iceConnectionState === 'failed') {
          setError('WebRTC connection failed with host.');
          peerConnection.close();
          peerConnectionRef.current = null;
          setRemoteStreams(prev => {
            const newStreams = new Map(prev);
            newStreams.delete(hostId);
            return newStreams;
          });
        }
      };
      peerConnection.ontrack = event => {
        console.log('Viewer received host stream:', event.streams[0]);
        setRemoteStreams(prev => new Map(prev).set(hostId, event.streams[0]));
      };
      peerConnectionRef.current = peerConnection;
      peerConnections.current[hostId] = peerConnection;
      const offer = await peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });
      await peerConnection.setLocalDescription(offer);
      socket.emit('offer', { target: hostId, sdp: offer });
      socket.emit('viewer-streaming', roomId);
      setIsViewerStreaming(true);
      setIsStreaming(true);
    } catch (err) {
      console.error('Viewer streaming error:', err);
      setError('Failed to start viewer streaming: ' + err.message);
    }
  };

  const stopStreaming = () => {
    closePeerConnections(peerConnections, peerConnectionRef, localStream, setLocalStream, () => setRemoteStreams(new Map()));
    setIsStreaming(false);
    setIsViewerStreaming(false);
    socket.emit('stop-streaming', roomId);
  };

  const leaveRoom = () => {
    socket.emit('leave-room');
    setJoined(false);
    setIsStreaming(false);
    setIsViewerStreaming(false);
    setViewers([]);
    setRoomId('');
    setHasRequestedStream(false);
    closePeerConnections(peerConnections, peerConnectionRef, localStream, setLocalStream, () => setRemoteStreams(new Map()));
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
            remoteStreams={remoteStreams}
            localStream={localStream}
            isStreaming={isStreaming}
            isViewerStreaming={isViewerStreaming}
            requestStreamPermission={requestStreamPermission}
            hasRequestedStream={hasRequestedStream}
            isFrontCamera={isFrontCamera}
            theme={theme}
            viewerCount={viewerCount}
            toggleMute={toggleMute}
            switchCamera={switchCamera}
            leaveRoom={leaveRoom}
            isMuted={isMuted}
            hostId={hostId}
            viewers={viewers}
            isHost={isHost}
          />
        )}
      </View>
    </LinearGradient>
  );
};