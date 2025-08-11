/* eslint-disable react-native/no-inline-styles */
// LuckyWheelModal.js
import React, { useContext, useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Animated,
    Easing,
    Image,
    Dimensions,
    ScrollView,
    Alert,
} from 'react-native';
import Modal from 'react-native-modal';
import Svg, { Circle, G, Path, Text as SvgText } from 'react-native-svg';
import Sound from 'react-native-sound';
import { ThemeContext } from '../context/ThemeContext';
import { styles } from '../../assets/styles/ThemeStyles';
import { socket } from '../utils/constant';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { BlurView } from '@react-native-community/blur';


const { width: screenWidth } = Dimensions.get('window');
const screenHeight = Dimensions.get('window').height;


const SEGMENTS = [
    '5x', 'Triple', 'Double', 'Triple', '5x', 'Double', 'Triple', 'Double',
    '5x', 'Double', 'Triple', 'Double', '5x', 'Triple', 'Double', '25x',
];

const COLORS = {
    Double: '#00a3ccff',
    Triple: '#ff9a27ff',
    '5x': '#d93a2d',
    '25x': '#834fffff',
};

const winIcon = require('../../assets/images/lucky-wheel/win.png');
const loseIcon = require('../../assets/images/lucky-wheel/lose.png');
const blueChipIcon = require('../../assets/images/lucky-wheel/blue-chip.png');
const redChipIcon = require('../../assets/images/lucky-wheel/red_chip.png');


const wheelSize = screenWidth * 0.8; // 80% of screen width
const svgSize = wheelSize * 0.9;     // Slightly smaller than outer wheel

