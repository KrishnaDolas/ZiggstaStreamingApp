/* eslint-disable react-native/no-inline-styles */
import React, { useCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { View, TouchableOpacity, Text, Animated, Image, Linking, Platform, ActivityIndicator, StatusBar } from 'react-native';
import Modal from 'react-native-modal';
import { styles, themeStyles } from '../../assets/styles/ThemeStyles';
import { Dimensions, ScrollView } from 'react-native';
import { PanResponder } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import Icon from 'react-native-vector-icons/FontAwesome';
import Apiclient from '../utils/Apiclient';
import ShimmerPlaceHolder from 'react-native-shimmer-placeholder';
import { getGenderFallbackImage, SendErrorTotheServer } from '../utils/constant';
import { ThemeContext } from '../context/ThemeContext';
import { useAppContext } from '../context/AppContext';
import Colors from '../../assets/styles/Colors';
import { RFValue } from 'react-native-responsive-fontsize';
import { useNavigation } from '@react-navigation/native';

const ProfileScreenModal = ({
    visible,
    onClose,
    profileData,
    isMainProfile,
    isProfileAvatarUpdate,
}) => {
    const { theme } = useContext(ThemeContext);
    const {
        setModalStage,
        setModalVisibleStage,
        setShowAvatarPreview,
        setAvatarToPreview,
        userProfileDetails,
        setUserProfileDetails,
        setIsMainProfileOpened,
        avatarUploading,
        isImagePickerOpen,
        setProfileUserId,
        setProfileUserData,
        userData,
        setProfileDescription,
    } = useAppContext();
    const screenHeight = Dimensions.get('window').height;
    const [layoutReady, setLayoutReady] = useState(false);
    const [isUserLoading, setIsUserLoading] = useState(false);
    const [isUserError, setIsUserError] = useState(null);
    const [socialLinks, setSocialLinks] = useState({});
    const [socialError, setSocialError] = useState('');
    const [topGiftersData, setTopGiftersData] = useState([]);
    const [followersCountData, setFollowersCountData] = useState({});
    const [userStreamRoomCount, setUserStreamRoomCount] = useState({});
    const [profileLikeStatusData, setProfileLikeStatusData] = useState({});
    const [profileStarRatingData, setProfileStarRatingData] = useState({});
    // const [profileUserData, setProfileUserData] = useState({});
    const navigation = useNavigation();

    const [showStarInfoModal, setShowStarInfoModal] = useState(false);
    const panY = useRef(new Animated.Value(0)).current;
    const profileUserId = profileData?.userid ?? profileData?.RequesterID ?? profileData?.userID ?? profileData?.user_id ?? profileData.fromUserID ?? null;

    useEffect(() => {
        setIsMainProfileOpened(isMainProfile ? true : false);
    }, [isMainProfile]);

    // Store profile description when modal opens
    useEffect(() => {
        if (visible && userProfileDetails?.description) {
            setProfileDescription(userProfileDetails.description);
        }
    }, [visible, userProfileDetails.description, setProfileDescription]);

    // Handle status bar and navigation bar visibility
    useEffect(() => {
        if (isImagePickerOpen) {
            // Hide status bar and enable fullscreen
            StatusBar.setHidden(true, 'fade');

            // For Android - hide navigation bar
            if (Platform.OS === 'android') {
                // This requires react-native-navigation-bar-color or similar library
                // Or you can use react-native-immersive-mode for better control
                try {
                    // If you have react-native-navigation-bar-color installed
                    // NavigationBar.hide();

                    // Alternative: Use react-native-immersive-mode
                    // ImmersiveMode.fullLayout(true);
                    // ImmersiveMode.setBarMode('FullSticky');
                } catch (error) {
                    console.log('Navigation bar control not available');
                }
            }
        } else {
            // Restore status bar
            StatusBar.setHidden(false, 'fade');

            // For Android - show navigation bar
            if (Platform.OS === 'android') {
                try {
                    // If you have react-native-navigation-bar-color installed
                    // NavigationBar.show();

                    // Alternative: Use react-native-immersive-mode
                    // ImmersiveMode.fullLayout(false);
                    // ImmersiveMode.setBarMode('Normal');
                } catch (error) {
                    console.log('Navigation bar control not available');
                }
            }
        }

        // Cleanup when component unmounts
        return () => {
            StatusBar.setHidden(false, 'fade');
            if (Platform.OS === 'android') {
                try {
                    // Restore navigation bar
                    // NavigationBar.show();
                    // ImmersiveMode.fullLayout(false);
                } catch (error) {
                    console.log('Navigation bar control not available');
                }
            }
        };
    }, [isImagePickerOpen]);

    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: (_, gestureState) => {
                return Math.abs(gestureState.dy) > 5;
            },
            onPanResponderMove: Animated.event(
                [null, { dy: panY }],
                { useNativeDriver: false } // Explicitly set
            ),
            onPanResponderRelease: (_, gesture) => {
                if (gesture.dy > 120) {
                    onClose(); // dismiss if dragged down enough
                } else {
                    Animated.spring(panY, {
                        toValue: 0,
                        useNativeDriver: false, // Explicitly set
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


    //  edit profile avatar
    const handleEditAvatar = () => {
        setProfileUserId(profileUserId);
        setModalVisibleStage('camera-action-sheet');
        setModalStage('second');
    };

    // get profile details from API

    const fetchUserProfileDetails = async () => {
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
            if (err.response?.status === 429) {
                setIsUserError('Rate limit exceeded. Retrying...');
                setTimeout(() => fetchUserProfileDetails(), 3000); // retry after 3s
            } else {
                setIsUserError('Error fetching user profile details: ' + err.message);
            }
            SendErrorTotheServer(err, 'fetchUserProfileDetails');
        } finally {
            setIsUserLoading(false);
        }
    };

    useEffect(() => {
        if (!profileUserId) return; // ✅ skip if no userId
        fetchUserProfileDetails();
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
                gifterCount: 10,
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


    // check like status
    const checkLikeStatus = useCallback(async () => {
        try {
            const payload = {
                likerID: userData?.userid,
                targetUserID: profileUserId,
            };
            const response = await Apiclient.post('/profile/LikeStatus', payload);
            if (response.status === 200) {
                // console.log('response of like status', response.data);
                setProfileLikeStatusData(response.data);
            } else {
                setProfileLikeStatusData({});
            }
        } catch (error) {
            if (error.response?.status === 404) {
                setProfileLikeStatusData({});
            } else {
                console.error('Error fetching like status:', error.message);
                SendErrorTotheServer(error, 'getLikeStatus');

            }
        }
    }, [profileUserId, userData?.userid]);

    useEffect(() => {
        checkLikeStatus();
    }, [checkLikeStatus]);


    // toggle like status

    const toggleLikeStatus = async () => {
        try {
            const actionType = profileLikeStatusData?.liked ? 'unlike' : 'like';

            const payload = {
                action: actionType,
                likerID: userData?.userid,
                targetUserID: profileUserId,
            };
            // console.log('profile like status payload', payload);

            const response = await Apiclient.post('/profile/profileLikes', payload);
            // console.log('profile like status response', response.data);

            if (response.status === 200) {
                await checkLikeStatus();
                // await fetchUserProfileDetails();
                setUserProfileDetails(prev => ({
                    ...prev,
                    likesCount: actionType === 'like'
                        ? prev.likesCount + 1
                        : Math.max(prev.likesCount - 1, 0),
                }));
            }
        } catch (error) {
            console.error('Error toggling like:', error);
            SendErrorTotheServer(error, 'toggleLikeStatus');
        }
    };


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


    // profile star rating
    const getProfileStarRating = useCallback(async () => {
        try {
            const response = await Apiclient.get(`/profile/starrating?userID=${profileUserId}`);
            if (response.status) {
                console.log('response of profile star rating data', response.data);
                setProfileStarRatingData(response.data);
            } else {
                setProfileStarRatingData({});
            }
        } catch (error) {
            console.error('Error fetching profile start rating:', error.message);
            SendErrorTotheServer(error, 'getProfileStarRating');
        }
    }, [profileUserId]);

    useEffect(() => {
        getProfileStarRating();
    }, [getProfileStarRating]);

    // report modal open
    const handleReport = () => {
        setModalVisibleStage('report-user');
        setModalStage('second');
    };

    // another profile modal open
    const handleProfileOpen = useCallback((item) => {
        setProfileUserData(item);
        setModalVisibleStage('friend-profile-modal');
        setModalStage('second');
    }, []);


    const handleProfileDescriptionOpen = () => {
        setProfileUserId(profileUserId);
        setModalVisibleStage('profile-description');
        setModalStage('second');
    };


    const starLevels = [
        {
            level: 'New Star',
            share: '40%',
            cashout: '$100 Minimum Cashout',
            coins: '10,000',
        },
        {
            level: 'Bronze Star',
            share: '45%',
            cashout: '$1,000',
            coins: '100,000',
        },
        {
            level: 'Silver Star',
            share: '50%',
            cashout: '$2,500',
            coins: '250,000',
        },
        {
            level: 'Gold Star',
            share: '55%',
            cashout: '$5,000',
            coins: '500,000',
        },
        {
            level: 'Super Star',
            share: '60%+',
            cashout: '$10,000',
            coins: '1,000,000',
        },
    ];
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
                onRequestClose={onClose}
            >
                <Animated.View
                    style={[
                        styles.profileModalOverlay,
                        themeStyles[theme].profileLargeModalOverlay,
                        { flex: 1, maxHeight: screenHeight * 0.8 + 30 },
                        { transform: [{ translateY: panY }] },
                    ]}
                    {...panResponder.panHandlers}
                >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        {/* Header with Report button */}
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                            {profileUserId === userData?.userid ? null : (
                                <TouchableOpacity
                                    onPress={handleReport}
                                    style={[styles.psmReportButton, themeStyles[theme].psmReportButton]}
                                >
                                    <Text style={[styles.psmReportButtonText, themeStyles[theme].psmReportButtonText]}>Report</Text>
                                </TouchableOpacity>
                            )}
                            {profileUserId === userData?.userid && (
                                <TouchableOpacity
                                    style={{ marginLeft: 8 }}
                                    onPress={() => {
                                        if (navigation) {
                                            navigation.navigate('SettingsProfile');
                                            onClose();
                                        } else {
                                            console.log('Navigation not available');
                                        }
                                    }}>
                                    <Ionicons name="settings" size={30} color={theme === 'light' ? '#d93a63' : '#fff'} />
                                </TouchableOpacity>
                            )}
                        </View>
                        {/* close modal */}
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={28} color={theme === 'light' ? '#333' : '#fff'} />
                        </TouchableOpacity>
                    </View>

                    {avatarUploading ? (
                        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                            <ActivityIndicator size="large" />
                            <Text style={{ marginTop: 10 }}>Uploading...</Text>
                        </View>
                    ) : (
                        <View style={[{ marginHorizontal: 0, flex: 1 }]}>
                            {layoutReady &&
                                <ScrollView
                                    contentContainerStyle={{ paddingBottom: 40 }}
                                    showsVerticalScrollIndicator={true}
                                >
                                    <>
                                        {isUserLoading ? (
                                            // Skeleton while loading
                                            <View style={styles.psmProfileContainer}>
                                                <View style={[styles.psmProfileTopCard, themeStyles[theme].psmProfileTopCard, { paddingTop: 10 }]}>
                                                    <ShimmerPlaceHolder
                                                        LinearGradient={LinearGradient}
                                                        style={[styles.psmProfileImage, { borderRadius: 100 }]}
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
                                                            <View style={styles.profileImageWrapper}>
                                                                {isMainProfile ? (
                                                                    <TouchableOpacity
                                                                        onPress={() => {
                                                                            const uri = !userProfileDetails?.avatar || userProfileDetails?.avatar === 'default'
                                                                                ? null
                                                                                : userProfileDetails.avatar;
                                                                            if (uri) {
                                                                                setAvatarToPreview(uri);
                                                                                setShowAvatarPreview(true);
                                                                                setModalVisibleStage('profile-avatar-prv');
                                                                                setModalStage('second');
                                                                            }
                                                                        }}
                                                                        activeOpacity={0.9}
                                                                    >
                                                                        <Image
                                                                            source={!userProfileDetails?.avatar || userProfileDetails?.avatar === 'default'
                                                                                ? getGenderFallbackImage(userProfileDetails?.gender)
                                                                                : { uri: userProfileDetails?.avatar }
                                                                            }
                                                                            style={styles.psmProfileImage}
                                                                        />
                                                                    </TouchableOpacity>
                                                                ) : (
                                                                    <View>
                                                                        <Image
                                                                            source={!userProfileDetails?.avatar || userProfileDetails?.avatar === 'default'
                                                                                ? getGenderFallbackImage(userProfileDetails?.gender)
                                                                                : { uri: userProfileDetails?.avatar }
                                                                            }
                                                                            style={styles.psmProfileImage}
                                                                        />
                                                                    </View>
                                                                )}

                                                                {isProfileAvatarUpdate && (
                                                                    <TouchableOpacity
                                                                        style={styles.editIconContainer}
                                                                        onPress={handleEditAvatar}
                                                                    >
                                                                        <Ionicons name="camera" size={16} color="#fff" />
                                                                    </TouchableOpacity>
                                                                )}
                                                            </View>
                                                        </View>

                                                        {/* Name and ID */}
                                                        <Text style={[styles.psmProfileName, themeStyles[theme].psmProfileName]}>{userProfileDetails?.screenName}</Text>
                                                        {/* <Text style={styles.psmProfileId}>ID: {userProfileDetails?.userid}</Text> */}

                                                        <View
                                                            style={{
                                                                flexDirection: 'row',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                            }}
                                                        >
                                                            <View style={styles.profileStarRatingStarRow}>
                                                                {Array.from({ length: 5 }).map((_, index) => {
                                                                    const isFilled = index < profileStarRatingData?.starLevel;

                                                                    return (
                                                                        <Icon
                                                                            key={index}
                                                                            name="star"
                                                                            size={RFValue(15)}
                                                                            color={isFilled ? '#FFD700' : '#B0B0B0'}
                                                                        />
                                                                    );
                                                                })}
                                                            </View>

                                                            <TouchableOpacity
                                                                onPress={() => setShowStarInfoModal(true)}
                                                                style={{
                                                                    marginLeft: 8,
                                                                }}
                                                            >
                                                                <Ionicons
                                                                    name="information-circle"
                                                                    size={30}
                                                                    color="#4A90E2"
                                                                />
                                                            </TouchableOpacity>
                                                        </View>
                                                        {userProfileDetails?.description !== null && userProfileDetails?.description !== '' && (
                                                            <View style={[styles.psmProfileDesContainer, themeStyles[theme].psmProfileDesContainer]}>
                                                                <Text style={[styles.psmProfileDes, themeStyles[theme].psmProfileDes]}>
                                                                    {userProfileDetails?.description}
                                                                </Text>
                                                                {isProfileAvatarUpdate &&
                                                                    <TouchableOpacity
                                                                        style={[styles.profileDescIconContainer, themeStyles[theme].profileDescIconContainer]}
                                                                        onPress={handleProfileDescriptionOpen}
                                                                        activeOpacity={0.7}
                                                                    >
                                                                        <Feather name="edit" size={18} color={theme === 'light' ? 'rgba(105, 80, 251, 1)' : '#fff'} />
                                                                    </TouchableOpacity>
                                                                }
                                                            </View>
                                                        )}
                                                        {/* Stats Section */}
                                                        <View style={[
                                                            styles.psmStatsContainer, {
                                                                marginTop: userProfileDetails?.description !== null && userProfileDetails?.description !== '' ? 0 : 10,
                                                            }]}>
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
                                                    {/* Likes and Dislikes Section */}
                                                    <View style={styles.pLikeContainer}>
                                                        <View style={[styles.pLikeStatsBox, themeStyles[theme].pLikeStatsBox]}>
                                                            <View style={styles.pLikeStatItem}>
                                                                {!isMainProfile && (
                                                                    <TouchableOpacity onPress={toggleLikeStatus} style={styles.pLikeIconButton}>
                                                                        {profileLikeStatusData.liked ?
                                                                            <Icon name="heart" size={30} color="#FF6347" /> :
                                                                            <Icon name="heart-o" size={30} color={theme === 'dark' ? '#fff' : '#808080'} />
                                                                        }
                                                                    </TouchableOpacity>
                                                                )}
                                                                <View style={{ alignItems: 'center' }}>
                                                                    <Text
                                                                        style={[
                                                                            styles.pLikeStatCount,
                                                                            themeStyles[theme].pLikeStatCount]}
                                                                    >
                                                                        {userProfileDetails?.likesCount || 0}
                                                                    </Text>
                                                                    <Text
                                                                        style={[
                                                                            styles.pLikeStatLabel,
                                                                            themeStyles[theme].pLikeStatLabel,
                                                                        ]}
                                                                    >
                                                                        LIKES
                                                                    </Text>
                                                                </View>
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
                                                                            ? theme === 'dark' ? '#833ab4' : '#833ab4'
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
                                                                            ? theme === 'dark' ? '#445fed' : '#445fed'
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
                                                                    <TouchableOpacity
                                                                        onPress={() => handleProfileOpen(topGiftersData[0])}
                                                                        style={styles.psmTopGifterImageContainer}
                                                                    >
                                                                        <Image
                                                                            source={
                                                                                topGiftersData[0]?.avatar === 'default' || !topGiftersData[0]?.avatar
                                                                                    ? getGenderFallbackImage(topGiftersData[0]?.gender)
                                                                                    : { uri: topGiftersData[0]?.avatar }
                                                                            }
                                                                            style={styles.psmTopGifterMainImage}
                                                                        />
                                                                    </TouchableOpacity>
                                                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                                        <Text style={styles.psmTopGifterMainName}>{topGiftersData[0]?.screenName}</Text>
                                                                        <Text style={styles.psmTopGifterMainAmount}>{topGiftersData[0]?.Amount}</Text>
                                                                    </View>
                                                                </LinearGradient>
                                                                <View style={styles.psmOtherGiftersContainer}>
                                                                    {topGiftersData?.slice(1, 3).map((gifter, index) => (
                                                                        <TouchableOpacity
                                                                            key={index}
                                                                            onPress={() => handleProfileOpen(gifter)}
                                                                            style={[styles.psmOtherGifterCard, themeStyles[theme].psmOtherGifterCard,
                                                                            {
                                                                                borderLeftWidth: index === 0 ? 1 : 0,
                                                                                borderLeftColor: theme === 'light' ? '#f0f0f0' : Colors.blackDividers,
                                                                                borderBottomLeftRadius: index === 0 ? 15 : 0,
                                                                                borderBottomRightRadius: index === 0 ? 0 : 15,
                                                                            }]}
                                                                        >
                                                                            <View style={styles.psmOtherGifterImageContainer}>
                                                                                <Image
                                                                                    source={
                                                                                        !gifter?.avatar || gifter?.avatar === 'default'
                                                                                            ? getGenderFallbackImage(gifter?.gender)
                                                                                            : { uri: gifter.avatar }
                                                                                    }
                                                                                    style={styles.psmOtherGifterImage}
                                                                                />
                                                                            </View>
                                                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                                                <Text numberOfLines={1}
                                                                                    ellipsizeMode="tail"
                                                                                    style={[styles.psmOtherGifterName, themeStyles[theme].psmOtherGifterName]}
                                                                                >
                                                                                    {gifter?.screenName}
                                                                                </Text>
                                                                                <Text
                                                                                    numberOfLines={1}
                                                                                    ellipsizeMode="tail"
                                                                                    style={[styles.psmOtherGifterAmount, themeStyles[theme].psmOtherGifterAmount]}
                                                                                >
                                                                                    {gifter?.Amount}
                                                                                </Text>
                                                                            </View>
                                                                        </TouchableOpacity>
                                                                    ))}
                                                                </View>
                                                            </>)}
                                                    </View>

                                                    {/* History Table */}
                                                    <View style={[styles.profileTable, themeStyles[theme].profileTable]}>
                                                        <View style={[styles.profileTableHeader, themeStyles[theme].profileTableHeader]}>
                                                            <Text style={[styles.profileTableHeaderText, styles.profileTableCellIndex, themeStyles[theme].profileTableHeaderText]}>#</Text>
                                                            <Text style={[styles.profileTableHeaderText, styles.profileTableCellUsername, themeStyles[theme].profileTableHeaderText]}>Username</Text>
                                                            <Text style={[styles.profileTableHeaderText, styles.profileTableCellAmount, themeStyles[theme].profileTableHeaderText]}>Amount</Text>
                                                        </View>
                                                        <ScrollView showsVerticalScrollIndicator={false} nestedScrollEnabled={true} contentContainerStyle={{ paddingBottom: 8 }} style={{ height: screenHeight * 0.2 + 30 }}>
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
                                                </View>
                                            </>
                                        )}
                                    </>
                                </ScrollView>
                            }
                        </View>
                    )}

                </Animated.View>
            </Modal>
            <Modal
                isVisible={showStarInfoModal}
                onBackdropPress={() => setShowStarInfoModal(false)}
                style={{ justifyContent: 'center', margin: 20 }}
            >
                <View
                    style={{
                        backgroundColor: theme === 'light' ? '#fff' : '#1f1f1f',
                        borderRadius: 16,
                        padding: 20,
                        maxHeight: '85%',
                    }}
                >
                    <Text
                        style={{
                            fontSize: 20,
                            fontWeight: '700',
                            textAlign: 'center',
                            marginBottom: 15,
                            color: theme === 'light' ? '#000' : '#fff',
                        }}
                    >
                        How the Star System Works
                    </Text>

                    <Text
                        style={{
                            color: theme === 'light' ? '#444' : '#ddd',
                            lineHeight: 22,
                            marginBottom: 20,
                        }}
                    >
                        Ziggcoins earned by hosts from games and gifts contribute 100% to
                        the Star System. When a host reaches a milestone below, they level
                        up to the next star tier.
                    </Text>

                    {/* Table Header */}
                    <View
                        style={{
                            flexDirection: 'row',
                            backgroundColor: '#d93a63',
                            paddingVertical: 10,
                            borderTopLeftRadius: 8,
                            borderTopRightRadius: 8,
                        }}
                    >
                        <Text style={{ flex: 1.3, color: '#fff', fontWeight: '700', textAlign: 'center' }}>
                            Level
                        </Text>
                        <Text style={{ flex: 1, color: '#fff', fontWeight: '700', textAlign: 'center' }}>
                            Share
                        </Text>
                        <Text style={{ flex: 2, color: '#fff', fontWeight: '700', textAlign: 'center' }}>
                            Requirement
                        </Text>
                    </View>

                    {starLevels.map((item, index) => (
                        <View
                            key={index}
                            style={{
                                flexDirection: 'row',
                                borderWidth: 1,
                                borderColor: '#ddd',
                                paddingVertical: 12,
                                backgroundColor:
                                    index % 2 === 0
                                        ? theme === 'light'
                                            ? '#fafafa'
                                            : '#2a2a2a'
                                        : theme === 'light'
                                            ? '#fff'
                                            : '#222',
                            }}
                        >
                            <Text
                                style={{
                                    flex: 1.3,
                                    textAlign: 'center',
                                    color: theme === 'light' ? '#000' : '#fff',
                                }}
                            >
                                {item.level}
                            </Text>

                            <Text
                                style={{
                                    flex: 1,
                                    textAlign: 'center',
                                    color: theme === 'light' ? '#000' : '#fff',
                                }}
                            >
                                {item.share}
                            </Text>

                            <View
                                style={{
                                    flex: 2,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}
                            >
                                <Text
                                    style={{
                                        color: theme === 'light' ? '#000' : '#fff',
                                        fontSize: 12,
                                        fontWeight: '600',
                                    }}
                                >
                                    {item.cashout}
                                </Text>

                                <View
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        marginTop: 4,
                                    }}
                                >
                                    <Image
                                        source={require('../../assets/images/icons/icon_z.png')}
                                        style={{
                                            width: 16,
                                            height: 16,
                                            resizeMode: 'contain',
                                            marginRight: 4,
                                        }}
                                    />

                                    <Text
                                        style={{
                                            color: theme === 'light' ? '#000' : '#fff',
                                            fontWeight: '700',
                                            fontSize: 12,
                                        }}
                                    >
                                        {item.coins}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    ))}

                    <TouchableOpacity
                        onPress={() => setShowStarInfoModal(false)}
                        style={{
                            marginTop: 20,
                            backgroundColor: '#d93a63',
                            paddingVertical: 12,
                            borderRadius: 10,
                        }}
                    >
                        <Text
                            style={{
                                color: '#fff',
                                textAlign: 'center',
                                fontWeight: '700',
                            }}
                        >
                            Close
                        </Text>
                    </TouchableOpacity>
                </View>
            </Modal>
        </>

    );
};

export default ProfileScreenModal;
