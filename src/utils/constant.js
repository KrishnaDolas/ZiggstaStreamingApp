// Socket.IO client initialization
import { Alert } from 'react-native';
import { io } from 'socket.io-client';

//http://192.168.0.18:5000
//https://streamalong.live
  export const socket = io('http://192.168.0.18:5000', {
    transports: ['polling'], // Include both for fallback testing
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
  });
  
  // WebRTC ICE configuration with STUN and TURN servers
  export const iceServers = {
    iceServers: [{
      urls: ['turn:coturn.streamalong.live:3478'],
      username: 'webrtcuser',
      credential: 'Test@1234'
    }],
    iceTransportPolicy: 'all',
    sdpSemantics: 'unified-plan'
  };
  export const  preferVP8 = (sdp) => {
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
  export function SendErrorTotheServer(error,functionname){
    try {
          // You can also send this error to your server for logging
    socket.emit('errorLog',error,functionname);
    Alert.alert('Error', `An error occurred: ${error.message}`, [
      { text: 'OK' }
    ]);
    } catch (error) {
      socket.emit('errorLog', error.message, 'SendErrorTotheServer');
    }
  }