import React, { useEffect, useRef } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Animated,
  Dimensions,
  Easing,
  Text,
} from 'react-native';
import { useAppContext } from '../context/AppContext';
import { getGenderFallbackImage } from '../utils/constant';

const { width, height } = Dimensions.get('window');

const Loader = ({ currentStreamData }) => {
  const { setIsInStreamRoom } = useAppContext();

  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulse1 = useRef(new Animated.Value(0)).current;
  const pulse2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setIsInStreamRoom(true);
    // return () => setIsInStreamRoom(false);
  }, [setIsInStreamRoom]);

  useEffect(() => {
    // Spinner
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Pulses
    const createPulse = (pulseRef, delay = 0) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(pulseRef, {
            toValue: 1,
            duration: 1600,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseRef, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      ).start();

    createPulse(pulse1, 0);
    createPulse(pulse2, 800);
  }, []);



  const avatarSource =
    !currentStreamData?.avatar || currentStreamData?.avatar === 'default'
      ? getGenderFallbackImage(currentStreamData?.gender)
      : { uri: currentStreamData.avatar };

  const spinStyle = {
    transform: [
      {
        rotate: rotateAnim.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '360deg'],
        }),
      },
    ],
  };

  const pulseStyle = (anim) => ({
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    opacity: anim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.6, 0],
    }),
    transform: [
      {
        scale: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 2.2],
        }),
      },
    ],
  });

  return (
    <View style={styles.container}>
      <Image source={avatarSource} style={styles.backgroundImage} resizeMode="cover" />
      <View style={styles.overlay} />

      <View style={styles.centerContent}>
        {/* Avatar + Pulse + Spinner inside fixed square */}
        <View style={styles.avatarContainer}>
          {/* Pulses */}
          <Animated.View style={pulseStyle(pulse1)} />
          <Animated.View style={pulseStyle(pulse2)} />

          {/* Spinner */}
          <Animated.View style={[styles.spinnerWrapper, spinStyle]}>
            <View style={styles.spinnerRing} />
          </Animated.View>

          {/* Avatar */}
          <View style={styles.logoWrapper}>
            <Image source={avatarSource} style={styles.logo} resizeMode="cover" />
          </View>
        </View>

        {/* Joining text (below avatarContainer) */}
        <Text
          style={[
            styles.joiningText,
            // {
            //   opacity: textPulse,
            //   transform: [{ scale: textPulse }],
            // },
          ]}
        >
          Joining stream...
        </Text>
      </View>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width,
    height,
    zIndex: 999,
  },
  backgroundImage: {
    position: 'absolute',
    width,
    height,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 150,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinnerWrapper: {
    position: 'absolute',
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinnerRing: {
    width: 120,
    height: 120,
    borderRadius: 75,
    borderWidth: 3,
    borderTopColor: '#FFFFFF',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
  },
  logoWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#fff',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  logo: {
    width: 94,
    height: 94,
    borderRadius: 47,
  },
  joiningText: {
    color: '#FFFFFF',
    fontSize: 18,
    marginTop: 20,
    fontWeight: '600',
  },
});

export default Loader;