const LuckyWheelModal = (
    { visible, onClose, userData,
        hostDetails, RoomID }
) => {
    const { theme } = useContext(ThemeContext);
    const [countdown, setCountdown] = useState(0);
    const [selectedMultiplier, setSelectedMultiplier] = useState('Double');
    const [betPlaced, setBetPlaced] = useState(false);
    const [message, setMessage] = useState('Get Ready');
    const [spinResultMessage, setSpinResultMessage] = useState('');
    const [activeBetAmount, setActiveBetAmount] = useState(null);
    const [mycredit, setMyCredit] = useState(0); // Track user's credit
    const spinValue = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const [bigCountdownNumber, setBigCountdownNumber] = useState(null);
    const [userBets, setUserBets] = useState([]);

    const idleSpin = useRef(new Animated.Value(0)).current;
    const intervalRef = useRef(null);

    const startIdleRotation = () => {
        idleSpin.setValue(0);
        Animated.loop(
            Animated.timing(idleSpin, {
                toValue: 1,
                duration: 5000, // 1 full rotation per second
                easing: Easing.linear,
                useNativeDriver: true,
            })
        ).start();
    };


    const stopIdleRotation = () => {
        idleSpin.stopAnimation();
    };

    useEffect(() => {
        if (visible) {
            startIdleRotation(); // Start idle spinning when modal opens
        } else {
            stopIdleRotation();  // Stop idle spinning when modal closes
        }

        return () => {
            stopIdleRotation();
        };
    }, [visible]);

    const HandleUpdatedCredit = (amount) => {
        setMyCredit(amount);
    };

    const HandleBetUserList = (users) => {
        console.log('users', users);
        setUserBets(users);
    };


    // 1️⃣ Always clear interval safely
    const clearCountdown = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };

    const startCountdown = (duration) => {
        clearCountdown(); // ⬅️ clear any previous countdown first
        // Only start a new interval if none exists
        let counter = duration;
        setCountdown(counter);

        intervalRef.current = setInterval(() => {
            counter -= 1;
            setCountdown(counter);

            if (counter === 5) {
                const sound = new Sound('no_more_bets.mp3', Sound.MAIN_BUNDLE, (error) => {
                    sound.play(() => {
                        sound.release();
                    });
                });
            }

            if (counter <= 5) {
                setBigCountdownNumber(counter);
                fadeAnim.setValue(0);

                Animated.sequence([
                    Animated.timing(fadeAnim, {
                        toValue: 1,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                    Animated.timing(fadeAnim, {
                        toValue: 0,
                        duration: 300,
                        useNativeDriver: true,
                        delay: 300,
                    }),
                ]).start();
            } else {
                setBigCountdownNumber(null);
            }

            if (counter <= 0) {
                clearCountdown();
                setMessage('Spinning...');
                setBigCountdownNumber(null);
                setActiveBetAmount(null);
            }
        }, 1000);
    };

    // 2️⃣ Socket handlers
    const HandleTimer = (time) => {
        console.log('Timer received from server:', time);
        setMessage('');
        setSpinResultMessage('');
        startCountdown(time); // This will clear any old countdown and restart
    };

    const handleSpinResult = ({ isWin, WinAmount, resultLabel }) => {
        setSpinResultMessage(
            isWin
                ? `✅ You WON ${WinAmount} chips!`
                : `❌ You LOST! Landed on ${resultLabel}`
        );
    };

    // Sound setup

    useEffect(() => {
        if (userData) {
            socket.emit('User-joined-SpinWheel', RoomID, userData?.userid, userData?.screenName, userData?.avatar);
        }
        socket.on('updated_Credit', HandleUpdatedCredit);
        socket.on('spinwheel_timer', HandleTimer);
        socket.on('betPlace-Users', HandleBetUserList);
        socket.on('start_spin', handleSpin);
        socket.on('Spin-result', handleSpinResult);
        return () => {
            socket.off('updated_Credit', HandleUpdatedCredit);
            socket.off('spinwheel_timer', HandleTimer);
            socket.off('betPlace-Users', HandleBetUserList);
            socket.off('start_spin', handleSpin);
            socket.off('Spin-result', handleSpinResult);
        };
    }, []);


    // 4️⃣ Cleanup on unmount
    useEffect(() => {
        return () => {
            clearCountdown();
        };
    }, []);


    // useEffect(() => {
    //     startCountdown(10);
    //     socket.on('start_countdown', ({ seconds }) => {
    //         startCountdown(seconds || 30);
    //     });
    // }, []);


    useEffect(() => {
        if (visible) {
            const sound = new Sound('wheel_launch.mp3', Sound.MAIN_BUNDLE, (error) => {
                if (error) {
                    console.log('Failed to load the sound', error);
                    return;
                }
                sound.play((success) => {
                    if (!success) {
                        console.log('Sound playback failed');
                    }
                    sound.release(); // Free up resources
                });
            });
        } else {
            clearCountdown(); // Your existing cleanup
        }
    }, [visible]);




    const placeBet = (val) => {
        if (!selectedMultiplier || betPlaced) {
            setMessage('Bet already placed or not selected!');
            return;
        }

        socket.emit('place_bet', {
            userID: userData?.userid,
            HostId: hostDetails?.userid,
            betAmount: val,
            multiplier: selectedMultiplier,
            userName: userData?.screenName,
            RoomId: RoomID,
        })

        // const sound = new Sound('place_your_bet.mp3', Sound.MAIN_BUNDLE, (error) => {
        //     sound.play(() => {
        //         sound.release();
        //     });
        // });
        setBetPlaced(true);
        setActiveBetAmount(val); // 👈 track which button is active
        setMessage(`Bet placed on ${selectedMultiplier}`);
    };

    const handleSpin = (resultLabel) => {
        stopIdleRotation();

        const segmentCount = SEGMENTS.length;
        const anglePerSegment = 360 / segmentCount; // 22.5 degrees per segment

        // Find all indices that match the result label
        const targetIndices = SEGMENTS
            .map((label, idx) => ({ label, idx }))
            .filter(s => s.label === resultLabel);

        // Randomly select one of the matching segments
        const selected = targetIndices[Math.floor(Math.random() * targetIndices.length)];

        // Since our renderSegments starts from -90° (top), calculate the actual angles
        const segmentStartAngle = (selected.idx * anglePerSegment) - 90;
        const segmentCenterAngle = segmentStartAngle + (anglePerSegment / 2);

        // We want to rotate the wheel so that the segment center ends up at the top (-90°)
        // Since we're rotating clockwise, we need to calculate the rotation differently

        // Convert angles to a 0-360 range for easier calculation
        let normalizedSegmentCenter = segmentCenterAngle;
        if (normalizedSegmentCenter < 0) {
            normalizedSegmentCenter += 360;
        }

        let normalizedTargetPosition = 270; // -90° in 0-360 range is 270°

        // Calculate rotation needed (clockwise)
        let rotationNeeded = normalizedTargetPosition - normalizedSegmentCenter;
        if (rotationNeeded < 0) {
            rotationNeeded += 360;
        }

        // Add multiple full rotations for visual effect
        // IMPORTANT: Use whole numbers for base rotations to avoid modulo issues
        const numberOfFullRotations = Math.floor(8 + Math.random() * 4); // 8-11 full rotations
        const baseRotations = numberOfFullRotations * 360; // Always exact multiples of 360
        const finalRotation = baseRotations + rotationNeeded;

        console.log(`Selected segment: ${resultLabel} at index ${selected.idx}`);
        console.log(`Raw segment center angle: ${segmentCenterAngle}°`);
        console.log(`Normalized segment center: ${normalizedSegmentCenter}°`);
        console.log(`Target position: ${normalizedTargetPosition}° (top of wheel)`);
        console.log(`Rotation needed: ${rotationNeeded}°`);
        console.log(`Number of full rotations: ${numberOfFullRotations}`);
        console.log(`Base rotations: ${baseRotations}° (exact multiple of 360)`);
        console.log(`Final rotation: ${finalRotation}°`);
        console.log(`Final rotation mod 360: ${finalRotation % 360}° (should equal rotation needed: ${rotationNeeded}°)`);
        console.log(`Expected final segment position: ${(normalizedSegmentCenter + rotationNeeded) % 360}° (should be 270°)`);

        // Double-check our math
        const checkPosition = (normalizedSegmentCenter + rotationNeeded) % 360;
        console.log(`Math check: ${normalizedSegmentCenter}° + ${rotationNeeded}° = ${checkPosition}° (should be 270°)`);

        Animated.timing(spinValue, {
            toValue: finalRotation,
            duration: 4000,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
        }).start(() => {
            setTimeout(() => {
                setMessage(`Landed on ${resultLabel}`);
                setBetPlaced(false);
                setSelectedMultiplier(null);

                // Set the final position for next spin
                const finalAngle = finalRotation % 360;
                spinValue.setValue(finalAngle);

                // Restart idle rotation from the final position
                setTimeout(() => {
                    startIdleRotation();
                }, 1000);
            }, 500);
        });
        setActiveBetAmount(null);
    };

    const renderSegments = () => {
        const radius = 200;
        const angle = 360 / SEGMENTS.length;
        const segments = [];

        for (let i = 0; i < SEGMENTS.length; i++) {
            const startAngle = i * angle;
            const endAngle = (i + 1) * angle;
            const color = COLORS[SEGMENTS[i]] || '#000';

            const largeArc = angle > 180 ? 1 : 0;
            const x1 = radius + radius * Math.cos((Math.PI * startAngle) / 180);
            const y1 = radius + radius * Math.sin((Math.PI * startAngle) / 180);
            const x2 = radius + radius * Math.cos((Math.PI * endAngle) / 180);
            const y2 = radius + radius * Math.sin((Math.PI * endAngle) / 180);

            const path = `
        M${radius},${radius}
        L${x1},${y1}
        A${radius},${radius} 0 ${largeArc},1 ${x2},${y2}
        Z
      `;

            const midAngle = startAngle + angle / 2;
            const textX = radius + radius * 0.6 * Math.cos((Math.PI * midAngle) / 180);
            const textY = radius + radius * 0.6 * Math.sin((Math.PI * midAngle) / 180);


            segments.push(
                <G key={i}>
                    <Path d={path} fill={color} />
                    <SvgText
                        x={textX}
                        y={textY}
                        fill="#fff"
                        fontSize="18"
                        fontWeight="bold"
                        textAnchor="middle"
                        alignmentBaseline="middle"
                        transform={`rotate(${midAngle}, ${textX}, ${textY})`}
                    >
                        {SEGMENTS[i]}
                    </SvgText>
                </G>
            );
        }

        return segments;
    };

    const closeModal = () => {
        onClose();
        socket.emit('LeaveFromSpinWheel', RoomID, userData?.userid);
    };


    return (
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
            animationType="slide"
            style={[styles.profileModalMain]}
        >
            {/* Blur background */}
            {/* <BlurView
                style={StyleSheet.absoluteFill}
                blurType="dark" // light / dark / xlight
                blurAmount={10} // blur intensity
                reducedTransparencyFallbackColor="rgba(0,0,0,0.4)"
            /> */}
            <BlurView
                style={StyleSheet.absoluteFill}
                blurType="dark"
                blurAmount={30}
            // reducedTransparencyFallbackColor="white"
            />
            <View style={mainStyle.overlayBackground} />
            <View style={mainStyle.LWModalOverlay}
            >
                <View style={mainStyle.header}>
                    <View style={[mainStyle.chipsBox]}>
                        <Image
                            source={require('../../assets/images/icons/star.png')} // Adjust the path as needed
                            style={{ width: 14, height: 14 }}
                            resizeMode="contain"
                        />
                        <Text style={[mainStyle.chips]}>{mycredit}</Text>
                    </View>
                    <TouchableOpacity onPress={closeModal}>
                        <Ionicons name="close" size={28} color="#fff" />
                    </TouchableOpacity>
                </View>

                {/* Big Center Countdown */}
                {bigCountdownNumber !== null && (
                    <View
                        style={[mainStyle.bigCountDownBox]}
                    >
                        <LinearGradient
                            colors={['rgba(0, 0, 0, 0.42)', 'rgba(0, 0, 0, 0.47)', 'rgba(0, 0, 0, 0.36)']}
                            style={{
                                ...StyleSheet.absoluteFillObject,
                            }}
                        />

                        <Animated.Text
                            style={[mainStyle.bigCountDownText, {
                                opacity: fadeAnim,
                            }]}
                        >
                            {bigCountdownNumber}
                        </Animated.Text>
                    </View>
                )}

                <View style={mainStyle.wheelWrapperContainer}>
                    <View style={mainStyle.wheelWrapper}>
                        {/* Pointer/Arrow at the top of wheelWrapper */}
                        {/* <View style={{
                            position: 'absolute',
                            top: -25, // Position above the wheel
                            left: '50%',
                            marginLeft: -15, // Half of arrow width to center it
                            zIndex: 100
                        }}>
                            <View style={{
                                width: 0,
                                height: 0,
                                borderLeftWidth: 15,
                                borderRightWidth: 15,
                                borderTopWidth: 25,
                                borderLeftColor: 'transparent',
                                borderRightColor: 'transparent',
                                borderTopColor: '#FFD700', // Gold color
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.3,
                                shadowRadius: 2,
                            }} />
                        </View> */}
                        <Image
                            source={require('../../assets/images/lucky-wheel/wheel_outer.png')}
                            style={[mainStyle.wheelBackground, { width: wheelSize, height: wheelSize }]}
                            resizeMode="contain"
                        />
                        <Animated.View
                            style={[mainStyle.wheelSegmentBox, {
                                transform: [
                                    {
                                        rotate: spinValue.interpolate({
                                            inputRange: [0, 360 * 20], // Handle large rotation values
                                            outputRange: ['0deg', `${360 * 20}deg`],
                                            extrapolate: 'extend',
                                        }),
                                    },
                                    {
                                        rotate: idleSpin.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: ['0deg', '360deg'],
                                        }),
                                    },
                                ],
                            }]}
                        >
                            <Svg width={svgSize} height={svgSize} viewBox="0 0 400 400">
                                {renderSegments()}
                                <Circle cx="200" cy="200" r="10" fill="gold" />
                            </Svg>
                        </Animated.View>
                    </View>
                </View>
                {/* <Text style={[mainStyle.message]}>{message}</Text> */}
                <Text style={mainStyle.countdownText}>⏱ {countdown}s</Text>

                {userBets.length > 0 && (
                    <View style={mainStyle.userBetTable}>
                        <View style={mainStyle.tableHeader}>
                            <Text style={mainStyle.emptyCell}></Text>
                            <Text style={mainStyle.userCell}>User</Text>
                            <Text style={mainStyle.betCell}>Bet</Text>
                            <Text style={mainStyle.optionCell}>Option</Text>
                        </View>
                        <ScrollView
                            style={{ maxHeight: screenHeight * 0.2 - 22 }}
                            contentContainerStyle={{ gap: 6, paddingTop: 6 }}
                            showsVerticalScrollIndicator={true}
                        >
                            {userBets.map((user, index) => (
                                <View
                                    key={index}
                                    style={mainStyle.tableRow}
                                >
                                    <View style={mainStyle.cellIcon}>
                                        <Image
                                            source={
                                                user.isWinner === 1
                                                    ? winIcon
                                                    : user.isWinner === 0
                                                        ? loseIcon
                                                        : Number(user.betAmount) === 100
                                                            ? blueChipIcon
                                                            : redChipIcon
                                            }
                                            style={mainStyle.iconImage}
                                            resizeMode="contain"
                                        />
                                    </View>
                                    {/* User Info */}
                                    <View style={mainStyle.cellUser}>
                                        <Text style={mainStyle.cellUserText}>{user.userName}</Text>
                                    </View>

                                    {/* Bet Amount */}
                                    <Text style={mainStyle.cellBet}>{user.betAmount}</Text>

                                    {/* Multiplier Chip */}
                                    <View style={[
                                        mainStyle.cellMultiplier,
                                        { backgroundColor: COLORS[user.multiplier] || '#666' },
                                    ]}>
                                        <Text style={mainStyle.multiplierText}>{user.multiplier}</Text>
                                    </View>
                                </View>
                            ))}
                        </ScrollView>
                    </View>
                )}

                <View style={mainStyle.betGroup}>
                    {['Double', 'Triple', '5x', '25x'].map((option, ind, arr) => (
                        <TouchableOpacity
                            key={option}
                            style={[
                                mainStyle.betButton,
                                {
                                    backgroundColor:
                                        selectedMultiplier === option
                                            ? '#d93a63'
                                            : '#ddd',
                                    borderRightWidth: ind !== arr.length - 1 ? 1 : 0,
                                    borderRightColor: '#fafafa88',
                                },
                            ]}
                            onPress={() => setSelectedMultiplier(option)}
                        >
                            <Text style={[mainStyle.betButtonText, {
                                color: selectedMultiplier === option ? '#fff' : '#222',
                            }]}>{option}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={[mainStyle.placeBetBtnGroup]}>
                    {/* First button - 70% */}
                    {userBets.length === 0 ? (
                        <TouchableOpacity
                            style={[
                                mainStyle.placeBetBtn,
                                {
                                    flex: 7,
                                    marginRight: 5,
                                    backgroundColor:
                                        activeBetAmount === 500
                                            ? '#ff5733'
                                            : theme === 'dark'
                                                ? '#ffaa00'
                                                : '#ffcc00',
                                    opacity: activeBetAmount && activeBetAmount !== 500 ? 0.5 : 1,
                                },
                            ]}
                            onPress={() => {
                                Alert.alert(
                                    'Place Bet',
                                    'Are you sure you want to place 500 chips to play?',
                                    [
                                        { text: 'Cancel', style: 'cancel' },
                                        { text: 'OK', onPress: () => placeBet(500) }
                                    ]
                                );
                            }}
                            disabled={!!activeBetAmount && activeBetAmount !== 500}
                        >
                            <Text style={mainStyle.placeBetBtnText}>
                                BET 500
                            </Text>
                        </TouchableOpacity>
                    ) : (
                        <>
                            <TouchableOpacity
                                style={[
                                    mainStyle.placeBetBtn,
                                    {
                                        flex: 7,
                                        marginRight: 5,
                                        backgroundColor:
                                            activeBetAmount === 500
                                                ? '#ff5733'
                                                : theme === 'dark'
                                                    ? '#ffaa00'
                                                    : '#ffcc00',
                                        opacity: activeBetAmount && activeBetAmount !== 500 ? 0.5 : 1,
                                    },
                                ]}
                                onPress={() => placeBet(500)}
                                disabled={!!activeBetAmount && activeBetAmount !== 500}
                            >
                                <Text style={mainStyle.placeBetBtnText}>
                                    BET 500
                                </Text>
                            </TouchableOpacity>

                            {/* Second button - 30% */}
                            <TouchableOpacity
                                style={[
                                    mainStyle.placeBetBtn,
                                    {
                                        flex: 3,
                                        marginLeft: 5,
                                        backgroundColor:
                                            activeBetAmount === 100
                                                ? '#ff5733'
                                                : theme === 'dark'
                                                    ? '#ffaa00'
                                                    : '#ffcc00',
                                        opacity: activeBetAmount && activeBetAmount !== 100 ? 0.5 : 1,
                                    },
                                ]}
                                onPress={() => placeBet(100)}
                                disabled={!!activeBetAmount && activeBetAmount !== 100}
                            >
                                <Text style={mainStyle.placeBetBtnText}>
                                    BET 100
                                </Text>
                            </TouchableOpacity>

                        </>
                    )}

                </View>

                <Text style={[mainStyle.spinResultMessageText]}>{spinResultMessage}</Text>

            </View>

        </Modal>
    );
};

export default LuckyWheelModal;

const mainStyle = StyleSheet.create({
    LWModalOverlay: {
        flex: 1,
        // maxHeight: screenHeight * 0.9 - 20
        padding: 10,
        zIndex: 10,
    },
    overlayBackground: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.34)',
    },
    container: {
        flex: 1,
        alignItems: 'center',
        position: 'relative',
        paddingHorizontal: 12,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',

    },
    chipsBox: {
        paddingHorizontal: 15,
        paddingVertical: 3,
        borderRadius: 6,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: '#e9e9e9ff',
    },
    bigCountDownBox: {
        position: 'absolute',
        zIndex: 1000,
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    bigCountDownText: {
        fontSize: 100,
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    wheelWrapperContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    wheelWrapper: {
        width: 300,
        height: 300,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    wheelBackground: {
        width: wheelSize,
        height: wheelSize,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        zIndex: 99,
    },
    wheelSegmentBox: {
        position: 'relative',
        width: wheelSize,
        height: wheelSize,
        zIndex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    message: {
        fontSize: 16,
        marginTop: 10,
        color: '#fff',
        textAlign: 'center',
    },
    spinResultMessageText: {
        fontSize: 18,
        marginTop: 20,
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    countdownText: {
        fontSize: 18,
        color: 'darkorange',
        textAlign: 'center',
        marginVertical: 10,
    },
    userBetTable: {
        marginHorizontal: 10,
        marginBottom: 10,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#ddddddff',
        paddingVertical: 8,
        paddingHorizontal: 10,
        borderTopLeftRadius: 6,
        borderTopRightRadius: 6,
    },
    emptyCell: {
        flex: 0.5,
    },
    userCell: {
        flex: 2,
        fontWeight: 'bold',
        color: '#000',
    },
    betCell: {
        flex: 1,
        fontWeight: 'bold',
        color: '#000',
        textAlign: 'left',
    },
    optionCell: {
        flex: 1,
        fontWeight: 'bold',
        color: '#000',
    },
    tableRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 10,
        borderRadius: 8,
        backgroundColor: '#f2f2f2',
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 2,
        elevation: 1,
    },
    cellIcon: {
        flex: 0.5,
    },
    iconImage: {
        width: 25,
        height: 25,
    },
    cellUser: {
        flex: 2,
        flexDirection: 'row',
        alignItems: 'center',
    },
    cellUserText: {
        color: '#000',
    },
    cellBet: {
        flex: 1,
        fontWeight: '500',
        textAlign: 'left',
        marginLeft: 15,
        color: '#222',
    },
    cellMultiplier: {
        flex: 1,
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 12,
        alignItems: 'center',
    },
    multiplierText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    chips: {
        fontSize: 15,
        marginVertical: 4,
        color: '#000',
        fontWeight: 500,
    },
    betGroup: {
        flexDirection: 'row',
        marginBottom: 10,
        marginHorizontal: 10,
    },
    betButton: {
        padding: 10,
        borderRadius: 0,
        flex: 1,
    },
    betButtonText: {
        fontWeight: 'bold',
        textAlign: 'center',
    },
    placeBetBtnGroup: {
        flexDirection: 'row',
        marginHorizontal: 10,
        marginBottom: 10,
    },
    placeBetBtn: {
        padding: 12,
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    placeBetBtnText: {
        color: '#222',
        textAlign: 'center',
        fontWeight: 'bold',
    },
    closeBtn: {
        marginTop: 20,
        fontSize: 16,
    },
});
