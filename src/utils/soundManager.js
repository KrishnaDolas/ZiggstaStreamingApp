import TrackPlayer from 'react-native-track-player';

let isSetup = false;

export const initPlayer = async () => {
  if (isSetup) return;

  await TrackPlayer.setupPlayer();

  isSetup = true;
};

export const playSound = async (sound) => {
  try {
    await initPlayer();

    await TrackPlayer.reset();

    await TrackPlayer.add({
      id: 'gameSound',
      url: sound,
      title: 'sound',
      artist: 'system',
    });

    await TrackPlayer.play();
  } catch (e) {
    console.log('Sound error:', e);
  }
};