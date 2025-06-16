import { View, Alert, Platform, SafeAreaView, StatusBar } from 'react-native';
import React, { useState, useEffect, useRef, useContext } from 'react';
import { mediaDevices, RTCPeerConnection, RTCSessionDescription, RTCIceCandidate } from 'react-native-webrtc';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { PermissionsAndroid } from 'react-native';
import { ThemeContext } from '../context/ThemeContext';
import { styles } from '../../assets/styles/ThemeStyles';
import { closePeerConnections, iceServers, socket } from '../utils/constant';
import LinearGradient from 'react-native-linear-gradient';
import StreamList from '../components/StreamList';
import StreamRoom from '../components/StreamRoom';
import Hostscreen from '../streamscreen/Hostscreen';
import Viewerscreen from '../streamscreen/Viewerscreen';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
export const MainScreen = ({ onLogout, userData }) => {
  const insetsTop = useSafeAreaInsets();
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
  const [streamRequest, setStreamRequest] = useState(null);
  const [hasRequestedStream, setHasRequestedStream] = useState(false);
  const [isviewer, setIsViewer] = useState(false);
  const { theme } = useContext(ThemeContext);

  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const peerConnections = useRef({});

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
    const handlesocketconnect = () => {
      socket.emit('identify', userData.userid);
    };
    // Socket event handlers
    const handleRoomCreated = ({ roomId ,socketid}) => {
      setJoined(true);
      setIsHost(true);
      setHostId(socketid);
    };

    const handleRoomJoined = ({ isHostStreaming, viewerCount }) => {
      setIsViewer(true)
      setIsStreaming(isHostStreaming);
      setJoined(true);
      setIsHost(false);
      setHostId(hostId);
      setViewerCount(viewerCount);
    };

    const handleRoomFull = () => {
      setError('Room is full. Cannot join.');
    };

    const handleInvalidRoom = () => {
      setError('Invalid room ID.');
    };

    const handleRoomExists = () => {
      setError('Room already exists.');
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

    const handlestreamingrequest =({ viewerId, customId }) => {
      // Prompt the host to accept/reject the request
      Alert.alert(
        "Stream Request",
        `${customId} wants to start streaming.`,
        [
          {
            text: "Reject",
            onPress: () => socket.emit("respond-stream-request", { viewerId, accepted: false }),
            style: "cancel"
          },
          {
            text: "Accept",
            onPress: () => socket.emit("respond-stream-request", { viewerId, accepted: true })
          }
        ]
      );
    }

    const handleStreamRequestResponse = ({ accepted, hostId }) => {
      if (accepted) {
        startStreaming();
        setHasRequestedStream(false);
        // Proceed with peer connection setup
      } else {
        setHasRequestedStream(false);
        Alert.alert("Request Rejected", "Host declined your stream request.");
      }
    }

    // Register socket listeners
    socket.on('connect', handlesocketconnect);
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
    socket.on("incoming-stream-request",handlestreamingrequest );
    socket.on("stream-request-response",handleStreamRequestResponse);
    
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
      socket.off("incoming-stream-request",handlestreamingrequest );
      socket.off("stream-request-response",handleStreamRequestResponse );
      socket.off('connect', handlesocketconnect);
      closePeerConnections(peerConnections, peerConnectionRef, localStream, setLocalStream, setRemoteStream);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createRoom = (roomId) => {
    console.log('Creating room with ID:', roomId);
    socket.emit('create-room', roomId);
   setTimeout(() => {
    startStreaming(roomId)
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
    socket.emit("request-stream"), { roomId, viewerId: userData.userid };
    setHasRequestedStream(true);
  };

  const startStreaming = async (roomid) => {
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
      socket.emit('host-streaming', roomid);
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
    closePeerConnections(peerConnections, peerConnectionRef, localStream, setRemoteStream);
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
  }

  return (
    <LinearGradient colors={['rgb(160, 0, 223)', 'rgba(252, 70, 146, 1)']} style={{ height: '100%', width: '100%', paddingTop: insetsTop.top }}>
      <StatusBar
        hidden={false} // Show the status bar
        barStyle="light-content"
      />
      <View style={[styles.container]}>

        {!joined ? (
          <StreamList theme={theme} joinRoom={joinRoom} createRoom={createRoom} userData={userData} />
        ) : (<Hostscreen
          localStream={localStream}
          isStreaming={isStreaming}
          isFrontCamera={isFrontCamera}
          isHost={isHost}
          switchCamera={switchCamera}
          toggleMute={toggleMute}
          leaveRoom={leaveRoom}
          isMuted={isMuted}
        />
        )}
        {isviewer && (
          <Viewerscreen
            remoteStream={remoteStream}
            localStream={localStream}
            isStreaming={isStreaming}
            requestStreamPermission={requestStreamPermission}
            hasRequestedStream={hasRequestedStream}
            isFrontCamera={isFrontCamera}
            theme={theme}
            viewerCount={viewerCount}
            toggleMute={toggleMute}
            switchCamera={switchCamera}
            leaveRoom={leaveRoom}
          />
        )}
        {/* Footer */}
      </View>
      {/* <Footer/> */}
    </LinearGradient>


  );
};

