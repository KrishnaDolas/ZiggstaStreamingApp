/* eslint-disable react-native/no-inline-styles */
import {
    View, Text, TouchableOpacity, Alert, Image, ScrollView, Dimensions, TextInput, Keyboard, Animated,
    Easing,
    ActivityIndicator,
    Pressable, BackHandler,
    ImageBackground,
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
import HorseRaceGameModal from '../modals/HorseRaceGameModal';
import { debugLog } from '../utils/debugLogger';

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
    const isConnectStream =
        streamInfo?.streamType === 'connect';
    const screenHeight = Dimensions.get('window').height;
    const [keyboardOffset, setKeyboardOffset] = useState(0);
    const [giftsData, setGiftItems] = useState([]);
    const {
        userData,
        setUserData,
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
    const [showWelcomeModal, setShowWelcomeModal] = useState(false);
    const hasShownWelcomeModalRef = useRef(false);

    // ✅ NEW: Enhanced Game State Management
    const [luckyWheelVisible, setLuckyWheelVisible] = useState(false);
    const [luckyWheelOpenedBy, setLuckyWheelOpenedBy] = useState(null);
    const [slotGameVisible, setSlotGameVisible] = useState(false);
    const [slotGameOpenedBy, setSlotGameOpenedBy] = useState(null);
    const [activeGame, setActiveGame] = useState(null);
    const [isLuckyWheelActiveInRoom, setIsLuckyWheelActiveInRoom] = useState(false);

    // ✅ Add JukeBox state management
    const [jukeboxVisible, setJukeboxVisible] = useState(false);
    const [jukeboxOpenedBy, setJukeboxOpenedBy] = useState(null);
    const [isJukeboxActiveInRoom, setIsJukeboxActiveInRoom] = useState(false);

    // ✅ Horse Race Modal
    const [isHorseRaceModalVisible, setHorseRaceModalVisible] = useState(false);
    const [showHorseRace, setShowHorseRace] = useState(false);
    const [horseRoomId, setHorseRoomId] = useState(null);
    const [horseGameVisible, setHorseGameVisible] = useState(false);
    const [racePhase, setRacePhase] = useState(null);
    const [horseHorses, setHorseHorses] = useState([]);
    const [raceCountdown, setRaceCountdown] = useState(0);
    const [horsePositions, setHorsePositions] = useState([]);
    const [raceResults, setRaceResults] = useState(null);
    const [showRaceUI, setShowRaceUI] = useState(false);


    // ✅ Game Queue
    const [gameQueue, setGameQueue] = useState([]);
    const [myGamePosition, setMyGamePosition] = useState(null);
    const [gameModalVisible, setGameModalVisible] = useState(false);

    //  ✅ Slot Games
    const [slotVisible, setSlotVisible] = useState(false);
    const [currentSpinner, setCurrentSpinner] = useState(null);
    const gameInProgressRef = useRef(false);
    const luckyWheelActiveRef = useRef(false);
    const slotGameActiveRef = useRef(false);
    const horseGameActiveRef = useRef(false);
    const currentSpinRef = useRef(0);
    const [hasBought, setHasBought] = useState(false);
    const isInvoker = userData?.userid === invokerId;
    const [invokerId, setInvokerId] = useState(null);
    const [slotClosedLocally, setSlotClosedLocally] = useState(false);
    const [firstBetTimer, setFirstBetTimer] = useState(null);
    const luckyWheelClosingRef = useRef(false);

    useEffect(() => {

        if (
            isConnectStream &&
            streamLayout.length > 2
        ) {

            setStreamLayout(
                prev => prev.slice(0, 2)
            );
        }

    }, [
        streamLayout,
        isConnectStream
    ]);

    useEffect(() => {
        const handleStreamTotalUpdated = ({ addedAmount }) => {
            setTotalGiftByRoom(prev => ({
                ...prev,
                totalGameGifts: (prev.totalGameGifts || 0) + addedAmount,
                grandTotal: (prev.grandTotal || 0) + addedAmount,
            }));
        };

        const handleRoomFull = (msg) => {
            Alert.alert('Room Full', msg || 'Connect room is full');
            leaveRoom();
        };

        socket.on('stream_total_updated', handleStreamTotalUpdated);
        socket.on('roomFull', handleRoomFull);

        return () => {
            socket.off('stream_total_updated', handleStreamTotalUpdated);
            socket.off('roomFull', handleRoomFull);
        };
    }, [leaveRoom]);

    useEffect(() => {
        // ✅ only show to joiners/viewers, never host
        if (
            !isHost &&
            !hasShownWelcomeModalRef.current &&
            (remoteStreams.length > 0 || localStream)
        ) {
            hasShownWelcomeModalRef.current = true;
            setShowWelcomeModal(true);
        }
    }, [remoteStreams, localStream, isHost]);

    useEffect(() => {
        const handleCloseSlotGame = () => {
            slotGameActiveRef.current = false;
            setSlotGameVisible(false);
            setVisibleModal(null);
            setActiveGame(null);
        };

        socket.on('close_slot_game', handleCloseSlotGame);

        return () => {
            socket.off('close_slot_game', handleCloseSlotGame);
        };
    }, []);

    useEffect(() => {
        const handleSlotBroadcast = (data) => {
            slotGameActiveRef.current = true; // Lock
            setVisibleModal('slot-game');
            setActiveGame('slot-game');
            setSlotGameVisible(true);
        };

        socket.on('slotGameBroadcast', handleSlotBroadcast);

        return () => {
            socket.off('slotGameBroadcast', handleSlotBroadcast);
        };
    }, []);

    useEffect(() => {
        if (!streamInfo?.roomID || !socket?.id) {
            return;
        }

        socket.emit('register_player', {
            userId: userData?.userid || null,
            hostId: streamInfo?.hostID,
            roomId: streamInfo?.roomID,
        });
    }, [
        streamInfo?.roomID,
        streamInfo?.hostID,
        userData?.userid,
    ]);

    useEffect(() => {
        const id = rotateAnim.addListener(({ value }) => {
            currentSpinRef.current = value;
        });
        return () => {
            rotateAnim.removeListener(id);
        };
    }, [rotateAnim]);

    useEffect(() => {

        socket.on('queuePosition', ({ position }) => {
            Alert.alert(`Your game is ${position} in queue`);
        });

        return () => {
            socket.off('queuePosition');
        };

    }, []);

    useEffect(() => {
        const handleCloseSlotGame = (data) => {
            setSlotGameVisible(false);
            setActiveGame(null);
            setVisibleModal(null);
            slotGameActiveRef.current = false;
        };
    }, []);

    useEffect(() => {
        const handleConnect = () => {
            if (!streamInfo?.roomID) {
                return;
            }

            socket.emit('register_player', {
                userId: userData?.userid,
                hostId: streamInfo?.hostID,
                roomId: streamInfo?.roomID,
            });
        };

        socket.on('connect', handleConnect);

        return () => {
            socket.off('connect', handleConnect);
        };
    }, [streamInfo?.roomID, streamInfo?.hostID, userData?.userid]);

    useEffect(() => {
        const roomId = streamInfo?.roomID || streamInfo?.room_id;

        if (!roomId) {
            return;
        }

        socket.emit('joinSlotRoom', { roomId });
    }, [streamInfo?.roomID, streamInfo?.room_id]);

    useEffect(() => {

        socket.on('queueUpdate', (queue) => {
            setGameQueue(queue);

            const myGame = queue.find(
                g => g.userSocket === socket.id
            );

            if (myGame) {
                setMyGamePosition(queue.indexOf(myGame) + 1);
            } else {
                setMyGamePosition(null);
            }
        });

        return () => {
            socket.off('queueUpdate');
        };

    }, []);

    useEffect(() => {
        const onBroadcast = () => {
            if (horseGameActiveRef.current) {
                return;
            }

            setHorseGameVisible(true);
            setActiveGame('horse-game');
            setVisibleModal('horse-game');
        };

        const onClose = () => {
            if (slotGameActiveRef.current && activeGame === 'slot-game') {
                return;
            }

            // ✅ only close horse race, never force-close lucky wheel
            if (visibleModal === 'horse-game' || activeGame === 'horse-game') {
                setHorseGameVisible(false);
                setActiveGame(null);
                setVisibleModal(null);
                setSlotGameVisible(false);
            } else {
                setHorseGameVisible(false);
            }

            horseGameActiveRef.current = false;
        };

        socket.on('horseRaceBroadcast', onBroadcast);
        socket.on('horseRaceClose', onClose);

        return () => {
            socket.off('horseRaceBroadcast', onBroadcast);
            socket.off('horseRaceClose', onClose);
        };
    }, [activeGame]);

    // 🔥 CLOSE HORSE RACE IF NO BETS
    const handleHorseRaceClose = useCallback(() => {
        if (horseGameActiveRef.current) {
            return;
        }
        horseGameActiveRef.current = false;
        setHorseGameVisible(false);

        if (activeGame === 'horse-game') {
            setActiveGame(null);
        }

        if (visibleModal === 'horse-game') {
            setVisibleModal(null);
            setSlotGameVisible(false);
        }
    }, [activeGame, visibleModal]);

    // Open Horse Race Modal
    const handleHorseGameOpen = () => {
        const roomIdToSend = streamInfo?.roomID || streamInfo?.room_id;

        if (!roomIdToSend) {
            return;
        }

        socket.emit('joinHorseRaceRoom', { roomId: roomIdToSend });

        setHorseGameVisible(true);
        setActiveGame('horse-game');
        horseGameActiveRef.current = true;
        setVisibleModal('horse-game');
    };

    const handleSlotGameStart = () => {
        if (slotGameActiveRef.current) {
            return;
        }

        slotGameActiveRef.current = true;
    };

    const handleGameClose = (gameType) => {

        if (gameType === 'luckyWheel') {
            handleLuckyWheelClose();
            return;
        }

        if (gameType === 'slot-game') {
            if (slotGameActiveRef.current) {
                return;
            }

            setSlotGameVisible(false);
            setActiveGame(null);
            setVisibleModal(null); setSlotGameVisible(false);
        }

        if (gameType === 'horse-game') {

            // ✅ ONLY close if horse game is active
            if (visibleModal === 'horse-game' || activeGame === 'horse-game') {

                setHorseGameVisible(false);
                setActiveGame(null);
                if (slotGameActiveRef.current && activeGame === 'slot-game') {
                    return;
                }
                setVisibleModal(null); setSlotGameVisible(false);
            } else {
            }

            return;
        }
    };

    const handlePhase = useCallback((phase) => {
        setRacePhase(phase);

        if (phase === 'started') {
            setShowRaceUI(true);
        } else if (phase === 'ended') {
            setShowRaceUI(false);
        }
    }, []);

    const handleHorseHorses = useCallback((horses) => {
        setHorseHorses(horses);
    }, []);

    const handleHorseRaceCountdown = useCallback((count) => {
        setRaceCountdown(count);
    }, []);

    const handleHorseRaceUpdate = useCallback((positions) => {
        setHorsePositions(positions);
    }, []);

    const handleHorseRaceResult = useCallback((result) => {
        setRaceResults(result);
        setShowRaceUI(false);
    }, []);



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

        // Don't auto-open the wheel, just update state for red dot
        if (openerData.userId === userData?.userid) {
            return;
        }



        // Set room as active (for red dot)
        setIsLuckyWheelActiveInRoom(true);
    }, [userData?.userid]);

    // ✅ Check if user is new to the stream (for red dot indicator) AND handle reconnections
    useEffect(() => {
        const handleGetLuckyWheelStatus = () => {
            if (streamInfo?.roomID) {
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
        setIsLuckyWheelActiveInRoom(true);
    }, []);

    const handleLuckyWheelInactive = useCallback(() => {

        setIsLuckyWheelActiveInRoom(false);
        setLuckyWheelOpenedBy(null);

        if (luckyWheelVisible || visibleModal === 'luckyWheel') {
            handleLuckyWheelCloseLocal();
        }
    }, [luckyWheelVisible, visibleModal, handleLuckyWheelCloseLocal]);

    // ✅ NEW: Handle individual close confirmation from server
    const handleLuckyWheelCloseConfirmation = useCallback(() => {
    }, []);

    // ✅ NEW: Local close function (without server notification)
    const handleLuckyWheelCloseLocal = useCallback(() => {

        setLuckyWheelVisible(false);
        setLuckyWheelOpenedBy(null);
        setActiveGame(null);

        if (
            slotGameActiveRef.current &&
            activeGame === 'slot-game'
        ) {
            return;
        }

        setVisibleModal(null);
        setSlotGameVisible(false);

    }, [activeGame]);

    // ✅ Fixed: Enhanced game open/close handlers
    const handleLuckyWheelOpen = () => {
        // ✅ FIX: First, ensure any modal state is cleared before opening
        if (visibleModal && visibleModal !== 'luckyWheel') {
            if (slotGameActiveRef.current && activeGame === 'slot-game') {
                return;
            }
            setVisibleModal(null); setSlotGameVisible(false);
        }

        // If already open, close it locally (per-user close)
        if (luckyWheelVisible || visibleModal === 'luckyWheel') {
            handleLuckyWheelClose();
            return;
        }

        // Close any other game first
        if (activeGame && activeGame !== 'luckyWheel') {
            handleGameClose(activeGame);
        }

        // Emit to server to notify others (for red dot)
        const userOpenData = {
            userId: userData?.userid,
            userName: userData?.screenName,
            timestamp: Date.now(),
        };
        socket.emit('user-opened-lucky-wheel', streamInfo?.roomID.toString(), userOpenData);

        // Open locally
        setVisibleModal('luckyWheel');
        setLuckyWheelOpenedBy(userOpenData);
        setActiveGame('luckyWheel');
        setLuckyWheelVisible(true);
        luckyWheelActiveRef.current = true;
        // Set as active locally (for other users' red dots)
        setIsLuckyWheelActiveInRoom(true);
    };


    // ✅ UPDATED: Listen for bet placed event to auto-open
    const handleBetPlacedInRoom = useCallback((betData) => {
        if (luckyWheelClosingRef.current) {
            return;
        }

        // Don't auto-open if already in lucky wheel modal
        if (visibleModal === 'luckyWheel' || luckyWheelVisible) {
            return;
        }

        // Don't auto-open if playing slot game
        if (activeGame === 'slot-game') {
            return;
        }

        const userOpenData = {
            userId: userData?.userid,
            userName: userData?.screenName,
            timestamp: Date.now(),
        };

        // Open locally
        setLuckyWheelVisible(true);
        setLuckyWheelOpenedBy(userOpenData);
        setActiveGame('luckyWheel');
        setVisibleModal('luckyWheel');

        // Also notify server that this user is now opening
        socket.emit('user-opened-lucky-wheel', streamInfo?.roomID.toString(), userOpenData);
    }, [luckyWheelVisible, visibleModal, activeGame, userData, streamInfo?.roomID]);

    // slot game open close handlers
    const handleSlotGameOpen = () => {

        // Toggle close
        if (visibleModal === 'slot-game' || slotGameVisible) {

            if (
                slotGameActiveRef.current &&
                activeGame !== 'slot-game'
            ) {
                return;
            }
            setVisibleModal(null); setSlotGameVisible(false);
            setActiveGame(null);
            setSlotGameOpenedBy(null);
            setSlotGameVisible(false);
            slotGameActiveRef.current = false;
            return;
        }

        // Close other games
        if (activeGame && activeGame !== 'slot-game') {
            handleGameClose(activeGame);
        }

        const userOpenData = {
            userId: userData?.userid,
            userName: userData?.screenName,
            timestamp: Date.now(),
        };

        setVisibleModal('slot-game');
        setSlotGameOpenedBy(userOpenData);
        setActiveGame('slot-game');
        setSlotGameVisible(true);
        slotGameActiveRef.current = true;
    };

    useEffect(() => {
        const openHorseRace = (data) => {
            if (firstBetTimer) {
                clearTimeout(firstBetTimer);
                setFirstBetTimer(null);
            }

            setHorseGameVisible(true);
            setVisibleModal('horse-game');
            setActiveGame('horse-game');

            if (data?.roomID) {
                setHorseRoomId(data.roomID);
            }
        };

        socket.on('horseRaceBroadcast', openHorseRace);

        return () => {
            socket.off('horseRaceBroadcast', openHorseRace);
        };
    }, [firstBetTimer]);

    useEffect(() => {
        const roomId = streamInfo?.roomID || streamInfo?.room_id;

        if (!roomId) {
            return;
        }

        socket.emit('joinHorseRaceRoom', {
            roomId,
        });
    }, [streamInfo?.roomID, streamInfo?.room_id]);


    const handleLuckyWheelClose = () => {

        luckyWheelClosingRef.current = true;

        setLuckyWheelVisible(false);
        setVisibleModal(null);
        setLuckyWheelOpenedBy(null);

        if (visibleModal === 'luckyWheel') {
            setVisibleModal(null);
        }

        if (activeGame === 'luckyWheel') {
            setActiveGame(null);
        }
        luckyWheelActiveRef.current = false;

        setTimeout(() => {
            luckyWheelClosingRef.current = false;
        }, 3000);
    };


    // Add cleanup effect
    useEffect(() => {
        return () => {
            // If lucky wheel was visible when leaving, close it properly
            if ((luckyWheelVisible || visibleModal === 'luckyWheel') &&
                streamInfo?.roomID &&
                userData?.userid) {
                socket.emit('user-closed-lucky-wheel', streamInfo.roomID.toString(), userData.userid);
            }
        };
    }, [luckyWheelVisible, visibleModal, streamInfo?.roomID, userData?.userid]);

    const handleSlotGameClose = () => {

        // ✅ Always allow local close (host/viewers + invoker-before-buy)
        setSlotGameVisible(false);
        setActiveGame(null);

        if (visibleModal === 'slot-game') {
            setVisibleModal(null);
        }
        slotGameActiveRef.current = false;

        // ✅ mark locally closed so socket doesn't reopen it
        setSlotClosedLocally(true);
    };

    // ✅ UPDATED: Check if should show red dot on lucky wheel button
    const shouldShowRedDotOnLuckyWheel = () => {
        const show = isLuckyWheelActiveInRoom && // Wheel is open somewhere in room
            !luckyWheelVisible && // This user doesn't have it open
            visibleModal !== 'luckyWheel' && // Not currently in wheel modal
            activeGame !== 'slot-game'; // Not playing slot game

        return show;
    };

    // ✅ Handle user joining room - request current lucky wheel status
    useEffect(() => {
        if (streamInfo?.roomID && userData?.userid) {
            socket.emit('get-lucky-wheel-status', streamInfo.roomID.toString());
        }
    }, [streamInfo?.roomID, userData?.userid]);

    // ✅ Updated useEffect (fewer deps, uses memoized handlers)
    useEffect(() => {
        const handleQueueUpdate = (queueData) => {
            setGameQueue(queueData.queue);
        };

        const handleGameStart = (gameData) => {
            if (gameData.gameType === 'horse-game') {
                setHorseGameVisible(true);
            } else if (gameData.gameType === 'luckyWheel') {
                setLuckyWheelVisible(true);
            }
        };

        const handleQueueEmpty = () => {
            setGameQueue([]);
        };

        socket.on('queue-updated', handleQueueUpdate);
        socket.on('gameStarting', handleGameStart);
        socket.on('queue-empty', handleQueueEmpty);

        socket.on('lucky-wheel-opened', handleLuckyWheelOpened);
        socket.on('lucky-wheel-active', handleLuckyWheelActive);
        socket.on('lucky-wheel-inactive', handleLuckyWheelInactive);
        socket.on('lucky-wheel-closed-confirmation', handleLuckyWheelCloseConfirmation);
        socket.on('bet-placed-in-room', handleBetPlacedInRoom);

        socket.on('phase', handlePhase);
        socket.on('horseHorses', handleHorseHorses);
        socket.on('horseRaceCountdown', handleHorseRaceCountdown);
        socket.on('horseRaceUpdate', handleHorseRaceUpdate);
        socket.on('horseRaceResult', handleHorseRaceResult);
        socket.on('horseRaceClose', handleHorseRaceClose);

        return () => {
            socket.off('queue-updated', handleQueueUpdate);
            socket.off('gameStarting', handleGameStart);
            socket.off('queue-empty', handleQueueEmpty);

            socket.off('lucky-wheel-opened', handleLuckyWheelOpened);
            socket.off('lucky-wheel-active', handleLuckyWheelActive);
            socket.off('lucky-wheel-inactive', handleLuckyWheelInactive);
            socket.off('lucky-wheel-closed-confirmation', handleLuckyWheelCloseConfirmation);
            socket.off('bet-placed-in-room', handleBetPlacedInRoom);

            socket.off('phase', handlePhase);
            socket.off('horseHorses', handleHorseHorses);
            socket.off('horseRaceCountdown', handleHorseRaceCountdown);
            socket.off('horseRaceUpdate', handleHorseRaceUpdate);
            socket.off('horseRaceResult', handleHorseRaceResult);
            socket.off('horseRaceClose', handleHorseRaceClose);
        };
    }, [
        handleLuckyWheelOpened,
        handleLuckyWheelActive,
        handleLuckyWheelInactive,
        handleLuckyWheelCloseConfirmation,
        handleBetPlacedInRoom,
        handlePhase,
        handleHorseHorses,
        handleHorseRaceCountdown,
        handleHorseRaceUpdate,
        handleHorseRaceResult,
        handleHorseRaceClose,
    ]);

    // ✅ Fixed: Request lucky wheel status on room join and reconnect
    useEffect(() => {
        if (streamInfo?.roomID) {
            socket.emit('get-lucky-wheel-status', streamInfo.roomID.toString());
        }
    }, [streamInfo?.roomID]);

    useEffect(() => {

        if (
            connectingpanel &&
            (
                slotGameActiveRef.current ||
                horseGameActiveRef.current ||
                luckyWheelActiveRef.current
            )
        ) {
            return;
        }
    }, [connectingpanel, activeGame]);

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
        const handler = (data) => {
        };

        socket.on('update-user-count', handler);

        return () => {
            socket.off('update-user-count', handler); // ✅ CRITICAL
        };
    }, []);


    useEffect(() => {
        setIsInStreamRoom(true);

        const backAction = () => {
            Alert.alert(
                'Close Stream',
                'Do you want to close The stream ?',
                [
                    { text: 'Cancel', onPress: () => null, style: 'cancel' },
                    {
                        text: 'Yes',
                        onPress: () => {
                            leaveRoom();
                        },
                    },
                ]
            );

            return true;
        };

        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            backAction
        );

        return () => {
            backHandler.remove();
        };
    }, [leaveRoom, setIsInStreamRoom]);

    useEffect(() => {
        const handleQueueUpdate = (queueData) => {
            setGameQueue(queueData.queue);
        };

        const handleGameStart = (gameData) => {
            if (gameData.gameType === 'horse-game') {
                setHorseGameVisible(true);
            } else if (gameData.gameType === 'luckyWheel') {
                setLuckyWheelVisible(true);
            }
        };

        const handleQueueEmpty = () => {
            setGameQueue([]);
        };

        socket.on('queue-updated', handleQueueUpdate);
        socket.on('gameStarting', handleGameStart);
        socket.on('queue-empty', handleQueueEmpty);

        return () => {
            socket.off('queue-updated', handleQueueUpdate);
            socket.off('gameStarting', handleGameStart);
            socket.off('queue-empty', handleQueueEmpty);
        };
    }, []);

    // ✅ JukeBox close handler
    const handleJukeBoxClose = useCallback(() => {
        setJukeboxVisible(false);
        setJukeboxOpenedBy(null);

        if (slotGameActiveRef.current && activeGame === 'slot-game') {
            return;
        }

        setVisibleModal(null);
        setSlotGameVisible(false);

        if (streamInfo?.roomID && userData?.userid) {
            socket.emit(
                'user-closed-jukebox',
                streamInfo.roomID.toString(),
                userData.userid
            );
        }
    }, [activeGame, streamInfo?.roomID, userData?.userid]);
    // ✅ Handle when other users open JukeBox
    const handleJukeboxOpened = useCallback((openerData) => {
        if (openerData.userId === userData?.userid) {
            return;
        }

        const shouldAutoOpen =
            !luckyWheelVisible &&
            !slotGameVisible &&
            !jukeboxVisible &&
            visibleModal !== 'luckyWheel' &&
            visibleModal !== 'slot-game' &&
            visibleModal !== 'juke-box';

        if (shouldAutoOpen && !openerData.forceOpen) {
            const myOpenData = {
                userId: userData?.userid,
                userName: userData?.screenName,
                timestamp: Date.now(),
            };

            setVisibleModal('juke-box');
            setJukeboxOpenedBy(myOpenData);
            setJukeboxVisible(true);

            socket.emit('user-opened-jukebox', streamInfo?.roomID.toString(), {
                ...myOpenData,
                forceOpen: true,
            });
        } else {
            setIsJukeboxActiveInRoom(true);
        }
    }, [
        userData?.userid,
        userData?.screenName,
        luckyWheelVisible,
        slotGameVisible,
        jukeboxVisible,
        visibleModal,
        streamInfo?.roomID,
    ]);

    // ✅ Handle when room becomes inactive for JukeBox
    const handleJukeboxInactive = useCallback(() => {
        setIsJukeboxActiveInRoom(false);
        setJukeboxOpenedBy(null);

        if (jukeboxVisible || visibleModal === 'juke-box') {
            handleJukeBoxClose();
        }
    }, [jukeboxVisible, visibleModal, handleJukeBoxClose]);

    // ✅ Handle jukebox active status
    const handleJukeboxActive = useCallback(() => {
        setIsJukeboxActiveInRoom(true);
    }, []);

    useEffect(() => {
        const onWalletUpdate = ({ userId, balance }) => {
            if (Number(userId) !== Number(userData?.userid)) return;

            const newBalance = Number(balance);

            if (isNaN(newBalance)) return;

            setUserData(prev => ({
                ...prev,
                CreditBalance: newBalance,
                balance: newBalance,
            }));

            debugLog('StreamRoom', 'GLOBAL_WALLET_UPDATE', {
                userId,
                balance: newBalance,
            });
        };

        socket.on('walletUpdate', onWalletUpdate);

        return () => {
            socket.off('walletUpdate', onWalletUpdate);
        };
    }, [userData?.userid, setUserData]);

    // ✅ Add socket listeners for JukeBox
    useEffect(() => {
        socket.on('jukebox-opened', handleJukeboxOpened);
        socket.on('jukebox-active', handleJukeboxActive);
        socket.on('jukebox-inactive', handleJukeboxInactive);
        socket.on('jukebox-closed-confirmation', () => {
        });

        // Horse Racing Game Modal 

        socket.on('horse-race-start', () => {
            setHorseGameVisible(true);
        });

        socket.on('horse-race-finish', (result) => {
            setHorseGameVisible(false);
        });

        return () => {
            socket.off('jukebox-opened', handleJukeboxOpened);
            socket.off('jukebox-active', handleJukeboxActive);
            socket.off('jukebox-inactive', handleJukeboxInactive);
            socket.off('jukebox-closed-confirmation');
        };
    }, [handleJukeboxOpened, handleJukeboxActive, handleJukeboxInactive]);

    // ✅ Request jukebox status on join
    useEffect(() => {
        if (streamInfo?.roomID) {
            socket.emit('get-jukebox-status', streamInfo.roomID.toString());
        }
    }, [streamInfo?.roomID]);

    // ✅ Cleanup on unmount
    useEffect(() => {
        return () => {
            if ((jukeboxVisible || visibleModal === 'juke-box') &&
                streamInfo?.roomID &&
                userData?.userid) {
                socket.emit('user-closed-jukebox', streamInfo.roomID.toString(), userData.userid);
            }
        };
    }, [jukeboxVisible, visibleModal, streamInfo?.roomID, userData?.userid]);


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
        };
    }, []);

    // show notification if
    const showNotification = (text, type = 'info') => {
        setNotification({
            isVisible: true,
            message: text,
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

    useEffect(() => {
        setTimeout(() => {
            scrollViewRef?.current?.scrollToEnd?.({ animated: true });
        }, 100);
    }, [roomchat]);

    // get gifts category wise
    const getGifts = useCallback(async () => {
        setGiftDataLoading(true);

        try {
            const response = await Apiclient.get(
                `/getgifts?giftValue=${selectedGiftCategory}`
            );

            if (response) {
                setGiftItems(response.data.data || []);
            }
        } catch (error) {
            SendErrorTotheServer(error, 'getGifts');
        } finally {
            setGiftDataLoading(false);
        }
    }, [selectedGiftCategory]);

    useEffect(() => {
        if (!giftModalVisible) {
            return;
        }

        getGifts();
    }, [giftModalVisible, selectedGiftCategory, getGifts]);


    // get total likes & view count from api
    const GetViewerAndLikeCount = useCallback(async () => {
        try {
            const params = {
                hostId: streamInfo?.hostID,
            };

            const response = await Apiclient.post(
                '/rooms/getTotalLikesCount',
                params
            );

            if (response) {
                setLikeAndViewerCount({
                    viewerCount: response.data.totalViews || 0,
                    likeCount: response.data.totalLikes || 0,
                });
            }
        } catch (error) {
            SendErrorTotheServer(error, 'GetViewerAndLikeCount');
        }
    }, [streamInfo?.hostID]);

    useEffect(() => {
        GetViewerAndLikeCount();
    }, [GetViewerAndLikeCount]);

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

    useEffect(() => {
        if (streamInfo?.hostID) {
            GetUserDetails(streamInfo.hostID);
            checkLikeStatus();
        }

        const showSub = Keyboard.addListener('keyboardDidShow', (e) => {
            HidesettingPanel();
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
    }, [streamInfo?.hostID, GetUserDetails]);

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
    const HadleSendChat = async () => {
        if (!userChatInput.trim()) {
            // Alert.alert('Message', 'Please enter a message before sending.', [{ text: 'OK' }]);
            return;
        }
        HandleChatmessages(userChatInput);

        try {
            const params = {
                roomID: streamInfo?.roomID,
                sender_id: userData?.userid,
                message: userChatInput,
                type: 'text',
            };
            const response = await Apiclient.post(
                '/chatlogs/saveRoomChat',
                params
            );
        } catch (error) {
            SendErrorTotheServer(error, 'saveRoomChat');
        }

        setUserChatInput('');
        inputRef.current?.blur();
        setIsTyping(false);
        Keyboard.dismiss();
    };

    // get user details
    const GetUserDetails = useCallback(async (userid) => {
        try {
            const formData = {
                userid,
            };

            const response = await Apiclient.post('/getUserDetails', formData);

            if (response) {
                const user = response.data.user;

                setUserDetails(user);
                setGiftSendData({
                    userName: user?.screenName,
                    userId: user?.userid,
                });
            }
        } catch (error) {
            SendErrorTotheServer(error, 'GetUserDetails');
        }
    }, []);

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
            };
            const response = await Apiclient.post('/friends/request', params);

            if (response.data?.success) {
            }
        } catch (error) {
            SendErrorTotheServer(error, 'handleFriendRequestToHostOnly');
        }
    };


    // check friend request is pending in list or not 
    const checkFriendRequestIsPendingOrNot = useCallback(async () => {
        if (!streamInfo?.hostID) {
            return;
        }

        try {
            const response = await Apiclient.get(
                `/friends/requests/${streamInfo.hostID}`
            );

            if (response.data) {
                setHostFriendRequestList(response.data);
            }
        } catch (error) {
            SendErrorTotheServer(error, 'checkFriendRequestIsPendingOrNot');
        }
    }, [streamInfo?.hostID]);

    useEffect(() => {
        checkFriendRequestIsPendingOrNot();
    }, [checkFriendRequestIsPendingOrNot]);

    // toggle like-dislike
    const ToggleLike = async () => {

        // already liked
        if (isLiked) {
            return;
        }

        setisLiked(true);

        socket.emit('like-count');

        try {

            const response = await Apiclient.post(
                '/profile/profileLikes',
                {
                    action: 'like',
                    likerID: userData?.userid,
                    targetUserID: streamInfo?.hostID,
                }
            );

            console.log('❤️ Like Saved:', response?.data);

        } catch (error) {

            console.log('Like Save Error:', error);

        }

        const checkIsFriend = myFriendList.some(
            (ele) => ele.userid === streamInfo?.hostID
        );

        const checkIsFriendRequestPendingOrNot =
            hostFriendRequestList.some(
                (ele) => ele.RequesterID === userData?.userid
            );

        if (
            !checkIsFriend &&
            !checkIsFriendRequestPendingOrNot
        ) {
            handleFriendRequestToHostOnly();
        }
    };

    const checkLikeStatus = async () => {
        try {

            const response = await Apiclient.post(
                '/profile/LikeStatus',
                {
                    likerID: userData?.userid,
                    targetUserID: streamInfo?.hostID,
                }
            );

            console.log('❤️ Like Status Response:', response?.data);

            if (response?.data?.liked) {
                setisLiked(true);
            }

        } catch (error) {
            console.log('Like Status Error:', error);
        }
    };

    // play gift sound
    const playGiftSound = () => {
        try {

            const sound = new Sound(
                'gift_received',
                Sound.MAIN_BUNDLE,
                (error) => {

                    if (error) {
                        SendErrorTotheServer(
                            error,
                            'playGiftSound'
                        );
                        return;
                    }

                    sound.play();

                }
            );

        } catch (error) {

            SendErrorTotheServer(
                error,
                'playGiftSound'
            );

        }
    };

    // play notification sound
    const playNotification = () => {
        try {

            const sound = new Sound(
                'notification',
                Sound.MAIN_BUNDLE,
                (error) => {

                    if (error) {
                        SendErrorTotheServer(
                            error,
                            'playNotification'
                        );
                        return;
                    }

                    sound.play();

                }
            );

        } catch (error) {

            SendErrorTotheServer(
                error,
                'playNotification'
            );

        }
    };

    // open report modal
    const HandleReport = () => {
        setVisibleModal('ReportVideo');
    };

    // handle like count
    const HandleLikeCount = useCallback((count) => {
        setStreamupdated((prev) => ({
            ...prev,
            LikeCount: count,
        }));

        GetViewerAndLikeCount();
    }, [setStreamupdated, GetViewerAndLikeCount]);

    // get total gift by room
    const getTotalGiftByRoom = useCallback(async () => {
        try {
            const params = {
                hostID: streamInfo?.hostID,
                roomid: streamInfo?.roomID,
            };
            const response = await Apiclient.post('/topGifters/getAllGiftsbyRoom', params);
            if (response.data.status) {
                setTotalGiftByRoom(response.data);
            }
        } catch (error) {
            SendErrorTotheServer(error, 'getTotalGiftByRoom');
        }
    }, [streamInfo?.hostID, streamInfo?.roomID]);

    useEffect(() => {
        getTotalGiftByRoom();
    }, [getTotalGiftByRoom]);

    // handle gift received
    const HandleGiftReceived = useCallback(async (senderName, receiverName, giftName) => {
        if (userData?.screenName === senderName) {
            return;
        }

        try {
            playGiftSound();

            setReceiveAnimationData({
                giftName,
                senderName,
                ReceiverName: receiverName,
            });

            await GetUserDetails(streamInfo?.hostID);
            await getTotalGiftByRoom();

            setShowReceiveAnimation(true);
        } catch (error) {
            SendErrorTotheServer(error, 'HandleGiftReceived');
        }
    }, [
        userData?.screenName,
        streamInfo?.hostID,
        GetUserDetails,
        getTotalGiftByRoom,
    ]);

    // friend request modal open
    const HandleFriendRequestMessage = useCallback((msg) => {
        setMessage(msg);
        setVisibleModal('message-modal');
    }, []);

    // get friend data
    const getFriendsData = useCallback(async () => {
        if (!userData?.userid) {
            return;
        }

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
    }, [userData?.userid]);

    const handleUpdateTotalGifts = useCallback(async (roomID) => {
        if (streamInfo?.roomID?.toString() !== roomID?.toString()) {
            return;
        }

        await getTotalGiftByRoom();
        await GetUserDetails(streamInfo?.hostID);
    }, [
        streamInfo?.roomID,
        streamInfo?.hostID,
        getTotalGiftByRoom,
        GetUserDetails,
    ]);

    const handleModalClose = (invokerHasNotBuyed) => {
        if (invokerHasNotBuyed) {
            // user hasn't buyed, so close modal
            setVisibleModal(null); setSlotGameVisible(false);
        } else {
            // user bought, modal stays open until game ends
        }
    };

    // socket event listen
    useEffect(() => {
        getFriendsData();

        socket.on('like-count', HandleLikeCount);
        socket.on('received-Gift', HandleGiftReceived);
        socket.on('receive-request', HandleFriendRequestMessage);
        socket.on('update-total-gifts', handleUpdateTotalGifts);

        return () => {
            socket.off('like-count', HandleLikeCount);
            socket.off('received-Gift', HandleGiftReceived);
            socket.off('receive-request', HandleFriendRequestMessage);
            socket.off('update-total-gifts', handleUpdateTotalGifts);
        };
    }, [
        getFriendsData,
        HandleLikeCount,
        HandleGiftReceived,
        HandleFriendRequestMessage,
        handleUpdateTotalGifts,
    ]);



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

    const handleRemoveCoHost = (streamData) => {
        Alert.alert(
            'Remove Co-Host',
            `Are you sure you want to remove ${streamData?.Name} (Co-Host) from the stream?`,
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: () => {
                        socket.emit('host-control', {
                            action: 'stop-stream',
                            targetId: streamData.socketId,
                        });
                    },
                },
            ],
            { cancelable: true }
        );
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

            setStreamLayout(prev => {

                const updated = prev.filter(stream => {
                    if (stream.type === 'remote') {
                        // --- FIX: Only remove tile of the user who actually left ---
                        const shouldRemove = stream.socketId === leftUserId;

                        if (shouldRemove && stream.stream) {
                            stream.stream.getTracks().forEach(track => {
                                track.stop();
                                track.enabled = false;
                            });
                        }

                        return !shouldRemove;
                    }

                    return true; // keep local stream
                });
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
                }

                return validStreams;
            });
        };

        // Run cleanup when streamerList changes
        cleanupUndefinedStreams();
    }, [streamerList]);



    useEffect(() => {
        const delayId = setTimeout(() => {

            const mapBySocketId = {};

            // 1) Remote Streams
            remoteStreams.forEach(({ id, stream, isSpeaking, audioLevel }) => {
                const StreamerInfo = streamerList.find((s) => s.ID === id);

                if (!StreamerInfo) return;
                if (!stream || typeof stream.toURL !== 'function') {
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
        if (slotGameActiveRef.current && activeGame === 'slot-game') {
            return;
        }
        setVisibleModal(null); setSlotGameVisible(false);
        setIsLuckyWheelActiveInRoom(false);
        // Small delay for Android
        setTimeout(() => {
            setGiftModalVisible(true);
        }, 100);
    };

    return (
        <>
            <View style={[styles.streamBox]}>
                {streamLayout.length === 1 ? (
                    <Pressable onPress={HandleShowUi}>
                        <View style={styles.videoContainer}>
                            {(() => {
                                const s = streamLayout[0];
                                const track = s?.stream?.getVideoTracks?.()[0];
                                return (
                                    <RTCView
                                        streamURL={s?.stream.toURL()}
                                        style={styles.fullScreenVideo}
                                        objectFit="cover"
                                        mirror={s?.type === 'local' && isFrontCamera}
                                    />
                                );
                            })()}

                            {/* ⭐ ADD QUEUE MESSAGE HERE */}

                            {!isHost && gameQueue.length > 0 && (
                                <View style={styles.queueContainer}>
                                    <Text style={styles.queueText}>
                                        {myGamePosition
                                            ? `Stay connected, your game is ${myGamePosition} in the queue and will start shortly.`
                                            : "A game is currently running. Please wait."}
                                    </Text>
                                </View>
                            )}
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
                                                {isHost &&
                                                    streamData?.type !== 'local' && (
                                                        <TouchableOpacity
                                                            onPress={() => handleRemoveCoHost(streamData)}
                                                            style={{
                                                                position: 'absolute',
                                                                top: 8,
                                                                right: 8,
                                                                zIndex: 99999,
                                                                width: 32,
                                                                height: 32,
                                                                borderRadius: 16,
                                                                backgroundColor: 'rgba(0,0,0,0.6)',
                                                                justifyContent: 'center',
                                                                alignItems: 'center',
                                                            }}
                                                        >
                                                            <Ionicons
                                                                name="close-circle"
                                                                size={28}
                                                                color="#ff3b30"
                                                            />
                                                        </TouchableOpacity>
                                                    )}
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
                                                                    <View style={{ alignItems: 'center' }}>
                                                                        <Text style={{ color: 'red', fontSize: 30 }}>
                                                                            X
                                                                        </Text>

                                                                        <TouchableOpacity
                                                                            style={[
                                                                                styles.friendRequestIcon,
                                                                                { marginBottom: 4 }
                                                                            ]}
                                                                            onPress={() => handleRemoveCoHost(streamData)}
                                                                        >
                                                                            <Ionicons
                                                                                name="close"
                                                                                size={18}
                                                                                color="#fff"
                                                                            />
                                                                        </TouchableOpacity>

                                                                        <TouchableOpacity
                                                                            style={styles.friendRequestIcon}
                                                                            disabled={streamData?.isFriend}
                                                                            onPress={() =>
                                                                                handleFriendRequest(
                                                                                    streamData?.userId,
                                                                                    streamData?.Name
                                                                                )
                                                                            }
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
                                                                                <Ionicons
                                                                                    name="person-add"
                                                                                    size={streamLayout.length == 6 || streamLayout.length == 4 ? 16 : 20}
                                                                                    color="#fff"
                                                                                />
                                                                            )}
                                                                        </TouchableOpacity>

                                                                    </View>
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
                                                <View
                                                    style={[
                                                        styles.videoContainer,
                                                        getVideoTileStyle(streamLayout.length),
                                                    ]}
                                                >
                                                    <RTCView
                                                        key={
                                                            streamData.type === 'local'
                                                                ? 'local'
                                                                : streamData.userId
                                                        }
                                                        streamURL={streamData.stream.toURL()}
                                                        style={[styles.streamVideo]}
                                                        objectFit="cover"
                                                        mirror={
                                                            streamData.type === 'local' &&
                                                            isFrontCamera
                                                        }
                                                    />

                                                    <View
                                                        style={{
                                                            position: 'absolute',
                                                            left: '40%',
                                                            top: '40%',
                                                        }}
                                                    >
                                                        <Text>
                                                            {streamData?.isMuted &&
                                                                showUI && (
                                                                    <Ionicons
                                                                        name="mic-off"
                                                                        size={
                                                                            streamLayout.length == 6 ||
                                                                                streamLayout.length == 4
                                                                                ? 30
                                                                                : 40
                                                                        }
                                                                        color="#fff"
                                                                    />
                                                                )}
                                                        </Text>
                                                    </View>

                                                    {streamData?.type !== 'local' &&
                                                        streamData?.audioLevel > 0 && (
                                                            <View
                                                                style={{
                                                                    position: 'absolute',
                                                                    bottom: showUI ? 60 : 10,
                                                                    left: 10,
                                                                    right: 10,
                                                                    alignItems: 'center',
                                                                }}
                                                            >
                                                                <AudioSpectrum
                                                                    audioLevel={
                                                                        streamData.audioLevel
                                                                    }
                                                                    streamLayout={streamLayout}
                                                                />
                                                            </View>
                                                        )}

                                                    <View style={styles.videoOverlay}>
                                                        {index !== 0 &&
                                                            streamData?.type !== 'local' &&
                                                            showUI && (
                                                                <>
                                                                    {isHost && (
                                                                        <TouchableOpacity
                                                                            onPress={() =>
                                                                                handleRemoveCoHost(streamData)
                                                                            }
                                                                            style={{
                                                                                position: 'absolute',
                                                                                right: 5,
                                                                                bottom: 50,
                                                                                zIndex: 999999,
                                                                                width: 26,
                                                                                height: 26,
                                                                                borderRadius: 13,
                                                                                backgroundColor: '#ff3b30',
                                                                                justifyContent: 'center',
                                                                                alignItems: 'center',
                                                                            }}
                                                                        >
                                                                            <Ionicons
                                                                                name="close"
                                                                                size={16}
                                                                                color="#fff"
                                                                            />
                                                                        </TouchableOpacity>
                                                                    )}

                                                                    <ImageBackground
                                                                        source={bgImage}
                                                                        style={{ padding: 3 }}
                                                                    >
                                                                        <View
                                                                            style={
                                                                                styles.userInfoContainer
                                                                            }
                                                                        >
                                                                            <TouchableOpacity
                                                                                onPress={() =>
                                                                                    HnadleSendGiftToCoHost(
                                                                                        streamData?.userId,
                                                                                        streamData?.Name
                                                                                    )
                                                                                }
                                                                            >
                                                                                <Image
                                                                                    source={GiftIcon}
                                                                                    height={35}
                                                                                    width={35}
                                                                                />
                                                                            </TouchableOpacity>

                                                                            <Text
                                                                                style={styles.userName}
                                                                            >
                                                                                {streamData?.Name
                                                                                    ? streamData.Name
                                                                                    : 'Unknown User'}
                                                                            </Text>

                                                                            <TouchableOpacity
                                                                                style={styles.friendRequestIcon}
                                                                                disabled={
                                                                                    streamData?.isFriend
                                                                                }
                                                                                onPress={() =>
                                                                                    handleFriendRequest(
                                                                                        streamData?.userId,
                                                                                        streamData?.Name
                                                                                    )
                                                                                }
                                                                            >
                                                                                {streamData?.isFriend ? (
                                                                                    <Image
                                                                                        style={{
                                                                                            width:
                                                                                                streamLayout.length == 6
                                                                                                    ? 15
                                                                                                    : streamLayout.length == 4
                                                                                                        ? 20
                                                                                                        : 22,
                                                                                            height:
                                                                                                streamLayout.length == 6
                                                                                                    ? 15
                                                                                                    : streamLayout.length == 4
                                                                                                        ? 20
                                                                                                        : 22,
                                                                                        }}
                                                                                        source={require('../../assets/images/icons/friend-added.png')}
                                                                                        resizeMode="contain"
                                                                                        tintColor="white"
                                                                                    />
                                                                                ) : (
                                                                                    <Ionicons
                                                                                        name="person-add"
                                                                                        size={
                                                                                            streamLayout.length == 6 ||
                                                                                                streamLayout.length == 4
                                                                                                ? 16
                                                                                                : 20
                                                                                        }
                                                                                        color="#fff"
                                                                                    />
                                                                                )}
                                                                            </TouchableOpacity>
                                                                        </View>
                                                                    </ImageBackground>
                                                                </>
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
                            <View
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 5,
                                }}
                            // onPress={() => setOpenHostPorfile(!OpenHostPorfile)}
                            >
                                <Pressable onPress={() => setOpenHostPorfile(!OpenHostPorfile)} style={styles.strRoomHeaderLeft}>
                                    <Image
                                        style={styles.strRoomHeaderLeftProfileImg}
                                        source={!userDetails?.avatar || userDetails?.avatar === 'default' ?
                                            getGenderFallbackImage(userDetails?.gender) : { uri: userDetails?.avatar }}
                                    />
                                    <View>
                                        {/* host name */}
                                        <View
                                            style={{
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                            }}
                                        >
                                            <Text style={[styles.strRoomHeaderLeftProfileName]}>
                                                {userDetails?.screenName}
                                            </Text>

                                            {isConnectStream && (
                                                <View
                                                    style={{
                                                        backgroundColor: '#de0037',
                                                        paddingHorizontal: 8,
                                                        paddingVertical: 2,
                                                        borderRadius: 20,
                                                        marginLeft: 6,
                                                    }}
                                                >
                                                    <Text
                                                        style={{
                                                            color: '#fff',
                                                            fontWeight: '700',
                                                            fontSize: 10,
                                                        }}
                                                    >
                                                        CONNECT
                                                    </Text>
                                                </View>
                                            )}
                                        </View>
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
                                </Pressable>
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
                                                <Text style={{ color: '#00BD35', fontSize: 12, fontWeight: 600 }}> {isConnectStream
                                                    ? `${streamerList.length}/2`
                                                    : formatCount(Streamupdated.viewerCount)}</Text>
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
                                            minWidth: 25,
                                            backgroundColor: 'rgba(36, 32, 32, 0.75)',
                                            borderRadius: 21,
                                            paddingRight: 5,
                                            paddingVertical: 1,

                                        }}>
                                        <Image
                                            source={require('../../assets/images/icons/icon_z.png')}
                                            style={{ width: 24, height: 14, paddingLeft: 12 }}
                                            resizeMode="contain"
                                        />
                                        <Text
                                            style={{ color: '#fff', fontSize: 12, fontWeight: 600 }}
                                        >
                                            {totalGiftByRoom?.grandTotal || 0}
                                        </Text>
                                    </View>
                                </View>
                            </View>
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
                                                <ScrollView ref={scrollViewRef} showsVerticalScrollIndicator={false}>
                                                    {roomchat
                                                        .filter(chat => chat?.screenName !== 'AdminViewer') // Filter out "AdminViewer" messages
                                                        .map((chat, ind) => (
                                                            <View key={ind} style={styles.streamChatItem}>
                                                                <TouchableOpacity onPress={() => HandleOpenChatUserProfile(chat)}>
                                                                    <Image
                                                                        style={styles.streamChatItemProfileImg}
                                                                        source={
                                                                            chat?.userProfile === 'ziggsta'
                                                                                ? require('../../assets/images/logo-icon.png')
                                                                                : !chat.userProfile || chat.userProfile === 'default'
                                                                                    ? getGenderFallbackImage(chat.Gender)
                                                                                    : { uri: chat.userProfile }
                                                                        }
                                                                    />
                                                                </TouchableOpacity>
                                                                <View style={styles.streamChatMessageBox}>
                                                                    <Text
                                                                        numberOfLines={1}
                                                                        style={[
                                                                            styles.streamChatUserName,
                                                                            {
                                                                                color: `${chat?.TYPE === 'USERJOINED'
                                                                                    ? '#00F6CD'
                                                                                    : chat.TYPE === 'USERLEFT'
                                                                                        ? '#DC112C'
                                                                                        : '#DEEE4F'
                                                                                    }`,
                                                                                paddingTop: `${chat?.TYPE === 'USERJOINED' ? 10 : 0}`,
                                                                            },
                                                                        ]}
                                                                    >
                                                                        {chat?.screenName === 'AdminViewer'
                                                                            ? 'Viewer'
                                                                            : chat?.userName?.length > 30
                                                                                ? chat.userName.slice(0, 30) + '...'
                                                                                : chat?.userName}
                                                                    </Text>
                                                                    <Text style={styles.streamChatMessage}>
                                                                        {chat?.message}
                                                                    </Text>
                                                                </View>
                                                            </View>
                                                        ))}
                                                </ScrollView>
                                            )}
                                        </ScrollView>
                                    </View>
                                    {/* chat message icon box right side */}
                                    {showUI && keyboardOffset === 0 && (
                                        <View style={styles.strRoomFooterSocialActions}>
                                            {/* juke box */}
                                            {/* {!isHost && (
                                                <TouchableOpacity
                                                    style={styles.strRoomFooterSocialActionsBtn}
                                                    onPress={handleJukeBoxOpen}
                                                >
                                                    <Image
                                                        style={{
                                                            width: 35,
                                                            height: 35,
                                                        }}
                                                        source={require('../../assets/images/icons/jukebox.png')}
                                                        resizeMode="contain"
                                                    />
                                                </TouchableOpacity>
                                            )} */}
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

                                            {/* horse race */}
                                            {!isHost && (
                                                <TouchableOpacity
                                                    style={[styles.strRoomFooterSocialActionsBtn, { position: 'relative' }]}
                                                    onPress={() => {
                                                        handleHorseGameOpen();
                                                    }}
                                                >
                                                    <Image
                                                        style={{ width: 35, height: 35 }}
                                                        source={require('../../assets/images/HorseRaceGame/horse_icon.png')}
                                                        resizeMode="contain"
                                                    />
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
                                                    disabled={isHost || isLiked}
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
                                        {!isHost && streamInfo?.streamType !== 'connect' && (
                                            <TouchableOpacity
                                                onPress={() => {
                                                    requestStreamPermission();
                                                    HidesettingPanel();
                                                    setVisibleModal('message-modal');
                                                    setMessage('Request Send To the Host');
                                                }}
                                                style={styles.strMoreSettingListItem}
                                                disabled={hasRequestedStream}
                                            >
                                                <Text
                                                    style={[
                                                        styles.strMoreSettingListItemText,
                                                        { color: hasRequestedStream ? '#007ACC' : 'white' }
                                                    ]}
                                                >
                                                    {hasRequestedStream ? 'Already Requested' : 'Join As a Guest'}
                                                </Text>

                                                <MaterialCommunityIcons
                                                    name="video-plus"
                                                    size={21}
                                                    color={hasRequestedStream ? '#007ACC' : 'white'}
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
                            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 5 }}>
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

                                                if (!localImage) {
                                                    return null;
                                                }

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

            {isHost && (
                <RequestModal
                    visible={togglerequest}
                    onClose={() => setTogglerequest(false)}
                    StreamRequestList={streamrequestlist}
                    streamGuest={streamGuest}
                />
            )}
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
                    getTotalGiftByRoom={getTotalGiftByRoom}
                />
            )
            }
            {/* Slot Game Modal */}
            {/* Slot Game Modal */}

            <SlotGameModal
                visible={visibleModal === 'slot-game' || slotGameVisible}
                onClose={handleSlotGameClose}
                userData={userData}
                hostDetails={userDetails}
                roomId={streamInfo?.roomID}
                openedBy={slotGameOpenedBy}
                isSelfOpened={visibleModal === 'slot-game'}
                onGameStart={handleSlotGameStart}
                setHasBought={setHasBought}
                onForceOpen={() => setSlotGameVisible(true)}
            />


            {horseGameVisible && (() => {

                const hostId = streamInfo?.hostID;
                const currentUserId = userData?.userid;

                const isHost = Number(currentUserId) === Number(hostId);

                return (
                    <HorseRaceGameModal
                        visible={horseGameVisible}
                        onClose={() => setHorseGameVisible(false)}
                        userData={userData}
                        socket={socket}
                        roomId={streamInfo?.roomID}
                        isHost={isHost}             // ← ensure this is the boolean you logged
                    />
                );
            })()}


            {/* Jukebox Modal */}
            {/* {visibleModal === 'juke-box' && (
                <JukeBoxModal
                    visible={visibleModal === 'juke-box'}
                    onClose={() => setVisibleModal(null)}
                    userData={userData}
                    hostDetails={userDetails}
                    roomId={streamInfo?.roomID}
                />
            )
            } */}
        </>
    );
};

export default StreamRoom;