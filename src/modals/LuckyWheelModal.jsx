/* eslint-disable react-native/no-inline-styles */
// LuckyWheelModal.js
import React, { useEffect, useRef, useState } from 'react';
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
import { styles } from '../../assets/styles/ThemeStyles';
import { SendErrorTotheServer, socket } from '../utils/constant';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import CustomConfirmDialog from './CustomConfirmDialog';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


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


const wheelSize = screenWidth * 0.7 + 15; // 80% of screen width
const svgSize = wheelSize * 0.8 + 25;     // Slightly smaller than outer wheel


const LuckyWheelModal = (
    { visible, onClose, userData,
        hostDetails, RoomID }
) => {
    const insets = useSafeAreaInsets();
    const [countdown, setCountdown] = useState(0);
    const [selectedMultiplier, setSelectedMultiplier] = useState('Double');
    const [message, setMessage] = useState('Get Ready');
    const [spinResultMessage, setSpinResultMessage] = useState('');
    const [activeBetAmount, setActiveBetAmount] = useState(null);
    const [mycredit, setMyCredit] = useState(0); // Track user's credit
    const spinValue = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const [bigCountdownNumber, setBigCountdownNumber] = useState(null);
    const [userBets, setUserBets] = useState([
        // {
        //     "socketId": "RRaF3e1Bty8BcbMWAAAX",
        //     "userName": "Y0 01",
        //     "userid": 178,
        //     "HostId": 178,
        //     "multiplier": "Double",
        //     "betAmount": 500,
        //     "isWinner": 2
        // },
        // {
        //     "socketId": "RRaF3e1Bty8BcbMWAAAX",
        //     "userName": "Y0 01",
        //     "userid": 179,
        //     "HostId": 178,
        //     "multiplier": "Triple",
        //     "betAmount": 300,
        //     "isWinner": 2
        // },
        // {
        //     "socketId": "RRaF3e1Bty8BcbMWAAAX",
        //     "userName": "Y0 01",
        //     "userid": 180,
        //     "HostId": 178,
        //     "multiplier": "5x",
        //     "betAmount": 200,
        //     "isWinner": 2
        // },
        // {
        //     "socketId": "RRaF3e1Bty8BcbMWAAAX",
        //     "userName": "Y0 01",
        //     "userid": 181,
        //     "HostId": 178,
        //     "multiplier": "25x",
        //     "betAmount": 100,
        //     "isWinner": 2
        // },
    ]);
    const [betButtonsDisabled, setBetButtonsDisabled] = useState(false);
    const [closePlaceBetDialog, setClosePlaceBetDialog] = useState(false);
    const [hideBetButtons, setHideBetButtons] = useState(false);
    const idleSpin = useRef(new Animated.Value(0)).current;
    const placeBetButtonRef = useRef(false);
    const intervalRef = useRef(null);
    const myCreditRef = useRef(mycredit);


    // Animation states for chip collection
    const [flyingChips, setFlyingChips] = useState([]);
    const [displayCredit, setDisplayCredit] = useState(0);
    const creditCountAnim = useRef(new Animated.Value(0)).current;
    const chipsGlowAnim = useRef(new Animated.Value(0)).current;

    // Refs for positioning
    const chipsBoxRef = useRef(null);
    const [chipsBoxLayout, setChipsBoxLayout] = useState(null);

    // Win animation states
    const [winParticles, setWinParticles] = useState([]);
    const winTextAnim = useRef(new Animated.Value(0)).current;


    const startIdleRotation = () => {
        idleSpin.setValue(0);
        Animated.loop(
            Animated.timing(idleSpin, {
                toValue: 1,
                duration: 8000, // 1 full rotation every 8s
                easing: Easing.linear,
                useNativeDriver: true,
            })
        ).start();
    };


    const stopIdleRotation = () => {
        idleSpin.stopAnimation();
    };

    useEffect(() => {
        if (userData && mycredit > 0) {
            setDisplayCredit(mycredit);
        }
    }, [userData, mycredit]);


    useEffect(() => {
        myCreditRef.current = mycredit; // Update ref whenever mycredit changes
    }, [mycredit]);

    useEffect(() => {
        if (visible) {
            spinValue.setValue(0); // Reset spin
            idleSpin.setValue(0); // Reset idle
            startIdleRotation(); // Start idle spinning
        } else {
            stopIdleRotation();  // Stop idle spinning when modal closes
        }

        return () => {
            stopIdleRotation();
        };
    }, [visible]);

    const HandleUpdatedCredit = (amount) => {
        setMyCredit(prev => {
            if (prev !== amount) {
                setDisplayCredit(amount);
                return amount;
            }
            return prev;
        });
        // setDisplayCredit(amount);
    };

    const HandleBetUserList = (users) => {
        // console.log('Received user bets:', users);
        setUserBets(users);
    };


    useEffect(() => {
        if (visible && userData && userBets.length > 0) {
            const userBet = userBets.find(bet => bet.userid === userData?.userid);
            // console.log('Checking user bet:', userBet);
            if (userBet) {
                // User has an active bet
                // console.log('User has bet:', userBet.betAmount, userBet.multiplier);
                setBetButtonsDisabled(true);
                setActiveBetAmount(Number(userBet.betAmount));
                setSelectedMultiplier(userBet.multiplier);
                placeBetButtonRef.current = true;
                setMessage(`Bet placed on ${userBet.multiplier}`);
            } else {
                // No active bet, reset states
                // console.log('No active bet for user');
                setBetButtonsDisabled(false);
                setActiveBetAmount(null);
                setSelectedMultiplier('Double');
                placeBetButtonRef.current = false;
                setMessage('Get Ready');
            }
        }
    }, [visible, userBets, userData]);


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
                setClosePlaceBetDialog(false);
            }
            if (counter === 5) {
                const sound = new Sound('no_more_bets', Sound.MAIN_BUNDLE, (error) => {
                    sound.play(() => {
                        sound.release();
                    });
                });
                setBetButtonsDisabled(true);
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
                // setBetButtonsDisabled(false);
            }
        }, 1000);
    };

    // 2️⃣ Socket handlers
    const HandleTimer = (time) => {
        setHideBetButtons(false);
        setMessage('');
        setSpinResultMessage('');
        startCountdown(time); // This will clear any old countdown and restart
        setActiveBetAmount(null);
        setBetButtonsDisabled(false);
        startIdleRotation();
        placeBetButtonRef.current = false;
    };


    // Enhanced chip collection animation
    const startChipCollectionAnimation = (winAmount, resultLabel) => {
        // Use myCreditRef.current instead of mycredit
        const currentCredit = isNaN(myCreditRef.current) || myCreditRef.current === null ? 0 : myCreditRef.current;

        // if host then winAmount multiply by resultLabel
        // let isHost = true;
        // const increaseWinAmount = resultLabel === 'Double' ? 2 * winAmount :
        //     resultLabel === 'Triple' ? 3 * winAmount :
        //         resultLabel === '5x' ? 5 * winAmount :
        //             resultLabel === '25x' ? 25 * winAmount : 2 * winAmount;
        // const targetCredit = currentCredit + (isHost ? increaseWinAmount : winAmount);


        const targetCredit = currentCredit + winAmount;

        // Start from the middle of the screen
        const startX = screenWidth / 2;
        const startY = screenHeight / 2;
        const defaultChipsBoxLayout = chipsBoxLayout || { x: 20, y: 20, width: 80, height: 40 };

        const multiplierNum = resultLabel === 'Double' ? 2 :
            resultLabel === 'Triple' ? 3 :
                resultLabel === '5x' ? 5 :
                    resultLabel === '25x' ? 25 : 2;

        const newFlyingChips = [];
        for (let i = 0; i < multiplierNum; i++) {
            newFlyingChips.push({
                id: `chip-${Date.now()}-${i}`,
                translateX: new Animated.Value(startX),
                translateY: new Animated.Value(startY),
                scaleAnim: new Animated.Value(0),
                opacityAnim: new Animated.Value(1),
                delay: i * 100,
            });
        }

        setFlyingChips(newFlyingChips);

        Animated.sequence([
            Animated.timing(chipsGlowAnim, {
                toValue: 1,
                duration: 200,
                useNativeDriver: false,
            }),
            Animated.timing(chipsGlowAnim, {
                toValue: 0,
                duration: 1000,
                useNativeDriver: false,
            })
        ]).start();

        newFlyingChips.forEach((chip, index) => {
            Animated.timing(chip.scaleAnim, {
                toValue: 1,
                duration: 200,
                delay: chip.delay,
                useNativeDriver: true,
            }).start();

            setTimeout(() => {
                Animated.parallel([
                    Animated.timing(chip.translateX, {
                        toValue: defaultChipsBoxLayout.x + defaultChipsBoxLayout.width / 2,
                        duration: 800,
                        easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
                        useNativeDriver: true,
                    }),
                    Animated.timing(chip.translateY, {
                        toValue: defaultChipsBoxLayout.y + defaultChipsBoxLayout.height / 2,
                        duration: 800,
                        easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
                        useNativeDriver: true,
                    }),
                ]).start();

                setTimeout(() => {
                    Animated.timing(chip.opacityAnim, {
                        toValue: 0,
                        duration: 200,
                        useNativeDriver: true,
                    }).start();
                }, 600);
            }, chip.delay);
        });

        setTimeout(() => {
            animateCredits(currentCredit, targetCredit);
        }, 400);

        setTimeout(() => {
            setFlyingChips([]);
        }, 2000);
    };

    // Animated credit counting - only for visual effect, doesn't update actual credit
    const animateCredits = (from, to) => {
        creditCountAnim.setValue(0);
        Animated.timing(creditCountAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.out(Easing.quad),
            useNativeDriver: false,
        }).start();

        const listener = creditCountAnim.addListener(({ value }) => {
            const currentCredit = Math.floor(from + (to - from) * value);
            setDisplayCredit(currentCredit);
        });

        setTimeout(() => {
            creditCountAnim.removeListener(listener);
            setDisplayCredit(to);
        }, 1000);
    };



    // Beautiful win animation with particle burst and text
    const startWinAnimation = (winAmount) => {
        // Particle animation
        const particles = [];
        for (let i = 0; i < 20; i++) {
            const anim = new Animated.Value(0);
            const direction = Math.random() * Math.PI * 2;
            const distance = 100 + Math.random() * 200;
            const endX = Math.cos(direction) * distance;
            const endY = Math.sin(direction) * distance;
            particles.push({
                id: i,
                anim,
                endX,
                endY,
                rotate: Math.random() * 360,
                size: 20 + Math.random() * 20,
            });
        }
        setWinParticles(particles);
        particles.forEach(p => {
            Animated.timing(p.anim, {
                toValue: 1,
                duration: 2000 + Math.random() * 500,
                easing: Easing.out(Easing.quad),
                useNativeDriver: true,
            }).start();
        });

        // Text animation
        winTextAnim.setValue(0);
        Animated.sequence([
            Animated.timing(winTextAnim, {
                toValue: 1,
                duration: 500,
                easing: Easing.out(Easing.back(1.5)),
                useNativeDriver: true,
            }),
            Animated.timing(winTextAnim, {
                toValue: 0,
                duration: 500,
                delay: 1000,
                useNativeDriver: true,
            })
        ]).start();

        setTimeout(() => setWinParticles([]), 2000);
    };

    const handleSpinResult = ({ isWin, WinAmount, resultLabel }) => {
        const resultMessage = isWin
            ? `✅ You WON ${WinAmount} chips!`
            : `❌ You LOST! because Wheel Landed on ${resultLabel}`;

        setSpinResultMessage(resultMessage);

        if (isWin) {
            // Play winner sound
            const sound = new Sound('winner', Sound.MAIN_BUNDLE, (error) => {
                if (error) {
                    SendErrorTotheServer(error, 'LuckyWheelModal');
                    return;
                }
                sound.play((success) => {
                    if (!success) {
                        SendErrorTotheServer(error, 'LuckyWheelModal');
                    }
                    sound.release();
                });
            });
            startWinAnimation(WinAmount);
        }

        // Start chip collection animation if user won
        if (isWin && WinAmount > 0) {
            setTimeout(() => {
                startChipCollectionAnimation(WinAmount, resultLabel);
            }, 3000);
        }

    };

    const handleBetError = (error) => {
        Alert.alert('Message', error || 'You have not sufficient chips to place a bet!');
    };

    const handleBetSuccess = () => {
        setBetButtonsDisabled(true);
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
        socket.on('bet_error', handleBetError);
        socket.on('Bet-Success', handleBetSuccess);
        return () => {
            socket.off('updated_Credit', HandleUpdatedCredit);
            socket.off('spinwheel_timer', HandleTimer);
            socket.off('betPlace-Users', HandleBetUserList);
            socket.off('start_spin', handleSpin);
            socket.off('Spin-result', handleSpinResult);
            socket.off('bet_error', handleBetError);
            socket.off('Bet-Success', handleBetSuccess);
        };
    }, []);


    // 4️⃣ Cleanup on unmount
    useEffect(() => {
        return () => {
            clearCountdown();
        };
    }, []);


    useEffect(() => {
        if (visible) {
            const sound = new Sound('launch_wheel', Sound.MAIN_BUNDLE, (error) => {
                if (error) {
                    SendErrorTotheServer(error, 'LuckyWheelModal');
                    return;
                }
                sound.play((success) => {
                    if (!success) {
                        SendErrorTotheServer(error, 'LuckyWheelModal');
                    }
                    sound.release(); // Free up resources
                });
            });
        } else {
            clearCountdown(); // Your existing cleanup
        }
    }, [visible]);




    const placeBet = (val) => {
        // 🚫 Host restriction
        if (userData?.userid === hostDetails?.userid) {
            Alert.alert('Message', 'You are host, you can’t play the game.');
            return;
        }
        if (!placeBetButtonRef.current) {
            socket.emit('place_bet', {
                userID: userData?.userid,
                HostId: hostDetails?.userid,
                betAmount: val,
                multiplier: selectedMultiplier,
                userName: userData?.screenName,
                RoomId: RoomID,
            });
            setClosePlaceBetDialog(false);
            // const sound = new Sound('place_your_bet', Sound.MAIN_BUNDLE, (error) => {
            //     sound.play(() => {
            //         sound.release();
            //     });
            // });
            setBetButtonsDisabled(true);
            setActiveBetAmount(val); // 👈 track which button is active
            setMessage(`Bet placed on ${selectedMultiplier}`);
            placeBetButtonRef.current = true;
        }
    };

    const handlePlaceBet = () => {
        // 🚫 Host restriction
        if (userData?.userid === hostDetails?.userid) {
            Alert.alert('Message', 'You are host, you can’t play the game.');
            return;
        }
        setClosePlaceBetDialog(true);
    };

    const handleSpin = (resultLabel) => {
        stopIdleRotation();
        idleSpin.setValue(0);
        spinValue.setValue(0);
        setHideBetButtons(true); // Hide bet buttons during spin

        const segmentCount = SEGMENTS.length;
        const anglePerSegment = 360 / segmentCount;

        // Find all indices where resultLabel appears
        const targetIndices = SEGMENTS.map((label, idx) => ({ label, idx }))
            .filter(s => s.label === resultLabel);

        if (targetIndices.length === 0) {
            console.warn("No matching segment found for:", resultLabel);
            return;
        }

        // Use the last index for "25x" to ensure we target the correct segment
        const selected = resultLabel === '25x' ? targetIndices[targetIndices.length - 1] : targetIndices[0];

        // Calculate angles
        const segmentStartAngle = selected.idx * anglePerSegment;
        const segmentCenterAngle = segmentStartAngle + anglePerSegment / 2;

        // Normalize to 0–360°
        let normalizedCenter = segmentCenterAngle % 360;
        if (normalizedCenter < 0) normalizedCenter += 360;

        // Calculate rotation needed to align segment center with 0° (top)
        let rotationNeeded = (360 - normalizedCenter) % 360;

        // Add a small offset to fine-tune alignment if needed
        const alignmentOffset = 0; // Adjust this if the wheel is slightly off (e.g., try 1 or 2 degrees)

        // Add random full rotations for dynamic spin
        const fullRotations = Math.floor(8 + Math.random() * 4);
        const baseRotations = fullRotations * 360;
        const finalRotation = baseRotations + rotationNeeded + alignmentOffset;

        console.log(
            `🎯 Target: ${resultLabel} | Index: ${selected.idx} | ` +
            `Segment Start: ${segmentStartAngle}° | Segment Center: ${segmentCenterAngle}° | ` +
            `Normalized Center: ${normalizedCenter}° | Rotation Needed: ${rotationNeeded}° | ` +
            `Final Rotation: ${finalRotation}°`
        );

        Animated.timing(spinValue, {
            toValue: finalRotation,
            duration: 4000,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
        }).start(() => {
            // console.log(`✅ Stopped on: ${resultLabel} at index: ${selected.idx} under arrow at TOP`);
            setSelectedMultiplier('Double'); // Reset multiplier after spin
        });
    };


    const renderSegments = () => {
        const radius = 200;
        const angle = 360 / SEGMENTS.length;
        const segments = [];

        // Adjusted offset to align segment center at top
        const offset = -90;

        for (let i = 0; i < SEGMENTS.length; i++) {
            const startAngle = i * angle + offset;
            const endAngle = (i + 1) * angle + offset;
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
                        fontSize="16"
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


    // Render flying chips
    const renderFlyingChips = () => {
        return flyingChips.map((chip) => (
            <Animated.View
                key={chip.id}
                style={[
                    mainStyle.flyingChip,
                    {
                        transform: [
                            { translateX: chip.translateX },
                            { translateY: chip.translateY },
                            { scale: chip.scaleAnim },
                            { translateX: -12.5 },
                            { translateY: -12.5 },
                        ],
                        opacity: chip.opacityAnim,
                    },
                ]}
            >
                <Image
                    source={require('../../assets/images/icons/icon_z.png')}
                    style={mainStyle.flyingChipIcon}
                    resizeMode="contain"
                />
            </Animated.View>
        ));
    };

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
                animationType="slide"
                style={[styles.profileModalMain]}
            >
                <LinearGradient
                    colors={['rgba(0, 0, 0, 0.34)', 'rgba(0, 0, 0, 0.34)', '#000000']}
                    locations={[0, 0.4, 1]}
                    style={[mainStyle.LWModalOverlay, { maxHeight: screenHeight * 0.9 - insets.top - 20 }]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                >
                    <View style={mainStyle.header}>
                        <Animated.View
                            ref={chipsBoxRef}
                            onLayout={(event) => {
                                const { x, y, width, height } = event.nativeEvent.layout;
                                setChipsBoxLayout({ x, y, width, height });
                            }}
                            style={[
                                mainStyle.chipsBox,
                                {
                                    shadowColor: chipsGlowAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: ['transparent', '#FFD700']
                                    }),
                                    shadowOpacity: chipsGlowAnim,
                                    shadowRadius: chipsGlowAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [0, 15]
                                    }),
                                    elevation: chipsGlowAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [0, 8]
                                    }),
                                }
                            ]}
                        >
                            <Image
                                source={require('../../assets/images/icons/icon_z.png')}
                                style={{ width: 16, height: 16, marginTop: 2, }}
                                resizeMode="contain"
                            />
                            <Text style={[mainStyle.chips]}>{displayCredit}</Text>
                        </Animated.View>
                        <TouchableOpacity onPress={closeModal}>
                            <Ionicons name="close" size={28} color="#fff" />
                        </TouchableOpacity>
                    </View>
                    {/* Flying chips overlay */}
                    <View style={mainStyle.flyingChipsContainer} pointerEvents="none">
                        {renderFlyingChips()}
                        {winParticles.map(p => (
                            <Animated.Image
                                key={p.id}
                                source={require('../../assets/images/icons/icon_z.png')}
                                style={{
                                    position: 'absolute',
                                    left: '50%',
                                    top: '50%',
                                    width: p.size,
                                    height: p.size,
                                    transform: [
                                        { translateX: p.anim.interpolate({ inputRange: [0, 1], outputRange: [0, p.endX] }) },
                                        { translateY: p.anim.interpolate({ inputRange: [0, 1], outputRange: [0, p.endY] }) },
                                        { rotate: p.anim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${p.rotate}deg`] }) },
                                        { scale: p.anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 1.5, 0] }) },
                                    ],
                                    opacity: p.anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1, 0] }),
                                }}
                            />
                        ))}
                        <Animated.View
                            style={[mainStyle.winTextContainer, { justifyContent: 'center', alignItems: 'center' }]}
                        >
                            <Animated.Text
                                style={[
                                    mainStyle.winText,
                                    {
                                        transform: [
                                            { scale: winTextAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 1.5, 1] }) },
                                        ],
                                        opacity: winTextAnim,
                                    }]}
                            >
                                YOU WON!
                            </Animated.Text>
                        </Animated.View>
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

                    {/* main container */}
                    <View style={mainStyle.container}>
                        <View style={mainStyle.wheelWrapperContainer}>
                            <View style={mainStyle.wheelWrapper}>
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
                                                    inputRange: [0, 360 * 20],
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
                        <Text style={[mainStyle.countdownText, {
                            opacity: countdown <= 5 ? 0 : 1,
                            marginTop: countdown <= 5 ? 5 : 40,
                        }]}>⏱ {countdown}s</Text>

                        {/* user bets list */}
                        {userBets.length > 0 && (
                            <View style={[mainStyle.userBetTable]}>
                                {/* Summary Section */}
                                <View style={mainStyle.betSummary}>
                                    <Text style={mainStyle.summaryText}>
                                        Total Players: {userBets.length}
                                    </Text>
                                    <Text style={mainStyle.summaryText}>
                                        Total Bet Amount: {userBets.reduce((sum, user) => sum + Number(user.betAmount), 0)}
                                    </Text>
                                </View>
                                {/* Existing Table Header and Content */}
                                <View style={mainStyle.tableHeader}>
                                    <Text style={mainStyle.emptyCell}></Text>
                                    <Text style={mainStyle.userCell}>User</Text>
                                    <Text style={mainStyle.betCell}>Bet</Text>
                                    <Text style={mainStyle.optionCell}>Option</Text>
                                </View>
                                <ScrollView
                                    style={{ maxHeight: screenHeight * 0.2 - 50 }}
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

                        {/* multiplier buttons */}
                        {!hideBetButtons && (
                            <View style={[mainStyle.betGroup, { marginTop: userBets.length > 0 ? 0 : 10 }]}>
                                {['Double', 'Triple', '5x', '25x'].map((option, ind, arr) => {
                                    const isActive = selectedMultiplier === option;
                                    const isFirst = ind === 0;
                                    const isLast = ind === arr.length - 1;
                                    return (
                                        <TouchableOpacity
                                            key={option}
                                            style={[
                                                mainStyle.betButton,
                                                {
                                                    backgroundColor: isActive
                                                        ? '#39FF14' // Neon Lime for active
                                                        : ['#00a3ccff', '#ff9a27ff', '#d93a2d', '#834fffff'][ind], // Vibrant colors
                                                    borderTopLeftRadius: isFirst ? 4 : 0,
                                                    borderBottomLeftRadius: isFirst ? 4 : 0,
                                                    borderTopRightRadius: isLast ? 4 : 0,
                                                    borderBottomRightRadius: isLast ? 4 : 0,
                                                    borderRightWidth: isLast ? 0 : 1,
                                                    borderRightColor: '#00000022',
                                                    shadowColor: isActive ? '#39FF14' : '#000',
                                                    shadowOffset: { width: 0, height: 1 },
                                                    shadowOpacity: isActive ? 0.8 : 0.2,
                                                    shadowRadius: isActive ? 6 : 2,
                                                    elevation: isActive ? 6 : 2,
                                                },
                                            ]}
                                            onPress={() => setSelectedMultiplier(option)}
                                        >
                                            <Text style={[
                                                mainStyle.betButtonText,
                                                {
                                                    color: isActive ? '#000' : '#fff',
                                                    fontSize: 14,
                                                },
                                            ]}>
                                                {option}
                                            </Text>
                                        </TouchableOpacity>
                                    )
                                })}
                            </View>
                        )}

                        {/* User Bet Buttons */}
                        {!hideBetButtons && (
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
                                                    activeBetAmount === 500 ? '#39FF14' : '#1E90FF', // Active: Cyan Glow, Inactive: Dodger Blue
                                                opacity: (activeBetAmount && activeBetAmount !== 500) || betButtonsDisabled ? 0.6 : 1,
                                                borderRadius: 4,
                                                shadowColor: '#00FFFF',
                                                shadowOffset: { width: 0, height: 0 },
                                                shadowOpacity: 0.9,
                                                shadowRadius: 10,
                                                elevation: 8,
                                            },
                                        ]}
                                        onPress={handlePlaceBet}
                                        // onPress={() => handleSpin('25x')}
                                        disabled={betButtonsDisabled || (activeBetAmount && activeBetAmount !== 500)}
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
                                                        activeBetAmount === 500 ? '#39FF14' : '#1E90FF', // Active: Cyan Glow, Inactive: Dodger Blue
                                                    opacity: (activeBetAmount && activeBetAmount !== 500) || betButtonsDisabled ? 0.6 : 1,
                                                    borderRadius: 4,
                                                    shadowColor: '#00FFFF',
                                                    shadowOffset: { width: 0, height: 0 },
                                                    shadowOpacity: 0.9,
                                                    shadowRadius: 10,
                                                    elevation: 8,
                                                },
                                            ]}
                                            onPress={() => placeBet(500)}
                                            disabled={betButtonsDisabled || (activeBetAmount && activeBetAmount !== 500)}
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
                                                        activeBetAmount === 100 ? '#39FF14' : '#FF1493', // Active: Magenta Glow, Inactive: Deep Pink
                                                    opacity: (activeBetAmount && activeBetAmount !== 100) || betButtonsDisabled ? 0.6 : 1,
                                                    borderRadius: 4,
                                                    shadowColor: '#FF00FF',
                                                    shadowOffset: { width: 0, height: 0 },
                                                    shadowOpacity: 0.9,
                                                    shadowRadius: 10,
                                                    elevation: 8,
                                                },
                                            ]}
                                            onPress={() => placeBet(100)}
                                            disabled={betButtonsDisabled || (activeBetAmount && activeBetAmount !== 100)}
                                        >
                                            <Text style={mainStyle.placeBetBtnText}>
                                                BET 100
                                            </Text>
                                        </TouchableOpacity>

                                    </>
                                )}
                            </View>
                        )}

                        {/* Spin Result Message */}
                        <Text style={[mainStyle.spinResultMessageText]}>{spinResultMessage}</Text>

                    </View>


                </LinearGradient>

            </Modal>
            {closePlaceBetDialog && (
                <CustomConfirmDialog
                    visible={closePlaceBetDialog}
                    title="Place Bet"
                    message="Are you sure you want to place 500 chips to play?"
                    onCancel={() => setClosePlaceBetDialog(false)}
                    onConfirm={() => placeBet(500)}
                    cancelText="Cancel"
                    confirmText="Place Bet"
                />
            )}
        </>
    );
};

export default LuckyWheelModal;

const mainStyle = StyleSheet.create({
    LWModalOverlay: {
        flex: 1,
        padding: 10,
        zIndex: 10,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
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
        backgroundColor: '#ffffff7e',
    },
    flyingChipsContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
    },
    flyingChip: {
        position: 'absolute',
        width: 25,
        height: 25,
        zIndex: 1001,
    },
    flyingChipIcon: {
        width: 25,
        height: 25,
        // tintColor: '#FFD700',
    },
    winTextContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        zIndex: 1002,
        justifyContent: 'center',
        alignItems: 'center',
    },
    winText: {
        fontSize: 40,
        fontWeight: 'bold',
        color: '#FFD700',
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 10,
        zIndex: 1002,
        textAlign: 'center',
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
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    bigCountDownText: {
        fontSize: 100,
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    container: {
        flex: 1,
        justifyContent: 'flex-end',
        position: 'relative',
    },
    wheelWrapperContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    wheelWrapper: {
        width: 220,
        height: 220,
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
        fontSize: 16,
        marginTop: 10,
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    countdownText: {
        fontSize: 19,
        color: '#fff',
        textAlign: 'center',
        marginTop: 20,
        fontWeight: 'bold',
    },
    userBetTable: {
        marginHorizontal: 10,
        marginVertical: 10,
    },
    betSummary: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        paddingHorizontal: 10,
        backgroundColor: '#ffffff1a',
        borderRadius: 6,
        marginBottom: 8,
    },
    summaryText: {
        fontSize: 14,
        color: '#fff',
        fontWeight: 'bold',
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
        paddingVertical: 5,
        paddingHorizontal: 10,
        // borderRadius: 8,
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
        width: 22,
        height: 22,
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
        color: '#fff',
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
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold',
    },
    closeBtn: {
        marginTop: 20,
        fontSize: 16,
    },
});
