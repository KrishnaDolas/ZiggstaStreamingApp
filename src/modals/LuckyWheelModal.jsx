
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
    Platform,
} from 'react-native';
import Modal from 'react-native-modal';
import Svg, {
    Circle,
    G,
    Path,
    Text as SvgText,
    Defs,
    RadialGradient,
    Stop
} from 'react-native-svg';
import Sound from 'react-native-sound';
import { styles } from '../../assets/styles/ThemeStyles';
import { SendErrorTotheServer, socket } from '../utils/constant';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import CustomConfirmDialog from './CustomConfirmDialog';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { debugLog } from '../utils/debugLogger';

const { width: screenWidth } = Dimensions.get('window');
const screenHeight = Dimensions.get('window').height;


const SEGMENTS = [
    'Double',
    'Triple',
    'Double',
    '10x',

    'Double',
    'Triple',
    'Double',
    '20x',

    'Double',
    'Double',
    '10x',
    'Double',
    'Triple',

    'Double',
];

const COLORS = {
    Double: '#00a3ccff',   // Blue (same as old)
    Triple: '#ff9a27ff',   // Orange (same as old)
    '10x': '#d93a2d',      // Red (old 5x color)
    '20x': '#834fffff',    // Purple (old 25x color)
};

const winIcon = require('../../assets/images/lucky-wheel/win.png');
const loseIcon = require('../../assets/images/lucky-wheel/lose.png');
const blueChipIcon = require('../../assets/images/lucky-wheel/blue-chip.png');
const redChipIcon = require('../../assets/images/lucky-wheel/red_chip.png');


const wheelSize = screenWidth * 0.7 + 15;
const svgSize = wheelSize * 0.8 + 25;


