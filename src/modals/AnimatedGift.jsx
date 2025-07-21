import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, View, Image, Text } from 'react-native';

const giftImages = {
    '420.gif': require('../../assets/images/gifts/420.gif'),
    'award.gif': require('../../assets/images/gifts/award.gif'),
    'balloons.gif': require('../../assets/images/gifts/balloons.gif'),
    'boss.gif': require('../../assets/images/gifts/boss.gif'),
    'broken-heart.gif': require('../../assets/images/gifts/broken-heart.gif'),
    'casino-chip.gif': require('../../assets/images/gifts/casino-chip.gif'),
    'casino-chip2.gif': require('../../assets/images/gifts/casino-chip2.gif'),
    'casino-chip3.gif': require('../../assets/images/gifts/casino-chip3.gif'),
    'casino-chip5.gif': require('../../assets/images/gifts/casino-chip5.gif'),
    'clown.gif': require('../../assets/images/gifts/clown.gif'),
    'crown.gif': require('../../assets/images/gifts/crown.gif'),
    'diamond.gif': require('../../assets/images/gifts/diamond.gif'),
    'diamond2.gif': require('../../assets/images/gifts/diamond2.gif'),
    'diamond3.gif': require('../../assets/images/gifts/diamond3.gif'),
    'dollar.gif': require('../../assets/images/gifts/dollar.gif'),
    'financial-freedom.gif': require('../../assets/images/gifts/financial-freedom.gif'),
    'hearts.gif': require('../../assets/images/gifts/hearts.gif'),
    'in-love.gif': require('../../assets/images/gifts/in-love.gif'),
    'jack-in-the-box.gif': require('../../assets/images/gifts/jack-in-the-box.gif'),
    'laugh.gif': require('../../assets/images/gifts/laugh.gif'),
    'like.gif': require('../../assets/images/gifts/like.gif'),
    'love.gif': require('../../assets/images/gifts/love.gif'),
    'piggy-bank.gif': require('../../assets/images/gifts/piggy-bank.gif'),
    'popcorn.gif': require('../../assets/images/gifts/popcorn.gif'),
    'popcorn2.gif': require('../../assets/images/gifts/popcorn2.gif'),
    'profit.gif': require('../../assets/images/gifts/profit.gif'),
    'savings3.gif': require('../../assets/images/gifts/savings3.gif'),
    'sunrise.gif': require('../../assets/images/gifts/sunrise.gif'),
    'ticket.gif': require('../../assets/images/gifts/ticket.gif'),
    'ticket2.gif': require('../../assets/images/gifts/ticket2.gif'),
    'valentines-day.gif': require('../../assets/images/gifts/valentines-day.gif'),
    'wallet.gif': require('../../assets/images/gifts/wallet.gif'),
    'wave.gif': require('../../assets/images/gifts/wave.gif'),
    'win-win.gif': require('../../assets/images/gifts/win-win.gif'),
};

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
