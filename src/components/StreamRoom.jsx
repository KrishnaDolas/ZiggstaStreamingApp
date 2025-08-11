/* eslint-disable react-native/no-inline-styles */
import {
    View, Text, TouchableOpacity, Alert, Image, ScrollView, Dimensions, TextInput, Keyboard, Animated,
    Easing,
    ActivityIndicator, Platform,
    Pressable, BackHandler,
    ImageBackground
} from 'react-native';
import KeepAwake from 'react-native-keep-awake';
import { styles, themeStyles } from '../../assets/styles/ThemeStyles';
import { RTCView } from 'react-native-webrtc';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import React, { Fragment, useCallback, useContext, useEffect, useRef, useState } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import Modal from 'react-native-modal';
import FastImage from 'react-native-fast-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Apiclient from '../utils/Apiclient';
import { ConfirmModal } from '../modals/ConfirmModal';
import RequestModal from '../modals/RequestModal';
import MessageModal from '../modals/MessageModal';
import { useAppContext } from '../context/AppContext';
import ReportUserModal from '../modals/ReportUserModal';
import { getGenderFallbackImage, giftImages, SendErrorTotheServer, socket } from '../utils/constant';
import ViewerTotalLIst from '../modals/ViewerTotalLIst';
import { GiftReceiveAnimation, GiftSendAnimation } from './GiftSendAnimation';
import ProfileScreenModal from '../modals/ProfileScreenModal';
import Sound from 'react-native-sound';
import AnimatedNotification from './AnimatedNotification';
import { ThemeContext } from '../context/ThemeContext';
import GiftIcon from '../../assets/images/icons/icon_gift.png'
import bgImage from '../../assets/images/icons/name_bg.png'
import AudioSpectrum from './AudioSpectrum';
import LuckyWheelModal from '../modals/LuckyWheelModal';

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
    hasRequestedStream,
    streamerList,
    streammsg,
    totalGiftValue
}) => {
    const insets = useSafeAreaInsets();
    const { theme } = useContext(ThemeContext);
    const screenHeight = Dimensions.get('window').height;
    const [keyboardOffset, setKeyboardOffset] = useState(0);
    const [giftsData, setGiftItems] = useState([]);
    const { userData, setIsInStreamRoom } = useAppContext()
    const [giftsCategoryData, setGiftCategoryItems] = useState([]);
    const [giftDataLoading, setGiftDataLoading] = useState(false);
    const [userChatInput, setUserChatInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [giftModalVisible, setGiftModalVisible] = useState(false);
    const [selectedGiftCategory, setSelectedGiftCategory] = useState('');
    const [openMoreSettingList, setOpenMoreSettingList] = useState(false);
    const [showTooltip, setShowTooltip] = useState(true);
    const scrollRef = useRef(null);
    const [showArrow, setShowArrow] = useState(true);
    const arrowAnim = useRef(new Animated.Value(0)).current;
    const animatedOpacity = useRef(new Animated.Value(0)).current;
    const animatedTranslateY = useRef(new Animated.Value(20)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const [streamLayout, setStreamLayout] = useState([]);
    const [closeStreamModal, setCloseStreamModal] = useState(false);
    const [userDetails, setUserDetails] = useState({});
    const [togglerequest, setTogglerequest] = useState(false);
    const [visibleModal, setVisibleModal] = useState(null);
    const [OpenViewerLIst, setOpenViewerList] = useState(false)
    const [isLiked, setisLiked] = useState(false)
    const [message, setMessage] = useState(null);
    const [openChatUserProfile, setOpenChatUserProfile] = useState(false);
    const [GiftSenderData, setGiftSendData] = useState({ userName: '', userId: '' })
    const [SelectedUser, setSelectedUser] = useState({});
    const [OpenHostPorfile, setOpenHostPorfile] = useState(false)
    const [showSendAnimation, setShowSendAnimation] = useState(false);
    const [showReceiveAnimation, setShowReceiveAnimation] = useState(false);
    const [sendAnimationData, setSendAnimationData] = useState(null);
    const [receiveAnimationData, setReceiveAnimationData] = useState(null);
    const [showUI, setShowUI] = useState(true);
    const [myFriendList,setMyFriendList] = useState([]);
    const [notification, setNotification] = useState({
        isVisible: false,
        message: '',
        type: 'info',
    });
    const scaleAnim1 = useRef(new Animated.Value(0)).current;
    const opacityAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (showTooltip) {
            Animated.loop(
                Animated.sequence([
                    Animated.parallel([
                        Animated.timing(scaleAnim1, {
                            toValue: 2.6,          // how big the ring grows
                            duration: 1500,
                            useNativeDriver: true,
                        }),
                        Animated.timing(opacityAnim, {
                            toValue: 0.5,          // fade out
                            duration: 1500,
                            useNativeDriver: true,
                        }),
                    ]),
                    Animated.parallel([
                        Animated.timing(scaleAnim1, {
                            toValue: 0,
                            duration: 0,
                            useNativeDriver: true,
                        }),
                        Animated.timing(opacityAnim, {
                            toValue: 1,
                            duration: 0,
                            useNativeDriver: true,
                        }),
                    ]),
                ])
            ).start();
        }
    }, [scaleAnim1, opacityAnim, showTooltip]);


    useEffect(() => {
        setIsInStreamRoom(true); // keep global value in sync

        const backAction = () => {
            Alert.alert(
                "Close Stream",
                "Do you want to close The stream ?",
                [
                    { text: "Cancel", onPress: () => null, style: "cancel" },
                    {
                        text: "Yes", onPress: () => {
                            leaveRoom()
                        }
                    }
                ]
            );
            return true; // Prevent default back button behavior
        };

        const backHandler = BackHandler.addEventListener(
            "hardwareBackPress",
            backAction
        );

        return () => backHandler.remove(); // Cleanup on unmount

    }, []);

    const scrollViewRef = useRef();
    // Function to fetch gifts from the API
    const getGiftsCategory = async () => {
        try {
            const response = await Apiclient.get('/getgifts');
            if (response) {
                setGiftCategoryItems(response.data.data || []);
            }
        } catch (error) {
            SendErrorTotheServer(error, "getGiftsCategory")
        }
    };
    useEffect(() => {
        // Preload all images
        Object.values(giftImages).forEach((img) => {
            // require returns a number (packaged asset), but Image.resolveAssetSource gives URI
            const source = Image.resolveAssetSource(img).uri;
            Image.prefetch(source);
        });
        KeepAwake.activate(); // Prevent screen from sleeping

        return () => {
            console.log("unmounting");
            KeepAwake.deactivate();
        }
    }, []);

    const showNotification = (message, type = 'info') => {
        setNotification({
            isVisible: true,
            message,
            type,
        });
    };
    const hideNotification = () => {
        setNotification({
            isVisible: false,
            message: '',
            type: 'info',
        });
    };
    useEffect(() => {
        getGiftsCategory();
    }, [giftModalVisible])

    useEffect(() => {
        // Scroll to the bottom when roomchat updates
        if (scrollViewRef.current) {
            scrollViewRef.current.scrollToEnd({ animated: true });
        }
        if (!showUI) {
            setShowUI(true)
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
            SendErrorTotheServer(error, "getGifts")
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
        remoteStreams.forEach(({ id, stream, isSpeaking, audioLevel }) => {
            const hostInfo = streamerList.find((item) => item.IsHost === true)
            const StreamerInfo = streamerList.find((streamer) => streamer.ID === id)
            let Alevel = audioLevel || 0.04
            if (stream && typeof stream.toURL === 'function') {
                const isFriend = myFriendList.some(friend => friend?.userid === StreamerInfo?.UserID);
                if (hostInfo?.ID === id) {
                    streams.unshift({ type: 'remote', stream,isFriend:isFriend, userId: StreamerInfo?.UserID, isMuted: StreamerInfo?.isMuted, Name: `${StreamerInfo?.Name}`, isSpeaking: isSpeaking, audioLevel: Alevel });
                } else {
                    streams.push({ type: 'remote', stream,isFriend:isFriend, userId: StreamerInfo?.UserID, isMuted: StreamerInfo?.isMuted, Name: `${StreamerInfo?.Name}`, isSpeaking: isSpeaking, audioLevel: Alevel });
                }
            } else {
                SendErrorTotheServer('⚠️ Invalid remote stream:', "remoteStreams.forEach")
            }
        });
        // Add local stream if available and user is streaming
        if (localStream && isStreaming) {
            const StreamerInfo = streamerList.find((streamer) => streamer.ID === socket.id)
            if (isHost) {
                streams.unshift({ type: 'local', stream: localStream, isMuted: StreamerInfo?.isMuted, Name: `${userDetails?.screenName}` });
            } else {
                streams.push({ type: 'local', stream: localStream, isMuted: StreamerInfo?.isMuted, Name: `${userDetails?.screenName} (You)` });
            }
        }
        setStreamLayout(streams);
    }, [localStream, remoteStreams, streamerList, isStreaming,myFriendList]);

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
            HidesettingPanel()
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
                setGiftSendData({ userName: user?.screenName, userId: user?.userid })
                console.log("User Details:", user);
            }
        } catch (error) {
            SendErrorTotheServer(error, 'GetUserDetails')
        }
    }

    useEffect(() => {
        if (streamrequestlist.length > 0) {
            setShowUI(true)
            showNotification("Someone wants to join as a guest", "")
            playNotification()
            setShowTooltip(true)
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
    const playGiftSound = () => {
        try {
            const sound = new Sound('gift_received.mp3', Sound.MAIN_BUNDLE, (error) => {
                if (error) {
                    console.log('Failed to load sound', error);
                    return;
                }
                sound.play(() => {
                    sound.release();
                });
            });
        } catch (error) {
            console.log(error);
        }
    };
    const playNotification = () => {
        try {
            const sound = new Sound('join_request_alert.mp3', Sound.MAIN_BUNDLE, (error) => {
                if (error) {
                    console.log('Failed to load sound', error);
                    return;
                }
                sound.play(() => {
                    sound.release();
                });
            });
        } catch (error) {
            console.log(error);
        }
    };

    const HandleReport = () => {
        setVisibleModal('ReportVideo')
    }

    const HandleLikeCount = (count) => {
        setStreamupdated((prev) => ({ ...prev, LikeCount: count }));
    }

    const HandleGiftReceived = (senderName, receiverName, giftName) => {
        try {
            if (userData?.screenName === senderName) return
            playGiftSound()
            console.log(receiverName);
            setReceiveAnimationData({
                giftName: giftName,
                senderName: senderName,
                ReceiverName: receiverName
            });
            setShowReceiveAnimation(true);
        } catch (error) {
            SendErrorTotheServer(error, "HandleGiftReceived")
        }
    }
    const getFriendsData = useCallback(async () => {
        if (!userData.userid) return
        try {
            const postData = {
                userId: userData.userid,
                isBlocked:0,
            };

            const response = await Apiclient.post('/getFriendsList', postData);
            console.log('response getFriendsList', response.data);
            if (response.status === 200) {
                const data = response.data?.friends || [];
                console.log(data);
                setMyFriendList(data);
            }
        } catch (error) {
            SendErrorTotheServer(error, 'getFriendsList');
        }
    }, []);

    useEffect(() => {
        getFriendsData();
        socket.on('like-count', HandleLikeCount)
        socket.on('received-Gift', HandleGiftReceived)
        return () => {
            socket.off('like-count', HandleLikeCount)
            socket.off('received-Gift', HandleGiftReceived)
        }
    }, [])

    const SendGift = async (item) => {
        try {
            if (!GiftSenderData) return;
            console.log(GiftSenderData);
            const params = {
                fromUserID: userData?.userid,
                toUserID: GiftSenderData.userId,
                giftID: item?.giftID,
                roomId: streamInfo?.roomID
            }
            const Responce = await Apiclient.post('/sendGifts', params)
            if (Responce.data) {
                if (Responce.data.success) {
                    if (streamInfo?.hostID === GiftSenderData.userId) {
                        socket.emit('Send-gift', userData?.screenName, true, GiftSenderData.userName, item?.giftIcon, item?.giftValue)
                    } else {
                        socket.emit('Send-gift', userData?.screenName, false, GiftSenderData.userName, item?.giftIcon, item?.giftValue)
                    }

                    setSendAnimationData({
                        giftName: item?.giftIcon,
                        recipientName: GiftSenderData.userName
                    });
                    setShowSendAnimation(true);
                    setGiftModalVisible(false);
                } else if (Responce.data.message) {
                    setMessage(Responce.data.message)
                    setVisibleModal('message-modal')
                    setGiftModalVisible(false);
                }
            }
        } catch (error) {
            SendErrorTotheServer(error, "SendGift")
        }
    }
    const HnadleSendGiftToCoHost = (UserID, UserName) => {
        setGiftSendData({ userName: UserName, userId: UserID })
        console.log(UserID, UserName);
        setGiftModalVisible(true)
    }
    const handleFriendRequest = async (userid) => {
        try {
            if (!userData?.userid || !userid) {
                socket.emit('Clientlogs', "handleFriendRequest", `userData?.userid--${userData?.userid}, userid--${userid}`);
                return;
            }
            const params = {
                requesterID: userData?.userid,
                receiverID: userid
            }
            const responce = await Apiclient.post(`/friends/request`, params)
            if (responce.data?.success) {
                setMessage(`Request Sent To ${userDetails?.screenName}`)
                setVisibleModal('message-modal')
            } else {
                setMessage(`${responce.data?.message || 'Request Already Sent'}`) // Handle case where message is not provided
                setVisibleModal('message-modal')
            }
        } catch (error) {
            SendErrorTotheServer(error, "handleFriendRequest")
        }
    }
    useEffect(() => {
        if (streammsg !== null) {
            setMessage(streammsg)
            setVisibleModal('message-modal')
        }
    }, [streammsg])

    const handleSendAnimationComplete = () => {
        setShowSendAnimation(false);
        setSendAnimationData(null);
    };

    const handleReceiveAnimationComplete = () => {
        setShowReceiveAnimation(false);
        setReceiveAnimationData(null);
    };

    const HandleOpenChatUserProfile = (data) => {
        setOpenChatUserProfile(!openChatUserProfile)
        setSelectedUser(data)
    }
    const HandleShowUi = () => {
        setShowUI(!showUI)
        console.log("Pressed")
    }

    return (
        <Pressable onPress={HandleShowUi}>
            <View style={[styles.streamBox]}>
                {streamLayout.length === 1 ? (
                    <View style={styles.videoContainer}>
                        <RTCView
                            streamURL={streamLayout[0]?.stream.toURL()}
                            style={styles.fullScreenVideo}
                            objectFit="cover"
                            mirror={streamLayout[0]?.type === 'local' && isFrontCamera}
                        />
                        <View style={{ position: 'absolute', left: '40%', top: '40%' }}>
                            <Text>{streamLayout[0]?.isMuted && showUI && <Ionicons name="mic-off" size={100} color="#fff" />}</Text>
                        </View>
                        {streamLayout[0]?.type !== 'local' && streamLayout[0]?.audioLevel > 0 && (
                            <View style={{
                                position: 'absolute',
                                top: showUI ? 90 : 10,
                                left: 10,
                                right: 10,
                                alignItems: 'start',
                            }}>
                                <AudioSpectrum
                                    audioLevel={streamLayout[0]?.audioLevel}
                                    streamLayout={streamLayout}
                                />
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
                                    <View style={{ position: 'absolute', left: '40%', top: '50%' }}>
                                        <Text>{streamLayout[0]?.isMuted && showUI && <Ionicons name="mic-off" size={40} color="#fff" />}</Text>
                                    </View>
                                    {streamLayout[0]?.type !== 'local' && streamLayout[0]?.audioLevel > 0 && (
                                        <View style={{
                                            position: 'absolute',
                                            bottom: showUI ? 60 : 10,
                                            left: 10,
                                            right: 10,
                                            alignItems: 'center',
                                        }}>
                                            <AudioSpectrum
                                                audioLevel={streamLayout[0]?.audioLevel}
                                                streamLayout={streamLayout}
                                            />
                                        </View>
                                    )}
                                    {streamLayout[0]?.type !== 'local' && showUI && (
                                        <View style={styles.videoOverlay}>
                                            <ImageBackground
                                                source={bgImage}
                                                style={{ padding: 3 }}
                                            >
                                                <View style={styles.userInfoContainer}>
                                                    <TouchableOpacity
                                                        onPress={() => HnadleSendGiftToCoHost(streamLayout[0]?.userId, streamLayout[0]?.Name)}
                                                    >
                                                        <Image source={GiftIcon} height={35} width={35} />
                                                    </TouchableOpacity>
                                                    <Text style={styles.userName}>
                                                        {streamLayout[0]?.Name || streamLayout[0]?.Name || 'Unknown User'}
                                                    </Text>
                                                        <TouchableOpacity
                                                            style={styles.friendRequestIcon}
                                                            disabled={streamLayout[0]?.isFriend}
                                                            onPress={() => handleFriendRequest(streamLayout[0]?.userId)}
                                                        >
                                                            {streamLayout[0]?.isFriend ? (
                                                                <Ionicons name="person-remove" size={18} color="green" />
                                                            ) : (
                                                                <Ionicons name="person-add" size={18} color="#fff" />)}
                                                        </TouchableOpacity>
                                                </View>
                                            </ImageBackground>
                                        </View>
                                    )}
                                </View>
                                <View style={styles.threeUserColumnRight}>
                                    {streamLayout.slice(1, 3).map((streamData, index) => (
                                        <View key={index} style={{ flex: 1, position: 'relative' }}>
                                            <RTCView
                                                streamURL={streamData.stream.toURL()}
                                                style={styles.streamVideoHalf}
                                                objectFit="cover"
                                                mirror={streamData.type === 'local' && isFrontCamera}
                                            />
                                            <View style={{ position: 'absolute', left: '40%', top: '40%' }}>
                                                <Text>{streamData?.isMuted && showUI && <Ionicons name="mic-off" size={40} color="#fff" />}</Text>
                                            </View>
                                            {streamData?.type !== 'local' && streamData?.audioLevel > 0 && (
                                                <View style={{
                                                    position: 'absolute',
                                                    bottom: showUI ? 60 : 10,
                                                    left: 10,
                                                    right: 10,
                                                    alignItems: 'center',
                                                }}>
                                                    <AudioSpectrum
                                                        audioLevel={streamData.audioLevel}
                                                        streamLayout={streamLayout}
                                                    />
                                                </View>
                                            )}
                                            {streamData?.type !== 'local' && showUI && (
                                                <View style={styles.videoOverlay}>
                                                    <ImageBackground
                                                        source={bgImage}
                                                        style={{ padding: 3 }}
                                                    >
                                                        <View style={styles.userInfoContainer}>
                                                            <TouchableOpacity
                                                                onPress={() => HnadleSendGiftToCoHost(streamData?.userId, streamData?.Name)}
                                                            >
                                                                <Image source={GiftIcon} height={25} width={25} />
                                                            </TouchableOpacity>
                                                            <Text style={styles.userName}>
                                                                {streamData?.Name || streamData?.Name || 'Unknown User'}
                                                            </Text>
                                                            <TouchableOpacity
                                                                style={styles.friendRequestIcon}
                                                                disabled={streamData?.isFriend}
                                                                onPress={() => handleFriendRequest(streamData?.userId)}
                                                            >
                                                                {streamData?.isFriend ? (
                                                                <Ionicons name="person-remove" size={18} color="green" />
                                                            ) : (
                                                                <Ionicons name="person-add" size={18} color="#fff" />)}
                                                            </TouchableOpacity>
                                                        </View>
                                                    </ImageBackground>
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
                                        <View key={index} style={styles.fiveUserCol50}>
                                            <View style={styles.videoContainer}>
                                                <RTCView
                                                    streamURL={streamData.stream.toURL()}
                                                    style={styles.streamFiveUserVideo}
                                                    objectFit="cover"
                                                    mirror={streamData.type === 'local' && isFrontCamera}
                                                />
                                                <View style={{ position: 'absolute', left: '40%', top: '40%' }}>
                                                    <Text>{streamData?.isMuted && showUI && <Ionicons name="mic-off" size={40} color="#fff" />}</Text>
                                                </View>
                                                {streamData?.type !== 'local' && streamData?.audioLevel > 0 && (
                                                    <View style={{
                                                        position: 'absolute',
                                                        bottom: showUI ? 60 : 10,
                                                        left: 10,
                                                        right: 10,
                                                        alignItems: 'center',
                                                    }}>
                                                        <AudioSpectrum
                                                            audioLevel={streamData.audioLevel}
                                                            streamLayout={streamLayout}
                                                        />
                                                    </View>
                                                )}
                                                {streamData?.type !== 'local' && showUI && (
                                                    <View style={styles.videoOverlay}>
                                                        <ImageBackground
                                                            source={bgImage}
                                                            style={{ padding: 3 }}
                                                        >
                                                            <View style={styles.userInfoContainer}>
                                                                <TouchableOpacity
                                                                    onPress={() => HnadleSendGiftToCoHost(streamData?.userId, streamData?.Name)}
                                                                >
                                                                    <Image source={GiftIcon} style={{ height: '35', width: '35' }} />
                                                                </TouchableOpacity>
                                                                <Text style={styles.userName}>
                                                                    {streamData?.Name || streamData?.Name || 'Unknown User'}
                                                                </Text>
                                                                <TouchableOpacity
                                                                    style={styles.friendRequestIcon}
                                                                    disabled={streamData?.isFriend}
                                                                    onPress={() => handleFriendRequest(streamData?.userId)}
                                                                >
                                                                    {streamData?.isFriend ? (
                                                                        <Ionicons name="person-remove" size={16} color="green" />
                                                                    ) : (
                                                                        <Ionicons name="person-add" size={16} color="#fff" />)}
                                                                </TouchableOpacity>
                                                            </View>
                                                        </ImageBackground>
                                                    </View>
                                                )}
                                            </View>
                                        </View>
                                    ))}
                                </View>
                                <View style={styles.fiveUserRow}>
                                    {streamLayout.slice(2, 5).map((streamData, index) => (
                                        <View key={index} style={styles.fiveUserCol33}>
                                            <View style={styles.videoContainer}>
                                                <RTCView
                                                    streamURL={streamData.stream.toURL()}
                                                    style={styles.streamFiveUserVideo}
                                                    objectFit="cover"
                                                    mirror={streamData.type === 'local' && isFrontCamera}
                                                />
                                                <View style={{ position: 'absolute', left: '40%', top: '40%' }}>
                                                    <Text>{streamData?.isMuted && showUI && <Ionicons name="mic-off" size={40} color="#fff" />}</Text>
                                                </View>
                                                {streamData?.type !== 'local' && streamData?.audioLevel > 0 && (
                                                    <View style={{
                                                        position: 'absolute',
                                                        bottom: showUI ? 60 : 10,
                                                        left: 10,
                                                        right: 10,
                                                        alignItems: 'center',
                                                    }}>
                                                        <AudioSpectrum
                                                            audioLevel={streamData.audioLevel}
                                                            streamLayout={streamLayout}
                                                        />
                                                    </View>
                                                )}
                                                {streamData?.type !== 'local' && showUI && (
                                                    <View style={styles.videoOverlay}>
                                                        <ImageBackground
                                                            source={bgImage}
                                                            style={{ padding: 3 }}
                                                        >
                                                            <View style={styles.userInfoContainer}>
                                                                <TouchableOpacity
                                                                    onPress={() => HnadleSendGiftToCoHost(streamData?.userId, streamData?.Name)}
                                                                >
                                                                    <Image source={GiftIcon} style={{ height: '25', width: '25' }} />
                                                                </TouchableOpacity>
                                                                <Text style={styles.userName}>
                                                                    {streamData?.Name || streamData?.Name || 'Unknown User'}
                                                                </Text>
                                                                <TouchableOpacity
                                                                    style={styles.friendRequestIcon}
                                                                    disabled={streamData?.isFriend}
                                                                    onPress={() => handleFriendRequest(streamData?.userId)}
                                                                >
                                                                    {streamData?.isFriend ? (
                                                                        <Ionicons name="person-remove" size={16} color="green" />
                                                                    ) : (
                                                                        <Ionicons name="person-add" size={16} color="#fff" />)}
                                                                </TouchableOpacity>
                                                            </View>
                                                        </ImageBackground>
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
                                                <View style={{ position: 'absolute', left: '40%', top: '40%' }}>
                                                    <Text>{streamData?.isMuted && showUI && <Ionicons name="mic-off" size={streamLayout.length == 6 || streamLayout.length == 4 ? 40 : 80} color="#fff" />}</Text>
                                                </View>
                                                {streamData?.type !== 'local' && streamData?.audioLevel > 0 && (
                                                    <View style={{
                                                        position: 'absolute',
                                                        bottom: showUI ? 60 : 10,
                                                        left: 10,
                                                        right: 10,
                                                        alignItems: 'center',
                                                    }}>
                                                        <AudioSpectrum
                                                            audioLevel={streamData.audioLevel}
                                                            streamLayout={streamLayout}
                                                        />
                                                    </View>
                                                )}
                                                <View style={styles.videoOverlay}>
                                                    {streamData?.type !== 'local' && showUI && (
                                                        <ImageBackground
                                                            source={bgImage}
                                                            style={{ padding: 3 }}
                                                        >
                                                            <View style={styles.userInfoContainer}>
                                                                <TouchableOpacity
                                                                    onPress={() => HnadleSendGiftToCoHost(streamData?.userId, streamData?.Name)}
                                                                >
                                                                    <Image source={GiftIcon} height={35} width={35} />
                                                                </TouchableOpacity>
                                                                <Text style={styles.userName}>
                                                                    {streamData?.Name || streamData?.Name || 'Unknown User'}
                                                                </Text>
                                                                <TouchableOpacity
                                                                    style={styles.friendRequestIcon}
                                                                    disabled={streamData?.isFriend}
                                                                    onPress={() => handleFriendRequest(streamData?.userId)}
                                                                >
                                                                    {streamData?.isFriend ? (
                                                                        <Ionicons name="person-remove" size={streamLayout.length == 6 || streamLayout.length == 4 ? 16 : 20} color="green" />
                                                                    ) : (
                                                                        <Ionicons name="person-add" size={streamLayout.length == 6 || streamLayout.length == 4 ? 16 : 20} color="#fff" />)}
                                                                </TouchableOpacity>
                                                            </View>
                                                        </ImageBackground>
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
                        {showUI && (<View style={styles.strRoomHeader}>
                            <Pressable onPress={() => setOpenHostPorfile(!OpenHostPorfile)}>
                                <View style={styles.strRoomHeaderLeft}>
                                    <Image style={styles.strRoomHeaderLeftProfileImg}
                                        source={!userDetails?.avatar || userDetails?.avatar === 'default' ? getGenderFallbackImage(userDetails?.gender) : { uri: userDetails?.avatar }} />
                                    <View style={styles.strRoomHeaderLeftProfileInfo}>
                                        <Text style={[styles.strRoomHeaderLeftProfileName]}>
                                            {userDetails?.screenName}
                                        </Text>
                                        <View style={[styles.strRoomHeaderLeftProfileSubInfo]}>
                                            <Ionicons name="star" solid size={14} color="#fff" />
                                            <Text style={[styles.strRoomHeaderLeftProfileSubText]}>0</Text>
                                        </View>
                                    </View>
                                </View>
                            </Pressable>
                            <View style={{ height: '35', position: 'absolute', left: '10', top: '55', display: 'flex' }}>
                                <TouchableOpacity onPress={() => {
                                    setOpenViewerList(true)
                                    socket.emit('RoomTotalCount')
                                }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(36, 32, 32, 0.75)', width: '100%', height: '25', margin: '5', borderRadius: 21 }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: '5' }}>
                                            <Ionicons name="heart" size={15} color={Streamupdated.LikeCount === 0 ? "white" : "red"} />
                                            <Text style={{ color: 'white', paddingLeft: '5' }}>{Streamupdated.LikeCount}</Text>
                                        </View>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: '6' }}>
                                            <Ionicons name="eye" size={15} color="#1F85F5" />
                                            <Text style={{ color: '#1F85F5', paddingLeft: '5' }}>{Streamupdated.TotalViewerCount}</Text>
                                        </View>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: '6' }}>
                                            {isHost && (<>
                                                <Ionicons name="eye" size={15} color="#00BD35" />
                                                <Text style={{ color: '#00BD35', paddingLeft: '5' }}>{Streamupdated.viewerCount}</Text>
                                            </>)}
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.strRoomHeaderRight}>
                                <View style={styles.strRoomHeaderRWalletInfo}>
                                    <Image
                                        source={require('../../assets/images/icons/star.png')} // Adjust the path as needed
                                        style={{ width: 14, height: 14, marginRight: 4 }}
                                        resizeMode="contain"
                                    />
                                    <Text style={styles.strRoomHeaderRWalletInfoText}>{totalGiftValue}</Text>
                                </View>
                                <TouchableOpacity onPress={confirmleaveRoom} style={styles.strRoomHeaderRIconBox}>
                                    <Ionicons name="close" size={30} color="#fff" />
                                </TouchableOpacity>
                            </View>
                        </View>)}
                        <LinearGradient
                            colors={streamLayout.length === 1 ? ['rgba(8, 8, 8, 1)', 'rgba(8, 8, 8, 0)'] : ['#1d1d1d', '#1d1d1d']}
                            start={{ x: 0.5, y: showUI ? 1 : 0 }}
                            end={{ x: 0.5, y: 0 }}
                            style={[styles.strRoomFooter, { bottom: insets.bottom > 3 ? insets.bottom : 0 }]}
                        >
                            <>
                                <View style={[styles.strRoomFooterChatOrActionsBox, { display: openMoreSettingList ? 'none' : 'flex' }]}>
                                    <View style={[styles.streamChatContainer]}>
                                        <ScrollView
                                            ref={scrollViewRef}
                                            showsVerticalScrollIndicator={false}
                                        >
                                            {showUI && (
                                                roomchat.map((chat, ind) => (
                                                    <View key={ind} style={styles.streamChatItem}>
                                                        <TouchableOpacity onPress={() => HandleOpenChatUserProfile(chat)}>
                                                            <Image style={styles.streamChatItemProfileImg}
                                                                source={!chat.userProfile || chat.userProfile === 'default'
                                                                    ? getGenderFallbackImage(chat.userProfile)
                                                                    : { uri: chat.userProfile }
                                                                }
                                                            />
                                                        </TouchableOpacity>
                                                        <View numberOfLines={1} style={styles.streamChatMessageBox}>
                                                            <Text numberOfLines={1} style={[styles.streamChatUserName, { color: `${chat?.TYPE === "USERJOINED" ? `#00F6CD` : chat.TYPE === "USERLEFT" ? '#DC112C' : `#DEEE4F`}`, paddingTop: `${chat?.TYPE === "USERJOINED" ? `0` : `0`}` }]}>
                                                                {chat.userName?.length > 30 ? chat.userName?.slice(0, 30) + '...' : chat?.userName}
                                                            </Text>
                                                            <Text numberOfLines={3} style={styles.streamChatMessage}>
                                                                {chat?.message}
                                                            </Text>
                                                        </View>
                                                    </View>
                                                ))
                                            )}
                                        </ScrollView>
                                    </View>
                                    {showUI && (<View style={styles.strRoomFooterSocialActions}>
                                            <TouchableOpacity
                                                style={styles.strRoomFooterSocialActionsBtn}
                                                onPress={() => setVisibleModal('luckyWheel')}
                                            >
                                                <Image
                                                    style={{ width: 40, height: 40 }}
                                                    source={require('../../assets/images/lucky-wheel/lw-home.png')}
                                                    resizeMode="contain"
                                                />
                                            </TouchableOpacity>
                                        {!isHost && streamerList?.length === 1 && (<>
                                            <TouchableOpacity style={styles.strRoomFooterSocialActionsBtn} disabled={streamLayout[0]?.isFriend} onPress={() => handleFriendRequest(userDetails?.userid)}>
                                                {streamLayout[0]?.isFriend ? (
                                                    <Ionicons name="person-remove" size={30} color="green" />
                                                ) : (
                                                    <Ionicons name="person-add" size={30} color="#fff" />)}
                                            </TouchableOpacity>
                                        </>)}
                                        {!isHost && (<TouchableOpacity style={styles.strRoomFooterSocialActionsBtn} onPress={ToggleLike} disabled={isHost} >
                                            <Ionicons name="heart" size={30} color={isLiked ? 'red' : '#fff'} />
                                        </TouchableOpacity>)}
                                        <TouchableOpacity style={[styles.strRoomFooterSocialActionsBtn, { display: openMoreSettingList ? 'none' : 'flex' }]}>
                                            <Ionicons name="share-social-sharp" size={30} color="#fff" />
                                        </TouchableOpacity>
                                    </View>)}
                                </View>
                            </>
                            {openMoreSettingList && showUI && (
                                <LinearGradient
                                    colors={['rgba(8, 8, 8, 0.28)', 'rgba(8, 8, 8, 0)']}
                                    start={{ x: 0.5, y: 1 }}
                                    end={{ x: 0.5, y: 0 }}
                                    style={{ minHeight: 200 }}
                                >
                                    <Animated.View
                                        style={[
                                            styles.strMoreSettingListContainer,
                                            {
                                                opacity: animatedOpacity,
                                                transform: [{ translateY: animatedTranslateY }],
                                            },
                                        ]}
                                    >
                                        {/* {localStream || isHost && ( */}
                                        <TouchableOpacity onPress={() => {
                                            switchCamera();
                                            HidesettingPanel()
                                        }} style={styles.strMoreSettingListItem}>
                                            <Text style={styles.strMoreSettingListItemText}>Flip Camera</Text>
                                            <Ionicons name="camera-reverse" size={20} color="#fff" />
                                        </TouchableOpacity>
                                        {/* // )} */}
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
                                        {/* {localStream || isHost && ( */}
                                        <TouchableOpacity onPress={() => {
                                            toggleMute(),
                                                HidesettingPanel()
                                        }} style={styles.strMoreSettingListItem}>
                                            <Text style={styles.strMoreSettingListItemText}>Mute {isMuted?.muted ? 'OFF' : 'ON'}</Text>
                                            {isMuted?.muted ? <Ionicons name="mic" size={20} color="#fff" /> : <Ionicons name="mic-off" size={20} color="#fff" />}
                                        </TouchableOpacity>
                                        {/* )} */}
                                        {!isHost && (
                                            <TouchableOpacity onPress={() => {
                                                HidesettingPanel()
                                                HandleReport()
                                            }} style={styles.strMoreSettingListItem}>
                                                <Text style={styles.strMoreSettingListItemText}>Report</Text>
                                                <Ionicons name="flag" size={20} color="#dc3131" />
                                            </TouchableOpacity>
                                        )}
                                    </Animated.View>
                                </LinearGradient>
                            )}
                            {showUI && (<View style={[styles.strRoomBottomBox, { marginBottom: Platform.OS === 'android' ? keyboardOffset : 0 }]}>
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
                                                {openMoreSettingList ? <Ionicons name="close-outline" size={30} color="#fff" /> : <Image source={require('../../assets/images/icons/add-video.png')} style={{ height: '35', width: '35' }} />}
                                            </Animated.View>
                                        </TouchableOpacity>
                                        {!isHost && streamLayout.length === 1 && (<>
                                            <TouchableOpacity onPress={() => setGiftModalVisible(true)} style={[styles.strRoomBottomBoxIconBox]}>
                                                <Ionicons name="gift" size={30} color="#FF00FF" />
                                            </TouchableOpacity>
                                            <TouchableOpacity style={styles.strRoomBottomBoxIconBox}>
                                                <Ionicons name="cart" size={30} color="#fff" />
                                            </TouchableOpacity>
                                        </>)}
                                        {isHost && (
                                            <TouchableOpacity onPress={() => {
                                                setTogglerequest(!togglerequest)
                                                setShowTooltip(false)
                                            }} style={styles.strRoomBottomBoxIconBox}>
                                                {showTooltip && streamrequestlist.length > 0 && (
                                                    <Animated.View
                                                        style={[
                                                            {
                                                                position: 'absolute',
                                                                top: '22%',
                                                                left: '22%',
                                                                width: 15,
                                                                height: 15,
                                                                borderWidth: 1,
                                                                borderColor: '#00F043',
                                                                borderRadius: 15,
                                                                transform: [{ translateX: -5 }, { translateY: -5 }], // center ring
                                                            },
                                                            {
                                                                opacity: opacityAnim,
                                                                transform: [{ scale: scaleAnim1 }],
                                                            },
                                                        ]}
                                                    />)}

                                                <Ionicons name="people" size={30} color="#fff" />

                                            </TouchableOpacity>
                                        )}
                                    </>
                                )}
                            </View>)}
                        </LinearGradient>
                    </>
                )}
            </View>
            {giftModalVisible && (
                <Modal
                    isVisible={giftModalVisible}
                    animationIn="slideInUp"
                    animationOut="slideOutDown"
                    animationInTiming={300}
                    animationOutTiming={200}
                    useNativeDriver={true}
                    avoidKeyboard={false}
                    backdropOpacity={0}
                    style={[styles.profileModalMain]}
                >
                    <View style={[styles.profileModalOverlay,
                    themeStyles[theme].profileModalOverlay, { flex: 1, maxHeight: screenHeight * 0.4 }]}>
                        <View style={{ flexDirection: "row", justifyContent: 'flex-end', marginBottom: 5 }}>
                            <TouchableOpacity
                                onPress={() => setGiftModalVisible(false)}
                                style={[styles.modalCloseBtn]}
                            >
                                <Ionicons name="close" size={28} color={theme === 'light' ? '#333' : '#fff'} />
                            </TouchableOpacity>
                        </View>
                        <View style={[styles.giftModalCategoryMainLayout, themeStyles[theme].giftModalCategoryMainLayout]}>
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
                                                    styles.giftModalCatTab, themeStyles[theme].giftModalCatTab,
                                                    isSelected && styles.giftModalCatTabActive,
                                                ]}
                                            >
                                                <Text style={[styles.giftModalCatTabText, themeStyles[theme].giftModalCatTabText, isSelected && styles.giftModalCatTabActiveText]}>{category.giftValue}</Text>
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
                        <View style={[styles.giftModalItemsMainLayout, themeStyles[theme].giftModalItemsMainLayout]}>
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
                </Modal>
            )}
            {visibleModal === 'message-modal' && (
                <MessageModal
                    visible={visibleModal === 'message-modal'}
                    message={message}
                    onClose={() => setVisibleModal(null)}
                />
            )}
            {isHost && <RequestModal visible={togglerequest} onClose={() => setTogglerequest(false)} StreamRequestList={streamrequestlist} streamGuest={streamGuest} />}
            {/* close stream modal  */}
            {closeStreamModal && (
                <ConfirmModal visible={closeStreamModal} onClose={() => setCloseStreamModal(false)} leaveRoom={leaveRoom} />
            )}
            {visibleModal === 'ReportVideo' && (
                <ReportUserModal
                    visible={visibleModal === 'ReportVideo'}
                    onClose={() => {
                        setVisibleModal(null);
                    }}
                    reportData={userDetails}
                    RoomID={streamInfo?.roomID}
                    reportType="Video"
                />
            )}
            {OpenViewerLIst && (
                <ViewerTotalLIst
                    visible={OpenViewerLIst}
                    onClose={() => setOpenViewerList(false)}
                    userDetails={userDetails}
                    RoomID={streamInfo?.roomID}
                />
            )}
            {/* Send Animation - shown to the gift sender */}
            {showSendAnimation && sendAnimationData && (
                <GiftSendAnimation
                    giftName={sendAnimationData.giftName}
                    recipientName={sendAnimationData.recipientName}
                    onComplete={handleSendAnimationComplete}
                />
            )}

            {/* Receive Animation - shown to the gift receiver (host) */}
            {showReceiveAnimation && receiveAnimationData && (
                <GiftReceiveAnimation
                    giftName={receiveAnimationData.giftName}
                    senderName={receiveAnimationData.senderName}
                    ReceiverName={receiveAnimationData.ReceiverName}
                    onComplete={handleReceiveAnimationComplete}
                />
            )}
            {OpenHostPorfile && (
                <ProfileScreenModal
                    visible="true"
                    onClose={() => setOpenHostPorfile(false)}
                    profileData={userDetails}
                    isMainProfile={true}
                    isViewer={true}
                />
            )}
            {openChatUserProfile && (
                <ProfileScreenModal
                    visible="true"
                    onClose={() => setOpenChatUserProfile(false)}
                    profileData={SelectedUser}
                    isMainProfile={true}
                    isViewer={true}
                />
            )}
            {notification.isVisible && (
                <AnimatedNotification
                    message={notification.message}
                    isVisible={notification.isVisible}
                    onHide={hideNotification}
                    type={notification.type}
                />
            )}
            {visibleModal === 'luckyWheel' && (
                <LuckyWheelModal
                    visible={visibleModal === 'luckyWheel'}
                    onClose={() => {
                        setVisibleModal(null);
                    }}
                    userData={userData}
                    hostDetails={userDetails}
                    RoomID={streamInfo?.roomID}
                />
            )}
        </Pressable>
    );
};

export default StreamRoom;