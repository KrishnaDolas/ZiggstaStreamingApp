import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
  Image,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width, height } = Dimensions.get('window');

const PRIMARY = '#db3b63';
const WHITE = '#FFFFFF';
const LIGHT_BG = '#F8FAFC';
const CARD_BG = '#FFFFFF';
const BORDER = '#E5E7EB';
const TEXT_PRIMARY = '#111827';
const TEXT_SECONDARY = '#6B7280';

const StreamWelcomeModal = ({ visible, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const messages = [
    {
      title: 'Welcome To Ziggsta',
      text:
        'Welcome to the stream! Greet the host by text or request the video guest box via the plus sign below.',
      color: PRIMARY,
      icon: 'party-popper',
    },
    {
      title: 'Games & Gifts',
      text:
        "Check out the gifts to give & super fun games to play on the right.\n\nIf you win, the host receives the winnings & you receive your gift amount back.\n\nExcludes the 'Slot' game - the host receives all Ziggcoins won.",
      color: PRIMARY,
      icon: 'gift',
    },
    {
      title: 'Community Rules',
      text:
        'Please be respectful. Abuse will not be tolerated & may result in you being blocked from Ziggsta.\n\nFees apply to be unblocked, with a 3 strike permanent ban policy.',
      color: PRIMARY,
      icon: 'shield-check',
    },
  ];

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    if (visible) {
      setCurrentStep(0);
    }
  }, [visible]);

  useEffect(() => {
    if (visible) {
      fadeAnim.setValue(0);
      slideAnim.setValue(20);

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 350,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [currentStep, visible]);

  const handleNext = () => {
    if (currentStep < messages.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleClose = () => {
    setCurrentStep(0);
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <StatusBar
        backgroundColor="rgba(255,255,255,0.95)"
        barStyle="dark-content"
      />

      <View style={styles.overlay}>
        <View style={styles.modalContainer}>

          {/* Soft Glow */}
          <View style={styles.topGlow} />

          {/* Close Button */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleClose}
            activeOpacity={0.85}
          >
            <Icon name="close" size={22} color={TEXT_PRIMARY} />
          </TouchableOpacity>

          {/* Logo */}
          <Image
            source={require('../../assets/images/logo_ziggsta_hor.png')}
            style={styles.logo}
            resizeMode="contain"
          />

          {/* Header */}
          <Text style={styles.heading}>
            Stream Guidelines
          </Text>

          <Text style={styles.subHeading}>
            Please review before joining the stream
          </Text>

          {/* Stepper */}
          <View style={styles.stepperContainer}>
            {messages.map((_, index) => (
              <React.Fragment key={index}>
                <View
                  style={[
                    styles.stepCircle,
                    index <= currentStep && styles.activeStepCircle,
                  ]}
                >
                  {index < currentStep ? (
                    <Icon name="check" size={14} color="#FFFFFF" />
                  ) : (
                    <Text
                      style={[
                        styles.stepNumber,
                        index <= currentStep && styles.activeStepNumber,
                      ]}
                    >
                      {index + 1}
                    </Text>
                  )}
                </View>

                {index < messages.length - 1 && (
                  <View
                    style={[
                      styles.stepLine,
                      index < currentStep && styles.activeStepLine,
                    ]}
                  />
                )}
              </React.Fragment>
            ))}
          </View>

          {/* Animated Message Card */}
          <Animated.View
            style={[
              styles.messageCard,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.iconContainer}>
              <Icon
                name={messages[currentStep].icon}
                size={34}
                color={messages[currentStep].color}
              />
            </View>

            <Text style={styles.messageTitle}>
              {messages[currentStep].title}
            </Text>

            <Text style={styles.messageText}>
              {messages[currentStep].text}
            </Text>
          </Animated.View>

          {/* Controls */}
          {currentStep < messages.length - 1 ? (
            <TouchableOpacity
              style={styles.controlButton}
              activeOpacity={0.9}
              onPress={handleNext}
            >
              <Text style={styles.controlButtonText}>
                Continue
              </Text>

              <Icon
                name="arrow-right"
                size={20}
                color="#FFFFFF"
                style={{ marginLeft: 8 }}
              />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.controlButton}
              activeOpacity={0.9}
              onPress={handleClose}
            >
              <Text style={styles.controlButtonText}>
                Join Stream
              </Text>

              <Icon
                name="rocket-launch"
                size={20}
                color="#FFFFFF"
                style={{ marginLeft: 8 }}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 18,
  },

  modalContainer: {
    width: '100%',
    maxWidth: 430,
    borderRadius: 30,

    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 22,

    overflow: 'hidden',

    backgroundColor: WHITE,

    borderWidth: 1,
    borderColor: BORDER,

    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: {
      width: 0,
      height: 6,
    },

    elevation: 8,
  },

  topGlow: {
    position: 'absolute',
    top: -110,
    alignSelf: 'center',

    width: 240,
    height: 240,
    borderRadius: 120,

    backgroundColor: 'rgba(219,59,99,0.08)',
  },

  closeButton: {
    position: 'absolute',
    top: 18,
    right: 18,

    width: 40,
    height: 40,
    borderRadius: 20,

    backgroundColor: '#F3F4F6',

    justifyContent: 'center',
    alignItems: 'center',

    borderWidth: 1,
    borderColor: '#E5E7EB',

    zIndex: 10,
  },

  logo: {
    width: 185,
    height: 60,
    alignSelf: 'center',

    marginTop: 5,
    marginBottom: 10,
  },

  heading: {
    fontSize: 28,
    fontWeight: '800',
    color: PRIMARY,
    textAlign: 'center',
    letterSpacing: 0.3,
  },

  subHeading: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    textAlign: 'center',

    marginTop: 10,
    marginBottom: 28,

    lineHeight: 22,
    paddingHorizontal: 10,

    fontWeight: '500',
  },

  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    marginBottom: 24,
  },

  stepCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,

    borderWidth: 2,
    borderColor: '#D1D5DB',

    backgroundColor: '#FFFFFF',

    justifyContent: 'center',
    alignItems: 'center',
  },

  activeStepCircle: {
    backgroundColor: PRIMARY,
    borderColor: PRIMARY,
  },

  stepNumber: {
    color: '#6B7280',
    fontWeight: '700',
    fontSize: 14,
  },

  activeStepNumber: {
    color: '#FFFFFF',
  },

  stepLine: {
    width: 42,
    height: 3,

    backgroundColor: '#E5E7EB',

    marginHorizontal: 8,
    borderRadius: 20,
  },

  activeStepLine: {
    backgroundColor: PRIMARY,
  },

  messageCard: {
    backgroundColor: LIGHT_BG,

    borderRadius: 24,

    paddingTop: 20,
    paddingBottom: 18,
    paddingHorizontal: 18,

    alignItems: 'center',

    marginBottom: 24,

    borderWidth: 1,
    borderColor: '#EEF0F3',

    minHeight: 245,

    justifyContent: 'flex-start',

    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },

    elevation: 2,
  },

  iconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,

    justifyContent: 'center',
    alignItems: 'center',

    marginBottom: 14,

    backgroundColor: 'rgba(219,59,99,0.10)',
  },

  messageTitle: {
    fontSize: 22,
    fontWeight: '800',

    marginBottom: 10,

    textAlign: 'center',

    color: PRIMARY,
  },

  messageText: {
    fontSize: 14.5,
    lineHeight: 22,

    color: TEXT_PRIMARY,

    textAlign: 'center',

    fontWeight: '500',
  },

  controlButton: {
    height: 58,
    borderRadius: 18,

    justifyContent: 'center',
    alignItems: 'center',

    flexDirection: 'row',

    backgroundColor: PRIMARY,

    shadowColor: PRIMARY,
    shadowOpacity: 0.20,
    shadowRadius: 10,

    shadowOffset: {
      width: 0,
      height: 5,
    },

    elevation: 6,
  },

  controlButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});

export default StreamWelcomeModal;