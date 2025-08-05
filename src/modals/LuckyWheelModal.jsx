// LuckyWheelModal.js
import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    StyleSheet,
    Animated,
    Easing,
    Alert,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import io from 'socket.io-client';
import Sound from 'react-native-sound';

const SOCKET_URL = 'http://your-server-ip:PORT'; // change to your server

const SEGMENTS = [
    '5x', 'Triple', 'Double', 'Triple',
    '5x', 'Double', 'Triple', 'Double',
    '5x', 'Double', 'Triple', 'Double',
    '5x', 'Triple', 'Double', '25x',
];

const COLORS = {
    Double: '#00a3ccff',
    Triple: '#ff9a27ff',
    '5x': '#d93a2d',
    '25x': '#834fffff',
};

const LuckyWheelModal = ({ visible, onClose }) => {
    const [chips, setChips] = useState(1000);
    const [countdown, setCountdown] = useState(30);
    const [selectedMultiplier, setSelectedMultiplier] = useState(null);
    const [betPlaced, setBetPlaced] = useState(false);
    const [message, setMessage] = useState('Get Ready');
    const spinValue = useRef(new Animated.Value(0)).current;
    const socketRef = useRef(null);

    // Sound setup
    let placeYourBetSound, noMoreBetsSound;
    useEffect(() => {
        placeYourBetSound = new Sound('place-your-bet.mp3', Sound.MAIN_BUNDLE);
        noMoreBetsSound = new Sound('no-more-bets.mp3', Sound.MAIN_BUNDLE);
    }, []);

    // Connect socket
    useEffect(() => {
        if (!visible) return;

        socketRef.current = io(SOCKET_URL);

        socketRef.current.on('connect', () => {
            const username = 'Player1';
            const userID = 'user123';

            socketRef.current.emit('user_joined', { userID, username });
        });

        socketRef.current.on('start_countdown', ({ seconds }) => {
            startCountdown(seconds || 30);
        });

        socketRef.current.on('start_spin', ({ resultLabel }) => {
            handleSpin(resultLabel);
        });

        socketRef.current.on('spin_result', ({ resultLabel, winAmount, newBalance }) => {
            setMessage(winAmount > 0
                ? `✅ You WON ${winAmount} chips!`
                : `❌ You LOST! Landed on ${resultLabel}`);
            setChips(newBalance);
        });

        return () => {
            socketRef.current?.disconnect();
        };
    }, [visible]);

    const startCountdown = (duration = 30) => {
        setCountdown(duration);
        setMessage('');

        let counter = duration;
        const interval = setInterval(() => {
            counter -= 1;
            setCountdown(counter);

            if (counter <= 5 && noMoreBetsSound) {
                noMoreBetsSound.play();
            }

            if (counter <= 0) {
                clearInterval(interval);
                setMessage('Spinning...');
            }
        }, 1000);
    };

    const placeBet = () => {
        if (!selectedMultiplier || betPlaced) {
            setMessage('Bet already placed or not selected!');
            return;
        }

        const userID = 'user123'; // from storage
        socketRef.current.emit('place_bet', {
            userID,
            betAmount: 100,
            multiplier: selectedMultiplier,
        });

        placeYourBetSound?.play();
        setBetPlaced(true);
        setMessage(`Bet placed on ${selectedMultiplier}`);
    };

    const handleSpin = (resultLabel) => {
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
    };

    // const renderSegments = () => {
    //     const radius = 200;
    //     const angle = 360 / SEGMENTS.length;
    //     const segments = [];

    //     for (let i = 0; i < SEGMENTS.length; i++) {
    //         const startAngle = i * angle;
    //         const endAngle = (i + 1) * angle;
    //         const color = COLORS[SEGMENTS[i]] || '#000';

    //         const largeArc = angle > 180 ? 1 : 0;
    //         const x1 = radius + radius * Math.cos((Math.PI * startAngle) / 180);
    //         const y1 = radius + radius * Math.sin((Math.PI * startAngle) / 180);
    //         const x2 = radius + radius * Math.cos((Math.PI * endAngle) / 180);
    //         const y2 = radius + radius * Math.sin((Math.PI * endAngle) / 180);

    //         const path = `
    //     M${radius},${radius}
    //     L${x1},${y1}
    //     A${radius},${radius} 0 ${largeArc},1 ${x2},${y2}
    //     Z
    //   `;

    //         segments.push(
    //             <G key={i}>
    //                 <Path d={path} fill={color} />
    //                 <SvgText
    //                     x={radius + radius * 0.6 * Math.cos((Math.PI * (startAngle + angle / 2)) / 180)}
    //                     y={radius + radius * 0.6 * Math.sin((Math.PI * (startAngle + angle / 2)) / 180)}
    //                     fill="#fff"
    //                     fontSize="14"
    //                     fontWeight="bold"
    //                     textAnchor="middle"
    //                     alignmentBaseline="middle"
    //                 >
    //                     {SEGMENTS[i]}
    //                 </SvgText>
    //             </G>
    //         );
    //     }

    //     return segments;
    // };

    return (
        <Modal visible={visible} animationType="slide">
            <View style={styles.container}>
                <Text style={styles.header}>Lucky Wheel</Text>

                <Animated.View
                    style={{
                        transform: [
                            {
                                rotate: spinValue.interpolate({
                                    inputRange: [0, 360],
                                    outputRange: ['0deg', '360deg'],
                                }),
                            },
                        ],
                    }}
                >
                    <Svg height="200" width="200">
                        <Circle cx="100" cy="100" r="80" stroke="green" strokeWidth="2.5" fill="yellow" />
                    </Svg>
                </Animated.View>

                <Text style={styles.message}>{message}</Text>
                <Text style={styles.countdown}>⏱ {countdown}s</Text>
                <Text style={styles.chips}>💰 Chips: {chips}</Text>

                <View style={styles.betGroup}>
                    {['Double', 'Triple', '5x', '25x'].map(option => (
                        <TouchableOpacity
                            key={option}
                            style={[
                                styles.betButton,
                                selectedMultiplier === option && styles.betButtonActive,
                            ]}
                            onPress={() => setSelectedMultiplier(option)}
                        >
                            <Text style={styles.betText}>{option}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <TouchableOpacity style={styles.placeBetBtn} onPress={placeBet}>
                    <Text style={styles.betText}>BET 100</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={onClose}>
                    <Text style={styles.closeBtn}>❌ Close</Text>
                </TouchableOpacity>
            </View>
        </Modal>
    );
};

export default LuckyWheelModal;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
        alignItems: 'center',
        justifyContent: 'center',
    },
    header: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 10,
    },
    message: {
        color: '#fff',
        fontSize: 16,
        marginTop: 10,
    },
    countdown: {
        color: 'orange',
        fontSize: 18,
        marginVertical: 4,
    },
    chips: {
        color: '#00ff99',
        fontSize: 18,
        marginVertical: 4,
    },
    betGroup: {
        flexDirection: 'row',
        marginVertical: 10,
        gap: 10,
    },
    betButton: {
        padding: 10,
        borderRadius: 5,
        backgroundColor: '#444',
    },
    betButtonActive: {
        backgroundColor: '#00a3ccff',
    },
    betText: {
        color: '#fff',
    },
    placeBetBtn: {
        marginVertical: 10,
        padding: 10,
        backgroundColor: '#ffaa00',
        borderRadius: 5,
    },
    closeBtn: {
        color: '#fff',
        marginTop: 20,
        fontSize: 16,
    },
});
