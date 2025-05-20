import React from 'react';
import { View, Text } from 'react-native';
import { styles } from '../../assets/styles/ThemeStyles';
import LinearGradient from 'react-native-linear-gradient';

export const SplashScreen = () => {
    return (
        <LinearGradient
            colors={['rgb(160, 0, 223)', 'rgba(252, 70, 146, 1)']}
            style={styles.SplashScreen}
        >
            <Text style={styles.splashText}>ZIGGSTA</Text>
        </LinearGradient>
    );
};
