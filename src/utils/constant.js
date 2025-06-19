// Socket.IO client initialization
import { io } from 'socket.io-client';
// function connectUser(userId) { socket = io({ transports: ['polling', 'websocket'], // ✅ include both for fallback testing reconnection: true, // Enable automatic reconnection //forceNew: true, //autoConnect: false, //Prevents automatic connection; you call .connect() manually reconnectionAttempts: Infinity, // Keep trying forever reconnectionDelay: 5000, // Wait 15 seconds between attempts timeout: 15000 // (Optional) Fail a connection attempt after 20 seconds });
// Exporting the socket instance for use in other parts of the application
export const socket = io('http://192.168.0.107:5000', {
    transports: ['websocket', 'polling'], // Include both for fallback testing
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
  });
  
  // WebRTC ICE configuration with STUN and TURN servers
 export  const iceServers = {
    iceServers: [{
        urls: 'turn:coturn.streamalong.live:3478?transport=udp',
        username: 'vikram',
        credential: 'vikram',
      },
    ],
  };
  export const closePeerConnections = (peerConnections, peerConnectionRef, localStream, setLocalStream, setRemoteStream) => {
    try {
      Object.values(peerConnections.current).forEach(pc => pc.close());
      peerConnections.current = {};
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        setLocalStream(null);
      }
      if(setRemoteStream){
      setRemoteStream(null);
      }
    } catch (err) {
      console.error('Error cleaning up WebRTC resources:', err);
    }
  };