// SlotGameModal.js (updated)
import React, { useEffect, useRef, useState } from 'react';
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
import { io } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

// Socket server URL —
const SOCKET_URL = 'http://192.168.0.114:5000';

export default function SlotGameModal({ visible, onClose, userData,
    hostDetails, roomId }) {
    const [balance, setBalance] = useState(0);
    const [grid, setGrid] = useState(Array.from({ length: ROWS }, () => Array(COLS).fill("")));
    const [winningCells, setWinningCells] = useState({});
    const [spinsRemaining, setSpinsRemaining] = useState(0);
    const [purchasedSpins, setPurchasedSpins] = useState(0);
    const [hasPurchased, setHasPurchased] = useState(false);
    const [spinPurchased, setSpinPurchased] = useState(null);
    const [totalSpinCost, setTotalSpinCost] = useState(null);
    const [winningAmount, setWinningAmount] = useState(0);
    const [lastSpinWin, setLastSpinWin] = useState(0);
    const [activeButtonIndex, setActiveButtonIndex] = useState(null);
    const [confirmDialog, setConfirmDialog] = useState({ show: false, price: null, buttonIndex: null });
    const [showInfoModal, setShowInfoModal] = useState(false);

    // socket ref
    const socketRef = useRef(null);

    // Animation lock
    const spinningRef = useRef(false);

    // animated reels
    const reels = useRef(Array.from({ length: COLS }, () => new Animated.Value(0))).current;

    // bounce anims for buy buttons
    const buyButtonBounceAnims = useRef([
        new Animated.Value(1), new Animated.Value(1), new Animated.Value(1),
    ]).current;

    useEffect(() => {
        // connect socket
        const socket = io(SOCKET_URL, {
            transports: ['websocket'],
            // If you want to pass user id or token for auth, add it here:
            // auth: { token: 'xxx' }
        });

        socketRef.current = socket;

        socket.on('connect', () => {
            console.log('Socket connected', socket.id);
            // register the player server-side with roomId and hostDetails
            socket.emit('register_player', { userId: userData?.userid, hostId: hostDetails?.userid, roomId });
        });

        // Listen for session start
        socket.on('session_started', async ({ sessionID }) => {
            try {
                await AsyncStorage.setItem('slotSessionID', sessionID.toString());
                console.log('SessionID saved:', sessionID);
            } catch (e) {
                console.error('Failed to save sessionID', e);
            }
        });

        socket.on('buy_confirmed', (payload) => {
            // server confirms buy: payload contains { balance, spinPurchased, spinsRemaining, purchasedSpins, totalCost }
            console.log('buy_confirmed', payload);
            setHasPurchased(true);
            setSpinPurchased(payload.spinPurchased);
            setTotalSpinCost(payload.totalCost);
            setBalance(payload.balance ?? 0);
            setSpinsRemaining(payload.spinsRemaining ?? 0);
            setPurchasedSpins(payload.purchasedSpins ?? 0);
            setActiveButtonIndex(payload.buttonIndex ?? null);
        });

        // Listen for failure
        socket.on('buy_failed', (data) => {
            console.error('❌ Buy failed:', data.message);
            Alert.alert('Purchase Failed', data.message || 'Unable to complete purchase.');
        });

        // socket.on('spin_result_failed', (data) => {
        //     console.error('❌ Spin result failed:', data.message);
        //     Alert.alert('Record Slots Spins', data.message);
        // });

        socket.on('error_msg', (msg) => {
            Alert.alert('Server error', String(msg));
        });

        // The server may emit spontaneous spin_result (usually in response to our spin)
        // We'll also attach one-time listener when we emit spin.

        // When component unmounts or modal closes: disconnect socket
        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, [roomId, userData?.userid, hostDetails]);


    // ✅ Retrieving sessionID later

    // const getSessionID = async () => {
    //     try {
    //         const id = await AsyncStorage.getItem('slotSessionID');
    //         if (id !== null) {
    //             console.log('Retrieved sessionID:', id);
    //             return id;
    //         }
    //     } catch (e) {
    //         console.error('Failed to fetch sessionID', e);
    //     }
    // };


    useEffect(() => {
        if (spinsRemaining === 0) {
            setHasPurchased(false);
            setSpinPurchased(null);
            setTotalSpinCost(null);
            setPurchasedSpins(0);
            setActiveButtonIndex(null);
        }
    }, [spinsRemaining]);

    const triggerBounceAnimation = (buttonIndex) => {
        const animValue = buyButtonBounceAnims[buttonIndex];
        Animated.sequence([
            Animated.timing(animValue, { toValue: 1.3, duration: 150, useNativeDriver: true }),
            Animated.timing(animValue, { toValue: 0.9, duration: 100, useNativeDriver: true }),
            Animated.timing(animValue, { toValue: 1, duration: 100, useNativeDriver: true }),
        ]).start();
    };

    // When user taps buy, we first ask server to prepare/validate purchase.
    const buySpins = (perSpinPrice, buttonIndex) => {
        if (!socketRef.current) {
            Alert.alert('No connection', 'Not connected to server.');
            return;
        }
        if (hasPurchased) return;
        // show confirm dialog (UI)
        setConfirmDialog({ show: true, price: perSpinPrice, buttonIndex });
    };

    // Confirmed in UI -> emit to server to actually do buy
    const confirmBuy = (perSpinPrice, buttonIndex) => {
        setConfirmDialog({ show: false, price: null, buttonIndex: null });
        const socket = socketRef.current;
        if (!socket) {
            Alert.alert('No connection', 'Not connected to server.');
            return;
        }
        setActiveButtonIndex(buttonIndex);
        triggerBounceAnimation(buttonIndex);

        // include roomId and userId for server to know which room/player
        socket.emit('buy_spins', {
            perSpinPrice,
            count: 10,
            userId: userData?.userid,
            buttonIndex,
            roomId,
        });
    };

    // spinReel: animate reel to a given final symbol index (server-provided).
    const spinReelTo = (col, finalIndex) => {
        return new Promise((resolve) => {
            const loops = 5 + col;
            const len = SYMBOLS.length;
            // toValue should scroll down loops * len + finalIndex times symbol height:
            const toValue = (loops * len + finalIndex) * SYMBOL_HEIGHT;

            Animated.timing(reels[col], {
                toValue,
                duration: 2500 + col * 450,
                easing: Easing.out(Easing.quad),
                useNativeDriver: true,
            }).start(() => {
                // Align exactly to finalIndex for consistent visuals:
                reels[col].setValue(finalIndex * SYMBOL_HEIGHT);
                resolve(finalIndex);
            });
        });
    };

    // spin -> ask server for final indexes, then animate to them
    const spin = async () => {
        if (spinningRef.current) return;
        if (spinsRemaining <= 0) {
            Alert.alert('No spins', 'Please buy spins to play.');
            return;
        }
        const socket = socketRef.current;
        if (!socket) {
            Alert.alert('No connection', 'Not connected to server.');
            return;
        }

        spinningRef.current = true;
        setWinningCells({});
        setLastSpinWin(0);

        // emit spin with roomId
        socket.emit('spin', { userId: userData?.userid, roomId, spinPurchased });

        // attach one-time listener
        socket.once('spin_result', async (payload) => {
            try {
                console.log('spin_result payload', payload);

                const finalIndexes = payload.finalIndexes || [0, 0, 0];

                // Animate reels to server-provided final indexes
                const animatedResults = await Promise.all(finalIndexes.map((fi, col) => spinReelTo(col, fi)));

                // Build new 3x3 grid like before
                const len = SYMBOLS.length;
                const newGrid = Array.from({ length: ROWS }, () => Array(COLS).fill(""));
                for (let c = 0; c < COLS; c++) {
                    const topIndex = animatedResults[c];
                    const centerIndex = (topIndex + 1) % len;
                    const bottomIndex = (topIndex + 2) % len;
                    newGrid[0][c] = SYMBOLS[topIndex];
                    newGrid[1][c] = SYMBOLS[centerIndex];
                    newGrid[2][c] = SYMBOLS[bottomIndex];
                }

                // Update UI state with server-provided numbers
                setGrid(newGrid);
                setBalance(typeof payload.newBalance === 'number' ? payload.newBalance : balance);
                setSpinsRemaining(typeof payload.spinsRemaining === 'number' ? payload.spinsRemaining : (spinsRemaining - 1));
                setPurchasedSpins(typeof payload.purchasedSpins === 'number' ? payload.purchasedSpins : Math.max(purchasedSpins - 1, 0));
                setLastSpinWin(typeof payload.lastSpinWin === 'number' ? payload.lastSpinWin : (payload.winnings || 0));

                // winning cells mapping — server can send `lineResults` or `winCells`:
                if (payload.winCells) {
                    setWinningCells(payload.winCells);
                } else if (payload.lineResults) {
                    const win = {};
                    payload.lineResults.forEach((res, lineIdx) => {
                        if (!res || res.type === 0) return;
                        res.matchedCells.forEach((cellIdx) => {
                            let r, c;
                            if (lineIdx === 0) { r = 0; c = cellIdx; }
                            else if (lineIdx === 1) { r = 1; c = cellIdx; }
                            else if (lineIdx === 2) { r = 2; c = cellIdx; }
                            else if (lineIdx === 3) { r = cellIdx; c = cellIdx; }
                            else if (lineIdx === 4) { r = cellIdx; c = 2 - cellIdx; }
                            win[`${r}-${c}`] = true;
                        });
                    });
                    setWinningCells(win);
                }

                // optionally show free spins added message
                if (payload.awardedFreeSpins && payload.awardedFreeSpins > 0) {
                    console.log('Awarded free spins: ', payload.awardedFreeSpins);
                }
            } catch (err) {
                console.error('Error handling spin_result', err);
            } finally {
                spinningRef.current = false;
            }
        });
    };

    // For UI display: remaining purchase value
    // const remainingSpinCost = spinPurchased && purchasedSpins >= 0
    //     ? Number((spinPurchased * purchasedSpins).toFixed(2))
    //     : 0;

    return (
        <>
            <Modal
                isVisible={visible}
                // onBackdropPress={onClose}
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
            >
                <ImageBackground
                    source={require('../../assets/images/solt-game/slotgame_bg.png')}
                    style={styles.modalContainer}
                    imageStyle={styles.modalContainerBg}
                >
                    <View style={styles.header}>
                        <TouchableOpacity style={styles.infoButton} onPress={() => setShowInfoModal(true)}>
                            <Ionicons name="information-circle" size={28} color="#ffd700" />
                        </TouchableOpacity>
                        {/* {(
                            <TouchableOpacity onPress={onClose}>
                                <Ionicons name="close" size={28} color="#fff" />
                            </TouchableOpacity>
                        )} */}
                        {spinsRemaining === 0 && (
                            <TouchableOpacity onPress={onClose}>
                                <Ionicons name="close" size={28} color="#fff" />
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
                                                { top: row * SYMBOL_HEIGHT },
                                                isWin && styles.overlayBoxActive,
                                            ]}>
                                                {isWin && <Text style={styles.overlayLabel}>WIN</Text>}
                                            </View>
                                        );
                                    })}
                                </View>

                                <Animated.View
                                    style={{
                                        transform: [{
                                            translateY: anim.interpolate({
                                                inputRange: [0, SYMBOLS.length * SYMBOL_HEIGHT],
                                                outputRange: [0, -SYMBOLS.length * SYMBOL_HEIGHT],
                                                extrapolate: 'extend',
                                            }),
                                        }],
                                    }}
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
                                onPress={spin}
                                disabled={spinningRef.current || spinsRemaining === 0}
                            >
                                <ImageBackground
                                    source={(spinningRef.current || spinsRemaining === 0) ? require('../../assets/images/solt-game/btn_spin_dis.png') : require('../../assets/images/solt-game/btn_spin.png')}
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
                            <ImageBackground source={require('../../assets/images/solt-game/credit_bg.png')} style={styles.chipsBoxBgImg} resizeMode="cover">
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsBoxScrollBox}>
                                    <Text style={styles.chipsText}>{spinPurchased || 0.00}</Text>
                                </ScrollView>
                            </ImageBackground>

                            <ImageBackground source={require('../../assets/images/solt-game/win_bg.png')} style={styles.winAmountBgImg} resizeMode="cover">
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.winAmountScrollBox}>
                                    <Text style={[styles.winAmountText, { marginLeft: String(lastSpinWin).length > 4 ? 50 : 30 }]}>{lastSpinWin.toFixed(2)}</Text>
                                </ScrollView>
                            </ImageBackground>
                        </View>

                        {!spinPurchased && (
                            <View style={styles.buyBtnContainer}>
                                <TouchableOpacity style={styles.buyButton} disabled={hasPurchased} onPress={() => buySpins(0.2, 0)}>
                                    <ImageBackground source={hasPurchased ? require('../../assets/images/solt-game/bet_2_dis.png') : require('../../assets/images/solt-game/bet_2.png')} style={[styles.buyBtnBgImg]} resizeMode="cover">
                                        <Animated.View style={{ transform: [{ scale: buyButtonBounceAnims[0] }] }}>
                                            <Image style={[styles.buyBtnGiftImg, { opacity: (!hasPurchased || activeButtonIndex === 0) ? 1 : 0.5 }]} resizeMode="contain"
                                                source={activeButtonIndex === 0 ? require('../../assets/images/solt-game/icon_gift_glow.png') : require('../../assets/images/solt-game/icon_gift.png')} />
                                        </Animated.View>
                                    </ImageBackground>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.buyButton} onPress={() => buySpins(0.5, 1)} disabled={hasPurchased}>
                                    <ImageBackground source={hasPurchased ? require('../../assets/images/solt-game/bet_5_dis.png') : require('../../assets/images/solt-game/bet_5.png')} style={[styles.buyBtnBgImg]} resizeMode="cover">
                                        <Animated.View style={{ transform: [{ scale: buyButtonBounceAnims[1] }] }}>
                                            <Image style={[styles.buyBtnGiftImg, { opacity: (!hasPurchased || activeButtonIndex === 1) ? 1 : 0.5 }]} resizeMode="contain"
                                                source={activeButtonIndex === 1 ? require('../../assets/images/solt-game/icon_gift_glow.png') : require('../../assets/images/solt-game/icon_gift.png')} />
                                        </Animated.View>
                                    </ImageBackground>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.buyButton} onPress={() => buySpins(1.0, 2)} disabled={hasPurchased}>
                                    <ImageBackground source={hasPurchased ? require('../../assets/images/solt-game/bet_10_dis.png') : require('../../assets/images/solt-game/bet_10.png')} style={[styles.buyBtnBgImg]} resizeMode="cover">
                                        <Animated.View style={{ transform: [{ scale: buyButtonBounceAnims[2] }] }}>
                                            <Image style={[styles.buyBtnGiftImg, { opacity: (!hasPurchased || activeButtonIndex === 2) ? 1 : 0.5 }]} resizeMode="contain"
                                                source={activeButtonIndex === 2 ? require('../../assets/images/solt-game/icon_gift_glow.png') : require('../../assets/images/solt-game/icon_gift.png')} />
                                        </Animated.View>
                                    </ImageBackground>
                                </TouchableOpacity>
                            </View>
                        )}

                        {hasPurchased && spinPurchased && (
                            <View style={styles.remainingSpinCostBox}>
                                <View style={styles.remainingSpinConstContainer}>
                                    <ImageBackground source={require('../../assets/images/solt-game/bet_blank.png')} style={[styles.buyBtnBgImg, { alignItems: 'center' }]} resizeMode="cover">
                                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.winAmountScrollBox}>
                                            <Text style={styles.spinPurchasedText}>
                                                {balance.toFixed(2)}
                                            </Text>
                                        </ScrollView>
                                    </ImageBackground>
                                </View>
                            </View>
                        )}
                    </View>
                </ImageBackground>
            </Modal>

            {showInfoModal && (<InfoSlotGameModal visible={showInfoModal} onClose={() => setShowInfoModal(false)} />)}

            {confirmDialog.show && (
                <CustomConfirmDialog
                    visible={confirmDialog.show}
                    title="Buy Spins"
                    message={`Are you sure you want to buy 10 spins for $${(confirmDialog.price * 10).toFixed(2)} ?`}
                    onCancel={() => setConfirmDialog({ show: false, price: null, buttonIndex: null })}
                    onConfirm={() => confirmBuy(confirmDialog.price, confirmDialog.buttonIndex)}
                    cancelText="Cancel"
                    confirmText="Buy"
                />
            )}
        </>
    );
}

const styles = StyleSheet.create({
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
        maxHeight: 560,
    },
    modalContainerBg: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        resizeMode: 'cover',
        backgroundColor: '#000',
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
        marginBottom: 5,
        textAlign: 'center',
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
    },
    buyButton: {
        flex: 1,
        marginHorizontal: 5,
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
        height: 35,
        width: 35,
        marginBottom: 5,
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
        height: SYMBOL_HEIGHT * 3,
        overflow: 'hidden',
        position: 'relative',
        marginTop: 110,
    },
    reel: {
        width: REEL_WIDTH,
        height: SYMBOL_HEIGHT * 3,
        overflow: 'hidden',
        backgroundColor: 'transparent',
        position: 'relative',
    },
    symbolBox: {
        height: SYMBOL_HEIGHT,
        justifyContent: 'center',
        alignItems: 'center',
        width: REEL_WIDTH,
    },
    symbolImage: {
        width: SYMBOL_WIDTH * 0.9,
        height: SYMBOL_HEIGHT * 0.9,
        resizeMode: 'contain',
        alignSelf: 'center',
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
        backgroundColor: 'rgba(255, 217, 0, 0.57)',
        borderWidth: 2,
        borderColor: 'rgba(255,215,0,0.9)',
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
});