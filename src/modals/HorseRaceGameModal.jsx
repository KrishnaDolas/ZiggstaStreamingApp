import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Alert,
  ImageBackground,
  Easing,
  Dimensions,
  ScrollView,
  Image,
} from 'react-native';
import Modal from 'react-native-modal';
import Sound from 'react-native-sound';
import { socket } from '../utils/constant';
import FastImage from 'react-native-fast-image';
import Apiclient from '../utils/Apiclient';
import { debugLog } from '../utils/debugLogger';


const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const DEFAULT_HORSES = [
  { id: 1, img: require('../../assets/images/HorseRaceGame/racing_horse2.png') },
  { id: 2, img: require('../../assets/images/HorseRaceGame/racing_horse3.png') },
  { id: 3, img: require('../../assets/images/HorseRaceGame/racing_horse4.png') },
  { id: 4, img: require('../../assets/images/HorseRaceGame/racing_horse5.png') },
  { id: 5, img: require('../../assets/images/HorseRaceGame/racing_horse6.png') },
  { id: 6, img: require('../../assets/images/HorseRaceGame/racing-horse.png') },
];

const HORSE_COLORS = [
  '#000000', // 1 → black
  '#8B4513', // 2 → brown
  '#facc15', // 3 → yellow
  '#ffffff', // 4 → white
  '#ef4444', // 5 → red
  '#5C4033', // 6 → dark brown
];

const HORSE_GIFS = [
  require('../../assets/images/HorseRaceGame/horseGif2.gif'),
  require('../../assets/images/HorseRaceGame/racing_horsegif_3.gif'),
  require('../../assets/images/HorseRaceGame/racing_horsegif_4.gif'),
  require('../../assets/images/HorseRaceGame/racing_horsegif_5.gif'),
  require('../../assets/images/HorseRaceGame/racing_horsegif_6.gif'),
  require('../../assets/images/HorseRaceGame/racing-horsegif.gif'),
];

// Online track background
const SAMPLE_TRACK_BG_URI =
  'https://images.pexels.com/photos/1791701/pexels-photo-1791701.jpeg?auto=compress&cs=tinysrgb&w=1200';

const Z_ICON = require('../../assets/images/icons/icon_z.png');

