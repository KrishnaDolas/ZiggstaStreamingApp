
import React, {  useEffect, useRef } from 'react';
import { View,  Animated } from 'react-native';

// Audio Spectrum Component
const AudioSpectrum = ({ audioLevel, streamLayout }) => {
    const animatedValues = useRef(
      Array.from({ length: 5 }, () => new Animated.Value(0))
    ).current;
  
    useEffect(() => {
      if (audioLevel && audioLevel > 0) {
        // audioLevel is already between 0.0 and 1.0
        const normalizedLevel = Math.min(audioLevel, 1.0);
        
        animatedValues.forEach((animValue, index) => {
          const delay = index * 50; // Stagger the animation
          const targetHeight = normalizedLevel * (1 - index * 0.15); // Decrease height for each bar
          
          Animated.timing(animValue, {
            toValue: Math.max(targetHeight, 0.1), // Minimum height
            duration: 100,
            delay,
            useNativeDriver: false,
          }).start();
        });
      } else {
        // Reset all bars when no audio
        animatedValues.forEach((animValue) => {
          Animated.timing(animValue, {
            toValue: 0.1,
            duration: 200,
            useNativeDriver: false,
          }).start();
        });
      }

    }, [audioLevel]);
  
    const barSize = streamLayout.length >= 6 ? 2 : 2;
    const barSpacing = streamLayout.length >= 6 ? 1 : 2;
  
    return (
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        height: streamLayout.length >= 6 ? 20 : 30,
        justifyContent: 'center',
        borderRadius: 40,
        backgroundColor:'rgba(14, 13, 13, 0.5)',
        padding: 2,
        width: '30',
        height:'30'
      }}>
        {animatedValues.map((animValue, index) => (
          <Animated.View
            key={index}
            style={{
              width: barSize,
              marginHorizontal: barSpacing / 2,
              backgroundColor: audioLevel > 0 ? '#00ff00' : 'rgba(255,255,255,0.3)',
              borderRadius: 1,
              height: animValue.interpolate({
                inputRange: [0, 1],
                outputRange: ['10%', '100%'],
              }),
            }}
          />
        ))}
      </View>
    );
  };
  

export default AudioSpectrum;