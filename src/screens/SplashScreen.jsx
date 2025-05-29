import React from 'react';
import { View, Text, Image } from 'react-native';
import { styles } from '../../assets/styles/ThemeStyles';
import LinearGradient from 'react-native-linear-gradient';
import logo from "../../assets/images/logo.png";

export const SplashScreen = () => {
    return (
            <View style={styles.SplashScreen}>
                <Image
                    source={logo}
                    style={styles.splashImage}
                />
            </View>
    );
};
