// GiftSendAnimation.js - Animation for the gift sender
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Animated,
  Dimensions,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { giftImages } from '../utils/constant';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const GiftSendAnimation = ({ giftName, recipientName, onComplete }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const translateYAnim = useRef(new Animated.Value(50)).current;
  const heartScale = useRef(new Animated.Value(0)).current;
  const heartOpacity = useRef(new Animated.Value(1)).current;
  const sparkleAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Main gift animation sequence
    const mainAnimation = Animated.sequence([
      // Initial appearance
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(translateYAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
      // Pulse effect
      Animated.timing(pulseAnim, {
        toValue: 1.1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      // Hold for visibility
      Animated.delay(1500),
      // Exit animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    ]);

    // Heart animation
    const heartAnimation = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(heartScale, {
            toValue: 1.5,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(heartOpacity, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(heartScale, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
        Animated.timing(heartOpacity, {
          toValue: 1,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
      { iterations: 3 }
    );

    // Sparkle animation
    const sparkleAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(sparkleAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(sparkleAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
      { iterations: -1 }
    );

    mainAnimation.start(() => {
      onComplete && onComplete();
    });

    heartAnimation.start();
    sparkleAnimation.start();

    return () => {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.5);
      translateYAnim.setValue(50);
      heartScale.setValue(0);
      heartOpacity.setValue(1);
    };
  }, []);

  const localImage = giftImages[giftName];

  return (
    <View style={styles.sendAnimationContainer}>
      <Animated.View
        style={[
          styles.sendAnimationCard,
          {
            opacity: fadeAnim,
            transform: [
              { scale: Animated.multiply(scaleAnim, pulseAnim) },
              { translateY: translateYAnim },
            ],
          },
        ]}
      >
        {/* Sparkle effects */}
        <Animated.View
          style={[
            styles.sparkleContainer,
            {
              opacity: sparkleAnim,
            },
          ]}
        >
          {[...Array(6)].map((_, index) => (
            <View
              key={index}
              style={[
                styles.sparkle,
                {
                  top: Math.random() * 100 + '%',
                  left: Math.random() * 100 + '%',
                  transform: [{ rotate: `${Math.random() * 360}deg` }],
                },
              ]}
            >
              <Ionicons name="sparkles" size={12} color="#FFD700" />
            </View>
          ))}
        </Animated.View>

        {/* Gift image */}
        <View style={styles.giftImageContainer}>
          {localImage && (
            <FastImage
              style={styles.sendGiftImage}
              source={localImage}
              resizeMode={FastImage.resizeMode.contain}
            />
          )}
        </View>

        {/* Heart effect */}
        <Animated.View
          style={[
            styles.heartEffect,
            {
              opacity: heartOpacity,
              transform: [{ scale: heartScale }],
            },
          ]}
        >
          <Ionicons name="heart" size={30} color="#FF6B6B" />
        </Animated.View>

        {/* Text content */}
        <View style={styles.sendTextContainer}>
          <Text style={styles.sendTitle}>Gift Sent! 🎁</Text>
          <Text style={styles.sendRecipient}>To: {recipientName}</Text>
          <Text style={styles.sendSuccess}>✨ Delivered Successfully</Text>
        </View>
      </Animated.View>
    </View>
  );
};

// GiftReceiveAnimation.js - Animation for the gift receiver
export const GiftReceiveAnimation = ({ giftName, senderName,ReceiverName, onComplete }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const confettiAnim = useRef(new Animated.Value(0)).current;
  const textSlideAnim = useRef(new Animated.Value(30)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Main receive animation sequence
    const mainAnimation = Animated.sequence([
      // Dramatic entrance
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 80,
          friction: 6,
          useNativeDriver: true,
        }),
        Animated.timing(textSlideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
      // Bounce effect
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -10,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]),
      // Hold for celebration
      Animated.delay(2000),
      // Exit animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    ]);

    // Glow animation
    const glowAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
      { iterations: -1 }
    );

    // Confetti animation
    const confettiAnimation = Animated.loop(
      Animated.timing(confettiAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      }),
      { iterations: 2 }
    );

    // Gentle rotation
    const rotationAnimation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      }),
      { iterations: -1 }
    );

    mainAnimation.start(() => {
      onComplete && onComplete();
    });

    glowAnimation.start();
    confettiAnimation.start();
    rotationAnimation.start();

    return () => {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.3);
      bounceAnim.setValue(0);
    };
  }, []);

  const localImage = giftImages[giftName];
  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.receiveAnimationContainer}>
      <Animated.View
        style={[
          styles.receiveAnimationCard,
          {
            opacity: fadeAnim,
            transform: [
              { scale: scaleAnim },
              { translateY: bounceAnim },
            ],
          },
        ]}
      >
        {/* Confetti effect */}
        <Animated.View
          style={[
            styles.confettiContainer,
            {
              opacity: confettiAnim,
            },
          ]}
        >
          {[...Array(12)].map((_, index) => (
            <Animated.View
              key={index}
              style={[
                styles.confettiPiece,
                {
                  left: Math.random() * screenWidth,
                  backgroundColor: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'][index % 6],
                  transform: [
                    {
                      translateY: confettiAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-20, screenHeight],
                      }),
                    },
                    { rotate: rotation },
                  ],
                },
              ]}
            />
          ))}
        </Animated.View>

        {/* Glow effect */}
        {/* <Animated.View
          style={[
            // styles.glowEffect,
            {
              opacity: glowAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.3, 0.8],
              }),
            },
          ]}
        /> */}

        {/* Gift image with rotation */}
        <Animated.View
          style={[
            styles.receiveGiftContainer,
            // {
            //   transform: [{ rotate: rotation }],
            // },
          ]}
        >
          {localImage && (
            <FastImage
              style={styles.receiveGiftImage}
              source={localImage}
              resizeMode={FastImage.resizeMode.contain}
            />
          )}
        </Animated.View>

        {/* Text content */}
        <Animated.View
          style={[
            styles.receiveTextContainer,
            {
              transform: [{ translateY: textSlideAnim }],
            },
          ]}
        >
          <Text style={styles.receiveTitle}>🎉 Gift Received! 🎉</Text>
          <Text style={styles.receiveSender}>From: {senderName}</Text>
          <Text style={styles.receiveSender}>To: {ReceiverName}</Text>
          <Text style={styles.receiveThankYou}>Thank you! ❤️</Text>
        </Animated.View>
      </Animated.View>
    </View>
  );
};

