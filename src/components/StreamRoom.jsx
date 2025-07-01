/* eslint-disable react-native/no-inline-styles */
import {
    View, Text, TouchableOpacity, Alert, Image, ScrollView, Dimensions, TextInput, Keyboard, Animated,
    Easing,
    ActivityIndicator,
} from 'react-native';
import { styles } from '../../assets/styles/ThemeStyles';
import { RTCView } from 'react-native-webrtc';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useEffect, useRef, useState } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import Modal from 'react-native-modal';
import FastImage from 'react-native-fast-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Apiclient from '../utils/Apiclient';
import { ConfirmModal } from '../modals/ConfirmModal';

const chats = [
    {
        id: 1,
        userProfile: require('../../assets/images/LS-3.jpg'),
        userName: 'Kevin Spacey Kevin Spacey Kevin Spacey Kevin Spacey',
        message: 'This is looking good now This is looking good now This is looking good now',
    },
    {
        id: 2,
        userProfile: require('../../assets/images/LS-2.jpg'),
        userName: 'Mary Pollard',
        message: 'Yes we need that',
    },
    {
        id: 3,
        userProfile: require('../../assets/images/LS-1.jpg'),
        userName: 'Harry Styles',
        message: 'Absolutely love this stream',
    },
    {
        id: 4,
        userProfile: require('../../assets/images/LS-3.jpg'),
        userName: 'Kevin Spacey',
        message: 'This is looking good now',
    },
    {
        id: 5,
        userProfile: require('../../assets/images/LS-3.jpg'),
        userName: 'Kevin Spacey Kevin Spacey Kevin Spacey Kevin Spacey',
        message: 'This is looking good now This is looking good now This is looking good now',
    },
    {
        id: 6,
        userProfile: require('../../assets/images/LS-2.jpg'),
        userName: 'Mary Pollard',
        message: 'Yes we need that',
    },
];

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
    viewerCount,
    toggleMute,
    switchCamera,
    leaveRoom,
    isMuted,
    isHost,
    HandleChatmessages,
    roomchat,
    streamInfo
}) => {
    const insets = useSafeAreaInsets();
    const insetsTop = useSafeAreaInsets();
    const screenHeight = Dimensions.get('window').height;
    const [keyboardOffset, setKeyboardOffset] = useState(0);
    const [giftsData, setGiftItems] = useState([]);
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
    // Function to fetch gifts from the API
    const getGiftsCategory = async () => {
        try {
            const response = await Apiclient.get('/getgifts');
            if (response) {
                setGiftCategoryItems(response.data.data || []);
                console.log('giftCategories', response.data.data);
            }
        } catch (error) {
            console.error('Error fetching gifts:', error);
        }
    };

    useEffect(() => {
        getGiftsCategory();
    }, [giftModalVisible])


    useEffect(() => {
        console.log('selectedGiftCategory', selectedGiftCategory)
    }, [selectedGiftCategory])

    // Function to fetch gifts from the API
    const getGifts = async () => {
        setGiftDataLoading(true);
        try {
            const response = await Apiclient.get(`/getgifts?giftValue=${selectedGiftCategory}`);
            if (response) {
                setGiftItems(response.data.data || []);
                console.log('gift data', response.data.data)
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

    // Filter gifts by category
    // const filteredGiftItems = selectedGiftCategory === ''
    //     ? giftsData
    //     : giftsData.filter(item => item.giftValue === selectedGiftCategory);

    // Sort gifts by price and set default category
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
        // Add local stream if available and user is streaming
        if (localStream && isStreaming) {
            streams.push({ type: 'local', stream: localStream });
        }
      
        // Add remote streams (assume remoteStreams is an array of { id, stream })
        remoteStreams.forEach(({ id, stream,name }) => {
          if (stream && typeof stream.toURL === 'function') {
            console.log(name);
            console.log(`Adding remote stream for user ${id}`, stream.toURL());
            streams.push({ type: 'remote', stream, userId: id });
          } else {
            console.warn('⚠️ Invalid remote stream:', stream);
          }
        });
      
        setStreamLayout(streams);
        console.log('StreamLayout:', streams.map(s => ({
            type: s.type,
            hasVideo: s.stream?.getVideoTracks?.().length,
            videoMuted: s.stream?.getVideoTracks?.()[0]?.muted,
            readyState: s.stream?.getVideoTracks?.()[0]?.readyState,
          })));
          
      }, [localStream, remoteStreams, isStreaming, viewerCount]);
      
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
        GetUserDetails(streamInfo.hostID)
    //    }
        console.log(streamInfo.hostID);
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
        if (!isMuted) {
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
    }, [isMuted, fadeAnim]);

    const HadleSendChat = () => {
        if(!userChatInput.trim()) {
            Alert.alert('Please enter a message before sending.');
            return;
        }
        HandleChatmessages(userChatInput);
        setUserChatInput('');
    }

    const GetUserDetails=async(userid)=>{
     try {
        const formData = {userid:userid };
        const response = await Apiclient.post('/getUserDetails', formData);
        if (response) {
        const user = response.data.user;
        setUserDetails(user);
        console.log(user);
       }
     } catch (error) {
        console.log(error);
     }
    }

    return (
        <View style={[styles.roomInfo]}>
            <View style={[styles.streamBox]}>
                {streamLayout.length === 1 ? (
                    <RTCView
                        streamURL={streamLayout[0]?.stream.toURL()}
                        style={styles.fullScreenVideo}
                        objectFit="cover"
                        mirror={streamLayout[0]?.type === 'local' && isFrontCamera}
                    />
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
                                </View>
                                <View style={styles.threeUserColumnRight}>
                                    {streamLayout.slice(1, 3).map((streamData, index) => (
                                        <RTCView
                                            key={streamData.type === 'local' ? 'local' : streamData.userId}
                                            streamURL={streamData.stream.toURL()}
                                            style={styles.streamVideoHalf}
                                            objectFit="cover"
                                            mirror={streamData.type === 'local' && isFrontCamera}
                                        />
                                    ))}
                                </View>
                            </View>
                        ) : streamLayout.length === 5 ? (
                            <View style={styles.fiveUserWrapper}>
                                <View style={styles.fiveUserRow}>
                                    {streamLayout.slice(0, 2).map((streamData, index) => (
                                        <View key={streamData.type === 'local' ? 'local' : streamData.userId} style={styles.fiveUserCol50}>
                                            <RTCView
                                                streamURL={streamData.stream.toURL()}
                                                style={styles.streamFiveUserVideo}
                                                objectFit="cover"
                                                mirror={streamData.type === 'local' && isFrontCamera}
                                            />
                                        </View>
                                    ))}
                                </View>
                                <View style={styles.fiveUserRow}>
                                    {streamLayout.slice(2, 5).map((streamData, index) => (
                                        <View key={streamData.type === 'local' ? 'local' : streamData.userId} style={styles.fiveUserCol33}>
                                            <RTCView
                                                streamURL={streamData.stream.toURL()}
                                                style={styles.streamFiveUserVideo}
                                                objectFit="cover"
                                                mirror={streamData.type === 'local' && isFrontCamera}
                                            />
                                        </View>
                                    ))}
                                </View>
                            </View>
                        ) : (
                            <View style={styles.streamVideosInnerGrid}>
                                {streamLayout.map((streamData, index) => (
                                    <RTCView
                                        key={streamData.type === 'local' ? 'local' : streamData.userId}
                                        streamURL={streamData.stream.toURL()}
                                        style={[styles.streamVideo, getVideoTileStyle(streamLayout.length)]}
                                        objectFit="cover"
                                        mirror={streamData.type === 'local' && isFrontCamera}
                                    />
                                ))}
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
                                            {userDetails?.screenName }
                                        </Text>
                                        <View style={[styles.strRoomHeaderLeftProfileSubInfo]}>
                                            <Ionicons name="heart" solid size={14} color="#fff" />
                                            <Text style={[styles.strRoomHeaderLeftProfileSubText]}>{userDetails?.CreditBalance}</Text>
                                        </View>
                                    </View>
                                </View>
                                <View style={styles.strRoomHeaderRight}>
                                    <View style={styles.strRoomHeaderRWalletInfo}>
                                        <Ionicons name="diamond" solid size={14} color="#ffea23" />
                                        <Text style={styles.strRoomHeaderRWalletInfoText}>1023.250</Text>
                                    </View>
                                    <TouchableOpacity style={styles.strRoomHeaderRIconBox}>
                                        <Ionicons name="flag" size={28} color="#dc3131" />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={confirmleaveRoom} style={styles.strRoomHeaderRIconBox}>
                                        <Ionicons name="close" size={30} color="#fff" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <LinearGradient
                                colors={streamLayout.length > 1 ? ['#1d1d1d', '#1d1d1d'] : ['rgba(8, 8, 8, 1)', 'rgba(8, 8, 8, 0)']}
                                start={{ x: 0.5, y: 1 }}
                                end={{ x: 0.5, y: 0 }}
                                style={styles.strRoomFooter}
                            >
                                {!openMoreSettingList && (
                                    <>
                                        <View style={styles.strLiveStats}>
                                            <Text style={styles.strTitle}>{streamInfo?.RoomName}</Text>
                                            <View style={styles.streamViewerCount}>
                                                <Ionicons name="eye-outline" size={18} color="#ffea23" />
                                                <Text style={styles.streamViewerCountTitle}>{viewerCount}</Text>
                                            </View>
                                        </View>
                                        <View style={styles.strRoomFooterChatOrActionsBox}>
                                            <View style={[styles.streamChatContainer]}>
                                                <ScrollView
                                                    showsVerticalScrollIndicator={false}
                                                >
                                                    {roomchat.map((chat,ind) => (
                                                        <View key={ind} style={styles.streamChatItem}>
                                                            <Image style={styles.streamChatItemProfileImg} source={chat.userProfile} />
                                                            <View numberOfLines={1} style={styles.streamChatMessageBox}>
                                                                <Text numberOfLines={1} style={styles.streamChatUserName}>
                                                                    {chat.userName.length > 30 ? chat.userName.slice(0, 30) + '...' : chat.userName}
                                                                </Text>
                                                                <Text numberOfLines={1} style={styles.streamChatMessage}>
                                                                    {chat.message.length > 40 ? chat.message.slice(0, 40) + '...' : chat.message}
                                                                </Text>
                                                            </View>
                                                        </View>
                                                    ))}
                                                </ScrollView>
                                            </View>
                                            <View style={styles.strRoomFooterSocialActions}>
                                                <TouchableOpacity style={styles.strRoomFooterSocialActionsBtn}>
                                                    <Ionicons name="person-add" size={30} color="#fff" />
                                                </TouchableOpacity>
                                                <TouchableOpacity style={styles.strRoomFooterSocialActionsBtn}>
                                                    <Ionicons name="heart" size={30} color="#fff" />
                                                </TouchableOpacity>
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
                                        <TouchableOpacity onPress={() => {
                                            switchCamera();
                                        }} style={styles.strMoreSettingListItem}>
                                            <Text style={styles.strMoreSettingListItemText}>Flip Camera</Text>
                                            <Ionicons name="camera-reverse" size={20} color="#fff" />
                                        </TouchableOpacity>
                                        {!isHost && (
                                            <TouchableOpacity onPress={requestStreamPermission} style={styles.strMoreSettingListItem}>
                                                <Text style={styles.strMoreSettingListItemText}>Guest</Text>
                                                <MaterialCommunityIcons name="video-plus" size={21} color="#fff" />
                                            </TouchableOpacity>
                                        )}
                                        <TouchableOpacity onPress={() => toggleMute()} style={styles.strMoreSettingListItem}>
                                            <Text style={styles.strMoreSettingListItemText}>Mute {isMuted ? 'OFF' : 'ON'}</Text>
                                            {isMuted ? <Ionicons name="mic" size={20} color="#fff" /> : <Ionicons name="mic-off" size={20} color="#fff" />}
                                        </TouchableOpacity>
                                    </Animated.View>
                                )}
                                <View style={[styles.strRoomBottomBox, { marginBottom: keyboardOffset }]}>
                                    <TextInput
                                        placeholder=""
                                        placeholderTextColor="#414141"
                                        value={userChatInput}
                                        onChangeText={setUserChatInput}
                                        onFocus={() => setIsTyping(true)}
                                        onBlur={() => setIsTyping(false)}
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
                                            <TouchableOpacity onPress={() => setGiftModalVisible(true)} style={[styles.strRoomBottomBoxIconBox]}>
                                                <Ionicons name="gift" size={30} color="#FF00FF" />
                                            </TouchableOpacity>
                                            <TouchableOpacity style={styles.strRoomBottomBoxIconBox}>
                                                <Ionicons name="cart" size={30} color="#fff" />
                                            </TouchableOpacity>
                                        </>
                                    )}
                                </View>
                            </LinearGradient>
                        </View>
                    </>
                )}
            </View>
            {giftModalVisible && (
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

            {/* close stream modal  */}
            {closeStreamModal && (
                <ConfirmModal visible={closeStreamModal} onClose={() => setCloseStreamModal(false)} leaveRoom={leaveRoom} />
            )}
        </View>
    );
};

export default StreamRoom;