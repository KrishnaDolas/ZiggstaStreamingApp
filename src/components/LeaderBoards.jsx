import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, ActivityIndicator, ScrollView, RefreshControl, Alert } from 'react-native';
import { styles, themeStyles } from '../../assets/styles/ThemeStyles';
import { ThemeContext } from '../context/ThemeContext';
import { getGenderFallbackImage, SendErrorTotheServer } from '../utils/constant';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Apiclient from '../utils/Apiclient';
import ProfileScreenModal from '../modals/ProfileScreenModal';

const ITEMS_PER_PAGE = 100;
const rankBg1 = require('../../assets/images/TopGifterBedge/top_gifters_leftbg1.png');
const rankBg2 = require('../../assets/images/TopGifterBedge/top_gifters_leftbg2.png');
const rankBg3 = require('../../assets/images/TopGifterBedge/top_gifters_leftbg3.png');

const rankTrophy1 = require('../../assets/images/TopGifterBedge/rank_1.png');
const rankTrophy2 = require('../../assets/images/TopGifterBedge/rank_2.png');
const rankTrophy3 = require('../../assets/images/TopGifterBedge/rank_3.png');


export const LeaderBoards = () => {
    const { theme } = useContext(ThemeContext);
    const [activeFilter, setActiveFilter] = useState('Today');
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [leaderBoardsData, setLeaderBoardsData] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [profileUserData, setProfileUserData] = useState({});
    const [visibleModal, setVisibleModal] = useState(null);

    const debounceRef = useRef(null);
    const isFirstRender = useRef(true);
    const abortControllerRef = useRef(null);


    const getLeaderBoards = useCallback(async (reset = false, triggeredByUser = false) => {
        if (loading || (!reset && !hasMore)) return;


        // Cancel any previous request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        const controller = new AbortController();
        abortControllerRef.current = controller;

        if (reset) {
            setPage(1);
            setHasMore(true);
        }

        if (triggeredByUser) setRefreshing(true); // Only set when pull-to-refresh

        setLoading(true);

        try {

            const isLive = activeFilter === 'Live';
            const postData = {
                ...(isLive ? { isLive: true } : { transDateFilter: activeFilter, isLive: false }),
                page: reset ? 1 : page,
            };
            // console.log('giftLeaderboard payload', postData);

            const response = await Apiclient.post(
                '/topGifters/giftLeaderboard',
                postData,
                { signal: controller.signal } // <-- attach signal
            );
            // console.log('response giftLeaderboard', response.data);
            if (response.status === 200) {
                const newData = response.data?.data || [];
                if (reset) {
                    setLeaderBoardsData(newData);
                } else {
                    setLeaderBoardsData(prev => [...prev, ...newData]);
                }

                setHasMore(newData.length === ITEMS_PER_PAGE);
                // if (!reset) setPage(prev => prev + 1);
            }
        } catch (error) {
            if (error.name === 'AbortError') {
                console.log('Previous request aborted');
            } else {
                console.error('Error fetching giftLeaderboard:', error);
                SendErrorTotheServer(error, 'giftLeaderboard');
            }
        } finally {
            setLoading(false);
            if (triggeredByUser) setRefreshing(false);
        }
    }, [activeFilter, hasMore, loading, page]);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            getLeaderBoards(true); // keep triggeredByUser = false
            return;
        }

        if (debounceRef.current) clearTimeout(debounceRef.current);

        debounceRef.current = setTimeout(() => {
            getLeaderBoards(true); // keep triggeredByUser = false
        }, 100);

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [activeFilter]);

    useEffect(() => {
        if (page > 1) {
            getLeaderBoards();
        }
    }, [page]);

    const joinRoom = (item) => {
        console.log('user joined', item);
    }

    const handleProfileOpen = useCallback((item) => {
        setProfileUserData(item);
        setVisibleModal('profile-screen-modal');
    }, []);

    const handleRefresh = () => {
        getLeaderBoards(true, true); // set triggeredByUser = true
    };

    const renderItem = useCallback(({ item, index }) => {
        const isTopThree = index <= 2;

        return (
            <TouchableOpacity
                style={[
                    styles.leaderboardItem,
                    themeStyles[theme].leaderboardItem,
                ]}
                activeOpacity={0.8}
                onPress={() => {
                    if (item.isLive === 1) {
                        joinRoom(item);
                    } else {
                        handleProfileOpen(item);
                    }
                }}
            >
                {isTopThree && (
                    <View style={[styles.lbRankBgContainer]}>
                        <Image
                            source={
                                index === 0
                                    ? rankBg1
                                    : index === 1
                                        ? rankBg2
                                        : rankBg3
                            }
                            style={[styles.lbRankBgImage]}
                        />
                    </View>
                )}
                {isTopThree && (
                    <View style={[styles.lbRankTrophyBgContainer]}>
                        <Image
                            source={
                                index === 0
                                    ? rankTrophy1
                                    : index === 1
                                        ? rankTrophy2
                                        : rankTrophy3
                            }
                            style={[styles.lbRankTrophyBgImage]}
                        />
                    </View>
                )}
                {/* Rank Badge */}
                <View style={[styles.lbRankBadge, themeStyles[theme].lbRankBadge]}>
                    <Text style={[
                        styles.lbRankText, themeStyles[theme].lbRankText,
                    ]}>
                        {index + 1}
                    </Text>
                    {/* {isTopThree && (
                        <View style={styles.lbSparkleContainer}>
                            <Text style={styles.lbSparkle}>✨</Text>
                        </View>
                    )} */}
                </View>

                {/* Avatar with Live Indicator */}
                <View style={[styles.lbAvatarSection, themeStyles[theme].lbAvatarSection]}>
                    <View style={[
                        styles.lbAvatarContainer,
                        isTopThree && styles.lbTopThreeAvatar
                    ]}>
                        <Image
                            source={!item?.avatar || item?.avatar === 'default'
                                ? getGenderFallbackImage(item?.gender)
                                : { uri: item?.avatar }
                            }
                            style={[styles.lbAvatar, themeStyles[theme].lbAvatar]}
                        />
                        {/* {isTopThree && (
                            <View style={[styles.lbCrownContainer]}>
                                <Text style={styles.lbCrown}>👑</Text>
                            </View>
                        )} */}
                    </View>
                    {item.isLive === 1 && (
                        <View style={styles.lbLiveIndicator}>
                            <Text style={styles.lbLiveText}>▶ LIVE</Text>
                        </View>
                    )}
                </View>

                {/* User Info */}
                <View style={[styles.lbUserInfo, themeStyles[theme].lbUserInfo]}>
                    <Text numberOfLines={1} style={[
                        styles.lbUsername,
                        themeStyles[theme].lbUsername,
                    ]}>
                        {item.screenName}
                    </Text>
                    <Text numberOfLines={1} style={[
                        styles.lbLocation,
                        themeStyles[theme].lbLocation,
                    ]}>
                        {item.location}
                    </Text>
                    <View style={[
                        styles.lbDiamondBadge,
                    ]}>
                        <Image
                            source={require('../../assets/images/icons/star.png')} // Adjust the path as needed
                            style={{ width: 10, height: 10 }}
                            resizeMode="contain"
                        />
                        <Text style={[
                            styles.lbAmountText,
                        ]}>
                            {item.amount}
                        </Text>
                    </View>
                </View>
                {/* Star Button */}
                <TouchableOpacity
                    style={[
                        styles.lbStarButton,
                        themeStyles[theme].lbStarButton,
                    ]}
                    activeOpacity={0.7}
                    onPress={() => {
                        alert('Not implemented');
                    }}
                >
                    <FontAwesome5 name="star" size={12} solid color={theme === 'light' ? 'gray' : '#fafafa'} />
                </TouchableOpacity>
            </TouchableOpacity>
        );
    }, [theme]);


    const renderFooter = () => {
        if (!loading) return null;
        return (
            <View style={{ paddingVertical: 20 }}>
                <ActivityIndicator size="small" color="#999" />
            </View>
        );
    };

    // useEffect(() => {
    //     console.log('isLive', isLive);
    // }, [isLive]);


    // useEffect(() => {
    //     console.log('selectedFilter', selectedFilter);
    // }, [selectedFilter]);


    const renderFilterButton = (title) => {
        const isActive = activeFilter === title;
        return (
            <TouchableOpacity
                key={title}
                style={[
                    styles.leaderBoardFilterButton,
                    themeStyles[theme].leaderBoardFilterButton,
                    isActive && styles.leaderBoardActiveFilter,
                    isActive && themeStyles[theme].leaderBoardActiveFilter,
                ]}
                onPress={() => {
                    if (activeFilter !== title) {
                        setActiveFilter(title);
                    }
                }}
                activeOpacity={0.8}
            >
                <Text style={[
                    styles.leaderBoardFilterText,
                    themeStyles[theme].leaderBoardFilterText,
                    isActive && styles.leaderBoardActiveFilterText,
                    isActive && themeStyles[theme].leaderBoardActiveFilterText,
                ]}>
                    {title}
                </Text>
            </TouchableOpacity>
        );
    };

    return (
        <View style={[
            styles.leaderBoardContainer,
            themeStyles[theme].leaderBoardContainer,
        ]}>
            {/* Header with Gradient Background */}
            <View style={[styles.leaderBoardHeader, themeStyles[theme].leaderBoardHeader]}>
                <View style={[styles.leaderBoardFilterContainer, themeStyles[theme].leaderBoardFilterContainer]}>
                    {['Today', 'Last Week', 'All Time', 'Live'].map(renderFilterButton)}
                </View>
            </View>

            {loading && leaderBoardsData.length === 0 ? (
                <View style={{ flex: 1, justifyContent: 'start', alignItems: 'center', paddingVertical: 40 }}>
                    <ActivityIndicator size="large" color="#d93a63" />
                </View>
            ) : (
                <>
                    {leaderBoardsData.length === 0 ? (
                        <ScrollView
                            contentContainerStyle={{ alignItems: 'center', paddingTop: 50 }}
                            refreshControl={
                                <RefreshControl
                                    refreshing={refreshing}
                                    onRefresh={handleRefresh}
                                    colors={['#d93a63']}
                                    tintColor="#d93a63"
                                />
                            }
                        >
                            <Image
                                source={require('../../assets/images/friends-no-data-found.png')}
                                style={{ width: 120, height: 120, marginBottom: 10 }}
                                resizeMode="contain"
                            />
                            <Text style={{
                                fontSize: 16,
                                color: theme === 'dark' ? '#ccc' : '#666',
                                textAlign: 'center',
                            }}>
                                No leaderboard data available.
                            </Text>
                        </ScrollView>
                    ) : (
                        <FlatList
                            data={leaderBoardsData}
                            keyExtractor={(item, index) => `${item.roomID}-${index}`}
                            renderItem={renderItem}
                            contentContainerStyle={styles.leaderBoardListContainer}
                            initialNumToRender={10}
                            showsVerticalScrollIndicator={false}
                            ListFooterComponent={renderFooter}
                            onEndReachedThreshold={0.3}
                            onEndReached={() => {
                                if (!loading && hasMore && leaderBoardsData.length >= page * ITEMS_PER_PAGE) {
                                    setPage(prev => prev + 1);
                                }
                            }}
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                        />
                    )}

                </>
            )}
            {visibleModal === 'profile-screen-modal' && (
                <ProfileScreenModal visible="true" onClose={() => setVisibleModal(null)} profileData={profileUserData} />
            )}
        </View>
    );
}