export default function HorseRaceGameModal({
  visible,
  onClose,
  userData,
  roomId,
  isHost,
  readOnly,
}) {
  const [horses, setHorses] = useState(DEFAULT_HORSES);
  const horseAnim = useRef(DEFAULT_HORSES.map(() => new Animated.Value(0))).current; // 0–1 normalized
  const speedTrailAnim = useRef(new Animated.Value(0)).current;
  const countdownRef = useRef(null);

  const [selectedHorse, setSelectedHorse] = useState(null);
  const [balance, setBalance] = useState(
    Number(userData?.CreditBalance ?? userData?.balance ?? 0)
  );
  const [lastWin, setLastWin] = useState(0);
  const [flyingCoins, setFlyingCoins] = useState([]);
  const [winner, setWinner] = useState(null);
  const [canBet, setCanBet] = useState(true);
  const [raceStarted, setRaceStarted] = useState(false);
  const [raceMessage, setRaceMessage] = useState('');
  const [raceFinished, setRaceFinished] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const autoCloseTimeoutRef = useRef(null);

  const modalHeight = useRef(new Animated.Value(SCREEN_HEIGHT * 0.78)).current;
  const MAX_MODAL_HEIGHT = SCREEN_HEIGHT * 0.96;
  const MIN_MODAL_HEIGHT = SCREEN_HEIGHT * 0.55;
  const TRACK_HEIGHT = horses.length * 35 + 50;
  const horseProgressRef = useRef(DEFAULT_HORSES.map(() => 0));
  const [betAmount, setBetAmount] = useState(null);
  const [finishedHorses, setFinishedHorses] = useState(
    DEFAULT_HORSES.map(() => false),
  );
  const [horseProgress, setHorseProgress] = useState(
    DEFAULT_HORSES.map(() => 0),
  );
  const [bettingCountdown, setBettingCountdown] = useState(20);
  const [raceCountdown, setRaceCountdown] = useState(0);
  const flipAnim = useRef(new Animated.Value(0)).current;
  const [showTrack, setShowTrack] = useState(false);
  const [hasAnyBetPlaced, setHasAnyBetPlaced] = useState(false);
  const isInvoker = selectedHorse !== null;
  const [hasPlacedBet, setHasPlacedBet] = useState(false);
  const hasPlacedBetRef = useRef(false);

  // NEW: state to control submodule visibility (open with main modal)
  const [isSubModuleVisible, setIsSubModuleVisible] = useState(false);
  const soundsRef = useRef({});
  Sound.setCategory('Playback', true);
  const BET_OPTIONS = [100, 200, 500, 1000];
  const [showNoMoreGifting, setShowNoMoreGifting] = useState(false);


  useEffect(() => {
    if (!visible) {
      return;
    }
    const fetchHorses = async () => {
      try {
        const response = await Apiclient.get('https://streamalong.live/api/horses');

        if (!response || !response.data || !response.data.data) {
          throw new Error('No response from API');
        }
        const apiData = response.data.data;
        debugLog(
          'HorseRace',
          'HORSE_API_RESPONSE',
          {
            horseCount: apiData.length,
            roomId,
            userId: userData?.userid,
          }
        );
        apiData.forEach((horse, index) => {
          console.log(`🐎 Horse ${index + 1}:`, {
            id: horse.id,
            horse_name: horse.horse_name,
            odds: horse.odds,
            payout: horse.payout,
          });
        });
        if (apiData.length === 0) {
          setHorses(DEFAULT_HORSES);
          return;
        }

        const mapped = apiData.map((horse, index) => {
          const mappedHorse = {
            id: horse.id,
            name: horse.horse_name,
            odds: horse.odds, // use odds from API directly
            payout: horse.payout, // optional: if you want to display payout
            img: DEFAULT_HORSES[index % DEFAULT_HORSES.length]?.img,
          };
          return mappedHorse;
        });
        setHorses(mapped);
        console.log('🐎 MAPPED HORSES:', mapped);
      } catch {
        setHorses(DEFAULT_HORSES);
      }
    };

    fetchHorses();

  }, [visible]);

  useEffect(() => {
    soundsRef.current = {
      bugle: new Sound('hr_bugle', '', onLoad('bugle')),
      crowd: new Sound('hr_crowd', '', onLoad('crowd')),
      race: new Sound('hr_fast', '', onLoad('race')),
    };
    return () => {
      Object.values(soundsRef.current || {}).forEach((sound) => {
        try {
          sound?.stop?.();
        } catch (e) {
          console.log('HORSE_SOUND_STOP_ERROR', e);
        }
      });

      soundsRef.current = {};
    };
  }, []);

  useEffect(() => {
    hasPlacedBetRef.current = hasPlacedBet;
  }, [hasPlacedBet]);


  const onLoad = (name) => (error) => {
    if (error) {
    } else {
      if (soundsRef.current[name]) {
        soundsRef.current[name].loaded = true;
      }
    }
  };

  const playSound = (name, loop = false) => {
    const sound = soundsRef.current[name];
    if (!sound) {
      return;
    }
    if (!sound.loaded) {
      return;
    }
    sound.stop(() => {
      sound.setCurrentTime(0);
      sound.setVolume(1.0);
      sound.setNumberOfLoops(loop ? -1 : 0);
      sound.play((success) => {
        if (!success) {
        }
      });
    });
  };

  useEffect(() => {
    socket.onAny((event, ...args) => {
    });

    return () => socket.offAny();
  }, []);

  useEffect(() => {
    if (!visible || !roomId) return;
    socket.emit('joinHorseRaceRoom', { roomId });
  }, [visible, roomId]);
  debugLog(
    'HorseRace',
    'JOIN_HORSE_RACE_ROOM',
    {
      roomId,
      userId: userData?.userid,
    }
  );

  useEffect(() => {
    if (visible && !isHost) {
      setIsSubModuleVisible(true);

      Animated.timing(modalHeight, {
        toValue: MAX_MODAL_HEIGHT,
        duration: 240,
        useNativeDriver: false,
      }).start();
    }

    if (!visible) {
      setIsSubModuleVisible(false);
    }
  }, [visible, isHost]);

  const horseProfilesRef = useRef(
    DEFAULT_HORSES.map(() => {
      const baseSpeed = 0.010 + Math.random() * 0.003;   // faster base pace
      const jitter = 0.001 + Math.random() * 0.0015;     // more visible movement variation
      return { baseSpeed, jitter };
    }),
  );

  const onRaceClose = () => {
    debugLog(
      'HorseRace',
      'RACE_CLOSED',
      {
        hasPlacedBet,
        roomId,
        userId: userData?.userid,
      }
    );
    // stop everything
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }

    if (autoCloseTimeoutRef.current) {
      clearTimeout(autoCloseTimeoutRef.current);
      autoCloseTimeoutRef.current = null;
    }

    stopSpeedTrail();
    Object.values(soundsRef.current).forEach(sound => sound.stop());
    // reset UI
    resetRace();
    setRaceStarted(false);
    setStatusMessage('');
    setRaceMessage('');

    // ✅ If user already placed bet → close silently
    if (selectedHorse) {
      onClose();
      return;
    }
    // ✅ Otherwise show alert
    Alert.alert(
      'No Bet Placed',
      'No bet was placed within 20 seconds. Closing the game.',
      [
        {
          text: 'OK',
          onPress: () => {
            onClose();
          },
        },
      ],
      { cancelable: false }
    );
  };

  /* SOCKET LISTENERS */
  useEffect(() => {
    if (!visible) return;
    const onPhase = (phase) => {
      debugLog(
        'HorseRace',
        'PHASE_CHANGED',
        {
          phase,
          roomId,
          userId: userData?.userid,
        }
      );
      if (phase === 'STARTING') {
        setStatusMessage('Race starting...');
      }

      if (phase === 'RACING') {
        debugLog(
          'HorseRace',
          'RACE_STARTED',
          {
            roomId,
            userId: userData?.userid,
          }
        );

        // ✅ PLAY ONLY ON REAL RACE START
        // playSound('bugle', false);

        setRaceStarted(true);

        if (!isHost) triggerFlipToTrack();

        playSound('race', true);
        playSound('crowd', true);

        startRaceUI();
      }
    };

    const onCountdown = (time) => {
      debugLog(
        'HorseRace',
        'BETTING_COUNTDOWN',
        {
          time,
          roomId,
          userId: userData?.userid,
        }
      );
      if (hasPlacedBetRef.current) {
        setBettingCountdown(0);
        return;
      }
      setBettingCountdown(time);

      // 🔥 Show "No More Gifting" at 3 seconds
      if (time === 3) {
        setShowNoMoreGifting(true);

        setTimeout(() => {
          setShowNoMoreGifting(false);
        }, 2000);
      }

      if (time <= 0) {
        setCanBet(false);
      }
    };

    const onRaceStartCountdown = (time) => {
      debugLog(
        'HorseRace',
        'RACE_START_COUNTDOWN',
        {
          time,
          roomId,
          userId: userData?.userid,
        }
      );
      setRaceCountdown(time);
      setBettingCountdown(0);

      if (time === 10) {
        playSound('bugle', false);
      }

      if (time > 1) {
        setShowTrack(false);
        setIsSubModuleVisible(true);
      }

      if (time <= 1) {
        setShowTrack(true);
      }

      if (time <= 0 && !raceStarted) {
        startRaceUI();
      }
    };

    socket.on('raceStartCountdown', onRaceStartCountdown);


    const onRaceUpdate = (positions) => {
      if (raceFinished) return;
      const MAX_STEP = 0.04;

      positions.forEach((serverPos, i) => {
        const anim = horseAnim[i];
        const currentLogical = horseProgressRef.current[i];

        let targetFromServer = Math.max(0, Math.min(1, serverPos));
        let logicalTarget = targetFromServer;

        if (winner) {
          const winnerIndex = winner - 1;
          const winnerProgress = horseProgressRef.current[winnerIndex] || 0;
          const isWinner = i === winnerIndex;

          if (isWinner) {
            // very dominant leader
            const visibleLead =
              currentLogical < 0.25
                ? 0.42 // 0.32
                : currentLogical < 0.55
                  ? 0.48
                  : currentLogical < 0.8
                    ? 0.65 //? 0.64
                    : 0.80;

            logicalTarget = Math.max(logicalTarget, currentLogical + visibleLead);
          } else {
            // huge visible spread
            const trailingRank = i < winnerIndex ? i + 1 : i;
            const laneSpread = trailingRank * 0.28;

            if (winnerProgress > currentLogical) {
              const trailingGap =
                currentLogical < 0.25
                  ? 0.44 + laneSpread
                  : currentLogical < 0.55
                    ? 0.68 + laneSpread
                    : currentLogical < 0.75
                      ? 0.92 + laneSpread
                      : 1.16 + laneSpread;

              logicalTarget = Math.min(
                logicalTarget,
                Math.max(0, winnerProgress - trailingGap)
              );
            }

            // much stronger separation
            logicalTarget += (Math.random() - 0.5) * 0.14;
          }
        }

        const { baseSpeed, jitter } = horseProfilesRef.current[i];

        // 🎯 NORMAL RANDOM MOVEMENT
        let randomDelta = (Math.random() - 0.5) * jitter;

        // 🚀 FINAL SPRINT LOGIC (last 20%)
        const isFinalSprint = currentLogical >= 0.8;

        if (targetFromServer >= 0.98 && !raceFinished) {
          // stop all animations immediately
          horseAnim.forEach(anim => anim.stopAnimation());

          stopSpeedTrail();
        }

        if (isFinalSprint) {
          const isWinner = winner && i === winner - 1;

          if (isWinner) {
            // obvious final burst
            logicalTarget += baseSpeed * 6.2;
            logicalTarget += 0.018 + Math.random() * 0.12;
          } else {
            // others still move, but visibly behind
            logicalTarget += baseSpeed * 1.2;
            logicalTarget += Math.random() * 0.003;  // 0.003
          }

          randomDelta = Math.abs(randomDelta) * 0.12;
        } else {
          logicalTarget += baseSpeed + randomDelta;
        }

        // Clamp step
        const maxAllowed = currentLogical + (isFinalSprint ? 0.085 : 0.05);
        logicalTarget = Math.min(logicalTarget, maxAllowed, 1);
        logicalTarget = Math.max(currentLogical, logicalTarget);

        horseProgressRef.current[i] = logicalTarget;

        // setHorseProgress(prev => {
        //   const next = [...prev];
        //   next[i] = logicalTarget;
        //   return next;
        // });

        // ⚡ FASTER ANIMATION IN FINAL SPRINT
        const animationDuration = isFinalSprint
          ? 10
          : 20;

        anim.stopAnimation();

        Animated.timing(anim, {
          toValue: logicalTarget,
          duration: animationDuration,
          easing: Easing.linear,
          useNativeDriver: true,
        }).start();
      });
    };



    const onRaceResult = ({ winningHorse, winners }) => {
      debugLog(
        'HorseRace',
        'RACE_RESULT',
        {
          winningHorse,
          winnersCount: winners?.length || 0,
          roomId,
          userId: userData?.userid,
        }
      );

      // ✅ ONLY HANDLE USER WIN DATA
      const myWin = winners.find(w => w.user === userData?.userid);
      if (!isHost) {

        if (myWin) {
          debugLog(
            'HorseRace',
            'USER_WON',
            {
              amount: myWin?.won,
              horse: winningHorse,
              roomId,
              userId: userData?.userid,
            }
          );
          setRaceMessage('🎉 You Won !');
        } else {
          setRaceMessage('😔 Better Luck Next Time !');
        }

      }

      if (myWin) {

        const winAmount = Number(myWin.won);

        if (!isNaN(winAmount)) {
          setLastWin(winAmount);
        }

        // 🎉 Player won → show coin animation
        startHostCoinAnimation();

      }

      // ❌ NO UI updates here (FAST already handled everything)

      // ✅ AUTO CLOSE
      if (autoCloseTimeoutRef.current) {
        clearTimeout(autoCloseTimeoutRef.current);
      }

      autoCloseTimeoutRef.current = setTimeout(async () => {
        await loadLatestBalance();
        resetRace(true);
        setShowTrack(false);
        setIsSubModuleVisible(true);
        onClose();
      }, 5000);
    };

    const onReset = () => {
      stopSpeedTrail();
      // 🚫 don't wipe bettor UI mid-game
      if (!hasPlacedBetRef.current) {
        resetRace();
      }

      setShowTrack(false);        // ✅ important
      setIsSubModuleVisible(true);
      setRaceStarted(false);
      setCanBet(true);
      debugLog(
  'HorseRace',
  'BALANCE_RESET',
  {
    balance: 0,
    roomId,
    userId: userData?.userid,
    source: 'RESET',
  }
);

setBalance(0);
    };

    socket.on('phase', onPhase);
    socket.on('horseRaceCountdown', onCountdown);
    socket.on('horseRaceUpdate', onRaceUpdate);
    socket.on('horseRaceResult', onRaceResult);
    socket.on('horseRaceReset', onReset);
    if (!visible) return;

    socket.on('horseRaceClose', onRaceClose);
    socket.on('horseRaceResultFast', onRaceResultFast);

    return () => {
      socket.off('phase', onPhase);
      socket.off('horseRaceCountdown', onCountdown);
      socket.off('horseRaceUpdate', onRaceUpdate);
      socket.off('horseRaceResult', onRaceResult);
      socket.off('horseRaceReset', onReset);
      socket.off('horseRaceClose', onRaceClose);
      socket.off('raceStartCountdown', onRaceStartCountdown);
      socket.off('horseRaceResultFast', onRaceResultFast);

      if (countdownRef.current) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
      }
      if (autoCloseTimeoutRef.current) {
        clearTimeout(autoCloseTimeoutRef.current);
        autoCloseTimeoutRef.current = null;
      }
      stopSpeedTrail();
    };
  }, [visible, userData, roomId]);

  const loadLatestBalance = async () => {
    try {
      const formData = new FormData();
      formData.append('userID', userData.userid);

      const response = await Apiclient.post('/getUserDetails', formData);

      const latestBalance = Number(
        response?.data?.user?.CreditBalance ??
        response?.data?.user?.balance ??
        0
      );

      if (!isNaN(latestBalance)) {
        setBalance(latestBalance);

        debugLog(
          'HorseRace',
          'LATEST_BALANCE_LOADED',
          {
            latestBalance,
            roomId,
            userId: userData?.userid,
          }
        );
      }
      debugLog(
  'HorseRace',
  'BALANCE_FROM_API',
  {
    balance: latestBalance,
    roomId,
    userId: userData?.userid,
    source: 'LOAD_LATEST_BALANCE',
  }
);

setBalance(latestBalance);
    } catch (e) {
      console.log('LOAD_BALANCE_ERROR', e);
    }
  };

  useEffect(() => {
    if (!visible) return;

    loadLatestBalance();
  }, [visible]);

  const onRaceResultFast = ({ winningHorse }) => {
    debugLog(
      'HorseRace',
      'RACE_RESULT_FAST',
      {
        winningHorse,
        roomId,
        userId: userData?.userid,
      }
    );

    if (raceFinished) return; // 🛑 prevent double execution

    setRaceFinished(true);

    // 🛑 STOP EVERYTHING IMMEDIATELY
    stopSpeedTrail();
    soundsRef.current.race?.stop();
    soundsRef.current.crowd?.stop();

    const winnerHorseObj = horses.find(h => h.id === winningHorse);
    const winnerName = winnerHorseObj?.name || `Horse ${winningHorse}`;

    setWinner(winningHorse);

    setStatusMessage('Race finished');

    // 🧠 FORCE INSTANT SNAP (NO ANIMATION)
    horseAnim.forEach((anim, i) => {
      anim.stopAnimation();

      if (i === winningHorse - 1) {
        anim.setValue(1); // ✅ EXACT FINISH LINE
        horseProgressRef.current[i] = 1;
      } else {
        const current = horseProgressRef.current[i];
        anim.setValue(Math.min(current, 0.97)); // slightly behind
      }
    });

    setHorseProgress([...horseProgressRef.current]);

    setFinishedHorses(prev =>
      prev.map((_, i) => i === winningHorse - 1)
    );
  };

  useEffect(() => {
    if (!visible || !userData?.userid) {
      return;
    }

    const fetchLatestBalance = async () => {
      try {
        const formData = new FormData();
        formData.append('userID', userData.userid);

        const response = await Apiclient.post(
          '/getUserDetails',
          formData
        );

        const latestBalance = Number(
          response?.data?.user?.CreditBalance ??
          response?.data?.user?.balance ??
          0
        );

        if (!isNaN(latestBalance)) {
          setBalance(latestBalance);

          debugLog(
            'HorseRace',
            'LATEST_BALANCE_LOADED',
            {
              latestBalance,
            }
          );
        }
      } catch (error) {
        console.log('Failed to fetch latest balance:', error);
      }
    };

    fetchLatestBalance();
  }, [visible, userData?.userid]);

  useEffect(() => {
  debugLog(
    'HorseRace',
    'BALANCE_STATE_CHANGED',
    {
      balance,
      roomId,
      userId: userData?.userid,
    }
  );
}, [balance]);

