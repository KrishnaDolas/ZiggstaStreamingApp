import React, { useEffect, useRef } from 'react';
import { Text, StyleSheet, Animated, Dimensions, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Modal from 'react-native-modal';

const screenHeight = Dimensions.get('window').height;
const screenWidth = Dimensions.get('window').width;

const MessageModal = ({ visible, message, onClose }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;

  console.log('message', message);


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
      key={`message-modal-${message}`}
    >
      <Animated.View
        style={[
          styles.backdrop,
          {
            opacity: fadeAnim,
          }
        ]}
      >
        <LinearGradient
          colors={['rgba(0, 0, 0, 0.2)', 'rgba(0, 0, 0, 0)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientBackdrop}
        />
      </Animated.View>

      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        <View style={styles.shadowWrapper}>
          <LinearGradient
            colors={['#1a1a1a', '#444']}
            style={styles.messageBox}
          >
            <Text style={styles.messageText}>{message}</Text>
          </LinearGradient>
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
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gradientBackdrop: {
    flex: 1,
    width: screenWidth,
    height: screenHeight,
  },
  messageContainer: {
    minWidth: 200,
    maxWidth: '85%',
    alignItems: 'center',
  },
  shadowWrapper: {
    width: '100%',
    borderRadius: 40,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 12,
  },

  messageBox: {
    width: '100%',
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 40,
    // IMPORTANT: DO NOT ADD overflow: 'hidden' ON IOS
  },

  messageText: {
    color: '#fff',
    fontSize: 15,
    textAlign: 'center',
    fontWeight: '600',
    letterSpacing: 0.5,
    lineHeight: 22,
  },
});

export default React.memo(MessageModal);