import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  ActivityIndicator,
} from 'react-native';

const { width, height } = Dimensions.get('window');

const ConnectingPanel = ({ isVisible, onRetry }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isVisible) {
      // Fade in animation
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Pulse animation for the connecting text
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.7,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();

      return () => {
        pulseAnimation.stop();
      };
    } else {
      // Fade out animation
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible]);

  if (!isVisible) {
    return null;
  }

  return (
    <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
      <View style={styles.panel}>
       
        <ActivityIndicator size="large" color="#007AFF" style={styles.spinner} />
        
        <Animated.View style={{ opacity: pulseAnim }}>
          <Text style={styles.connectingText}>Connecting...</Text>
        </Animated.View>
        
        <Text style={styles.description}>
          Trying to reconnect to the server
        </Text>
        
        <View style={styles.dotsContainer}>
          <LoadingDots />
        </View>
        
        {onRetry && (
          <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
            <Text style={styles.retryButtonText}>Retry Connection</Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
};

// Animated loading dots component
const LoadingDots = () => {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animateDots = () => {
      const createDotAnimation = (dot, delay) => {
        return Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(dot, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(dot, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.delay(800),
          ])
        );
      };

      Animated.parallel([
        createDotAnimation(dot1, 0),
        createDotAnimation(dot2, 200),
        createDotAnimation(dot3, 400),
      ]).start();
    };

    animateDots();
  }, []);

  return (
    <View style={styles.dots}>
      <Animated.View style={[styles.dot, { opacity: dot1 }]} />
      <Animated.View style={[styles.dot, { opacity: dot2 }]} />
      <Animated.View style={[styles.dot, { opacity: dot3 }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  panel: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
    minWidth: width * 0.7,
    maxWidth: width * 0.9,
  },
  iconContainer: {
    marginBottom: 20,
  },
  wifiIcon: {
    width: 60,
    height: 40,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  wifiBar: {
    position: 'absolute',
    backgroundColor: '#FF6B6B',
    borderRadius: 2,
  },
  bar1: {
    width: 20,
    height: 8,
    bottom: 0,
  },
  bar2: {
    width: 30,
    height: 15,
    bottom: 0,
  },
  bar3: {
    width: 40,
    height: 22,
    bottom: 0,
  },
  spinner: {
    marginBottom: 20,
  },
  connectingText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 20,
  },
  dotsContainer: {
    marginBottom: 20,
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007AFF',
    marginHorizontal: 4,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 10,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ConnectingPanel;