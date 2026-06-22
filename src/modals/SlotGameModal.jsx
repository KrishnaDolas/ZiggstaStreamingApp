// SlotGameModal.js (updated)
import React, { useEffect, useCallback, useRef, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Animated,
    Easing,
    Image,
    Alert,
    ImageBackground,
    ScrollView,
} from 'react-native';
import Modal from 'react-native-modal';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomConfirmDialog from './CustomConfirmDialog';
import InfoSlotGameModal from './InfoSlotGameModal';
import { socket } from '../utils/constant';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';
import { AppState } from 'react-native';
import Sound from 'react-native-sound';
import { debugLog } from '../utils/debugLogger';

// Master list of all possible slot symbols.
const SYMBOLS = [
    'Wild', 'Seven', 'Star', 'Gift', 'Scatter', 'Cherry', 'Ace', 'King', 'Queen',
];

// Used when rendering symbols inside the reels.
const symbolIcons = {
    Wild: require('../../assets/images/solt-game/icon_wild.png'),
    Seven: require('../../assets/images/solt-game/icon_7_2.png'),
    Star: require('../../assets/images/solt-game/icon_star.png'),
    Gift: require('../../assets/images/solt-game/icon_giftbox.png'),
    Scatter: require('../../assets/images/solt-game/icon_scatter.png'),
    Cherry: require('../../assets/images/solt-game/icon_cherry.png'),
    Ace: require('../../assets/images/solt-game/icon_Ace.png'),
    King: require('../../assets/images/solt-game/icon_king.png'),
    Queen: require('../../assets/images/solt-game/icon_queen.png'),
};

// Layout constants
const ROWS = 3;
const COLS = 3;
const REEL_WIDTH = 90;
const SYMBOL_HEIGHT = 85;
const SYMBOL_WIDTH = 85;