useEffect(() => {
  if (!visible) return;

  debugLog(
    'HorseRace',
    'MODAL_OPENED_BALANCE',
    {
      balance,
      userDataBalance: userData?.CreditBalance ?? userData?.balance,
      roomId,
      userId: userData?.userid,
    }
  );
}, [visible]);

  useEffect(() => {
    const onWalletUpdate = (data) => {

      debugLog(
  'HorseRace',
  'BALANCE_FROM_SOCKET',
  {
    balance: newBalance,
    roomId,
    userId: userData?.userid,
    source: 'WALLET_UPDATE',
  }
);

setBalance(newBalance);

      debugLog(
        'HorseRace',
        'WALLET_UPDATE',
        {
          balance: data.balance,
          roomId,
          userId: userData?.userid,
        }
      );

      // Ignore updates for other users
      if (Number(data.userId) !== Number(userData?.userid)) {
        return;
      }

      const newBalance = Number(data.balance);

      if (!isNaN(newBalance)) {
        setBalance(newBalance);

        debugLog(
          'HorseRace',
          'BALANCE_UPDATED',
          {
            newBalance,
          }
        );
      }
    };

    socket.on('walletUpdate', onWalletUpdate);

    return () => {
      socket.off('walletUpdate', onWalletUpdate);
    };
  }, [socket, userData?.userid, roomId]);

  useEffect(() => {
    if (!roomId) return;
    socket.emit('joinHorseRaceRoom', { roomId });
  }, []);


  /* RESET */
  const resetRace = (force = false) => {

    // 🚫 NEVER RESET ACTIVE BETTER
    if (hasPlacedBet && !force) {
      return;
    }

    horseAnim.forEach(a => a.setValue(0));

    horseProgressRef.current =
      horseProgressRef.current.map(() => 0);

    setHorseProgress(DEFAULT_HORSES.map(() => 0));

    setFinishedHorses(
      DEFAULT_HORSES.map(() => false)
    );

    setWinner(null);
    setLastWin(0);

    setSelectedHorse(null);
    setRaceMessage('');
    setRaceFinished(false);

    setBetAmount(null);

    setHasAnyBetPlaced(false);

    setHasPlacedBet(false);
    setBalance(0);
  };

  const startHostCoinAnimation = () => {

    const coins = [];

    for (let i = 0; i < 10; i++) {

      coins.push({
        id: `${Date.now()}-${i}`,
        x: new Animated.Value(SCREEN_WIDTH / 2),
        y: new Animated.Value(SCREEN_HEIGHT / 2),
        scale: new Animated.Value(0),
        opacity: new Animated.Value(1),
      });

    }

    setFlyingCoins(coins);

    coins.forEach((coin, index) => {

      Animated.sequence([

        Animated.timing(coin.scale, {
          toValue: 1,
          duration: 150,
          delay: index * 50,
          useNativeDriver: true,
        }),

        Animated.parallel([

          Animated.timing(coin.x, {
            toValue: 50,
            duration: 900,
            useNativeDriver: true,
          }),

          Animated.timing(coin.y, {
            toValue: SCREEN_HEIGHT - 260,
            duration: 900,
            useNativeDriver: true,
          }),

          Animated.timing(coin.opacity, {
            toValue: 0,
            duration: 900,
            useNativeDriver: true,
          }),

        ]),

      ]).start();

    });

    setTimeout(() => {
      setFlyingCoins([]);
    }, 2000);

  };

  /* SPEED TRAIL ANIMATION */
  const startSpeedTrail = () => {
    speedTrailAnim.setValue(0);
    Animated.loop(
      Animated.timing(speedTrailAnim, {
        toValue: 1,
        duration: 400,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  };

  const stopSpeedTrail = () => {
    speedTrailAnim.stopAnimation();
  };

  /* START RACE UI */
  const startRaceUI = () => {
    setRaceStarted(true);
    startSpeedTrail();
  };

  useEffect(() => {
    const onBetPlaced = (data) => {
      debugLog(
        'HorseRace',
        'BET_CONFIRMED',
        {
          data,
          roomId,
          userId: userData?.userid,
        }
      );
      // first bet anywhere in room locks host close
      setHasAnyBetPlaced(true);

      // only keep local selected horse for the bettor himself
      if (Number(data.user_id) === Number(userData?.userid)) {
        setSelectedHorse(prev => prev ?? data.horse);

        // ✅ LOCK UI FOREVER FOR THIS ROUND
        setHasPlacedBet(true);
      }
    };

    socket.on('horseBetPlaced', onBetPlaced);

    return () => {
      socket.off('horseBetPlaced', onBetPlaced);
    };
  }, [userData]);

  useEffect(() => {
    if (visible && !isHost) {
      setIsSubModuleVisible(true);
    } else {
      setIsSubModuleVisible(false);
    }
  }, [visible, isHost]);

  useEffect(() => {

    const handleHostWin = ({ HostAmount }) => {

      if (!isHost) {
        return;
      }

      if (Number(HostAmount) <= 0) {
        return;
      }

      startHostCoinAnimation();

    };

    const handleDebug = (data) => {
    };

    socket.on('Host-win', handleHostWin);
    socket.on('Host-win-debug', handleDebug);

    return () => {

      socket.off('Host-win', handleHostWin);
      socket.off('Host-win-debug', handleDebug);

    };

  }, [isHost]);

  /* AUTO BET ON HORSE TAP */
  const selectHorse = (horseId, amount) => {
    debugLog(
      'HorseRace',
      'SELECT_HORSE_CALLED',
      {
        horseId,
        amount,
        balance,
        roomId,
        userId: userData?.userid,
        time: Date.now(),
      }
    );
    if (isHost || readOnly) return;

    if (!canBet) {
      Alert.alert('Betting closed!');
      return;
    }

    if (hasPlacedBet) {
      Alert.alert('Bet Locked', 'You cannot change the bet once placed.');
      return;
    }

    // if (!betAmount) {
    //   Alert.alert('Select bet amount first!');
    //   return;
    // }

    if (balance < amount) {
      Alert.alert('Insufficient balance!');
      return;
    }

    // ✅ DO NOT FORCE TRACK SWITCH HERE
    setIsSubModuleVisible(true);
    setShowTrack(false);
    setHasPlacedBet(true);


    // ✅ EXPAND MODAL FOR TRACK
    Animated.timing(modalHeight, {
      toValue: MAX_MODAL_HEIGHT,
      duration: 240,
      useNativeDriver: false,
    }).start();

    debugLog(
      'HorseRace',
      'BET_PLACED',
      {
        horseId,
        amount,
        roomId,
        userId: userData?.userid,
      }
    );

    socket.emit('placeBet', {
      user_id: userData.userid,
      horse_number: horseId,   // ✅ FIXED
      amount: Number(amount),
      roomID: Number(roomId),  // ✅ match backend naming
    }, (response) => {

      debugLog(
  'HorseRace',
  'BALANCE_FROM_ACK',
  {
    balance: Number(response.balance),
    roomId,
    userId: userData?.userid,
    source: 'PLACE_BET_ACK',
  }
);

setBalance(Number(response.balance));

      if (response?.status === "error") {
        Alert.alert(response.message);
        setCanBet(true);
        setSelectedHorse(null);
        return;
      }
      setBalance(Number(response.balance));

    });

    

    // 👉 Trigger flip animation after bet
    setTimeout(() => {
    }, 300);
  };

  const getHorseImage = horse => {
    const idx = horse.id - 1;
    if (finishedHorses[idx]) {
      // finished → show static PNG
      return DEFAULT_HORSES[idx].img;
    }
    // still racing → show GIF if race started, else PNG
    if (raceStarted) {
      return HORSE_GIFS[idx];
    }
    return DEFAULT_HORSES[idx].img;
  };

  const triggerFlipToTrack = () => {
    setShowTrack(true);

    flipAnim.setValue(0);

    Animated.timing(flipAnim, {
      toValue: 1,
      duration: 500,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  const handleManualModalClose = () => {
    debugLog(
      'HorseRace',
      'MANUAL_CLOSE',
      {
        hasPlacedBet,
        roomId,
        userId: userData?.userid,
      }
    );
    // 🚫 bettor cannot close after placing bet
    if (hasPlacedBet && !isHost) {
      return;
    }

    // ✅ everyone else can close
    onClose?.();
  };

  const renderCountdownBadge = () => {
    return (
      <View style={{ alignItems: 'center', marginTop: 5 }}>

        {/* 🟡 Betting Countdown */}
        {raceCountdown > 0 ? (
          <View style={styles.styledTimerContainer}>
            <Text style={styles.timerLabel}>
              Race starts in
            </Text>
            <Text style={styles.timerValue}>
              {raceCountdown}s
            </Text>
          </View>
        ) : bettingCountdown > 0 ? (
          <View style={styles.styledTimerContainer}>
            <Text style={styles.timerLabel}>
              Betting ends in
            </Text>
            <Text style={styles.timerValue}>
              {bettingCountdown}s
            </Text>
          </View>
        ) : null}

      </View>
    );
  };

  const renderCurrency = (value, textStyle) => (
    <View style={styles.currencyRow}>
      <Image source={Z_ICON} style={styles.currencyIcon} />
      <Text style={textStyle}>{value}</Text>
    </View>
  );


  // SUBMODULE UI (BOTTOM SHEET INSIDE MODAL)
  const renderSubModule = () => {
    // 🚫 HARD BLOCK FOR HOST
    if (isHost) {
      return null;
    }
    // hide if manually closed
    if (!isSubModuleVisible) {
      return null;
    }

    return (
      <View style={styles.subModuleContainer}>
        {/* HEADER */}
        <View style={styles.subModuleHeader}>

          <TouchableOpacity
            onPress={() => {
              setIsSubModuleVisible(false);

              Animated.timing(modalHeight, {
                toValue: MIN_MODAL_HEIGHT,
                duration: 240,
                useNativeDriver: false,
              }).start();
            }}
          >
          </TouchableOpacity>
        </View>

        {/* 💰 BALANCE */}
        <View style={styles.topInfoRow}>
          <View style={[styles.infoCard, styles.balanceCard]}>
            <View style={styles.balanceInlineRow}>
              <Text style={styles.balanceInlineLabel}>
                Balance :-
              </Text>

              <Image
                source={Z_ICON}
                style={styles.balanceInlineIcon}
              />

              <Text style={styles.balanceInlineValue}>
                {Math.floor(Number(balance || 0))}
              </Text>
            </View>
          </View>
        </View>

        {/* 🐎 HORSE SELECTION */}
        <View style={styles.betCard}>
          <Text style={styles.betTitle}>🐎 Select Your Horse</Text>

          <View style={styles.betRow}>
            {horses.map((h, index) => (
              <TouchableOpacity
                key={`horse-${h.id}-${index}`}
                style={[
                  styles.betButton,
                  selectedHorse === h.id && styles.betActive,
                  (isHost || !canBet) && styles.betDisabled,
                ]}
                disabled={isHost || !canBet}
                onPress={() => {
                  if (hasPlacedBet) {
                    Alert.alert(
                      'Bet Locked',
                      'You cannot change the bet once placed.',
                    );
                    return;
                  }

                  // ✅ ONLY select horse first
                  setSelectedHorse(h.id);
                }}
              >
                <View
                  style={{
                    width: '100%',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text
                    style={styles.betText}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {h.name || `Horse ${h.id}`}
                  </Text>

                  <Text
                    style={{
                      width: '100%',
                      textAlign: 'center',
                      color: '#cbd5f5',
                      fontSize: 12,
                      marginTop: 4,
                      fontWeight: '600',
                    }}
                  >
                    {`${Math.round(Number(h.odds) * 100)}x`}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 💵 BET AMOUNT */}
        <View style={styles.betAmountCard}>
          <Text style={styles.sectionTitle}>
            💰 Select Bet Amount
          </Text>

          <View style={styles.betAmountRow}>
            {BET_OPTIONS.map((amt) => (
              <TouchableOpacity
                key={amt}
                onPress={() => {
                  // ✅ must select horse first
                  if (!selectedHorse) {
                    Alert.alert('Select horse first!');
                    return;
                  }

                  setBetAmount(amt);

                  // ✅ place final bet
                  selectHorse(selectedHorse, amt);
                }}
                style={[
                  styles.betAmountBtn,
                  betAmount === amt && styles.betAmountActive,
                ]}
              >
                <View style={styles.currencyRow}>
                  <Image
                    source={Z_ICON}
                    style={styles.currencyIconSmall}
                  />

                  <Text
                    style={[
                      styles.betAmountText,
                      betAmount === amt &&
                      styles.betAmountTextActive,
                    ]}
                  >
                    {amt}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>


        </View>
      </View>
    );
  };

  return (
    <Modal
      isVisible={visible}
      style={styles.modalRoot}
      backdropOpacity={0}
      backdropColor="transparent"
      animationIn="fadeInUp"
      animationOut="fadeOutDown"
      avoidKeyboard={true}
    >
      <Animated.View style={[styles.container, { height: modalHeight }]}>
        <ImageBackground
          source={{ uri: SAMPLE_TRACK_BG_URI }}
          resizeMode="cover"
          style={styles.background}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end' }}
          >
            {/* MAIN PANEL – transparent, just border */}
            <View style={styles.glassPanel}>
              {/* ❌ Hide close button only for bettor/invoker */}
              {!(hasPlacedBet && !isHost) && (
                <TouchableOpacity
                  style={styles.mainModalCloseBtn}
                  onPress={handleManualModalClose}
                >
                  <Text style={styles.mainModalCloseText}>×</Text>
                </TouchableOpacity>
              )}


              {/* TRACK – tuned for 7 visible lanes (but you currently have 6 horses) */}
              {/* SUBMODULE */}
              {/* 🔥 FLIP AREA (Submodule ↔ Track) */}
              <View style={{ flex: 1, justifyContent: 'flex-end' }}>
                {/* 🔥 HEADER NOW ABOVE TRACK */}
                <View style={styles.headerWrapperBottom}>
                  {renderCountdownBadge()}

                  <View style={styles.headerCenter}>

                    {raceMessage !== '' && (
                      <View style={styles.headerTextBackground}>
                        <Text style={styles.raceMessage}>{raceMessage}</Text>
                      </View>
                    )}

                    {winner && (
                      <View style={styles.headerTextBackground}>
                        <Text style={styles.raceMessage}>
                          🏆 Winner: {horses.find(h => h.id === winner)?.name || `Horse ${winner}`}
                        </Text>
                      </View>
                    )}

                    {statusMessage !== '' && (
                      <View style={styles.headerTextBackground}>
                        <Text style={styles.statusSubText}>{statusMessage}</Text>
                      </View>
                    )}
                  </View>
                </View>

                <Animated.View
                  style={{
                    minHeight: TRACK_HEIGHT,
                    backfaceVisibility: 'visible',
                    transform: isHost
                      ? [] // ✅ NO flip for host
                      : [
                        { perspective: 1000 },
                        {
                          rotateY: flipAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0deg', '180deg'],
                          }),
                        },
                      ],
                  }}
                >
                  {/* 🟣 HOST → ALWAYS TRACK */}
                  {isHost && (
                    <View style={[styles.trackCard, { height: TRACK_HEIGHT }]}>
                      {horses.map((horse, i) => {
                        const horseWidth = 90;
                        const endOffset = SCREEN_WIDTH - horseWidth - 10;

                        const translateX = horseAnim[i].interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, Math.max(endOffset, 0)],
                          extrapolate: 'clamp',
                        });

                        return (
                          <View
                            key={horse.id}
                            style={[
                              styles.trackRow,
                              winner === horse.id && styles.winningTrackRow,
                              winner === horse.id && {
                                zIndex: 100,
                                elevation: 100,
                              },
                            ]}
                          >
                            {/* 🏷 HORSE LABEL */}
                            <Animated.View
                              style={[
                                styles.horseLabelContainer,
                                {
                                  opacity: horseAnim[i].interpolate({
                                    inputRange: [0, 0.12, 0.18],
                                    outputRange: [1, 1, 0],
                                    extrapolate: 'clamp',
                                  }),
                                  transform: [
                                    {
                                      translateX: horseAnim[i].interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [0, Math.max(endOffset, 0)],
                                        extrapolate: 'clamp',
                                      }),
                                    },
                                  ],
                                },
                              ]}
                            >

                              <Text style={styles.horseLabelText}>
                                {horse.name || `Horse ${horse.id}`}
                              </Text>
                            </Animated.View>

                            {/* 🏷 LEFT HORSE NUMBER BADGE */}
                            <View
                              style={[
                                styles.laneBadge,
                                {
                                  backgroundColor:
                                    HORSE_COLORS[horse.id - 1] + '22',
                                },
                              ]}
                            >
                              <Text style={styles.laneText}>
                                {horse.id}
                              </Text>
                            </View>

                            {/* TRACK */}
                            <View
                              style={[
                                styles.trackStripe,
                                winner === horse.id && styles.winningTrackStripe,
                                !winner && { opacity: i % 2 === 0 ? 0.4 : 1 },
                              ]}
                            />

                            {/* FINISH LINE */}
                            <View style={styles.finishLine} />

                            {/* FINISH LINE */}
                            <View style={styles.finishLine} />

                            {/* 🐎 HORSE */}
                            <Animated.View
                              style={{
                                transform: [{ translateX }],
                                position: 'absolute',
                                zIndex: 5,
                              }}
                            >
                              <FastImage
                                source={getHorseImage(horse)}
                                style={styles.horseImage}
                                resizeMode={FastImage.resizeMode.contain}
                              />
                            </Animated.View>
                          </View>
                        );
                      })}
                      {/* HOST TEXT BELOW 6TH HORSE */}
                      {isHost && (
                        <View style={styles.hostTrackBanner}>
                          <Text style={styles.hostTrackBannerText}>
                            HOST MODE – Betting Disabled
                          </Text>
                        </View>
                      )}
                    </View>
                  )}

                  {/* 🟢 USER */}
                  {!isHost && (
                    <>
                      {/* BEFORE RACE */}
                      {!showTrack && renderSubModule()}

                      {/* AFTER RACE START */}
                      {showTrack && (
                        <Animated.View
                          style={{
                            transform: [{ scaleX: -1 }],
                          }}
                        >
                          <View style={[styles.trackCard, { height: TRACK_HEIGHT }]}>
                            {horses.map((horse, i) => {
                              const horseWidth = 90;
                              const endOffset = SCREEN_WIDTH - horseWidth - 10;

                              const translateX = horseAnim[i].interpolate({
                                inputRange: [0, 1],
                                outputRange: [0, Math.max(endOffset, 0)],
                                extrapolate: 'clamp',
                              });

                              return (
                                <View
                                  key={horse.id}
                                  style={[
                                    styles.trackRow,
                                    winner === horse.id && styles.winningTrackRow,
                                  ]}
                                >
                                  {/* 🏷 HORSE LABEL */}
                                  {/* 🏷 HORSE LABEL */}
                                  <Animated.View
                                    style={[
                                      styles.horseLabelContainer,
                                      {
                                        opacity: horseAnim[i].interpolate({
                                          inputRange: [0, 0.12, 0.18],
                                          outputRange: [1, 1, 0],
                                          extrapolate: 'clamp',
                                        }),

                                        transform: [
                                          {
                                            translateX: translateX,
                                          },
                                        ],
                                      },
                                    ]}
                                  >

                                    <Text style={styles.horseLabelText}>
                                      {horse.name || `Horse ${horse.id}`}
                                    </Text>
                                  </Animated.View>

                                  {/* TRACK */}
                                  <View
                                    style={[
                                      styles.trackStripe,
                                      winner === horse.id && styles.winningTrackStripe,
                                      !winner && { opacity: i % 2 === 0 ? 0.4 : 1 },
                                    ]}
                                  />

                                  {/* FINISH LINE */}
                                  <View style={styles.finishLine} />

                                  {/* LANE BADGE */}
                                  <View
                                    style={[
                                      styles.laneBadge,
                                      {
                                        backgroundColor:
                                          HORSE_COLORS[horse.id - 1] + '22',
                                      },
                                    ]}
                                  >
                                    <Text style={styles.laneText}>
                                      {horse.id}
                                    </Text>
                                  </View>

                                  {/* 🐎 HORSE */}
                                  <Animated.View
                                    style={{
                                      transform: [{ translateX }],
                                      position: 'absolute',
                                      zIndex: 5,
                                    }}
                                  >
                                    <FastImage
                                      source={getHorseImage(horse)}
                                      style={styles.horseImage}
                                      resizeMode={FastImage.resizeMode.contain}
                                    />
                                  </Animated.View>
                                </View>
                              );
                            })}
                          </View>
                        </Animated.View>
                      )}
                    </>
                  )}
                </Animated.View>
              </View>

              {/* FOOTER */}
              <View style={styles.footerRow}>
              </View>
            </View>
          </ScrollView>
        </ImageBackground>
      </Animated.View>

      {/* No More Gifting  */}

      {showNoMoreGifting && (
        <View
          style={{
            position: 'absolute',
            top: '70%', // 🔥 moved lower
            left: 15,
            right: 15,
            zIndex: 999999,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <View
            style={{
              width: '100%',
              minHeight: 220, // 🔥 much bigger
              backgroundColor: 'rgba(0,0,0,0.95)',
              borderRadius: 20,
              borderWidth: 3,
              borderColor: '#facc15',
              alignItems: 'center',
              justifyContent: 'center',
              paddingHorizontal: 20,
              paddingVertical: 25,
            }}
          >
            <Text
              style={{
                color: '#facc15',
                fontSize: 28,
                fontWeight: '900',
                textAlign: 'center',
              }}
            >
              No More Gifting
            </Text>

            <Text
              style={{
                color: '#ffffff',
                fontSize: 16,
                marginTop: 10,
                textAlign: 'center',
              }}
            >
              Betting Closed
            </Text>
          </View>
        </View>
      )}

      {/* Flying Coins Animation  */}

      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 99999,
        }}
      >
        {flyingCoins.map((coin) => (
          <Animated.Image
            key={coin.id}
            source={Z_ICON}
            style={{
              position: 'absolute',
              width: 26,
              height: 26,
              opacity: coin.opacity,
              transform: [
                { translateX: coin.x },
                { translateY: coin.y },
                { scale: coin.scale },
              ],
            }}
          />
        ))}
      </View>
    </Modal>
  );
}

/* STYLES */
const styles = StyleSheet.create({
  modalRoot: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  winningTrackRow: {
    backgroundColor: 'rgba(250, 204, 21, 0.55)',
    borderBottomWidth: 0,
  },
  container: {
    width: '103%', // increased modal width
    alignSelf: 'center',

    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: 'hidden',
    backgroundColor: 'transparent',
    maxHeight: SCREEN_HEIGHT * 0.96,
  },

  background: {
    flex: 1,
  },

  horseLabelContainer: {
    position: 'absolute',

    left: 75, // ✅ moved slightly right

    top: '50%',
    marginTop: -14,

    zIndex: 20,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    alignSelf: 'flex-start', // ✅ keeps names centered nicely

    paddingHorizontal: 14,
    paddingVertical: 5,

    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 20,

    transform: [{ scaleX: -1 }],
  },

  horseLabelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    marginRight: 8,
    minWidth: 32,
    alignItems: 'center',
  },

  horseLabelNumber: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 11,
  },
  horseLabelText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',

    textAlign: 'center',

    textShadowColor: '#000',
    textShadowOffset: {
      width: 0,
      height: 1,
    },
    textShadowRadius: 3,
  },

  balanceInlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  balanceInlineLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',

    includeFontPadding: false,
  },

  hostTrackBanner: {
    position: 'absolute',

    bottom: 0,
    left: 0,
    right: 0,

    height: 45,

    alignItems: 'center',
    justifyContent: 'center',

    zIndex: 20,
  },

  hostTrackBannerText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '400',

    textAlign: 'center',

    backgroundColor: 'rgba(0,0,0,0.45)',

    paddingHorizontal: 14,
    paddingVertical: 8,

    borderRadius: 12,
  },

  balanceInlineIcon: {
    width: 13,
    height: 13,
    resizeMode: 'contain',

    marginLeft: 5,
    marginRight: 4,
  },

  balanceInlineValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',

    includeFontPadding: false,
  },

  glassPanel: {
    flex: 1,
    justifyContent: 'flex-end', // ✅ keeps everything bottom aligned
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 0,
  },

  winningTrackStripe: {
    backgroundColor: 'rgba(250, 204, 21, 0.55)',
    opacity: 1,
  },

  /* ================= HEADER ================= */

  balanceLabel: {
    fontSize: 16,
    color: '#e0e7ff',
    textAlign: 'center',
    fontWeight: '800',
    marginBottom: 6,
  },

  balanceValueWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },

  balanceValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',

    includeFontPadding: false,
  },

  headerWrapper: {
    marginBottom: 8,
  },

  headerLeft: {
    alignSelf: 'flex-start',
    marginBottom: 4,
  },

  headerCenter: {
    alignSelf: 'center',
    alignItems: 'center',
  },

  headerTextBackground: {
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginVertical: 2,
  },

  betTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#facc15',
    textAlign: 'left', // 🔥 center
    marginBottom: 10,
    letterSpacing: 0.5,
  },

  statusText: {
    color: '#e5e7eb',
    fontSize: 11,
    fontWeight: '600',
  },

  hostBannerText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },

  raceMessage: {
    color: '#facc15',
    fontWeight: '800',
    fontSize: 16,
    textAlign: 'center',
  },

  raceHint: {
    color: '#cbd5f5',
    fontSize: 11,
    textAlign: 'center',
  },

  statusSubText: {
    fontSize: 10,
    color: '#a5b4fc',
  },

  mainModalCloseBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 999,
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.55)',
  },

  mainModalCloseText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 26,
  },

  /* ================= TIMER ================= */

  styledTimerContainer: {
    backgroundColor: 'rgba(0,0,0,0.72)',
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 18,
    alignItems: 'center',
    marginVertical: 6,
    minWidth: 190,
  },

  timerLabel: {
    fontSize: 15,
    color: '#fff',
    fontWeight: '700',
    marginBottom: 3,
    letterSpacing: 0.4,
  },

  timerValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#facc15',
  },

  /* ================= TRACK ================= */

  trackCard: {
    backgroundColor: '#166534',
    borderRadius: 16,
    paddingHorizontal: 6,
    paddingVertical: 2,
    overflow: 'hidden',
  },

  trackRow: {
    height: 36,
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.12)',
  },

  trackStripe: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: '100%',
    backgroundColor: '#14532d',
    zIndex: 0,
  },

  finishLine: {
    position: 'absolute',
    right: 10,
    width: 3,
    height: '80%',
    borderWidth: 2,
    borderColor: '#f97316',
    borderStyle: 'dashed',
  },

  horseImage: {
    width: 80,
    height: 38,
  },

  laneBadge: {
    position: 'absolute',
    zIndex: 10,            // 🔥 VERY IMPORTANT (bring to top)
    elevation: 10,
    left: 0,
    backgroundColor: '#020617',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
  },

  laneText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#e5e7eb',
  },

  /* ================= SUBMODULE ================= */

  subModuleContainer: {
    marginTop: 0,
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 6,
    borderRadius: 18,
    backgroundColor: '#0f172a',
  },

  subModuleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },

  subModuleTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#f8fafc',
  },

  subModuleClose: {
    fontSize: 20,
    color: '#9ca3af',
  },

  /* ================= INFO CARDS ================= */

  currencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    flexWrap: 'nowrap',
  },

  currencyIcon: {
    width: 14,
    height: 14,
    marginRight: 4,
    resizeMode: 'contain',
  },

  currencyIconSmall: {
    width: 12,
    height: 12,
    marginRight: 4,
    resizeMode: 'contain',
  },

  topInfoRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },

  infoCard: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
  },

  balanceCard: {
    backgroundColor: '#2563eb',
  },

  winCard: {
    backgroundColor: '#047857',
  },

  pickCard: {
    backgroundColor: '#92400e',
  },

  infoLabel: {
    fontSize: 10,
    color: '#e0e7ff',
  },

  infoValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#fff',
  },

  infoValueWin: {
    color: '#4ade80',
  },

  /* ================= SECTION ================= */

  sectionTitle: {
    color: '#e5e7eb',
    fontWeight: '700',
    marginBottom: 6,
    fontSize: 11,
  },

  /* ================= BET AMOUNT ================= */

  betAmountCard: {
    backgroundColor: '#020617',
    padding: 8,
    borderRadius: 12,
    marginBottom: 6,
  },

  betAmountRow: {
    flexDirection: 'row',
  },

  betAmountBtn: {
    flex: 1,
    marginHorizontal: 3,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#1e293b',
  },

  betAmountActive: {
    backgroundColor: '#1e293b',
    borderWidth: 2,
    borderColor: '#facc15',
  },

  betAmountText: {
    color: '#fff',
    fontWeight: '700',
  },

  betAmountTextActive: {
    color: '#fff',
  },

  selectedBetBox: {
    marginTop: 8,
    padding: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(250,204,21,0.2)',
    alignItems: 'center',
  },

  selectedBetText: {
    color: '#facc15',
    fontWeight: '700',
  },

  /* ================= HORSE BET ================= */

  betCard: {
    backgroundColor: '#020617',
    borderRadius: 12,
    padding: 8,
  },

  betRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  betButton: {
    width: '31.5%',
    marginBottom: 8,

    paddingVertical: 10,
    paddingHorizontal: 5,

    borderRadius: 12,

    alignItems: 'center',
    justifyContent: 'center',
  },

  betActive: {
    backgroundColor: '#1e293b',
    borderWidth: 2,
    borderColor: '#facc15',
  },

  betDisabled: {
    opacity: 0.4,
  },

  betText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 13,

    textAlign: 'center',
    width: '100%',

    includeFontPadding: false,
  },

  betSub: {
    fontSize: 12,
    color: '#cbd5f5',
    marginTop: 4,

    textAlign: 'center',
    alignSelf: 'center',

    width: '100%',
  },

  headerWrapperBottom: {
    marginBottom: 6, // space above track
    alignItems: 'center',
    paddingVertical: 4,
  },

  /* ================= FOOTER ================= */

  footerRow: {
    marginTop: 6,
  },

  footerBtn: {
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: 'center',
  },

  closeBtn: {
    backgroundColor: '#22c55e',
  },

  closeBtnText: {
    color: '#022c22',
    fontWeight: '800',
  },
});