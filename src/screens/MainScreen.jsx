import React, { useState, useEffect, useRef, useContext } from 'react';
import { View, Alert, Platform, StatusBar, PermissionsAndroid } from 'react-native';
import { mediaDevices, RTCPeerConnection, RTCSessionDescription, RTCIceCandidate } from 'react-native-webrtc';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import LinearGradient from 'react-native-linear-gradient';
import { ThemeContext } from '../context/ThemeContext';
import { styles } from '../../assets/styles/ThemeStyles';
import themeColors from '../../assets/styles/Colors';
import StreamList from '../components/StreamList';
import StreamRoom from '../components/StreamRoom';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { closePeerConnections, iceServers, socket } from '../utils/constant';

export const MainScreen = ({ onLogout, address, userData }) => {
  const insets = useSafeAreaInsets();
  const { theme } = useContext(ThemeContext);

  // ➕ State & Refs
  const [joined, setJoined] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState(new Map());
  const [activeStreamers, setActiveStreamers] = useState([]);
  const [hasRequestedStream, setHasRequestedStream] = useState(false);
  const [roomchat, setRoomchat] = useState([]);

  const localStreamRef = useRef(null);
  const peerConnections = useRef({});

  // 📋 Permission helper
  const checkAndRequestPermissions = async () => {
    if (Platform.OS === 'ios') {
      const cam = await check(PERMISSIONS.IOS.CAMERA);
      const mic = await check(PERMISSIONS.IOS.MICROPHONE);
      if (cam !== RESULTS.GRANTED) await request(PERMISSIONS.IOS.CAMERA);
      if (mic !== RESULTS.GRANTED) await request(PERMISSIONS.IOS.MICROPHONE);
    } else {
      const res = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.CAMERA,
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      ]);
      if (res[PermissionsAndroid.PERMISSIONS.CAMERA] !== RESULTS.GRANTED ||
          res[PermissionsAndroid.PERMISSIONS.RECORD_AUDIO] !== RESULTS.GRANTED) {
        throw new Error('Camera or mic permission not granted');
      }
    }
  };

  // 🔁 Clean & robust connectTo
  const connectTo = async (peerId) => {
    if (peerId === socket.id) return;

    const existing = peerConnections.current[peerId];
    if (existing) {
      const state = existing.iceConnectionState;
      if (state === 'connected' || state === 'checking') return;
      if (state === 'disconnected' || state === 'failed') {
        try {
          const offer = await existing.createOffer({ iceRestart: true });
          await existing.setLocalDescription(offer);
          socket.emit('offer', { target: peerId, sdp: offer });
          return;
        } catch (e) { /* fallback */ }
      }
      existing.close();
      delete peerConnections.current[peerId];
    }

    const pc = new RTCPeerConnection(iceServers);
    peerConnections.current[peerId] = pc;

    // Add tracks or transceivers
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => pc.addTrack(t, localStreamRef.current));
    } else {
      ['video', 'audio'].forEach(kind =>
        pc.addTransceiver(kind, { direction: 'recvonly' })
      );
    }

    pc.onnegotiationneeded = async () => {
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit('offer', { target: peerId, sdp: offer });
      } catch (e) {
        console.error('Negotiation error', e);
      }
    };

    pc.onicecandidate = e => {
      if (e.candidate) {
        socket.emit('ice-candidate', { target: peerId, candidate: e.candidate });
      }
    };

    pc.ontrack = e => {
      if (e.streams[0]) {
        setRemoteStreams(m => new Map(m).set(peerId, e.streams[0]));
      }
    };

    pc.oniceconnectionstatechange = async () => {
      const s = pc.iceConnectionState;
      console.log(`[${peerId}] ICE: ${s}`);

      if (s === 'disconnected') {
        try {
          const offer = await pc.createOffer({ iceRestart: true });
          await pc.setLocalDescription(offer);
          socket.emit('offer', { target: peerId, sdp: offer });
        } catch (_) {}
      }

      if (['failed', 'closed'].includes(s)) {
        pc.close();
        delete peerConnections.current[peerId];
        setRemoteStreams(m => { m.delete(peerId); return new Map(m); });
      }
    };
  };

  // 🎯 Handlers

  const handleOffer = async ({ sdp, sender }) => {
    let pc = peerConnections.current[sender];
    if (!pc) {
      pc = new RTCPeerConnection(iceServers);
      peerConnections.current[sender] = pc;

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(t => pc.addTrack(t, localStreamRef.current));
      }
      pc.onicecandidate = e => e.candidate && socket.emit('ice-candidate', { target: sender, candidate: e.candidate });
      pc.ontrack = e => e.streams[0] && setRemoteStreams(m => new Map(m).set(sender, e.streams[0]));
      pc.oniceconnectionstatechange = () => {}; // Let onnegotiation handle rest
    }

    await pc.setRemoteDescription(new RTCSessionDescription(sdp));
    const ans = await pc.createAnswer();
    await pc.setLocalDescription(ans);
    socket.emit('answer', { target: sender, sdp: ans });
  };

  const handleAnswer = async ({ sdp, sender }) => {
    const pc = peerConnections.current[sender];
    if (pc) await pc.setRemoteDescription(new RTCSessionDescription(sdp));
  };

  const handleCandidate = async ({ candidate, sender }) => {
    const pc = peerConnections.current[sender];
    if (pc && candidate) {
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
    }
  };

  // 📥 Socket events setup
  useEffect(() => {
    checkAndRequestPermissions().catch(console.error);
    socket.on('connect', () => socket.emit('identify', userData.userid, userData.screenName));
    socket.on('room-created', ({ socketid }) => {
      setJoined(true); setIsHost(true);
    });
    socket.on('room-joined', ({ hostId, isHostStreaming, viewerCount, approvedViewerIds, isViewerStreaming, messages }) => {
      setJoined(true); setIsHost(false); setViewerCount(viewerCount);
      setIsStreaming(isHostStreaming);
      setRoomchat(messages);

      const active = [];
      if (isHostStreaming) active.push(hostId);
      isViewerStreaming.forEach(id => approvedViewerIds.includes(id) && active.push(id));
      setActiveStreamers(active);

      active.forEach(id => connectTo(id));
    });

    socket.on('host-started-streaming', id => {
      setIsStreaming(true);
      if (id !== socket.id) connectTo(id);
    });

    socket.on('viewer-started-streaming', id => {
      setActiveStreamers(a => Array.from(new Set([...a, id])));
      connectTo(id);
    });

    socket.on('host-stopped-streaming', () => {
      setIsStreaming(false);
      closePeerConnections(peerConnections, localStream, setLocalStream, () => setRemoteStreams(new Map()));
      setActiveStreamers([]);
    });

    socket.on('viewer-stopped-streaming', id => {
      if (peerConnections.current[id]) {
        peerConnections.current[id].close();
        delete peerConnections.current[id];
      }
      setRemoteStreams(m => { m.delete(id); return new Map(m); });
      setActiveStreamers(a => a.filter(x => x !== id));
    });

    socket.on('ice-candidate', handleCandidate);
    socket.on('offer', handleOffer);
    socket.on('answer', handleAnswer);

    socket.on('host-left', () => {
      setJoined(false); setIsStreaming(false);
      closePeerConnections(peerConnections, localStream, setLocalStream, () => setRemoteStreams(new Map()));
    });
    socket.on('room-closed', () => {
      setJoined(false); setIsStreaming(false);
      closePeerConnections(peerConnections, localStream, setLocalStream, () => setRemoteStreams(new Map()));
    });

    socket.on('new-message', ({ userName, message, id }) => {
      setRoomchat(c => [...c, { id, userName, message, userProfile: null }]);
    });

    socket.on('incoming-stream-request', ({ viewerId, name }) => {
      Alert.alert(
        `${name} wants to start streaming`,
        '',
        [
          { text: 'Reject', onPress: () => socket.emit('respond-stream-request', { viewerId, accepted: false }) },
          { text: 'Accept', onPress: () => socket.emit('respond-stream-request', { viewerId, accepted: true }) },
        ]
      );
    });

    socket.on('stream-request-response', async ({ accepted, roomId }) => {
      if (accepted) {
        await startViewerStreaming(roomId);
        setHasRequestedStream(true);
      } else {
        setHasRequestedStream(false);
        Alert.alert('Request Rejected', 'Host declined your request.');
      }
    });

    socket.on('socket-id-in-use', () => {
      Alert.alert('Already Logged In', '', [{ text: 'OK', onPress: onLogout }]);
    });

    return () => {
      socket.off();
    };
  }, [isHost,joined]);

  // 🎤 Local Streaming
  const createRoom = roomId => {
    socket.emit('create-room', roomId);
    setTimeout(() => startStreaming(roomId), 1000);
  };

  const joinRoom = roomId => {
    if (roomId.trim()) socket.emit('join-room', roomId);
  };

  const startStreaming = async roomId => {
    await checkAndRequestPermissions();
    const stream = await mediaDevices.getUserMedia({ video: true, audio: true });
    setLocalStream(stream);
    localStreamRef.current = stream;
    socket.emit(isHost ? 'host-streaming' : 'viewer-streaming', roomId);
    setIsStreaming(true);
  };

  const startViewerStreaming = async roomId => {
    await startStreaming(roomId);
    activeStreamers.forEach(id => id !== socket.id && connectTo(id));
  };

  const leaveRoom = () => {
    socket.emit('leave-room');
    setJoined(false); setIsStreaming(false);
    setActiveStreamers([]);
    closePeerConnections(peerConnections, localStream, setLocalStream, () => setRemoteStreams(new Map()));
  };

  const sendMessage = msg => {
    socket.emit('send-message', {
      userName: userData?.screenName,
      message: msg,
      id: userData.userid,
    });
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(t => (t.enabled = !t.enabled));
    }
  };

  const switchCamera = () => {
    if (localStreamRef.current) {
      const t = localStreamRef.current.getVideoTracks()[0];
      t && typeof t._switchCamera === 'function' && t._switchCamera();
    }
  };

  return (
    <LinearGradient
      colors={[themeColors.headerGradientTop, themeColors.headerGradientBottom]}
      style={{ flex: 1, paddingTop: insets.top }}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.container}>
        {!joined ? (
          <StreamList
            theme={theme}
            joinRoom={joinRoom}
            createRoom={createRoom}
            userData={userData}
            address={address}
          />
        ) : (
          <StreamRoom
            remoteStreams={remoteStreams}
            localStream={localStream}
            isStreaming={isStreaming}
            requestStreamPermission={() => setHasRequestedStream(true)}
            toggleMute={toggleMute}
            switchCamera={switchCamera}
            leaveRoom={leaveRoom}
            isHost={isHost}
            viewerCount={viewerCount}
            HandleChatmessages={sendMessage}
            roomchat={roomchat}
          />
        )}
      </View>
    </LinearGradient>
  );
};