export default function SlotGameModal({
    visible,
    onClose,
    userData,
    hostDetails,
    roomId,
    onForceOpen,
    onGameStart,
}) {
    const [balance, setBalance] = useState(0);
    const [grid, setGrid] = useState(Array.from({ length: ROWS }, () => Array(COLS).fill("")));
    const [winningCells, setWinningCells] = useState({});
    const [spinsRemaining, setSpinsRemaining] = useState(0);
    const [purchasedSpins, setPurchasedSpins] = useState(0);
    const [hasPurchased, setHasPurchased] = useState(false);
    const [spinPurchased, setSpinPurchased] = useState(null);
    const [totalSpinCost, setTotalSpinCost] = useState(null);
    const [lastSpinWin, setLastSpinWin] = useState(0);
    const [activeButtonIndex, setActiveButtonIndex] = useState(null);
    const [confirmDialog, setConfirmDialog] = useState({ show: false, price: null, buttonIndex: null });
    const [showInfoModal, setShowInfoModal] = useState(false);

    //Sounds
    const soundsRef = useRef({});
    Sound.setCategory('Playback', true);
    const spinSoundPlayingRef = useRef(false);

    // Auto-spin state
    const [firstManualSpinDone, setFirstManualSpinDone] = useState(false);
    const [autoSpinActive, setAutoSpinActive] = useState(false);
    const [countdown, setCountdown] = useState(null);
    const [showSpinResult, setShowSpinResult] = useState(false);
    const countdownIntervalRef = useRef(null);

    const firstManualSpinRef = useRef(false);
    const autoSpinActiveRef = useRef(false);
    const [openedBy, setOpenedBy] = useState(null);
    const [currentSpinner, setCurrentSpinner] = useState(null);
    const isGamePlayer = userData?.userid === currentSpinner;
    const isCurrentPlayer = openedBy?.userId === userData?.userid;
    const isHostUser = userData?.userid === hostDetails?.userid;
    const isReadOnly = currentSpinner && currentSpinner !== userData?.userid;
    const AUTO_SPIN_DELAY = 500; // Option 3 slow mode
    const animationCompleteSentRef = useRef(false);
    const [closeLocked, setCloseLocked] = useState(false);
    const isInvoker = userData?.userid === openedBy?.userId;
    const [hasClickedBuy, setHasClickedBuy] = useState(false);
    const [totalWin, setTotalWin] = useState(0);
    const spinsRemainingRef = useRef(0);
    const closeTimeoutRef = useRef(null);
    const autoSpinTimeoutRef = useRef(null);
    const locallyClosedRef = useRef(false);
    const spinWatchdogRef = useRef(null);
    const spinPurchasedRef = useRef(null);
    const openedByRef = useRef(null);
    const remainingBalance =
        (spinPurchased || 0) * (spinsRemaining || 0);

    useEffect(() => {

        const subscription = AppState.addEventListener(
            'change',
            nextState => {

                if (
                    nextState === 'active' &&
                    autoSpinActiveRef.current &&
                    spinsRemainingRef.current > 0 &&
                    !spinningRef.current
                ) {

                    spin(
                        true,
                        spinsRemainingRef.current
                    );

                }

            }
        );

        return () => {
            subscription.remove();
        };

    }, [spin]);

    // const canClose =
    //     !isInvoker || !closeLocked;

    // 🔥 FINAL RULE
    const canClose = !isInvoker || !hasPurchased;

    const fullResetGame = useCallback(() => {
        if (autoSpinTimeoutRef.current) {
            clearTimeout(autoSpinTimeoutRef.current);
            autoSpinTimeoutRef.current = null;
        }
        if (spinWatchdogRef.current) {
            clearTimeout(spinWatchdogRef.current);
            spinWatchdogRef.current = null;
        }
        resetSpinState();
        setHasPurchased(false);
        setSpinsRemaining(0);
        setPurchasedSpins(0);
        setSpinPurchased(null);
        setTotalSpinCost(null);
        setActiveButtonIndex(null);
        setBalance(0);
        setTotalWin(0);
        setLastSpinWin(0);
        setWinningCells({});
        setGrid(Array.from({ length: ROWS }, () => Array(COLS).fill('')));
        spinPurchasedRef.current = null;

        setFirstManualSpinDone(false);

        disableAuto('fullResetGame'); firstManualSpinRef.current = false;
        spinsRemainingRef.current = 0;
        animationCompleteSentRef.current = false;

        setCurrentSpinner(null);
        setOpenedBy(null);
        setHasClickedBuy(false);
    }, [resetSpinState]);

    useEffect(() => {
        if (!visible) {
            return;
        }

        fullResetGame();

        if (socket) {
            socket.emit('register_player', {
                userId: userData?.userid,
                hostId: hostDetails?.userid,
                roomId,
            });
        }
    }, [
        visible,
        fullResetGame,
        userData?.userid,
        hostDetails?.userid,
        roomId,
    ]);

    useEffect(() => {
        if (spinsRemaining > 0) {
            onGameStart?.();
        }
    }, [spinsRemaining, onGameStart]);

    useEffect(() => {
        firstManualSpinRef.current = firstManualSpinDone;
    }, [firstManualSpinDone]);

    useEffect(() => {
        autoSpinActiveRef.current = autoSpinActive;
    }, [autoSpinActive]);

    // socket ref
    const socketRef = useRef(null);

    // Animation lock
    const spinningRef = useRef(false);

    // animated reels
    const reels = useRef(Array.from({ length: COLS }, () => new Animated.Value(0))).current;

    // bounce anims for buy buttons
    const buyButtonBounceAnims = useRef([
        new Animated.Value(1), // 100
        new Animated.Value(1), // 200
        new Animated.Value(1), // 500
        new Animated.Value(1), // 1000
    ]).current;


    // ✅ Add listeners
    const handleSessionStarted = async ({ sessionID }) => {
        try {
            await AsyncStorage.setItem('slotSessionID', sessionID.toString());
        } catch (e) {
            console.error('Failed to save sessionID', e);
        }
    };
    const disableAuto = (reason) => {

        console.log(
            '[AUTO_DISABLED]',
            reason
        );

        autoSpinActiveRef.current = false;

        setAutoSpinActive(false);

    };

    //Sounds

    const onLoad = (name) => (error) => {
        if (error) {
            console.log(`❌ ${name} LOAD FAILED`, error);
        } else {
            if (soundsRef.current[name]) {
                soundsRef.current[name].loaded = true;
            }
        }
    };

    useEffect(() => {

        soundsRef.current = {
            spin: new Sound('slot_spin', '', onLoad('spin')),
            win: new Sound('slot_win', '', onLoad('win')),
            buy: new Sound('slot_buy', '', onLoad('buy')),
        };

        return () => {
            Object.values(soundsRef.current).forEach(sound => {
                if (sound) sound.release();
            });
        };

    }, []);

    const playSound = (name, loop = false) => {

        const sound = soundsRef.current[name];

        if (!sound) {
            return;
        }

        if (!sound.loaded) {
            return;
        }

        sound.stop(() => {

            sound.setCurrentTime(0);

            sound.setVolume(1.0);

            sound.setNumberOfLoops(loop ? -1 : 0);

            sound.play((success) => {

                if (!success) {
                    console.log(`❌ PLAY FAILED: ${name}`);
                }

            });

        });

    };

    useEffect(() => {

        soundsRef.current = {

            spin: new Sound(
                'slots_spin_4',
                Sound.MAIN_BUNDLE,
                onLoad('spin')
            ),

            win: new Sound(
                'casino_win',
                Sound.MAIN_BUNDLE,
                onLoad('win')
            ),

        };

        return () => {

            Object.values(soundsRef.current).forEach(sound => {

                if (sound) {
                    sound.release();
                }

            });

        };

    }, []);

    const playSpinSound = () => {

        const sound = soundsRef.current.spin;

        if (!sound || !sound.loaded) {
            return;
        }

        sound.stop(() => {

            sound.setCurrentTime(0);

            sound.setNumberOfLoops(0); // NO LOOP

            sound.play((success) => {
                if (!success) {
                    console.log('❌ Spin sound failed');
                }
            });

        });

    };

    const stopSpinSound = () => {

        const sound = soundsRef.current.spin;

        if (!sound) {
            return;
        }

        sound.stop(() => {
            sound.setCurrentTime(0);
        });

    };

    const handleBuyConfirmed = useCallback((payload) => {

        debugLog(
            'SlotGame',
            'BUY_CONFIRMED_RECEIVED',
            payload
        );

        onGameStart?.();
        onForceOpen?.();

        locallyClosedRef.current = false;

        setHasPurchased(true);

        // IMPORTANT
        spinPurchasedRef.current = payload.spinPurchased;

        setSpinPurchased(payload.spinPurchased);

        setTotalSpinCost(payload.totalCost);

        setBalance(payload.balance ?? 0);

        setSpinsRemaining(payload.spinsRemaining ?? 0);

        setPurchasedSpins(payload.purchasedSpins ?? 0);

        setActiveButtonIndex(payload.buttonIndex ?? null);

        setCurrentSpinner(payload.userId);

        setOpenedBy({ userId: payload.userId });

        console.log('BUY CONFIRMED', payload);

        animationCompleteSentRef.current = false;

        // KEEP REFS IN SYNC IMMEDIATELY
        spinsRemainingRef.current =
            payload.spinsRemaining ?? 0;

        spinPurchasedRef.current =
            payload.spinPurchased;

        // =========================
        // START 5 SECOND COUNTDOWN
        // =========================

        let counter = 5;

        setCountdown(counter);

        if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
        }

        countdownIntervalRef.current = setInterval(() => {

            counter--;

            console.log('[COUNTDOWN_TICK]', counter);

            if (counter <= 0) {

                clearInterval(countdownIntervalRef.current);
                countdownIntervalRef.current = null;

                setCountdown(null);

                debugLog(
                    'SlotGame',
                    'COUNTDOWN_FINISHED',
                    {
                        spinPurchased:
                            payload.spinPurchased,
                        spinsRemaining:
                            payload.spinsRemaining,
                        roomId,
                        userId:
                            userData?.userid,
                    }
                );

                // AUTO START ENABLE
                autoSpinActiveRef.current = true;
                setAutoSpinActive(true);

                firstManualSpinRef.current = true;
                setFirstManualSpinDone(true);

                // EXTRA SAFETY
                spinsRemainingRef.current =
                    payload.spinsRemaining ?? 0;

                spinPurchasedRef.current =
                    payload.spinPurchased;

                console.log('[AUTO_SPIN_ENABLED]', {
                    autoSpinActive:
                        autoSpinActiveRef.current,
                    spinsRemaining:
                        spinsRemainingRef.current,
                    spinPurchased:
                        spinPurchasedRef.current,
                });

                // GIVE STATE TIME TO SETTLE
                setTimeout(() => {

                    debugLog(
                        'SlotGame',
                        'FIRST_AUTO_SPIN_TRIGGER',
                        {
                            spinPurchasedRef:
                                spinPurchasedRef.current,
                            spinsRemainingRef:
                                spinsRemainingRef.current,
                            spinning:
                                spinningRef.current,
                            auto:
                                autoSpinActiveRef.current,
                            roomId,
                            userId:
                                userData?.userid,
                        }
                    );

                    if (
                        autoSpinActiveRef.current &&
                        spinsRemainingRef.current > 0
                    ) {

                        spin(
                            true,
                            spinsRemainingRef.current
                        );

                    } else {

                        console.log(
                            '[FIRST_AUTO_SPIN_ABORTED]',
                            {
                                auto:
                                    autoSpinActiveRef.current,
                                spins:
                                    spinsRemainingRef.current,
                            }
                        );

                    }

                }, 500); // increased from 300 -> 500

            } else {

                setCountdown(counter);

            }

        }, 1000);

    }, [
        onGameStart,
        onForceOpen,
        spin,
    ]);



    const handleBuyFailed = (data) => {
        Alert.alert('Message', data.message || 'inefficient credit');
    };

    const handleErrorMsg = (msg) => {
        console.log('SERVER SPIN ERROR:', msg);
        Alert.alert('Server error', JSON.stringify(msg));
    };
    // spin -> ask server for final indexes, then animate to them
    const spin = useCallback(async (isAuto = false, forcedSpinsRemaining = null) => {

        debugLog(
            'SlotGame',
            'SPIN_START',
            {
                isAuto,
                forcedSpinsRemaining,
                spinsRemainingRef:
                    spinsRemainingRef.current,
                spinning:
                    spinningRef.current,
                auto:
                    autoSpinActiveRef.current,
                spinPurchasedRef:
                    spinPurchasedRef.current,
                roomId,
                userId:
                    userData?.userid,
            }
        );

        if (spinningRef.current) {

            console.log('[SPIN_EXIT_ALREADY_SPINNING]');

            if (
                isAuto &&
                autoSpinActiveRef.current &&
                spinsRemainingRef.current > 0
            ) {

                setTimeout(() => {

                    if (!spinningRef.current) {

                        console.log('[AUTO_RETRY_AFTER_BLOCK]');

                        spin(
                            true,
                            spinsRemainingRef.current
                        );

                    }

                }, 500);

            }

            return;
        }

        if (isReadOnly && !isAuto) {
            console.log('[SPIN_EXIT_READ_ONLY]');
            return;
        }

        const spinsToUse =
            forcedSpinsRemaining ?? spinsRemainingRef.current;

        if (spinsToUse <= 0) {
            console.log('[SPIN_EXIT_NO_SPINS]', spinsToUse);
            return;
        }

        // IMPORTANT
        if (
            !isAuto &&
            (
                !hasPurchased ||
                !spinPurchasedRef.current
            )
        ) {
            console.log('[SPIN_EXIT_NO_PURCHASE]');
            return;
        }

        if (!socketRef.current) {
            console.log('[SPIN_EXIT_NO_SOCKET]');
            return;
        }

        const sessionID = Number(
            await AsyncStorage.getItem('slotSessionID')
        );

        console.log('SESSION ID FOR SPIN', sessionID);

        console.log('SPIN PAYLOAD', {
            userId: userData?.userid,
            roomId,
            spinPurchased: spinPurchasedRef.current,
            sessionID,
        });

        // LOCK
        spinningRef.current = true;

        // CLEAR OLD WATCHDOG
        if (spinWatchdogRef.current) {
            clearTimeout(spinWatchdogRef.current);
            spinWatchdogRef.current = null;
        }

        // WATCHDOG
        spinWatchdogRef.current = setTimeout(() => {

            debugLog(
                'SlotGame',
                'SPIN_WATCHDOG_RECOVERY',
                {
                    spinsRemaining:
                        spinsRemainingRef.current,
                    auto:
                        autoSpinActiveRef.current,
                    spinning:
                        spinningRef.current,
                    roomId,
                    userId:
                        userData?.userid,
                }
            );

            spinningRef.current = false;

            if (
                autoSpinActiveRef.current &&
                spinsRemainingRef.current > 0
            ) {
                console.log('[WATCHDOG_RETRY_SPIN]');

                spin(
                    true,
                    spinsRemainingRef.current
                );
            }

        }, 10000);

        setShowSpinResult(false);

        setWinningCells({});

        console.log('BUY USER VS SPIN USER', {
            buyConfirmedUser: currentSpinner,
            spinUser: userData?.userid,
        });

        debugLog(
            'SlotGame',
            'SPIN_EMIT',
            {
                userId:
                    userData?.userid,
                roomId,
                spinsToUse,
                spinPurchased:
                    spinPurchasedRef.current,
            }
        );

        socketRef.current.emit('spin', {
            userId: userData?.userid,
            roomId,
            spinPurchased: spinPurchasedRef.current,
            sessionID,
        });

    }, [
        isReadOnly,
        hasPurchased,
        userData?.userid,
        roomId,
        currentSpinner,
    ]);


    const handleSpinResult = useCallback(async (payload) => {
 if (!spinSoundPlayingRef.current) {

        spinSoundPlayingRef.current = true;

        playSpinSound();
    }
        debugLog(
            'SlotGame',
            'HANDLE_SPIN_RESULT_ENTER',
            {
                spinsRemaining:
                    payload?.spinsRemaining,
                winnings:
                    payload?.winnings,
                spinning:
                    spinningRef.current,
                roomId,
                userId:
                    userData?.userid,
            }
        );
        if (spinWatchdogRef.current) {
            clearTimeout(spinWatchdogRef.current);
            spinWatchdogRef.current = null;
        }

        const finalIndexes = Array.isArray(payload?.finalIndexes)
            ? payload.finalIndexes
            : [0, 0, 0];

        try {
            // WAIT UNTIL ALL REEL ANIMATIONS COMPLETE
            const animationResult = await Promise.race([
                Promise.all(
                    finalIndexes.map((fi, col) => spinReelTo(col, fi))
                ).then(() => 'completed'),
                new Promise(resolve =>
                    setTimeout(() => resolve('timeout'), 4000)
                )
            ]);
            stopSpinSound();
            spinSoundPlayingRef.current = false;

            console.log('[ANIMATION_RESULT]', animationResult);
        } catch (err) {
            console.error('❌ Reel animation error:', err);
        }
        console.log('[REEL_ANIMATION_COMPLETE]');

        // SAFE GRID
        const newGrid =
            payload?.newGrid ||
            Array.from({ length: ROWS }, () => Array(COLS).fill(''));

        // SAFE WIN VALUE
        const winAmount =
            payload?.lastSpinWin ??
            payload?.winnings ??
            payload?.winAmount ??
            0;

        // SAFE NEXT SPINS
        const nextSpins = Number(
            payload?.spinsRemaining ??
            spinsRemainingRef.current ??
            0
        );

        console.log('[SPINS LEFT AFTER RESULT]', nextSpins);

        // =========================
        // UPDATE UI FIRST
        // =========================

        // await new Promise(resolve => setTimeout(resolve, 450));

        setGrid(newGrid);

        // clear old value only AFTER animation finished
        setLastSpinWin(0);

        const hasWin = winAmount > 0;
        if (hasWin) {
            playSound('win');
        }

        console.log(
            '[WIN_PAYLOAD_FULL]',
            JSON.stringify(payload?.winCells, null, 2)
        );

        console.log(
            '[LINE_RESULTS_FULL]',
            JSON.stringify(payload?.lineResults, null, 2)
        );

        await new Promise((resolve) => {

            setLastSpinWin(winAmount);

            setTotalWin((prev) => prev + winAmount);

            if (payload?.winCells) {

                setWinningCells(payload.winCells);

            } else if (payload?.lineResults) {

                const win = {};

                const firstWinningLine =
                    payload.lineResults?.find(
                        line => line && line.type !== 0
                    );

                if (firstWinningLine) {

                    const win = {};

                    const lineIdx =
                        payload.lineResults.indexOf(firstWinningLine);

                    firstWinningLine.matchedCells.forEach((cellIdx) => {

                        let r, c;

                        if (lineIdx === 0) {
                            r = 0;
                            c = cellIdx;
                        }
                        else if (lineIdx === 1) {
                            r = 1;
                            c = cellIdx;
                        }
                        else if (lineIdx === 2) {
                            r = 2;
                            c = cellIdx;
                        }
                        else if (lineIdx === 3) {
                            r = cellIdx;
                            c = cellIdx;
                        }
                        else if (lineIdx === 4) {
                            r = cellIdx;
                            c = 2 - cellIdx;
                        }

                        win[`${r}-${c}`] = true;

                    });

                    setWinningCells(win);

                } else {

                    setWinningCells({});

                }


                setWinningCells(win);

            } else {

                setWinningCells({});

            }

            setShowSpinResult(hasWin);

            spinningRef.current = false;

            // FAST CONTINUE IF NO WIN
            if (!hasWin) {
                resolve();
                return;
            }

            // SMALL PAUSE ONLY FOR WIN
            setTimeout(() => {
                resolve();
            }, 100);

        });

        spinsRemainingRef.current = nextSpins;

        setSpinsRemaining(nextSpins);
        debugLog(
            'SlotGame',
            'SPIN_RESULT_PROCESSED',
            {
                nextSpins,
                auto:
                    autoSpinActiveRef.current,
                roomId,
                userId:
                    userData?.userid,
            }
        );

        // =========================
        // UNLOCK SPIN ONLY AFTER UI UPDATE
        // =========================

        // spinningRef.current = false;

        // =========================
        // HARD STOP
        // =========================

        if (nextSpins <= 0) {

            debugLog(
                'SlotGame',
                'AUTO_SPIN_STOPPED',
                {
                    nextSpins,
                    roomId,
                    userId: userData?.userid,
                }
            );

            disableAuto('nextSpinsZero');


            if (autoSpinTimeoutRef.current) {
                clearTimeout(autoSpinTimeoutRef.current);
                autoSpinTimeoutRef.current = null;
            }

            return;
        }

        // =========================
        // START AUTO MODE
        // =========================


        // =========================
        // CLEAR OLD TIMER
        // =========================

        if (autoSpinTimeoutRef.current) {
            clearTimeout(autoSpinTimeoutRef.current);
            autoSpinTimeoutRef.current = null;
        }

        // =========================
        // NEXT AUTO SPIN
        // =========================

        console.log('[AUTO_TIMER_CREATED]', {
            nextSpins,
            delay: 300,
        });

        autoSpinTimeoutRef.current = setTimeout(() => {

            // HARD SAFETY CHECKS

            if (spinningRef.current) {

                console.log('[SPIN BLOCKED]');

                if (autoSpinActiveRef.current) {

                    setTimeout(() => {

                        // AUTO SPIN MAY HAVE BEEN TURNED OFF
                        if (!autoSpinActiveRef.current) {
                            console.log('[AUTO_RETRY_ABORTED_AUTO_OFF]');
                            return;
                        }

                        if (
                            !spinningRef.current &&
                            spinsRemainingRef.current > 0
                        ) {

                            debugLog(
                                'SlotGame',
                                'AUTO_RETRY_AFTER_BLOCK',
                                {
                                    spinsRemaining:
                                        spinsRemainingRef.current,
                                    roomId,
                                    userId:
                                        userData?.userid,
                                }
                            );

                            spin(
                                true,
                                spinsRemainingRef.current
                            );
                        }

                        console.log('[AUTO_TIMER_FIRED]', {
                            spinsRemainingRef: spinsRemainingRef.current,
                            spinning: spinningRef.current,
                            auto: autoSpinActiveRef.current,
                        });

                    }, 500);

                }

                return;
            }

            if (!autoSpinActiveRef.current) {
                console.log('[AUTO BLOCKED - AUTO OFF]');
                return;
            }

            const spinsLeft = Number(spinsRemainingRef.current || 0);

            console.log('[AUTO CHECK]', {
                spinsLeft,
                spinning: spinningRef.current,
                auto: autoSpinActiveRef.current,
            });

            if (spinsLeft <= 0) {

                console.log('[AUTO STOP NO SPINS]');

                disableAuto('autoStopNoSpins');


                return;
            }

            console.log('[START NEXT SPIN]', spinsLeft);

            spinningRef.current = false;

            setTimeout(() => {

                if (
                    autoSpinActiveRef.current &&
                    !spinningRef.current &&
                    spinsRemainingRef.current > 0
                ) {

                    debugLog(
                        'SlotGame',
                        'AUTO_NEXT_SPIN_FIRE',
                        {
                            spinsRemaining:
                                spinsRemainingRef.current,
                            roomId,
                            userId:
                                userData?.userid,
                        }
                    );

                    spin(
                        true,
                        spinsRemainingRef.current
                    );
                }

            }, 50);

        }, 300);

    }, [spinReelTo, spin]);

    const handleSpinResultBroadcast = useCallback(async (payload) => {

        console.log('[SPIN_RESULT_RECEIVED]', {
            spinsRemaining: payload?.spinsRemaining,
            winnings: payload?.winnings,
            playerId: payload?.playerId,
        });

        // WAIT for animation completion
        await handleSpinResult({
            ...payload,
            playerId: payload.playerId,
            spinsRemaining: payload.spinsRemaining,
            lastSpinWin: payload.winnings,
        });

        // FINAL SPIN
        if (payload.spinsRemaining <= 0) {

            console.log('[FINAL_SPIN_ANIMATION_COMPLETED]');

            // stop everything
            spinningRef.current = false;

            disableAuto('finalSpin');

            // clear auto timer
            if (autoSpinTimeoutRef.current) {
                clearTimeout(autoSpinTimeoutRef.current);
                autoSpinTimeoutRef.current = null;
            }

            // clear old close timer
            if (closeTimeoutRef.current) {
                clearTimeout(closeTimeoutRef.current);
            }

            // IMPORTANT:
            // EVERY CLIENT WAITS 5 SEC LOCALLY
            closeTimeoutRef.current = setTimeout(() => {

                console.log('[LOCAL_5_SEC_CLOSE]');

                fullResetGame();

                locallyClosedRef.current = true;

                onClose?.();

            }, 5000);
        }

    }, [
        handleSpinResult,
        fullResetGame,
        onClose,
    ]);

    useEffect(() => {
        spinsRemainingRef.current = spinsRemaining;
    }, [spinsRemaining]);

    useEffect(() => {
        if (!socket) {
            return;
        }

        socketRef.current = socket;

        socket.on('session_started', handleSessionStarted);
        socket.on('buy_confirmed', handleBuyConfirmed);
        socket.on('buy_failed', handleBuyFailed);
        socket.on('error_msg', handleErrorMsg);

        //         socket.on('close_slot_game', () => {

        //     console.log('[SERVER_CLOSE_RECEIVED]');

        //     // prevent duplicate timers
        // });

        socket.on('spin_result', handleSpinResultBroadcast);

        socket.on('reconnect', () => {

            debugLog(
                'SlotGame',
                'SOCKET_RECONNECTED',
                {
                    spinsRemaining:
                        spinsRemainingRef.current,
                    auto:
                        autoSpinActiveRef.current,
                    roomId,
                    userId:
                        userData?.userid,
                }
            );

            if (
                autoSpinActiveRef.current &&
                spinsRemainingRef.current > 0 &&
                !spinningRef.current
            ) {

                spin(
                    true,
                    spinsRemainingRef.current
                );

            }

        });

        socket.on('spin_busy', () => {

            debugLog(
                'SlotGame',
                'SPIN_BUSY_RECEIVED',
                {
                    spinsRemaining:
                        spinsRemainingRef.current,
                    roomId,
                    userId:
                        userData?.userid,
                }
            );

            spinningRef.current = false;

            if (
                autoSpinActiveRef.current &&
                spinsRemainingRef.current > 0
            ) {

                setTimeout(() => {

                    spin(
                        true,
                        spinsRemainingRef.current
                    );

                }, 500);

            }

        });

        socket.on('slotBroadcast', (data) => {
            setCurrentSpinner(data.playerId);

            if (typeof data.spinsRemaining === 'number') {
                spinsRemainingRef.current = data.spinsRemaining;
                setSpinsRemaining(data.spinsRemaining);
            }

            if (data.balance !== undefined) {
                setBalance(data.balance);
            }

            if (data.spinPurchased !== undefined) {
                spinPurchasedRef.current = data.spinPurchased;
                setSpinPurchased(data.spinPurchased);
            }

            if (data.purchasedSpins !== undefined) {
                setPurchasedSpins(data.purchasedSpins);
            }

            if (data.lastSpinWin !== undefined) {
                setLastSpinWin(data.lastSpinWin);
            }

            if (data.activeButtonIndex !== undefined) {
                setActiveButtonIndex(data.activeButtonIndex);
            }

            if (data.spinPurchased) {
                setHasPurchased(true);
            }

            locallyClosedRef.current = false;

            onForceOpen?.();
        });

        socket.on('slotGameBroadcast', (data) => {
            console.log(
                '[ROOM CHECK]',
                {
                    broadcastRoom: data.roomId,
                    currentRoom: roomId,
                }
            );

            console.log('[SLOT_GAME_BROADCAST_RECEIVED]', data);

            setCurrentSpinner(data.playerId);

            openedByRef.current = {
                userId: data.playerId,
            };

            setOpenedBy({
                userId: data.playerId,
            });

            locallyClosedRef.current = false;

            onForceOpen?.();

            socket.emit('modal_opened', {
                roomId,
                userId: userData?.userid,
            });

        });

        socket.on('modalOpenedForAll', () => {
            console.log('[INVOKER_CHECK]', {
                openedBy,
                userId: userData?.userid,
                currentInvoker:
                    openedBy?.userId === userData?.userid,
            });

            console.log('[MODAL_OPENED_FOR_ALL]');

            let counter = 5;

            setCountdown(counter);

            if (countdownIntervalRef.current) {
                clearInterval(countdownIntervalRef.current);
            }

            countdownIntervalRef.current = setInterval(() => {

                counter--;

                if (counter <= 0) {

                    clearInterval(
                        countdownIntervalRef.current
                    );

                    countdownIntervalRef.current = null;

                    setCountdown(null);

                    // ONLY INVOKER STARTS FIRST SPIN
                    const currentInvoker =
                        openedByRef.current?.userId ===
                        userData?.userid;

                    console.log('[INVOKER_CHECK]', {
                        openedByState: openedBy,
                        openedByRef: openedByRef.current,
                        userId: userData?.userid,
                        currentInvoker,
                    });

                    if (currentInvoker) {
                        setAutoSpinActive(true);
                        autoSpinActiveRef.current = true;

                        console.log('[STARTING_FIRST_SPIN]', {
                            spinsRemainingRef:
                                spinsRemainingRef.current,
                            auto:
                                autoSpinActiveRef.current,
                        });

                        spin(
                            true,
                            spinsRemainingRef.current
                        );
                    }

                } else {

                    setCountdown(counter);

                }

            }, 1000);

        });

        socket.on('spin_result_self', (payload) => {

            if (payload.spinsRemaining === 0) {
                setCurrentSpinner(null);
            }

            setBalance((prev) => payload.newBalance ?? prev);

            if (typeof payload.spinsRemaining === 'number') {
                spinsRemainingRef.current = payload.spinsRemaining;
                setSpinsRemaining(payload.spinsRemaining);
            }

            setPurchasedSpins((prev) => payload.purchasedSpins ?? prev);

            // IMPORTANT:
            // DO NOT update win amount here
            // handleSpinResult will update it AFTER reel animation completes

        });

        return () => {
            // clear auto spin timer
            if (autoSpinTimeoutRef.current) {
                clearTimeout(autoSpinTimeoutRef.current);
                autoSpinTimeoutRef.current = null;
            }
            if (spinWatchdogRef.current) {
                clearTimeout(spinWatchdogRef.current);
                spinWatchdogRef.current = null;
            }

            // clear modal close timer
            if (closeTimeoutRef.current) {
                clearTimeout(closeTimeoutRef.current);
                closeTimeoutRef.current = null;
            }

            socket.off('session_started', handleSessionStarted);
            socket.off('buy_confirmed', handleBuyConfirmed);
            socket.off('buy_failed', handleBuyFailed);
            socket.off('error_msg', handleErrorMsg);
            socket.off('spin_result', handleSpinResultBroadcast);
            socket.off('spin_result_self');
            socket.off('slotBroadcast');
            socket.off('close_slot_game');
            socket.off('slotGameBroadcast');
            socket.off('modalOpenedForAll');
            socket.off('spin_busy');
            socket.off('reconnect');
        };
    }, [
        roomId,
        userData?.userid,
        hostDetails?.userid,
        fullResetGame,
        handleBuyConfirmed,
        handleSpinResultBroadcast,
        onClose,
        onForceOpen,
    ]);

    const triggerBounceAnimation = (buttonIndex) => {
        const animValue = buyButtonBounceAnims[buttonIndex];
        Animated.sequence([
            Animated.timing(animValue, { toValue: 1.3, duration: 150, useNativeDriver: true }),
            Animated.timing(animValue, { toValue: 0.9, duration: 100, useNativeDriver: true }),
            Animated.timing(animValue, { toValue: 1, duration: 100, useNativeDriver: true }),
        ]).start();
    };

    const buySpins = (perSpinPrice, buttonIndex) => {
        if (isReadOnly) {
            return;
        }

        if (!socketRef.current) {
            Alert.alert('No connection', 'Not connected to server.');
            return;
        }

        setHasClickedBuy(true);

        if (userData?.userid === hostDetails?.userid) {
            Alert.alert('Message', 'You are host, you can’t play the game.');
            return;
        }

        if (hasPurchased && spinsRemaining > 0) {
            return;
        }

        setConfirmDialog({
            show: true,
            price: perSpinPrice,
            buttonIndex,
        });
    };

    const confirmBuy = (perSpinPrice, buttonIndex) => {
        fullResetGame();

        setConfirmDialog({
            show: false,
            price: null,
            buttonIndex: null,
        });

        if (!socket) {
            return;
        }

        setCurrentSpinner(null);
        setOpenedBy(null);

        setActiveButtonIndex(buttonIndex);
        triggerBounceAnimation(buttonIndex);

        socket.emit('buy_spins', {
            perSpinPrice,
            count: 5,
            userId: userData?.userid,
            buttonIndex,
            roomId,
        });
    };

    const resetSpinState = useCallback(() => {
        setGrid(Array.from({ length: ROWS }, () => Array(COLS).fill('')));
        setWinningCells({});
        setLastSpinWin(0);

        reels.forEach((reel) => {
            reel.setValue(0);
        });

        spinningRef.current = false;
    }, [reels]);

    // spinReel: animate reel to a given final symbol index (server-provided).
    const spinReelTo = useCallback((col, finalIndex) => {
        return new Promise((resolve) => {
            const loops = 2 + col;
            const len = SYMBOLS.length;

            const startPosition = -(loops * len * SYMBOL_HEIGHT);

            reels[col].setValue(startPosition);

            Animated.timing(reels[col], {
                toValue: -finalIndex * SYMBOL_HEIGHT,
                duration: 1500 + col * 250,
                easing: Easing.out(Easing.quad),
                useNativeDriver: true,
            }).start(() => {
                reels[col].setValue(-finalIndex * SYMBOL_HEIGHT);
                setTimeout(() => {
                    resolve(finalIndex);
                }, 50);
            });
        });
    }, [reels]);







    // For UI display: remaining purchase value
    // const remainingSpinCost = spinPurchased && purchasedSpins >= 0
    //     ? Number((spinPurchased * purchasedSpins).toFixed(2))
    //     : 0;

    const handleSlotGameClose = () => {
        if (isInvoker && hasPurchased) {
            return;
        }

        locallyClosedRef.current = true;

        // local close only
        onClose?.();
    };

    const getMarginLeft = (value) => {
        return String(value).length > 4 ? 50 : 30;
    };

    const getGiftOpacity = (index) => {
        return !hasPurchased || activeButtonIndex === index ? 1 : 0.5;
    };

    return (
        <>
            <Modal
                isVisible={visible}
                visible={visible} onRequestClose={handleSlotGameClose}
                onBackdropPress={handleSlotGameClose}
                animationIn="slideInUp"
                animationOut="slideOutDown"
                animationInTiming={300}
                animationOutTiming={200}
                useNativeDriver={true}
                avoidKeyboard={false}
                backdropOpacity={0}
                animationType="slide"
                style={[styles.profileModalMain]}
                // onRequestClose={onClose}
                propagateSwipe={true}
                swipeDirection={null}
            >
                <LinearGradient
                    colors={['rgba(13,31,53,0)', 'rgba(13,31,53,0.8)', '#0d1f35']}
                    locations={[0, 0.52, 1]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={styles.modalContainer}
                >
                    <ImageBackground
                        source={require('../../assets/images/solt-game/slotgame_bg.png')}
                        style={styles.modalBgOverlay}
                        imageStyle={styles.modalContainerBg}
                    >
                        <View style={styles.header}>
                            <TouchableOpacity style={styles.infoButton} onPress={() => setShowInfoModal(true)}>
                                <Ionicons name="information-circle" size={28} color="#ffd700" />
                            </TouchableOpacity>
                            {canClose && (
                                <TouchableOpacity
                                    style={styles.closeButton}
                                    onPress={handleSlotGameClose}
                                >
                                    <Ionicons name="close" size={20} color="#fff" />
                                </TouchableOpacity>
                            )}
                        </View>
                        <View style={styles.slots}>
                            {reels.map((anim, col) => (
                                <View key={col} style={styles.reel}>
                                    <View style={styles.overlayContainer} pointerEvents="none">
                                        {[0, 1, 2].map((row) => {
                                            const key = `${row}-${col}`;
                                            const isWin = !!winningCells[key];
                                            return (
                                                <View key={row} style={[
                                                    styles.overlayBox,
                                                    { top: row * SYMBOL_HEIGHT + 10 },
                                                    isWin && styles.overlayBoxActive,
                                                ]}>
                                                    {null}
                                                </View>
                                            );
                                        })}
                                    </View>

                                    <Animated.View
                                        style={[
                                            styles.container,
                                            { transform: [{ translateY: reels[col] }] },
                                            col === 0 && styles.col0,
                                            col === 2 && styles.col2,
                                        ]}
                                    >
                                        {Array.from({ length: 20 }).map((_, loopIdx) =>
                                            SYMBOLS.map((sym, idx) => (
                                                <View key={`${loopIdx}-${idx}`} style={styles.symbolBox}>
                                                    <Image source={symbolIcons[sym]} style={styles.symbolImage} />
                                                </View>
                                            ))
                                        )}
                                    </Animated.View>
                                </View>
                            ))}
                        </View>

                        <View style={styles.slotFooter}>
                            <View style={styles.spinContainer}>
                                <TouchableOpacity
                                    style={styles.spinButton}
                                    onPress={() => { }}  // manual spin
                                    disabled={true}
                                >
                                    <ImageBackground
                                        source={require('../../assets/images/solt-game/btn_spin_dis.png')}
                                        style={styles.spinButtonImg}
                                        resizeMode="cover"
                                    />
                                </TouchableOpacity>

                                <View style={styles.spinsRemainingBadge}>
                                    <ImageBackground source={require('../../assets/images/solt-game/spincount_bg.png')} style={styles.spinsRemainingBadgeImg} resizeMode="cover">
                                        <Text style={styles.spinsRemainingText}>{spinsRemaining}</Text>
                                    </ImageBackground>
                                </View>
                            </View>

                            <View style={styles.balanceContainer}>

                                {/* LEFT = BALANCE */}
                                <ImageBackground
                                    source={require('../../assets/images/solt-game/credit_bg.png')}
                                    style={styles.chipsBoxBgImg}
                                    resizeMode="cover"
                                >
                                    <ScrollView
                                        horizontal
                                        showsHorizontalScrollIndicator={false}
                                        contentContainerStyle={styles.chipsBoxScrollBox}
                                    >
                                        <Text style={styles.winAmountText}>
                                            {remainingBalance.toFixed(0)}
                                        </Text>
                                    </ScrollView>
                                </ImageBackground>

                                {/* RIGHT = CURRENT WIN */}
                                <ImageBackground
                                    source={require('../../assets/images/solt-game/win_bg.png')}
                                    style={styles.winAmountBgImg}
                                    resizeMode="cover"
                                >
                                    <ScrollView
                                        horizontal
                                        showsHorizontalScrollIndicator={false}
                                        contentContainerStyle={styles.winAmountScrollBox}
                                    >
                                        <Text style={styles.winAmountText}>
                                            {totalWin.toFixed(0)}
                                        </Text>
                                    </ScrollView>
                                </ImageBackground>

                            </View>

                            {!spinPurchased && (
                                <View style={styles.buyBtnContainer}>

                                    {/* BET 100 */}
                                    <TouchableOpacity
                                        style={styles.buyButton}
                                        disabled={isReadOnly || hasPurchased}
                                        onPress={() => buySpins(20, 0)}
                                    >
                                        <ImageBackground
                                            source={
                                                hasPurchased
                                                    ? require('../../assets/images/solt-game/bet_100.png')
                                                    : require('../../assets/images/solt-game/bet_100.png')
                                            }
                                            style={styles.buyBtnBgImg}
                                            resizeMode="cover"
                                        >
                                            <Animated.View style={{ transform: [{ scale: buyButtonBounceAnims[0] }] }}>
                                                <Image
                                                    style={[
                                                        styles.buyBtnGiftImg,
                                                        { opacity: getGiftOpacity(0) },
                                                    ]}
                                                    resizeMode="contain"
                                                    source={
                                                        activeButtonIndex === 0
                                                            ? require('../../assets/images/solt-game/icon_gift_glow.png')
                                                            : require('../../assets/images/solt-game/icon_gift.png')
                                                    }
                                                />
                                            </Animated.View>
                                        </ImageBackground>
                                    </TouchableOpacity>

                                    {/* BET 200 */}
                                    <TouchableOpacity
                                        style={styles.buyButton}
                                        disabled={isReadOnly || hasPurchased}
                                        onPress={() => buySpins(40, 1)}
                                    >
                                        <ImageBackground
                                            source={
                                                hasPurchased
                                                    ? require('../../assets/images/solt-game/bet_200_dis.png')
                                                    : require('../../assets/images/solt-game/bet_200.png')
                                            }
                                            style={styles.buyBtnBgImg}
                                            resizeMode="cover"
                                        >
                                            <Animated.View style={{ transform: [{ scale: buyButtonBounceAnims[1] }] }}>
                                                <Image
                                                    style={[
                                                        styles.buyBtnGiftImg,
                                                        { opacity: getGiftOpacity(1) },
                                                    ]}
                                                    resizeMode="contain"
                                                    source={
                                                        activeButtonIndex === 1
                                                            ? require('../../assets/images/solt-game/icon_gift_glow.png')
                                                            : require('../../assets/images/solt-game/icon_gift.png')
                                                    }
                                                />
                                            </Animated.View>
                                        </ImageBackground>
                                    </TouchableOpacity>

                                    {/* BET 500 */}
                                    <TouchableOpacity
                                        style={styles.buyButton}
                                        disabled={isReadOnly || hasPurchased}
                                        onPress={() => buySpins(100, 2)}
                                    >
                                        <ImageBackground
                                            source={
                                                hasPurchased
                                                    ? require('../../assets/images/solt-game/bet_500_dis.png')
                                                    : require('../../assets/images/solt-game/bet_500.png')
                                            }
                                            style={styles.buyBtnBgImg}
                                            resizeMode="cover"
                                        >
                                            <Animated.View style={{ transform: [{ scale: buyButtonBounceAnims[2] }] }}>
                                                <Image
                                                    style={[
                                                        styles.buyBtnGiftImg,
                                                        { opacity: getGiftOpacity(2) },
                                                    ]}
                                                    resizeMode="contain"
                                                    source={
                                                        activeButtonIndex === 2
                                                            ? require('../../assets/images/solt-game/icon_gift_glow.png')
                                                            : require('../../assets/images/solt-game/icon_gift.png')
                                                    }
                                                />
                                            </Animated.View>
                                        </ImageBackground>
                                    </TouchableOpacity>

                                    {/* BET 1000 */}
                                    <TouchableOpacity
                                        style={styles.buyButton}
                                        disabled={isReadOnly || hasPurchased}
                                        onPress={() => buySpins(200, 3)}
                                    >
                                        <ImageBackground
                                            source={
                                                hasPurchased
                                                    ? require('../../assets/images/solt-game/bet_1000_dis.png')
                                                    : require('../../assets/images/solt-game/bet_1000.png')
                                            }
                                            style={styles.buyBtnBgImg}
                                            resizeMode="cover"
                                        >
                                            <Animated.View style={{ transform: [{ scale: buyButtonBounceAnims[3] }] }}>
                                                <Image
                                                    style={[
                                                        styles.buyBtnGiftImg,
                                                        { opacity: getGiftOpacity(3) },
                                                    ]}
                                                    resizeMode="contain"
                                                    source={
                                                        activeButtonIndex === 3
                                                            ? require('../../assets/images/solt-game/icon_gift_glow.png')
                                                            : require('../../assets/images/solt-game/icon_gift.png')
                                                    }
                                                />
                                            </Animated.View>
                                        </ImageBackground>
                                    </TouchableOpacity>

                                </View>
                            )}


                        </View>

                        {countdown !== null && (
                            <View style={styles.countdownOverlay}>
                                <Text style={styles.countdownText}>
                                    {countdown}
                                </Text>
                            </View>
                        )}

                    </ImageBackground>
                </LinearGradient>

                {showInfoModal && (<InfoSlotGameModal visible={showInfoModal} onClose={() => setShowInfoModal(false)} />)}

                {confirmDialog.show && (
                    <CustomConfirmDialog
                        visible={confirmDialog.show}
                        title="Buy Spins"
                        message={`Are you sure you want to buy 5 spins for Ƶ${(confirmDialog.price * 10).toFixed(0)} ?`}
                        onCancel={() => setConfirmDialog({ show: false, price: null, buttonIndex: null })}
                        onConfirm={() => confirmBuy(confirmDialog.price, confirmDialog.buttonIndex)}
                        cancelText="Cancel"
                        confirmText="Buy"
                    />
                )}

            </Modal>
        </>
    );
}

