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
export const preferVP8 = (sdp) => {
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