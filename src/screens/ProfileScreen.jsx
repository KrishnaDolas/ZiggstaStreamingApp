import React, { useContext, useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, SafeAreaView, StatusBar } from 'react-native';
import { styles, themeStyles } from '../../assets/styles/ThemeStyles';
import { ThemeContext } from '../context/ThemeContext';
import { ActivityIndicator } from 'react-native';
import Footer from '../components/Footer';
import Apiclient from '../utils/Apiclient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const ProfileScreen = ({ userData, onLogout, address }) => {
    const { theme } = useContext(ThemeContext);
    const insetsTop = useSafeAreaInsets();
    const [profileData, setProfileData] = useState({});
    const [isUserLoading, setIsUserLoading] = useState(false);
    const [isUserError, setIsUserError] = useState(null);
    const [topGiftersData, setTopGiftersData] = useState([]);

    // get profile details from API
    useEffect(() => {
        const fetchProfileDetails = async () => {
            setIsUserLoading(false);
            setIsUserError('');
            try {
                const formData = {
                    userid: userData.userid,
                };
                const response = await Apiclient.post('/getUserDetails', formData);
                if (response.status === 200) {
                    setProfileData(response.data.user || {});
                } else {
                    setIsUserError('Failed to fetch user profile details');
                }
            } catch (err) {
                setIsUserError('Error fetching user profile details: ' + err.message);
            } finally {
                setIsUserLoading(false);
            }
        };
        fetchProfileDetails();
    }, [userData.userid]);


    // to get top gifters
    useEffect(() => {
        const getTopGifters = async () => {
            const formData = {
                toUserId: userData.userid,
                gifterCount: 25,
            }
            try {
                const response = await Apiclient.post('/topgifters', formData);
                console.log('topgifters response', response.data);
                if (response) {
                    setTopGiftersData(response.data || []);
                } else {
                    setIsUserError('Failed to fetch top gifters data');
                }
            } catch (err) {
                setIsUserError('Error fetching top gifters data: ' + err.message);
            }
        };
        getTopGifters();
    }, [userData.userid]);


    return (
        <SafeAreaView style={{ flex: 1, position: 'relative', paddingBottom: 80, paddingTop: insetsTop.top }}>
            <StatusBar
                hidden={false} // Show the status bar
                barStyle="dark-content"
                backgroundColor="#fff"
            />
            {isUserLoading ? (
                <View style={styles.activityIndicatorMain}>
                    <ActivityIndicator size="large" color={theme === 'light' ? '#000' : '#fff'} />
                </View>
            ) : (
                <>
                    {/* Error Message */}
                    {isUserError ? (
                        <View style={styles.profileErrorBoxMain}>
                            <Text style={styles.profileErrorText}>
                                {isUserError} Error Occur When Getting User Profile Data
                            </Text>
                        </View>
                    ) : null}
                    {/* Fixed Header */}
                    <View style={[styles.profileHeader, themeStyles[theme].profileHeader]}>
                        <View style={[styles.profileBlockLeftBox]}>
                            <Image
                                source={require('../../assets/images/logo-icon.png')}
                                style={styles.profileHeaderLogo}
                                resizeMode="contain"
                            />
                            <Image
                                source={require('../../assets/images/LS-3.jpg')}
                                style={styles.profileAvatar}
                            />
                        </View>
                        <View style={styles.profileBlockRightBox}>
                            <View style={styles.profileBlock}>
                                <Text style={[styles.profileMainText, themeStyles[theme].profileMainText]}>Username</Text>
                                <Text style={[styles.profileValueText, themeStyles[theme].profileValueText]}>{profileData.screenName}</Text>
                            </View>

                            <View style={styles.profileBlock}>
                                <Text style={[styles.profileMainText, themeStyles[theme].profileMainText]}>Balance</Text>
                                <Text style={[styles.profileValueText, themeStyles[theme].profileValueText]}>#{profileData?.CreditBalance}.00</Text>
                            </View>
                        </View>


                    </View>
                    {/* Scrollable Content */}
                    <ScrollView showsVerticalScrollIndicator={false} style={[styles.profileScrollContainer, themeStyles[theme].profileScrollContainer]}>

                    </ScrollView>

                    <Footer />
                </>)}
        </SafeAreaView>
    );
};
