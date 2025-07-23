import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, View, Image, Text } from 'react-native';
import { giftImages } from '../utils/constant';

const AnimatedGift = ({ giftName, username }) => {
  const bottomAnim = useRef(new Animated.Value(40)).current;
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Animate from 10px to 30px
    Animated.timing(bottomAnim, {
      toValue: 100,
      duration: 1000,
      useNativeDriver: false,
    }).start(() => {
      // Optional: hide after animation
      setTimeout(() => {
        setVisible(false);
      }, 2000);
    });
  }, []);

  if (!visible || !giftImages[giftName]) return null;

  return (
    <Animated.View style={[styles.giftContainer, { bottom: bottomAnim }]}>
      <Image source={giftImages[giftName]} style={styles.giftImage} />
      <Text style={styles.username}>{username} sent a gift</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  giftContainer: {
    position: 'absolute',
    left: 70,
    backgroundColor: 'transparent',
    borderRadius: 8,
    alignItems: 'center',
    elevation: 5,
    height:40,
    width:40
  },
  giftImage: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
  username: {
    fontWeight: 'bold',
    marginBottom: 50,
  },
});

export default AnimatedGift;