// Styles for both components
const styles = {
  // Send Animation Styles
  sendAnimationContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  sendAnimationCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
    minWidth: 250,
  },
  sparkleContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 1,
  },
  sparkle: {
    position: 'absolute',
  },
  giftImageContainer: {
    marginBottom: 20,
    position: 'relative',
  },
  sendGiftImage: {
    width: 160,  // Doubled from 80
    height: 160, // Doubled from 80
  },
  heartEffect: {
    position: 'absolute',
    top: -15,
    right: -15,
  },
  sendTextContainer: {
    alignItems: 'center',
  },
  sendTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 5,
  },
  sendRecipient: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 5,
  },
  sendSuccess: {
    fontSize: 12,
    color: '#27AE60',
    fontWeight: '600',
  },

  // Receive Animation Styles
  receiveAnimationContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  receiveAnimationCard: {
    backgroundColor: 'white',
    borderRadius: 25,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.4,
    shadowRadius: 25,
    elevation: 20,
    minWidth: 250,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  confettiContainer: {
    position: 'absolute',
    width: screenWidth,
    height: screenHeight,
    top: -screenHeight / 2,
    left: -screenWidth / 2,
    zIndex: 1,
  },
  confettiPiece: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  glowEffect: {
    position: 'absolute',
    width: 200,    // Increased from 120
    height: 200,   // Increased from 120
    // borderRadius: 100,  // Increased from 60
    // backgroundColor: '#FFD700',
    top: '20%',
    left: '50%',
    marginLeft: -100,   // Adjusted from -60
    marginTop: -100,    // Adjusted from -60
  },
  receiveGiftContainer: {
    marginBottom: 20,  // Increased spacing
    padding: 20,       // Doubled from 10
    // backgroundColor: 'rgba(255, 215, 0, 0.1)',
    // borderRadius: 80,  // Increased from 50
    // borderWidth: 2,
    // borderColor: '#FFD700',
  },
  receiveGiftImage: {
    width: 160,  // Doubled from 80
    height: 160, // Doubled from 80
  },
  receiveTextContainer: {
    alignItems: 'center',
  },
  receiveTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#E74C3C',
    marginBottom: 8,
    textAlign: 'center',
  },
  receiveSender: {
    fontSize: 16,
    color: '#3498DB',
    marginBottom: 8,
    fontWeight: '600',
  },
  receiveThankYou: {
    fontSize: 14,
    color: '#27AE60',
    fontWeight: '600',
  },
};