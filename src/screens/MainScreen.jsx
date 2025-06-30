import { View, StatusBar } from 'react-native';
import {
  PermissionsAndroid,
  Platform,
  Alert,
} from 'react-native';
import { mediaDevices, RTCIceCandidate, RTCPeerConnection, RTCSessionDescription } from 'react-native-webrtc';
import React, { useState, useContext,useEffect, useRef, } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import { styles } from '../../assets/styles/ThemeStyles';
import themeColors from '../../assets/styles/Colors';
import LinearGradient from 'react-native-linear-gradient';
import StreamList from '../components/StreamList';
import StreamRoom from '../components/StreamRoom';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { preferVP8, socket } from '../utils/constant';

export const MainScreen = ({address, userData }) => {
  const [remoteStreams, setRemoteStreams] = useState([]);
  const [localStream, setLocalStream] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const localStreamRef = useRef(null);
  const peersRef = useRef({});
  const pendingCandidates = useRef({});
  const insetsTop = useSafeAreaInsets();
  const [joined, setJoined] = useState(false);
  const [roomchat, setRoomchat] = useState([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isFrontCamera, setIsFrontCamera] = useState(true);
  const [isStreaming, setIsStreaming] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);
  const [requestStreamPermission, setRequestStreamPermission] = useState(false);

  const { theme } = useContext(ThemeContext);

  useEffect(() => {
    console.log('Connecting to socket server...');

    socket.on('assignHost', async () => {
      setIsHost(true);
      await startLocalStream();
    });

    socket.on('joined', async ({ room, users }) => {
      setJoined(true);

      // If no one else, you're host
      if (users.length === 0) {
        setIsHost(true);
        await startLocalStream();
        socket.emit('assignHost');
      }
      setViewerCount(users.length);
      console.log('Users in room:', users);
      users.forEach(userId => {
        if (!peersRef.current[userId]) {
          console.log(`Creating peer for user ${userId}`);
          const peer = createPeer(userId);
          peersRef.current[userId] = peer;
        }else{
          console.log(`Peer already exists for user ${userId}`);
        }
      });
    });

    socket.on('newUser', async (userId) => {
      if (!peersRef.current[userId]) {
        const peer = createPeer(userId);
        peersRef.current[userId] = peer;

        const offer = await peer.createOffer();
        await peer.setLocalDescription({ type: 'offer', sdp: preferVP8(offer.sdp) });
        socket.emit('signal', { to: userId, data: peer.localDescription });
      }
    });

    socket.on('signal', async ({ from, data }) => {
      let peer = peersRef.current[from];
      if (!peer) {
        peer = createPeer(from);
        peersRef.current[from] = peer;
      }

      if (data.type === 'offer') {
        await peer.setRemoteDescription(new RTCSessionDescription(data));
        const answer = await peer.createAnswer();
        await peer.setLocalDescription({ type: 'answer', sdp: preferVP8(answer.sdp) });
        socket.emit('signal', { to: from, data: peer.localDescription });

        (pendingCandidates.current[from] || []).forEach(c => peer.addIceCandidate(c));
        pendingCandidates.current[from] = [];
      } else if (data.type === 'answer') {
        if (!peer.remoteDescription) {
          await peer.setRemoteDescription(new RTCSessionDescription(data));
        }
      } else if (data.candidate) {
        const candidate = new RTCIceCandidate(data.candidate);
        if (peer.remoteDescription?.type) {
          await peer.addIceCandidate(candidate);
        } else {
          (pendingCandidates.current[from] = pendingCandidates.current[from] || []).push(candidate);
        }
      }
    });

    socket.on('streamRequest', (requesterId) => {
      if (isHost) {
        Alert.alert(
          'Stream Request',
          `User ${requesterId.slice(0, 4)} wants to stream.`,
          [
            {
              text: 'Approve',
              onPress: () => socket.emit('approveStream', requesterId)
            },
            {
              text: 'Reject',
              style: 'cancel'
            }
          ]
        );
      }
    });

    socket.on('streamApproved', async () => {
      await startLocalStream();
      // Add tracks to existing peer connections
      for (const userId in peersRef.current) {
        const peer = peersRef.current[userId];
        localStreamRef.current.getTracks().forEach(track =>
          peer.addTrack(track, localStreamRef.current)
        );
            // Renegotiate by sending a new offer
    const offer = await peer.createOffer();
    await peer.setLocalDescription({ type: 'offer', sdp: preferVP8(offer.sdp) });

    socket.emit('signal', { to: userId, data: peer.localDescription });
      }
    });

    socket.on('userLeft', socketId => {
      if (peersRef.current[socketId]) {
        peersRef.current[socketId].close();
        delete peersRef.current[socketId];
        setRemoteStreams(prev => prev.filter(s => s.id !== socketId));
      }
    });
  }, [isHost]);
  const createPeer = (socketId) => {
    const peer = new RTCPeerConnection({
      iceServers: [{
        urls: ['turn:coturn.streamalong.live:3478'],
        username: 'webrtcuser',
        credential: 'Test@1234'
      }],
      iceTransportPolicy: 'all',
      sdpSemantics: 'unified-plan'
    });

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track =>
        peer.addTrack(track, localStreamRef.current)
      );
    }
    peer.ontrack = (event) => {
        console.log(`Received track from ${socketId}`, event);
      const stream = event.streams[0];
      if (!stream || !stream.getVideoTracks().length) return;
      setRemoteStreams(prev => {
        const exists = prev.some(s => s.id === socketId);
        if (exists) return prev;
        return [...prev, { id: socketId, stream }];
      });
    };

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('signal', { to: socketId, data: { candidate: event.candidate } });
      }
    };

    return peer;
  };
  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.CAMERA,
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
      ]);
    }
  };

  const joinRoom = async (roomID) => {
    try {
      await requestPermissions();
      socket.emit('joinRoom', roomID);
    } catch (err) {
      Alert.alert("Camera/Mic permission denied");
    }
  };

  const startLocalStream = async () => {
    const stream = await mediaDevices.getUserMedia({ video: true, audio: true });
    localStreamRef.current = stream;
    setLocalStream(stream);
    setIsStreaming(true);
  };

  const leaveRoom=()=>{
    setJoined(false);
    socket.emit('disconnect')
  }
  const toggleMute = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  }
  const switchCamera = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach(track => {
        track._switchCamera();
      });
      setIsFrontCamera(!isFrontCamera);
    }
  };
  const HandleChatmessages = (message) => {
    if (message.trim()) {
      const newMessage = {
        user: userData.name,
        message: message,
        timestamp: new Date().toLocaleTimeString(),
      };
      setRoomchat(prev => [...prev, newMessage]);
      socket.emit('chatMessage', newMessage);
    }
  }

  return (
    <LinearGradient colors={[themeColors.headerGradientTop, themeColors.headerGradientBottom]} style={{ height: '100%', width: '100%', paddingTop: insetsTop.top }}>
      <StatusBar
        hidden={false}
        barStyle="dark-content"
        backgroundColor="#fff"
      />
      <View style={[styles.container]}>
        {!joined ? (
          <StreamList theme={theme} joinRoom={joinRoom} createRoom={joinRoom} userData={userData} address={address} />
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