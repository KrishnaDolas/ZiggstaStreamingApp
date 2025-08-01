/* eslint-disable react-native/no-inline-styles */
import React, { useCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { View, TouchableOpacity, Text, Animated, Image, Linking, Alert, Platform, PermissionsAndroid, ActivityIndicator, StatusBar } from 'react-native';
import ImagePickerCrop from 'react-native-image-crop-picker';
import Modal from 'react-native-modal';
import { styles, themeStyles } from '../../assets/styles/ThemeStyles';
import { Dimensions, ScrollView } from 'react-native';
import { PanResponder } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Apiclient from '../utils/Apiclient';
import ShimmerPlaceHolder from 'react-native-shimmer-placeholder';
import { getGenderFallbackImage, SendErrorTotheServer } from '../utils/constant';
import MessageModal from './MessageModal';
import { ThemeContext } from '../context/ThemeContext';
import ReportUserModal from './ReportUserModal';
import CameraActionSheet from '../components/CameraActionSheet';
import { useAppContext } from '../context/AppContext';
import Colors from '../../assets/styles/Colors';



const ProfileScreenModal = ({ visible, onClose, profileData, isMainProfile, isProfileAvatarUpdate }) => {
    const { theme } = useContext(ThemeContext);
    const { fetchProfileDetails } = useAppContext();
    const screenHeight = Dimensions.get('window').height;
    const [layoutReady, setLayoutReady] = useState(false);
    const [isUserLoading, setIsUserLoading] = useState(false);
    const [isUserError, setIsUserError] = useState(null);
    const [userProfileDatails, setUserProfileDetails] = useState({});
    const [socialLinks, setSocialLinks] = useState({});
    const [socialError, setSocialError] = useState('');
    const [topGiftersData, setTopGiftersData] = useState([]);
    const [followersCountData, setFollowersCountData] = useState({});
    const [userStreamRoomCount, setUserStreamRoomCount] = useState({});
    const [visibleModal, setVisibleModal] = useState(null);
    const [message, setMessage] = useState(null);
    const [reportClicked, setReportClicked] = useState(false);
    const [avatarUploading, setAvatarUploading] = useState(false);
    const [showActionSheet, setShowActionSheet] = useState(false);
    const [isImagePickerOpen, setIsImagePickerOpen] = useState(false);
    const [profileUserData, setProfileUserData] = useState({});
    const [showAvatarPreview, setShowAvatarPreview] = useState(false);
    const [avatarToPreview, setAvatarToPreview] = useState(null);

    const panY = useRef(new Animated.Value(0)).current;
    const profileUserId = profileData?.userid ?? profileData?.RequesterID ?? profileData?.userID ?? profileData?.user_id ?? profileData.fromUserID ?? null;


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



    const handleEditAvatar = () => {
        setShowActionSheet(true);
    };

    const onSelectImage = async (type) => {
        setAvatarUploading(true);
        setIsImagePickerOpen(true);

        try {
            let image = null;

            if (type === 'camera') {
                if (Platform.OS === 'android') {
                    const permission = PermissionsAndroid.PERMISSIONS.CAMERA;
                    const granted = await PermissionsAndroid.request(permission, {
                        title: 'Camera Permission',
                        message: 'App needs access to your camera to take photos.',
                        buttonNeutral: 'Ask Me Later',
                        buttonNegative: 'Cancel',
                        buttonPositive: 'OK',
                    });

                    if (granted === PermissionsAndroid.RESULTS.DENIED) {
                        Alert.alert(
                            'Permission Required',
                            'Camera permission is required to take a photo. Please allow it.'
                        );
                        setAvatarUploading(false);
                        setIsImagePickerOpen(false);
                        return;
                    }

                    if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
                        Alert.alert(
                            'Permission Denied',
                            'Camera permission was denied permanently. Open settings to allow access.',
                            [
                                { text: 'Cancel', style: 'cancel' },
                                { text: 'Open Settings', onPress: () => Linking.openSettings() },
                            ]
                        );
                        setAvatarUploading(false);
                        setIsImagePickerOpen(false);
                        return;
                    }

                    if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                        setAvatarUploading(false);
                        setIsImagePickerOpen(false);
                        return;
                    }
                }

                image = await ImagePickerCrop.openCamera({
                    width: 256,
                    height: 256,
                    cropping: true,
                    hideBottomControls: true,
                    freeStyleCropEnabled: false,
                    compressImageQuality: 0.7,
                    mediaType: 'photo',
                    includeBase64: false,
                });

            } else if (type === 'gallery') {
                image = await ImagePickerCrop.openPicker({
                    width: 256,
                    height: 256,
                    cropping: true,
                    hideBottomControls: true,
                    freeStyleCropEnabled: false,
                    compressImageQuality: 0.7,
                    mediaType: 'photo',
                    includeBase64: false,
                });
            }

            if (!image || image.cancelled) {
                setAvatarUploading(false);
                return;
            }

            const avatarFile = {
                uri: image.path,
                name: image.filename || `avatar_${Date.now()}.jpg`,
                type: image.mime,
            };

            uploadAvatarToServer(avatarFile);

        } catch (error) {
            if (error.message?.includes('cancelled') || error.code === 'E_PICKER_CANCELLED') {
                console.log('Image selection cancelled');
            } else {
                console.error('Image selection error:', error);
                Alert.alert('Error', 'Failed to select or crop image.');
            }
            setAvatarUploading(false);
        } finally {
            setIsImagePickerOpen(false);
        }
    };


    const uploadAvatarToServer = async (avatarFile) => {
        setIsImagePickerOpen(false); // Reset flag when starting upload
        const formData = new FormData();
        formData.append('avatar', {
            uri: Platform.OS === 'ios' ? avatarFile.uri.replace('file://', '') : avatarFile.uri,
            type: avatarFile.type,
            name: avatarFile.name,
        });
        formData.append('userId', profileUserId);

        try {
            const response = await Apiclient.post('/avatar/upload', formData);
            const resJson = response.data;
            console.log('response avatar upload', resJson);
            if (response.status === 200) {
                // Alert.alert('Upload successFully', resJson.message);
                setMessage(resJson.message);
                setVisibleModal('message-modal');
                setTimeout(() => {
                    onClose();
                    fetchProfileDetails();
                }, 1500);
            } else {
                // Alert.alert('Upload Failed', resJson.message || 'Please try again.');
                setMessage(resJson.message || 'Please try again.');
                setVisibleModal('message-modal');
            }
        } catch (error) {
            console.error('Avatar upload error:', error);
            Alert.alert('Error', 'Failed to upload avatar.');
        } finally {
            setAvatarUploading(false);
        }
    };

    // get profile details from API

    useEffect(() => {
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
                setIsUserError('Error fetching user profile details: ' + err.message);
                SendErrorTotheServer(err, 'fetchUserProfileDetails');
            } finally {
                setIsUserLoading(false);
            }
        };
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
                gifterCount: 3,
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
        setVisibleModal('ReportUser');
    };

    const handleProfileOpen = useCallback((item) => {
        setProfileUserData(item);
        setVisibleModal('profile-screen-modal');

    }, []);


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
                    <View style={{ flexDirection: 'row', justifyContent: isMainProfile ? 'flex-end' : 'space-between', alignItems: 'center' }}>
                        {/* Header with Report button */}
                        {!isMainProfile && (
                            <TouchableOpacity
                                onPress={handleReport}
                                style={[styles.psmReportButton, themeStyles[theme].psmReportButton, reportClicked && { opacity: 0.6 }]}
                                disabled={reportClicked}
                            >
                                <Text style={[styles.psmReportButtonText, themeStyles[theme].psmReportButtonText]}>Report</Text>
                            </TouchableOpacity>
                        )}
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
                                                                <TouchableOpacity
                                                                    onPress={() => {
                                                                        const uri = !userProfileDatails?.avatar || userProfileDatails?.avatar === 'default'
                                                                            ? null
                                                                            : userProfileDatails.avatar;
                                                                        if (uri) {
                                                                            setAvatarToPreview(uri);
                                                                            setShowAvatarPreview(true);
                                                                        }
                                                                    }}
                                                                    activeOpacity={0.9}
                                                                >
                                                                    <Image
                                                                        source={!userProfileDatails?.avatar || userProfileDatails?.avatar === 'default'
                                                                            ? getGenderFallbackImage(userProfileDatails?.gender)
                                                                            : { uri: userProfileDatails?.avatar }
                                                                        }
                                                                        style={styles.psmProfileImage}
                                                                    />
                                                                </TouchableOpacity>
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
                                                                    {topGiftersData?.slice(1).map((gifter, index) => (
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
                    reportData={userProfileDatails}
                    reportType="User"
                />
            )}
            <CameraActionSheet
                visible={showActionSheet}
                onClose={() => setShowActionSheet(false)}
                title="Update Profile Picture"
                options={['Take Photo', 'Choose from Gallery', 'Cancel']}
                theme={theme}
                onPress={(index) => {
                    if (index === 0) onSelectImage('camera');
                    if (index === 1) onSelectImage('gallery');
                }}
            />
            {visibleModal === 'profile-screen-modal' && (
                <ProfileScreenModal visible="true" onClose={() => setVisibleModal(null)} profileData={profileUserData} />
            )}
            <Modal
                isVisible={showAvatarPreview}
                onBackdropPress={() => setShowAvatarPreview(false)}
                useNativeDriver
                style={{ margin: 0, justifyContent: 'center', alignItems: 'center' }}
            >
                <View style={{ backgroundColor: theme === 'dark' ? Colors.blackCardColor : '#fff', padding: 10, borderRadius: 10 }}>
                    <Image
                        source={{ uri: avatarToPreview }}
                        style={{
                            width: Dimensions.get('window').width * 0.8,
                            height: Dimensions.get('window').width * 0.8,
                            borderRadius: 10,
                            resizeMode: 'contain',
                        }}
                    />
                    <TouchableOpacity
                        onPress={() => setShowAvatarPreview(false)}
                        style={{ marginTop: 10, alignSelf: 'center' }}
                    >
                        <Text style={{ color: theme === 'dark' ? '#fff' : '#000', fontSize: 16 }}>Close</Text>
                    </TouchableOpacity>
                </View>
            </Modal>

        </>

    );
};

export default ProfileScreenModal;
