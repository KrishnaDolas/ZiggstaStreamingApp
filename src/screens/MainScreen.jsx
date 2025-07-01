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
import chatimage from '../../assets/images/LS-2.jpg';
import { set } from 'date-fns';
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
  const [hasRequestedStream, setHasRequestedStream] = useState(false);
  const { theme } = useContext(ThemeContext);

  //Handle socket functions 
  const HandleAssignHost= async () => {
    console.log('Assigning host...');
    setIsHost(true);
    await startLocalStream();
  };

  const HandleJoined =async ({ room, users }) => {
    setJoined(true);

    // If no one else, you're host
    if (users.length === 0) {
      setIsHost(true);
      await startLocalStream();
      socket.emit('assignHost');
    }else{
      setIsStreaming(true);
    }
  
    if (isHost && !localStreamRef.current) {
      await startLocalStream();
    }
  
    setViewerCount(users.length);
    console.log('Users in room:', users);
    users.forEach(userId => {
      if (!peersRef.current[userId]) {
        const peer = createPeer(userId);
        peersRef.current[userId] = peer;
      }
    });
  }
  const HandleNewUser =async (userId) => {
    if (!peersRef.current[userId]) {
      const peer = createPeer(userId);
      peersRef.current[userId] = peer;
      //viewer count increment
      setViewerCount(prevCount => prevCount + 1);
      const offer = await peer.createOffer();
      await peer.setLocalDescription({ type: 'offer', sdp: preferVP8(offer.sdp) });
      socket.emit('signal', { to: userId, data: peer.localDescription });
    }
  }
  const HandleSignal=async ({ from, data }) => {
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
  }
  const HandleNewMessage =({ userName, message, id })=>{
    console.log('New message received');
    const data={id: id,userProfile: chatimage,userName: userName,message: message}
    setRoomchat(prev => [...prev, data]);
  }
  const HandleStreamRequest =(requesterId,name) => {
    if (isHost) {
      Alert.alert(
        'Stream Request',
        `User ${name} wants to stream.`,
        [
          {
            text: 'Approve',
            onPress: () => socket.emit('approveStream', requesterId)
          },
          {
            text: 'Reject',
            onPress: () => socket.emit('rejectStream', requesterId),
            style: 'cancel'
          }
        ]
      );
    }
  }
  const HandleApprovedStream = async () => {
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
  }
  const HandleStreamReject = (Name) => {
    setHasRequestedStream(false);
    Alert.alert(
      'Stream Request Rejected',
      `Host ${Name} has rejected your stream request.`,
      [{ text: 'OK' }]
    );
  }
  const HandlereconnectWithNewPeer =async (newUserId) => {
    const peer = peersRef.current[newUserId];
    if (!peer || !localStreamRef.current) return;
  
    localStreamRef.current.getTracks().forEach(track =>
      peer.addTrack(track, localStreamRef.current)
    );
  
    const offer = await peer.createOffer();
    await peer.setLocalDescription({ type: 'offer', sdp: preferVP8(offer.sdp) });
    socket.emit('signal', { to: newUserId, data: peer.localDescription });
  }
  const HandleUserLeft = socketId => {
    console.log(`User left: ${socketId}`);
    setViewerCount(prevCount => prevCount - 1);
    if (peersRef.current[socketId]) {
      console.log(`Closing peer connection for ${socketId}`);
      peersRef.current[socketId].close();
      delete peersRef.current[socketId];
      setRemoteStreams(prev => prev.filter(s => s.id !== socketId));
    }
  }
  const HandleHostLeft = () => {
    console.log('Host left, leaving room...');
    Alert.alert('Host Left','The host has left the room. You will be disconnected.',[{text: 'OK'}]);
    // Stop local stream if exists
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
      setLocalStream(null);
    }
    // clear peer connections
    Object.values(peersRef.current).forEach(peer => peer.close());
    peersRef.current = {};
    // clear pending candidates
    pendingCandidates.current = {};
    // Reset state
    setRemoteStreams([]);
    setViewerCount(0);
    setJoined(false);
    setIsHost(false);
  }
  const HandleHostAction = ({ action }) => {
    if (!localStreamRef.current) return;
  
    if (action === 'mute') {
      localStreamRef.current.getAudioTracks().forEach(track => (track.enabled = false));
      setIsMuted(true);
    } else if (action === 'unmute') {
      localStreamRef.current.getAudioTracks().forEach(track => (track.enabled = true));
      setIsMuted(false);
    } else if (action === 'stop-stream') {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
      setLocalStream(null);
      setIsStreaming(false);
      setHasRequestedStream(true);
    }
  };
  useEffect(() => {
    // Handles socket events
    console.log('Connecting to socket server...');
    socket.on('assignHost', HandleAssignHost);
    socket.on('joined',HandleJoined);
    socket.on('newUser', HandleNewUser);
    socket.on('signal', HandleSignal);
    socket.on('new-message',HandleNewMessage)
    socket.on('streamRequest', HandleStreamRequest);
    socket.on('streamApproved',HandleApprovedStream);
    socket.on('streamRejected',HandleStreamReject)
    socket.on('reconnectWithNewPeer', HandlereconnectWithNewPeer);
    socket.on('host-action', HandleHostAction);
    socket.on('userLeft',HandleUserLeft);
    socket.on('Hostleft',HandleHostLeft)

    return () => {
      // Cleanup socket listeners
      console.log('Disconnecting from socket server...');
      socket.off('assignHost', HandleAssignHost);
      socket.off('joined',HandleJoined);
      socket.off('newUser', HandleNewUser);
      socket.off('signal', HandleSignal);
      socket.off('new-message',HandleNewMessage);
      socket.off('streamRequest', HandleStreamRequest);
      socket.off('streamApproved',HandleApprovedStream);
      socket.off('reconnectWithNewPeer', HandlereconnectWithNewPeer);
      socket.off('host-action', HandleHostAction);
      socket.off('userLeft',HandleUserLeft);
      socket.off('Hostleft',HandleHostLeft)
    }
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
    peer.onaddstream = (event) => {
      console.log(`Received remote stream from ${socketId}`, event.stream);
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
      socket.emit('joinRoom', roomID, userData?.userid, userData?.screenName);
    } catch (err) {
      Alert.alert("Camera/Mic permission denied");
    }
  };
  const requestStreamPermission = () => {
    if (!hasRequestedStream) {
      socket.emit('requestStream');
      setHasRequestedStream(true);
    }
  };

  const startLocalStream = async () => {
    const stream = await mediaDevices.getUserMedia({
      video: { width: 300, height: 320, facingMode: 'user' },audio: true,});
    localStreamRef.current = stream;
    setLocalStream(stream);
    setIsStreaming(true);
  };

  const leaveRoom=()=>{
    // Stop local stream if exists
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
      setLocalStream(null);
      setRemoteStreams([]);
    }
    setJoined(false);
    setViewerCount(0);
    socket.emit('leaveRoom',socket.id)
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
        userName: userData?.screenName,
        message: message,
        id: userData.userid,
        timestamp: new Date().toLocaleTimeString(),
      };
      socket.emit('send-message', newMessage);
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