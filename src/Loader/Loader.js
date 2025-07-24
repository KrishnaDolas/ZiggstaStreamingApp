import React, { useEffect, useRef } from 'react';
import { View, Image, StyleSheet, Animated, Dimensions, Easing } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import { useAppContext } from '../context/AppContext';
const { width, height } = Dimensions.get('window');

const Loader = ({ LoaderImage, currentStreamData }) => {
  const { setIsInStreamRoom } = useAppContext();
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setIsInStreamRoom(true); // keep global value in sync
    return () => setIsInStreamRoom(false); // reset when unmounted
  }, [setIsInStreamRoom]);


  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const rotateStyle = {
    transform: [
      {
        rotate: rotateAnim.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '360deg'],
        }),
      },
    ],
  };

  return (
    <View style={styles.container}>
      <Image source={LoaderImage} style={styles.backgroundImage} resizeMode="cover" />
      <BlurView
        style={StyleSheet.absoluteFill}
        blurType="light" // or "dark", "extraLight"
        blurAmount={9}
        reducedTransparencyFallbackColor="white" // for Android fallback
      />
      <View style={styles.centerContent}>
        <View style={styles.logoWrapper}>
          <Image source={LoaderImage} style={styles.logo} resizeMode="cover" />
        </View>
        <Animated.View style={[styles.spinnerBorder, rotateStyle]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    height: height,
    width: width,
    flex: 1,
  },
  backgroundImage: {
    position: 'absolute',
    width: width,
    height: height,
    zIndex: 100
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  logoWrapper: {
    width: 100,
    height: 100,
    borderRadius: 40,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 101, // Bring image above spinner
  },

  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },

  spinnerBorder: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 5,
    borderColor: 'rgba(255,255,255,0.2)',
    borderTopColor: '#ffffff',
    zIndex: 1,
  },
});

export default Loader;
