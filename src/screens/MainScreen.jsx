import { View, StatusBar } from 'react-native';
import {
  PermissionsAndroid,
  Platform,
  Alert,
} from 'react-native';
import { AppState } from 'react-native';
import InCallManager from 'react-native-incall-manager';
import { mediaDevices, RTCIceCandidate, RTCPeerConnection, RTCSessionDescription } from 'react-native-webrtc';
import React, { useState, useContext,useEffect, useRef, } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import { styles } from '../../assets/styles/ThemeStyles';
import themeColors from '../../assets/styles/Colors';
import LinearGradient from 'react-native-linear-gradient';
import StreamList from '../components/StreamList';
import StreamRoom from '../components/StreamRoom';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { iceServers, preferVP8, SendErrorTotheServer, socket } from '../utils/constant';
import chatimage from '../../assets/images/LS-2.jpg';
import Apiclient from '../utils/Apiclient';
import Loader from '../Loader/Loader';
import { useAppContext } from '../context/AppContext';
import ConnectingPanel from '../modals/CoonectingPanel';
export const MainScreen = () => {
  const {userData,userAddress}=useAppContext()
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
  const [isMuted, setIsMuted] = useState({HostControl: false, muted: false});
  const [isFrontCamera, setIsFrontCamera] = useState(true);
  const [isStreaming, setIsStreaming] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);
  const [hasRequestedStream, setHasRequestedStream] = useState(false);
  const [streamInfo, setStreamInfo] = useState(null);
  const { theme } = useContext(ThemeContext);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [refreshlobby, setRefreshLobby] = useState(false); // For refreshing lobby
  const [leaveroomrefresh, setLeaveRoomRefresh] = useState(false); // For refreshing after leaving room
  const [streamrequestlist, setStreamRequestList] = useState([]);
  const [streamGuest, setStreamGuest] = useState([]);
  const [isuserstreaming, setIsUserStreaming] = useState(false); // Track if user is streaming
  const IsIdentify=useRef(false)

  useEffect(() => {
    const handleAppStateChange = async (nextAppState) => {
      console.log(`App state changed to: ${nextAppState}`);
      try {
        const IsValid=isuserstreaming || isHost
        if (nextAppState === 'active' && isStreaming && IsValid) {
          console.log('🔄 Restarting local stream...');
          // Stop old stream if exists
          if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
          }

          // Re-acquire media
          const newStream = await mediaDevices.getUserMedia({
            video: { width: 300, height: 320, facingMode: isFrontCamera ? 'user' : 'environment' },
            audio: true,
          });

          localStreamRef.current = newStream;
          setLocalStream(newStream);
          setIsStreaming(true);

          InCallManager.start({ media: 'audio' });
          InCallManager.setForceSpeakerphoneOn(true);
          InCallManager.setSpeakerphoneOn(true);

          // Re-attach new tracks to existing peer connections
          for (const [userId, peer] of Object.entries(peersRef.current)) {
            // Remove old senders (cleaner renegotiation)
            const senders = peer.getSenders();
            senders.forEach(sender => {
              if (sender.track?.kind === 'video' || sender.track?.kind === 'audio') {
                peer.removeTrack(sender);
              }
            });
            // Add new tracks
            newStream.getTracks().forEach(track => {
              peer.addTrack(track, newStream);
            });
            // Renegotiate by sending a new offer
            const offer = await peer.createOffer();
            await peer.setLocalDescription({ type: 'offer', sdp: preferVP8(offer.sdp) });

            socket.emit('signal', { to: userId, data: peer.localDescription });
          }
        }
      } catch (error) {
        SendErrorTotheServer(error, 'handleHostStreamRestart');
        Alert.alert('Error', 'Failed to restart stream. Please try again.');
      }


      if (nextAppState === 'background') {
        console.log('App has gone to background.');
      }
    };
    AppState.addEventListener('change', handleAppStateChange);
    // return () => subscription.remove();
  }, [isStreaming,isHost,isuserstreaming]);
  
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
  const HandleConnect=()=>{
    console.log('✅ Connected to Socket.IO server');
    setIsSocketConnected(true); // Update connection status
    if(!IsIdentify.current){
      socket.emit('identity', userData?.userid, userData?.screenName);
      IsIdentify.current = true; // Set identify flag to true
    }
  }
  //Handle socket functions 
  const HandleAssignHost= async () => {
   try {
    setIsHost(true);
    await startLocalStream();
   } catch (error) {
    SendErrorTotheServer(error,'HandleAssignHost');
   }
  };

  const HandleJoined =async ({users }) => {
    try {
          // If no one else, you're host
    if (users.length === 0) {
      setJoined(true);
      setIsLoading(false);
      setIsHost(true);
      await startLocalStream();
      socket.emit('assignHost');
    }else{
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
    } catch (error) {
      SendErrorTotheServer(error,'HandleJoined');
    }
  }
  const HandleStreamNotAvailable = () => {
    Alert.alert('Stream Not Available', 'The host is not streaming at the moment. Please try again later.',
      [{ text: 'OK' }]
    );
  }
  const HandleNewUser =async (userId) => {
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
      SendErrorTotheServer(error,'HandleNewUser');
    }
  }
  const HandleSignal=async ({ from, data }) => {
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
      SendErrorTotheServer(error,'HandleSignal');
    }
  }
  const HandleNewMessage =({ userName, message, id })=>{
    try {
      const data={id: id,userProfile: chatimage,userName: userName,message: message}
      setRoomchat(prev => [...prev, data]);
    } catch (error) {
      SendErrorTotheServer(error,'HandleNewMessage');
    }
  }
  const HandleStreamRequest =(streamrequsts) => {
   try {
    setStreamRequestList(streamrequsts);
   } catch (error) {
    SendErrorTotheServer(error,'HandleStreamRequest');
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
      SendErrorTotheServer(error,'HandleApprovedStream');
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
    try {
      const peer = peersRef.current[newUserId];
      if (!peer || !localStreamRef.current) return;
    
      localStreamRef.current.getTracks().forEach(track =>
        peer.addTrack(track, localStreamRef.current)
      );
    
      const offer = await peer.createOffer();
      await peer.setLocalDescription({ type: 'offer', sdp: preferVP8(offer.sdp) });
      socket.emit('signal', { to: newUserId, data: peer.localDescription });
    } catch (error) {
      console.log(error);
    }
  }
  const HandleGetListStreamers = (streamers) => {
    setStreamGuest(streamers);
  }
  const HandleUserLeft = socketId => {
    try {
      setRoomchat([])
      if (peersRef.current[socketId]) {
        peersRef.current[socketId].close();
        delete peersRef.current[socketId];
        setRemoteStreams(prev => prev.filter(s => s.id !== socketId));
      }
    } catch (error) {
      SendErrorTotheServer(error,'HandleUserLeft');
    }
  }
  const HandleHostLeft = () => {
    try {
      Alert.alert('Host Left','The host has left the room. You will be disconnected.',[{text: 'OK'}]);
      // Stop local stream if exists
      setRoomchat([])
      setHasRequestedStream(false);
      disconnectSocket(); // Disconnect from socket server
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
    } catch (error) {
      SendErrorTotheServer(error,'HandleHostLeft');
    }
  }
  const HandleRoomInfo=(info)=>{
    setViewerCount(info?.viewerCount-1 || 0);
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
  const HandleHostAction = ({ action }) => {
    try {
      if (!localStreamRef.current) return;
  
      if (action === 'mute') {
        localStreamRef.current.getAudioTracks().forEach(track => (track.enabled = false));
        setIsMuted({HostControl: true, muted: true});
      } else if (action === 'unmute') {
        localStreamRef.current.getAudioTracks().forEach(track => (track.enabled = true));
        setIsMuted({HostControl: false, muted: false});
      } else if (action === 'stop-stream') {
        if (localStreamRef.current) {
          localStreamRef.current.getTracks().forEach(track => track.stop());
          localStreamRef.current = null;
          setLocalStream(null);
          setRemoteStreams(prev => [...prev]);
        }
      }
    } catch (error) {
      SendErrorTotheServer(error,'HandleHostAction');
    }
  };
  const HandleUserStreamStoped = (userId) => {
    try {
      if(socket.id !== userId){
        if (peersRef.current[userId]) {
          peersRef.current[userId].close();
          delete peersRef.current[userId];
          setRemoteStreams(prev => prev.filter(s => s.id !== userId));
        }else{
          console.log(`No peer connection found for ${userId}`);
        }
      }else{
        console.log(`You stopped streaming`);
  
      }
    } catch (error) {
      SendErrorTotheServer(error,'HandleUserStreamStoped');
    }
  }
  const HandleDisconnected=()=>{
    console.log('❌ Disconnected from socket server');
    setIsSocketConnected(false)
    IsIdentify.current= false; // Reset identify flag
  }

  useEffect(()=>{
    HandleConnect()
  },[])


  useEffect(() => {
    // Handles socket events
    if(isSocketConnected) {
      console.log('Connecting to socket server...');
      socket.on('connect',HandleConnect);
      socket.on('assignHost', HandleAssignHost);
      socket.on('joined',HandleJoined);
      socket.on('StreamNotAvailable',HandleStreamNotAvailable)
      socket.on('newUser', HandleNewUser);
      socket.on('signal', HandleSignal);
      socket.on('new-message',HandleNewMessage)
      socket.on('streamRequest', HandleStreamRequest);
      socket.on('streamApproved',HandleApprovedStream);
      socket.on('streamRejected',HandleStreamReject)
      socket.on('reconnectWithNewPeer', HandlereconnectWithNewPeer);
      socket.on('approvedStreamers', HandleGetListStreamers);
      socket.on('host-action', HandleHostAction);
      socket.on('User-streamStopped',HandleUserStreamStoped)
      socket.on('userLeft',HandleUserLeft);
      socket.on('Hostleft',HandleHostLeft)
      socket.on('roomInfo',HandleRoomInfo)
      socket.on('new_stream',HandleNewStream)
      socket.on('Close_stream',HandleLeaveStream)
      socket.on('roomFull', HandleRoomFull)
      socket.on('disconnect', HandleDisconnected);
    }

    return () => {
      if (isSocketConnected) {
        // Cleanup socket listeners
        console.log('Disconnecting from socket server...');
        socket.off('connect',HandleConnect);
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
        socket.off('User-streamStopped',HandleUserStreamStoped)
        socket.off('userLeft', HandleUserLeft);
        socket.off('Hostleft', HandleHostLeft)
        socket.off('roomInfo', HandleRoomInfo)
        socket.off('new_stream',HandleNewStream)
        socket.off('Close_stream',HandleLeaveStream)
        socket.off('roomFull', HandleRoomFull)
        socket.off('disconnect', HandleDisconnected);
      }
    }
  }, [isHost,isSocketConnected]);

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
      SendErrorTotheServer(error,'createPeer');
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
      SendErrorTotheServer(error,'requestPermissions');
    }
  };

  const joinRoom = (roomID,RoomInfo) => {
    try {
      if(RoomInfo?.isLive===0){
        Alert.alert('Stream Not Available', 'The host is not streaming at the moment. Please try again later.',
          [{ text: 'OK' }]
        );
        return;
      }
      setStreamInfo(RoomInfo);
      socket.emit('joinRoom',false, roomID, userData?.userid, userData?.screenName);
    } catch (err) {
      SendErrorTotheServer(err,'joinRoom');
    }
  };
  const CreateRoom= async (RoomInfo) => {
    try {
      const roomID = RoomInfo?.roomID.toString()
      setStreamInfo(RoomInfo);
      const isaccepted=await requestPermissions();
      console.log(`Permissions granted: ${isaccepted}`);

      socket.emit('joinRoom',true, roomID, userData?.userid, userData?.screenName);
    } catch (err) {
      SendErrorTotheServer(err,'CreateRoom');
    }
  }
  const requestStreamPermission = async() => {
    try {
      if (!hasRequestedStream) {
        await requestPermissions();
        const Address=userAddress ?{country:userAddress?.country,city:userAddress?.city} : {country:'India',city:'Pune'}
        socket.emit('requestStream',Address);
        setHasRequestedStream(true);
      }
    } catch (error) {
      SendErrorTotheServer(error,'requestStreamPermission');
    }
  };

  const startLocalStream = async () => {
    try {
      const stream = await mediaDevices.getUserMedia({
        video: { width: 300, height: 320, facingMode: 'user' },audio: true,});
      localStreamRef.current = stream;
      setLocalStream(stream);
      setIsStreaming(true);
      // ✅ Start InCallManager and route audio to speaker
      InCallManager.start({ media: 'audio' }); // or 'video' if you have both
      InCallManager.setForceSpeakerphoneOn(true); // Force speaker output
      InCallManager.setSpeakerphoneOn(true);      // For Android
    } catch (error) {
      SendErrorTotheServer(error,'startLocalStream');
    }
  };

  const leaveRoom=()=>{
    try {
          // Stop local stream if exists
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
   disconnectSocket()
   if(isHost){
    HandleSetLivestatus(streamInfo?.roomID);
   }
    setJoined(false);
    setViewerCount(0);
    socket.emit('leaveRoom',socket.id)
    } catch (error) {
      SendErrorTotheServer(error,'leaveRoom');
    }
  }
  const toggleMute = () => {
    try {
      if (localStreamRef.current) {
        if (!isMuted.HostControl) {
          localStreamRef.current.getAudioTracks().forEach(track => {track.enabled = !track.enabled});
          // send mute/unmute action to host
          socket.emit('IsMuted',!isMuted.muted)
          setIsMuted({ HostControl: false, muted: !isMuted.muted });
        }else{
          Alert.alert('Host Control', 'You cannot unmute yourself as the host has muted you.');
        }
      }
    } catch (error) {
      SendErrorTotheServer(error,'toggleMute');
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
      SendErrorTotheServer(error,'switchCamera');
    }
  };
  const HandleChatmessages = (message) => {
    try {
      if (message.trim()) {
        const newMessage = {
          userName: userData?.screenName,
          message: message,
          id: userData.userid,
          timestamp: new Date().toLocaleTimeString(),
        };
        socket.emit('send-message', newMessage);
      }
    } catch (error) {
      SendErrorTotheServer(error,'HandleChatmessages');
    }
  }
  const HandleSetLivestatus=async(roomID)=>{
    try {
      const response = await Apiclient.get(`/rooms/updaterooms?roomID=${roomID}&isLive=0`);
      if(response.status === 200) {
        console.log('Live status updated successfully');
      }else{
         Alert.alert('Error', 'Failed to update live status. Please try again later.');
      }
    } catch (error) {
      SendErrorTotheServer(error,'HandleSetLivestatus');
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
      {isloading ?(<Loader LoaderImage={chatimage}/>):null}
        {!joined ? (
          <StreamList theme={theme} joinRoom={joinRoom} createRoom={CreateRoom} refreshlobby={refreshlobby} leaveroomrefresh={leaveroomrefresh} />
        ) : (<StreamRoom
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
        streamInfo={streamInfo}
        streamrequestlist={streamrequestlist}
        streamGuest={streamGuest}
        socket={socket}
      />)}
      </View>
    </LinearGradient>
  );
};