const LuckyWheelModal = (
    {
        visible,
        onClose,
        userData,
        hostDetails,
        RoomID,
        getTotalGiftByRoom,
    }
) => {
    const insets = useSafeAreaInsets();
    const [countdown, setCountdown] = useState(0);
    const [selectedMultiplier, setSelectedMultiplier] = useState(null);
    const [message, setMessage] = useState('Get Ready');
    const [spinResultMessage, setSpinResultMessage] = useState('');
    const [activeBetAmount, setActiveBetAmount] = useState(null);
    const [mycredit, setMyCredit] = useState(0);
    const spinValue = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const [bigCountdownNumber, setBigCountdownNumber] = useState(null);
    const [userBets, setUserBets] = useState([]);
    const [betButtonsDisabled, setBetButtonsDisabled] = useState(false);
    const [closePlaceBetDialog, setClosePlaceBetDialog] = useState(false);
    const [hideBetButtons, setHideBetButtons] = useState(false);
    const idleSpin = useRef(new Animated.Value(0)).current;
    const placeBetButtonRef = useRef(false);
    const intervalRef = useRef(null);
    const myCreditRef = useRef(mycredit);
    const prevCreditRef = useRef(0);

    // ✅ ADD: Cleanup timeout ref
    const cleanupTimeoutRef = useRef(null);
    const isMountedRef = useRef(true);
    const freezeCreditUIRef = useRef(false);
    const prevCapturedRef = useRef(false);

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

    const rotation = useRef(new Animated.Value(0)).current;
    const currentRotation = useRef(0);

    const [oddsSelected, setOddsSelected] = useState(false);
    const [betAmountEnabled, setBetAmountEnabled] = useState(false);
    const [isSpinning, setIsSpinning] = useState(false);
    const isSpinningRef = useRef(false);
    const pendingResultRef = useRef(null);
    const pendingSpinRef = useRef(null);
    const isClosingRef = useRef(false);
    const [betPlacedByCurrentUser, setBetPlacedByCurrentUser] = useState(false);
    const [hasPlacedBet, setHasPlacedBet] = useState(false);
    const idleLoopRef = useRef(null);
    const roomIdRef = useRef(RoomID);
    const userIdRef = useRef(userData?.userid);
    const onCloseRef = useRef(onClose);
    const isHost = userData?.userid === hostDetails?.userid;
    const countdownRef = useRef(0);

    useEffect(() => {
        countdownRef.current = countdown;
    }, [countdown]);

    useEffect(() => {
        console.log('[STATE] visible =>', visible);
    }, [visible]);

    useEffect(() => {
        console.log('[STATE] countdown =>', countdown);
    }, [countdown]);

    useEffect(() => {
        console.log('[STATE] selectedMultiplier =>', selectedMultiplier);
    }, [selectedMultiplier]);

    useEffect(() => {
        console.log('[STATE] activeBetAmount =>', activeBetAmount);
    }, [activeBetAmount]);

    useEffect(() => {
        console.log('[STATE] spinResultMessage =>', spinResultMessage);
    }, [spinResultMessage]);

    useEffect(() => {
        console.log('[STATE] betButtonsDisabled =>', betButtonsDisabled);
    }, [betButtonsDisabled]);

    useEffect(() => {
        console.log('[STATE] hideBetButtons =>', hideBetButtons);
    }, [hideBetButtons]);

    useEffect(() => {
        console.log('[STATE] isSpinning =>', isSpinning);
    }, [isSpinning]);

    useEffect(() => {
        console.log('[STATE] userBets length =>', userBets.length);
    }, [userBets]);

    useEffect(() => {
        console.log('[STATE] displayCredit =>', displayCredit);
    }, [displayCredit]);

    useEffect(() => {
        console.log('[STATE] mycredit =>', mycredit);
    }, [mycredit]);

    useEffect(() => {
        console.log('[STATE] betPlacedByCurrentUser =>', betPlacedByCurrentUser);
    }, [betPlacedByCurrentUser]);

    useEffect(() => {
        console.log('[STATE] message =>', message);
    }, [message]);

    useEffect(() => {

        const debug = setInterval(() => {

            console.log('[LIVE_DEBUG]', {
                visible,
                isSpinning: isSpinningRef.current,
                pendingResult: pendingResultRef.current,
                closing: isClosingRef.current,
                countdown,
                cleanupTimeout: !!cleanupTimeoutRef.current,
                betPlaced: betPlacedByCurrentUser,
            });

        }, 1000);

        return () => clearInterval(debug);

    }, [visible, countdown, betPlacedByCurrentUser]);


    // ✅ ADD: Mount/unmount effect
    useEffect(() => {
        isMountedRef.current = true;

        return () => {
            isMountedRef.current = false;
            // Clean up any pending timeouts
            if (cleanupTimeoutRef.current) {
                clearTimeout(cleanupTimeoutRef.current);
            }
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    useEffect(() => {
        console.log('hasPlacedBet changed:', hasPlacedBet);
    }, [hasPlacedBet]);

    useEffect(() => {
        roomIdRef.current = RoomID;
        userIdRef.current = userData?.userid;
        onCloseRef.current = onClose;
    }, [RoomID, userData?.userid, onClose]);

    useEffect(() => {

        if (visible) {

            rotation.setValue(0);
            currentRotation.current = 0;

            spinValue.setValue(0);
            idleSpin.setValue(0);

            pendingResultRef.current = null;

            setSpinResultMessage('');
            setSelectedMultiplier(null);
            setActiveBetAmount(null);
            setMessage('Get Ready');

            setHideBetButtons(false);
            setBetButtonsDisabled(false);

            setBigCountdownNumber(null);
            setCountdown(0);

            setUserBets([]);

            setBetPlacedByCurrentUser(false);

            placeBetButtonRef.current = false;

            startIdleRotation();

        } else {

            stopIdleRotation();
            clearCountdown();
        }

        return () => {
            stopIdleRotation();
            clearCountdown();
        };

    }, [visible]);

    useEffect(() => {
        const id = rotation.addListener(({ value }) => {
            currentRotation.current = value;
        });
        return () => rotation.removeListener(id);
    }, []);


    const startIdleRotation = () => {

        if (idleLoopRef.current) {
            idleLoopRef.current.stop();
        }

        idleLoopRef.current = Animated.loop(
            Animated.timing(rotation, {
                toValue: currentRotation.current + 360,
                duration: 8000,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        );

        idleLoopRef.current.start();
    };

    // ✅ UPDATE: Safe state updates
    const safeSetSpinResultMessage = (msg) => {
        if (isMountedRef.current) {
            setSpinResultMessage(msg);
        }
    };

    const stopIdleRotation = () => {
        if (idleLoopRef.current) {
            idleLoopRef.current.stop();
            idleLoopRef.current = null;
        }

        rotation.stopAnimation((value) => {
            currentRotation.current = value;
        });
    };

    useEffect(() => {
        if (visible && !freezeCreditUIRef.current) {
            prevCreditRef.current = myCreditRef.current;
            setDisplayCredit(myCreditRef.current);
        }
    }, [visible]);

    // useEffect(() => {
    //     if (userData && mycredit > 0) {
    //         setDisplayCredit(mycredit);
    //     }
    // }, [userData, mycredit]);


    useEffect(() => {
        myCreditRef.current = mycredit; // Update ref whenever mycredit changes
    }, [mycredit]);

    const HandleUpdatedCredit = useCallback((amount) => {
        debugLog(
            'LuckyWheel',
            'UPDATED_CREDIT_SOCKET',
            {
                amount,
                roomId: RoomID,
                userId: userData?.userid,
            }
        );

        console.log('[CREDIT_FLOW]', {
            prevCredit: prevCreditRef.current,
            currentRef: myCreditRef.current,
            freezeUI: freezeCreditUIRef.current,
        });
        // store previous credit only once
        if (!freezeCreditUIRef.current && !prevCapturedRef.current) {
            prevCreditRef.current = myCreditRef.current ?? amount;
            prevCapturedRef.current = true;
        }

        // Update real credit only
        myCreditRef.current = amount;
        setMyCredit(amount);

        // ⛔ DO NOT update displayCredit while frozen
        if (!freezeCreditUIRef.current) {
            setDisplayCredit(amount);
        }

        // Animate UI credit from old → new
        // animateCredits(previous, next);
    }, []);

    const handleOddsSelect = (odds) => {
        setSelectedMultiplier(odds);
        setOddsSelected(true);
        setBetAmountEnabled(true);
        setActiveBetAmount(null);
    };

    const HandleBetUserList = (users) => {
        const isFirstBet = userBets.length === 0 && users.length > 0;

        setUserBets(users);

        if (isFirstBet && countdown > 5) {
            startCountdown(10); // optional shorter reset
        }
    };


    // 1️⃣ Always clear interval safely
    const clearCountdown = () => {
        console.log('[CLEAR_COUNTDOWN]');
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
            console.log('[COUNTDOWN_INTERVAL_CLEARED]');
        }
    };


    const startCountdown = (duration) => {
        debugLog(
            'LuckyWheel',
            'COUNTDOWN_START',
            {
                duration,
                roomId: RoomID,
                userId: userData?.userid,
            }
        );
        clearCountdown(); // ⬅️ clear any previous countdown first
        // Only start a new interval if none exists
        let counter = duration;
        setCountdown(counter);

        intervalRef.current = setInterval(() => {
            counter -= 1;
            console.log('[COUNTDOWN_TICK]', counter);
            setCountdown(counter);

            if (counter === 3) {
                console.log('[COUNTDOWN_LAST_3_SEC]');
                setClosePlaceBetDialog(false);

                const sound = new Sound('no_more_gifting', Sound.MAIN_BUNDLE, (error) => {
                    sound.play(() => {
                        sound.stop();
                    });
                });

                setBetButtonsDisabled(true);
            }

            if (counter <= 3) {
                console.log('[BIG_COUNTDOWN_VISIBLE]', counter);
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

                if (pendingSpinRef.current) {

                    const result = pendingSpinRef.current;

                    pendingSpinRef.current = null;

                    handleSpin(result);
                }
            }
        }, 1000);
    };

    // 2️⃣ Socket handlers
    const HandleTimer = useCallback(() => {
        debugLog(
            'LuckyWheel',
            'SPINWHEEL_TIMER_RECEIVED',
            {
                roomId: RoomID,
                userId: userData?.userid,
            }
        );
        startCountdown(20);
        setSelectedMultiplier(null);
        setHideBetButtons(false);
        pendingSpinRef.current = null;
        setMessage('');
        setSpinResultMessage('');
        setActiveBetAmount(null);
        setBetButtonsDisabled(false);
        startIdleRotation();
        placeBetButtonRef.current = false;
    }, []);

    const startCreditAndChipAnimation = (winAmount, resultLabel) => {
        if (!isMountedRef.current) return;

        const from = prevCreditRef.current;
        const to = myCreditRef.current;

        // 🟢 Run both together
        animateCredits(from, to);
        startChipCollectionAnimation(winAmount, resultLabel);

        // Lock final UI value after animation
        setTimeout(() => {
            if (!isMountedRef.current) return;

            setDisplayCredit(to);
            prevCreditRef.current = to;
            freezeCreditUIRef.current = false;
            prevCapturedRef.current = false; // ✅ reset here
        }, 900);
    };


    // Enhanced chip collection animation
    const startChipCollectionAnimation = (winAmount, resultLabel, skipCreditUpdate = false) => {
        if (!isMountedRef.current) return;
        // Use myCreditRef.current instead of mycredit
        const currentCredit = myCreditRef.current ?? 0;

        // const targetCredit = currentCredit + winAmount;

        // Start from the middle of the screen
        const startX = screenWidth / 2;
        const startY = screenHeight / 2;
        const defaultChipsBoxLayout = chipsBoxLayout || { x: 20, y: 20, width: 80, height: 40 };

        const multiplierNum =
            resultLabel === 'Double' ? 2 :
                resultLabel === 'Triple' ? 3 :
                    resultLabel === '10x' ? 10 :
                        resultLabel === '20x' ? 20 : 2;

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

        // Use safe update
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
            }),
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

        // if (!skipCreditUpdate) {
        //     setTimeout(() => {
        //         animateCredits(currentCredit);
        //     }, 400);
        // }

        setTimeout(() => {
            setFlyingChips([]);
        }, 2000);
    };

    // Animated credit counting - only for visual effect, doesn't update actual credit
    const animateCredits = (from, to) => {
        if (!isMountedRef.current) return;

        creditCountAnim.setValue(0);

        Animated.timing(creditCountAnim, {
            toValue: 1,
            duration: 800,
            easing: Easing.out(Easing.quad),
            useNativeDriver: false,
        }).start();

        const listener = creditCountAnim.addListener(({ value }) => {
            setDisplayCredit(Math.floor(from + (to - from) * value));
        });

        cleanupTimeoutRef.current = setTimeout(() => {
            creditCountAnim.removeListener(listener);
            setDisplayCredit(to);
        }, 800);
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

    const normalizeMultiplier = (value) => {

        if (value === '2x') return 'Double';
        if (value === '3x') return 'Triple';

        return value;
    };

    const handleSpinResult = useCallback(({ isWin, WinAmount, resultLabel }) => {
        console.log(
            '[WIN_CHECK]',
            {
                selectedMultiplier,
                resultLabel,
                equal: selectedMultiplier === resultLabel
            }
        );
        debugLog(
            'LuckyWheel',
            'SPIN_RESULT_RECEIVED',
            {
                isWin,
                WinAmount,
                resultLabel,
                spinning: isSpinningRef.current,
                roomId: RoomID,
                userId: userData?.userid,
            }
        );
        // ⛔ If wheel is still spinning → HOLD result
        if (isSpinningRef.current) {
            pendingResultRef.current = { isWin, WinAmount, resultLabel };
            return;
        }

        // ✅ Process result ONLY after spin completes
        const resultMessage = isWin
            ? `✅ You WON ${WinAmount} chips!`
            : ` You LOST! because Wheel Landed on ${resultLabel}`;

        safeSetSpinResultMessage(resultMessage);

        if (isWin) {
            // 🔊 Play winner sound
            const sound = new Sound('winner', Sound.MAIN_BUNDLE, (error) => {
                if (error) {
                    SendErrorTotheServer(error, 'LuckyWheelModal');
                    return;
                }

                sound.play((success) => {
                    if (!success) {
                        SendErrorTotheServer(error, 'LuckyWheelModal');
                    }

                    sound.stop();
                });
            });

            startWinAnimation(WinAmount);
        }

        // 💰 Start chip animation after delay
        if (isWin && WinAmount > 0) {
            setTimeout(() => {
                startCreditAndChipAnimation(WinAmount, resultLabel);
            }, 3000);
        }

        // ❌ Losing case → reset credit UI safely
        if (!isWin) {
            freezeCreditUIRef.current = false;
            prevCapturedRef.current = false;
            prevCreditRef.current = myCreditRef.current;
            setDisplayCredit(myCreditRef.current);
        }
    }, []);

    const handleHostWin = ({ HostAmount, resultLabel }) => {

        // Run chip collection animation for host
        if (HostAmount > 0) {
            setTimeout(() => {
                startCreditAndChipAnimation(HostAmount, resultLabel);
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
        if (!userData) return;

        socket.emit(
            'User-joined-SpinWheel',
            RoomID,
            userData?.userid,
            userData?.screenName,
            userData?.avatar
        );

        socket.on('updated_Credit', HandleUpdatedCredit);
        socket.on('spinwheel_timer', HandleTimer);
        socket.on('betPlace-Users', HandleBetUserList);
        socket.on('luckywheel_round_finished', handleRoundFinished);
        socket.on('Spin-result', handleSpinResult);
        socket.on('bet_error', handleBetError);
        socket.on('Bet-Success', handleBetSuccess);
        socket.on('Host-win', handleHostWin);
        socket.on('start_spin', handleStartSpin);

        return () => {
            socket.off('updated_Credit', HandleUpdatedCredit);
            socket.off('spinwheel_timer', HandleTimer);
            socket.off('betPlace-Users', HandleBetUserList);
            socket.off('luckywheel_round_finished', handleRoundFinished);
            socket.off('Spin-result', handleSpinResult);
            socket.off('bet_error', handleBetError);
            socket.off('Bet-Success', handleBetSuccess);
            socket.off('Host-win', handleHostWin);
            socket.off('start_spin', handleStartSpin);
        };
    }, [
        userData,
        RoomID,
        HandleUpdatedCredit,
        HandleTimer,
        handleSpin,
        handleSpinResult,
        handleRoundFinished,
    ]);


    // 4️⃣ Cleanup on unmount
    useEffect(() => {
        return () => {
            clearCountdown();
        };
    }, []);


    useEffect(() => {
        if (visible) {
            const sound = new Sound('select_your_gift', Sound.MAIN_BUNDLE, (error) => {
                if (error) {
                    SendErrorTotheServer(error, 'LuckyWheelModal');
                    return;
                }
                sound.play((success) => {
                    if (!success) {
                        SendErrorTotheServer(error, 'LuckyWheelModal');
                    }
                    sound.stop(); // Free up resources
                });
            });
        } else {
            clearCountdown(); // Your existing cleanup
        }
    }, [visible]);

    const handleStartSpin = useCallback((resultLabel) => {

        debugLog(
            'LuckyWheel',
            'START_SPIN_RECEIVED',
            {
                resultLabel,
                countdown: countdownRef.current,
            }
        );

        if (countdownRef.current <= 0) {

            handleSpin(resultLabel);

            return;
        }

        pendingSpinRef.current = resultLabel;

    }, [handleSpin]);


    const placeBet = (val) => {
        // 🚫 Host restriction
        debugLog(
            'LuckyWheel',
            'PLACE_BET_CLICKED',
            {
                selectedMultiplier,
                val,
                userId: userData?.userid,
                roomId: RoomID,
            }
        );
        if (userData?.userid === hostDetails?.userid) {
            Alert.alert('Message', 'You are host, you can’t play the game.');
            return;
        }
        if (!selectedMultiplier) {
            Alert.alert('Select Option', 'Please select an option first');
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
            setBetButtonsDisabled(true);
            setActiveBetAmount(val); // 👈 track which button is active
            setMessage(`Bet placed on ${selectedMultiplier}`);
            placeBetButtonRef.current = true;
            setBetPlacedByCurrentUser(true);
            console.log('Bet placed by invoker, hasPlacedBet:', true);
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

    // Normalize angle to [0, 360)
    const getNormalizedAngle = (angle) => {
        return ((angle % 360) + 360) % 360;
    };

    const handleRoundFinished = useCallback(() => {

        debugLog(
            'LuckyWheel',
            'ROUND_FINISHED',
            {
                roomId: RoomID,
                userId: userData?.userid,
            }
        );

        if (cleanupTimeoutRef.current) {
            clearTimeout(cleanupTimeoutRef.current);
        }

        cleanupTimeoutRef.current = setTimeout(() => {

            closeModal();

        }, 7000);

    }, [closeModal]);

    const handleSpin = useCallback((resultLabel) => {
        console.log('[HANDLE_SPIN_CALLED]', resultLabel);
        debugLog(
            'LuckyWheel',
            'HANDLE_SPIN_START',
            {
                resultLabel,
                roomId: RoomID,
                userId: userData?.userid,
            }
        );

        // ✅ reset completion flag for new round
        // hard reset previous pending result
        pendingResultRef.current = null;

        // stop any previous animation
        rotation.stopAnimation();

        if (cleanupTimeoutRef.current) {
            clearTimeout(cleanupTimeoutRef.current);
            cleanupTimeoutRef.current = null;
        }

        setIsSpinning(true);
        isSpinningRef.current = true;

        debugLog(
  'LuckyWheel',
  'WHEEL_SOUND_ATTEMPT',
  {
    roomId: RoomID,
    userId: userData?.userid,
  }
);

      const sound = new Sound(
    'wheelspin3',
    Sound.MAIN_BUNDLE,
    (error) => {

        debugLog(
            'LuckyWheel',
            'WHEEL_SOUND_CALLBACK',
           {
        code: error?.code,
        message: error?.message,
        soundName: 'wheelspin3',
      }
        );

        if (error) {

            debugLog(
                'LuckyWheel',
                'WHEEL_SOUND_ERROR',
                {
                    error: String(error),
                }
            );

            return;
        }

        debugLog(
            'LuckyWheel',
            'WHEEL_SOUND_STARTED',
            {}
        );

        sound.play((success) => {

            debugLog(
                'LuckyWheel',
                'WHEEL_SOUND_FINISHED',
                {
                    success,
                }
            );
                    sound.stop();

                    sound.release();

                });

            }
        );

        freezeCreditUIRef.current = true;
        prevCapturedRef.current = false;

        stopIdleRotation();
        console.log('[IDLE_ROTATION_STOPPED]');
        setHideBetButtons(true);

        const segmentCount = SEGMENTS.length;
        const anglePerSegment = 360 / segmentCount;

        let normalizedResult = resultLabel;

        if (resultLabel === '2x') {
            normalizedResult = 'Double';
        }

        if (resultLabel === '3x') {
            normalizedResult = 'Triple';
        }

        console.log(
            '[NORMALIZED_RESULT]',
            resultLabel,
            '=>',
            normalizedResult
        );

        console.log('[SERVER_RESULT]', resultLabel);
        console.log('[SEGMENTS]', SEGMENTS);

        const matches = SEGMENTS
            .map((label, idx) => ({ label, idx }))
            .filter(s => s.label === normalizedResult);

        if (!matches.length) {
            console.log('[NO_MATCHING_SEGMENT]');
            return;
        }
        console.log('[MATCHING_SEGMENTS]', matches);
        const currentAngle = getNormalizedAngle(currentRotation.current);

        const selected = matches.reduce((closest, seg) => {

            const segCenter =
                seg.idx * anglePerSegment +
                anglePerSegment / 2;

            const diff = Math.abs(segCenter - currentAngle);

            if (!closest || diff < closest.diff) {
                return {
                    ...seg,
                    diff,
                };
            }

            return closest;

        }, null);

        const segmentCenter =
            selected.idx * anglePerSegment +
            anglePerSegment / 2;

        let delta =
            (360 - segmentCenter - currentAngle) % 360;

        if (delta < 0) {
            delta += 360;
        }

        const fullRotations =
            10 + Math.floor(Math.random() * 5);

        const finalRotation =
            currentRotation.current +
            fullRotations * 360 +
            delta;

        // ✅ FAIL SAFE
        // if animation callback fails in release build
        // modal can still close
        debugLog(
            'LuckyWheel',
            'SPIN_VALUES',
            {
                currentAngle,
                selectedIndex: selected.idx,
                segmentCenter,
                delta,
                finalRotation,
                roomId: RoomID,
                userId: userData?.userid,
            }
        );
        debugLog(
            'LuckyWheel',
            'SPIN_ANIMATION_STARTED',
            {
                roomId: RoomID,
                userId: userData?.userid,
            }
        );
        Animated.timing(rotation, {
            toValue: finalRotation,
            easing: Easing.bezier(0.12, 0.8, 0.32, 1),
            duration: 6000,
            useNativeDriver: true,
        }).start();

        setTimeout(() => {
            console.log('[SPIN_TIMEOUT_COMPLETED]');
            currentRotation.current = finalRotation;

            isSpinningRef.current = false;

            setIsSpinning(false);

            debugLog(
                'LuckyWheel',
                'SPIN_VISUAL_FINISHED',
                {
                    roomId: RoomID,
                    userId: userData?.userid,
                }
            );

            if (pendingResultRef.current) {

                handleSpinResult(pendingResultRef.current);

                pendingResultRef.current = null;
                console.log('[PROCESSING_PENDING_RESULT]');
            }

        }, 6100);

        console.log(
            '[SPIN_STARTED]',
            'roundFinished:',
            'spinCompleted:',
        );

    }, [handleSpinResult]);

    const renderSegments = useMemo(() => {
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
                    <Path d={path} fill={color} stroke="#FFD700" strokeWidth={2} />
                    <SvgText
                        x={textX}
                        y={textY}
                        fill="#fff"
                        fontSize="20"
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
    }, []);


    const closeModal = useCallback(() => {

        debugLog(
            'LuckyWheel',
            'CLOSE_MODAL',
            {
                roomId: RoomID,
                userId: userData?.userid,
                betPlacedByCurrentUser,
            }
        );

        // prevent Double close
        if (isClosingRef.current) {
            return;
        }

        isClosingRef.current = true;

        // clear timers
        if (cleanupTimeoutRef.current) {
            clearTimeout(cleanupTimeoutRef.current);
            cleanupTimeoutRef.current = null;
        }

        clearCountdown();

        // stop animations
        stopIdleRotation();

        try {

            rotation.stopAnimation();
            fadeAnim.stopAnimation();
            creditCountAnim.stopAnimation();
            chipsGlowAnim.stopAnimation();

        } catch (e) {
            console.log('[STOP_ANIMATION_ERROR]', e);
        }

        // reset refs
        isSpinningRef.current = false;
        pendingResultRef.current = null;
        freezeCreditUIRef.current = false;
        prevCapturedRef.current = false;

        placeBetButtonRef.current = false;

        // reset states
        setIsSpinning(false);

        setSpinResultMessage('');
        setSelectedMultiplier(null);
        setActiveBetAmount(null);

        setMessage('Get Ready');

        setUserBets([]);

        setBigCountdownNumber(null);
        setCountdown(0);

        setHideBetButtons(false);
        setBetButtonsDisabled(false);

        setBetPlacedByCurrentUser(false);

        // notify server
        socket.emit(
            'LeaveFromSpinWheel',
            roomIdRef.current,
            userIdRef.current
        );

        // close modal
        onCloseRef.current?.();

        // IMPORTANT
        isClosingRef.current = false;

    }, []);


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


    const shouldShowCloseIcon = !betPlacedByCurrentUser;

    return (
        <>
            <Modal
                isVisible={visible}
                onBackdropPress={() => {
                    // only block the user who placed bet
                    if (!betPlacedByCurrentUser) {
                        closeModal();
                    }
                }}
                animationIn="slideInUp"
                animationOut="slideOutDown"
                animationInTiming={300}
                animationOutTiming={200}
                useNativeDriver={true}
                avoidKeyboard={false}
                backdropOpacity={0}
                style={[styles.profileModalMain]}
                propagateSwipe={true}
                swipeDirection={null}
            >
                <LinearGradient
                    colors={['rgba(0, 0, 0, 0.34)', 'rgba(0, 0, 0, 0.34)', '#000000']}
                    locations={[0, 0.4, 1]}
                    style={[mainStyle.LWModalOverlay, { maxHeight: screenHeight * 0.83 - insets.top - 20 }]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                >
                    <View
                        style={[
                            mainStyle.header,
                            {
                                paddingLeft: 10,
                                paddingRight: Platform.OS === 'ios' ? 20 : 5,// 🔥 this prevents cutting on iOS
                            }
                        ]}
                    >
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
                            <Text style={[mainStyle.chips]}>{Number(displayCredit).toFixed(0)}</Text>
                        </Animated.View>
                        {shouldShowCloseIcon && (
                            <TouchableOpacity
                                onPress={closeModal}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                                <Ionicons name="close" size={30} color="#fff" />
                            </TouchableOpacity>
                        )}
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
                                    style={[
                                        mainStyle.wheelSegmentBox,
                                        {
                                            transform: [
                                                {
                                                    rotate: rotation.interpolate({
                                                        inputRange: [0, 360],
                                                        outputRange: ['0deg', '360deg'],
                                                    }),
                                                },
                                            ],
                                        },
                                    ]}
                                >
                                    <Svg width={svgSize} height={svgSize} viewBox="0 0 400 400">
                                        {renderSegments}
                                        <Defs>
                                            <RadialGradient
                                                id="wheelShade"
                                                cx="50%"
                                                cy="50%"
                                                r="50%"
                                            >
                                                <Stop
                                                    offset="0%"
                                                    stopColor="rgba(255,255,255,0)"
                                                />
                                                <Stop
                                                    offset="70%"
                                                    stopColor="rgba(255,255,255,0)"
                                                />
                                                <Stop
                                                    offset="100%"
                                                    stopColor="rgba(0,0,0,0.45)"
                                                />
                                            </RadialGradient>
                                        </Defs>

                                        <Circle
                                            cx="200"
                                            cy="200"
                                            r="200"
                                            fill="url(#wheelShade)"
                                            opacity={0.25}
                                        />
                                        <Circle cx="200" cy="200" r="10" fill="gold" />
                                    </Svg>
                                </Animated.View>
                            </View>
                        </View>
                        {/* <Text style={[mainStyle.message]}>{message}</Text> */}
                        <Text
                            style={[
                                mainStyle.countdownText,
                                {
                                    color: countdown <= 3 ? 'transparent' : '#fff',
                                    opacity: 1,           // always visible (space taken)
                                    marginTop: 10,        // keep same height always
                                },
                            ]}
                        >
                            ⏱ {countdown}s
                        </Text>

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
                                    style={{ maxHeight: screenHeight * 0.2 - 60 }}
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
                        {/* multiplier buttons */}
                        {!hideBetButtons && !isHost && (
                            <View style={[mainStyle.betGroup, { marginTop: userBets.length > 0 ? 0 : 10 }]}>
                                {['Double', 'Triple', '10x', '20x'].map((option, ind, arr) => {
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
                                                    opacity: betButtonsDisabled ? 0.6 : 1,
                                                },
                                            ]}
                                            disabled={betButtonsDisabled}
                                            onPress={() => handleOddsSelect(option)}
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
                        {!hideBetButtons && !isHost && (
                            <View style={[mainStyle.placeBetBtnGroup]}>
                                <TouchableOpacity
                                    style={[
                                        mainStyle.placeBetBtn,
                                        {
                                            flex: 3,
                                            marginRight: 5,
                                            backgroundColor:
                                                activeBetAmount === 200 ? '#48FF00' : '#2196F3',
                                            opacity: (activeBetAmount && activeBetAmount !== 200) || betButtonsDisabled ? 0.6 : 1,
                                        },
                                    ]}
                                    onPress={() => placeBet(200)}
                                    disabled={
                                        betButtonsDisabled ||
                                        !selectedMultiplier || // 👈 IMPORTANT
                                        (activeBetAmount && activeBetAmount !== 200)
                                    }
                                >
                                    <Text style={mainStyle.placeBetBtnText}>
                                        BET 200
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[
                                        mainStyle.placeBetBtn,
                                        {
                                            flex: 3,
                                            marginHorizontal: 5,
                                            backgroundColor:
                                                activeBetAmount === 500 ? '#FFEA00' : '#FF5722',
                                            opacity: (activeBetAmount && activeBetAmount !== 500) || betButtonsDisabled ? 0.6 : 1,
                                        },
                                    ]}
                                    onPress={() => placeBet(500)}
                                    disabled={
                                        betButtonsDisabled ||
                                        !selectedMultiplier ||
                                        (activeBetAmount && activeBetAmount !== 500)
                                    }
                                >
                                    <Text style={mainStyle.placeBetBtnText}>
                                        BET 500
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[
                                        mainStyle.placeBetBtn,
                                        {
                                            flex: 3,
                                            marginLeft: 5,
                                            backgroundColor:
                                                activeBetAmount === 1000 ? '#39FF14' : '#9C27B0',
                                            opacity: (activeBetAmount && activeBetAmount !== 1000) || betButtonsDisabled ? 0.6 : 1,
                                        },
                                    ]}
                                    onPress={() => placeBet(1000)}
                                    disabled={
                                        betButtonsDisabled ||
                                        !selectedMultiplier ||
                                        (activeBetAmount && activeBetAmount !== 1000)
                                    }
                                >
                                    <Text style={mainStyle.placeBetBtnText}>
                                        BET 1000
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* Spin Result Message */}
                        {spinResultMessage !== '' &&
                            <Text style={[mainStyle.spinResultMessageText]}>{spinResultMessage}</Text>
                        }

                    </View>


                </LinearGradient>
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
            </Modal>

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
        paddingBottom: 0,
        position: 'relative',
    },
    wheelWrapperContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    wheelWrapper: {
        width: wheelSize,
        height: wheelSize,
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
        // marginBottom: 10,
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