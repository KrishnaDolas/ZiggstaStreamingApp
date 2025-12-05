/* eslint-disable react-native/no-inline-styles */
import {
    View, Text, TouchableOpacity, Alert, Image, ScrollView, Dimensions, TextInput, Keyboard, Animated,
    Easing,
    ActivityIndicator,
    Pressable, BackHandler,
    ImageBackground, Share,
    LayoutAnimation,
    FlatList,
} from 'react-native';
import KeepAwake from 'react-native-keep-awake';
import { styles, themeStyles } from '../../assets/styles/ThemeStyles';
import { RTCView } from 'react-native-webrtc';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AntDesign from 'react-native-vector-icons/AntDesign';

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
import { UpdateStreamDescriptionModal } from '../modals/StreamDescription';
import SlotGameModal from '../modals/SlotGameModal';
import GlowingRedDot from './GlowingRedDot';

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
    connectingpanel,
}) => {
    const insets = useSafeAreaInsets();
    const { theme } = useContext(ThemeContext);
    const screenHeight = Dimensions.get('window').height;
    const [keyboardOffset, setKeyboardOffset] = useState(0);
    const [giftsData, setGiftItems] = useState([]);
    const {
        userData,
        setIsInStreamRoom,
    } = useAppContext();
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
    const [myFriendList, setMyFriendList] = useState([]);
    const [hostFriendRequestList, setHostFriendRequestList] = useState([]);
    const [totalGiftCoinReceived, setTotalGiftCoinReceived] = useState(null);
    const [totalGiftByRoom, setTotalGiftByRoom] = useState(0);
    const [notification, setNotification] = useState({
        isVisible: false,
        message: '',
        type: 'info',
    });
    const [likeAndViewerCount, setLikeAndViewerCount] = useState({ viewerCount: 0, likeCount: 0 });
    const [editstreamdescription, setEditStreamDescription] = useState(false);
    const [streamDescription, setStreamDescription] = useState(streamInfo?.RoomName?.trim() || '');
    const scaleAnim1 = useRef(new Animated.Value(0)).current;
    const opacityAnim = useRef(new Animated.Value(1)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const scrollViewRef = useRef();
    const inputRef = useRef(null);

    // ✅ NEW: Enhanced Game State Management
    const [luckyWheelVisible, setLuckyWheelVisible] = useState(false);
    const [luckyWheelOpenedBy, setLuckyWheelOpenedBy] = useState(null);
    const [slotGameVisible, setSlotGameVisible] = useState(false);
    const [slotGameOpenedBy, setSlotGameOpenedBy] = useState(null);
    const [activeGame, setActiveGame] = useState(null);
    const [isLuckyWheelActiveInRoom, setIsLuckyWheelActiveInRoom] = useState(false);

    // Create interpolated spin value ONCE
    const spin = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    useEffect(() => {
        const loopAnimation = Animated.loop(
            Animated.timing(rotateAnim, {
                toValue: 1,
                duration: 2000,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        );
        loopAnimation.start();

        return () => loopAnimation.stop(); // cleanup when unmounted
    }, [rotateAnim]);



    // ✅ Define handlers with useCallback (outside useEffect)
    const handleLuckyWheelOpened = useCallback((openerData) => {
        console.log('🎯 [CLIENT] lucky-wheel-opened received:', openerData);

        // Don't auto-open if user is playing slot game
        if (activeGame === 'slot-game') {
            console.log('🚫 Skipping - user playing slot game');
            return;
        }

        // Don't reopen if already open for this user
        if (luckyWheelVisible || visibleModal === 'luckyWheel') {
            console.log('🚫 Skipping - lucky wheel already open for this user');
            return;
        }

        // Emit to server that this user is also opening the wheel (via auto-open)
        const userOpenData = {
            userId: userData?.userid,
            userName: userData?.screenName,
            timestamp: Date.now(),
        };

        console.log('🎯 [CLIENT] Emitting user-opened-lucky-wheel (auto-open):', streamInfo?.roomID.toString(), userOpenData);
        socket.emit('user-opened-lucky-wheel', streamInfo?.roomID.toString(), userOpenData);

        console.log('✅ Auto-opening lucky wheel for user');
        setLuckyWheelVisible(true);
        setLuckyWheelOpenedBy(openerData);
        setActiveGame('luckyWheel');
        setVisibleModal('luckyWheel');
    }, [activeGame, luckyWheelVisible, visibleModal, userData, streamInfo?.roomID]);

    // ✅ Check if user is new to the stream (for red dot indicator) AND handle reconnections
    useEffect(() => {
        const handleGetLuckyWheelStatus = () => {
            if (streamInfo?.roomID) {
                console.log('🔍 [CLIENT] Requesting lucky wheel status for room:', streamInfo.roomID);
                socket.emit('get-lucky-wheel-status', streamInfo.roomID.toString());
            }
        };

        // Request immediately if room info is available
        if (streamInfo?.roomID) {
            handleGetLuckyWheelStatus();
        }

        // Also request when streamInfo becomes available
        const timer = setTimeout(() => {
            if (streamInfo?.roomID) {
                handleGetLuckyWheelStatus();
            }
        }, 1000);

        return () => clearTimeout(timer);
    }, [streamInfo?.roomID]);

    const handleLuckyWheelActive = useCallback(() => {
        console.log('🔴 [CLIENT] Received lucky-wheel-active - setting room active');
        setIsLuckyWheelActiveInRoom(true);
    }, []);

    const handleLuckyWheelInactive = useCallback(() => {
        console.log('⚪ [CLIENT] Lucky wheel is now inactive in room (ALL users closed)');
        setIsLuckyWheelActiveInRoom(false);
        setLuckyWheelOpenedBy(null);

        // Only close locally if open (when ALL users have closed)
        if (luckyWheelVisible || visibleModal === 'luckyWheel') {
            console.log('🔒 Closing lucky wheel because room became inactive (all users closed)');
            handleLuckyWheelCloseLocal(); // Local close without server notification
        }
    }, [luckyWheelVisible, visibleModal]);

    // ✅ NEW: Handle individual close confirmation from server
    const handleLuckyWheelCloseConfirmation = useCallback(() => {
        console.log('✅ [CLIENT] Received close confirmation from server');
        // Server confirmed our close - no need to do anything extra
        // This is just for debugging/confirmation
    }, []);

    // ✅ NEW: Local close function (without server notification)
    const handleLuckyWheelCloseLocal = () => {
        console.log('🚪 [CLIENT] Closing lucky wheel locally only');
        setLuckyWheelVisible(false);
        setLuckyWheelOpenedBy(null);
        setActiveGame(null); // Always clear active game
        setVisibleModal(null); // Always clear visible modal
    };


    useEffect(() => {
        console.log('luckyWheelVisible', luckyWheelVisible);
        console.log('visibleModal', visibleModal);
        console.log('giftModalVisible', giftModalVisible);
    }, [luckyWheelVisible, visibleModal, giftModalVisible]);



    // ✅ Fixed: Enhanced game open/close handlers
    const handleLuckyWheelOpen = () => {
        // ✅ FIX: First, ensure any modal state is cleared before opening
        if (visibleModal && visibleModal !== 'luckyWheel') {
            setVisibleModal(null);
        }

        // If already open, close it locally (per-user close)
        if (luckyWheelVisible || visibleModal === 'luckyWheel') {
            console.log('🚪 [CLIENT] Closing lucky wheel locally (per-user)');
            handleLuckyWheelClose();
            return;
        }

        // Close any other game first
        if (activeGame && activeGame !== 'luckyWheel') {
            handleGameClose(activeGame);
        }

        // Emit to server for broadcast (room-wide open)
        const userOpenData = {
            userId: userData?.userid,
            userName: userData?.screenName,
            timestamp: Date.now(),
        };

        console.log('🎯 [CLIENT] Emitting user-opened-lucky-wheel (manual open):', streamInfo?.roomID.toString(), userOpenData);
        socket.emit('user-opened-lucky-wheel', streamInfo?.roomID.toString(), userOpenData);

        // Open locally
        setVisibleModal('luckyWheel');
        setLuckyWheelOpenedBy(userOpenData);
        setActiveGame('luckyWheel');
        setLuckyWheelVisible(true);
        // Don't set isLuckyWheelActiveInRoom - server will broadcast to all
    };

    const handleSlotGameOpen = () => {
        if (visibleModal === 'slot-game' || slotGameVisible) {
            // Close locally (no emit)
            console.log('🚪 [CLIENT] Closing slot game locally');
            setVisibleModal(null);
            setActiveGame(null);
            setSlotGameOpenedBy(null);
            setSlotGameVisible(false);
            return;
        }

        // Close any other game first (local)
        if (activeGame && activeGame !== 'slot-game') {
            handleGameClose(activeGame);
        }

        // Local open only (no emit/broadcast)
        const userOpenData = {
            userId: userData?.userid,
            userName: userData?.screenName,
            timestamp: Date.now()
        };
        console.log('🎰 [CLIENT] Opening slot game locally (individual)');
        setVisibleModal('slot-game');
        setSlotGameOpenedBy(userOpenData);
        setActiveGame('slot-game');
        setSlotGameVisible(true);
    };

    const handleGameClose = (gameType) => {
        console.log(`🚪 [CLIENT] Closing ${gameType} locally`);

        if (gameType === 'luckyWheel') {
            handleLuckyWheelClose();
        } else if (gameType === 'slot-game') {
            setSlotGameVisible(false);
            setSlotGameOpenedBy(null);
            if (activeGame === 'slot-game') {
                setActiveGame(null);
            }
            if (visibleModal === 'slot-game') {
                setVisibleModal(null);
            }
        }
    };


    const handleLuckyWheelClose = () => {
        console.log('🚪 [CLIENT] Closing lucky wheel and notifying server for user:', userData?.userid);

        // Local close first
        handleLuckyWheelCloseLocal();

        // Notify server about user closing (but don't affect other users)
        if (streamInfo?.roomID && userData?.userid) {
            console.log('🎯 [CLIENT] Emitting user-closed-lucky-wheel to server');
            socket.emit('user-closed-lucky-wheel', streamInfo.roomID.toString(), userData.userid);
        }
    };


    // Add cleanup effect
    useEffect(() => {
        return () => {
            // If lucky wheel was visible when leaving, close it properly
            if ((luckyWheelVisible || visibleModal === 'luckyWheel') &&
                streamInfo?.roomID &&
                userData?.userid) {
                console.log('🧹 [CLIENT] Cleaning up lucky wheel on unmount');
                socket.emit('user-closed-lucky-wheel', streamInfo.roomID.toString(), userData.userid);
            }
        };
    }, [luckyWheelVisible, visibleModal, streamInfo?.roomID, userData?.userid]);


    const handleSlotGameClose = () => {
        handleGameClose('slot-game');
    };

    // ✅ UPDATED: Check if should show red dot on lucky wheel button
    const shouldShowRedDotOnLuckyWheel = () => {
        const show = isLuckyWheelActiveInRoom &&
            !luckyWheelVisible &&
            visibleModal !== 'luckyWheel' &&
            activeGame !== 'slot-game';

        // console.log('🔴 [Red Dot Debug]', {
        //     isLuckyWheelActiveInRoom,
        //     luckyWheelVisible,
        //     visibleModal,
        //     activeGame,
        //     shouldShow: show,
        // });

        return show;
    };

    // ✅ Handle user joining room - request current lucky wheel status
    useEffect(() => {
        if (streamInfo?.roomID && userData?.userid) {
            console.log('🔍 [CLIENT] Requesting current lucky wheel status for room:', streamInfo.roomID);
            socket.emit('get-lucky-wheel-status', streamInfo.roomID.toString());
        }
    }, [streamInfo?.roomID, userData?.userid]);



    useEffect(() => {
        console.log('isLuckyWheelActiveInRoom', isLuckyWheelActiveInRoom);
    }, [isLuckyWheelActiveInRoom]);


    // ✅ Updated useEffect (fewer deps, uses memoized handlers)
    useEffect(() => {
        console.log('🔌 [CLIENT] Setting up game socket listeners');

        // Register all listeners
        socket.on('lucky-wheel-opened', handleLuckyWheelOpened);
        socket.on('lucky-wheel-active', handleLuckyWheelActive);
        socket.on('lucky-wheel-inactive', handleLuckyWheelInactive);
        socket.on('lucky-wheel-closed-confirmation', handleLuckyWheelCloseConfirmation);

        // Cleanup
        return () => {
            console.log('🧹 [CLIENT] Removing game socket listeners');
            socket.off('lucky-wheel-opened', handleLuckyWheelOpened);
            socket.off('lucky-wheel-active', handleLuckyWheelActive);
            socket.off('lucky-wheel-inactive', handleLuckyWheelInactive);
            socket.off('lucky-wheel-closed-confirmation', handleLuckyWheelCloseConfirmation);
        };
    }, [handleLuckyWheelOpened, handleLuckyWheelActive, handleLuckyWheelInactive, handleLuckyWheelCloseConfirmation]); // Only deps are the memoized handlers

    // ✅ Fixed: Request lucky wheel status on room join and reconnect
    useEffect(() => {
        if (streamInfo?.roomID) {
            console.log('🔍 [CLIENT] Requesting lucky wheel status for room:', streamInfo.roomID);
            socket.emit('get-lucky-wheel-status', streamInfo.roomID.toString());
        }
    }, [streamInfo?.roomID]);

    // if socket is disconnect every time then show connecting panel
    useEffect(() => {
        if (connectingpanel) {
            setVisibleModal(null);
        }
    }, [connectingpanel])

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
                'Close Stream',
                'Do you want to close The stream ?',
                [
                    { text: 'Cancel', onPress: () => null, style: 'cancel' },
                    {
                        text: 'Yes', onPress: () => {
                            leaveRoom();
                        },
                    },
                ]
            );
            return true; // Prevent default back button behavior
        };

        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            backAction
        );

        return () => backHandler.remove(); // Cleanup on unmount

    }, []);


    // get gifts from api
    const getGiftsCategory = async () => {
        try {
            const response = await Apiclient.get('/getgifts');
            if (response) {
                setGiftCategoryItems(response.data.data || []);
            }
        } catch (error) {
            SendErrorTotheServer(error, 'getGiftsCategory');
        }
    };

    useEffect(() => {
        getGiftsCategory();
    }, [giftModalVisible]);


    useEffect(() => {
        // Preload all images
        Object.values(giftImages).forEach((img) => {
            // require returns a number (packaged asset), but Image.resolveAssetSource gives URI
            const source = Image.resolveAssetSource(img).uri;
            Image.prefetch(source);
        });
        KeepAwake.activate(); // Prevent screen from sleeping

        return () => {
            KeepAwake.deactivate();
        }
    }, []);

    // show notification if
    const showNotification = (message, type = 'info') => {
        setNotification({
            isVisible: true,
            message,
            type,
        });
    };

    // hide notification
    const hideNotification = () => {
        setNotification({
            isVisible: false,
            message: '',
            type: 'info',
        });
    };

    // Scroll to the bottom when roomchat updates
    useEffect(() => {
        if (scrollViewRef?.current) {
            setTimeout(() => {
                scrollViewRef?.current.scrollToEnd({ animated: true });
            }, 100);
        }
        // if (!showUI) {
        //     setShowUI(true);
        // }
    }, [roomchat]);

    // get gifts category wise
    const getGifts = async () => {
        setGiftDataLoading(true);
        try {
            const response = await Apiclient.get(`/getgifts?giftValue=${selectedGiftCategory}`);
            if (response) {
                setGiftItems(response.data.data || []);
            }
        } catch (error) {
            SendErrorTotheServer(error, 'getGifts');
        } finally {
            setGiftDataLoading(false);
        }
    };

    useEffect(() => {
        getGifts();
    }, [giftModalVisible, selectedGiftCategory]);


    // get total likes & view count from api
    const GetViewerAndLikeCount = async () => {
        try {
            const params = {
                hostId: streamInfo?.hostID,
            }
            const response = await Apiclient.post('/rooms/getTotalLikesCount', params);
            console.log('getTotalLikesCount', response.data);
            if (response) {
                setLikeAndViewerCount({
                    viewerCount: response.data.totalViews || 0,
                    likeCount: response.data.totalLikes || 0,
                });
            }
        } catch (error) {
            SendErrorTotheServer(error, 'GetViewerAndLikeCount');
        }
    };

    useEffect(() => {
        GetViewerAndLikeCount();
    }, []);

    // sort gift category
    useEffect(() => {
        if (giftsData?.length > 0) {
            const sortedByValue = [...giftsData].sort((a, b) => a.giftValue - b.giftValue);
            const uniqueGiftValues = [...new Set(sortedByValue.map(item => item.giftValue))];
            if (uniqueGiftValues.length > 0) {
                setSelectedGiftCategory(uniqueGiftValues[0]);
            }
        }
    }, [giftsData]);


    // stream layout style according layout length
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

        if (streamInfo) {
            GetUserDetails(streamInfo?.hostID)
        }
        const showSub = Keyboard.addListener('keyboardDidShow', (e) => {
            HidesettingPanel()
            LayoutAnimation.easeInEaseOut();
            setKeyboardOffset(e.endCoordinates.height);
        });
        const hideSub = Keyboard.addListener('keyboardDidHide', () => {
            LayoutAnimation.easeInEaseOut();
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

    // send chat
    const HadleSendChat = () => {
        if (!userChatInput.trim()) {
            // Alert.alert('Message', 'Please enter a message before sending.', [{ text: 'OK' }]);
            return;
        }
        HandleChatmessages(userChatInput);
        setUserChatInput('');
        inputRef.current?.blur();
        setIsTyping(false);
        Keyboard.dismiss();
    };

    // get user details
    const GetUserDetails = async (userid) => {
        try {
            const formData = { userid: userid };
            const response = await Apiclient.post('/getUserDetails', formData);
            if (response) {
                const user = response.data.user;
                setUserDetails(user);
                setGiftSendData({ userName: user?.screenName, userId: user?.userid });
            }
        } catch (error) {
            SendErrorTotheServer(error, 'GetUserDetails');
        }
    };

    // listen someone want to join
    useEffect(() => {
        if (streamrequestlist.length > 0) {
            setShowUI(true);
            showNotification('Someone wants to join as a guest', '');
            playNotification();
            setShowTooltip(true);
        }
    }, [streamrequestlist.length]);

    // hide setting modal
    const HidesettingPanel = () => {
        setOpenMoreSettingList(false);
    };

    // send friend request to host only
    const handleFriendRequestToHostOnly = async () => {
        try {
            const params = {
                requesterID: userData?.userid,
                receiverID: streamInfo?.hostID,
            }
            console.log('friend request to host params', params);
            const response = await Apiclient.post('/friends/request', params);
            console.log('response friend request to host only', response.data);

            if (response.data?.success) {
                // setMessage(`Request Sent To ${username}`)
                // setVisibleModal('message-modal')
                console.log('request sent to host successfully');
            }
            // else {
            //     setMessage(`${response.data?.message || 'Request Already Sent'}`) // Handle case where message is not provided
            //     setVisibleModal('message-modal')
            // }
        } catch (error) {
            SendErrorTotheServer(error, 'handleFriendRequestToHostOnly');
        }
    };


    // check friend request is pending in list or not 
    const checkFriendRequestIsPendingOrNot = async () => {
        try {
            const response = await Apiclient.get(`/friends/requests/${streamInfo?.hostID}`);
            console.log('response checkFriendRequestIsPendingOrNot', response.data);
            if (response.data) {
                setHostFriendRequestList(response.data);
            }
        } catch (error) {
            SendErrorTotheServer(error, 'checkFriendRequestIsPendingOrNot');
        }
    };

    useEffect(() => {
        checkFriendRequestIsPendingOrNot();
    }, []);

    // toggle like-dislike
    const ToggleLike = () => {
        // checkFriendRequestIsPendingOrNot();
        if (isLiked) {
            socket.emit('Dislike-count');
            setisLiked(!isLiked);
        } else {
            setisLiked(!isLiked);
            socket.emit('like-count');
            console.log('myFriendList', myFriendList);

            // check if already friend
            const checkIsFriend = myFriendList.some(
                (ele) => ele.userid === streamInfo?.hostID
            );

            // check if friend request is already pending
            const checkIsFriendRequestPendingOrNot = hostFriendRequestList.some(
                (ele) => ele.RequesterID === userData?.userid
            );

            console.log('checkIsFriend', checkIsFriend);
            console.log('checkIsFriendRequestPendingOrNot', checkIsFriendRequestPendingOrNot);


            // ✅ only call API if NOT already friend AND NOT already requested
            if (!checkIsFriend && !checkIsFriendRequestPendingOrNot) {
                handleFriendRequestToHostOnly();
            }
        }
    };

    // play gift sound
    const playGiftSound = () => {
        try {
            const sound = new Sound('gift_received', Sound.MAIN_BUNDLE, (error) => {
                if (error) {
                    SendErrorTotheServer(error, 'playGiftSound');
                    return;
                }
                sound.play(() => {
                    sound.release();
                });
            });
        } catch (error) {
            SendErrorTotheServer(error, 'playGiftSound');
        }
    };

    // play notification sound
    const playNotification = () => {
        try {
            const sound = new Sound('notification', Sound.MAIN_BUNDLE, (error) => {
                if (error) {
                    SendErrorTotheServer(error, 'playNotification');
                    return;
                }
                sound.play(() => {
                    sound.release();
                });
            });
        } catch (error) {
            SendErrorTotheServer(error, 'playNotification');
        }
    };

    // open report modal
    const HandleReport = () => {
        setVisibleModal('ReportVideo');
    };

    // handle like count
    const HandleLikeCount = (count) => {
        setStreamupdated((prev) => ({ ...prev, LikeCount: count }));
        GetViewerAndLikeCount();
    };


    // get total gifts received coins of host
    // const getTotalGiftsReceivedCoins = async () => {
    //     try {
    //         const params = {
    //             toUserId: streamInfo?.hostID,
    //             gifterCount: 10000,
    //         };
    //         const response = await Apiclient.post('/topgifters', params);
    //         // console.log('total gifts coins res', response);
    //         if (response.status === 200) {
    //             const data = response?.data;
    //             const totalAmount = data.reduce((sum, item) => sum + Number(item.Amount), 0);
    //             console.log('total gift Amount of host', totalAmount);
    //             setTotalGiftCoinReceived(totalAmount);
    //         }
    //     } catch (error) {
    //         SendErrorTotheServer(error, 'getTotalGiftsReceivedCoins');
    //     }
    // };

    // useEffect(() => {
    //     getTotalGiftsReceivedCoins();
    // }, []);

    // get total gift by room
    const getTotalGiftByRoom = async () => {
        try {
            const params = {
                toUserID: streamInfo?.hostID,
                roomId: streamInfo?.roomID,
            };
            console.log('params gift by room', params);
            const response = await Apiclient.post('/topgifters/getGiftsByRoom', params);
            console.log('gift by room response', response.data);
            if (response.data.success && Array.isArray(response.data.data)) {
                const totalGiftValueSum = response.data.data.reduce((acc, item) => {
                    return acc + Number(item.totalGiftValue || 0);
                }, 0);
                console.log('gift by room sortedData', totalGiftValueSum);
                setTotalGiftByRoom(totalGiftValueSum || 0);
            }
        } catch (error) {
            SendErrorTotheServer(error, 'getTotalGiftByRoom');
        }
    };

    useEffect(() => {
        getTotalGiftByRoom();
    }, []);

    // handle gift received
    const HandleGiftReceived = async (senderName, receiverName, giftName) => {
        try {
            if (userData?.screenName === senderName) return
            playGiftSound();
            setReceiveAnimationData({
                giftName: giftName,
                senderName: senderName,
                ReceiverName: receiverName,
            });
            // await getTotalGiftsReceivedCoins();
            await GetUserDetails(streamInfo?.hostID);
            await getTotalGiftByRoom();
            setShowReceiveAnimation(true);
        } catch (error) {
            SendErrorTotheServer(error, 'HandleGiftReceived');
        }
    };

    // friend request modal open
    const HandleFriendRequestMessage = (msg) => {
        setMessage(msg);
        setVisibleModal('message-modal');
    };

    // get friend data
    const getFriendsData = useCallback(async () => {
        if (!userData.userid) return
        try {
            const postData = {
                userId: userData.userid,
                isBlocked: 0,
            };

            const response = await Apiclient.post('/getFriendsList', postData);
            if (response.status === 200) {
                const data = response.data?.friends || [];
                setMyFriendList(data);
            }
        } catch (error) {
            SendErrorTotheServer(error, 'getFriendsList');
        }
    }, []);

    // socket event listen
    useEffect(() => {
        getFriendsData();
        socket.on('like-count', HandleLikeCount);
        socket.on('received-Gift', HandleGiftReceived);
        socket.on('receive-request', HandleFriendRequestMessage);
        return () => {
            socket.off('like-count', HandleLikeCount);
            socket.off('received-Gift', HandleGiftReceived);
            socket.off('receive-request', HandleFriendRequestMessage);
        };
    }, []);



    // send gift
    const SendGift = async (item) => {
        try {
            if (!GiftSenderData) return;
            const params = {
                fromUserID: userData?.userid,
                toUserID: GiftSenderData.userId,
                giftID: item?.giftID,
                roomId: streamInfo?.roomID,
            };
            const Responce = await Apiclient.post('/sendGifts', params);
            if (Responce.data) {
                if (Responce.data.success) {
                    if (streamInfo?.hostID === GiftSenderData.userId) {
                        socket.emit('Send-gift', userData?.screenName, true, GiftSenderData.userName, item?.giftIcon, item?.giftValue)
                    } else {
                        socket.emit('Send-gift', userData?.screenName, false, GiftSenderData.userName, item?.giftIcon, item?.giftValue);
                    }
                    // Show animation
                    setSendAnimationData({
                        giftName: item?.giftIcon,
                        recipientName: GiftSenderData.userName,
                    });
                    setShowSendAnimation(true);
                    // Close modal
                    setGiftModalVisible(false);
                    // ✅ Call API again to update coins
                    // await getTotalGiftsReceivedCoins();
                    await GetUserDetails(streamInfo?.hostID);
                    await getTotalGiftByRoom();
                } else if (Responce.data.message) {
                    setMessage(Responce.data.message);
                    setVisibleModal('message-modal');
                    setGiftModalVisible(false);
                }
            }
        } catch (error) {
            SendErrorTotheServer(error, 'SendGift');
        }
    };

    // send gift to cost
    const HnadleSendGiftToCoHost = (UserID, UserName) => {
        setGiftSendData({ userName: UserName, userId: UserID });
        setGiftModalVisible(true);
    };

    // send friend request
    const handleFriendRequest = async (userid, username) => {
        try {
            if (!userData?.userid || !userid) {
                socket.emit('Clientlogs', 'handleFriendRequest', `userData?.userid--${userData?.userid}, userid--${userid}`);
                return;
            }
            const params = {
                requesterID: userData?.userid,
                receiverID: userid,
            };
            const responce = await Apiclient.post('/friends/request', params);
            if (responce.data?.success) {
                setMessage(`Request Sent To ${username}`);
                setVisibleModal('message-modal');
                socket.emit('Sent-request', userid, userData?.userid);
            } else {
                setMessage(`${responce.data?.message || 'Request Already Sent'}`);
                setVisibleModal('message-modal');
            }
        } catch (error) {
            SendErrorTotheServer(error, 'handleFriendRequest');
        }
    };

    // listen stream message if any
    useEffect(() => {
        if (streammsg !== null) {
            setMessage(streammsg)
            setVisibleModal('message-modal');
        }
    }, [streammsg]);

    // handle send animation completed
    const handleSendAnimationComplete = () => {
        setShowSendAnimation(false);
        setSendAnimationData(null);
    };

    // handle received animation complete
    const handleReceiveAnimationComplete = () => {
        setShowReceiveAnimation(false);
        setReceiveAnimationData(null);
    };

    // open chat message profile
    const HandleOpenChatUserProfile = (data) => {
        setOpenChatUserProfile(!openChatUserProfile);
        setSelectedUser(data);
    };

    // toggle show ui or not
    const HandleShowUi = () => {
        // setShowUI(!showUI);
        console.log('showUI', !showUI);
        // Keyboard.dismiss();
        // setIsTyping(false);
    };

    // update stream description
    const HandleNewStreamDesciption = async (description) => {
        try {
            const response = await Apiclient.get(`/rooms/updaterooms?roomID=${streamInfo?.roomID}&RoomName=${description}`);
            if (response.status === 200) {
                setStreamDescription(description);
                setEditStreamDescription(false);
                showNotification('Stream description updated successfully', '');
            } else {
            }
        } catch (error) {
            SendErrorTotheServer(error, 'HandleNewStreamDesciption');
        }
    };

    // format count number
    const formatCount = (num) => {
        if (num == null) {
            return '0';
        }
        if (num >= 1000000) {
            const m = Math.floor(num / 100000) / 10; // keep 1 decimal floored
            return (m % 1 === 0 ? m.toFixed(0) : m) + 'M';
        }
        if (num >= 1000) {
            const k = Math.floor(num / 100) / 10; // keep 1 decimal floored
            return (k % 1 === 0 ? k.toFixed(0) : k) + 'k';
        }
        return num.toString();
    };


    useEffect(() => {
        const handleStreamStoppedForCurrentUser = (targetId) => {
            if (socket.id === targetId) {
                console.log('[StreamRoom] Current user was stopped - removing local stream');
                setStreamLayout(prev => prev.filter(stream => stream.type !== 'local'));
            }
        };

        socket.on('User-streamStopped', handleStreamStoppedForCurrentUser);

        return () => {
            socket.off('User-streamStopped', handleStreamStoppedForCurrentUser);
        };
    }, [setStreamLayout]);



    useEffect(() => {
        const handleUserLeft = (leftUserId, userinfo) => {
            console.log('[StreamRoom] User left, cleaning stream:', leftUserId, userinfo);

            setStreamLayout(prev => {
                console.log('[StreamRoom] PREV layout before userLeft:', prev);

                const updated = prev.filter(stream => {
                    if (stream.type === 'remote') {
                        // --- FIX: Only remove tile of the user who actually left ---
                        const shouldRemove = stream.socketId === leftUserId;

                        console.log('[StreamRoom] CHECK stream tile:', {
                            tileSocketId: stream.socketId,
                            leftUserId,
                            shouldRemove,
                        });

                        if (shouldRemove && stream.stream) {
                            stream.stream.getTracks().forEach(track => {
                                console.log('[StreamRoom] Stopping track for tile due to userLeft:', {
                                    kind: track.kind,
                                    id: track.id,
                                    readyState: track.readyState,
                                });
                                track.stop();
                                track.enabled = false;
                            });
                        }

                        return !shouldRemove;
                    }

                    return true; // keep local stream
                });

                console.log('[StreamRoom] Updated streamLayout after user left:', updated.length, updated);
                return updated;
            });
        };

        socket.on('userLeft', handleUserLeft);
        return () => socket.off('userLeft', handleUserLeft);
    }, [streamerList]);

    useEffect(() => {
        // Clean up any streams with undefined names or missing streamer info
        const cleanupUndefinedStreams = () => {
            setStreamLayout(prev => {
                const validStreams = prev.filter(stream => {
                    // For remote streams, ensure they have valid streamer info
                    if (stream.type === 'remote') {
                        const hasValidInfo = streamerList.some(s =>
                            s.ID && s.UserID === stream.userId && s.Name && s.Name !== 'undefined'
                        );

                        if (!hasValidInfo && stream.stream) {
                            // Clean up invalid stream
                            stream.stream.getTracks().forEach(track => {
                                track.stop();
                                track.enabled = false;
                            });
                        }

                        return hasValidInfo;
                    }

                    // Keep local streams
                    return true;
                });

                if (validStreams.length !== prev.length) {
                    console.log('[cleanupUndefinedStreams] Removed invalid streams');
                }

                return validStreams;
            });
        };

        // Run cleanup when streamerList changes
        cleanupUndefinedStreams();
    }, [streamerList]);



    useEffect(() => {
        console.log('🎛 [StreamLayout] REBUILD (socketId-based)', {
            remoteStreamsCount: remoteStreams.length,
            streamerListCount: streamerList.length,
            isStreaming,
            hasLocalStream: !!localStream,
        });
    
        console.log("STREAMER LIST", streamerList.map(s => ({
            ID: s.ID,
            Name: s.Name,
            UserID: s.UserID
        })));
    
        console.log("REMOTE STREAMS", remoteStreams.map(r => ({
            socketId: r.id,
            streamId: r.stream?.id,
            videoTracks: r.stream?.getVideoTracks?.().map(t => t.id)
        })));
    
        // ⭐ NEW: Stabilization delay (150ms)
        const delayId = setTimeout(() => {
    
            const mapBySocketId = {};
    
            // 1) Remote Streams
            remoteStreams.forEach(({ id, stream, isSpeaking, audioLevel }) => {
                const StreamerInfo = streamerList.find((s) => s.ID === id);
    
                console.log('🎛 [StreamLayout] PROCESS REMOTE', {
                    socketId: id,
                    hasStreamerInfo: !!StreamerInfo,
                    hasStream: !!stream,
                });
    
                if (!StreamerInfo) return;
                if (!stream || typeof stream.toURL !== 'function') {
                    console.log('⚠️ [StreamLayout] remote stream missing or no toURL()', { socketId: id });
                    return;
                }
    
                const isFriend = myFriendList.some(friend => friend?.userid === StreamerInfo?.UserID);
                const Alevel = audioLevel ?? 0.04;
    
                mapBySocketId[id] = {
                    type: 'remote',
                    stream,
                    isFriend,
                    userId: StreamerInfo?.UserID,
                    socketId: id,
                    isMuted: StreamerInfo?.isMuted,
                    Name: StreamerInfo?.Name,
                    isSpeaking: !!isSpeaking,
                    audioLevel: Alevel,
                };
            });
    
            // 2) Local Stream
            if (localStream && isStreaming) {
                const SelfInfo = streamerList.find((s) => s.ID === socket.id);
    
                console.log('🎛 [StreamLayout] ADD LOCAL STREAM', {
                    socketId: socket.id,
                    hasSelfInfo: !!SelfInfo,
                });
    
                mapBySocketId[socket.id] = {
                    type: 'local',
                    stream: localStream,
                    isFriend: false,
                    userId: userData?.userid,
                    socketId: socket.id,
                    isMuted: SelfInfo?.isMuted ?? isMuted,
                    Name: `${userData?.screenName}`,
                    isSpeaking: false,
                    audioLevel: 0,
                };
            }
    
            // 3) Sorting
            const hostInfo = streamerList.find((s) => s.IsHost === true);
            const hostSocketId = hostInfo?.ID;
    
            let ordered = Object.values(mapBySocketId);
    
            ordered.sort((a, b) => {
                if (a.socketId === hostSocketId && b.socketId !== hostSocketId) return -1;
                if (b.socketId === hostSocketId && a.socketId !== hostSocketId) return 1;
    
                if (a.type === 'local' && b.type !== 'local') return isHost ? -1 : 1;
                if (b.type === 'local' && a.type !== 'local') return isHost ? 1 : -1;
    
                const nameA = a.Name || '';
                const nameB = b.Name || '';
                return nameA.localeCompare(nameB);
            });
    
            console.log('🎛 [StreamLayout] FINAL LAYOUT ORDER', ordered.map(s => ({
                type: s.type,
                socketId: s.socketId,
                name: s.Name,
                streamId: s.stream?.id,
            })));
    
            setStreamLayout(ordered);
    
        }, 500); // ⭐ BEST DELAY: 120–180 ms
    
        return () => clearTimeout(delayId);
    
    }, [
        remoteStreams,
        localStream,
        streamerList,
        isStreaming,
        myFriendList,
        userData,
        isHost,
        isMuted,
    ]);
    



    const handleGiftModalOpen = () => {
        // Close any other modals first
        if (visibleModal === 'luckyWheel') {
            handleLuckyWheelClose();
        }

        if (slotGameVisible) {
            handleSlotGameClose();
        }

        // Clear visibleModal state
        setVisibleModal(null);
        setIsLuckyWheelActiveInRoom(false);
        // Small delay for Android
        setTimeout(() => {
            setGiftModalVisible(true);
        }, 100);
    };

    // const onShare = async () => {
    //     try {
    //         const result = await Share.share({
    //             message: 'Check out this awesome link: https://streamalong.live',
    //             url: 'https://example.com', // Optional, used more on iOS
    //             title: 'Ziggsta'
    //         });

    //         if (result.action === Share.sharedAction) {
    //             if (result.activityType) {
    //                 console.log('Shared with activity type: ', result.activityType);
    //             } else {
    //                 console.log('Shared');
    //             }
    //         } else if (result.action === Share.dismissedAction) {
    //             console.log('Dismissed');
    //         }
    //     } catch (error) {
    //         SendErrorTotheServer(error, "onShare")
    //     }
    // };

    return (
        <>
            <View style={[styles.streamBox]}>
                {streamLayout.length === 1 ? (
                    <Pressable onPress={HandleShowUi}>
                        <View style={styles.videoContainer}>
                            {(() => {
                                const s = streamLayout[0];
                                const track = s?.stream?.getVideoTracks?.()[0];
                                console.log('🎥 [RTCView] RENDER SINGLE', {
                                    type: s?.type,
                                    socketId: s?.socketId,
                                    name: s?.Name,
                                    streamId: s?.stream?.id,
                                    trackId: track?.id,
                                    readyState: track?.readyState,
                                    enabled: track?.enabled,
                                });
                                return (
                                    <RTCView
                                        streamURL={s?.stream.toURL()}
                                        style={styles.fullScreenVideo}
                                        objectFit="cover"
                                        mirror={s?.type === 'local' && isFrontCamera}
                                    />
                                );
                            })()}
                            {/* rest unchanged */}

                            <View style={{ position: 'absolute', left: '40%', top: '40%' }}>
                                <Text>{streamLayout[0]?.isMuted && showUI && <Ionicons name="mic-off" size={70} color="#fff" />}</Text>
                            </View>
                            {streamLayout[0]?.type !== 'local' && streamLayout[0]?.audioLevel > 0 && (
                                <View style={{
                                    position: 'absolute',
                                    bottom: showUI ? insets.bottom + 70 : 10,
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
                        </View>
                    </Pressable>
                ) : (
                    <Pressable onPress={HandleShowUi}>
                        <View style={[styles.streamVideosContainer]}>
                            {streamLayout.length === 3 ? (
                                <View style={styles.threeUserRow}>
                                    <View style={styles.threeUserColumnLeft}>
                                        {(() => {
                                            const s0 = streamLayout[0];
                                            const t0 = s0?.stream?.getVideoTracks?.()[0];
                                            console.log('🎥 [RTCView] RENDER GRID[0]', {
                                                type: s0?.type,
                                                socketId: s0?.socketId,
                                                name: s0?.Name,
                                                streamId: s0?.stream?.id,
                                                trackId: t0?.id,
                                                readyState: t0?.readyState,
                                                enabled: t0?.enabled,
                                            });
                                            return (
                                                <RTCView
                                                    streamURL={s0.stream.toURL()}
                                                    style={styles.streamVideoFull}
                                                    objectFit="cover"
                                                    mirror={s0.type === 'local' && isFrontCamera}
                                                />
                                            );
                                        })()}

                                        <View style={{ position: 'absolute', left: '40%', top: '50%' }}>
                                            <Text>{streamLayout[0]?.isMuted && showUI && <Ionicons name="mic-off" size={30} color="#fff" />}</Text>
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
                                        {/* {streamLayout[0]?.type !== 'local' && showUI && (
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
                                                            {streamLayout[0]?.Name ? streamLayout[0]?.Name : 'Unknown User'}
                                                        </Text>
                                                        <TouchableOpacity
                                                            style={styles.friendRequestIcon}
                                                            disabled={streamLayout[0]?.isFriend}
                                                            onPress={() => handleFriendRequest(streamLayout[0]?.userId, streamLayout[0]?.Name)}
                                                        >
                                                            {streamLayout[0]?.isFriend ? (
                                                                <Image
                                                                    style={{
                                                                        width: 20,
                                                                        height: 20,
                                                                    }}
                                                                    source={require('../../assets/images/icons/friend-added.png')}
                                                                    resizeMode="contain"
                                                                    tintColor="white"
                                                                />
                                                            ) : (
                                                                <Ionicons name="person-add" size={18} color="#fff" />)}
                                                        </TouchableOpacity>
                                                    </View>
                                                </ImageBackground>
                                            </View>
                                        )} */}
                                    </View>
                                    <View style={styles.threeUserColumnRight}>
                                        {streamLayout.slice(1, 3).map((streamData) => (
                                            <View key={streamData.socketId} style={{ flex: 1, position: 'relative' }}>
                                                <RTCView
                                                    streamURL={streamData.stream.toURL()}
                                                    style={styles.streamVideoHalf}
                                                    objectFit="cover"
                                                    mirror={streamData.type === 'local' && isFrontCamera}
                                                />
                                                <View style={{ position: 'absolute', left: '40%', top: '40%' }}>
                                                    <Text>{streamData?.isMuted && showUI && <Ionicons name="mic-off" size={30} color="#fff" />}</Text>
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
                                                                    {streamData?.Name ? streamData.Name : 'Unknown User'}
                                                                </Text>
                                                                <TouchableOpacity
                                                                    style={styles.friendRequestIcon}
                                                                    disabled={streamData?.isFriend}
                                                                    onPress={() => handleFriendRequest(streamData?.userId, streamData?.Name)}
                                                                >
                                                                    {streamData?.isFriend ? (
                                                                        <Image
                                                                            style={{
                                                                                width: 20,
                                                                                height: 20,
                                                                            }}
                                                                            source={require('../../assets/images/icons/friend-added.png')}
                                                                            resizeMode="contain"
                                                                            tintColor="white"
                                                                        />
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
                                        {streamLayout.slice(0, 2).map((streamData) => (
                                            <View key={streamData.socketId} style={styles.fiveUserCol50}>
                                                <View style={styles.videoContainer}>
                                                    <RTCView
                                                        streamURL={streamData.stream.toURL()}
                                                        style={styles.streamFiveUserVideo}
                                                        objectFit="cover"
                                                        mirror={streamData.type === 'local' && isFrontCamera}
                                                    />
                                                    <View style={{ position: 'absolute', left: '40%', top: '40%' }}>
                                                        <Text>{streamData?.isMuted && showUI && <Ionicons name="mic-off" size={30} color="#fff" />}</Text>
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
                                                                        {streamData?.Name ? streamData.Name : 'Unknown User'}
                                                                    </Text>
                                                                    <TouchableOpacity
                                                                        style={styles.friendRequestIcon}
                                                                        disabled={streamData?.isFriend}
                                                                        onPress={() => handleFriendRequest(streamData?.userId, streamData?.Name)}
                                                                    >
                                                                        {streamData?.isFriend ? (
                                                                            <Image
                                                                                style={{
                                                                                    width: 20,
                                                                                    height: 20,
                                                                                }}
                                                                                source={require('../../assets/images/icons/friend-added.png')}
                                                                                resizeMode="contain"
                                                                                tintColor="white"
                                                                            />
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
                                        {streamLayout.slice(2, 5).map((streamData) => (
                                            <View key={streamData.socketId} style={styles.fiveUserCol33}>
                                                <View style={styles.videoContainer}>
                                                    <RTCView
                                                        streamURL={streamData.stream.toURL()}
                                                        style={styles.streamFiveUserVideo}
                                                        objectFit="cover"
                                                        mirror={streamData.type === 'local' && isFrontCamera}
                                                    />
                                                    <View style={{ position: 'absolute', left: '40%', top: '40%' }}>
                                                        <Text>{streamData?.isMuted && showUI && <Ionicons name="mic-off" size={30} color="#fff" />}</Text>
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
                                                                        {streamData?.Name ? streamData.Name : 'Unknown User'}
                                                                    </Text>
                                                                    <TouchableOpacity
                                                                        style={styles.friendRequestIcon}
                                                                        disabled={streamData?.isFriend}
                                                                        onPress={() => handleFriendRequest(streamData?.userId, streamData?.Name)}
                                                                    >
                                                                        {streamData?.isFriend ? (
                                                                            <Image
                                                                                style={{
                                                                                    width: 15,
                                                                                    height: 15,
                                                                                }}
                                                                                source={require('../../assets/images/icons/friend-added.png')}
                                                                                resizeMode="contain"
                                                                                tintColor="white"
                                                                            />
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
                                            <Fragment key={streamData.socketId}>
                                                <View style={[styles.videoContainer, getVideoTileStyle(streamLayout.length)]}>
                                                    <RTCView
                                                        key={streamData.type === 'local' ? 'local' : streamData.userId}
                                                        streamURL={streamData.stream.toURL()}
                                                        style={[styles.streamVideo]}
                                                        objectFit="cover"
                                                        mirror={streamData.type === 'local' && isFrontCamera}
                                                    />
                                                    <View style={{ position: 'absolute', left: '40%', top: '40%' }}>
                                                        <Text>{streamData?.isMuted && showUI && <Ionicons name="mic-off" size={streamLayout.length == 6 || streamLayout.length == 4 ? 30 : 40} color="#fff" />}</Text>
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
                                                        {index !== 0 && streamData?.type !== 'local' && showUI && (
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
                                                                        {streamData?.Name ? streamData.Name : 'Unknown User'}
                                                                    </Text>
                                                                    <TouchableOpacity
                                                                        style={styles.friendRequestIcon}
                                                                        disabled={streamData?.isFriend}
                                                                        onPress={() => handleFriendRequest(streamData?.userId, streamData?.Name)}
                                                                    >
                                                                        {streamData?.isFriend ? (
                                                                            <Image
                                                                                style={{
                                                                                    width: streamLayout.length == 6 ? 15 : streamLayout.length == 4 ? 20 : 22,
                                                                                    height: streamLayout.length == 6 ? 15 : streamLayout.length == 4 ? 20 : 22,
                                                                                }}
                                                                                source={require('../../assets/images/icons/friend-added.png')}
                                                                                resizeMode="contain"
                                                                                tintColor="white"
                                                                            />
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
                    </Pressable>
                )}
                {isStreaming && (
                    <>
                        {/* Stream Room Header */}
                        {showUI && (<View style={styles.strRoomHeader}>
                            <Pressable
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 5,
                                }}
                                onPress={() => setOpenHostPorfile(!OpenHostPorfile)}
                            >
                                <View style={styles.strRoomHeaderLeft}>
                                    <Image
                                        style={styles.strRoomHeaderLeftProfileImg}
                                        source={!userDetails?.avatar || userDetails?.avatar === 'default' ?
                                            getGenderFallbackImage(userDetails?.gender) : { uri: userDetails?.avatar }}
                                    />
                                    <View>
                                        {/* host name */}
                                        <Text style={[styles.strRoomHeaderLeftProfileName]}>
                                            {userDetails?.screenName}
                                        </Text>
                                        {/* All total likes & All time coins */}
                                        <View style={[styles.strRoomHeaderLeftProfileSubInfo]}>
                                            {/* total likes */}
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                                                <Ionicons name="heart" size={13} color="white" />
                                                {/* <Text style={{ color: 'white' }}>{Streamupdated.LikeCount}</Text> */}
                                                <Text style={{ color: 'white', fontSize: 12, fontWeight: 600 }}>{formatCount(likeAndViewerCount.likeCount)}</Text>
                                            </View>
                                            {/* total coins */}
                                            {/* <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                                                <Image
                                                    source={require('../../assets/images/icons/icon_z.png')}
                                                    style={{ width: 14, height: 14 }}
                                                    resizeMode="contain"
                                                />
                                                <Text style={{ color: '#ffea23', fontSize: 12, fontWeight: 600 }}>{totalGiftCoinReceived}</Text>
                                            </View> */}
                                            {/* total balance */}
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                                                <Image
                                                    source={require('../../assets/images/icons/icon_z.png')}
                                                    style={{ width: 14, height: 14 }}
                                                    resizeMode="contain"
                                                />
                                                <Text style={{ color: '#ffea23', fontSize: 12, fontWeight: 600 }}>{Number(userDetails?.CreditBalance).toFixed(0)}</Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                                {/* viewer count management */}
                                <View style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 3 }}>
                                    <TouchableOpacity
                                        style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            backgroundColor: 'rgba(36, 32, 32, 0.75)',
                                            gap: 10,
                                            paddingHorizontal: 8,
                                            paddingVertical: 1,
                                            borderRadius: 21,
                                        }}
                                        onPress={() => {
                                            setOpenViewerList(true);
                                        }}
                                    >
                                        {/* total view count */}
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                                            <Ionicons name="eye" size={13} color="#1F85F5" />
                                            <Text style={{ color: '#1F85F5', fontSize: 12, fontWeight: 600 }}>{formatCount(Streamupdated.TotalViewerCount)}</Text>
                                        </View>
                                        {/* current viewer count */}
                                        {isHost && (
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                                                <Ionicons name="eye" size={13} color="#00BD35" />
                                                <Text style={{ color: '#00BD35', fontSize: 12, fontWeight: 600 }}>{formatCount(Streamupdated.viewerCount)}</Text>
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                    {/* coins earned in current stream */}
                                    <View
                                        style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            gap: 7,
                                            minWidth: 45,
                                            backgroundColor: 'rgba(36, 32, 32, 0.75)',
                                            borderRadius: 21,
                                            paddingRight: 5,
                                            paddingVertical: 1,

                                        }}>
                                        <Image
                                            source={require('../../assets/images/icons/icon_z.png')}
                                            style={{ width: 14, height: 14 }}
                                            resizeMode="contain"
                                        />
                                        <Text
                                            style={{ color: '#fff', fontSize: 12, fontWeight: 600 }}
                                        >
                                            {totalGiftByRoom}
                                        </Text>
                                    </View>
                                </View>
                            </Pressable>
                            {/* close stream button */}
                            <View style={styles.strRoomHeaderRight}>
                                <TouchableOpacity onPress={confirmleaveRoom} style={styles.strRoomHeaderRIconBox}>
                                    <Ionicons name="close" size={30} color="#fff" />
                                </TouchableOpacity>
                            </View>
                        </View>)}
                        {/* stream gradient fix box */}
                        <View style={[styles.strGradientBox, { bottom: insets.bottom || 0 }]}>
                            <LinearGradient
                                colors={streamLayout.length === 1 ? ['rgba(8, 8, 8, 1)', 'rgba(8, 8, 8, 0)'] : ['#1d1d1d', '#1d1d1d']}
                                start={{ x: 0.5, y: 1 }}
                                end={{ x: 0.5, y: 0 }}
                                style={[styles.strRoomFooter]}
                            >
                                {''}
                            </LinearGradient>
                        </View>
                        <>
                            {/* chat message container */}
                            {!openMoreSettingList && (
                                <View style={[styles.strRoomFooterChatOrActionsBox, {
                                    bottom: (keyboardOffset > 0 ? keyboardOffset : insets.bottom) + 60,  // ← CHANGED: Lift with keyboard + input height
                                }]}>
                                    {/* chat message box */}
                                    <View style={[styles.streamChatContainer]}>
                                        <ScrollView
                                            ref={scrollViewRef}
                                            showsVerticalScrollIndicator={false}
                                        >
                                            {showUI && (
                                                roomchat.map((chat, ind) => (
                                                    <View key={ind} style={styles.streamChatItem}>
                                                        <TouchableOpacity
                                                            onPress={() => HandleOpenChatUserProfile(chat)}
                                                        >
                                                            <Image
                                                                style={styles.streamChatItemProfileImg}
                                                                source={!chat.userProfile || chat.userProfile === 'default'
                                                                    ? getGenderFallbackImage(chat.Gender)
                                                                    : { uri: chat.userProfile }
                                                                }
                                                            />
                                                        </TouchableOpacity>
                                                        <View numberOfLines={1} style={styles.streamChatMessageBox}>
                                                            <Text
                                                                numberOfLines={1}
                                                                style={[styles.streamChatUserName,
                                                                {
                                                                    color:
                                                                        `${chat?.TYPE === 'USERJOINED' ? '#00F6CD'
                                                                            : chat.TYPE === 'USERLEFT' ? '#DC112C' : '#DEEE4F'}`,
                                                                    paddingTop: `${chat?.TYPE === 'USERJOINED' ? 10 : 0}`,
                                                                }]}>
                                                                {chat.userName?.length > 30
                                                                    ? chat.userName?.slice(0, 30) + '...' : chat?.userName}
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
                                    {/* chat message icon box right side */}
                                    {showUI && keyboardOffset === 0 && (
                                        <View style={styles.strRoomFooterSocialActions}>
                                            {/* gift icon for user */}
                                            {!isHost && (
                                                <TouchableOpacity
                                                    onPress={handleGiftModalOpen}
                                                    style={styles.strRoomFooterSocialActionsBtn}
                                                >
                                                    <Ionicons name="gift" size={35} color="#FF00FF" />
                                                </TouchableOpacity>
                                            )}
                                            {/* solt game */}
                                            {!isHost && (
                                                <TouchableOpacity
                                                    style={styles.strRoomFooterSocialActionsBtn}
                                                    onPress={handleSlotGameOpen}
                                                >
                                                    <Image
                                                        style={{
                                                            width: 35,
                                                            height: 35,
                                                        }}
                                                        source={require('../../assets/images/solt-game/slot-machine.png')}
                                                        resizeMode="contain"
                                                    />
                                                </TouchableOpacity>
                                            )}
                                            {/* lucky wheel */}
                                            {!isHost && (
                                                <TouchableOpacity
                                                    style={[styles.strRoomFooterSocialActionsBtn, { position: 'relative' }]}
                                                    onPress={handleLuckyWheelOpen}
                                                    activeOpacity={0.7}
                                                >
                                                    <Animated.Image
                                                        style={{
                                                            width: 35,
                                                            height: 35,
                                                            transform: [{ rotate: spin }], // always the animated value
                                                        }}
                                                        source={require('../../assets/images/lucky-wheel/lw-home.png')}
                                                        resizeMode="contain"

                                                    />
                                                    {/* Red dot for new users or when lucky wheel is available */}
                                                    {shouldShowRedDotOnLuckyWheel() && (
                                                        <GlowingRedDot />
                                                    )}
                                                </TouchableOpacity>
                                            )}
                                            {/* send friend request to host  */}
                                            {/* {!isHost && streamerList?.length === 1 && (
                                                <TouchableOpacity style={styles.strRoomFooterSocialActionsBtn} disabled={streamLayout[0]?.isFriend} onPress={() => handleFriendRequest(userDetails?.userid, userDetails?.screenName)}>
                                                    {streamLayout[0]?.isFriend ? (
                                                        <>
                                                            <Image
                                                                style={{
                                                                    width: 32,
                                                                    height: 32,
                                                                }}
                                                                source={require('../../assets/images/icons/friend-added.png')}
                                                                resizeMode="contain"
                                                                tintColor="#4dff17ff"
                                                            />
                                                        </>
                                                    ) : (
                                                        <Ionicons name="person-add" size={30} color="#fff" />)}
                                                </TouchableOpacity>
                                            )} */}

                                            {/* {!isHost &&
                                            <TouchableOpacity style={[styles.strRoomFooterSocialActionsBtn, { display: openMoreSettingList ? 'none' : 'flex' }]}>
                                                <Ionicons name="share-social-sharp" size={30} color="#fff" />
                                            </TouchableOpacity>
                                        } */}
                                        </View>)}
                                </View>
                            )}
                            {/* input box container */}
                            {showUI && (<View style={[
                                styles.strRoomBottomBox,
                                { bottom: keyboardOffset > 0 ? keyboardOffset : insets.bottom },
                            ]}>
                                <TextInput
                                    ref={inputRef}
                                    placeholder=""
                                    placeholderTextColor="#414141"
                                    value={userChatInput}
                                    onChangeText={setUserChatInput}
                                    onFocus={() => setIsTyping(true)}
                                    onBlur={() => setIsTyping(false)}
                                    onSubmitEditing={HadleSendChat}
                                    style={styles.strRoomBottomBoxInput}
                                    blurOnSubmit={true}
                                    returnKeyType="send"
                                />
                                {keyboardOffset && isTyping ? (
                                    <TouchableOpacity onPress={() => HadleSendChat()} style={styles.strRoomBottomBoxIconBox}>
                                        <FontAwesome name="send" size={24} color="#00FF00" />
                                    </TouchableOpacity>
                                ) : (
                                    <>
                                        {/* open more setting */}
                                        <TouchableOpacity
                                            onPress={() => {
                                                animateIcon();
                                                setOpenMoreSettingList(!openMoreSettingList);
                                            }}
                                            style={styles.strRoomBottomBoxIconBox}
                                        >
                                            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                                                {openMoreSettingList ?
                                                    <Ionicons name="close-outline" size={30} color="#fff" />
                                                    :
                                                    <Image source={require('../../assets/images/icons/icon_video.png')}
                                                        style={{ height: 30, width: 30 }}
                                                        resizeMode="contain"
                                                    />
                                                }
                                            </Animated.View>
                                        </TouchableOpacity>
                                        {/* share button */}
                                        {isHost && (
                                            <TouchableOpacity style={[styles.strRoomBottomBoxIconBox, { marginLeft: 20 }]}>
                                                <Ionicons name="share-social-sharp" size={30} color="#fff" />
                                            </TouchableOpacity>
                                        )}
                                        {/* like-dislike */}
                                        {!isHost &&
                                            (
                                                <TouchableOpacity
                                                    style={styles.strRoomBottomBoxIconBox}
                                                    onPress={ToggleLike}
                                                    disabled={isHost}
                                                >
                                                    <Ionicons name="heart" size={30} color={isLiked ? 'red' : '#fff'} />
                                                </TouchableOpacity>
                                            )}
                                        {/* shopping cart */}
                                        {!isHost && (<>
                                            <TouchableOpacity style={[styles.strRoomBottomBoxIconBox, { marginRight: 4 }]}>
                                                <Ionicons name="cart" size={30} color="#fff" />
                                            </TouchableOpacity>
                                        </>)}
                                        {/* co-host pending request box */}
                                        {isHost && (
                                            <TouchableOpacity
                                                style={[styles.strRoomBottomBoxIconBox]}
                                                onPress={() => {
                                                    setTogglerequest(!togglerequest);
                                                    setShowTooltip(false);
                                                }}
                                            >
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
                                                                transform: [{ translateX: -5 }, { translateY: -5 }],
                                                            },
                                                            {
                                                                opacity: opacityAnim,
                                                                transform: [{ scale: scaleAnim1 }],
                                                            },
                                                        ]}
                                                    />)}
                                                <Image
                                                    source={require('../../assets/images/icons/icon_add_users.png')}
                                                    style={{
                                                        width: 32,
                                                        height: 32,
                                                    }}
                                                    resizeMode="contain"
                                                />
                                            </TouchableOpacity>
                                        )}
                                    </>
                                )}
                                {/* more setting icon box */}
                                {openMoreSettingList && showUI && (
                                    <Animated.View
                                        style={[
                                            styles.strMoreSettingListContainer,
                                            {
                                                opacity: animatedOpacity,
                                                transform: [{ translateY: animatedTranslateY }],
                                            },
                                        ]}
                                    >
                                        {/* flip camera */}
                                        <TouchableOpacity
                                            onPress={() => {
                                                switchCamera();
                                                HidesettingPanel();
                                            }}
                                            style={styles.strMoreSettingListItem}
                                        >
                                            <Text style={styles.strMoreSettingListItemText}>Flip Camera</Text>
                                            <Ionicons name="camera-reverse" size={20} color="#fff" />
                                        </TouchableOpacity>
                                        {/* Join As a Guest */}
                                        {!isHost && (
                                            <TouchableOpacity
                                                onPress={() => {
                                                    requestStreamPermission(),
                                                        HidesettingPanel(),
                                                        setVisibleModal('message-modal'),
                                                        setMessage('Request Send To the Host')
                                                }}
                                                style={styles.strMoreSettingListItem}
                                                disabled={hasRequestedStream}
                                            >
                                                <Text
                                                    style={
                                                        [styles.strMoreSettingListItemText,
                                                        { color: hasRequestedStream ? '#007ACC' : 'white' }]}
                                                >
                                                    {hasRequestedStream ? 'Already Requested' : 'Join As a Guest'}
                                                </Text>
                                                <MaterialCommunityIcons
                                                    name="video-plus"
                                                    size={21}
                                                    color={`${hasRequestedStream ? '#007ACC' : 'white'}`}
                                                />
                                            </TouchableOpacity>
                                        )}
                                        {/* mute-unmute */}
                                        <TouchableOpacity
                                            onPress={() => {
                                                toggleMute();
                                                HidesettingPanel();
                                            }}
                                            style={styles.strMoreSettingListItem}
                                        >
                                            <Text
                                                style={styles.strMoreSettingListItemText}
                                            >
                                                Mute {isMuted?.muted ? 'OFF' : 'ON'}
                                            </Text>
                                            {isMuted?.muted ?
                                                <Ionicons
                                                    name="mic"
                                                    size={20}
                                                    color="#fff"
                                                />
                                                :
                                                <Ionicons
                                                    name="mic-off"
                                                    size={20}
                                                    color="#fff"
                                                />
                                            }
                                        </TouchableOpacity>
                                        {/* edit stream title */}
                                        {isHost &&
                                            (
                                                <TouchableOpacity
                                                    onPress={() => {
                                                        setEditStreamDescription(true);
                                                        HidesettingPanel();
                                                    }}
                                                    style={styles.strMoreSettingListItem}
                                                >
                                                    <Text
                                                        style={styles.strMoreSettingListItemText}
                                                    >
                                                        Edit Stream Title
                                                    </Text>
                                                    <AntDesign name="edit" size={20} color="#fff" />
                                                </TouchableOpacity>
                                            )
                                        }
                                        {/* Report */}
                                        {!isHost
                                            && (
                                                <TouchableOpacity
                                                    onPress={() => {
                                                        HidesettingPanel();
                                                        HandleReport();
                                                    }}
                                                    style={styles.strMoreSettingListItem}
                                                >
                                                    <Text style={styles.strMoreSettingListItemText}>Report</Text>
                                                    <Ionicons name="flag" size={20} color="#dc3131" />
                                                </TouchableOpacity>
                                            )}
                                    </Animated.View>
                                )}
                            </View>)}
                        </>
                    </>
                )}
            </View>

            {/* Gift Modal */}
            {
                giftModalVisible && (
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
                                    <>
                                        <FlatList
                                            data={giftsData}
                                            numColumns={4}
                                            keyExtractor={(item, index) => item.giftIcon + index}
                                            showsVerticalScrollIndicator={true}
                                            indicatorStyle="white" // or "black", not hex
                                            initialNumToRender={12}
                                            windowSize={5}
                                            maxToRenderPerBatch={10}
                                            removeClippedSubviews={true}
                                            contentContainerStyle={styles.giftModalCategoryItemsContainer}
                                            ListEmptyComponent={
                                                giftDataLoading ? (
                                                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', height: 150 }}>
                                                        <ActivityIndicator size="large" />
                                                    </View>
                                                ) : null
                                            }
                                            renderItem={({ item }) => {
                                                const localImage = giftImages[item.giftIcon];
                                                if (!localImage) return null;

                                                return (
                                                    <TouchableOpacity
                                                        style={styles.giftModalCatItem}
                                                        onPress={() => SendGift(item)}
                                                    >
                                                        <FastImage
                                                            style={styles.giftModalCatItemImage}
                                                            source={localImage}
                                                            resizeMode={FastImage.resizeMode.contain}
                                                        />
                                                    </TouchableOpacity>
                                                );
                                            }}
                                        />

                                    </>
                                ) : (
                                    <View style={styles.noGiftsTextContainer}>
                                        <Text style={styles.noGiftsTextContent}>No gifts available for this category</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    </Modal>
                )
            }

            {/* Message Modal */}
            {
                visibleModal === 'message-modal' && (
                    <MessageModal
                        visible={visibleModal === 'message-modal'}
                        message={message}
                        onClose={() => setVisibleModal(null)}
                    />
                )
            }
            {/* Request Modal */}

            {isHost && <RequestModal visible={togglerequest} onClose={() => setTogglerequest(false)} StreamRequestList={streamrequestlist} streamGuest={streamGuest} />}


            {/* close stream modal  */}
            {
                closeStreamModal && (
                    <ConfirmModal visible={closeStreamModal} onClose={() => setCloseStreamModal(false)} leaveRoom={leaveRoom} />
                )
            }

            {/* Update Stream Description Modal */}
            {
                editstreamdescription && (
                    <UpdateStreamDescriptionModal visible={editstreamdescription} onClose={() => setEditStreamDescription(false)} description={streamDescription} HandleNewStreamDesciption={HandleNewStreamDesciption} />
                )
            }

            {/* Report Video Modal */}
            {
                visibleModal === 'ReportVideo' && (
                    <ReportUserModal
                        visible={visibleModal === 'ReportVideo'}
                        onClose={() => {
                            setVisibleModal(null);
                        }}
                        reportData={userDetails}
                        RoomID={streamInfo?.roomID}
                        reportType="Video"
                    />
                )
            }

            {/* Viewer List Modal */}
            {
                OpenViewerLIst && (
                    <ViewerTotalLIst
                        visible={OpenViewerLIst}
                        onClose={() => setOpenViewerList(false)}
                        userDetails={userDetails}
                        RoomID={streamInfo?.roomID}
                    />
                )
            }

            {/* Send Animation - shown to the gift sender */}
            {
                showSendAnimation && sendAnimationData && (
                    <GiftSendAnimation
                        giftName={sendAnimationData.giftName}
                        recipientName={sendAnimationData.recipientName}
                        onComplete={handleSendAnimationComplete}
                    />
                )
            }

            {/* Receive Animation - shown to the gift receiver (host) */}
            {
                showReceiveAnimation && receiveAnimationData && (
                    <GiftReceiveAnimation
                        giftName={receiveAnimationData.giftName}
                        senderName={receiveAnimationData.senderName}
                        ReceiverName={receiveAnimationData.ReceiverName}
                        onComplete={handleReceiveAnimationComplete}
                    />
                )
            }

            {/* Profile Modal */}
            {
                OpenHostPorfile && (
                    <ProfileScreenModal
                        visible="true"
                        onClose={() => setOpenHostPorfile(false)}
                        profileData={userDetails}
                        isMainProfile={true}
                        isViewer={true}
                    />
                )
            }

            {/* Chat User Profile Modal */}
            {
                openChatUserProfile && (
                    <ProfileScreenModal
                        visible="true"
                        onClose={() => setOpenChatUserProfile(false)}
                        profileData={SelectedUser}
                        isMainProfile={true}
                        isViewer={true}
                    />
                )
            }

            {/* Notification Modal */}
            {
                notification.isVisible && (
                    <AnimatedNotification
                        message={notification.message}
                        isVisible={notification.isVisible}
                        onHide={hideNotification}
                        type={notification.type}
                    />
                )
            }

            {/* Lucky Wheel Modal */}
            {(visibleModal === 'luckyWheel' || luckyWheelVisible) && (
                <LuckyWheelModal
                    visible={visibleModal === 'luckyWheel' || luckyWheelVisible}
                    onClose={handleLuckyWheelClose} // This only closes for current user
                    userData={userData}
                    hostDetails={userDetails}
                    RoomID={streamInfo?.roomID}
                    openedBy={luckyWheelOpenedBy}
                    isSelfOpened={luckyWheelOpenedBy?.userId === userData?.userid}
                    setIsLuckyWheelActiveInRoom={setIsLuckyWheelActiveInRoom}
                />
            )
            }
            {/* Slot Game Modal */}
            {(visibleModal === 'slot-game' || slotGameVisible) && (
                <SlotGameModal
                    visible={visibleModal === 'slot-game' || slotGameVisible}
                    onClose={handleSlotGameClose}
                    userData={userData}
                    hostDetails={userDetails}
                    roomId={streamInfo?.roomID}
                    openedBy={slotGameOpenedBy}
                    isSelfOpened={visibleModal === 'slot-game'}
                />
            )
            }
        </>
    );
};

export default StreamRoom;