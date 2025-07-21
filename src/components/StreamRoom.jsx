/* eslint-disable react-native/no-inline-styles */
import {
    View, Text, TouchableOpacity, Alert, Image, ScrollView, Dimensions, TextInput, Keyboard, Animated,
    Easing,
    ActivityIndicator, Platform
} from 'react-native';
import { styles } from '../../assets/styles/ThemeStyles';
import { RTCView } from 'react-native-webrtc';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import React, { Fragment, useContext, useEffect, useRef, useState } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import Modal from 'react-native-modal';
import FastImage from 'react-native-fast-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Apiclient from '../utils/Apiclient';
import { ConfirmModal } from '../modals/ConfirmModal';
import RequestModal from '../modals/RequestModal';
import { globalStyles } from '../../assets/styles/GlobalStyles';
import MessageModal from '../modals/MessageModal';
import { useAppContext } from '../context/AppContext';
import { SendErrorTotheServer } from '../utils/constant';

const giftImages = {
    '420.gif': require('../../assets/images/gifts/420.gif'),
    'award.gif': require('../../assets/images/gifts/award.gif'),
    'balloons.gif': require('../../assets/images/gifts/balloons.gif'),
    'boss.gif': require('../../assets/images/gifts/boss.gif'),
    'broken-heart.gif': require('../../assets/images/gifts/broken-heart.gif'),
    'casino-chip.gif': require('../../assets/images/gifts/casino-chip.gif'),
    'casino-chip2.gif': require('../../assets/images/gifts/casino-chip2.gif'),
    'casino-chip3.gif': require('../../assets/images/gifts/casino-chip3.gif'),
    'casino-chip5.gif': require('../../assets/images/gifts/casino-chip5.gif'),
    'clown.gif': require('../../assets/images/gifts/clown.gif'),
    'crown.gif': require('../../assets/images/gifts/crown.gif'),
    'diamond.gif': require('../../assets/images/gifts/diamond.gif'),
    'diamond2.gif': require('../../assets/images/gifts/diamond2.gif'),
    'diamond3.gif': require('../../assets/images/gifts/diamond3.gif'),
    'dollar.gif': require('../../assets/images/gifts/dollar.gif'),
    'financial-freedom.gif': require('../../assets/images/gifts/financial-freedom.gif'),
    'hearts.gif': require('../../assets/images/gifts/hearts.gif'),
    'in-love.gif': require('../../assets/images/gifts/in-love.gif'),
    'jack-in-the-box.gif': require('../../assets/images/gifts/jack-in-the-box.gif'),
    'laugh.gif': require('../../assets/images/gifts/laugh.gif'),
    'like.gif': require('../../assets/images/gifts/like.gif'),
    'love.gif': require('../../assets/images/gifts/love.gif'),
    'piggy-bank.gif': require('../../assets/images/gifts/piggy-bank.gif'),
    'popcorn.gif': require('../../assets/images/gifts/popcorn.gif'),
    'popcorn2.gif': require('../../assets/images/gifts/popcorn2.gif'),
    'profit.gif': require('../../assets/images/gifts/profit.gif'),
    'savings3.gif': require('../../assets/images/gifts/savings3.gif'),
    'sunrise.gif': require('../../assets/images/gifts/sunrise.gif'),
    'ticket.gif': require('../../assets/images/gifts/ticket.gif'),
    'ticket2.gif': require('../../assets/images/gifts/ticket2.gif'),
    'valentines-day.gif': require('../../assets/images/gifts/valentines-day.gif'),
    'wallet.gif': require('../../assets/images/gifts/wallet.gif'),
    'wave.gif': require('../../assets/images/gifts/wave.gif'),
    'win-win.gif': require('../../assets/images/gifts/win-win.gif'),
};

