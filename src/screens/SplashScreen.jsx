import React, { useContext } from 'react';
import { View, Image, Text, TouchableOpacity, StatusBar } from 'react-native';
import { styles, themeStyles } from '../../assets/styles/ThemeStyles';
import logo from '../../assets/images/logo.png';
import LinearGradient from 'react-native-linear-gradient';
import { ThemeContext } from '../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const SplashScreen = () => {
  const insets = useSafeAreaInsets();
  const { theme } = useContext(ThemeContext);
  const navigation = useNavigation();

  return (
    <View style={[styles.SplashScreen, themeStyles[theme].SplashScreen, { paddingBottom: insets.bottom }]}>
      <StatusBar
        hidden={false} // Show the status bar
        barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={
          theme === 'dark' ? '#000' : '#fff' // adjust based on your theme background
        }
      />
      <Image source={logo} style={styles.splashImage} />
      <TouchableOpacity
        style={[
          styles.splashButton,
          { bottom: insets.bottom + 30 },
          themeStyles[theme].splashButton,
        ]}
        onPress={() => navigation.navigate('Auth')}
      >
        <LinearGradient
          colors={['rgb(238, 41, 123)', 'rgb(183, 1, 255)']}
          start={{ x: 0, y: 0 }} // top-left
          end={{ x: 1, y: 1 }} // bottom-right (135°)
          style={styles.gradientBackground}
        >
          <Text
            style={[
              styles.splashButtonText,
              themeStyles[theme].splashButtonText,
            ]}>
            Get Started
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};
