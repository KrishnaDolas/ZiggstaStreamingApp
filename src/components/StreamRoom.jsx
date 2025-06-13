import {
    View, Text, TouchableOpacity, Alert, Image, ScrollView, Dimensions, TextInput, Keyboard, Animated,
    Easing,
} from 'react-native';
import { styles, themeStyles } from '../../assets/styles/ThemeStyles';
import { RTCView } from 'react-native-webrtc';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useEffect, useRef, useState } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import Modal from 'react-native-modal';
import FastImage from 'react-native-fast-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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

const giftCategories = ['$2', '$5', '$10', '$20', '$50'];

const giftItems = [
    { price: '$2', image: 'https://test.streamalong.live/images/Animated-icons/sunrise.gif' },
    { price: '$2', image: 'https://test.streamalong.live/images/Animated-icons/sunset.gif' },
    { price: '$2', image: 'https://test.streamalong.live/images/Animated-icons/popcorn.gif' },
    { price: '$2', image: 'https://test.streamalong.live/images/Animated-icons/420.gif' },
    { price: '$2', image: 'https://test.streamalong.live/images/Animated-icons/sunrise.gif' },
    { price: '$2', image: 'https://test.streamalong.live/images/Animated-icons/sunset.gif' },
    { price: '$2', image: 'https://test.streamalong.live/images/Animated-icons/popcorn.gif' },
    { price: '$2', image: 'https://test.streamalong.live/images/Animated-icons/420.gif' },
    { price: '$2', image: 'https://test.streamalong.live/images/Animated-icons/sunrise.gif' },
    { price: '$2', image: 'https://test.streamalong.live/images/Animated-icons/sunset.gif' },
    { price: '$5', image: 'https://test.streamalong.live/images/Animated-icons/ticket.gif' },
    { price: '$5', image: 'https://test.streamalong.live/images/Animated-icons/420.gif' },
];