const StreamRoom = ({
    remoteStreams,
    localStream,
    isStreaming,
    requestStreamPermission,
    isFrontCamera,
    toggleMute,
    switchCamera,
    leaveRoom,
    isMuted,
    Streamupdated,
    setStreamupdated,
    isHost,
    HandleChatmessages,
    roomchat,
    streamInfo,
    streamrequestlist,
    streamGuest,
    socket,
    hasRequestedStream,
    streamerList,
    isuserstreaming
}) => {
    const insets = useSafeAreaInsets();
    const insetsTop = useSafeAreaInsets();
    const screenHeight = Dimensions.get('window').height;
    const screenWidth = Dimensions.get('window').width;
    const [keyboardOffset, setKeyboardOffset] = useState(0);
    const [giftsData, setGiftItems] = useState([]);
    const { userData } = useAppContext()
    const [giftsCategoryData, setGiftCategoryItems] = useState([]);
    const [giftDataLoading, setGiftDataLoading] = useState(false);
    const [userChatInput, setUserChatInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [giftModalVisible, setGiftModalVisible] = useState(false);
    const [selectedGiftCategory, setSelectedGiftCategory] = useState('');
    const [openMoreSettingList, setOpenMoreSettingList] = useState(false);
    const scrollRef = useRef(null);
    const [showArrow, setShowArrow] = useState(true);
    const arrowAnim = useRef(new Animated.Value(0)).current;
    const animatedOpacity = useRef(new Animated.Value(0)).current;
    const animatedTranslateY = useRef(new Animated.Value(20)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const [showMicIcon, setShowMicIcon] = useState(false);
    const [streamLayout, setStreamLayout] = useState([]);
    const [closeStreamModal, setCloseStreamModal] = useState(false);
    const [userDetails, setUserDetails] = useState({});
    const [togglerequest, setTogglerequest] = useState(false);
    const [visibleModal, setVisibleModal] = useState(null);
    const [isLiked, setisLiked] = useState(false)
    const [message, setMessage] = useState(null);
    const blinkingAnim = useRef(new Animated.Value(1)).current;
    const scrollViewRef = useRef();
    // Function to fetch gifts from the API
    const getGiftsCategory = async () => {
        try {
            const response = await Apiclient.get('/getgifts');
            if (response) {
                setGiftCategoryItems(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching gifts:', error);
        }
    };

    useEffect(() => {
        getGiftsCategory();
    }, [giftModalVisible])

    useEffect(() => {
        // Scroll to the bottom when roomchat updates
        if (scrollViewRef.current) {
            scrollViewRef.current.scrollToEnd({ animated: true });
        }
    }, [roomchat]);

    // Function to fetch gifts from the API
    const getGifts = async () => {
        setGiftDataLoading(true);
        try {
            const response = await Apiclient.get(`/getgifts?giftValue=${selectedGiftCategory}`);
            if (response) {
                setGiftItems(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching gifts:', error);
        } finally {
            setGiftDataLoading(false);
        }
    };

    useEffect(() => {
        getGifts();
    }, [giftModalVisible, selectedGiftCategory]);

    useEffect(() => {
        if (giftsData?.length > 0) {
            const sortedByValue = [...giftsData].sort((a, b) => a.giftValue - b.giftValue);
            const uniqueGiftValues = [...new Set(sortedByValue.map(item => item.giftValue))];
            if (uniqueGiftValues.length > 0) {
                setSelectedGiftCategory(uniqueGiftValues[0]);
            }
        }
    }, [giftsData]);

    // Manage stream layout based on viewer count and streams
    useEffect(() => {
        const streams = [];
        remoteStreams.forEach(({ id, stream }) => {
            const hostInfo = streamerList.filter((item) => item.IsHost === true)
            const StreamerInfo = streamerList.find((streamer) => streamer.ID === id)
            if (stream && typeof stream.toURL === 'function') {
                if (hostInfo?.ID === id) {
                    console.log("IS Host");
                    streams.unshift({ type: 'remote', stream, userId: StreamerInfo?.UserID, Name: `${StreamerInfo?.Name} (HOST)` });
                } else {
                    streams.push({ type: 'remote', stream, userId: StreamerInfo?.UserID, Name: `${StreamerInfo?.Name}` });
                }
            } else {
                console.warn('⚠️ Invalid remote stream:', stream);
            }
        });
        // Add local stream if available and user is streaming
        if (localStream && isStreaming) {
            if (isHost) {
                streams.unshift({ type: 'local', stream: localStream, Name: `${userDetails?.screenName}` });
            } else {
                streams.push({ type: 'local', stream: localStream, Name: `${userDetails?.screenName} (You)` });
            }
        }
        console.log(streamerList);
        setStreamLayout(streams);
    }, [localStream, remoteStreams, isStreaming]);

    const getVideoTileStyle = (count) => {
        if (count === 1) {
            return { width: '100%', height: '100%' };
        } else if (count === 2) {
            return { width: '50%', height: '100%' };
        } else if (count <= 4) {
            return { width: '50%', height: '50%' };
        } else {
            return { width: '33.33%', height: '50%' };
        }
    };

    const confirmleaveRoom = () => {
        setCloseStreamModal(true);
    };

    // Handle keyboard events
    useEffect(() => {
        //    if(!isHost){
        if (streamInfo) {
            GetUserDetails(streamInfo?.hostID)
        }
        //    }
        const showSub = Keyboard.addListener('keyboardDidShow', (e) => {
            setKeyboardOffset(e.endCoordinates.height);
        });
        const hideSub = Keyboard.addListener('keyboardDidHide', () => {
            setKeyboardOffset(0);
        });

        return () => {
            showSub.remove();
            hideSub.remove();
        };
    }, []);

    const handleScroll = (event) => {
        const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
        const isAtEnd = contentOffset.x + layoutMeasurement.width >= contentSize.width - 20;
        setShowArrow(!isAtEnd);
    };

    // Arrow bounce animation
    useEffect(() => {
        if (showArrow) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(arrowAnim, {
                        toValue: 10,
                        duration: 500,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                    Animated.timing(arrowAnim, {
                        toValue: 0,
                        duration: 500,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        }
    }, [showArrow, arrowAnim, giftModalVisible]);

    // Handle more settings list animation
    useEffect(() => {
        if (openMoreSettingList) {
            Animated.parallel([
                Animated.timing(animatedOpacity, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(animatedTranslateY, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(animatedOpacity, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(animatedTranslateY, {
                    toValue: 20,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [openMoreSettingList, animatedOpacity, animatedTranslateY]);

    // Animate icon
    const animateIcon = () => {
        Animated.sequence([
            Animated.timing(scaleAnim, {
                toValue: 1.2,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start();
    };

    // Mic icon animation
    useEffect(() => {
        if (!isMuted?.muted) {
            setShowMicIcon(true);
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();

            const timeout = setTimeout(() => {
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }).start(() => {
                    setShowMicIcon(false);
                });
            }, 3000);

            return () => clearTimeout(timeout);
        }
    }, [isMuted?.muted, fadeAnim]);

    const HadleSendChat = () => {
        if (!userChatInput.trim()) {
            Alert.alert('Chat Error', 'Please enter a message before sending.', [{ text: 'OK' }]);
            return;
        }
        HandleChatmessages(userChatInput);
        setUserChatInput('');
    }

    const GetUserDetails = async (userid) => {
        try {
            const formData = { userid: userid };
            const response = await Apiclient.post('/getUserDetails', formData);
            if (response) {
                const user = response.data.user;
                setUserDetails(user);
            }
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        if (streamrequestlist.length > 0) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(blinkingAnim, {
                        toValue: 0,
                        duration: 500,
                        easing: Easing.linear,
                        useNativeDriver: true,
                    }),
                    Animated.timing(blinkingAnim, {
                        toValue: 1,
                        duration: 500,
                        easing: Easing.linear,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        } else {
            blinkingAnim.setValue(1); // reset if no requests
        }
    }, [streamrequestlist.length]);

    const HidesettingPanel = () => {
        setOpenMoreSettingList(false)
    }
    const ToggleLike = () => {
        if (isLiked) {
            socket.emit('Dislike-count')
            setisLiked(!isLiked)
        } else {
            setisLiked(!isLiked)
            socket.emit('like-count')
        }
    }

    // scoketevents
    const HandleLikeCount = (count) => {
        setStreamupdated((prev) => ({ ...prev, LikeCount: count }));
    }

    useEffect(() => {
        socket.on('like-count', HandleLikeCount)
        return () => {
            socket.off('like-count', HandleLikeCount)
        }
    }, [])

    const SendGift = async (item) => {
        try {
            const hostInfo = streamerList.filter((item) => item.IsHost === true)
            console.log(item);
            console.log(hostInfo);
            const params = {
                fromUserID: userData?.userid,
                toUserID: hostInfo[0].UserID,
                giftID: item?.giftID
            }
            console.log(params);
            const Responce = await Apiclient.post('/sendGifts', params)
            if (Responce.data) {
                if (Responce.data.success) {
                    socket.emit('Send-gift', userData?.screenName, item?.giftID)
                }
            }
        } catch (error) {
            console.log(error);
        }
    }
    const handleFriendRequest=async(userid)=>{
        try {
            const params={
                "requesterID": userData?.userid,
                "receiverID": userid
              }
              console.log(params);
            const responce=await Apiclient.post(`/friends/request`,params)
            if(responce){
                console.log(responce.data);
            }
        } catch (error) {
            SendErrorTotheServer(error,"handleFriendRequest")
        }
    }

    return (
        <View style={[styles.roomInfo]}>
            <View style={[styles.streamBox]}>
                {streamLayout.length === 1 ? (
                    <View style={styles.videoContainer}>
                        <RTCView
                            streamURL={streamLayout[0]?.stream.toURL()}
                            style={styles.fullScreenVideo}
                            objectFit="cover"
                            mirror={streamLayout[0]?.type === 'local' && isFrontCamera}
                        />
                        {streamLayout[0]?.type !== 'local' && (
                            <View style={styles.videoOverlay}>
                                <View style={styles.userInfoContainer}>
                                    <Text style={styles.userName}>
                                        {streamLayout[0]?.Name || streamLayout[0]?.Name || 'Unknown User'}
                                    </Text>
                                    <TouchableOpacity
                                        style={styles.friendRequestIcon}
                                    onPress={() => handleFriendRequest(streamLayout[0]?.userId)}
                                    >
                                        <Ionicons name="person-add" size={20} color="#fff" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                    </View>
                ) : (
                    <View style={[styles.streamVideosContainer]}>
                        {streamLayout.length === 3 ? (
                            <View style={styles.threeUserRow}>
                                <View style={styles.threeUserColumnLeft}>
                                    <RTCView
                                        streamURL={streamLayout[0].stream.toURL()}
                                        style={styles.streamVideoFull}
                                        objectFit="cover"
                                        mirror={streamLayout[0].type === 'local' && isFrontCamera}
                                    />
                                    {streamLayout[0]?.type !== 'local' && (
                                        <View style={styles.videoOverlay}>
                                            <View style={styles.userInfoContainer}>
                                                <Text style={styles.userName}>
                                                    {streamLayout[0]?.Name || streamLayout[0]?.Name || 'Unknown User'}
                                                </Text>
                                                <TouchableOpacity
                                                    style={styles.friendRequestIcon}
                                                onPress={() => handleFriendRequest(streamLayout[0]?.userId)}
                                                >
                                                    <Ionicons name="person-add" size={16} color="#fff" />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    )}
                                </View>
                                <View style={styles.threeUserColumnRight}>
                                    {streamLayout.slice(1, 3).map((streamData, index) => (
                                        <View key={streamData.type === 'local' ? 'local' : streamData.userId} style={{ flex: 1, position: 'relative' }}>
                                            <RTCView
                                                streamURL={streamData.stream.toURL()}
                                                style={styles.streamVideoHalf}
                                                objectFit="cover"
                                                mirror={streamData.type === 'local' && isFrontCamera}
                                            />
                                            {streamData?.type !== 'local' && (
                                                <View style={styles.videoOverlay}>
                                                    <View style={styles.userInfoContainer}>
                                                        <Text style={styles.userName}>
                                                            {streamData?.Name || streamData?.Name || 'Unknown User'}
                                                        </Text>
                                                        <TouchableOpacity
                                                            style={styles.friendRequestIcon}
                                                        onPress={() => handleFriendRequest(streamData?.userId)}
                                                        >
                                                            <Ionicons name="person-add" size={14} color="#fff" />
                                                        </TouchableOpacity>
                                                    </View>
                                                </View>
                                            )}
                                        </View>
                                    ))}
                                </View>
                            </View>
                        ) : streamLayout.length === 5 ? (
                            <View style={styles.fiveUserWrapper}>
                                <View style={styles.fiveUserRow}>
                                    {streamLayout.slice(0, 2).map((streamData, index) => (
                                        <View key={streamData.type === 'local' ? 'local' : streamData.userId} style={styles.fiveUserCol50}>
                                            <View style={styles.videoContainer}>
                                                <RTCView
                                                    streamURL={streamData.stream.toURL()}
                                                    style={styles.streamFiveUserVideo}
                                                    objectFit="cover"
                                                    mirror={streamData.type === 'local' && isFrontCamera}
                                                />
                                                {streamData?.type !== 'local' && (
                                                    <View style={styles.videoOverlay}>
                                                        <View style={styles.userInfoContainer}>
                                                            <Text style={styles.userName}>
                                                                {streamData?.Name || streamData?.Name || 'Unknown User'}
                                                            </Text>
                                                            <TouchableOpacity
                                                                style={styles.friendRequestIcon}
                                                            onPress={() => handleFriendRequest(streamData?.userId)}
                                                            >
                                                                <Ionicons name="person-add" size={14} color="#fff" />
                                                            </TouchableOpacity>
                                                        </View>
                                                    </View>
                                                )}
                                            </View>
                                        </View>
                                    ))}
                                </View>
                                <View style={styles.fiveUserRow}>
                                    {streamLayout.slice(2, 5).map((streamData, index) => (
                                        <View key={streamData.type === 'local' ? 'local' : streamData.userId} style={styles.fiveUserCol33}>
                                            <View style={styles.videoContainer}>
                                                <RTCView
                                                    streamURL={streamData.stream.toURL()}
                                                    style={styles.streamFiveUserVideo}
                                                    objectFit="cover"
                                                    mirror={streamData.type === 'local' && isFrontCamera}
                                                />
                                                {streamData?.type !== 'local' && (
                                                    <View style={styles.videoOverlay}>
                                                        <View style={styles.userInfoContainer}>
                                                            <Text style={styles.userName}>
                                                                {streamData?.Name || streamData?.Name || 'Unknown User'}
                                                            </Text>
                                                            <TouchableOpacity
                                                                style={styles.friendRequestIcon}
                                                            onPress={() => handleFriendRequest(streamData?.userId)}
                                                            >
                                                                <Ionicons name="person-add" size={12} color="#fff" />
                                                            </TouchableOpacity>
                                                        </View>
                                                    </View>
                                                )}
                                            </View>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        ) : (
                            <View style={[styles.streamVideosInnerGrid]}>
                                {streamLayout.map((streamData, index) => {
                                    return (
                                        <Fragment key={index}>
                                            <View style={[styles.videoContainer, getVideoTileStyle(streamLayout.length)]}>
                                                <RTCView
                                                    key={streamData.type === 'local' ? 'local' : streamData.userId}
                                                    streamURL={streamData.stream.toURL()}
                                                    style={[styles.streamVideo]}
                                                    objectFit="cover"
                                                    mirror={streamData.type === 'local' && isFrontCamera}
                                                />
                                                <View style={styles.videoOverlay}>
                                                    {streamData?.type !== 'local' && (
                                                        <View style={styles.userInfoContainer}>
                                                            <Text style={styles.userName}>
                                                                {streamData?.Name || streamData?.Name || 'Unknown User'}
                                                            </Text>
                                                            <TouchableOpacity
                                                                style={styles.friendRequestIcon}
                                                            onPress={() => handleFriendRequest(streamData?.userId)}
                                                            >
                                                                <Ionicons name="person-add" size={18} color="#fff" />
                                                            </TouchableOpacity>
                                                        </View>
                                                    )}
                                                </View>
                                            </View>
                                        </Fragment>
                                    );
                                })}
                            </View>
                        )}
                    </View>
                )}
                {isStreaming && (
                    <>
                        {showMicIcon && (
                            <Animated.View
                                pointerEvents="none"
                                style={[
                                    styles.strMuteOffIconBoxOverlay,
                                    { opacity: fadeAnim },
                                ]}
                            >
                                <Ionicons name="mic-off" size={180} color="#ccc" />
                            </Animated.View>
                        )}
                        <View style={[
                            styles.controls,
                            {
                                bottom: 0,
                                paddingBottom: insets.bottom > 0 ? insets.bottom : 0,
                                paddingTop: insetsTop.top > 0 ? insetsTop.top : 0,
                            },
                        ]}>
                            <View style={styles.strRoomHeader}>
                                <View style={styles.strRoomHeaderLeft}>
                                    <Image style={styles.strRoomHeaderLeftProfileImg} source={require('../../assets/images/LS-3.jpg')} />
                                    <View style={styles.strRoomHeaderLeftProfileInfo}>
                                        <Text style={[styles.strRoomHeaderLeftProfileName]}>
                                            {userDetails?.screenName}
                                        </Text>
                                        <View style={[styles.strRoomHeaderLeftProfileSubInfo]}>
                                            <Ionicons name="heart" solid size={14} color="#fff" />
                                            <Text style={[styles.strRoomHeaderLeftProfileSubText]}>{Streamupdated.LikeCount}</Text>
                                        </View>
                                    </View>
                                </View>
                                <View style={styles.strRoomHeaderRight}>
                                    <View style={styles.strRoomHeaderRWalletInfo}>
                                        <Image
                                            source={require('../../assets/images/icons/star.png')} // Adjust the path as needed
                                            style={{ width: 14, height: 14, marginRight: 4 }}
                                            resizeMode="contain"
                                        />
                                        <Text style={styles.strRoomHeaderRWalletInfoText}>1023</Text>
                                    </View>
                                    <TouchableOpacity onPress={confirmleaveRoom} style={styles.strRoomHeaderRIconBox}>
                                        <Ionicons name="close" size={30} color="#fff" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                            {/* <LinearGradient
                                colors={streamLayout.length > 1 ? ['#1d1d1d', '#1d1d1d'] : ['rgba(141, 124, 124, 0)', 'rgba(255, 255, 255, 0)']}
                                start={{ x: 0.5, y: 1 }}
                                end={{ x: 0.5, y: 0 }}
                                style={styles.strRoomFooter}
                            > */}
                                {!openMoreSettingList && (
                                    <>
                                        <View style={styles.strRoomFooterChatOrActionsBox}>
                                            <View style={[styles.streamChatContainer]}>
                                                <ScrollView
                                                    ref={scrollViewRef}
                                                    showsVerticalScrollIndicator={false}
                                                >
                                                    {roomchat.map((chat, ind) => (
                                                        <View key={ind} style={styles.streamChatItem}>
                                                            <Image style={styles.streamChatItemProfileImg} source={chat.userProfile} />
                                                            <View numberOfLines={1} style={styles.streamChatMessageBox}>
                                                                <Text numberOfLines={1} style={[styles.streamChatUserName, { color: `${chat?.TYPE === "USERJOINED" ? `#43bf83` : chat.TYPE === "USERLEFT" ? 'red' : `#FFFF33`}`, paddingTop: `${chat?.TYPE === "USERJOINED" ? `20` : `0`}` }]}>
                                                                    {chat.userName?.length > 30 ? chat.userName?.slice(0, 30) + '...' : chat?.userName}
                                                                </Text>
                                                                <Text numberOfLines={2} style={styles.streamChatMessage}>
                                                                    {chat.message?.length > 80 ? chat.message?.slice(0, 80) + '...' : chat?.message}
                                                                </Text>
                                                            </View>
                                                        </View>
                                                    ))}
                                                </ScrollView>
                                            </View>
                                            <View style={styles.strRoomFooterSocialActions}>
                                                <TouchableOpacity style={styles.streamViewerCount}>
                                                    <Ionicons name="eye-outline" size={18} color="#ffea23" />
                                                    <Text style={styles.streamViewerCountTitle}>{Streamupdated.viewerCount}</Text>
                                                </TouchableOpacity>
                                                {!isHost && (<>
                                                    <TouchableOpacity style={styles.strRoomFooterSocialActionsBtn}>
                                                        <Ionicons name="person-add" size={30} color="#fff" />
                                                    </TouchableOpacity>
                                                    <TouchableOpacity style={styles.strRoomFooterSocialActionsBtn} onPress={ToggleLike} disabled={isHost} >
                                                        <Ionicons name="heart" size={30} color={isLiked ? 'red' : '#fff'} />
                                                    </TouchableOpacity>
                                                </>)}
                                                <TouchableOpacity style={styles.strRoomFooterSocialActionsBtn}>
                                                    <Ionicons name="share-social-sharp" size={30} color="#fff" />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    </>
                                )}
                                {openMoreSettingList && (
                                    <Animated.View
                                        style={[
                                            styles.strMoreSettingListContainer,
                                            {
                                                opacity: animatedOpacity,
                                                transform: [{ translateY: animatedTranslateY }],
                                            },
                                        ]}
                                    >
                                        {isuserstreaming || isHost && (
                                            <TouchableOpacity onPress={() => {
                                                switchCamera();
                                                HidesettingPanel()
                                            }} style={styles.strMoreSettingListItem}>
                                                <Text style={styles.strMoreSettingListItemText}>Flip Camera</Text>
                                                <Ionicons name="camera-reverse" size={20} color="#fff" />
                                            </TouchableOpacity>
                                        )}
                                        {!isHost && (
                                            <TouchableOpacity onPress={() => {
                                                requestStreamPermission(),
                                                    HidesettingPanel(),
                                                    setVisibleModal('message-modal'),
                                                    setMessage('Request Send To the Host')
                                            }} style={styles.strMoreSettingListItem} disabled={hasRequestedStream}>
                                                <Text style={[styles.strMoreSettingListItemText, { color: hasRequestedStream ? '#007ACC' : 'white' }]}  >{hasRequestedStream ? "Already Requested" : 'Join As a Guest'}</Text>
                                                <MaterialCommunityIcons name="video-plus" size={21} color={`${hasRequestedStream ? '#007ACC' : 'white'}`} />
                                            </TouchableOpacity>
                                        )}
                                        {isuserstreaming || isHost && (<TouchableOpacity onPress={() => {
                                            toggleMute(),
                                                HidesettingPanel()
                                        }} style={styles.strMoreSettingListItem}>
                                            <Text style={styles.strMoreSettingListItemText}>Mute {!isMuted?.muted ? 'OFF' : 'ON'}</Text>
                                            {!isMuted?.muted ? <Ionicons name="mic" size={20} color="#fff" /> : <Ionicons name="mic-off" size={20} color="#fff" />}
                                        </TouchableOpacity>)}
                                    </Animated.View>
                                )}
                                <View style={[styles.strRoomBottomBox, { marginBottom: Platform.OS === 'android' ? keyboardOffset : 0 }]}>
                                    <TextInput
                                        placeholder=""
                                        placeholderTextColor="#414141"
                                        value={userChatInput}
                                        onChangeText={setUserChatInput}
                                        onFocus={() => setIsTyping(true)}
                                        onBlur={() => setIsTyping(false)}
                                        onSubmitEditing={HadleSendChat}
                                        style={styles.strRoomBottomBoxInput}
                                    />
                                    {keyboardOffset && isTyping ? (
                                        <TouchableOpacity onPress={() => HadleSendChat()} style={styles.strRoomBottomBoxIconBox}>
                                            <FontAwesome name="send" size={24} color="#00FF00" />
                                        </TouchableOpacity>
                                    ) : (
                                        <>
                                            <TouchableOpacity onPress={() => {
                                                animateIcon();
                                                setOpenMoreSettingList(!openMoreSettingList);
                                            }} style={styles.strRoomBottomBoxIconBox}>
                                                <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                                                    {openMoreSettingList ? <Ionicons name="close-outline" size={30} color="#fff" /> : <Ionicons name="add-outline" size={30} color="#fff" />}
                                                </Animated.View>
                                            </TouchableOpacity>
                                            {!isHost && (<>
                                                <TouchableOpacity onPress={() => setGiftModalVisible(true)} style={[styles.strRoomBottomBoxIconBox]}>
                                                    <Ionicons name="gift" size={30} color="#FF00FF" />
                                                </TouchableOpacity>
                                                <TouchableOpacity style={styles.strRoomBottomBoxIconBox}>
                                                    <Ionicons name="cart" size={30} color="#fff" />
                                                </TouchableOpacity>
                                            </>)}
                                            {isHost && (
                                                <TouchableOpacity onPress={() => setTogglerequest(!togglerequest)} style={styles.strRoomBottomBoxIconBox}>
                                                    <Ionicons name="people" size={30} color="#fff" />
                                                    {streamrequestlist.length > 0 && (
                                                        <Animated.View style={[globalStyles.notificationDot, { opacity: blinkingAnim }]} />
                                                    )}
                                                </TouchableOpacity>
                                            )}
                                        </>
                                    )}
                                </View>
                            {/* </LinearGradient> */}
                        </View>
                    </>
                )}
            </View>
            {giftModalVisible && !isHost && (
                <Modal
                    isVisible={giftModalVisible}
                    animationIn="slideInUp"
                    animationOut="slideOutDown"
                    animationInTiming={700}
                    animationOutTiming={500}
                    backdropOpacity={0.4}
                    style={[styles.halfScreenModalMain]}
                    useNativeDriver={true}
                >
                    <View style={[styles.halfScreenModalOverlay]}>
                        <View style={{ maxHeight: screenHeight * 0.5 }}>
                            <View style={{ flexDirection: "row", justifyContent: 'flex-end', marginBottom: 5 }}>
                                <TouchableOpacity
                                    onPress={() => setGiftModalVisible(false)}
                                    style={[styles.modalCloseBtn]}
                                >
                                    <Ionicons name="close" size={22} color="#333" />
                                </TouchableOpacity>
                            </View>
                            <View style={styles.giftModalCategoryMainLayout}>
                                <ScrollView
                                    ref={scrollRef}
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    onScroll={handleScroll}
                                    scrollEventThrottle={16}
                                >
                                    <View style={styles.giftModalCategoryContainer}>
                                        {Array.from(
                                            new Map(
                                                giftsCategoryData
                                                    .sort((a, b) => a.giftValue - b.giftValue)
                                                    .map(gift => [gift.giftValue, gift])
                                            ).values()
                                        ).map((category, index) => {
                                            const isSelected = selectedGiftCategory === category.giftValue;
                                            return (
                                                <TouchableOpacity key={index}
                                                    onPress={() => setSelectedGiftCategory(category.giftValue)}
                                                    style={[
                                                        styles.giftModalCatTab,
                                                        isSelected && styles.giftModalCatTabActive,
                                                    ]}
                                                >
                                                    <Text style={[styles.giftModalCatTabText, isSelected && styles.giftModalCatTabActiveText]}>{category.giftValue}</Text>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>
                                </ScrollView>
                                {giftModalVisible && showArrow && (
                                    <Animated.View
                                        style={[
                                            styles.giftModalCatRightArrow,
                                            { transform: [{ translateX: arrowAnim }] },
                                        ]}
                                        pointerEvents="none"
                                    >
                                        <Ionicons name="chevron-forward" size={16} color="#fff" />
                                    </Animated.View>
                                )}
                            </View>
                            <View style={[styles.giftModalItemsMainLayout]}>
                                {giftsData.length > 0 ? (
                                    <ScrollView
                                        showsVerticalScrollIndicator={true}
                                        indicatorStyle="#d9d9d9"
                                    >
                                        <View style={styles.giftModalCategoryItemsContainer}>
                                            {giftDataLoading ? (
                                                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', height: 150, width: '100%' }}>
                                                    <ActivityIndicator size="large" />
                                                </View>
                                            ) : giftsData.map((item, index) => {
                                                const localImage = giftImages[item.giftIcon];
                                                if (!localImage) return null;
                                                return (
                                                    <TouchableOpacity key={index}
                                                        style={styles.giftModalCatItem}
                                                        onPress={() => SendGift(item)}
                                                    >
                                                        <FastImage
                                                            style={[styles.giftModalCatItemImage]}
                                                            source={localImage}
                                                            resizeMode={FastImage.resizeMode.contain}
                                                        />
                                                    </TouchableOpacity>
                                                );
                                            })}
                                        </View>
                                    </ScrollView>
                                ) : (
                                    <View style={styles.noGiftsTextContainer}>
                                        <Text style={styles.noGiftsTextContent}>No gifts available for this category</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    </View>
                </Modal>
            )}
            {visibleModal === 'message-modal' && (
                <MessageModal
                    visible={visibleModal === 'message-modal'}
                    message={message}
                    onClose={() => setVisibleModal(null)}
                />
            )}
            {isHost && <RequestModal visible={togglerequest} onClose={() => setTogglerequest(false)} StreamRequestList={streamrequestlist} streamGuest={streamGuest} socket={socket} />}
            {/* close stream modal  */}
            {closeStreamModal && (
                <ConfirmModal visible={closeStreamModal} onClose={() => setCloseStreamModal(false)} leaveRoom={leaveRoom} />
            )}
        </View>
    );
};

export default StreamRoom;