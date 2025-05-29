import React, { useContext } from 'react';
import { View, Image, Button, Text, TouchableOpacity } from 'react-native';
import { styles, themeStyles } from '../../assets/styles/ThemeStyles';
import logo from "../../assets/images/logo.png";
import LinearGradient from 'react-native-linear-gradient';
import { ThemeContext } from '../context/ThemeContext';

export const SplashScreen = () => {
 const { theme } = useContext(ThemeContext);
    return (
            <View style={styles.SplashScreen}>
                <Image
                    source={logo}
                    style={styles.splashImage}
                />
                <LinearGradient
                    colors={[ 'rgb(238, 41, 123)', 'rgb(183, 1, 255)']}
                    start={{ x: 0, y: 0 }}  // top-left
                    end={{ x: 1, y: 1 }}    // bottom-right (135°)
                    style={[styles.splashButton, themeStyles['dark'].splashButton]}
                >
                    <TouchableOpacity onPress={() => console.log('Get Started Pressed')}>
                        <Text style={[styles.splashButtonText,themeStyles[theme].splashButtonText]}>Get Started</Text>
                    </TouchableOpacity>

                </LinearGradient>
            </View>
    );
};