const StreamRoom = ({ isHost, localStream, isFrontCamera, isStreaming, remoteStream, switchCamera, toggleMute, isMuted,
    requestStreamPermission, hasRequestedStream, leaveRoom, theme,
}) => {
    const insets = useSafeAreaInsets();
    const insetsTop = useSafeAreaInsets();
    const screenHeight = Dimensions.get('window').height;
    const [keyboardOffset, setKeyboardOffset] = useState(0);
    const [userChatInput, setUserChatInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [giftModalVisible, setGiftModalVisible] = useState(false);
    const [selectedGiftCategory, setSelectedCategory] = useState('$2');
    const [selectedGiftItems, setSelectedGiftItems] = useState([]);
    const [openMoreSettingList, setOpenMoreSettingList] = useState(false);
    const scrollRef = useRef(null);
    const [showArrow, setShowArrow] = useState(true);
    const arrowAnim = useRef(new Animated.Value(0)).current;
    // Animated values
    const animatedOpacity = useRef(new Animated.Value(0)).current;
    const animatedTranslateY = useRef(new Animated.Value(20)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const confirmleaveRoom = () => {
        Alert.alert(
            "Leave Room",
            "Are you sure you want to leave the room?",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Leave",
                    onPress: () => leaveRoom(),
                    style: "destructive"
                }
            ]
        );
    };


    // Handle keyboard events to adjust the input box position

    useEffect(() => {
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


    const filteredGiftItems = selectedGiftCategory === '' ? giftItems : giftItems.filter(item => item.price === selectedGiftCategory);


    const handleScroll = (event) => {
        const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;

        // If scrolled to the end, hide the arrow
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

    // Handle opening and closing of the more settings list with animation

    useEffect(() => {
        if (openMoreSettingList) {
            // Open animation
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
            // Close animation
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


    // Animate the icon when the user interacts with it
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


    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: !isMuted ? 1 : 0, // Fade in if unmuted (icon shown), fade out otherwise
            duration: 300,
            useNativeDriver: true,
        }).start();
    }, [isMuted, fadeAnim]);

    return (
        <View style={[styles.roomInfo]}>
            {isHost && (
                <View style={styles.streamBox}>
                    {localStream && (
                        <RTCView
                            streamURL={localStream.toURL()}
                            style={styles.fullScreenVideo}
                            objectFit="cover"
                            mirror={isFrontCamera}
                        />
                    )}
                    {isStreaming ? (
                        <>
                            {!isMuted && (
                                <Animated.View
                                    pointerEvents="none"
                                    style={[
                                        styles.strMuteOffIconBoxOverlay,
                                        {
                                            opacity: fadeAnim,
                                        },
                                    ]}
                                >
                                    <Ionicons name="mic-off" size={180} color="#ccc" />
                                </Animated.View>
                            )}
                            <View style={[
                                styles.controls,
                                {
                                    bottom: 34, // always pin to bottom
                                    paddingBottom: insets.bottom > 0 ? insets.bottom : 0,
                                    paddingTop: insetsTop.top > 0 ? insetsTop.top : 0,
                                },
                            ]}>
                                <View style={styles.strRoomHeader}>
                                    <View style={styles.strRoomHeaderLeft}>
                                        <Image style={styles.strRoomHeaderLeftProfileImg} source={require('../../assets/images/LS-3.jpg')} />
                                        <View style={styles.strRoomHeaderLeftProfileInfo}>
                                            <Text style={[styles.strRoomHeaderLeftProfileName]}>
                                                Angenlico Marias
                                            </Text>
                                            <View style={[styles.strRoomHeaderLeftProfileSubInfo]}>
                                                <Ionicons name="heart" solid size={14} color="#fff" />
                                                <Text style={[styles.strRoomHeaderLeftProfileSubText]}>12345</Text>
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
                                    colors={['rgba(8, 8, 8, 1)', 'rgba(8, 8, 8, 0)']}
                                    start={{ x: 0.5, y: 1 }}
                                    end={{ x: 0.5, y: 0 }}
                                    style={styles.strRoomFooter}
                                >
                                    {!openMoreSettingList && (
                                        <>
                                            <View style={styles.strLiveStats}>
                                                <Text style={styles.strTitle}>The world is a happy place</Text>
                                                <View style={styles.streamViewerCount}>
                                                    <Ionicons name="eye-outline" size={18} color="#ffea23" />
                                                    <Text style={styles.streamViewerCountTitle}>1.4k</Text>
                                                </View>
                                            </View>
                                            <View style={styles.strRoomFooterChatOrActionsBox}>
                                                <View style={[styles.streamChatContainer]}>
                                                    <ScrollView
                                                        // contentContainerStyle={{ paddingBottom: 20 }}
                                                        showsVerticalScrollIndicator={false}
                                                    >
                                                        {chats.map((chat) => {
                                                            return (
                                                                <View key={chat.id} style={styles.streamChatItem}>
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
                                                            );
                                                        })}
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

                                    {/* more setting options setting*/}
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
                                            <TouchableOpacity onPress={() => {
                                                // handle submit here
                                                console.log("Submitted: ", userChatInput);
                                                setUserChatInput('');
                                                setIsTyping(false);
                                            }} style={styles.strRoomBottomBoxIconBox}>
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
                    ) : null
                    }
                </View>
            )}
            {
                !isHost && (
                    <View style={styles.streamBox}>
                        {isStreaming && remoteStream ? (
                            <>
                                <RTCView
                                    streamURL={remoteStream.toURL()}
                                    style={styles.fullScreenVideo}
                                    objectFit="cover"
                                    mirror={true}
                                />
                                <Text style={[styles.viewingText, themeStyles[theme].text]}>📡 Watching stream...</Text>
                            </>
                        ) : localStream ? (
                            <RTCView
                                streamURL={localStream.toURL()}
                                style={styles.fullScreenVideo}
                                objectFit="cover"
                                mirror={isFrontCamera}
                            />
                        ) : null}
                        {!isStreaming && (
                            <TouchableOpacity
                                style={[styles.startStreamingButton, hasRequestedStream && styles.disabledButton, themeStyles[theme].startButton]}
                                onPress={requestStreamPermission}
                                disabled={hasRequestedStream}
                            >
                                <Text style={styles.buttonText}>
                                    {hasRequestedStream ? 'Awaiting Permission...' : 'Request to Stream'}
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )
            }

            {/* gift modal  */}


            {giftModalVisible && (
                <Modal
                    isVisible={giftModalVisible}
                    // onBackdropPress={onClose}
                    animationIn="slideInUp"
                    animationOut="slideOutDown"
                    animationInTiming={700}
                    animationOutTiming={500}
                    backdropOpacity={0.4}
                    style={[styles.halfScreenModalMain]}
                    useNativeDriver={true}
                >
                    <View style={[styles.halfScreenModalOverlay]}>
                        <View style={[{ maxHeight: screenHeight * 0.5 }]}>
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
                                        {giftCategories.map((category, index) => {
                                            const isSelected = selectedGiftCategory === category;
                                            return (
                                                <TouchableOpacity key={index}
                                                    onPress={() => setSelectedCategory(category)}
                                                    style={[
                                                        styles.giftModalCatTab,
                                                        isSelected && styles.giftModalCatTabActive,
                                                    ]}
                                                >
                                                    <Text style={styles.giftModalCatTabText}>{category}</Text>
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
                                {filteredGiftItems.length > 0 ? <>
                                    <ScrollView
                                        showsVerticalScrollIndicator={true}
                                        indicatorStyle="white"
                                    >
                                        <View style={styles.giftModalCategoryItemsContainer}>
                                            {filteredGiftItems.map((item, index) => {
                                                return (
                                                    <TouchableOpacity key={index}
                                                        style={styles.giftModalCatItem}
                                                    >
                                                        <FastImage
                                                            style={[styles.giftModalCatItemImage]}
                                                            source={{ uri: item.image, priority: FastImage.priority.high }}
                                                            resizeMode={FastImage.resizeMode.contain}
                                                        />
                                                    </TouchableOpacity>
                                                );
                                            })}
                                        </View>
                                    </ScrollView>
                                </> :
                                    <View style={styles.noGiftsTextContainer}>
                                        <Text style={styles.noGiftsTextContent}>No gifts available for this category</Text>
                                    </View>}
                            </View>
                        </View>

                    </View>
                </Modal>
            )
            }

            {/* <TouchableOpacity style={[styles.leaveButton, themeStyles[theme].stopButton]} onPress={leaveRoom}>
                <Text style={styles.buttonText}>Leave Room</Text>
            </TouchableOpacity> */}
        </View>

    );
};
export default StreamRoom;
