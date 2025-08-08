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
} from 'react-native';
import Modal from 'react-native-modal';
import Svg, { Circle, G, Path, Text as SvgText } from 'react-native-svg';
import Sound from 'react-native-sound';
import { ThemeContext } from '../context/ThemeContext';
import { styles, themeStyles } from '../../assets/styles/ThemeStyles';
import { socket } from '../utils/constant';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';

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
    const [activeBetAmount, setActiveBetAmount] = useState(null);
    const [mycredit, setMyCredit] = useState(0); // Track user's credit
    const spinValue = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const [bigCountdownNumber, setBigCountdownNumber] = useState(null);

    const idleSpin = useRef(new Animated.Value(0)).current;



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


    const [userBets, setUserBets] = useState([
        { id: 'u1', username: 'Player1', avatar: require('../../assets/images/lucky-wheel/blue-chip.png'), multiplier: 'Double', bet: 100, isWinner: true },
        { id: 'u2', username: 'Player2', avatar: require('../../assets/images/lucky-wheel/blue-chip.png'), multiplier: '5x', bet: 500, isWinner: false },
        { id: 'u3', username: 'Player3', avatar: require('../../assets/images/lucky-wheel/blue-chip.png'), multiplier: 'Triple', bet: 200, isWinner: false },
        { id: 'u4', username: 'Player4', avatar: require('../../assets/images/lucky-wheel/blue-chip.png'), multiplier: '25x', bet: 300, isWinner: true },
        { id: 'u5', username: 'Player5', avatar: require('../../assets/images/lucky-wheel/blue-chip.png'), multiplier: 'Double', bet: 100, isWinner: false },
    ]);


    const HandleUpdatedCredit = (amount) => {
        setMyCredit(amount);
    }
    const HandleTimer = (time) => {
        console.log('Timer received from server:', time);
        startCountdown(time);
    }
    const HandleBetUserList = (users) => {
        setUserBets(users);
    }
    // Sound setup

    useEffect(() => {
        if (userData) {
            socket.emit('User-joined-SpinWheel', RoomID, userData?.userid, userData?.screenName, userData?.avatar);
        }
        socket.on('updated_Credit', HandleUpdatedCredit);
        socket.on('spinwheel_timer', HandleTimer)
        socket.on('userList', HandleBetUserList)
        return () => {
            socket.off('updated_Credit', HandleUpdatedCredit);
            socket.off('spinwheel_timer', HandleTimer)
            socket.off('userList', HandleBetUserList)
        }


    }, []);


    // Connect socket
    useEffect(() => {
        if (!visible) return;

        // startCountdown(10);
        // socket.on('start_countdown', ({ seconds }) => {
        //     startCountdown(seconds || 30);
        // });

        // handleSpin('Triple');
        // socket.on('start_spin', ({ resultLabel }) => {
        //     handleSpin(resultLabel);
        // });

        socket.on('spin_result', ({ resultLabel, winAmount, newBalance }) => {
            setMessage(winAmount > 0
                ? `✅ You WON ${winAmount} chips!`
                : `❌ You LOST! Landed on ${resultLabel}`);
        });
    }, [visible]);

    const startCountdown = (duration = 30) => {
        setCountdown(duration);
        setMessage('');
        let counter = duration;

        const interval = setInterval(() => {
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
                clearInterval(interval);
                setMessage('Spinning...');
                setBigCountdownNumber(null);
                setActiveBetAmount(null);
            }
        }, 1000);
    };



    const placeBet = (val) => {
        if (!selectedMultiplier || betPlaced) {
            setMessage('Bet already placed or not selected!');
            return;
        }

        socket.emit('place_bet', {
            userID: userData?.userid,
            betAmount: val,
            multiplier: selectedMultiplier,
            userName: userData?.screenName,
        });

        const sound = new Sound('place_your_bet.mp3', Sound.MAIN_BUNDLE, (error) => {
            sound.play(() => {
                sound.release();
            });
        });
        setBetPlaced(true);
        setActiveBetAmount(val); // 👈 track which button is active
        setMessage(`Bet placed on ${selectedMultiplier}`);
    };

    const handleSpin = (resultLabel) => {
        stopIdleRotation();
        const segmentCount = SEGMENTS.length;
        const anglePerSegment = 360 / segmentCount;
        const targetIndices = SEGMENTS
            .map((label, idx) => ({ label, idx }))
            .filter(s => s.label === resultLabel);
        const selected = targetIndices[Math.floor(Math.random() * targetIndices.length)];

        const segmentMidAngle = selected.idx * anglePerSegment + anglePerSegment / 2;
        const finalRotation = 360 * 10 - segmentMidAngle;

        Animated.timing(spinValue, {
            toValue: finalRotation,
            duration: 7000,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
        }).start(() => {
            setTimeout(() => {
                setMessage(`Landed on ${resultLabel}`);
                setBetPlaced(false);
                setSelectedMultiplier(null);
                spinValue.setValue(0); // reset for next spin
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
            <View style={[
                styles.profileModalOverlay,
                themeStyles[theme].profileLargeModalOverlay,
                {
                    flex: 1,
                    borderTopLeftRadius: 0,
                    borderTopRightRadius: 0,
                    // maxHeight: screenHeight * 0.9 - 20
                },
            ]}
            >
                <View style={mainStyle.header}>
                    <View style={[
                        mainStyle.chipsBox,
                        { backgroundColor: theme === 'dark' ? "#2e2e2eff" : '#e9e9e9ff' },
                    ]}>
                        <Image
                            source={require('../../assets/images/icons/star.png')} // Adjust the path as needed
                            style={{ width: 14, height: 14 }}
                            resizeMode="contain"
                        />
                        <Text style={[mainStyle.chips, { color: theme === 'dark' ? '#fff' : '#000', fontWeight: 500 }]}>{mycredit}</Text>
                    </View>
                    <TouchableOpacity onPress={onClose}>
                        <Text style={{ color: theme === 'dark' ? '#fff' : '#222', fontWeight: 500, fontSize: 16 }}>
                            <Ionicons name="close" size={28} color={theme === 'light' ? '#333' : '#fff'} />
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Big Center Countdown */}
                {bigCountdownNumber !== null && (
                    <View
                        style={{
                            position: 'absolute',
                            zIndex: 1000,
                            top: 0,
                            bottom: 0,
                            left: 0,
                            right: 0,
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        <LinearGradient
                            colors={['rgba(0, 0, 0, 0.42)', 'rgba(0, 0, 0, 0.47)', 'rgba(0, 0, 0, 0.36)']}
                            style={{
                                ...StyleSheet.absoluteFillObject,
                            }}
                        />

                        <Animated.Text
                            style={{
                                fontSize: 100,
                                color: '#fff',
                                fontWeight: 'bold',
                                opacity: fadeAnim,
                                textAlign: 'center',
                            }}
                        >
                            {bigCountdownNumber}
                        </Animated.Text>
                    </View>
                )}

                {/* <View style={{ position: 'absolute', top: 0, left: '47%', zIndex: 10 }}>
                    <Text style={{ fontSize: 28, color: '#fff' }}>▼</Text>
                </View> */}
                <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                    <View style={mainStyle.wheelWrapper}>
                        <Image
                            source={require('../../assets/images/lucky-wheel/wheel_outer.png')}
                            style={[mainStyle.wheelBackground, { width: wheelSize, height: wheelSize }]}
                            resizeMode="contain"
                        />
                        <Animated.View
                            style={{
                                position: 'relative',
                                width: wheelSize,
                                height: wheelSize,
                                zIndex: 1,
                                transform: [
                                    {
                                        rotate: Animated.add(
                                            spinValue,
                                            idleSpin.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: [0, 2 * Math.PI], // radians
                                            })
                                        ).interpolate({
                                            inputRange: [0, 2 * Math.PI],
                                            outputRange: ['0rad', `${2 * Math.PI}rad`],
                                        }),
                                    },
                                ],
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                        >
                            <Svg width={svgSize} height={svgSize} viewBox="0 0 400 400">
                                {renderSegments()}
                                <Circle cx="200" cy="200" r="10" fill="gold" />
                            </Svg>
                        </Animated.View>
                    </View>
                </View>
                {/* <Text style={[mainStyle.message, { color: theme === 'dark' ? '#fff' : '#222' }]}>{message}</Text> */}
                <Text style={[mainStyle.countdownText, { color: theme === 'dark' ? 'orange' : 'darkorange', textAlign: 'center', marginVertical: 10 }]}>⏱ {countdown}s</Text>
                {userBets.length > 0 && (
                    <View style={{ marginHorizontal: 10, marginBottom: 10 }}>
                        {/* <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 4, color: theme === 'dark' ? '#fff' : '#000' }}>
                        🧾 User Bets
                    </Text> */}
                        <View style={{
                            flexDirection: 'row',
                            backgroundColor: theme === 'dark' ? '#333' : '#ddddddff',
                            paddingVertical: 8,
                            paddingHorizontal: 10,
                            borderTopLeftRadius: 6,
                            borderTopRightRadius: 6,
                        }}>
                            <Text style={{ flex: 0.5 }}></Text>
                            <Text style={{ flex: 2, fontWeight: 'bold', color: theme === 'dark' ? '#fff' : '#000' }}>User</Text>
                            <Text style={{ flex: 1, fontWeight: 'bold', color: theme === 'dark' ? '#fff' : '#000', textAlign: 'left' }}>Bet</Text>
                            <Text style={{ flex: 1, fontWeight: 'bold', color: theme === 'dark' ? '#fff' : '#000' }}>Option</Text>
                        </View>

                        <ScrollView
                            style={{ maxHeight: screenHeight * 0.2 - 22 }}
                            contentContainerStyle={{ gap: 6, paddingTop: 6 }}
                            showsVerticalScrollIndicator={true}
                        >
                            {userBets.map((user, index) => (
                                <View
                                    key={user.id + index}
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        paddingVertical: 10,
                                        paddingHorizontal: 10,
                                        borderRadius: 8,
                                        backgroundColor: theme === 'dark' ? '#2e2e2e' : '#f2f2f2',
                                        shadowColor: '#000',
                                        shadowOpacity: 0.05,
                                        shadowOffset: { width: 0, height: 2 },
                                        shadowRadius: 2,
                                        elevation: 1,
                                    }}
                                >
                                    {/* Win/Loss Icon */}
                                    {/* <Text style={{ flex: 0.5, fontSize: 16 }}>
                                        {user.isWinner ? '✅' : '❌'}
                                    </Text> */}
                                    <View style={{ flex: 0.5, fontSize: 16 }}>
                                        <Image
                                            source={user.isWinner ? winIcon : loseIcon}
                                            style={{
                                                width: 25,
                                                height: 25,
                                            }}
                                            resizeMode="contain"
                                        />
                                    </View>
                                    {/* User Info */}
                                    <View style={{ flex: 2, flexDirection: 'row', alignItems: 'center' }}>
                                        {/* <Image
                                            source={user.avatar}
                                            style={{ width: 26, height: 26, borderRadius: 13, marginRight: 8 }}
                                        /> */}
                                        <Text style={{ color: theme === 'dark' ? '#fff' : '#000' }}>{user.username}</Text>
                                    </View>

                                    {/* Bet Amount */}
                                    <Text style={{
                                        flex: 1,
                                        color: theme === 'dark' ? '#fff' : '#222',
                                        fontWeight: '500',
                                        textAlign: 'left',
                                        marginLeft: 15,
                                    }}>{user.bet}</Text>

                                    {/* Multiplier Chip */}
                                    <View style={{
                                        flex: 1,
                                        backgroundColor: COLORS[user.multiplier] || '#666',
                                        paddingVertical: 4,
                                        paddingHorizontal: 8,
                                        borderRadius: 12,
                                        alignItems: 'center',
                                    }}>
                                        <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>{user.multiplier}</Text>
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
                                            ? "#d93a63"
                                            : theme === 'dark'
                                                ? '#444'
                                                : '#ddd',
                                    borderRightWidth: ind !== arr.length - 1 ? 1 : 0,
                                    borderRightColor: '#fafafa88',
                                },
                            ]}
                            // onPress={() => setSelectedMultiplier(option)}
                            onPress={() => handleSpin('5x')}
                        >
                            <Text style={{
                                color: selectedMultiplier === option ? '#fff' : theme === 'dark' ? '#fff' : '#222',
                                fontWeight: 'bold',
                                textAlign: 'center'
                            }}>{option}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={{ flexDirection: 'row', marginHorizontal: 10, marginBottom: 10 }}>
                    {/* First button - 70% */}
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
                        <Text style={{ color: theme === 'dark' ? '#000' : '#222', textAlign: 'center', fontWeight: 'bold' }}>
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
                        <Text style={{ color: theme === 'dark' ? '#000' : '#222', textAlign: 'center', fontWeight: 'bold' }}>
                            BET 100
                        </Text>
                    </TouchableOpacity>
                </View>

            </View>

        </Modal>
    );
};

export default LuckyWheelModal;

const mainStyle = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        // justifyContent: 'center',
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
    message: {
        fontSize: 16,
        marginTop: 10,
    },
    countdownText: {
        fontSize: 18,
        marginVertical: 4,
    },
    chips: {
        fontSize: 15,
        marginVertical: 4,
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
    placeBetBtn: {
        padding: 12,
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    closeBtn: {
        marginTop: 20,
        fontSize: 16,
    },
});
