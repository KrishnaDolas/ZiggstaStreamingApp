import { View, StatusBar } from 'react-native';
import {
  PermissionsAndroid,
  Platform,
  Alert,
} from 'react-native';
import { AppState } from 'react-native';
import InCallManager from 'react-native-incall-manager';
import { mediaDevices, RTCIceCandidate, RTCPeerConnection, RTCSessionDescription } from 'react-native-webrtc';
import React, { useState, useContext, useEffect, useRef, } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import { styles } from '../../assets/styles/ThemeStyles';
import themeColors from '../../assets/styles/Colors';
import LinearGradient from 'react-native-linear-gradient';
import StreamList from '../components/StreamList';
import StreamRoom from '../components/StreamRoom';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { iceServers, preferVP8, SendErrorTotheServer, socket } from '../utils/constant';
import chatimage from '../../assets/images/LS-2.jpg';
import joinImage from '../../assets/images/LS-1.jpg';

import Apiclient from '../utils/Apiclient';
import Loader from '../Loader/Loader';
import { useAppContext } from '../context/AppContext';
import DisconnectedPanel from '../modals/DisconnectedPanel';
export const MainScreen = () => {
  const { userData, userAddress } = useAppContext()
  const [remoteStreams, setRemoteStreams] = useState([]);
  const [localStream, setLocalStream] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const localStreamRef = useRef(null);
  const [isloading, setIsLoading] = useState(false);
  const peersRef = useRef({});
  const pendingCandidates = useRef({});
  const insetsTop = useSafeAreaInsets();
  const [joined, setJoined] = useState(false);
  const [roomchat, setRoomchat] = useState([]);
  const [isMuted, setIsMuted] = useState({ HostControl: false, muted: false });
  const [isFrontCamera, setIsFrontCamera] = useState(true);
  const [isStreaming, setIsStreaming] = useState(false);
  const [Streamupdated,setStreamupdated]=useState({viewerCount:0,LikeCount:0})
  const [hasRequestedStream, setHasRequestedStream] = useState(false);
  const [streamInfo, setStreamInfo] = useState(null);
  const { theme } = useContext(ThemeContext);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [refreshlobby, setRefreshLobby] = useState(false); // For refreshing lobby
  const [leaveroomrefresh, setLeaveRoomRefresh] = useState(false); // For refreshing after leaving room
  const [streamrequestlist, setStreamRequestList] = useState([]); //{CustomID:23, Name: "viki",IsMuted:true,country:'india',city:'pune'}
  const [streamGuest, setStreamGuest] = useState([]); // {CustomID:23, Name: "viki",IsMuted:true,country:'india',city:'pune'}
  const [isuserstreaming, setIsUserStreaming] = useState(false); // Track if user is streaming
  const [connectingpanel, setconnectingpanel] = useState(false)
  const countdownRef = useRef(null);
  const IsIdentify = useRef(false)

  useEffect(() => {
    const handleAppStateChange = async (nextAppState) => {
      console.log(`📱 App state changed to: ${nextAppState}`);
      const IsValid = isuserstreaming || isHost;

      if (nextAppState === 'active' && isStreaming && IsValid) {
        console.log('🔄 Resuming: restarting local stream...');
        socket.emit('stream-Resume', socket.id)
        // Optional small delay to allow app to fully resume
        setTimeout(async () => {
          try {
            socket.emit('stream-negotiate')
            setTimeout(() => {
              HandleApprovedStream()
            }, 1000);
          } catch (err) {
            console.error('⚠️ Error while resuming stream:', err);
          }
        }, 1000); // Delay for app stability

      } else if (nextAppState === 'background' && isStreaming && IsValid) {
        console.log('⏸ App in background: stopping local stream');

        try {
          if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
            localStreamRef.current = null;
            setLocalStream(null);
            setHasRequestedStream(false);
            // Stop InCallManager
            InCallManager.stop();
          }
          setRemoteStreams([])
          peersRef.current = {};
          for (const [userId, peer] of Object.entries(peersRef.current)) {
            if (peersRef.current[userId]) {
              peersRef.current[userId].close();
              delete peersRef.current[userId]
            }
          }
        } catch (err) {
          console.warn('⚠️ Error while stopping stream:', err);
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [isStreaming, isHost, isuserstreaming, isFrontCamera]);


  const connectSocket = () => {
    console.log('Connecting to socket server...');
    // Connect logic
    socket.connect();
    setIsSocketConnected(true); // Update connection status
  };
  const disconnectSocket = () => {
    console.log('Disconnecting from socket server...');
    // Disconnect logic
    socket.disconnect();
    IsIdentify.current = false;
    setIsSocketConnected(false); // Update connection status
  };
  const HandleConnect = () => {
    clearInterval(countdownRef.current);
    console.log('✅ Connected to Socket.IO server');
    setconnectingpanel(false)
    setIsSocketConnected(true); // Update connection status
    if (!IsIdentify.current && userData) {
      setTimeout(() => {
        socket.emit('identity', userData?.userid, userData?.screenName);
      }, 2000);
      IsIdentify.current = true; // Set identify flag to true
      if (streamInfo) {
        const roomID = streamInfo?.roomID.toString()
        socket.emit('reconnectUser', userData?.userid, userData?.screenName, roomID, isHost)
      }
    }
  }
  const HandleClearOldInstance = () => {
    localStreamRef.current = null;
    setLocalStream(null);
    setRemoteStreams([]);
    Object.values(peersRef.current)?.forEach(peer => peer.close());
    peersRef.current = {};
    pendingCandidates.current = {};
    setIsMuted({ HostControl: false, muted: false })
    setHasRequestedStream(false)
    setStreamRequestList([])
    setIsUserStreaming(false)
    setStreamGuest([])
  }
  //Handle socket functions 
  const HandleAssignHost = async () => {
    try {
      setIsHost(true);
      await startLocalStream();
    } catch (error) {
      SendErrorTotheServer(error, 'HandleAssignHost');
    }
  };

  const HandleJoined = async ({ users, IsHost, ChatMessages }) => {
    try {
      // If no one else, you're host
      if (users.length === 0 || IsHost) {
        setJoined(true);
        setIsLoading(false);
        setIsHost(true);
        await requestPermissions();
        await startLocalStream();
        socket.emit('assignHost');
      } else {
        setIsLoading(true);
        setTimeout(() => {
          setJoined(true);
          setIsLoading(false);
        }, 2000);
        setIsStreaming(true);
      }

      if (isHost && !localStreamRef.current) {
        await startLocalStream();
      }

      users.forEach(userId => {
        if (!peersRef.current[userId]) {
          const peer = createPeer(userId);
          peersRef.current[userId] = peer;
        }
      });
      if (ChatMessages) {
        setRoomchat(ChatMessages)
      }
    } catch (error) {
      SendErrorTotheServer(error, 'HandleJoined');
    }
  }
  const HandleStreamNotAvailable = () => {
    Alert.alert('Stream Not Available', 'The host is not streaming at the moment. Please try again later.',
      [{ text: 'OK' }]
    );
  }
  const HandleNewUser = async (userId) => {
    try {
      if (!peersRef.current[userId]) {
        const peer = createPeer(userId);
        peersRef.current[userId] = peer;
        //viewer count increment
        const offer = await peer.createOffer();
        await peer.setLocalDescription({ type: 'offer', sdp: preferVP8(offer.sdp) });
        socket.emit('signal', { to: userId, data: peer.localDescription });
      }
    } catch (error) {
      SendErrorTotheServer(error, 'HandleNewUser');
    }
  }
  const HandleSignal = async ({ from, data }) => {
    try {
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
    } catch (error) {
      socket.emit('Clientlogs', error)
      SendErrorTotheServer(error, 'HandleSignal');
    }
  }
  const HandleNewMessage = ({ userName, message, id }) => {
    try {
      const data = { id: id, userProfile: chatimage, userName: userName, message: message,TYPE:"PLAYERCHAT"}
      setRoomchat(prev => [...prev, data]);
    } catch (error) {
      SendErrorTotheServer(error, 'HandleNewMessage');
    }
  }
  const HandleStreamRequest = (streamrequsts) => {
    try {
      setStreamRequestList(streamrequsts);
    } catch (error) {
      SendErrorTotheServer(error, 'HandleStreamRequest');
    }
  }

  const HandleApprovedStream = async () => {
    try {
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
        setIsUserStreaming(true); // Set user as streaming
      }
    } catch (error) {
      SendErrorTotheServer(error, 'HandleApprovedStream');
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
  const HandlereconnectWithNewPeer = async ({ socketId }) => {
    // Only run if I'm host OR viewer and it's not my own socket
    if (socket.id !== socketId && localStreamRef.current) {
      console.log(`🔄 Reconnecting with peer id (${socketId})`);

      const peer = createPeer(socketId);
      peersRef.current[socketId] = peer;

      localStreamRef.current.getTracks().forEach(track => {
        peer.addTrack(track, localStreamRef.current);
      });

      const offer = await peer.createOffer();
      await peer.setLocalDescription({ type: 'offer', sdp: preferVP8(offer.sdp) });

      socket.emit('signal', { to: socketId, data: peer.localDescription });
    }
  }
  const HandleGetListStreamers = (streamers) => {
    setStreamGuest(streamers);
  }
  const HandleUserLeft = socketId => {
    try {
      if (peersRef.current[socketId]) {
        peersRef.current[socketId].close();
        delete peersRef.current[socketId];
        setRemoteStreams(prev => prev.filter(s => s.id !== socketId));
      }
    } catch (error) {
      SendErrorTotheServer(error, 'HandleUserLeft');
    }
  }
  const HandleHostLeft = () => {
    try {
      Alert.alert('Host Left', 'The host has left the room. You will be disconnected.', [{ text: 'OK' }]);
      // Stop local stream if exists
      setRoomchat([])
      setHasRequestedStream(false);
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
      setStreamupdated({viewerCount:0,LikeCount:0});
      setJoined(false);
      setIsHost(false);
      setStreamInfo(null)
    } catch (error) {
      SendErrorTotheServer(error, 'HandleHostLeft');
    }
  }
  const HandleRoomInfo = (info) => {
    console.log(info);
    setStreamupdated({viewerCount:info?.viewerCount,LikeCount:info?.LikeCount})
  }
  const HandleNewStream = () => {
    setRefreshLobby(!refreshlobby); // Toggle refresh state
  }
  const HandleLeaveStream = () => {
    setLeaveRoomRefresh(!leaveroomrefresh); // Toggle leave room refresh state
  }
  const HandleRoomFull = (msg) => {
    Alert.alert('Room Full', msg, [{ text: 'OK' }]);
  }
  const stopLocalStream = () => {
    try {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
        localStreamRef.current = null;
        setLocalStream(null);
        setHasRequestedStream(false);
        setIsUserStreaming(false); // Reset user streaming status
        // Stop InCallManager
        InCallManager.stop();
      }
      // setRemoteStreams([])
      peersRef.current = {};
      for (const [userId, peer] of Object.entries(peersRef.current)) {
        if (peersRef.current[userId]) {
          peersRef.current[userId].close();
          delete peersRef.current[userId]
        }
      }
      socket.emit('stream-negotiate')

    } catch (error) {
      SendErrorTotheServer(error, 'stopLocalStream');
    }
  }
  const HandleHostAction = ({ action }) => {
    try {
      if (!localStreamRef.current) return;

      if (action === 'mute') {
        localStreamRef.current.getAudioTracks().forEach(track => (track.enabled = false));
        setIsMuted({ HostControl: true, muted: true });
      } else if (action === 'unmute') {
        localStreamRef.current.getAudioTracks().forEach(track => (track.enabled = true));
        setIsMuted({ HostControl: false, muted: false });
      } else if (action === 'stop-stream') {
        stopLocalStream();
      }
    } catch (error) {
      SendErrorTotheServer(error, 'HandleHostAction');
    }
  };
  const HandleUserStreamStoped = (userId) => {
    try {
      if (socket.id !== userId) {
        if (peersRef.current[userId]) {
          peersRef.current[userId].close();
          delete peersRef.current[userId];
          setRemoteStreams(prev => prev.filter(s => s.id !== userId));
        } else {
          console.log(`No peer connection found for ${userId}`);
        }
      } else {
        console.log(`You stopped streaming`);
        // rerender the remote streams
        setRemoteStreams(prev => prev.filter(s => s.id !== userId));
      }
    } catch (error) {
      SendErrorTotheServer(error, 'HandleUserStreamStoped');
    }
  }
  const HandleStreamList = (list) => {
    console.log(list);
  }
  const HandlenewUserJoined=(userinfo)=>{
    console.log(userinfo);
    const data = { id: userinfo?.customid||1, userProfile: joinImage, userName: `${userinfo.Name} joined`, message: '',TYPE:"USERJOINED"}
    setRoomchat(prev => [...prev, data]);
  }
  const HandleDisconnected = () => {
    console.log('❌ Disconnected from socket server');
    setIsSocketConnected(false)
    setconnectingpanel(true)
    IsIdentify.current = false; // Reset identify flag
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
      setLocalStream(null);
    }
    setRemoteStreams([])
    if (peersRef.current) {
      // clear peer connections
      Object.values(peersRef.current).forEach(peer => peer.close());
      peersRef.current = {};
      // clear pending candidates
      pendingCandidates.current = {};
    }
  }
  const HandleStopStream = (streamlist) => {

    streamlist.forEach((userId) => {
      if (peersRef.current[userId]) {
        peersRef.current[userId].close();
        delete peersRef.current[userId];
        setRemoteStreams(prev => prev.filter(s => s.id !== userId));
      }
    })

    streamlist.forEach(userId => {
      if (!peersRef.current[userId]) {
        const peer = createPeer(userId);
        peersRef.current[userId] = peer;
      }
    });
  }


  useEffect(() => {
    HandleConnect()
  }, [])


  useEffect(() => {
    // Handles socket events
    if (isSocketConnected) {
      console.log('Connecting to socket server...');
      socket.on('connect', HandleConnect);
      socket.on('assignHost', HandleAssignHost);
      socket.on('joined', HandleJoined);
      socket.on('StreamNotAvailable', HandleStreamNotAvailable)
      socket.on('newUser', HandleNewUser);
      socket.on('signal', HandleSignal);
      socket.on('new-message', HandleNewMessage)
      socket.on('streamRequest', HandleStreamRequest);
      socket.on('streamApproved', HandleApprovedStream);
      socket.on('streamRejected', HandleStreamReject)
      socket.on('reconnectWithNewPeer', HandlereconnectWithNewPeer);
      socket.on('approvedStreamers', HandleGetListStreamers);
      socket.on('host-action', HandleHostAction);
      socket.on('User-streamStopped', HandleUserStreamStoped)
      socket.on('userLeft', HandleUserLeft);
      socket.on('Hostleft', HandleHostLeft)
      socket.on('roomInfo', HandleRoomInfo)
      socket.on('new_stream', HandleNewStream)
      socket.on('Close_stream', HandleLeaveStream)
      socket.on('roomFull', HandleRoomFull)
      socket.on('disconnect', HandleDisconnected);
      socket.on('Stop-Stream', HandleStopStream)
      socket.on('Host-Disconnected', HandleUserLeft)
      socket.on('stream-Resume', HandleUserStreamStoped)
      socket.on('streamer-List', HandleStreamList)
      socket.on('newuser-joined',HandlenewUserJoined)
    }

    return () => {
      if (isSocketConnected) {
        // Cleanup socket listeners
        console.log('Disconnecting from socket server...');
        socket.off('connect', HandleConnect);
        socket.off('assignHost', HandleAssignHost);
        socket.off('joined', HandleJoined);
        socket.off('StreamNotAvailable', HandleStreamNotAvailable)
        socket.off('newUser', HandleNewUser);
        socket.off('signal', HandleSignal);
        socket.off('new-message', HandleNewMessage);
        socket.off('streamRequest', HandleStreamRequest);
        socket.off('streamApproved', HandleApprovedStream);
        socket.off('reconnectWithNewPeer', HandlereconnectWithNewPeer);
        socket.off('approvedStreamers', HandleGetListStreamers);
        socket.off('host-action', HandleHostAction);
        socket.off('User-streamStopped', HandleUserStreamStoped)
        socket.off('userLeft', HandleUserLeft);
        socket.off('Hostleft', HandleHostLeft)
        socket.off('roomInfo', HandleRoomInfo)
        socket.off('new_stream', HandleNewStream)
        socket.off('Close_stream', HandleLeaveStream)
        socket.off('roomFull', HandleRoomFull)
        socket.off('disconnect', HandleDisconnected);
        socket.off('Stop-Stream', HandleStopStream)
        socket.off('Host-Disconnected', HandleUserLeft)
        socket.off('stream-Resume', HandleUserStreamStoped)
        socket.off('streamer-List', HandleStreamList)
        socket.off('newuser-joined',HandlenewUserJoined)

      }
    }
  }, [isHost, isSocketConnected]);

  useEffect(() => {
    // Connect to socket server when component mounts
    if (!isSocketConnected) {
      connectSocket();
    }

  }, [isSocketConnected]);
  const createPeer = (socketId) => {
    try {
      const peer = new RTCPeerConnection(iceServers);

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track =>
          peer.addTrack(track, localStreamRef.current)
        );
      }
      peer.ontrack = (event) => {
        const stream = event.streams[0];
        if (!stream || !stream.getVideoTracks().length) return;
        console.log(`Received remote stream`, stream);
        setRemoteStreams(prev => {
          const exists = prev.some(s => s.id === socketId);
          if (exists) {
            return prev.map(s => s.id === socketId ? { id: socketId, stream } : s);
          }
          return [...prev, { id: socketId, stream }];
        });
      };

      peer.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit('signal', { to: socketId, data: { candidate: event.candidate } });
        }
      };

      return peer;
    } catch (error) {
      SendErrorTotheServer(error, 'createPeer');
    }
  };
  const requestPermissions = async () => {
    try {
      if (Platform.OS === 'android') {
        await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.CAMERA,
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
        ]);
      }
    } catch (error) {
      SendErrorTotheServer(error, 'requestPermissions');
    }
  };

  const joinRoom = (roomID, RoomInfo) => {
    try {
      HandleClearOldInstance()
      if (RoomInfo?.isLive === 0) {
        Alert.alert('Stream Not Available', 'The host is not streaming at the moment. Please try again later.',
          [{ text: 'OK' }]
        );
        return;
      }
      setStreamInfo(RoomInfo);
      socket.emit('joinRoom', false, roomID, userData?.userid, userData?.screenName);
    } catch (err) {
      SendErrorTotheServer(err, 'joinRoom');
    }
  };
  const CreateRoom = async (RoomInfo) => {
    try {
      HandleClearOldInstance()
      const roomID = RoomInfo?.roomID.toString()
      setStreamInfo(RoomInfo);
      const isaccepted = await requestPermissions();
      console.log(`Permissions granted: ${isaccepted}`);

      socket.emit('joinRoom', true, roomID, userData?.userid, userData?.screenName);
    } catch (err) {
      SendErrorTotheServer(err, 'CreateRoom');
    }
  }
  const requestStreamPermission = async () => {
    try {
      if (!hasRequestedStream) {
        await requestPermissions();
        const Address = userAddress ? { country: userAddress?.country, city: userAddress?.city } : { country: 'India', city: 'Pune' }
        socket.emit('requestStream', Address);
        setHasRequestedStream(true);
      }
    } catch (error) {
      SendErrorTotheServer(error, 'requestStreamPermission');
    }
  };

  const startLocalStream = async () => {
    try {
      const stream = await mediaDevices.getUserMedia({
        video: { width: 300, height: 320, facingMode: 'user' }, audio: !isMuted.muted,
      });
      localStreamRef.current = stream;
      setLocalStream(stream);
      setIsStreaming(true);
      // ✅ Start InCallManager and route audio to speaker
      if (!isMuted.muted) {
        stream.getTracks().forEach(track => track.enabled = true); // 🔊 ensure unmuted
        InCallManager.start({ media: 'audio' }); // or 'video' if you have both
      }
      InCallManager.setForceSpeakerphoneOn(true); // Force speaker output
      InCallManager.setSpeakerphoneOn(true);      // For Android
    } catch (error) {
      SendErrorTotheServer(error, 'startLocalStream');
    }
  };

  const leaveRoom = () => {
    try {
      // Stop local stream if exists
      socket.emit('leaveRoom', socket.id)
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
        // remote streams close 
        Object.values(peersRef.current).forEach(peer => peer.close());
        peersRef.current = {};
        localStreamRef.current = null;
        setLocalStream(null);
        setRemoteStreams([]);
      }
      setRoomchat([])
      setHasRequestedStream(false);
      InCallManager.setForceSpeakerphoneOn(false);
      InCallManager.stop();
      if (isHost) {
        socket.emit('Hostleft')
        HandleSetLivestatus(streamInfo?.roomID);
      }
      setJoined(false);
      setStreamupdated({viewerCount:0,LikeCount:0});
      setStreamInfo(null)
    } catch (error) {
      SendErrorTotheServer(error, 'leaveRoom');
    }
  }
  const toggleMute = () => {
    try {
      if (localStreamRef.current) {
        if (!isMuted.HostControl) {
          localStreamRef.current.getAudioTracks().forEach(track => { track.enabled = !track.enabled });
          // send mute/unmute action to host
          socket.emit('IsMuted', !isMuted.muted)
          setIsMuted({ HostControl: false, muted: !isMuted.muted });
        } else {
          Alert.alert('Host Control', 'You cannot unmute yourself as the host has muted you.');
        }
      }
    } catch (error) {
      SendErrorTotheServer(error, 'toggleMute');
    }
  }
  const switchCamera = () => {
    try {
      if (localStreamRef.current) {
        localStreamRef.current.getVideoTracks().forEach(track => {
          track._switchCamera();
        });
        setIsFrontCamera(!isFrontCamera);
      }
    } catch (error) {
      SendErrorTotheServer(error, 'switchCamera');
    }
  };
  const HandleChatmessages = (message) => {
    try {
      if (message.trim()) {
        let formattedMessage = message;
        if (message.length >= 40) {
          formattedMessage = message.match(/.{1,40}/g).join('\n');
        }
        const newMessage = {
          userName: userData?.screenName,
          message: formattedMessage,
          id: userData.userid,
          timestamp: new Date().toLocaleTimeString(),
        };
        socket.emit('send-message', newMessage);
      }
    } catch (error) {
      SendErrorTotheServer(error, 'HandleChatmessages');
    }
  }
  const HandleSetLivestatus = async (roomID) => {
    try {
      const response = await Apiclient.get(`/rooms/updaterooms?roomID=${roomID}&isLive=0`);
      if (response.status === 200) {
        console.log('Live status updated successfully');
      } else {
        Alert.alert('Error', 'Failed to update live status. Please try again later.');
      }
    } catch (error) {
      SendErrorTotheServer(error, 'HandleSetLivestatus');
    }
  }

  return (
    <LinearGradient colors={[themeColors.headerGradientTop, themeColors.headerGradientBottom]} style={{ height: '100%', width: '100%', paddingTop: insetsTop.top }}>
      <StatusBar
        hidden={false}
        barStyle="dark-content"
        backgroundColor="#fff"
      />
      {connectingpanel && joined && (<DisconnectedPanel time={30} leaveRoom={leaveRoom} />)}
      <View style={[styles.container]}>
        {isloading ? (<Loader LoaderImage={chatimage} />) : null}
        {!joined ? (
          <StreamList theme={theme} joinRoom={joinRoom} createRoom={CreateRoom} refreshlobby={refreshlobby} leaveroomrefresh={leaveroomrefresh} />
        ) : (<StreamRoom
          remoteStreams={remoteStreams}
          localStream={localStream}
          isStreaming={isStreaming}
          requestStreamPermission={requestStreamPermission}
          isFrontCamera={isFrontCamera}
          Streamupdated={Streamupdated}
          setStreamupdated={setStreamupdated}
          toggleMute={toggleMute}
          switchCamera={switchCamera}
          leaveRoom={leaveRoom}
          isMuted={isMuted}
          isHost={isHost}
          HandleChatmessages={HandleChatmessages}
          roomchat={roomchat}
          streamInfo={streamInfo}
          streamrequestlist={streamrequestlist}
          streamGuest={streamGuest}
          socket={socket}
          hasRequestedStream={hasRequestedStream}
        />)}
      </View>
    </LinearGradient>
  );
};