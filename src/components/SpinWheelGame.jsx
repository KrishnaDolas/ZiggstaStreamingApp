// App.js - Main component
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSequence,
  withRepeat,
  Easing,
} from 'react-native-reanimated';
import Svg, {
  Circle,
  Path,
  Text as SvgText,
  G,
  Defs,
  RadialGradient,
  LinearGradient,
  Stop,
} from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Sound from 'react-native-sound';
import io from 'socket.io-client';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const wheelSize = Math.min(screenWidth * 0.8, 300);
const radius = wheelSize / 2;

// Custom Radio Button Component
const RadioButton = ({ selected, onPress, label, disabled }) => (
  <TouchableOpacity
    style={[
      styles.radioButton,
      selected && styles.radioButtonSelected,
      disabled && styles.radioButtonDisabled,
    ]}
    onPress={onPress}
    disabled={disabled}
  >
    <View style={[styles.radioCircle, selected && styles.radioCircleSelected]}>
      {selected && <View style={styles.radioInner} />}
    </View>
    <Text style={[styles.radioText, disabled && styles.radioTextDisabled]}>
      {label}
    </Text>
  </TouchableOpacity>
);

const SpinWheelGame = () => {
  // State management
  const [chips, setChips] = useState(1000);
  const [username, setUsername] = useState('Player');
  const [selectedMultiplier, setSelectedMultiplier] = useState(null);
  const [userBets, setUserBets] = useState([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [message, setMessage] = useState('Get Ready');
  const [countdown, setCountdown] = useState(30);
  const [freezeBet, setFreezeBet] = useState(false);
  const [betPlaced, setBetPlaced] = useState(false);
  const [isCountdownActive, setIsCountdownActive] = useState(false);

  // Animation values
  const wheelRotation = useSharedValue(0);
  const goldenDotScale = useSharedValue(1);
  const idleRotation = useSharedValue(0);

  // Refs
  const countdownIntervalRef = useRef(null);
  const idleAnimationRef = useRef(null);
  const socketRef = useRef(null);
  const soundsRef = useRef({});

  // Wheel configuration - exactly matching your JS
  const segmentLabels = [
    '5x', 'Triple', 'Double', 'Triple', '5x', 'Double', 'Triple', 'Double',
    '5x', 'Double', 'Triple', 'Double', '5x', 'Triple', 'Double', '25x'
  ];

  const segmentColors = {
    'Double': '#00a3ccff',
    'Triple': '#ff9a27ff',
    '5x': '#d93a2d',
    '25x': '#834fffff'
  };

  const multiplierOptions = [
    { label: '2x', value: 'Double' },
    { label: '3x', value: 'Triple' },
    { label: '5x', value: '5x' },
    { label: '25x', value: '25x' }
  ];

  // Initialize sounds
  const initializeSounds = useCallback(() => {
    Sound.setCategory('Playback');
    
    soundsRef.current.placeYourBet = new Sound(
      'place_your_bet.mp3',
      Sound.MAIN_BUNDLE,
      (error) => {
        if (error) console.log('Failed to load place your bet sound', error);
      }
    );
    
    soundsRef.current.noMoreBets = new Sound(
      'no_more_bets.mp3',
      Sound.MAIN_BUNDLE,
      (error) => {
        if (error) console.log('Failed to load no more bets sound', error);
      }
    );
  }, []);

  // Initialize socket connection
  const initializeSocket = useCallback(() => {
    socketRef.current = io('ws://your-server-url:3000', {
      transports: ['websocket'],
    });

    socketRef.current.on('connect', () => {
      console.log('Connected to server');
    });

    socketRef.current.on('start_spin', ({ resultLabel }) => {
      spinToResult(resultLabel);
    });

    socketRef.current.on('update_chips', (creditBalance) => {
      setChips(creditBalance);
    });

    socketRef.current.on('update_user_bets', (bets) => {
      setUserBets(bets);
    });

    socketRef.current.on('spin_result', ({ resultLabel, winAmount, newBalance }) => {
      setChips(newBalance);
      setMessage(
        winAmount > 0
          ? `✅ You WON ${winAmount} chips!`
          : `❌ You LOST! Landed on ${resultLabel}. Better luck next time.`
      );
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // Get username from storage
  const getUserData = useCallback(async () => {
    try {
      const storedUsername = await AsyncStorage.getItem('username');
      const userID = await AsyncStorage.getItem('userID');
      
      if (!storedUsername || !userID) {
        // Navigate to login screen in real app
        Alert.alert('Login Required', 'Please login first');
        return;
      }
      
      setUsername(storedUsername);
    } catch (error) {
      console.error('Error getting user data:', error);
    }
  }, []);

  // Golden dot pulse animation
  const startGoldenDotAnimation = useCallback(() => {
    goldenDotScale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1,
      false
    );
  }, [goldenDotScale]);

  // Idle wheel animation
  const startIdleAnimation = useCallback(() => {
    if (idleAnimationRef.current) {
      clearInterval(idleAnimationRef.current);
    }

    idleAnimationRef.current = setInterval(() => {
      if (!isSpinning) {
        idleRotation.value = withTiming(idleRotation.value + 1, {
          duration: 100,
          easing: Easing.linear,
        });
      }
    }, 100);
  }, [isSpinning, idleRotation]);

  // Countdown logic
  const startCountdown = useCallback((startFrom = 30) => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }

    let countdownValue = startFrom;
    setCountdown(countdownValue);
    setFreezeBet(false);
    setBetPlaced(false);
    setIsCountdownActive(true);
    setUserBets([]);

    // Play initial sound
    if (soundsRef.current.placeYourBet) {
      soundsRef.current.placeYourBet.play();
    }

    countdownIntervalRef.current = setInterval(() => {
      countdownValue--;
      setCountdown(countdownValue);

      if (countdownValue <= 5) {
        setFreezeBet(true);
        if (soundsRef.current.noMoreBets) {
          soundsRef.current.noMoreBets.play();
        }
      }

      if (countdownValue <= 0) {
        clearInterval(countdownIntervalRef.current);
        setIsCountdownActive(false);
        setMessage('Spinning...');
        
        // Trigger automatic spin after short delay
        setTimeout(() => {
          const randomResult = segmentLabels[Math.floor(Math.random() * segmentLabels.length)];
          spinToResult(randomResult);
        }, 500);
      }
    }, 1000);
  }, []);

  // Create wheel segments for SVG
  const createWheelSegments = () => {
    const segmentCount = segmentLabels.length;
    const anglePerSegment = (2 * Math.PI) / segmentCount;
    const svgRadius = wheelSize / 2 - 20;

    return segmentLabels.map((label, index) => {
      const startAngle = index * anglePerSegment;
      const endAngle = (index + 1) * anglePerSegment;
      const color = segmentColors[label];

      const x1 = radius + (svgRadius - 10) * Math.cos(startAngle);
      const y1 = radius + (svgRadius - 10) * Math.sin(startAngle);
      const x2 = radius + (svgRadius - 10) * Math.cos(endAngle);
      const y2 = radius + (svgRadius - 10) * Math.sin(endAngle);

      const largeArcFlag = anglePerSegment > Math.PI ? 1 : 0;

      const pathData = [
        `M ${radius} ${radius}`,
        `L ${x1} ${y1}`,
        `A ${svgRadius - 10} ${svgRadius - 10} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        'Z'
      ].join(' ');

      // Text position
      const textAngle = startAngle + anglePerSegment / 2;
      const textRadius = svgRadius - 60;
      const textX = radius + textRadius * Math.cos(textAngle);
      const textY = radius + textRadius * Math.sin(textAngle);

      return (
        <G key={index}>
          <Defs>
            <RadialGradient id={`gradient-${index}`} cx="50%" cy="50%" r="50%">
              <Stop offset="89%" stopColor={color} />
              <Stop offset="100%" stopColor="rgba(45, 45, 45, 1)" />
            </RadialGradient>
            <LinearGradient id={`divider-${index}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor="#FEDB37" />
              <Stop offset="40%" stopColor="#FDB931" />
              <Stop offset="50%" stopColor="#ffdb8fff" />
              <Stop offset="80%" stopColor="#cea036ff" />
              <Stop offset="100%" stopColor="#FDB931" />
            </LinearGradient>
          </Defs>
          <Path
            d={pathData}
            fill={`url(#gradient-${index})`}
            stroke={`url(#divider-${index})`}
            strokeWidth="2"
          />
          <SvgText
            x={textX}
            y={textY}
            fontSize="14"
            fontWeight="bold"
            fill="#fff"
            textAnchor="middle"
            alignmentBaseline="middle"
          >
            {label}
          </SvgText>
        </G>
      );
    });
  };

  // Place bet function
  const placeBet = async () => {
    if (!selectedMultiplier || freezeBet || betPlaced) {
      setMessage(betPlaced ? 'Bet already placed' : 'Betting is frozen');
      return;
    }

    if (chips < 100) {
      Alert.alert('Insufficient Chips', 'You need at least 100 chips to bet');
      return;
    }

    try {
      const userID = await AsyncStorage.getItem('userID');
      
      // Emit bet to server if socket is connected
      if (socketRef.current && socketRef.current.connected) {
        socketRef.current.emit('place_bet', {
          userID,
          betAmount: 100,
          multiplier: selectedMultiplier
        });
      }

      const newBet = {
        id: Date.now(),
        username: username,
        multiplier: selectedMultiplier,
        amount: 100
      };

      setUserBets(prev => [...prev, newBet]);
      setChips(prev => prev - 100);
      setBetPlaced(true);
      setMessage(`Bet placed on ${selectedMultiplier}!`);

    } catch (error) {
      console.error('Error placing bet:', error);
      Alert.alert('Error', 'Failed to place bet');
    }
  };

  // Spin to specific result
  const spinToResult = (resultLabel) => {
    setIsSpinning(true);
    clearInterval(idleAnimationRef.current);
    setMessage('Spinning...');

    const segmentCount = segmentLabels.length;
    const anglePerSegment = 360 / segmentCount;

    // Find matching segments
    const matchingSegments = segmentLabels
      .map((label, index) => ({ label, index }))
      .filter(s => s.label === resultLabel);

    const selected = matchingSegments[Math.floor(Math.random() * matchingSegments.length)];
    const segmentMidAngle = (selected.index + 0.5) * anglePerSegment;
    const finalRotation = 10 * 360 - segmentMidAngle + 90; // 10 full rotations

    // Animate wheel spin
    wheelRotation.value = withTiming(finalRotation, {
      duration: 7000,
      easing: Easing.out(Easing.cubic),
    });

    // Handle result after spin completes
    setTimeout(() => {
      handleSpinResult(resultLabel);
    }, 7500);
  };

  // Handle spin result
  const handleSpinResult = (resultLabel) => {
    let winAmount = 0;
    let newBalance = chips;

    // Calculate winnings
    userBets.forEach(bet => {
      if (bet.multiplier === resultLabel ||
          (bet.multiplier === 'Double' && resultLabel === 'Double') ||
          (bet.multiplier === 'Triple' && resultLabel === 'Triple') ||
          (bet.multiplier === '5x' && resultLabel === '5x') ||
          (bet.multiplier === '25x' && resultLabel === '25x')) {

        const multiplierValue = resultLabel === 'Double' ? 2 :
                               resultLabel === 'Triple' ? 3 :
                               resultLabel === '5x' ? 5 :
                               resultLabel === '25x' ? 25 : 1;

        winAmount += bet.amount * multiplierValue;
      }
    });

    newBalance += winAmount;
    setChips(newBalance);

    // Show result message
    setTimeout(() => {
      if (winAmount > 0) {
        setMessage(`🎉 You WON ${winAmount} chips!`);
      } else {
        setMessage(`😔 Better luck next time! Landed on ${resultLabel}`);
      }

      // Reset game state
      setUserBets([]);
      setBetPlaced(false);
      setSelectedMultiplier(null);
      setFreezeBet(false);

      // Restart countdown after delay
      setTimeout(() => {
        setIsSpinning(false);
        wheelRotation.value = 0; // Reset wheel position
        idleRotation.value = 0;
        setMessage('');
        startIdleAnimation();
        startCountdown();
      }, 3000);
    }, 500);
  };

  // Initialize app
  useEffect(() => {
    getUserData();
    initializeSounds();
    const cleanup = initializeSocket();
    startGoldenDotAnimation();

    // Initial game setup
    setTimeout(() => {
      setMessage('');
      startCountdown();
    }, 1000);

    startIdleAnimation();

    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
      if (idleAnimationRef.current) {
        clearInterval(idleAnimationRef.current);
      }
      cleanup();
      
      // Cleanup sounds
      Object.values(soundsRef.current).forEach(sound => {
        if (sound) sound.release();
      });
    };
  }, []);

  // Animated styles
  const wheelAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${wheelRotation.value + idleRotation.value}deg` }
    ],
  }));

  const goldenDotAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: goldenDotScale.value }],
  }));

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#222" />
      
      {/* Golden Dot */}
      <Animated.View style={[styles.goldenDot, goldenDotAnimatedStyle]} />

      {/* Game Container */}
      <View style={styles.gameContainer}>
        {/* Wheel */}
        <Animated.View style={[styles.wheelContainer, wheelAnimatedStyle]}>
          <Svg width={wheelSize} height={wheelSize}>
            <Defs>
              <RadialGradient id="wheelBg" cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor="#444" />
                <Stop offset="100%" stopColor="#222" />
              </RadialGradient>
            </Defs>
            <Circle
              cx={radius}
              cy={radius}
              r={radius - 25}
              fill="url(#wheelBg)"
              stroke="#fff"
              strokeWidth="4"
            />
            {createWheelSegments()}
            <Circle
              cx={radius}
              cy={radius}
              r={20}
              fill="#fff"
              stroke="#333"
              strokeWidth="2"
            />
          </Svg>
        </Animated.View>

        {/* Arrow */}
        <View style={styles.arrow} />
      </View>

      {/* Info Panel */}
      <View style={styles.infoPanel}>
        <Text style={styles.welcomeText}>Welcome, {username}!</Text>
        <Text style={styles.chipsText}>Chips: {chips}</Text>
      </View>

      {/* User Bets */}
      <View style={styles.userBets}>
        {userBets.map(bet => (
          <View key={bet.id} style={styles.userBet}>
            <Text style={styles.chipIcon}>💰</Text>
            <Text style={styles.betUsername}>{bet.username}</Text>
            <Text style={styles.betAmount}>{bet.amount}</Text>
            <Text style={styles.betMultiplier}>{bet.multiplier}</Text>
          </View>
        ))}
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <View style={styles.radioGroup}>
          {multiplierOptions.map(option => (
            <RadioButton
              key={option.value}
              selected={selectedMultiplier === option.value}
              onPress={() => setSelectedMultiplier(option.value)}
              label={option.label}
              disabled={freezeBet}
            />
          ))}
        </View>

        <TouchableOpacity
          style={[
            styles.betButton,
            (freezeBet || betPlaced || isSpinning) && styles.buttonDisabled
          ]}
          onPress={placeBet}
          disabled={freezeBet || betPlaced || isSpinning}
        >
          <Text style={styles.betButtonText}>BET 100</Text>
        </TouchableOpacity>

        {/* Countdown Display */}
        {isCountdownActive && (
          <Text style={[
            styles.countdown,
            countdown <= 5 && styles.countdownUrgent
          ]}>
            {countdown > 0 ? `Wheel spins in ${countdown} seconds` : 'Spinning...'}
          </Text>
        )}

        {/* Message Display */}
        {message ? <Text style={styles.message}>{message}</Text> : null}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#222',
    alignItems: 'center',
    paddingVertical: 20,
  },
  goldenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FEFE95',
    marginBottom: 20,
    shadowColor: '#FEFE95',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },
  gameContainer: {
    position: 'relative',
    width: wheelSize,
    height: wheelSize,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wheelContainer: {
    width: wheelSize,
    height: wheelSize,
  },
  arrow: {
    position: 'absolute',
    top: -5,
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 30,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#fff',
    zIndex: 10,
  },
  infoPanel: {
    alignItems: 'center',
    marginBottom: 15,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  chipsText: {
    fontSize: 16,
    color: '#fff',
  },
  userBets: {
    width: screenWidth * 0.9,
    maxWidth: 300,
    marginBottom: 15,
  },
  userBet: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#444',
    padding: 10,
    borderRadius: 6,
    marginBottom: 5,
  },
  chipIcon: {
    fontSize: 16,
  },
  betUsername: {
    color: '#fff',
    fontSize: 14,
    flex: 1,
    marginLeft: 8,
  },
  betAmount: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 8,
  },
  betMultiplier: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  controls: {
    width: screenWidth * 0.9,
    maxWidth: 300,
    backgroundColor: '#333',
    borderRadius: 10,
    padding: 15,
  },
  radioGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  radioButtonSelected: {
    backgroundColor: 'rgba(78, 205, 196, 0.2)',
    borderRadius: 15,
  },
  radioButtonDisabled: {
    opacity: 0.5,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#4ECDC4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  radioCircleSelected: {
    borderColor: '#4ECDC4',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4ECDC4',
  },
  radioText: {
    color: '#fff',
    fontSize: 14,
  },
  radioTextDisabled: {
    color: '#666',
  },
  betButton: {
    backgroundColor: '#6495ED',
    padding: 12,
    borderRadius: 6,
    marginBottom: 10,
  },
  buttonDisabled: {
    backgroundColor: '#666',
  },
  betButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  countdown: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: 'bold',
  },
  countdownUrgent: {
    color: 'red',
  },
  message: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: 'bold',
    marginTop: 10,
  },
});

export default SpinWheelGame;