import React, { useCallback, useContext, useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, Dimensions } from 'react-native';
import { styles, themeStyles } from '../../assets/styles/ThemeStyles';
import { ThemeContext } from '../context/ThemeContext';
import { ActivityIndicator } from 'react-native';
import Footer from '../components/Footer';
import ProfileSocialsModal from '../components/ProfileSocialsModal';
import ProfileSettingModal from '../components/ProfileSettingModal';
import ShopManagerDetailsModal from '../components/ShopManagerDetailsModal';
import Apiclient from '../utils/Apiclient';
import { CenterModal } from '../components/CenterModal';
import HalfScreenModal from '../components/HalfScreenModal';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BankDetailsModal from '../modals/BankDetailsModal';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAppContext } from '../context/AppContext';
const screenHeight = Dimensions.get('window').height;
export const StatisticsSettingScreen = ({ userData, onLogout, address }) => {
    const { theme } = useContext(ThemeContext);
    const { profileData } = useAppContext();
    const insetsTop = useSafeAreaInsets();
    const [visibleModal, setVisibleModal] = useState(null);
    const [averageIncomeData, setAverageIncomeData] = useState({});
    const [isUserError, setIsUserError] = useState(null);
    const [topGiftersData, setTopGiftersData] = useState([]);
    const [totalDailyTime, setTotalDailyTime] = useState({});
    const [isAvgLoading, setIsAvgLoading] = useState(false);
    const [isTotalTimeLoading, setIsTotalTimeLoading] = useState(false);


    // get user avg.total time from API
    const getUserOnlineTime = useCallback(async () => {
        setIsTotalTimeLoading(true);
        setIsUserError('');
        try {
            const response = await Apiclient.get(`/getUserDetails/getUserOnlineTime?userid=${userData?.userid}&type=total`);
            if (response.status === 200) {
                setTotalDailyTime(response.data || {});
            } else {
                setIsUserError('Failed to get user online time');
            }
        } catch (err) {
            setIsUserError('Failed to get user online time: ' + err.message);
        } finally {
            setIsTotalTimeLoading(false);
        }
    }, [userData?.userid]);

    useEffect(() => {
        getUserOnlineTime();
    }, [getUserOnlineTime]);


    // to get average daily income of user
    const getAverageDaily = useCallback(async () => {
        setIsUserError('');
        setIsAvgLoading(true);
        try {
            const response = await Apiclient.get(`/getUserDetails/averageIncome?userId=${userData.userid}`);
            if (response.status === 200) {
                setAverageIncomeData(response.data || {});
            } else {
                setIsUserError('Failed to fetch average Income data');
            }
        } catch (err) {
            setIsUserError('Error fetching average Income data: ' + err.message);
        } finally {
            setIsAvgLoading(false);
        }
    }, [userData.userid]);

    useEffect(() => {
        getAverageDaily();
    }, [getAverageDaily]);

    // to get top gifters

    const getTopGifters = useCallback(async () => {
        const formData = {
            toUserId: userData.userid,
            gifterCount: 25,
        };
        setIsUserError('');
        try {
            const response = await Apiclient.post('/topgifters', formData);
            // console.log('topgifters response', response.data);
            if (response) {
                setTopGiftersData(response.data || []);
            } else {
                setIsUserError('Failed to fetch top gifters data');
            }
        } catch (err) {
            setIsUserError('Error fetching top gifters data: ' + err.message);
        }
    }, [userData.userid]);

    useEffect(() => {
        getTopGifters();
    }, [getTopGifters]);

    return (
        <SafeAreaView style={{ flex: 1, position: 'relative', paddingBottom: 80, paddingTop: insetsTop.top }}>
            <StatusBar
                hidden={false} // Show the status bar
                barStyle="dark-content"
                backgroundColor="#fff"
            />
            <>
                {/* Error Message */}
                {/* {isUserError ? (
                    <View style={[styles.profileErrorBoxMain, themeStyles[theme].profileErrorBoxMain]}>
                        <Text style={styles.profileErrorText}>
                            {isUserError}
                        </Text>
                    </View>
                ) : null} */}
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
                            {profileData?.screenName ? (
                                <Text style={[styles.profileValueText, themeStyles[theme].profileValueText]}>
                                    {profileData.screenName}
                                </Text>
                            ) : (
                                <ActivityIndicator size="small" />
                            )}
                        </View>

                        <View style={styles.profileBlock}>
                            <Text style={[styles.profileMainText, themeStyles[theme].profileMainText]}>Balance</Text>
                            <Text style={[styles.profileValueText, themeStyles[theme].profileValueText]}>${profileData?.CreditBalance}</Text>
                        </View>
                    </View>


                </View>
                {/* Scrollable Content */}
                <ScrollView showsVerticalScrollIndicator={false} style={[styles.profileScrollContainer, themeStyles[theme].profileScrollContainer]}>
                    {/* Stat Cards */}
                    <View style={styles.profileStatCards}>
                        <View style={[styles.profileStatCard, themeStyles[theme].profileStatCard]}>
                            <Text style={[styles.profileStatLabel, themeStyles[theme].profileStatLabel]}>Avg. Daily Revenue</Text>
                            {isAvgLoading ? (
                                <ActivityIndicator size="small" />
                            ) : (
                                <Text style={[styles.profileStatValue, themeStyles[theme].profileStatValue]}>${averageIncomeData?.averageIncome}</Text>
                            )}
                        </View>
                        <View style={{ width: 5 }} />
                        <View style={[styles.profileStatCard, themeStyles[theme].profileStatCard]}>
                            <Text style={[styles.profileStatLabel, themeStyles[theme].profileStatLabel]}>Avg. Daily Time</Text>
                            {isTotalTimeLoading ? (
                                <ActivityIndicator size="small" />
                            ) : (
                                <Text style={[styles.profileStatValue, themeStyles[theme].profileStatValue]}>{totalDailyTime?.TotalOnlineTime}</Text>
                            )}
                        </View>
                    </View>
                    {/* History Table */}
                    <View style={[styles.profileTable, themeStyles[theme].profileTable]}>
                        <View style={[styles.profileTableHeader, themeStyles[theme].profileTableHeader]}>
                            <Text style={[styles.profileTableHeaderText, styles.profileTableCellIndex, themeStyles[theme].profileTableHeaderText]}>#</Text>
                            <Text style={[styles.profileTableHeaderText, styles.profileTableCellUsername, themeStyles[theme].profileTableHeaderText]}>Username</Text>
                            <Text style={[styles.profileTableHeaderText, styles.profileTableCellAmount, themeStyles[theme].profileTableHeaderText]}>Amount</Text>
                        </View>
                        <ScrollView nestedScrollEnabled={true} contentContainerStyle={{ paddingBottom: 8 }} style={{ height: screenHeight * 0.2 + 30 }}>
                            {topGiftersData.length === 0 ? <>
                                <>
                                    <View style={{ height: screenHeight * 0.2, justifyContent: 'center', alignItems: 'center' }}>
                                        <Text style={{ color: theme === 'light' ? '#777' : '#ccc', fontSize: 16, fontWeight: '500' }}>
                                            No data found
                                        </Text>
                                    </View>
                                </>
                            </> : topGiftersData.map((item, index) => {
                                return (
                                    <View key={index} style={styles.profileTableRow}>
                                        <Text style={[styles.profileTableCell, styles.profileTableCellIndex, themeStyles[theme].profileTableCell]}>{index + 1}</Text>
                                        <Text style={[styles.profileTableCell, styles.profileTableCellUsername, themeStyles[theme].profileTableCell]}>{item.ScreenName}</Text>
                                        <Text style={[styles.profileTableCell, styles.profileTableCellAmount, themeStyles[theme].profileTableCell]}>{item.Amount}</Text>
                                    </View>
                                );
                            })}
                        </ScrollView>
                    </View>
                    {/* Action Buttons */}
                    <View style={styles.profileButtonGrid}>
                        <TouchableOpacity
                            onPress={() => setVisibleModal('bank-details')}
                            style={[styles.profileActionBtnBox, themeStyles[theme].profileActionBtnBox]}
                        >
                            <Icon name="card-outline" size={26} color="#4CAF50" style={styles.actionButtonIcon} />
                            <Text style={[styles.profileActionButtonText, themeStyles[theme].profileActionButtonText]}>Banking Details</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setVisibleModal('shop-manager')}
                            style={[styles.profileActionBtnBox, themeStyles[theme].profileActionBtnBox]}
                        >
                            <Icon name="storefront-outline" size={24} color="#FF9800" style={styles.actionButtonIcon} />
                            <Text style={[styles.profileActionButtonText, themeStyles[theme].profileActionButtonText]}>Shop Manager</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setVisibleModal('social')}
                            style={[styles.profileActionBtnBox, themeStyles[theme].profileActionBtnBox]}
                        >
                            <Icon name="people-outline" size={28} color="#2196F3" style={styles.actionButtonIcon} />
                            <Text style={[styles.profileActionButtonText, themeStyles[theme].profileActionButtonText]}>Socials</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setVisibleModal('setting')}
                            style={[styles.profileActionBtnBox, themeStyles[theme].profileActionBtnBox]}
                        >
                            <Icon name="settings-outline" size={27} color="#9C27B0" style={styles.actionButtonIcon} />
                            <Text style={[styles.profileActionButtonText, themeStyles[theme].profileActionButtonText]}>Settings</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
                {/* Modals */}
                {/* full screen modal */}
                {visibleModal === 'bank-details' && (
                    <BankDetailsModal visible="true" onClose={() => setVisibleModal(null)} userData={userData} />
                )}
                {visibleModal === 'shop-manager' && (
                    <ShopManagerDetailsModal visible="true" onClose={() => setVisibleModal(null)} />
                )}
                {visibleModal === 'social' && (
                    <ProfileSocialsModal visible="true" onClose={() => setVisibleModal(null)} userData={userData} />
                )}
                {visibleModal === 'setting' && (
                    <ProfileSettingModal visible="true" onClose={() => setVisibleModal(null)} onLogout={onLogout} userData={userData} address={address} />
                )}

                {/* center modal */}
                {visibleModal === 'center-modal' && (
                    <CenterModal visible="true" onClose={() => setVisibleModal(null)} />
                )}
                {/* full screen modal */}
                {visibleModal === 'half-screen-modal' && (
                    <HalfScreenModal visible="true" onClose={() => setVisibleModal(null)} />
                )}
                <Footer />
            </>
        </SafeAreaView>
    );
};
