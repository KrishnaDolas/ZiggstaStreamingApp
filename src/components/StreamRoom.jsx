/* eslint-disable react-native/no-inline-styles */
import {
    View, Text, TouchableOpacity, Alert, Image, ScrollView, Dimensions, TextInput, Keyboard, Animated,
    Easing,
    ActivityIndicator, Platform,
    Pressable,BackHandler
} from 'react-native';
import KeepAwake from 'react-native-keep-awake';
import { styles } from '../../assets/styles/ThemeStyles';
import { RTCView } from 'react-native-webrtc';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import React, { Fragment, useEffect, useRef, useState } from 'react';
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
import ReportUserModal from '../modals/ReportUserModal';
import { getGenderFallbackImage, giftImages, SendErrorTotheServer } from '../utils/constant';
import ViewerTotalLIst from '../modals/ViewerTotalLIst';
import { GiftReceiveAnimation, GiftSendAnimation } from './GiftSendAnimation';
import ProfileScreenModal from '../modals/ProfileScreenModal';


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
    streammsg,
    totalGiftValue
}) => {
    const insets = useSafeAreaInsets();
    const insetsTop = useSafeAreaInsets();
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
    const [totalRoomviewerList, setTotalRoomviewerList] = useState([]) //{ ViewerName: 'vikram', ViewerID: '12',country:'India',city:'pune' }
    const [isLiked, setisLiked] = useState(false)
    const [message, setMessage] = useState(null);
    const blinkingAnim = useRef(new Animated.Value(1)).current;
    const [OpenHostPorfile, setOpenHostPorfile] = useState(false)
    const [showSendAnimation, setShowSendAnimation] = useState(false);
    const [showReceiveAnimation, setShowReceiveAnimation] = useState(false);
    const [sendAnimationData, setSendAnimationData] = useState(null);
    const [receiveAnimationData, setReceiveAnimationData] = useState(null);


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
        remoteStreams.forEach(({ id, stream }) => {
            const hostInfo = streamerList.find((item) => item.IsHost === true)
            const StreamerInfo = streamerList.find((streamer) => streamer.ID === id)
            if (stream && typeof stream.toURL === 'function') {
                if (hostInfo?.ID === id) {
                    streams.unshift({ type: 'remote', stream, userId: StreamerInfo?.UserID, isMuted: StreamerInfo?.isMuted, Name: `${StreamerInfo?.Name} (HOST)` });
                } else {
                    streams.push({ type: 'remote', stream, userId: StreamerInfo?.UserID, isMuted: StreamerInfo?.isMuted, Name: `${StreamerInfo?.Name}` });
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
    }, [localStream, remoteStreams, streamerList, isStreaming]);

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
            }
        } catch (error) {
            SendErrorTotheServer(error, 'GetUserDetails')
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

    const HandleReport = () => {
        setVisibleModal('ReportVideo')
    }

    // scoketevents
    const HandleLikeCount = (count) => {
        setStreamupdated((prev) => ({ ...prev, LikeCount: count }));
    }

    const HandleGiftReceived = (senderName, giftName) => {
        try {
            setReceiveAnimationData({
                giftName: giftName,
                senderName: senderName
            });
            setShowReceiveAnimation(true);
        } catch (error) {
            SendErrorTotheServer(error, "HandleGiftReceived")
        }
    }
    const HandleRoomTotalCount = (list) => {
        console.log(list);
        setTotalRoomviewerList(list)
    }

    useEffect(() => {
        socket.on('like-count', HandleLikeCount)
        socket.on('received-Gift', HandleGiftReceived)
        socket.on('RoomTotalCount', HandleRoomTotalCount)
        return () => {
            socket.off('like-count', HandleLikeCount)
            socket.off('received-Gift', HandleGiftReceived)
            socket.off('RoomTotalCount', HandleRoomTotalCount)
        }
    }, [])

    const SendGift = async (item) => {
        try {
            const hostInfo = streamerList.filter((item) => item.IsHost === true)
            const params = {
                fromUserID: userData?.userid,
                toUserID: hostInfo[0].UserID,
                giftID: item?.giftID,
                roomId: streamInfo?.roomID
            }
            const Responce = await Apiclient.post('/sendGifts', params)
            if (Responce.data) {
                if (Responce.data.success) {
                    socket.emit('Send-gift', userData?.screenName, item?.giftIcon,item?.giftValue)
                    setSendAnimationData({
                        giftName: item?.giftIcon,
                        recipientName: hostInfo[0]?.Name
                    });
                    setShowSendAnimation(true);
                    setGiftModalVisible(false);
                }else if(Responce.data.message){
                    setMessage(Responce.data.message)
                    setVisibleModal('message-modal')
                    setGiftModalVisible(false);
                }
            }
        } catch (error) {
            SendErrorTotheServer(error, "SendGift")
        }
    }
    const handleFriendRequest = async (userid) => {
        try {
            const params = {
                requesterID: userData?.userid,
                receiverID: userid
            }
            const responce = await Apiclient.post(`/friends/request`, params)
            if (responce.data?.success) {
                setMessage(`Request Sent To ${userDetails?.screenName}`)
                setVisibleModal('message-modal')
            } else {
                console.log(responce);
            }
        } catch (error) {
            setMessage(`Request Already Sent`)
            setVisibleModal('message-modal')
            // SendErrorTotheServer(error,"handleFriendRequest")
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
                        <View style={{ position: 'absolute', left: '40%', top: '40%' }}>
                            <Text>{streamLayout[0]?.isMuted && <Ionicons name="mic-off" size={100} color="#fff" />}</Text>
                        </View>
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
                                    <View style={{ position: 'absolute', left: '40%', top: '40%' }}>
                                        <Text>{streamLayout[0]?.isMuted && <Ionicons name="mic-off" size={100} color="#fff" />}</Text>
                                    </View>
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
                                        <View key={index} style={{ flex: 1, position: 'relative' }}>
                                            <RTCView
                                                streamURL={streamData.stream.toURL()}
                                                style={styles.streamVideoHalf}
                                                objectFit="cover"
                                                mirror={streamData.type === 'local' && isFrontCamera}
                                            />
                                            <View style={{ position: 'absolute', left: '40%', top: '40%' }}>
                                                <Text>{streamData?.isMuted && <Ionicons name="mic-off" size={100} color="#fff" />}</Text>
                                            </View>
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
                                        <View key={index} style={styles.fiveUserCol50}>
                                            <View style={styles.videoContainer}>
                                                <RTCView
                                                    streamURL={streamData.stream.toURL()}
                                                    style={styles.streamFiveUserVideo}
                                                    objectFit="cover"
                                                    mirror={streamData.type === 'local' && isFrontCamera}
                                                />
                                                <View style={{ position: 'absolute', left: '40%', top: '40%' }}>
                                                    <Text>{streamData?.isMuted && <Ionicons name="mic-off" size={100} color="#fff" />}</Text>
                                                </View>
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
                                        <View key={index} style={styles.fiveUserCol33}>
                                            <View style={styles.videoContainer}>
                                                <RTCView
                                                    streamURL={streamData.stream.toURL()}
                                                    style={styles.streamFiveUserVideo}
                                                    objectFit="cover"
                                                    mirror={streamData.type === 'local' && isFrontCamera}
                                                />
                                                <View style={{ position: 'absolute', left: '40%', top: '40%' }}>
                                                    <Text>{streamData?.isMuted && <Ionicons name="mic-off" size={100} color="#fff" />}</Text>
                                                </View>
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
                                                <View style={{ position: 'absolute', left: '30%', top: '40%' }}>
                                                    <Text>{streamData?.isMuted && <Ionicons name="mic-off" size={80} color="#fff" />}</Text>
                                                </View>
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
                                                                <Ionicons name="person-add" size={20} color="#fff" />
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
                        <View style={[
                            styles.controls,
                            {
                                bottom: 0,
                                paddingBottom: insets.bottom > 0 ? insets.bottom : 0,
                                paddingTop: insetsTop.top > 0 ? insetsTop.top : 0,
                            },
                        ]}>
                            <View style={styles.strRoomHeader}>
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
                            </View>
                            <LinearGradient
                                colors={streamLayout.length > 1 ? ['#1d1d1d', '#1d1d1d'] : ['rgba(141, 124, 124, 0)', 'rgba(255, 255, 255, 0)']}
                                start={{ x: 0.5, y: 1 }}
                                end={{ x: 0.5, y: 0 }}
                                style={styles.strRoomFooter}
                            >
                                <>
                                    <View style={styles.strRoomFooterChatOrActionsBox}>
                                        <View style={[styles.streamChatContainer,{display:openMoreSettingList ? 'none' : 'flex'}]}>
                                            <ScrollView
                                                ref={scrollViewRef}
                                                showsVerticalScrollIndicator={false}
                                            >
                                                {roomchat.map((chat, ind) => (
                                                    <View key={ind} style={styles.streamChatItem}>
                                                        <Image style={styles.streamChatItemProfileImg} source={chat.userProfile} />
                                                        <View numberOfLines={1} style={styles.streamChatMessageBox}>
                                                            <Text numberOfLines={1} style={[styles.streamChatUserName, { color: `${chat?.TYPE === "USERJOINED" ? `#00F6CD` : chat.TYPE === "USERLEFT" ? '#DC112C' : `#DEEE4F`}`, paddingTop: `${chat?.TYPE === "USERJOINED" ? `0` : `0`}` }]}>
                                                                {chat.userName?.length > 30 ? chat.userName?.slice(0, 30) + '...' : chat?.userName}
                                                            </Text>
                                                            <Text numberOfLines={3} style={styles.streamChatMessage}>
                                                                { chat?.message}
                                                            </Text>
                                                        </View>
                                                    </View>
                                                ))}
                                            </ScrollView>
                                        </View>
                                        <View style={styles.strRoomFooterSocialActions}>
                                            {!isHost && streamerList?.length === 1 && (<>
                                                <TouchableOpacity style={styles.strRoomFooterSocialActionsBtn} onPress={() => handleFriendRequest(userDetails?.userid)}>
                                                    <Ionicons name="person-add" size={30} color="#fff" />
                                                </TouchableOpacity>
                                            </>)}
                                            {!isHost && (<TouchableOpacity style={styles.strRoomFooterSocialActionsBtn} onPress={ToggleLike} disabled={isHost} >
                                                <Ionicons name="heart" size={30} color={isLiked ? 'red' : '#fff'} />
                                            </TouchableOpacity>)}
                                            <TouchableOpacity style={styles.strRoomFooterSocialActionsBtn}>
                                                <Ionicons name="share-social-sharp" size={30} color="#fff" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </>
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
                                            <Text style={styles.strMoreSettingListItemText}>Mute {!isMuted?.muted ? 'OFF' : 'ON'}</Text>
                                            {!isMuted?.muted ? <Ionicons name="mic" size={20} color="#fff" /> : <Ionicons name="mic-off" size={20} color="#fff" />}
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
                            </LinearGradient>
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
        </View>
    );
};

export default StreamRoom;