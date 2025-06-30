import { set } from 'date-fns';
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Button,
  ScrollView,
  PermissionsAndroid,
  Platform,
  Alert,
  StyleSheet
} from 'react-native';
import { RTCPeerConnection, RTCView, mediaDevices, RTCIceCandidate, RTCSessionDescription } from 'react-native-webrtc';
import io from 'socket.io-client';

const socket = io('http://192.168.0.18:3001', {
  transports: ['polling'],
  reconnectionAttempts: 5,
  timeout: 10000,
});

const MAX_USERS = 4;

export default function DemoFile() {
  const [rooms, setRooms] = useState([]);
  const [joinedRoom, setJoinedRoom] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState([]);
  const [localStream, setLocalStream] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const localStreamRef = useRef(null);
  const peersRef = useRef({});
  const pendingCandidates = useRef({});

  useEffect(() => {
    console.log('Connecting to socket server...');
    socket.emit('getRooms');

    socket.on('roomsList', (rooms) => {
      setRooms(rooms);
    });

    socket.on('assignHost', async () => {
      setIsHost(true);
      await startLocalStream();
    });

    socket.on('joined', async ({ room, users }) => {
      setJoinedRoom(room);

      // If no one else, you're host
      if (users.length === 0) {
        setIsHost(true);
        await startLocalStream();
        socket.emit('assignHost');
      }

      users.forEach(userId => {
        if (!peersRef.current[userId]) {
          const peer = createPeer(userId);
          peersRef.current[userId] = peer;
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

  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.CAMERA,
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
      ]);
    }
  };

  const joinRoom = async (roomName) => {
    try {
      await requestPermissions();
      socket.emit('joinRoom', roomName);
    } catch (err) {
      Alert.alert("Camera/Mic permission denied");
    }
  };

  const startLocalStream = async () => {
    const stream = await mediaDevices.getUserMedia({ video: true, audio: true });
    localStreamRef.current = stream;
    setLocalStream(stream);
  };

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

  const preferVP8 = (sdp) => {
    const sdpLines = sdp.split('\r\n');
    const mLineIndex = sdpLines.findIndex(line => line.startsWith('m=video'));
    if (mLineIndex === -1) return sdp;

    const vp8Payloads = [];
    for (const line of sdpLines) {
      const match = line.match(/^a=rtpmap:(\d+) VP8\/90000/i);
      if (match) vp8Payloads.push(match[1]);
    }

    const parts = sdpLines[mLineIndex].split(' ');
    const header = parts.slice(0, 3);
    const payloads = parts.slice(3);
    const reordered = [
      ...vp8Payloads.filter(p => payloads.includes(p)),
      ...payloads.filter(p => !vp8Payloads.includes(p))
    ];

    sdpLines[mLineIndex] = [...header, ...reordered].join(' ');
    return sdpLines.join('\r\n');
  };

  return (
    <View style={styles.container}>
      {!joinedRoom ? (
        <>
          <Text style={styles.heading}>Available Rooms</Text>
          <ScrollView style={styles.scroll}>
            {rooms.map(room => (
              <View key={room.name} style={styles.roomButton}>
                <Button
                  title={`${room.name} (${room.count}/${MAX_USERS})`}
                  onPress={() => joinRoom(room.name)}
                  disabled={room.full}
                />
              </View>
            ))}
          </ScrollView>
        </>
      ) : (
        <View style={{ flex: 1 }}>
          <Text style={styles.heading}>Room: {joinedRoom}</Text>

          {!isHost && !localStream && (
            <Button title="Request to Stream" onPress={() => socket.emit('requestStream')} />
          )}

          <ScrollView contentContainerStyle={styles.videoContainer}>
            {localStream && (
              <View style={styles.videoSlot}>
                <RTCView
                  streamURL={localStream.toURL()}
                  style={styles.rtcView}
                  mirror
                />
                <Text style={styles.nameTag}>You</Text>
              </View>
            )}
            {remoteStreams.map(({ id, stream }) => (
              <View style={styles.videoSlot} key={id}>
                <RTCView
                  streamURL={stream.toURL()}
                  style={styles.rtcView}
                  mirror={false}
                />
                <Text style={styles.nameTag}>User {id.slice(0, 4)}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: '#fff' },
  heading: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  scroll: { marginBottom: 20 },
  roomButton: { marginBottom: 10 },
  videoContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  videoSlot: { margin: 10, alignItems: 'center' },
  rtcView: { width: 160, height: 120, backgroundColor: '#000' },
  nameTag: { marginTop: 4, fontSize: 12, color: '#333' },
});
