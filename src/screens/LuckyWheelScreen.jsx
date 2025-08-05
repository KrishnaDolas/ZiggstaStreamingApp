import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Animated,
  Alert,
  Easing,
} from 'react-native';

const PRIZES = ['2x', '3x', '5x', '25x'];

const LuckyWheelScreen = ({ route }) => {
  const { userData } = route.params;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const [chips, setChips] = useState(userData.chips || 10000);
  const [selectedOption, setSelectedOption] = useState(null);
  const [countdown, setCountdown] = useState(30); // start from 30s
  const [isSpinning, setIsSpinning] = useState(false);
  const [hasBet, setHasBet] = useState(false);
  const [currentPrizeIndex, setCurrentPrizeIndex] = useState(0);
  const [resultMessage, setResultMessage] = useState('');

  // Looping slow spin animation
  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 360,
        duration: 8000,
        useNativeDriver: true,
        easing: Easing.linear,
      })
    ).start();
  }, []);

  // Countdown loop
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }

    if (countdown === 0) {
      setIsSpinning(true);
      playFastSpin();
    }
  }, [countdown]);

  // Fast spin & result calculation
  const playFastSpin = () => {
    Animated.timing(rotateAnim, {
      toValue: rotateAnim._value + 720,
      duration: 2000,
      useNativeDriver: true,
      easing: Easing.out(Easing.quad),
    }).start(() => {
      const prizeIndex = Math.floor(Math.random() * PRIZES.length);
      const actualPrize = PRIZES[prizeIndex];
      setCurrentPrizeIndex(prizeIndex);

      let result = '';
      if (hasBet && selectedOption === actualPrize) {
        const multiplier = parseInt(actualPrize);
        const won = multiplier * 100;
        setChips((prev) => prev + won);
        result = `🎉 Success: Won ${won} chips!`;
      } else if (hasBet) {
        setChips((prev) => prev - 100);
        result = `❌ Failed: Lost 100 chips.`;
      } else {
        result = `⌛ No bet placed this round.`;
      }

      setResultMessage(result);
      setHasBet(false);
      setSelectedOption(null);
      setIsSpinning(false);
      setCountdown(30); // restart countdown
    });
  };

  // Handle BET
  const handleBet = () => {
    if (!selectedOption) {
      Alert.alert('Error', 'Select a multiplier to bet.');
      return;
    }
    if (chips < 100) {
      Alert.alert('Not enough chips to bet.');
      return;
    }

    if (hasBet) return; // already bet

    setHasBet(true);
    setResultMessage('');
    Alert.alert('Bet Placed', `100 chips on ${selectedOption}`);
  };

  return (
    <View style={styles.container}>
      {/* Wheel */}
      <ImageBackground
        source={require('../../assets/images/lucky-wheel/wheel_outer.png')}
        style={styles.wheelContainer}
        imageStyle={{ resizeMode: 'contain' }}
      >
        <Animated.Image
          source={require('../../assets/images/lucky-wheel/lw-home.png')}
          style={[
            styles.innerWheel,
            {
              transform: [
                {
                  rotate: rotateAnim.interpolate({
                    inputRange: [0, 360],
                    outputRange: ['0deg', '360deg'],
                  }),
                },
              ],
            },
          ]}
        />
      </ImageBackground>

      {/* User Info */}
      <View style={styles.userInfo}>
        <Text style={styles.welcome}>Welcome, {userData.username}!</Text>
        <Text style={styles.chips}>Chips: {chips}</Text>
      </View>

      {/* Option Selector */}
      <View style={styles.optionsBox}>
        {PRIZES.map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.option,
              selectedOption === option && styles.selectedOption,
            ]}
            onPress={() => setSelectedOption(option)}
            disabled={isSpinning}
          >
            <Text style={styles.optionText}>{option}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* BET Button */}
      <TouchableOpacity
        style={[
          styles.betButton,
          (hasBet || isSpinning) && { backgroundColor: '#999' },
        ]}
        onPress={handleBet}
        disabled={hasBet || isSpinning}
      >
        <Text style={styles.betText}>BET 100</Text>
      </TouchableOpacity>

      {/* Countdown & Result */}
      <Text style={styles.countdown}>
        {countdown > 0 ? `Next spin in: ${countdown}s` : 'Processing...'}
      </Text>
      {!!resultMessage && <Text style={styles.result}>{resultMessage}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    paddingTop: 60,
  },
  wheelContainer: {
    width: 300,
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  innerWheel: {
    width: 200,
    height: 200,
    position: 'absolute',
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  welcome: {
    fontSize: 18,
    color: '#fff',
  },
  chips: {
    fontSize: 16,
    color: '#00FFAA',
  },
  optionsBox: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 15,
  },
  option: {
    backgroundColor: '#444',
    paddingVertical: 10,
    paddingHorizontal: 20,
    margin: 5,
    borderRadius: 8,
  },
  selectedOption: {
    backgroundColor: '#FFD700',
  },
  optionText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  betButton: {
    backgroundColor: '#FF6347',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginBottom: 10,
  },
  betText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  countdown: {
    color: '#ccc',
    fontSize: 14,
    marginTop: 10,
  },
  result: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 5,
  },
});

export default LuckyWheelScreen;
