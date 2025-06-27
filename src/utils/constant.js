// Socket.IO client initialization
import { io } from 'socket.io-client';
// function connectUser(userId) { socket = io({ transports: ['polling', 'websocket'], // ✅ include both for fallback testing reconnection: true, // Enable automatic reconnection //forceNew: true, //autoConnect: false, //Prevents automatic connection; you call .connect() manually reconnectionAttempts: Infinity, // Keep trying forever reconnectionDelay: 5000, // Wait 15 seconds between attempts timeout: 15000 // (Optional) Fail a connection attempt after 20 seconds });
// Exporting the socket instance for use in other parts of the application

//http://192.168.0.18:5000
//https://streamalong.live
export const socket = io('http://192.168.0.18:5000', {
    transports: ['polling'], // Include both for fallback testing
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
  });
  socket.on('connect', () => {
    console.log('✅ Connected to Socket.IO server');
  });
  
  socket.on('connect_error', (err) => {
    console.log('❌ Connection Error:', err.message);
  });
  
  socket.on('disconnect', (reason) => {
    console.log('🔌 Disconnected:', reason);
  });
  
  // WebRTC ICE configuration with STUN and TURN servers
  export const iceServers = {
    iceServers: [
      {
        urls: 'stun:coturn.streamalong.live:3478'
      },
      {
        urls: 'turn:coturn.streamalong.live:3478?transport=udp',
        username: 'vikram',
        credential: 'vikram'
      }
    ],
    iceTransportPolicy: 'all',
    sdpSemantics: 'unified-plan'
  };
// In utils/constant.js or similar
export const closePeerConnections = (peerConnections, localStream, setLocalStream, setRemoteStreams) => {
  Object.values(peerConnections.current).forEach(pc => {
    pc.close();
  });
  peerConnections.current = {};
  if (localStream) {
    localStream.getTracks().forEach(track => track.stop());
  }
  setLocalStream(null);
  setRemoteStreams(() => new Map());
};

export const forceVP8Only = (sdp) => {
  const lines = sdp.split('\r\n');
  const mLineIndex = lines.findIndex(line => line.startsWith('m=video'));

  if (mLineIndex === -1) return sdp;

  const codecPayloads = [];
  const vp8Payloads = [];

  for (const line of lines) {
    if (line.startsWith('a=rtpmap:')) {
      const payload = line.match(/a=rtpmap:(\d+) (\w+)\/\d+/);
      if (payload) {
        codecPayloads.push({ payload: payload[1], codec: payload[2] });
        if (payload[2].toUpperCase() === 'VP8') {
          vp8Payloads.push(payload[1]);
        }
      }
    }
  }

  // Replace the video m-line to include only VP8
  const mLineParts = lines[mLineIndex].split(' ');
  const mLineHeader = mLineParts.slice(0, 3);
  const newMLine = [...mLineHeader, ...vp8Payloads].join(' ');
  lines[mLineIndex] = newMLine;

  return lines.join('\r\n');
};
