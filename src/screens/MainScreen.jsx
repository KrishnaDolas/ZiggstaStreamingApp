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
import Hostscreen from '../streamscreen/Hostscreen';
import Viewerscreen from '../streamscreen/Viewerscreen';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import StreamRoom from '../components/StreamRoom';

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
    checkAndRequestPermissions().catch(err => console.error('Permission check failed:', err));
  
    const onSocketConnect = () => {
      socket.emit('identify', userData.userid, userData.screenName);
    };
  
    const handleRoomCreated = ({ roomId, socketid }) => {
      setJoined(true);
      setIsHost(true);
      setHostId(socketid);
    };
  
    const handleRoomJoined = ({ roomId, hostId, isHostStreaming, viewerCount, approvedViewerIds }) => {
      setRoomId(roomId);
      setHostId(hostId);
      setIsViewer(true);
      setJoined(true);
      setIsHost(false);
      setIsStreaming(isHostStreaming);
      setViewerCount(viewerCount);
      setIsViewerStreaming(approvedViewerIds.includes(socket.id));
    };
  
    const handleRoomInfo = ({ viewerCount, isViewerStreaming, approvedViewerIds }) => {
      setViewerCount(viewerCount);
      setIsViewerStreaming(isViewerStreaming.includes(socket.id));
      setViewers([...isViewerStreaming, ...approvedViewerIds.filter(id => !isViewerStreaming.includes(id))]);
    };
  
    const handleUserJoined = async (viewerId) => {
      if (!isHost || !localStreamRef.current) return;
      try {
        const pc = new RTCPeerConnection(iceServers);
  
        localStreamRef.current.getTracks().forEach(track => pc.addTrack(track, localStreamRef.current));
  
        pc.onicecandidate = e => e.candidate && socket.emit('ice-candidate', { target: viewerId, candidate: e.candidate });
        pc.ontrack = e => setRemoteStreams(prev => new Map(prev).set(viewerId, e.streams[0]));
        pc.oniceconnectionstatechange = () => {
          if (pc.iceConnectionState === 'failed') {
            pc.close();
            delete peerConnections.current[viewerId];
            setRemoteStreams(prev => {
              const updated = new Map(prev);
              updated.delete(viewerId);
              return updated;
            });
          }
        };
  
        peerConnections.current[viewerId] = pc;
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit('offer', { target: viewerId, sdp: offer });
  
      } catch (err) {
        console.error('Host offer error:', err);
      }
    };
  
    const handleOffer = async ({ sdp, sender }) => {
      try {
        let pc = peerConnections.current[sender];
        if (!pc) {
          pc = new RTCPeerConnection(iceServers);
          peerConnections.current[sender] = pc;
  
          pc.onicecandidate = e => e.candidate && socket.emit('ice-candidate', { target: sender, candidate: e.candidate });
          pc.ontrack = e => setRemoteStreams(prev => new Map(prev).set(sender, e.streams[0]));
          pc.oniceconnectionstatechange = () => {
            if (pc.iceConnectionState === 'failed') {
              pc.close();
              delete peerConnections.current[sender];
              setRemoteStreams(prev => {
                const updated = new Map(prev);
                updated.delete(sender);
                return updated;
              });
            }
          };
  
          if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => pc.addTrack(track, localStreamRef.current));
          }
          if (isViewer && sender === hostId) peerConnectionRef.current = pc;
        }
  
        await pc.setRemoteDescription(new RTCSessionDescription(sdp));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit('answer', { target: sender, sdp: answer });
      } catch (err) {
        console.error('Handle offer error:', err);
      }
    };
  
    const handleAnswer = async ({ sdp, sender }) => {
      try {
        const pc = peerConnections.current[sender] || peerConnectionRef.current;
        if (pc?.signalingState === 'have-local-offer') {
          await pc.setRemoteDescription(new RTCSessionDescription(sdp));
        }
      } catch (err) {
        console.error('Answer error:', err);
      }
    };
  
    const handleIceCandidate = async ({ candidate, sender }) => {
      try {
        const pc = peerConnections.current[sender] || peerConnectionRef.current;
        pc && candidate && await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.error('ICE error:', err);
      }
    };
  
    const handleViewerJoined = async (hostId) => {
      if (!isViewer) return;
      try {
        const pc = new RTCPeerConnection(iceServers);
        peerConnections.current[hostId] = pc;
        peerConnectionRef.current = pc;
  
        pc.onicecandidate = e => e.candidate && socket.emit('ice-candidate', { target: hostId, candidate: e.candidate });
        pc.ontrack = e => setRemoteStreams(prev => new Map(prev).set(hostId, e.streams[0]));
        pc.oniceconnectionstatechange = () => {
          if (pc.iceConnectionState === 'failed') {
            pc.close();
            peerConnectionRef.current = null;
            setRemoteStreams(prev => {
              const updated = new Map(prev);
              updated.delete(hostId);
              return updated;
            });
          }
        };
      } catch (err) {
        console.error('Viewer join error:', err);
      }
    };
  
    const handleHostStartedStreaming = () => setIsStreaming(true);
  
    const handleIncomingStreamRequest = ({ viewerId, name }) => {
      if (!isHost) return;
      Alert.alert("Stream Request", `${name} wants to stream.`, [
        { text: "Reject", style: "cancel", onPress: () => socket.emit("respond-stream-request", { viewerId, accepted: false }) },
        { text: "Accept", onPress: () => socket.emit("respond-stream-request", { viewerId, accepted: true }) },
      ]);
    };
  
    const handleStreamRequestResponse = async ({ accepted, roomId, hostId }) => {
      if (accepted) {
        await startViewerStreaming(roomId, hostId);
        setHasRequestedStream(false);
      } else {
        setHasRequestedStream(false);
        Alert.alert("Request Rejected", "Host rejected your stream request.");
      }
    };
  
    const handleUserLeft = (id) => {
      setViewers(prev => prev.filter(v => v !== id));
      if (peerConnections.current[id]) {
        peerConnections.current[id].close();
        delete peerConnections.current[id];
      }
      setRemoteStreams(prev => {
        const updated = new Map(prev);
        updated.delete(id);
        return updated;
      });
    };
  
    const handleHostLeft = () => {
      setError("Host has left.");
      setJoined(false);
      setIsStreaming(false);
      setIsViewerStreaming(false);
      closePeerConnections(peerConnections, peerConnectionRef, localStream, setLocalStream, () => setRemoteStreams(new Map()));
    };
  
    const handleRoomClosed = () => {
      setError("Room closed.");
      setJoined(false);
      setIsStreaming(false);
      setIsViewerStreaming(false);
      closePeerConnections(peerConnections, peerConnectionRef, localStream, setLocalStream, () => setRemoteStreams(new Map()));
    };
  
    const handleViewerStoppedStreaming = (viewerId) => {
      setIsViewerStreaming(false);
      if (peerConnections.current[viewerId]) {
        peerConnections.current[viewerId].close();
        delete peerConnections.current[viewerId];
      }
      setRemoteStreams(prev => {
        const updated = new Map(prev);
        updated.delete(viewerId);
        return updated;
      });
    };
  
    socket.on('connect', onSocketConnect);
    socket.on('room-created', handleRoomCreated);
    socket.on('room-joined', handleRoomJoined);
    socket.on('room-info', handleRoomInfo);
    socket.on('room-full', () => setError('Room full'));
    socket.on('room-exists', () => setError('Room already exists'));
    socket.on('user-joined', handleUserJoined);
    socket.on('viewer-joined', handleViewerJoined);
    socket.on('ice-candidate', handleIceCandidate);
    socket.on('offer', handleOffer);
    socket.on('answer', handleAnswer);
    socket.on('host-started-streaming', handleHostStartedStreaming);
    socket.on('incoming-stream-request', handleIncomingStreamRequest);
    socket.on('stream-request-response', handleStreamRequestResponse);
    socket.on('viewer-stopped-streaming', handleViewerStoppedStreaming);
    socket.on('user-left', handleUserLeft);
    socket.on('host-left', handleHostLeft);
    socket.on('room-closed', handleRoomClosed);
    socket.on('socket-id-in-use', () => Alert.alert("Already logged in", "Logout from other device", [{ text: "OK", onPress: onLogout }]));
  
    return () => {
      socket.off('connect', onSocketConnect);
      socket.off('room-created', handleRoomCreated);
      socket.off('room-joined', handleRoomJoined);
      socket.off('room-info', handleRoomInfo);
      socket.off('room-full');
      socket.off('room-exists');
      socket.off('user-joined', handleUserJoined);
      socket.off('viewer-joined', handleViewerJoined);
      socket.off('ice-candidate', handleIceCandidate);
      socket.off('offer', handleOffer);
      socket.off('answer', handleAnswer);
      socket.off('host-started-streaming', handleHostStartedStreaming);
      socket.off('incoming-stream-request', handleIncomingStreamRequest);
      socket.off('stream-request-response', handleStreamRequestResponse);
      socket.off('viewer-stopped-streaming', handleViewerStoppedStreaming);
      socket.off('user-left', handleUserLeft);
      socket.off('host-left', handleHostLeft);
      socket.off('room-closed', handleRoomClosed);
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
        console.log('Host received viewer stream:', event.streams[0]);
        setRemoteStreams(prev => new Map(prev).set(hostId, event.streams[0]));
      };
      peerConnectionRef.current = peerConnection;
      peerConnections.current[hostId] = peerConnection;
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