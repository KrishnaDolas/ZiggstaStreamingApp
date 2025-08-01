import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Animated,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const { height: screenHeight } = Dimensions.get('window');

const AnimatedNotification = ({ message, isVisible, onHide, type = 'info' }) => {
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isVisible && message) {
      showNotification();
    }
  }, [isVisible, message]);

  const showNotification = () => {
    // Reset animations
    slideAnim.setValue(screenHeight);
    fadeAnim.setValue(0);

    // Slide in from bottom with fade in
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: screenHeight * 0.4, // Center position
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Stay for 5 seconds then hide
      setTimeout(() => {
        hideNotification();
      }, 2000);
    });
  };

  const hideNotification = () => {
    // Slide to top with fade out
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -100, // Move to top
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide && onHide();
    });
  };

  const getNotificationStyle = () => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: '#4CAF50',
          borderLeftColor: '#2E7D32',
          shadowColor: '#4CAF50',
        };
      case 'error':
        return {
          backgroundColor: '#F44336',
          borderLeftColor: '#C62828',
          shadowColor: '#F44336',
        };
      case 'warning':
        return {
          backgroundColor: '#FF9800',
          borderLeftColor: '#EF6C00',
          shadowColor: '#FF9800',
        };
      default:
        return {
          backgroundColor: 'transparent',
          borderLeftColor: 'transparent',
          shadowColor: 'transparent',
        };
    }
  };

  if (!isVisible || !message) return null;

    return (
        <>

            <Animated.View
                style={[
                    styles.container,
                    getNotificationStyle(),
                    {
                        transform: [{ translateY: slideAnim }],
                        opacity: fadeAnim,
                    },
                ]}
            >
                <LinearGradient
                    colors={['rgba(0, 0, 0, 0.2)', 'rgba(0, 0, 0, 0.79)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                >
                <TouchableOpacity onPress={hideNotification} style={styles.notification}>
                    <Text style={styles.message}>{message}</Text>
                </TouchableOpacity>
                </LinearGradient>
            </Animated.View>
        </>

    );
};
const styles = StyleSheet.create({
    container: {
      position: 'absolute',
      left: 20,
      right: 20,
      zIndex: 1000,
      borderRadius: 16,
      borderLeftWidth: 6,
      elevation: 8,
      shadowOffset: {
        width: 0,
        height: 0,
      },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      overflow: 'hidden',
    },
    notification: {
      padding: 24,
      alignItems: 'center',
      backgroundColor: 'transparent',
      backdropFilter: 'blur(10px)',
      borderRadius: 16,
      margin: 2,
    },
    message: {
      color: 'white',
      fontSize: 15,
      fontWeight: '600',
      textAlign: 'center',
      lineHeight: 14,
      textShadowColor: 'rgba(211, 138, 138, 0.3)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },
  });
export default AnimatedNotification;