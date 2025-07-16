/* eslint-disable react-native/no-inline-styles */
import React, { useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { View, TouchableOpacity, Text, Animated, Image, Linking } from 'react-native';
import Modal from 'react-native-modal';
import { styles, themeStyles } from '../../assets/styles/ThemeStyles';
import { Dimensions, ScrollView } from 'react-native';
import { PanResponder } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Apiclient from '../utils/Apiclient';
import ShimmerPlaceHolder from 'react-native-shimmer-placeholder';
import { SendErrorTotheServer } from '../utils/constant';
import MessageModal from './MessageModal';
import { ThemeContext } from '../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import ReportUserModal from './ReportUserModal';
// top gifters
// const topGifters = [
//     {
//         id: 1,
//         name: 'Name 1',
//         amount: '$2,500',
//         image: require('../../assets/images/LS-12.jpg'), // Replace with actual image
//         isTop: true,
//     },
//     {
//         id: 2,
//         name: 'Name 2',
//         amount: '$1,200',
//         image: require('../../assets/images/LS-8.jpg'), // Replace with actual image
//         isTop: false,
//     },
//     {
//         id: 3,
//         name: 'Name 3',
//         amount: '$950',
//         image: require('../../assets/images/LS-9.jpg'), // Replace with actual image
//         isTop: false,
//     },
// ];

const ProfileScreenModal = ({ visible, onClose, profileData, isMainProfile }) => {
    const { theme } = useContext(ThemeContext);
    const navigation = useNavigation();
    const screenHeight = Dimensions.get('window').height;
    const [layoutReady, setLayoutReady] = useState(false);
    const [isUserLoading, setIsUserLoading] = useState(false);
    const [isUserError, setIsUserError] = useState(null);
    const [userProfileDatails, setUserProfileDetails] = useState({});
    const [socialLinks, setSocialLinks] = useState({});
    const [socialError, setSocialError] = useState('');
    const [showWarning, setShowWarning] = useState(false);
    const [topGiftersData, setTopGiftersData] = useState([]);
    const [followersCountData, setFollowersCountData] = useState({});
    const [userStreamRoomCount, setUserStreamRoomCount] = useState({});
    const [visibleModal, setVisibleModal] = useState(null);
    const [message, setMessage] = useState(null);
    const [reportClicked, setReportClicked] = useState(false);

    const panY = useRef(new Animated.Value(0)).current;
    const profileUserId = profileData?.userid ?? profileData?.RequesterID ?? null;

    // Cleanup modals on unmount
    useEffect(() => {
        return () => {
            setVisibleModal(null); // Close all modals
        };
    }, []);

    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: (_, gestureState) => {
                return Math.abs(gestureState.dy) > 5;
            },
            onPanResponderMove: Animated.event(
                [null, { dy: panY }],
                { useNativeDriver: false }
            ),
            onPanResponderRelease: (_, gesture) => {
                if (gesture.dy > 120) {
                    onClose(); // dismiss if dragged down enough
                } else {
                    Animated.spring(panY, {
                        toValue: 0,
                        useNativeDriver: false,
                    }).start();
                }
            },
        })
    ).current;

    //  check if layout is ready
    useLayoutEffect(() => {
        if (visible) {
            setLayoutReady(true);
        } else {
            setLayoutReady(false);
        }
    }, [visible]);

    // get profile details from API
    useEffect(() => {
        const fetchProfileDetails = async () => {
            setIsUserLoading(true);
            setIsUserError('');
            try {
                const formData = {
                    userid: profileUserId,
                };
                const response = await Apiclient.post('/getUserDetails', formData);
                // console.log('response user profile data', response.data.user);

                if (response.status === 200) {
                    setUserProfileDetails(response.data.user || {});
                } else {
                    setIsUserError('Failed to fetch user profile details');
                }
            } catch (err) {
                setIsUserError('Error fetching user profile details: ' + err.message);
                SendErrorTotheServer(err, 'fetchProfileDetails');
            } finally {
                setIsUserLoading(false);
            }
        };
        fetchProfileDetails();
    }, [profileUserId]);


    // Function to fetch social data from the API
    useEffect(() => {
        const getSocialsData = async () => {
            try {
                const response = await Apiclient.get(`/userSocials/getUserSocials?userid=${profileUserId}`);

                if (response.status === 200 && Array.isArray(response.data.socials)) {
                    const formatted = {};
                    response.data.socials.forEach(item => {
                        if (item.platform && item.handle_or_url) {
                            formatted[item.platform.toLowerCase()] = item.handle_or_url;
                        }
                    });
                    setSocialLinks(formatted);
                    setSocialError(Object.keys(formatted).length === 0 ? 'No social media accounts available.' : '');
                } else {
                    setSocialLinks({});
                    setSocialError('No social media accounts available.');
                }
            } catch (error) {
                if (error.response?.status === 404) {
                    setSocialLinks({});
                    setSocialError('No social media accounts available.');
                } else {
                    setSocialError('Failed to fetch social media information.');
                    console.error('Error fetching socials:', error.message);
                    SendErrorTotheServer(error, 'getSocialsData');

                }
            }
        };

        if (profileUserId) {
            getSocialsData();
        }
    }, [profileUserId]);

    // to get top gifters
    useEffect(() => {
        const getTopGifters = async () => {
            const formData = {
                toUserId: profileUserId,
                gifterCount: 25,
            };
            try {
                const response = await Apiclient.post('/topgifters', formData);
                // console.log('topgifters response', response.data);
                if (response.status === 200) {
                    setTopGiftersData(response.data || []);
                } else {
                    setIsUserError('Failed to fetch top gifters data');
                }
            } catch (err) {
                setIsUserError('Error fetching top gifters data: ' + err.message);
                SendErrorTotheServer(err, 'getTopGifters in profile modal');

            }
        };
        getTopGifters();
    }, [profileUserId]);


    // to get followers count
    useEffect(() => {
        const getFollowersCount = async () => {
            try {
                const response = await Apiclient.get(`/followers/count/${profileUserId}`);
                // console.log('followers response', response.data);
                if (response.status === 200) {
                    setFollowersCountData(response.data || []);
                } else {
                    setIsUserError('Failed to fetch followers count data');
                }
            } catch (err) {
                setIsUserError('Error fetching followers count data: ' + err.message);
                SendErrorTotheServer(err, 'getFollowersCount');

            }
        };
        getFollowersCount();
    }, [profileUserId]);

    // to get stream count
    useEffect(() => {
        const getStreamRoomCount = async () => {
            try {
                const response = await Apiclient.get(`/rooms/getRoomCount?userid=${profileUserId}`);
                // console.log('getRoomCount response', response.data);
                if (response.status === 200) {
                    setUserStreamRoomCount(response.data || {});
                } else {
                    setIsUserError('Failed to fetch get room count data');
                }
            } catch (err) {
                setIsUserError('Error fetch get room count data: ' + err.message);
                SendErrorTotheServer(err, 'getStreamRoomCount');

            }
        };
        getStreamRoomCount();
    }, [profileUserId]);

    // handle social media press
    const handleSocialPress = (platform) => {
        const handle = socialLinks?.[platform.toLowerCase()];
        if (!handle) {
            return alert(`No ${platform} profile linked.`);
        }

        let url = '';

        switch (platform.toLowerCase()) {
            case 'facebook':
                url = handle.startsWith('http') ? handle : `https://facebook.com/${handle}`;
                break;
            case 'instagram':
                url = handle.startsWith('http') ? handle : `https://instagram.com/${handle}`;
                break;
            case 'twitter':
                url = handle.startsWith('http') ? handle : `https://twitter.com/${handle}`;
                break;
            default:
                url = handle;
        }

        Linking.openURL(url).catch(() => {
            alert('Unable to open the URL.');
        });
    };


    const handleReport = () => {
        if (reportClicked) return; // prevent multiple triggers
        setReportClicked(true);
        setMessage(`Report feature is not implemented yet.`);
        setVisibleModal('message-modal');
        // navigation.navigate('ReportUser');
        // setVisibleModal('ReportUser');
    };

    return (
        <>
            <Modal
                isVisible={visible}
                onBackdropPress={onClose}
                animationIn="slideInUp"
                animationOut="slideOutDown"
                animationInTiming={300}
                animationOutTiming={200}
                useNativeDriver={true}
                avoidKeyboard={false}
                backdropOpacity={0}
                style={[styles.profileModalMain]}
            >
                <Animated.View
                    style={[
                        styles.profileModalOverlay,
                        themeStyles[theme].profileModalOverlay,
                        { flex: 1, maxHeight: screenHeight * 0.8 + 30 },
                        { transform: [{ translateY: panY }] },
                    ]}
                    {...panResponder.panHandlers}
                >
                    {/* close modal */}
                    <TouchableOpacity onPress={onClose} style={[styles.profileModalClose, { marginBottom: 10, marginRight: 5 }]}>
                        <Ionicons name="close" size={28} color={theme === 'light' ? '#333' : '#fff'} />
                    </TouchableOpacity>
                    <View style={[{ marginHorizontal: 0, flex: 1 }]}>
                        {layoutReady &&
                            <ScrollView
                                contentContainerStyle={{ paddingBottom: 40 }}
                                showsVerticalScrollIndicator={true}
                            >
                                <>
                                    {/* Header with Report button */}
                                    {!isMainProfile && (
                                        <View style={styles.psmHeader}>
                                            <TouchableOpacity
                                                onPress={handleReport}
                                                style={[styles.psmReportButton, reportClicked && { opacity: 0.6 }]}
                                                disabled={reportClicked}
                                            >
                                                <Text style={styles.psmReportButtonText}>Report</Text>
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                    {isUserLoading ? (
                                        // Skeleton while loading
                                        <View style={styles.psmProfileContainer}>
                                            <View style={[styles.psmProfileTopCard, themeStyles[theme].psmProfileTopCard, { paddingTop: 10 }]}>
                                                <ShimmerPlaceHolder
                                                    LinearGradient={LinearGradient}
                                                    style={[styles.psmProfileImage, { borderRadius: 50 }]}
                                                    shimmerStyle={{ width: 100, height: 100 }}
                                                />

                                                <ShimmerPlaceHolder
                                                    LinearGradient={LinearGradient}
                                                    style={{ width: 140, height: 20, marginTop: 10, borderRadius: 4 }}
                                                />
                                                <ShimmerPlaceHolder
                                                    LinearGradient={LinearGradient}
                                                    style={{ width: 100, height: 14, marginTop: 6, borderRadius: 4 }}
                                                />

                                                <View style={[styles.psmStatsContainer, { marginTop: 20 }]}>
                                                    {[...Array(3)].map((_, i) => (
                                                        <ShimmerPlaceHolder
                                                            key={i}
                                                            LinearGradient={LinearGradient}
                                                            style={{ width: 60, height: 40, borderRadius: 8, marginHorizontal: 10 }}
                                                        />
                                                    ))}
                                                </View>
                                            </View>
                                        </View>
                                    ) : (
                                        <>

                                            <View style={styles.psmProfileContainer}>
                                                {/* Profile Content */}
                                                <View style={[styles.psmProfileTopCard, themeStyles[theme].psmProfileTopCard]}>
                                                    {/* Profile Image */}
                                                    <View style={[styles.psmProfileImageContainer, themeStyles[theme].psmProfileImageContainer]}>
                                                        <Image
                                                            source={require('../../assets/images/LS-3.jpg')}
                                                            style={styles.psmProfileImage}
                                                        />
                                                    </View>

                                                    {/* Name and ID */}
                                                    <Text style={[styles.psmProfileName, themeStyles[theme].psmProfileName]}>{userProfileDatails?.screenName}</Text>
                                                    <Text style={styles.psmProfileId}>ID: {userProfileDatails?.userid}</Text>

                                                    {/* Stats Section */}
                                                    <View style={styles.psmStatsContainer}>
                                                        <View style={styles.psmStatItem}>
                                                            <Text style={styles.psmStatLabel}>STREAMS</Text>
                                                            <Text style={styles.psmStatValue}>{userStreamRoomCount?.roomCount}</Text>
                                                        </View>
                                                        <View style={styles.psmStatItem}>
                                                            <Text style={styles.psmStatLabel}>FOLLOWERS</Text>
                                                            <Text style={styles.psmStatValue}>{followersCountData?.followerCount}</Text>
                                                        </View>
                                                        <View style={styles.psmStatItem}>
                                                            <Text style={styles.psmStatLabel}>FOLLOWING</Text>
                                                            <Text style={styles.psmStatValue}>{followersCountData?.followingCount}</Text>
                                                        </View>
                                                    </View>
                                                </View>
                                                {/* Social Media Icons */}
                                                <View style={styles.psmSocialContainer}>
                                                    <TouchableOpacity
                                                        onPress={() => handleSocialPress('Instagram')}
                                                        style={styles.psmSocialButton}
                                                        disabled={!socialLinks?.instagram}
                                                    >
                                                        <View style={styles.psmInstagramIcon}>
                                                            <FontAwesome
                                                                name="instagram"
                                                                size={34}
                                                                color={
                                                                    socialLinks?.instagram
                                                                        ? theme === 'dark' ? '#fff' : '#833ab4'
                                                                        : '#A9A9A9'
                                                                }
                                                                style={!socialLinks?.instagram ? { opacity: 0.5 } : {}}
                                                            />
                                                        </View>
                                                    </TouchableOpacity>

                                                    <TouchableOpacity
                                                        onPress={() => handleSocialPress('Facebook')}
                                                        style={styles.psmSocialButton}
                                                        disabled={!socialLinks?.facebook}
                                                    >
                                                        <View style={styles.psmFacebookIcon}>
                                                            <FontAwesome
                                                                name="facebook"
                                                                size={34}
                                                                color={
                                                                    socialLinks?.facebook
                                                                        ? theme === 'dark' ? '#fff' : '#445fed'
                                                                        : '#A9A9A9'
                                                                }
                                                                style={!socialLinks?.facebook ? { opacity: 0.5 } : {}}
                                                            />
                                                        </View>
                                                    </TouchableOpacity>

                                                    <TouchableOpacity
                                                        onPress={() => handleSocialPress('Twitter')}
                                                        style={styles.psmSocialButton}
                                                        disabled={!socialLinks?.twitter}
                                                    >
                                                        <View style={styles.psmTwitterIcon}>
                                                            <Image
                                                                source={require('../../assets/images/tx-logo-black.png')}
                                                                resizeMode="contain"
                                                                style={{
                                                                    width: 26,
                                                                    height: 26,
                                                                    tintColor: socialLinks?.twitter
                                                                        ? theme === 'dark' ? '#fff' : '#000'
                                                                        : '#A9A9A9',
                                                                    opacity: socialLinks?.twitter ? 1 : 0.5,
                                                                }}
                                                            />
                                                        </View>
                                                    </TouchableOpacity>
                                                </View>
                                                {socialError !== '' && (
                                                    <Text style={{ textAlign: 'center', marginTop: 8, color: 'red', fontSize: 13 }}>
                                                        {socialError}
                                                    </Text>
                                                )}
                                                {/* Top Gifters */}
                                                <View style={styles.psmTopGiftersContainer}>
                                                    <Text style={styles.psmTopGiftersTitle}>Top Gifters</Text>
                                                    {topGiftersData.length === 0 ? (
                                                        <View style={{ alignItems: 'center', marginTop: 20 }}>
                                                            <Ionicons name="gift-outline" size={50} color="#ccc" />
                                                            <Text
                                                                style={{
                                                                    marginTop: 10,
                                                                    color: '#999',
                                                                    fontSize: 14,
                                                                    textAlign: 'center',
                                                                }}>
                                                                You haven’t received any gifts during your streams yet. Start streaming and connect with your audience to receive your first gift!
                                                            </Text>
                                                        </View>
                                                    ) : (
                                                        <>
                                                            <LinearGradient
                                                                colors={['rgba(105,238,218,1)', 'rgba(114,80,228,1)']}
                                                                start={{ x: 0, y: 1 }}
                                                                end={{ x: 0.8, y: 0.2 }}
                                                                style={styles.psmTopGifterMainCard}
                                                            >
                                                                <View style={styles.psmTopGifterImageContainer}>
                                                                    <Image
                                                                        source={topGiftersData[0]?.image}
                                                                        style={styles.psmTopGifterMainImage}
                                                                    />
                                                                </View>
                                                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                                    <Text style={styles.psmTopGifterMainName}>{topGiftersData[0]?.ScreenName}</Text>
                                                                    <Text style={styles.psmTopGifterMainAmount}>{topGiftersData[0]?.Amount}</Text>
                                                                </View>
                                                            </LinearGradient>
                                                            <View style={styles.psmOtherGiftersContainer}>
                                                                {topGiftersData?.slice(1).map((gifter, index) => (
                                                                    <View
                                                                        key={gifter.id}
                                                                        style={[styles.psmOtherGifterCard,
                                                                        {
                                                                            borderLeftWidth: index === 0 ? 1 : 0,
                                                                            borderLeftColor: '#f0f0f0',
                                                                            borderBottomLeftRadius: index === 0 ? 15 : 0,
                                                                            borderBottomRightRadius: index === 0 ? 0 : 15,
                                                                        }]}
                                                                    >
                                                                        <View style={styles.psmOtherGifterImageContainer}>
                                                                            <Image
                                                                                source={gifter.image}
                                                                                style={styles.psmOtherGifterImage}
                                                                            />
                                                                        </View>
                                                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                                            <Text style={styles.psmOtherGifterName}>{gifter?.ScreenName}</Text>
                                                                            <Text style={styles.psmOtherGifterAmount}>{gifter?.Amount}</Text>
                                                                        </View>
                                                                    </View>
                                                                ))}
                                                            </View>
                                                        </>)}
                                                </View>
                                            </View>
                                        </>
                                    )}
                                </>
                            </ScrollView>
                        }
                    </View>
                </Animated.View>
            </Modal>
            {visibleModal === 'message-modal' && (
                <MessageModal
                    visible={visibleModal === 'message-modal'}
                    message={message}
                    onClose={() => {
                        setVisibleModal(null);
                        setReportClicked(false); // allow future clicks again
                    }}
                />
            )}
            {visibleModal === 'ReportUser' && (
                <ReportUserModal
                    visible={visibleModal === 'ReportUser'}
                    onClose={() => {
                        setVisibleModal(null);
                    }}
                    userData={userProfileDatails}
                />
            )}
        </>

    );
};

export default ProfileScreenModal;
