import React, { useContext, useEffect } from 'react';
import { View } from 'react-native';
import { styles, themeStyles } from '../../assets/styles/ThemeStyles';
import { ThemeContext } from '../context/ThemeContext';
import {
    BannerAd,
    BannerAdSize,
} from 'react-native-google-mobile-ads';
import mobileAds from 'react-native-google-mobile-ads';

const unitId = 'ca-app-pub-3940256099942544/6300978111'; // fixed size banner
const unitId2 = 'ca-app-pub-3940256099942544/9214589741'; // test Adaptive Banner

const GoogleBannerAd = () => {
    const { theme } = useContext(ThemeContext);

    useEffect(() => {
        mobileAds()
            .initialize()
            .then(() => {
                console.log('AdMob initialized');
            });
    }, []);

    return (
        <View style={[styles.googleAdContainer, themeStyles[theme].googleAdContainer]}>
            <BannerAd
                unitId={unitId2}
                size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
                requestOptions={{
                    requestNonPersonalizedAdsOnly: true,
                }}
            />
        </View>
    );
};


export default GoogleBannerAd;
