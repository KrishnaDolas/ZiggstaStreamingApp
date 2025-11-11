import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, StatusBar, Dimensions, AppState } from 'react-native';
import { styles, themeStyles } from '../../assets/styles/ThemeStyles';
import { ThemeContext } from '../context/ThemeContext';
import { ActivityIndicator } from 'react-native';
import Apiclient from '../utils/Apiclient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAppContext } from '../context/AppContext';
import { useFocusEffect } from '@react-navigation/native';
import { getGenderFallbackImage, SendErrorTotheServer } from '../utils/constant';
import LinearGradient from 'react-native-linear-gradient';
import themeColors from '../../assets/styles/Colors';
const screenWidth = Dimensions.get('window').width;
const cardWidth = screenWidth / 2 - 25; // 3 columns with margin

const screenHeight = Dimensions.get('window').height;
export const StatisticsSettingScreen = ({ userData, onLogout, address }) => {
    const { theme } = useContext(ThemeContext);
    const { profileData } = useAppContext();
    const insets = useSafeAreaInsets();
    const [visibleModal, setVisibleModal] = useState(null);
    const [averageIncomeData, setAverageIncomeData] = useState({});
    const [isUserError, setIsUserError] = useState(null);
    const [topGiftersData, setTopGiftersData] = useState([]);
    const [totalDailyTime, setTotalDailyTime] = useState({});
    const [isAvgLoading, setIsAvgLoading] = useState(false);
    const [isTotalTimeLoading, setIsTotalTimeLoading] = useState(false);
    const [liveOnlineTime, setLiveOnlineTime] = useState('');
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [avgStreamRevenue, setAvgStreamRevenue] = useState(0);
    const [averageStreamViews, setAverageStreamViews] = useState(0);
    const [averageStreamTime, setAverageStreamTime] = useState('0:00:00');
    const [averageViewerTime, setAverageViewerTime] = useState('0');
    const [averageMultiView, setAverageMultiView] = useState(0);
    const [avgFavouritesCount, setAvgFavouritesCount] = useState('0');

    const timerRef = useRef(null);
    const startTimeRef = useRef(0);
    const startTimestampRef = useRef(Date.now());
    const lastTimerSecondsRef = useRef(null);
    const appStateRef = useRef(AppState.currentState);


    const parseTimeStringToSeconds = (timeStr) => {
        const dayMatch = timeStr.match(/(\d+)d/);
        const timeMatch = timeStr.match(/(\d{1,2}):(\d{2}):(\d{2})/);
        const days = dayMatch ? parseInt(dayMatch[1], 10) : 0;
        const hours = timeMatch ? parseInt(timeMatch[1], 10) : 0;
        const minutes = timeMatch ? parseInt(timeMatch[2], 10) : 0;
        const seconds = timeMatch ? parseInt(timeMatch[3], 10) : 0;
        return days * 86400 + hours * 3600 + minutes * 60 + seconds;
    };

    const formatSecondsToTime = (totalSeconds) => {
        const days = Math.floor(totalSeconds / 86400);
        const hours = Math.floor((totalSeconds % 86400) / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return `${days}d, ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

    const startLiveTimer = (initialSeconds) => {
        if (timerRef.current) clearInterval(timerRef.current);
        startTimeRef.current = initialSeconds;
        startTimestampRef.current = Date.now();
        lastTimerSecondsRef.current = initialSeconds; // Store the initial seconds
        timerRef.current = setInterval(() => {
            const elapsed = Math.floor((Date.now() - startTimestampRef.current) / 1000);
            const updatedTime = startTimeRef.current + elapsed;
            setLiveOnlineTime(formatSecondsToTime(updatedTime));
            lastTimerSecondsRef.current = updatedTime; // Update the last timer value
        }, 1000);
    };

    // Handle app state changes (foreground/background)
    useEffect(() => {
        const handleAppStateChange = (nextAppState) => {
            if (appStateRef.current.match(/inactive|background/) && nextAppState === 'active') {
                // App is coming to foreground, resume timer
                if (lastTimerSecondsRef.current) {
                    const elapsed = Math.floor((Date.now() - startTimestampRef.current) / 1000);
                    const updatedTime = startTimeRef.current + elapsed;
                    startLiveTimer(updatedTime);
                }
            }
            appStateRef.current = nextAppState;
        };

        const subscription = AppState.addEventListener('change', handleAppStateChange);

        return () => {
            subscription.remove();
        };
    }, []);


    // get user avg.total time from API
    const getUserOnlineTime = useCallback(async () => {
        if (lastTimerSecondsRef.current && lastTimerSecondsRef.current > 0 && !isInitialLoad) {
            startLiveTimer(lastTimerSecondsRef.current);
            return;
        }

        setIsTotalTimeLoading(true);
        setIsUserError('');
        try {
            const response = await Apiclient.get(`/getUserDetails/getUserOnlineTime?userid=${userData?.userid}&type=total`);
            // console.log('response user online time data', response.data);
            if (response.status === 200) {
                const timeStr = response.data?.TotalOnlineTime;
                setTotalDailyTime({ TotalOnlineTime: timeStr });
                const apiSeconds = parseTimeStringToSeconds(timeStr);
                // Compare API time with last timer value
                const initialSeconds = lastTimerSecondsRef.current && lastTimerSecondsRef.current > apiSeconds
                    ? lastTimerSecondsRef.current
                    : apiSeconds;
                startLiveTimer(initialSeconds); // Start real-time timer with the greater value
            } else {
                setIsUserError('Failed to get user online time');
            }
        } catch (err) {
            setIsUserError('Failed to get user online time: ' + err.message);
        } finally {
            setIsTotalTimeLoading(false);
            setIsInitialLoad(false); // Mark initial load as complete
        }
    }, [userData?.userid, isInitialLoad]);

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


    useFocusEffect(
        useCallback(() => {
            getAverageDaily();
        }, [getAverageDaily])
    );

    // to get top gifters

    const getTopGifters = useCallback(async () => {
        const formData = {
            toUserId: userData.userid,
            gifterCount: 10,
        };
        setIsUserError('');
        try {
            const response = await Apiclient.post('/topgifters', formData);
            if (response) {
                setTopGiftersData(response.data || []);
            } else {
                setIsUserError('Failed to fetch top gifters data');
            }
        } catch (err) {
            setIsUserError('Error fetching top gifters data: ' + err.message);
        }
    }, [userData.userid]);

    useFocusEffect(
        useCallback(() => {
            getTopGifters();
        }, [getTopGifters])
    );

    useFocusEffect(
        useCallback(() => {
            // Only fetch API data if initial load or no valid timer
            if (isInitialLoad || !lastTimerSecondsRef.current) {
                getUserOnlineTime();
            } else {
                // Resume timer without stopping
                startLiveTimer(lastTimerSecondsRef.current);
            }
            // Do not stop the timer on unfocus
            return () => { };
        }, [getUserOnlineTime, isInitialLoad])
    );


    // avg stream revenue

    const getAvgStreamRevenue = useCallback(async () => {
        const formData = {
            userid: userData.userid,
        };
        try {
            const response = await Apiclient.post('/profile/avgStreamRevenue', formData);
            if (response.data.success) {
                setAvgStreamRevenue(response.data.avgRevenue);
            } else {
                setAvgStreamRevenue(0);
            }
        } catch (err) {
            SendErrorTotheServer(err, 'getAvgStreamRevenue');
        }
    }, [userData.userid]);

    useEffect(() => {
        getAvgStreamRevenue();
    }, [getAvgStreamRevenue]);

    // avg stream views

    const getAverageStreamViews = useCallback(async () => {
        const formData = {
            user_id: userData.userid,
        };
        try {
            const response = await Apiclient.post('/profile/averageStreamViews', formData);
            if (response.data.success) {
                setAverageStreamViews(response.data.averageViews);
            } else {
                setAverageStreamViews(0);
            }
        } catch (err) {
            SendErrorTotheServer(err, 'getAverageStreamViews');
        }
    }, [userData.userid]);

    useEffect(() => {
        getAverageStreamViews();
    }, [getAverageStreamViews]);


    // avg stream time

    const getAverageStreamTime = useCallback(async () => {
        const formData = {
            hostID: userData.userid,
        };
        try {
            const response = await Apiclient.post('/profile/averageStreamTime', formData);
            if (response.data.success) {
                setAverageStreamTime(response.data.averageStreamTime);
            } else {
                setAverageStreamTime('0:00:00');
            }
        } catch (err) {
            SendErrorTotheServer(err, 'getAverageStreamTime');
        }
    }, [userData.userid]);

    useEffect(() => {
        getAverageStreamTime();
    }, [getAverageStreamTime]);


    // avg viewer time

    const getAverageViewerTime = useCallback(async () => {
        const formData = {
            hostID: userData.userid,
        };
        try {
            const response = await Apiclient.post('/profile/averageViewerTime', formData);
            if (response.data.success) {
                setAverageViewerTime(response.data.averageViewerTime);
            } else {
                setAverageViewerTime('0:00:00');
            }
        } catch (err) {
            SendErrorTotheServer(err, 'getAverageViewerTime');
        }
    }, [userData.userid]);

    useEffect(() => {
        getAverageViewerTime();
    }, [getAverageViewerTime]);


    // avg multi view

    const getAverageMultiView = useCallback(async () => {
        const formData = {
            hostID: userData.userid,
        };
        try {
            const response = await Apiclient.post('/profile/avgmultiViews', formData);
            if (response.data.success) {
                setAverageMultiView(response.data.count);
            } else {
                setAverageMultiView(0);
            }
        } catch (err) {
            SendErrorTotheServer(err, 'getAverageMultiView');
        }
    }, [userData.userid]);

    useEffect(() => {
        getAverageMultiView();
    }, [getAverageMultiView]);


    // avg Favourites Gained

    const getAverageFavouritesGained = useCallback(async () => {
        const formData = {
            hostID: userData.userid,
        };
        try {
            const response = await Apiclient.post('/profile/avgFavouritesGained', formData);
            if (response.data.success) {
                setAvgFavouritesCount(response.data.avgFavouritesCount);
            } else {
                setAvgFavouritesCount('0.0');
            }
        } catch (err) {
            SendErrorTotheServer(err, 'getAverageMultiView');
        }
    }, [userData.userid]);

    useEffect(() => {
        getAverageFavouritesGained();
    }, [getAverageFavouritesGained]);

    return (
        <View style={[styles.SafeAreaView, themeStyles[theme].SafeAreaView, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
            <LinearGradient
                style={[styles.messageListGradientBox]}
                colors={theme === 'dark' ? [themeColors.blackBgColor, themeColors.blackBgColor] : [themeColors.headerGradientTop, themeColors.headerGradientBottom]}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}>
                <StatusBar
                    barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
                    backgroundColor={theme === 'dark' ? '#121212' : '#ffffff'}
                    translucent={false}
                />
                <>
                    {/* Fixed Header */}
                    <View style={[styles.profileHeader, themeStyles[theme].profileHeader]}>
                        <View style={[styles.profileBlockLeftBox]}>
                            <Image
                                source={require('../../assets/images/logo-icon.png')}
                                style={styles.profileHeaderLogo}
                                resizeMode="contain"
                            />
                            <Image
                                source={!profileData?.avatar || profileData?.avatar === 'default'
                                    ? getGenderFallbackImage(profileData?.gender)
                                    : { uri: profileData?.avatar }
                                }
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
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Image
                                        source={require('../../assets/images/icons/icon_z.png')} // Adjust the path as needed
                                        style={{ width: 20, height: 20, marginRight: 5 }}
                                        resizeMode="contain"
                                    />
                                    <Text style={[styles.profileValueText, themeStyles[theme].profileValueText]}>
                                        {Number(profileData?.CreditBalance).toFixed(0)}
                                    </Text>
                                </View>

                            </View>
                        </View>


                    </View>
                    {/* Scrollable Content */}
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        style={[
                            styles.profileScrollContainer,
                            themeStyles[theme].profileScrollContainer,
                        ]}>
                        {/* Stat Cards */}
                        <View style={styles.profileStatCards}>
                            <View style={[styles.profileStatCard, themeStyles[theme].profileStatCard]}>
                                <Text style={[styles.profileStatLabel, themeStyles[theme].profileStatLabel]}>Avg. Daily Revenue</Text>
                                {isAvgLoading ? (
                                    <ActivityIndicator size="small" />
                                ) : (
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Image
                                            source={require('../../assets/images/icons/icon_z.png')} // Adjust the path as needed
                                            style={{ width: 20, height: 20, marginRight: 5 }}
                                            resizeMode="contain"
                                        />
                                        <Text style={[styles.profileStatValue, themeStyles[theme].profileStatValue]}>{averageIncomeData?.averageIncome}</Text>
                                    </View>
                                )}
                            </View>
                            <View style={{ width: 5 }} />
                            <View style={[styles.profileStatCard, themeStyles[theme].profileStatCard]}>
                                <Text style={[styles.profileStatLabel, themeStyles[theme].profileStatLabel]}>Avg. Daily Time</Text>
                                {isTotalTimeLoading ? (
                                    <ActivityIndicator size="small" />
                                ) : (
                                    <Text style={[styles.profileStatValue, themeStyles[theme].profileStatValue]}> {liveOnlineTime || totalDailyTime?.TotalOnlineTime}</Text>
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
                                        <View key={index} style={[styles.profileTableRow, themeStyles[theme].profileTableRow]}>
                                            <Text style={[styles.profileTableCell, styles.profileTableCellIndex, themeStyles[theme].profileTableCell]}>{index + 1}</Text>
                                            <Text style={[styles.profileTableCell, styles.profileTableCellUsername, themeStyles[theme].profileTableCell]}>{item.screenName}</Text>
                                            <Text style={[styles.profileTableCell, styles.profileTableCellAmount, themeStyles[theme].profileTableCell]}>{item.Amount}</Text>
                                        </View>
                                    );
                                })}
                            </ScrollView>
                        </View>
                        {/* Action Buttons */}
                        {/* <View style={styles.profileButtonGrid}>
                            <TouchableOpacity
                                onPress={() => {
                                    setModalVisibleStage('bank-details');
                                    setModalStage('first');
                                    setModalLabelName(null);
                                }}
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
                                onPress={() => {
                                    setModalVisibleStage('setting');
                                    setModalStage('first');
                                    setModalLabelName(null);
                                }}
                                style={[styles.profileActionBtnBox, themeStyles[theme].profileActionBtnBox]}
                            >
                                <Icon name="settings-outline" size={27} color="#9C27B0" style={styles.actionButtonIcon} />
                                <Text style={[styles.profileActionButtonText, themeStyles[theme].profileActionButtonText]}>Settings</Text>
                            </TouchableOpacity>
                        </View> */}

                        {/* Streaming stats */}
                        <Text
                            style={[
                                styles.streamListMainTitle,
                                themeStyles[theme].streamListMainTitle,
                                { fontWeight: '400', paddingHorizontal: 0, }
                            ]}
                        >
                            Streaming Stats
                        </Text>
                        <View style={styles.wDReferralStatsContainer}>
                            <View style={styles.wDReferralStatsRow}>
                                {/* avg stream revenue */}
                                <View style={[styles.wdRefStateCard, themeStyles[theme].wdRefStateCard, { width: cardWidth }]}>
                                    <Text style={[styles.wdRefStateTitle, themeStyles[theme].wdRefStateTitle]}>Avg Stream Revenue</Text>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Image
                                            source={require('../../assets/images/icons/icon_z.png')}
                                            style={{ width: 15, height: 15, marginRight: 5, marginTop: 3 }}
                                            resizeMode="contain"
                                        />
                                        <Text style={[styles.wdRefStateValue, { marginTop: 0 }, themeStyles[theme].wdRefStateValue]}>{Number(avgStreamRevenue).toFixed(2)}</Text>
                                    </View>
                                </View>
                                {/* avg stream views */}
                                <View style={[styles.wdRefStateCard, themeStyles[theme].wdRefStateCard, { width: cardWidth }]}>
                                    <Text style={[styles.wdRefStateTitle, themeStyles[theme].wdRefStateTitle]}>Avg Stream Views</Text>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Ionicons name="eye" size={18} color={theme === 'light' ? '#333' : '#fff'} />
                                        <Text style={[styles.wdRefStateValue, { marginTop: 0, marginLeft: 5 }, themeStyles[theme].wdRefStateValue]}>{Number(averageStreamViews).toFixed(0)}</Text>
                                    </View>
                                </View>
                            </View>
                            <View style={styles.wDReferralStatsRow}>
                                {/* avg stream time */}
                                <View style={[styles.wdRefStateCard, themeStyles[theme].wdRefStateCard, { width: cardWidth }]}>
                                    <Text style={[styles.wdRefStateTitle, themeStyles[theme].wdRefStateTitle]}>Avg Stream Time</Text>
                                    <Text style={[styles.wdRefStateValue, themeStyles[theme].wdRefStateValue]}>{averageStreamTime}</Text>
                                </View>
                                {/* avg viewer time */}
                                <View style={[styles.wdRefStateCard, themeStyles[theme].wdRefStateCard, { width: cardWidth }]}>
                                    <Text style={[styles.wdRefStateTitle, themeStyles[theme].wdRefStateTitle]}>Avg Viewer Time</Text>
                                    <Text style={[styles.wdRefStateValue, themeStyles[theme].wdRefStateValue]}>{averageViewerTime}</Text>
                                </View>
                            </View>
                            <View style={styles.wDReferralStatsRow}>
                                {/* avg favs gained */}
                                <View style={[styles.wdRefStateCard, themeStyles[theme].wdRefStateCard, { width: cardWidth }]}>
                                    <Text style={[styles.wdRefStateTitle, themeStyles[theme].wdRefStateTitle]}>Avg Favs Gained</Text>
                                    <Text style={[styles.wdRefStateValue, themeStyles[theme].wdRefStateValue]}>{Number(avgFavouritesCount).toFixed(2)}</Text>
                                </View>
                                {/* avg multi views */}
                                <TouchableOpacity style={[styles.wdRefStateCard, themeStyles[theme].wdRefStateCard, { width: cardWidth }]}>
                                    <Text style={[styles.wdRefStateTitle, themeStyles[theme].wdRefStateTitle]}>Avg Multi Views</Text>
                                    <Text style={[styles.wdRefStateValue, themeStyles[theme].wdRefStateValue]}>{averageMultiView}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Referral stats */}
                        <Text
                            style={[
                                styles.streamListMainTitle,
                                themeStyles[theme].streamListMainTitle,
                                { fontWeight: '400', paddingHorizontal: 0, paddingTop: 0 }
                            ]}
                        >
                            Referral Stats
                        </Text>
                        <View style={[styles.wDReferralStatsContainer, { paddingBottom: 100 }]}>
                            <View style={styles.wDReferralStatsRow}>
                                {/* today's signup */}
                                <View style={[styles.wdRefStateCard, themeStyles[theme].wdRefStateCard, { width: cardWidth }]}>
                                    <Text style={[styles.wdRefStateTitle, themeStyles[theme].wdRefStateTitle]}>Today's Signup's</Text>
                                    <Text style={[styles.wdRefStateValue, themeStyles[theme].wdRefStateValue]}>20</Text>
                                </View>
                                {/* Today Earning's */}
                                <View style={[styles.wdRefStateCard, themeStyles[theme].wdRefStateCard, { width: cardWidth }]}>
                                    <Text style={[styles.wdRefStateTitle, themeStyles[theme].wdRefStateTitle]}>Today Earning's</Text>
                                    {/* <Text style={[styles.wdRefStateValue, themeStyles[theme].wdRefStateValue]}>$ 180</Text> */}
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        {/* <Image
                                            source={require('../../assets/images/icons/icon_z.png')} // Adjust the path as needed
                                            style={{ width: 15, height: 15, marginRight: 5, marginTop: 3 }}
                                            resizeMode="contain"
                                        /> */}
                                        <Text style={[styles.wdRefStateValue, { marginTop: 0 }, themeStyles[theme].wdRefStateValue]} >
                                            AU$ {Number(profileData?.CreditBalance).toFixed(0)}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                            <View style={styles.wDReferralStatsRow}>
                                {/* monthly signup */}
                                <View style={[styles.wdRefStateCard, themeStyles[theme].wdRefStateCard, { width: cardWidth }]}>
                                    <Text style={[styles.wdRefStateTitle, themeStyles[theme].wdRefStateTitle]}>Monthly Signup's</Text>
                                    <Text style={[styles.wdRefStateValue, themeStyles[theme].wdRefStateValue]}>180</Text>
                                </View>
                                {/* monthly Earning's */}
                                <View style={[styles.wdRefStateCard, themeStyles[theme].wdRefStateCard, { width: cardWidth }]}>
                                    <Text style={[styles.wdRefStateTitle, themeStyles[theme].wdRefStateTitle]}>Monthly Earning's</Text>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        {/* <Image
                                            source={require('../../assets/images/icons/icon_z.png')} // Adjust the path as needed
                                            style={{ width: 15, height: 15, marginRight: 5, marginTop: 3 }}
                                            resizeMode="contain"
                                        /> */}
                                        <Text style={[styles.wdRefStateValue, { marginTop: 0 }, themeStyles[theme].wdRefStateValue]}>
                                            AU$ {Number(profileData?.CreditBalance).toFixed(0)}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                            <View style={styles.wDReferralStatsRow}>
                                {/* total signup */}
                                <View style={[styles.wdRefStateCard, themeStyles[theme].wdRefStateCard, { width: cardWidth }]}>
                                    <Text style={[styles.wdRefStateTitle, themeStyles[theme].wdRefStateTitle]}>Total Signup</Text>
                                    <Text style={[styles.wdRefStateValue, themeStyles[theme].wdRefStateValue]}>400</Text>
                                </View>
                                {/* total earnings */}
                                <TouchableOpacity onPress={() => setVisibleModal('setting')} style={[styles.wdRefStateCard, themeStyles[theme].wdRefStateCard, { width: cardWidth }]}>
                                    <Text style={[styles.wdRefStateTitle, themeStyles[theme].wdRefStateTitle]}>Total Earnings</Text>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        {/* <Image
                                            source={require('../../assets/images/icons/icon_z.png')} // Adjust the path as needed
                                            style={{ width: 15, height: 15, marginRight: 5, marginTop: 3 }}
                                            resizeMode="contain"
                                        /> */}
                                        <Text style={[styles.wdRefStateValue, { marginTop: 0 }, themeStyles[theme].wdRefStateValue]}>
                                            AU$ {Number(profileData?.CreditBalance).toFixed(0)}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>
                </>
            </LinearGradient>
        </View>
    );
};
