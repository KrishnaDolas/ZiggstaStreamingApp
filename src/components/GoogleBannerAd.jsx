import React, { useContext } from 'react';
import { View, Image } from 'react-native';
import { styles, themeStyles } from '../../assets/styles/ThemeStyles';
import { ThemeContext } from '../context/ThemeContext';
// import {
//     BannerAd,
//     BannerAdSize,
//     TestIds,
// } from 'react-native-google-mobile-ads';

// const adUnitId = __DEV__
//     ? TestIds.BANNER
//     : Platform.OS === 'android'
//         ? 'ca-app-pub-xxxxxxxxxxxxxxxx/xxxxxxxxxx' // 🔁 Replace with Android Banner Ad Unit ID
//         : 'ca-app-pub-xxxxxxxxxxxxxxxx/xxxxxxxxxx'; // 🔁 Replace with iOS Banner Ad Unit ID
const GoogleBannerAd = () => {
    const { theme } = useContext(ThemeContext);
    return (
        <View style={[styles.googleAdContainer, themeStyles[theme].googleAdContainer]}>
            {/* <BannerAd
                unitId={adUnitId}
                size={BannerAdSize.BANNER} // Small banner: 320x50
                requestOptions={{
                    requestNonPersonalizedAdsOnly: true,
                }}
            /> */}
            <Image
                source={require('../../assets/images/google-ad.png')} // adjust path
                style={styles.googleAdBanner}
                resizeMode="contain"
            />
        </View>
    );
};


export default GoogleBannerAd;
