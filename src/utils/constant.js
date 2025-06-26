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
 export  const iceServers = {
  iceServers: [
    {
      urls: "stun:stun.relay.metered.ca:80",
    },
    {
      urls: "turn:in.relay.metered.ca:80",
      username: "92b58ddc6becca9a7458fe50",
      credential: "f0VH3WmLtV6ZANec",
    },
    {
      urls: "turn:in.relay.metered.ca:80?transport=tcp",
      username: "92b58ddc6becca9a7458fe50",
      credential: "f0VH3WmLtV6ZANec",
    },
    {
      urls: "turn:in.relay.metered.ca:443",
      username: "92b58ddc6becca9a7458fe50",
      credential: "f0VH3WmLtV6ZANec",
    },
    {
      urls: "turns:in.relay.metered.ca:443?transport=tcp",
      username: "92b58ddc6becca9a7458fe50",
      credential: "f0VH3WmLtV6ZANec",
    },
],
    iceTransportPolicy: 'all', // Use 'all' to allow all ICE candidates
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