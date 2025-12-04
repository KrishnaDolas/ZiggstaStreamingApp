import { View, StatusBar } from 'react-native';
import {
  Alert,
} from 'react-native';
import { AppState } from 'react-native';
import InCallManager from 'react-native-incall-manager';
import { mediaDevices, RTCIceCandidate, RTCPeerConnection, RTCSessionDescription } from 'react-native-webrtc';
import React, { useState, useContext, useEffect, useRef } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import { styles, themeStyles } from '../../assets/styles/ThemeStyles';
import themeColors from '../../assets/styles/Colors';
import LinearGradient from 'react-native-linear-gradient';
import StreamList from '../components/StreamList';
import StreamRoom from '../components/StreamRoom';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { iceServers, preferVP8, requestPermissions, SendErrorTotheServer, showPermissionAlert, socket } from '../utils/constant';

import Apiclient from '../utils/Apiclient';
import Loader from '../Loader/Loader';
import { useAppContext } from '../context/AppContext';
import DisconnectedPanel from '../modals/DisconnectedPanel';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const MainScreen = () => {
  const { userData, userAddress, setIsInStreamRoom, isInStreamRoom, fetchProfileDetails } = useAppContext();
  const [remoteStreams, setRemoteStreams] = useState([]);
  const [localStream, setLocalStream] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const localStreamRef = useRef(null);
  const [isloading, setIsLoading] = useState(false);
  const peersRef = useRef({});
  const pendingCandidates = useRef({});
  const insets = useSafeAreaInsets();
  const [joined, setJoined] = useState(false);
  const [roomchat, setRoomchat] = useState([]);
  const [isMuted, setIsMuted] = useState({ HostControl: false, muted: false });
  const [isFrontCamera, setIsFrontCamera] = useState(true);
  const [isStreaming, setIsStreaming] = useState(false);
  const [Streamupdated, setStreamupdated] = useState({ viewerCount: 0, LikeCount: 0 })
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
  const [streamerList, setStrimerList] = useState([])
  const [streammsg, setStreamMsg] = useState(null);
  const [currentStreamData, setCurrentStreamData] = useState({});
  const [totalGiftValue, setTotalGiftValue] = useState(0);
  const IsIdentify = useRef(false)
  const IsVerified = useRef(false)
  const audioLevelsRef = useRef({});
  const pendingReofferTimeoutsRef = useRef({});

  useEffect(() => {
    setIsInStreamRoom(joined); // keep global value in sync
    fetchProfileDetails();
  }, [joined, isSocketConnected]);

  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      try {
        // Intentionally do nothing on background/active to keep mic/camera intact.
        // This prevents any renegotiation or stopping of tracks when the user minimizes the app.
        console.log('[handleAppStateChange] app state =>', nextAppState, '- no-op (tracks preserved)');
      } catch (err) {
        // Use your existing error logger
        SendErrorTotheServer(err, 'handleAppStateChange');
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [isStreaming, isHost, isuserstreaming, isFrontCamera, joined, setIsInStreamRoom]);

  const connectSocket = () => {
    socket.connect();
    setIsSocketConnected(true); // Update connection status
  };

  const requestStreamPermission = async () => {
    try {
      if (!hasRequestedStream) {
        const IsAccepted = await requestPermissions();
        if (!IsAccepted) {
          showPermissionAlert();
          return;
        }
        const Address = userAddress ?
          {
            country: userAddress?.country,
            city: userAddress?.city,
            avatar: userData?.avatar,
            Gender: userData?.gender,
          } :
          {
            country: 'India',
            city: 'Pune',
          };
        socket.emit('requestStream', Address);
        setHasRequestedStream(true);
      }
    } catch (error) {
      SendErrorTotheServer(error, 'requestStreamPermission');
    }
  };

  const HandleConnect = () => {
    console.log('✅ Connected to Socket.IO server');
    setconnectingpanel(false);
    setIsSocketConnected(true);

    if (streamInfo?.roomID) {
      // Small delay to ensure room is fully rejoined
      setTimeout(() => {
        socket.emit('get-lucky-wheel-status', streamInfo.roomID.toString());
      }, 500);
    }

    if (!IsIdentify.current && userData && socket.connected && streamInfo) {
      const roomID = streamInfo?.roomID.toString();

      // Add validation before reconnecting
      if (roomID && userData?.userid) {
        console.log(`🔄 [Client-Reconnect] Attempting reconnection to room ${roomID}`);

        socket.emit('reconnectUser',
          userData.userid,
          userData.screenName,
          roomID,
          isHost,
          userData.avatar,
          userData.gender
        );

        if (isuserstreaming) {
          setTimeout(() => {
            requestStreamPermission();
          }, 1500); // Slightly longer delay for stability
        }
      } else {
        console.error('❌ [Client-Reconnect] Missing roomID or userID');
      }
    }
  };

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
    setStreamMsg(null)
  };

  //Handle socket functions
  const HandleJoined = async ({ users, IsHost, ChatMessages, IsReconnect }) => {
    try {
      // If no one else, you're host
      setIsInStreamRoom(true)
      if (users.length === 0 || IsHost) {
        setJoined(true);
        setIsLoading(false);
        setIsHost(true);
        await startLocalStream();
      } else {
        if (!IsReconnect) {
          setIsLoading(true);
        }
        setTimeout(() => {
          setJoined(true);
          setIsLoading(false);
        }, 2000);
        setIsStreaming(true);
      }

      users.forEach(userId => {
        if (!peersRef.current[userId]) {
          const peer = createPeer(userId);
          peersRef.current[userId] = peer;
        }
      });
      if (ChatMessages) {
        let chat = ChatMessages.map((item) => {
          return { ...item, userProfile: item?.userProfile, userID: item?.id, TYPE: "PLAYERCHAT" }
        })
        setRoomchat(chat)
      }
    } catch (error) {
      SendErrorTotheServer(error, 'HandleJoined');
    }
  };

  const HandleStreamNotAvailable = () => {
    Alert.alert('Stream Not Available', 'The host is not streaming at the moment. Please try again later.',
      [{ text: 'OK' }]
    );
  };

  const HandleNewUser = async (userId) => {
    try {
      if (!peersRef.current[userId]) {
        const peer = createPeer(userId);
        peersRef.current[userId] = peer;

        console.log('🧪 [HandleNewUser] BEFORE OFFER for', userId, {
          senders: peer.getSenders().map(s => ({
            kind: s.track?.kind,
            id: s.track?.id,
            readyState: s.track?.readyState,
          })),
          transceivers: peer.getTransceivers().map(t => ({
            mid: t.mid,
            direction: t.direction,
            currentDirection: t.currentDirection,
            recvKind: t.receiver?.track?.kind,
          })),
        });

        const offer = await peer.createOffer();
        console.log('🧪 [HandleNewUser] createOffer DONE for', userId, {
          sdpSnippet: offer.sdp?.split('\n').filter(l => l.startsWith('m=') || l.startsWith('a=msid')).join(' | '),
        });

        await peer.setLocalDescription({ type: 'offer', sdp: preferVP8(offer.sdp) });
        console.log('🧪 [HandleNewUser] setLocalDescription DONE for', userId, {
          localDescType: peer.localDescription?.type,
        });

        socket.emit('signal', { to: userId, data: peer.localDescription });

        console.log('📡 [HandleNewUser] OFFER SENT to', userId);
      } else {
        console.log('ℹ️ [HandleNewUser] Peer already exists for', userId, '- skipping.');
      }
    } catch (error) {
      console.log('❌ [HandleNewUser] ERROR for', userId, String(error));
      SendErrorTotheServer(error, 'HandleNewUser');
    }
  };


  const HandleSignal = async ({ from, data }) => {
    try {
      console.log('📨 [HandleSignal] CALLED from', from, {
        dataType: data?.type,
        hasCandidate: !!data?.candidate,
      });

      let peer = peersRef.current[from];
      if (!peer) {
        console.log('🛠 [HandleSignal] No existing peer for', from, '→ creating new one');
        peer = createPeer(from);
        peersRef.current[from] = peer;
      }
      if (pendingReofferTimeoutsRef.current[from]) {
        clearTimeout(pendingReofferTimeoutsRef.current[from]);
        delete pendingReofferTimeoutsRef.current[from];
        console.log(`⏳ [HandleSignal] Cleared pending re-offer timeout for ${from}`);
      }

      console.log('🔍 [HandleSignal] Peer state BEFORE handling', from, {
        signalingState: peer.signalingState,
        connectionState: peer.connectionState,
        iceConnectionState: peer.iceConnectionState,
        senders: peer.getSenders().map(s => ({
          kind: s.track?.kind,
          id: s.track?.id,
          readyState: s.track?.readyState,
        })),
        transceivers: peer.getTransceivers().map(t => ({
          mid: t.mid,
          direction: t.direction,
          currentDirection: t.currentDirection,
          recvKind: t.receiver?.track?.kind,
        })),
      });

      if (data.type === 'offer') {
        console.log('📡 [HandleSignal] Handling OFFER from', from, {
          sdpSnippet: data.sdp?.split('\n').filter(l => l.startsWith('m=') || l.startsWith('a=msid')).join(' | '),
        });

        await peer.setRemoteDescription(new RTCSessionDescription(data));
        console.log('📡 [HandleSignal] setRemoteDescription(OFFER) DONE for', from);

        const answer = await peer.createAnswer();
        console.log('📡 [HandleSignal] createAnswer DONE for', from, {
          sdpSnippet: answer.sdp?.split('\n').filter(l => l.startsWith('m=') || l.startsWith('a=msid')).join(' | '),
        });

        await peer.setLocalDescription({ type: 'answer', sdp: preferVP8(answer.sdp) });
        console.log('📡 [HandleSignal] setLocalDescription(ANSWER) DONE for', from, {
          localDescType: peer.localDescription?.type,
        });

        socket.emit('signal', { to: from, data: peer.localDescription });
        console.log('📡 [HandleSignal] ANSWER SENT to', from);

        (pendingCandidates.current[from] || []).forEach(c => {
          console.log('🧊 [HandleSignal] Flushing pending candidate for', from);
          peer.addIceCandidate(c);
        });
        pendingCandidates.current[from] = [];
      } else if (data.type === 'answer') {
        console.log('📡 [HandleSignal] Handling ANSWER from', from, {
          hasRemoteDescription: !!peer.remoteDescription,
        });

        if (!peer.remoteDescription) {
          await peer.setRemoteDescription(new RTCSessionDescription(data));
          console.log('📡 [HandleSignal] setRemoteDescription(ANSWER) DONE for', from);

          (pendingCandidates.current[from] || []).forEach(c => {
            console.log('🧊 [HandleSignal] Flushing pending candidate for', from);
            peer.addIceCandidate(c);
          });
          pendingCandidates.current[from] = [];
        } else {
          console.log('ℹ️ [HandleSignal] ANSWER ignored for', from, '- remoteDescription already set.');
        }
      } else if (data.candidate) {
        const candidate = new RTCIceCandidate(data.candidate);
        console.log('🧊 [HandleSignal] ICE candidate from', from, {
          candidate: data.candidate.candidate,
          hasRemoteDescription: !!peer.remoteDescription,
        });

        if (peer.remoteDescription?.type) {
          await peer.addIceCandidate(candidate);
          console.log('🧊 [HandleSignal] addIceCandidate DONE for', from);
        } else {
          console.log('🧊 [HandleSignal] No remoteDescription yet, queuing candidate for', from);
          (pendingCandidates.current[from] = pendingCandidates.current[from] || []).push(candidate);
        }
      }

      console.log('🔍 [HandleSignal] Peer state AFTER handling', from, {
        signalingState: peer.signalingState,
        connectionState: peer.connectionState,
        iceConnectionState: peer.iceConnectionState,
      });
    } catch (error) {
      console.log('❌ [HandleSignal] ERROR for', String(error));
      socket.emit('Clientlogs', error);
      SendErrorTotheServer(error, 'HandleSignal');
    }
  };


  const HandleNewMessage = ({ userName, message, id, userProfile, Gender }) => {
    try {
      let own = userName
      if (userName === userData?.screenName) {
        own = "You"
      }
      const data = { userID: id, userProfile: userProfile, Gender: Gender, userName: own, message: message, TYPE: "PLAYERCHAT" }
      setRoomchat(prev => [...prev, data]);
    } catch (error) {
      SendErrorTotheServer(error, 'HandleNewMessage');
    }
  };

  const HandleStreamRequest = (streamrequsts) => {
    try {
      setStreamRequestList(streamrequsts);
    } catch (error) {
      SendErrorTotheServer(error, 'HandleStreamRequest');
    }
  };

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
  };

  const HandleStreamReject = (Name) => {
    setHasRequestedStream(false);
    setStreamMsg(`${Name} has rejected your stream request.`);
  };

  const HandlereconnectWithNewPeer = async ({ socketId, userId, isHost }) => {
    try {
      console.log(`🔄 [Peer-Reconnect] Handling peer for socket: ${socketId}, user: ${userId}`);

      // Only proceed if it's not our own socket and we have local stream
      if (socket.id !== socketId && localStreamRef.current) {

        // Clean up existing peer if any
        if (peersRef.current[socketId]) {
          peersRef.current[socketId].close();
          delete peersRef.current[socketId];
          console.log(`   ↪ Cleaned up existing peer for ${socketId}`);
        }

        const peer = createPeer(socketId);
        peersRef.current[socketId] = peer;

        // Add tracks if we're streaming
        if (isuserstreaming) {
          console.log("➕ addTrack ->", track.kind, {
            id: track.id,
            readyState: track.readyState,
            enabled: track.enabled
          });

          try {
            peer.addTrack(track, localStreamRef.current);
          } catch (trackError) {
            console.warn(`⚠️ Failed to add track:`, trackError);
          }
        }

        const offer = await peer.createOffer();
        await peer.setLocalDescription({ type: 'offer', sdp: preferVP8(offer.sdp) });
        socket.emit('signal', { to: socketId, data: peer.localDescription });

        console.log(`✅ [Peer-Reconnect] Offer sent to ${socketId}`);
      }
    } catch (error) {
      console.error(`❌ [Peer-Reconnect] Error:`, error);
      SendErrorTotheServer(error, 'HandlereconnectWithNewPeer');
    }
  };

  const HandleGetListStreamers = (streamers) => {
    setStreamGuest(streamers);
  };

  const HandleUserLeft = (socketId, userinfo) => {
    console.log('🚪 [HandleUserLeft] user left', userinfo, 'socket:', socketId);
    try {
      const checkUserInfo = userinfo || {
        ID: socketId,
        Name: 'Unknown User',
        customid: null,
        avatar: null,
        Gender: null,
      };

      console.log('🔍 [HandleUserLeft] checkUserInfo:', checkUserInfo);

      if (checkUserInfo.Name && checkUserInfo.Name !== 'Unknown User') {
        HandleUserLeftStream(checkUserInfo);
      }

      console.log('🔍 [HandleUserLeft] BEFORE PEER CLOSE for', socketId, {
        localTracks: localStreamRef.current?.getTracks().map(t => ({
          kind: t.kind,
          id: t.id,
          readyState: t.readyState,
          enabled: t.enabled,
        })),
        peerExists: !!peersRef.current[socketId],
        peerSenders: peersRef.current[socketId]?.getSenders().map(s => ({
          kind: s.track?.kind,
          id: s.track?.id,
          readyState: s.track?.readyState,
        })),
        peerReceivers: peersRef.current[socketId]?.getReceivers().map(r => ({
          kind: r.track?.kind,
          id: r.track?.id,
          readyState: r.track?.readyState,
        })),
        remoteStreamsBefore: remoteStreams.map(s => ({
          id: s.id,
          streamId: s.stream?.id,
          hasVideoTracks: s.stream?.getVideoTracks().length,
        })),
        allPeers: Object.keys(peersRef.current || {}),
      });

      // Clear from audio levels ref
      delete audioLevelsRef.current[socketId];

      if (peersRef.current[socketId]) {
        peersRef.current[socketId].close();
        delete peersRef.current[socketId];
      }

      setRemoteStreams(prev => {
        const next = prev.filter(s => s.id !== socketId);
        console.log('🌐 [HandleUserLeft] setRemoteStreams AFTER for', socketId, {
          before: prev.map(s => ({ id: s.id, streamId: s.stream?.id })),
          after: next.map(s => ({ id: s.id, streamId: s.stream?.id })),
        });
        return next;
      });

      setStrimerList(prev => prev.filter(s => s.ID !== socketId));
      setStreamGuest(prev => prev.filter(s => s.ID !== socketId));

      if (isuserstreaming && !isHost) {
        const wasHost = streamerList.find(s => s.ID === socketId && s.IsHost);
        if (wasHost) {
          console.log('🏠 [HandleUserLeft] Host left, enforcing viewer mode for self');
          setIsUserStreaming(false);
          setStreamGuest([]);
        }
      }

      console.log('✅ [HandleUserLeft] DONE for', socketId, {
        remainingPeers: Object.keys(peersRef.current || {}),
      });
    } catch (error) {
      console.log('❌ [HandleUserLeft] ERROR:', String(error));
      SendErrorTotheServer(error, 'HandleUserLeft');
    }
  };

  const HandleHostLeft = () => {
    try {
      Alert.alert('Host Left', 'The host has left the Stream. You will be disconnected.', [{ text: 'OK' }]);
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
      console.log("inside HostLeft Clearing streamerList");
      setStrimerList([]);
      setStreamupdated({ viewerCount: 0, LikeCount: 0 });
      setJoined(false);
      setIsHost(false);
      setStreamInfo(null)
    } catch (error) {
      SendErrorTotheServer(error, 'HandleHostLeft');
    }
  };

  const HandleRoomInfo = (info) => {
    setStreamupdated({ viewerCount: info?.viewerCount, LikeCount: info?.LikeCount, TotalViewerCount: info?.TotalViewerCount })
  };

  const HandleNewStream = () => {
    setRefreshLobby(!refreshlobby); // Toggle refresh state
  };

  const HandleLeaveStream = () => {
    setLeaveRoomRefresh(!leaveroomrefresh); // Toggle leave room refresh state
  };

  const HandleRoomFull = (msg) => {
    Alert.alert('Room Full', msg, [{ text: 'OK' }]);
  };

  const stopLocalStream = () => {
    try {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
        localStreamRef.current = null;
        setLocalStream(null);
        setHasRequestedStream(false);
        setIsUserStreaming(false); // Reset user streaming status
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
  };

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
        setIsMuted({ HostControl: false, muted: false });
        setStreamMsg("Your stream Stopped By Host")
        stopLocalStream();
      }
    } catch (error) {
      SendErrorTotheServer(error, 'HandleHostAction');
    }
  };

  const HandleUserStreamStoped = async (payloadOrSocketId) => {
    try {
      // Normalize payload
      let socketId = null;
      if (typeof payloadOrSocketId === 'string') {
        socketId = payloadOrSocketId;
      } else if (typeof payloadOrSocketId === 'object') {
        socketId = payloadOrSocketId.socketId || payloadOrSocketId.socketID || payloadOrSocketId.id || null;
      }

      console.log('[User-streamStopped] Processing for socketId:', socketId);

      if (!socketId) {
        console.warn('[User-streamStopped] no socketId found');
        return;
      }

      // If this is the current user being stopped
      if (socket.id === socketId) {
        console.log('[User-streamStopped] Current user was stopped by host');

        // Stop local stream
        if (localStreamRef.current) {
          localStreamRef.current.getTracks().forEach(track => {
            track.stop();
            track.enabled = false;
          });
          localStreamRef.current = null;
        }
        setLocalStream(null);
        setIsUserStreaming(false);

        // Update all relevant states
        setStreamGuest(prev => prev.filter(s => s.ID !== socketId));
        setStrimerList(prev => prev.filter(s => s.ID !== socketId));

        return;
      }

      // For other users: remove their stream from all states
      console.log(`[User-streamStopped] Removing stream for other user: ${socketId}`);

      // Clean up peer connection
      if (peersRef.current[socketId]) {
        peersRef.current[socketId].close();
        delete peersRef.current[socketId];
      }

      // Remove from all relevant states
      setRemoteStreams(prev => prev.filter(s => s.id !== socketId));
      setStrimerList(prev => prev.filter(s => s.ID !== socketId));
      setStreamGuest(prev => prev.filter(s => s.ID !== socketId));

    } catch (error) {
      SendErrorTotheServer(error, 'HandleUserStreamStoped');
    }
  };

  const HandleStreamList = (list) => {
    setStrimerList(list)
  };

  const HandlenewUserJoined = (userinfo) => {
    const data = { id: userinfo?.customid || 1, userProfile: userinfo?.avatar, Gender: userinfo?.Gender, userID: userinfo?.customid, userName: `${userinfo?.Name} joined`, message: '', TYPE: "USERJOINED" }
    setRoomchat(prev => [...prev, data]);
  };

  const HandleUserLeftStream = (userinfo) => {
    if (userinfo) {
      const data = { id: userinfo?.customid || 1, userProfile: userinfo?.avatar, Gender: userinfo?.Gender, userID: userinfo?.customid, userName: `${userinfo?.Name} left`, message: '', TYPE: "USERLEFT" }
      setRoomchat(prev => [...prev, data]);
    }
  };

  const HandleTotalGiftValue = (totalValue) => {
    setTotalGiftValue(totalValue);
  };

  const HandleDisconnected = () => {
    IsVerified.current = false;
    console.log('❌ Disconnected from socket server');
    setIsSocketConnected(false)
    setconnectingpanel(true)
    setHasRequestedStream(false)
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
  };


  const HandleSoftRtcReload = ({ promotedSocket }) => {
    try {
      console.log('➡️ [softRtcReload] received promotedSocket:', promotedSocket);

      // Only viewers should perform this (do not run if I'm the host)
      if (isHost) {
        console.log('➡️ [softRtcReload] I am host — ignoring');
        return;
      }

      // 1) Close & remove local peer for that promoted socket (if exists)
      if (peersRef.current[promotedSocket]) {
        try { peersRef.current[promotedSocket].close(); } catch (e) { /* ignore */ }
        delete peersRef.current[promotedSocket];
        console.log('🧹 [softRtcReload] closed local peer for', promotedSocket);
      }

      // 2) Remove remoteStreams tile immediately so UI won't show stale/blank tile
      setRemoteStreams(prev => {
        const next = prev.filter(s => s.id !== promotedSocket);
        console.log('🧹 [softRtcReload] removed remoteStreams entry for', promotedSocket, { before: prev.length, after: next.length });
        return next;
      });

      // 3) Ask server to ask promoted streamer to create a fresh offer to this viewer
      socket.emit('requestReoffer', { to: promotedSocket });
      console.log('📨 [softRtcReload] emitted requestReoffer to server for promotedSocket:', promotedSocket);

      // 4) Start a timeout; if no offer arrives within X ms, fallback to single rejoin
      const TIMEOUT_MS = 7000;
      if (pendingReofferTimeoutsRef.current[promotedSocket]) {
        clearTimeout(pendingReofferTimeoutsRef.current[promotedSocket]);
      }
      pendingReofferTimeoutsRef.current[promotedSocket] = setTimeout(() => {
        console.warn('[softRtcReload] reoffer timeout for', promotedSocket, '-> trigger forceSingleRejoin');
        socket.emit('forceSingleRejoin', { socketId: socket.id });
        delete pendingReofferTimeoutsRef.current[promotedSocket];
      }, TIMEOUT_MS);

    } catch (err) {
      console.error('❌ [softRtcReload] handler error', err);
      SendErrorTotheServer(err, 'softRtcReload');
    }
  }

  const HandlePleaseCreateOffer = async ({ toSocket }) => {
    try {
      console.log('📣 [pleaseCreateOffer] asked to create fresh offer for', toSocket);

      // Clean up any existing peer for that viewer on this client
      if (peersRef.current[toSocket]) {
        try { peersRef.current[toSocket].close(); } catch (e) { }
        delete peersRef.current[toSocket];
        console.log('🧹 [pleaseCreateOffer] closed existing peer for', toSocket);
      }

      // Create a new peer using your createPeer helper
      const peer = createPeer(toSocket);
      peersRef.current[toSocket] = peer;

      // createOffer -> setLocalDescription -> send via existing signal path
      const offer = await peer.createOffer();
      await peer.setLocalDescription({ type: 'offer', sdp: preferVP8(offer.sdp) });

      socket.emit('signal', { to: toSocket, data: peer.localDescription });
      console.log('📡 [pleaseCreateOffer] OFFER SENT to', toSocket);

    } catch (err) {
      console.error('❌ [pleaseCreateOffer] error', err);
      SendErrorTotheServer(err, 'pleaseCreateOffer');
    }
  }

  const HandleFallbackToViewer = (data) => {
    console.log("📩 [fallback-to-viewer] event received:", data);

    if (!data) {
      console.warn("⚠️ No data received in fallback-to-viewer event");
      return;
    }

    const { hostStreamers } = data;
    console.log("✅ Parsed hostStreamers:", hostStreamers);

    // Only process if we're not the host
    if (!isHost) {
      console.log("🔄 Switching this client to viewer mode");
      setIsHost(false);
      setIsUserStreaming(false);
      setconnectingpanel(false);

      // Update streamer list with host streamers only
      console.log("👥 Updating streamer list with host streamers only:", hostStreamers);
      setStrimerList(hostStreamers || []);

      // Clear guest/co-host streams
      console.log("🧹 Clearing guest/co-host streams");
      setStreamGuest([]);

      // Clean up any peer connections that shouldn't exist
      Object.keys(peersRef.current).forEach(peerSocketId => {
        const isHostPeer = hostStreamers?.some(host => host.ID === peerSocketId);
        if (!isHostPeer && peerSocketId !== socket.id) {
          console.log(`🧹 Cleaning up non-host peer: ${peerSocketId}`);
          if (peersRef.current[peerSocketId]) {
            peersRef.current[peerSocketId].close();
            delete peersRef.current[peerSocketId];
          }
        }
      });
    }
  };


  useEffect(() => {
    HandleConnect();
  }, []);

  useEffect(() => {
    if (!IsVerified.current) {
      // Check if user is verified
      if (userData?.userid && socket.connected) {
        socket.emit('identity', userData?.userid, userData?.screenName, userData?.avatar, userData?.gender);
        IsVerified.current = true; // Set verified flag to true
      } else {
        IsVerified.current = false;
      }
    }
  }, [IsVerified, socket.connected, userData])


  useEffect(() => {
    socket.on('rejoin-as-viewer', ({ roomID, RoomInfo }) => {
      console.log('💡 Rejoining as viewer due to host removal:', roomID);
      joinRoom(roomID, RoomInfo); // call your existing joinRoom function
    });

    return () => {
      socket.off('rejoin-as-viewer');
    };
  }, []);

  useEffect(() => {
    // Handles socket events
    if (isSocketConnected) {
      socket.on('connect', HandleConnect);
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
      socket.on('Host-Disconnected', HandleUserLeft)
      // socket.on('stream-Resume', HandleUserStreamStoped)
      socket.on('streamer-List', HandleStreamList)
      socket.on('newuser-joined', HandlenewUserJoined)
      socket.on('user-leftStream', HandleUserLeftStream)
      socket.on('Total-GiftValue', HandleTotalGiftValue)
      socket.on('fallback-to-viewer', HandleFallbackToViewer)
      socket.on('softRtcReload', HandleSoftRtcReload)
      socket.on('pleaseCreateOffer', HandlePleaseCreateOffer)

    }

    return () => {
      if (isSocketConnected) {
        // Cleanup socket listeners
        socket.off('connect', HandleConnect);
        socket.off('joined', HandleJoined);
        socket.off('StreamNotAvailable', HandleStreamNotAvailable)
        socket.off('newUser', HandleNewUser);
        socket.off('signal', HandleSignal);
        socket.off('new-message', HandleNewMessage);
        socket.off('streamRequest', HandleStreamRequest);
        socket.off('streamApproved', HandleApprovedStream);
        socket.off('streamRejected', HandleStreamReject)
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
        socket.off('Host-Disconnected', HandleUserLeft)
        socket.off('streamer-List', HandleStreamList)
        socket.off('newuser-joined', HandlenewUserJoined)
        socket.off('Total-GiftValue', HandleTotalGiftValue)
        // socket.off('Force-Stop-Stream', HandleforceStopStream);
        socket.off('fallback-to-viewer', HandleFallbackToViewer)
        socket.off('softRtcReload', HandleSoftRtcReload)
        socket.off('pleaseCreateOffer', HandlePleaseCreateOffer)
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
      console.log('🛠 [createPeer] CALLED for:', socketId, {
        hasLocalStream: !!localStreamRef.current,
        localVideoTracks: localStreamRef.current?.getVideoTracks().map(t => ({
          id: t.id,
          kind: t.kind,
          readyState: t.readyState,
          enabled: t.enabled,
        })) || [],
        localAudioTracks: localStreamRef.current?.getAudioTracks().map(t => ({
          id: t.id,
          kind: t.kind,
          readyState: t.readyState,
          enabled: t.enabled,
        })) || [],
        existingPeers: Object.keys(peersRef.current || {}),
      });

      const peer = new RTCPeerConnection({ iceServers });

      /* ⭐⭐⭐ INSERT THIS BLOCK HERE ⭐⭐⭐ */
      if (pendingReofferTimeoutsRef.current[socketId]) {
        clearTimeout(pendingReofferTimeoutsRef.current[socketId]);
        delete pendingReofferTimeoutsRef.current[socketId];
        console.log(`⏳ [createPeer] Cleared pending re-offer timeout for ${socketId}`);
      }
      /* ⭐⭐⭐ END INSERT ⭐⭐⭐ */

      console.log('🛠 [createPeer] NEW RTCPeerConnection for:', socketId, {
        iceServers,
      });

      // Add local tracks if present
      if (localStreamRef.current) {
        const tracks = localStreamRef.current.getTracks();
        console.log('➕ [createPeer] ADDING LOCAL TRACKS to', socketId, {
          trackCount: tracks.length,
        });

        tracks.forEach(track => {
          console.log('➕ [createPeer] addTrack()', socketId, {
            kind: track.kind,
            id: track.id,
            readyState: track.readyState,
            enabled: track.enabled,
          });
          try {
            peer.addTrack(track, localStreamRef.current);
          } catch (e) {
            console.log('⚠️ [createPeer] addTrack FAILED for', socketId, {
              error: String(e),
            });
          }
        });
      } else {
        console.log('ℹ️ [createPeer] NO localStreamRef.current for', socketId);
      }

      // Immediately log senders/transceivers
      try {
        console.log('🛰 [createPeer] AFTER addTrack for', socketId, {
          senders: peer.getSenders().map(s => ({
            kind: s.track?.kind,
            id: s.track?.id,
            readyState: s.track?.readyState,
          })),
          receivers: peer.getReceivers().map(r => ({
            kind: r.track?.kind,
            id: r.track?.id,
            readyState: r.track?.readyState,
          })),
          transceivers: peer.getTransceivers().map(t => ({
            mid: t.mid,
            direction: t.direction,
            currentDirection: t.currentDirection,
            recvTrackKind: t.receiver?.track?.kind,
            recvTrackId: t.receiver?.track?.id,
            recvReadyState: t.receiver?.track?.readyState,
          })),
        });
      } catch (e) {
        console.log('⚠️ [createPeer] Error inspecting transceivers/senders:', String(e));
      }

      // ontrack sets remote stream in state
      peer.ontrack = (event) => {
        try {
          const stream = event.streams && event.streams[0];

    // ⭐⭐⭐ VIDEO TRACK FIX — ADDED ⭐⭐⭐
    const videoTrack = stream?.getVideoTracks()[0];

    if (videoTrack) {
      console.log("🎥 Remote video track received:", {
        enabled: videoTrack.enabled,
        state: videoTrack.readyState,
      });

      // ★ Force video ON (fix blank video)
      videoTrack.enabled = true;

      //autorecover id video track are muted 
      videoTrack.onmute = () => {
        console.log("❌ Remote video track muted → re-enabling for", socketId);
        videoTrack.enabled = true;
      };

      videoTrack.onunmute = () => {
        console.log("✅ Remote video active again for", socketId);
      };


      if (videoTrack.readyState === "ended") {
        console.log("⚠️ Remote video track ended → requesting restart", socketId);
        socket.emit("requestVideoRestart", socketId);
      }
    }

    
          console.log('📥 [ontrack] RAW EVENT from:', socketId, {
            hasStreams: !!event.streams,
            streamCount: event.streams?.length || 0,
            streamId: stream?.id,
            allTracks: stream ? stream.getTracks().map(t => ({
              kind: t.kind,
              id: t.id,
              readyState: t.readyState,
              enabled: t.enabled,
            })) : [],
            videoTracks: stream ? stream.getVideoTracks().map(t => ({
              kind: t.kind,
              id: t.id,
              readyState: t.readyState,
              enabled: t.enabled,
            })) : [],
          });

          if (!stream || !stream.getVideoTracks().length) {
            console.log('⚠️ [ontrack] No valid VIDEO tracks for', socketId, {
              streamId: stream?.id,
            });
            return;
          }

          console.log('✅ [ontrack] VALID VIDEO TRACK for', socketId, {
            streamId: stream.id,
            videoTracks: stream.getVideoTracks().map(t => ({
              id: t.id,
              readyState: t.readyState,
              enabled: t.enabled,
            })),
          });

          setRemoteStreams(prev => {
            const existing = prev.find(s => s.id === socketId);

            console.log('🌐 [setRemoteStreams] BEFORE update for', socketId, {
              prevCount: prev.length,
              hasExisting: !!existing,
              existingStreamId: existing?.stream?.id,
            });

            let next;
            if (existing && existing.stream === stream) {
              next = prev;
            } else if (existing) {
              next = prev.map(s => s.id === socketId ? { ...s, stream } : s);
            } else {
              next = [...prev, { id: socketId, stream, isSpeaking: false, audioLevel: 0 }];
            }

            console.log('🌐 [setRemoteStreams] AFTER update for', socketId, {
              nextCount: next.length,
              ids: next.map(s => ({ id: s.id, streamId: s.stream?.id })),
            });

            return next;
          });

          try {
            InCallManager.start({ media: 'video', auto: true });
            InCallManager.setForceSpeakerphoneOn(true);
          } catch (e) {
            console.log('⚠️ [ontrack] InCallManager error:', String(e));
          }
        } catch (e) {
          console.log('❌ [ontrack] ERROR handling track for', socketId, String(e));
        }
      };

      // ICE candidate forwarding
      peer.onicecandidate = (event) => {
        if (event.candidate) {
          const cand = event.candidate.candidate || "";

          // classify candidate type
          let candidateType = "unknown";
          if (cand.includes("typ relay")) candidateType = "relay";
          else if (cand.includes("typ srflx")) candidateType = "srflx";
          else if (cand.includes("typ host")) candidateType = "host";

          // transport
          const transport = cand.includes("udp")
            ? "udp"
            : cand.includes("tcp")
              ? "tcp"
              : "unknown";

          // extract IP + port (IPv4 only in this regex)
          const ipPortMatch = cand.match(/(\d{1,3}\.){3}\d{1,3}\s(\d+)/);
          const ip = ipPortMatch ? ipPortMatch[0].split(" ")[0] : "unknown";
          const port = ipPortMatch ? ipPortMatch[0].split(" ")[1] : "unknown";

          console.log("🔍 ICE CANDIDATE FOUND", {
            socketId,
            candidateType,
            transport,
            ip,
            port,
            raw: cand,
          });

          if (candidateType === "relay") {
            console.log("🚀 RELAY CANDIDATE ✔ (TURN WORKING)", {
              relayIP: ip,
              relayPort: port,
              transport,
            });
          }

          // 🔁 IMPORTANT: keep signaling behavior identical
          socket.emit("signal", {
            to: socketId,
            data: { candidate: event.candidate },
          });
        } else {
          console.log("✅ [onicecandidate] ICE gathering complete for", socketId);
        }
      };


      peer.onconnectionstatechange = () => {
        console.log('📶 [RTCPeerConnection] connectionState for', socketId, '=', peer.connectionState);
      };

      peer.oniceconnectionstatechange = () => {
        console.log('🌐 [RTCPeerConnection] iceConnectionState for', socketId, '=', peer.iceConnectionState);
      };

      peer.onsignalingstatechange = () => {
        console.log('📡 [RTCPeerConnection] signalingState for', socketId, '=', peer.signalingState);
      };

      const audioIntervalId = setInterval(async () => {
        try {
          const receivers = peer.getReceivers();
          const audioReceiver = receivers.find(r => r.track && r.track.kind === 'audio');
          if (audioReceiver) {
            const stats = await audioReceiver.getStats();
            stats.forEach(report => {
              if (report.type === 'inbound-rtp' && (report.mediaType === 'audio' || report.kind === 'audio')) {
                let audioLevel = report.audioLevel;
                if (audioLevel === undefined && report.totalAudioEnergy && report.totalSamplesDuration) {
                  audioLevel = Math.sqrt(report.totalAudioEnergy / report.totalSamplesDuration);
                }
                audioLevel = audioLevel || 0;
                const isSpeaking = audioLevel > 0.05;
                audioLevelsRef.current[socketId] = { audioLevel, isSpeaking };
              }
            });
          }
        } catch (err) {
          SendErrorTotheServer(err, 'audio-level-interval');
        }
      }, 200);

      peer._audioIntervalId = audioIntervalId;

      const origClose = peer.close.bind(peer);
      peer.close = () => {
        console.log('🧹 [peer.close] CALLED for', socketId, {
          senders: peer.getSenders().map(s => ({
            kind: s.track?.kind,
            id: s.track?.id,
            readyState: s.track?.readyState,
          })),
          receivers: peer.getReceivers().map(r => ({
            kind: r.track?.kind,
            id: r.track?.id,
            readyState: r.track?.readyState,
          })),
          transceivers: peer.getTransceivers().map(t => ({
            mid: t.mid,
            direction: t.direction,
            currentDirection: t.currentDirection,
            recvKind: t.receiver?.track?.kind,
            recvId: t.receiver?.track?.id,
            recvReadyState: t.receiver?.track?.readyState,
          })),
        });

        try {
          if (peer._audioIntervalId) {
            clearInterval(peer._audioIntervalId);
            peer._audioIntervalId = null;
          }
        } catch (e) { }

        try { origClose(); } catch (e) { }

        console.log('🧹 [peer.close] FINISHED for', socketId);
      };

      console.log('✅ [createPeer] Peer CREATED for', socketId);

      return peer;
    } catch (error) {
      console.log('❌ [createPeer] ERROR for', socketId, String(error));
      SendErrorTotheServer(error, 'createPeer');
    }
  };


  // Add a separate effect to batch audio level updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (Object.keys(audioLevelsRef.current).length > 0) {
        setRemoteStreams(prev => {
          let hasChanges = false;
          const updated = prev.map(stream => {
            const newLevels = audioLevelsRef.current[stream.id];
            if (newLevels &&
              (stream.audioLevel !== newLevels.audioLevel ||
                stream.isSpeaking !== newLevels.isSpeaking)) {
              hasChanges = true;
              return { ...stream, ...newLevels };
            }
            return stream;
          });

          // Clear the ref after processing
          audioLevelsRef.current = {};

          return hasChanges ? updated : prev;
        });
      }
    }, 1000); // Batch updates every second

    return () => clearInterval(interval);
  }, []);


  const joinRoom = async (roomID, RoomInfo) => {
    try {
      HandleClearOldInstance();
      if (!userData) return;

      if (RoomInfo?.isLive === 0) {
        Alert.alert(
          'Stream Not Available',
          'The host is not streaming at the moment. Please try again later.',
          [{ text: 'OK' }]
        );
        return;
      }

      setStreamInfo(RoomInfo);

      // -----------------------------
      // ✅ Step 1: Check Stored Location
      // -----------------------------
      let Address = { country: 'India', city: 'Pune' }; // default

      try {
        const savedLocStr = await AsyncStorage.getItem('userLocation');

        if (savedLocStr) {
          const savedLoc = JSON.parse(savedLocStr);

          if (savedLoc?.city && savedLoc?.country) {
            Address = {
              city: savedLoc.city,
              country: savedLoc.country
            };
          }
        } else if (userAddress?.city || userAddress?.country) {
          // -----------------------------
          // ✅ Step 2: Fallback to userAddress
          // -----------------------------
          Address = {
            city: userAddress?.city || 'Pune',
            country: userAddress?.country || 'India',
          };
        }

      } catch (e) {
        console.log('Error reading userLocation', e);
      }

      // -----------------------------
      // 🔥 Emit join room with final Address
      // -----------------------------
      socket.emit(
        'joinRoom',
        false,
        roomID,
        userData?.userid,
        userData?.screenName,
        Address,
        userData?.avatar,
        userData?.gender
      );

      console.log(`🚪 Joining room ${roomID} with address:`, Address);

    } catch (err) {
      SendErrorTotheServer(err, 'joinRoom');
    }
  };

  const CreateRoom = async (RoomInfo) => {
    try {
      HandleClearOldInstance();

      const roomID = RoomInfo?.roomID?.toString();
      setStreamInfo(RoomInfo);

      // -------------------------------------
      // ✅ Step 1: Prepare address (default)
      // -------------------------------------
      let Address = { country: 'India', city: 'Pune' };

      try {
        const savedLocStr = await AsyncStorage.getItem('userLocation');

        if (savedLocStr) {
          const savedLoc = JSON.parse(savedLocStr);

          // -------------------------------------
          // ✅ Step 2: Check saved userLocation
          // -------------------------------------
          if (savedLoc?.city && savedLoc?.country) {
            Address = {
              city: savedLoc.city,
              country: savedLoc.country,
            };
          }

        } else if (userAddress?.city || userAddress?.country) {
          // -------------------------------------
          // ✅ Step 3: Fallback to userAddress
          // -------------------------------------
          Address = {
            city: userAddress?.city || 'Pune',
            country: userAddress?.country || 'India'
          };
        }

        console.log(`🚪 Joining room ${roomID} with address:`, Address);


      } catch (e) {
        console.log('Error reading saved userLocation', e);
      }

      // -------------------------------------
      // 🔥 Emit joinRoom for HOST
      // -------------------------------------
      socket.emit(
        'joinRoom',
        true,                    // Host creating room
        roomID,
        userData?.userid,
        userData?.screenName,
        Address,
        userData?.avatar,
        userData?.gender
      );
    } catch (err) {
      SendErrorTotheServer(err, 'CreateRoom');
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
        InCallManager.start({ media: 'video', auto: true }); // Start InCallManager
        InCallManager.setForceSpeakerphoneOn(true); // Force speaker output
      }
    } catch (error) {
      SendErrorTotheServer(error, 'startLocalStream');
    }
  };

  const leaveRoom = () => {
    try {
      // Stop local stream if exists
      if (!socket.id) {
        console.log('Socket ID not found, cannot emit LeaveRoom');
        return;
      }
      console.log('emiting leaveroom for the server for the socket:', socket.id);

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
      if (streamInfo?.hostID === userData?.userid) {
        socket.emit('Hostleft')
        HandleSetLivestatus(streamInfo?.roomID);
      }
      setJoined(false);
      setStreamupdated({ viewerCount: 0, LikeCount: 0 });
      setStreamInfo(null);
      setIsHost(false);
      setIsInStreamRoom(false); // Reset isInStreamRoom
      AsyncStorage.setItem('isInStreamRoom', JSON.stringify(false)); // Persist reset state
    } catch (error) {
      SendErrorTotheServer(error, 'leaveRoom');
    }
  };


  const HandleTimeout = () => {
    console.log('⏰ Reconnection timeout reached, leaving room');

    // First, check if we reconnected but auto-rejoin failed
    if (socket.connected && streamInfo) {
      console.log('🔄 Socket connected but auto-rejoin failed, attempting manual rejoin');

      const roomID = streamInfo?.roomID.toString();
      if (roomID && userData?.userid) {
        // One final attempt to rejoin
        socket.emit('reconnectUser',
          userData.userid,
          userData.screenName,
          roomID,
          isHost,
          userData.avatar,
          userData.gender
        );

        // Give it 2 more seconds
        setTimeout(() => {
          if (connectingpanel) { // If still disconnected after 2s
            console.log('❌ Final reconnection attempt failed, leaving room');
            leaveRoom();
          }
        }, 2000);
        return;
      }
    }
    // If no connection or no streamInfo, leave immediately
    leaveRoom();
  };

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
  };

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

  const HandleChatmessages = (msg) => {
    try {
      const maxLength = 40;
      let formatted = "";

      while (msg.length > 0) {
        let chunk = msg.slice(0, maxLength);

        // If word is cut in the middle, break at last space
        if (msg.length > maxLength && msg[maxLength] !== " ") {
          const lastSpace = chunk.lastIndexOf(" ");
          if (lastSpace !== -1) {
            chunk = chunk.slice(0, lastSpace);
          }
        }

        formatted += chunk.trim() + "\n";
        msg = msg.slice(chunk.length).trim();
      }

      const newMessage = {
        userName: userData?.screenName,
        message: formatted.trim(),
        id: userData.userid,
        timestamp: new Date().toLocaleTimeString(),
        userProfile: userData?.avatar,
        Gender: userData?.gender
      };
      console.log(newMessage);

      socket.emit('send-message', newMessage);

    } catch (error) {
      SendErrorTotheServer(error, 'HandleChatmessages');
    }
  };

  const HandleSetLivestatus = async (roomID) => {
    try {
      const response = await Apiclient.get(`/rooms/updaterooms?roomID=${roomID}&isLive=0`);
      if (response.status === 200) {
        return;
      } else {
        Alert.alert('Error', 'Failed to update live status. Please try again later.');
      }
    } catch (error) {
      SendErrorTotheServer(error, 'HandleSetLivestatus');
    }
  };

  return (
    <View style={[styles.SafeAreaView, themeStyles[theme].SafeAreaView, { paddingTop: insets.top }]}>
      <StatusBar
        barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={theme === 'dark' ? '#121212' : '#ffffff'}
      />
      <View style={[styles.container]}>
        {connectingpanel && joined && (<DisconnectedPanel time={25} leaveRoom={leaveRoom} />)}
        {isloading ? (<Loader currentStreamData={currentStreamData} />) : null}
        {!joined ? (
          <StreamList theme={theme} joinRoom={joinRoom} createRoom={CreateRoom} refreshlobby={refreshlobby} leaveroomrefresh={leaveroomrefresh} setCurrentStreamData={setCurrentStreamData} />
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
          hasRequestedStream={hasRequestedStream}
          streamerList={streamerList}
          isuserstreaming={isuserstreaming}
          streammsg={streammsg}
          isInStreamRoom={isInStreamRoom}
          totalGiftValue={totalGiftValue}
          connectingpanel={connectingpanel}
        />)}
      </View>
    </View>
  );
};