import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import Modal from 'react-native-modal';

const screenHeight = Dimensions.get('window').height;

const MessageModal = ({ visible, message, type = 'info', onClose }) => {
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      const timer = setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          onClose?.();
        });
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const backgroundColor = {
    success: '#4BB543',
    error: '#FF4C4C',
    warning: '#FFA500',
    info: '#4D9DE0',
  }[type] || '#333';

  return (
    <Modal
      isVisible={visible}
      backdropOpacity={0.3}
      animationIn="fadeIn"
      animationOut="fadeOut"
      useNativeDriver
      style={styles.modalContainer}
    >
      <Animated.View style={[styles.messageBox, { backgroundColor, opacity: fadeAnim }]}>
        <Text style={styles.messageText}>{message}</Text>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    margin: 0,
  },
  messageBox: {
    minWidth: 200,
    maxWidth: '80%',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 6,
  },
  messageText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
});

export default MessageModal;
