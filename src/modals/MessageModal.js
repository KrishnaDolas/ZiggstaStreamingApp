import React, { useEffect, useRef } from 'react';
import { Text, StyleSheet, Animated, Dimensions, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Modal from 'react-native-modal';

const { height: screenHeight, width: screenWidth } = Dimensions.get('window');

const MessageModal = ({ visible, message, onClose }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;

  useEffect(() => {
    if (visible) {
      // Reset animations
      fadeAnim.setValue(0);
      slideAnim.setValue(screenHeight * 0.3);

      // Start entrance animations
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto close after 2 seconds
      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: screenHeight * 0.3,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => {
          onClose?.();
        });
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [visible, fadeAnim, slideAnim]);

  if (!visible) return null;

  return (
  <Modal
      isVisible={visible}
      backdropOpacity={0}
      animationIn="fadeIn"
      animationOut="fadeOut"
      useNativeDriver
      style={styles.modalContainer}
    >
      <Animated.View
        style={[
          styles.mainAnimated,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* SHADOW WRAPPER */}
        <View style={styles.shadowWrapper}>
          
          {/* GRADIENT + TEXT WRAPPER */}
          <View style={styles.gradientWrapper}>
            
            {/* Gradient as background only */}
            <LinearGradient
              colors={['#111', '#444']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientBg}
            />

            {/* Text ABOVE gradient */}
            <Text style={styles.messageText}>
              {message}
            </Text>

          </View>
        </View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    margin: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },

  mainAnimated: {
    width: '85%',
    alignItems: 'center',
  },

  shadowWrapper: {
    width: '100%',
    borderRadius: 40,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 20,
    elevation: 10, // Android
  },

  gradientWrapper: {
    width: '100%',
    borderRadius: 40,
    overflow: 'hidden', // safe here
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 24,
  },

  gradientBg: {
    ...StyleSheet.absoluteFillObject,
  },

  messageText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 22,
    letterSpacing: 0.5,
  },
});

export default React.memo(MessageModal);