const styles = StyleSheet.create({

    countdownOverlay: {
        position: 'absolute',

        top: 0,
        left: 0,
        right: 0,
        bottom: 0,

        justifyContent: 'center',
        alignItems: 'center',

        backgroundColor: 'transparent',

        zIndex: 99999,

        elevation: 99999,
    },

    countdownText: {
        fontSize: 170,

        fontWeight: '900',

        color: '#ffd700',

        textAlign: 'center',

        textShadowColor: '#000',

        textShadowOffset: {
            width: 4,
            height: 4,
        },

        textShadowRadius: 15,
    },
    container: {
        marginTop: 10,
        alignItems: 'center',
        width: '100%',
    },
    modalBgOverlay: {
        flex: 1,
    },
    col0: {
        marginRight: 10,
    },
    col2: {
        marginLeft: 10,
    },
    buyBtnCenter: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    profileModalMain: {
        justifyContent: 'flex-end',
        margin: 0,
    },
    modalContainer: {
        flex: 1,
        padding: 10,
        zIndex: 10,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        overflow: 'hidden',
        position: 'relative',
        maxHeight: 620,
    },
    modalContainerBg: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        resizeMode: 'cover',
        backgroundColor: 'transparent',
        transform: [{ translateY: 30 }],
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
    },
    infoButton: {
        padding: 0,
    },
    closeButton: {
        backgroundColor: 'rgba(214, 4, 4, 0.86)',
        borderRadius: 20,
        padding: 5,
    },
    chipsBoxBgImg: {
        width: 140,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    chipsBoxScrollBox: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    chipsText: {
        color: '#feca3c',
        fontSize: 23,
        fontWeight: '800',
        textShadowColor: '#00494a',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
        marginBottom: 5,
    },
    winAmountBgImg: {
        width: 140,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 10,
    },
    winAmountScrollBox: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    winAmountText: {
        color: '#feca3c',
        fontSize: 23,
        fontWeight: '800',
        textShadowColor: '#00494a',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,

        textAlign: 'center',

        width: '100%',
        includeFontPadding: false,
    },
    balanceContainer: {
        flexDirection: 'row',
        marginTop: 5,
        gap: 5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    spinsRemainingBadge: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    spinsRemainingBadgeImg: {
        width: 50,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
    },
    spinsRemainingText: {
        color: '#ffc263',
        fontSize: 26,
        fontWeight: '800',
        textShadowColor: '#96250f',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
    },
    buyBtnContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: 5,
    },
    buyButton: {
        flex: 1,
        marginHorizontal: 2,
        height: 42,
        overflow: 'hidden',
    },
    buyBtnBgImg: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'flex-start',
        paddingHorizontal: 18,
    },
    buyBtnGiftImg: {
        height: 30,
        width: 30,
        marginBottom: 3,
        left: -12,
    },
    spinPurchasedText: {
        color: '#ffc263',
        fontSize: 26,
        fontWeight: '800',
        textShadowColor: '#96250f',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
        textAlign: 'center',
        marginBottom: 5,
    },
    remainingSpinCostBox: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    remainingSpinConstContainer: {
        width: 125,
        marginHorizontal: 5,
        height: 45,
        overflow: 'hidden',
    },
    slots: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        height: SYMBOL_HEIGHT * 3.4,
        overflow: 'hidden',
        position: 'relative',
        marginTop: 140,
    },
    reel: {
        width: REEL_WIDTH,
        height: SYMBOL_HEIGHT * 3,
        overflow: 'hidden',
        position: 'relative',
        alignItems: 'center',
    },
    symbolBox: {
        height: SYMBOL_HEIGHT,
        width: REEL_WIDTH,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 8,
    },
    symbolImage: {
        width: '100%',
        height: '80%',
        resizeMode: 'contain',
    },
    overlayContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        height: SYMBOL_HEIGHT * 3,
        zIndex: 0,
    },
    overlayBox: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: SYMBOL_HEIGHT,

        justifyContent: 'center',
        alignItems: 'center',

        borderRadius: 6,
        borderWidth: 0,

        backgroundColor: 'transparent',
    },

    overlayBoxActive: {
        backgroundColor: 'transparent', // remove yellow fill

        borderWidth: 3,
        borderColor: '#ffd700',

        borderRadius: 6,

        shadowColor: '#ffd700',
        shadowOffset: {
            width: 0,
            height: 0,
        },
        shadowOpacity: 1,
        shadowRadius: 10,

        elevation: 15,
    },
    overlayLabel: {
        color: '#222',
        fontWeight: '900',
        letterSpacing: 1,
    },
    slotFooter: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        alignItems: 'center',
        paddingBottom: 5,
    },
    spinContainer: {
        flexDirection: 'row',
        gap: 5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    spinButton: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    spinButtonImg: {
        width: 140,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
    },

    balanceDisplayContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 5,
    },

    balanceDisplayBg: {
        width: 170,
        height: 55,

        justifyContent: 'center',
        alignItems: 'center',

        paddingTop: 2,
    },

    balanceLabel: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1,

        textAlign: 'center',

        position: 'absolute',
        top: 4,
    },

    balanceValue: {
        color: '#ffc263',
        fontSize: 26,
        fontWeight: '900',

        textAlign: 'center',
        width: '100%',

        textShadowColor: '#96250f',
        textShadowOffset: {
            width: 1,
            height: 1,
        },
        textShadowRadius: 3,

        includeFontPadding: false,
    },
});