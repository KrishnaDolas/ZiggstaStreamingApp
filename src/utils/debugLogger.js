// src/utils/debugLogger.js

import { socket } from './constant';

export const debugLog = (
  screen,
  message,
  data = {},
  level = 'INFO'
) => {

  console.log(
    `[${screen}] ${message}`,
    data
  );

  try {

    if (socket?.connected) {

      socket.emit(
        'client_log',
        {
          screen,
          level,
          message,
          data,
          timestamp: Date.now(),
        }
      );

    }

  } catch (err) {}

};