// Socket.IO client initialization
import { Alert, PermissionsAndroid, Platform, Linking } from 'react-native';
import { io } from 'socket.io-client';
const userMaleFallbackImage = require('../../assets/images/default_avatar_male.png');
const userFeMaleFallbackImage = require('../../assets/images/default_avatar_female.png');
const userOtherFallbackImage = require('../../assets/images/default-avatar-trans.png');

//http://192.168.0.18:5000
//https://streamalong.live
// export const socket = io('https://streamalong.live', {
//   transports: ['polling'], // Include both for fallback testing
//   reconnection: true,
//   reconnectionAttempts: Infinity,
//   reconnectionDelay: 1000,
// });



export const socket = io('https://streamalong.live', {
  path: '/socket.io/',
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 30000,
  autoConnect: true,
});

socket.on("connect", () => {
  console.log("✅ Connected to backend:", socket.id);

  if (global.currentRoomID && global.currentUserData) {
    console.log("🔄 Rejoining room after reconnect");

    socket.emit("joinRoom",
      global.currentUserData.isHost,
      global.currentRoomID,
      global.currentUserData.userid,
      global.currentUserData.screenName,
      global.currentUserData.address,
      global.currentUserData.avatar,
      global.currentUserData.gender
    );
  }
});

socket.on("reconnect", (attempt) => {
  console.log("♻️ Reconnected after", attempt, "attempts");

  if (global.currentRoomID) {
    socket.emit("reconnectUser",
      global.currentUserData.userid,
      global.currentUserData.screenName,
      global.currentRoomID,
      global.currentUserData.isHost,
      global.currentUserData.avatar,
      global.currentUserData.gender
    );
  }
});

socket.on("disconnect", (reason) => {
  console.log("❌ Disconnected:", reason);
});

socket.on("connect_error", (err) => {
  console.log("🚨 Connection error:", err.message);
});


// WebRTC ICE configuration with STUN and TURN servers
// utils/constant.js
export const iceServers = [
  { urls: ["stun:38.242.235.250:3478"] },
  {
    urls: ["turn:38.242.235.250:3478"],
    username: "webrtc",
    credential: "Test@1234",
  },
  {
    urls: ["turns:38.242.235.250:5349"],  // TLS
    username: "webrtc",
    credential: "Test@1234",
  }
];

// You can also export a ready-to-use RTC config:
export const rtcConfig = {
  iceServers,
  // normal mode:
  iceTransportPolicy: "all",
  // for debugging TURN only, you can temporarily use:
  // iceTransportPolicy: "relay",
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
export function SendErrorTotheServer(error, functionname) {
  try {
    // You can also send this error to your server for logging
    socket.emit('Clientlogs', functionname, error.message);
  } catch (error) {
    socket.emit('Clientlogs', "SendErrorTotheServer", error.message);
  }
}

export const getGenderFallbackImage = (gender) => {
  switch (gender?.toLowerCase()) {
    case 'male':
      return userMaleFallbackImage;
    case 'female':
      return userFeMaleFallbackImage;
    default:
      return userOtherFallbackImage;
  }
};
export const requestPermissions = async () => {
  try {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.CAMERA,
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
      ]);

      // Check each permission status
      const cameraPermission = granted[PermissionsAndroid.PERMISSIONS.CAMERA];
      const audioPermission = granted[PermissionsAndroid.PERMISSIONS.RECORD_AUDIO];

      if (cameraPermission === PermissionsAndroid.RESULTS.GRANTED &&
        audioPermission === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Camera and Audio permissions granted');
        return true;
      } else {
        console.log('One or both permissions denied');
        return false;
      }
    }
    return true; // iOS handles permissions differently
  } catch (error) {
    SendErrorTotheServer(error, 'requestPermissions');
    return false;
  }
};
export const showPermissionAlert = () => {
  Alert.alert(
    'Permission Required',
    'Camera and Audio permissions are required for Create Stream. Please enable them in Settings.',
    [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Open Settings', onPress: () => Linking.openSettings() },
    ]
  );
};

export const giftImages = {
  'gif_gif_420.gif': require('../../assets/images/gifts/gif_420.gif'),
  'award.gif': require('../../assets/images/gifts/award.gif'),
  'balloons.gif': require('../../assets/images/gifts/balloons.gif'),
  'boss.gif': require('../../assets/images/gifts/boss.gif'),
  'broken_heart.gif': require('../../assets/images/gifts/broken-heart.gif'),
  'casino_chip.gif': require('../../assets/images/gifts/casino-chip.gif'),
  'casino_chip2.gif': require('../../assets/images/gifts/casino-chip2.gif'),
  'casino_chip3.gif': require('../../assets/images/gifts/casino-chip3.gif'),
  'casino_chip5.gif': require('../../assets/images/gifts/casino-chip5.gif'),
  'clown.gif': require('../../assets/images/gifts/clown.gif'),
  'crown.gif': require('../../assets/images/gifts/crown.gif'),
  'diamond.gif': require('../../assets/images/gifts/diamond.gif'),
  'diamond2.gif': require('../../assets/images/gifts/diamond2.gif'),
  'diamond3.gif': require('../../assets/images/gifts/diamond3.gif'),
  'dollar.gif': require('../../assets/images/gifts/dollar.gif'),
  'financial_freedom.gif': require('../../assets/images/gifts/financial-freedom.gif'),
  'hearts.gif': require('../../assets/images/gifts/hearts.gif'),
  'in_love.gif': require('../../assets/images/gifts/in-love.gif'),
  'jack_in_the_box.gif': require('../../assets/images/gifts/jack-in-the-box.gif'),
  'laugh.gif': require('../../assets/images/gifts/laugh.gif'),
  'like.gif': require('../../assets/images/gifts/like.gif'),
  'love.gif': require('../../assets/images/gifts/love.gif'),
  'piggy_bank.gif': require('../../assets/images/gifts/piggy-bank.gif'),
  'popcorn.gif': require('../../assets/images/gifts/popcorn.gif'),
  'popcorn2.gif': require('../../assets/images/gifts/popcorn2.gif'),
  'profit.gif': require('../../assets/images/gifts/profit.gif'),
  'savings3.gif': require('../../assets/images/gifts/savings3.gif'),
  'sunrise.gif': require('../../assets/images/gifts/sunrise.gif'),
  'ticket.gif': require('../../assets/images/gifts/ticket.gif'),
  'ticket2.gif': require('../../assets/images/gifts/ticket2.gif'),
  'valentines_day.gif': require('../../assets/images/gifts/valentines-day.gif'),
  'wallet.gif': require('../../assets/images/gifts/wallet.gif'),
  'wave.gif': require('../../assets/images/gifts/wave.gif'),
  'win_win.gif': require('../../assets/images/gifts/win-win.gif'),
};