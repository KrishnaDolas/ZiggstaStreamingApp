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

// Master list of all possible slot symbols.
const SYMBOLS = [
    'Wild',
    'Seven',
    'Star',
    'Gift',
    'Scatter',
    'Cherry',
    'Ace',
    'King',
    'Queen',
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

// Defines the payout rules:
// 2 → win for matching pair
// 3 → win for full 3-of-a-kind
const PAYOUT = {
    Wild: { 2: 0, 3: 0 },
    Seven: { 2: 2.5, 3: 10.0 },
    Star: { 2: 1.0, 3: 5.0 },
    Gift: { 2: 1.0, 3: 5.0 },
    Scatter: { 2: 1.0, 3: "5 free spins" },
    Cherry: { 2: 1.0, 3: 3.0 },
    Ace: { 2: 0, 3: 3.0 },
    King: { 2: 0, 3: 2.0 },
    Queen: { 2: 0, 3: 2.0 },
};

// Layout constants
const ROWS = 3;
const COLS = 3;
const REEL_WIDTH = 90;
// Each reel cell will scale based on screen width
const SYMBOL_HEIGHT = 85;           // reel cell height
const SYMBOL_WIDTH = 85;            // reel cell width

// Weighted pool (balanced for RTP feel)
// Wild tuned to appear ~once in 12–15 spins
const WEIGHTED_POOL = [
    // Very common (low payout, fillers)
    ...Array(30).fill("Queen"),   // payout 0–2
    ...Array(26).fill("King"),    // payout 0–2
    ...Array(22).fill("Ace"),     // payout 0–3
    ...Array(20).fill("Cherry"),  // payout 1–3

    // Medium payout
    ...Array(12).fill("Gift"),    // payout 1–5
    ...Array(10).fill("Star"),    // payout 1–5

    // Rare specials
    ...Array(6).fill("Scatter"),  // free spins
    ...Array(3).fill("Seven"),    // payout 2.5–10

    // Wild tuned very low
    ...Array(2).fill("Wild"),     // joker, substitutes but no payout
];


// picks a random symbol index from the weighted pool.
// used to decide where the reel stops.
const pickWeightedSymbolIndex = () => {
    const sym = WEIGHTED_POOL[Math.floor(Math.random() * WEIGHTED_POOL.length)];
    return SYMBOLS.indexOf(sym);
};

export default function SlotGameModal({ visible, onClose, userData }) {
    const [balance, setBalance] = useState(0); // Player money
    // Current 3×3 symbol layout
    const [grid, setGrid] = useState(
        Array.from({ length: ROWS }, () => Array(COLS).fill(""))
    );
    const [winningCells, setWinningCells] = useState({}); // highlights on winning positions in grid.
    // const [spinning, setSpinning] = useState(false); // Animation lock
    const [spinsRemaining, setSpinsRemaining] = useState(0); // Prepaid spins left
    const [purchasedSpins, setPurchasedSpins] = useState(0); // Purchased spins only
    const [hasPurchased, setHasPurchased] = useState(false);
    const [spinPurchased, setSpinPurchased] = useState(null); // cost per spin (0.2, 0.5, 1.0).
    const [totalSpinCost, setTotalSpinCost] = useState(null); // Total cost of purchased spins
    const [winningAmount, setWinningAmount] = useState(0);
    const [lastSpinWin, setLastSpinWin] = useState(0); // last spin payout.
    const [activeButtonIndex, setActiveButtonIndex] = useState(null);
    const [confirmDialog, setConfirmDialog] = useState({ show: false, price: null, buttonIndex: null });

    // New state for info modal
    const [showInfoModal, setShowInfoModal] = useState(false);

    // Animation lock
    const spinningRef = useRef(false);

    // reels → one animated value per reel column.
    // Controls the scroll animation.
    const reels = useRef(Array.from({ length: COLS }, () => new Animated.Value(0))).current;


    // Individual bounce animations for each buy button
    const buyButtonBounceAnims = useRef([
        new Animated.Value(1), // $0.20 button
        new Animated.Value(1), // $0.50 button
        new Animated.Value(1), // $1.00 button
    ]).current;


    // spinsRemaining 0 then reset hasPurchased
    useEffect(() => {
        if (spinsRemaining === 0) {
            setHasPurchased(false);
            setSpinPurchased(null);
            setTotalSpinCost(null);
            setPurchasedSpins(0);
            setActiveButtonIndex(null);
        }
    }, [spinsRemaining]);

    // Function to trigger bounce animation for specific button
    const triggerBounceAnimation = (buttonIndex) => {
        const animValue = buyButtonBounceAnims[buttonIndex];

        Animated.sequence([
            Animated.timing(animValue, {
                toValue: 1.3, // grow
                duration: 150,
                useNativeDriver: true,
            }),
            Animated.timing(animValue, {
                toValue: 0.9, // shrink
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(animValue, {
                toValue: 1, // back to normal
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start();
    };


    const buySpins = (perSpinPrice, buttonIndex) => {
        if (hasPurchased) return;
        setConfirmDialog({ show: true, price: perSpinPrice, buttonIndex });
    };

    const confirmBuy = (perSpinPrice, buttonIndex) => {
        setActiveButtonIndex(buttonIndex);
        triggerBounceAnimation(buttonIndex);
        setSpinPurchased(perSpinPrice);
        const totalCost = Number((perSpinPrice * 10).toFixed(2));
        setTotalSpinCost(totalCost); // Store total cost
        setBalance(totalCost);
        // if (balance < totalCost) {
        //     Alert.alert('Insufficient balance', "You don't have enough balance to buy spins.");
        //     setConfirmDialog({ show: false, price: null, buttonIndex: null });
        //     return;
        // }
        // setBalance((b) => Number((b - totalCost).toFixed(2)));
        setSpinsRemaining((s) => s + 10);
        setHasPurchased(true);
        setPurchasedSpins(10); // Initialize purchased spins
        setConfirmDialog({ show: false, price: null, buttonIndex: null });
    };


    // Spins one reel column.
    // Runs animation for a few loops then stops at random weighted symbol.
    // Returns the index of the top symbol.

    const spinReel = (col) => {
        return new Promise((resolve) => {
            const loops = 5 + col; // each reel spins different loops
            const finalIndex = pickWeightedSymbolIndex(); // Picks a random final stop symbol

            // Calculates how far animation should move (toValue).
            const toValue = (loops * SYMBOLS.length + finalIndex) * SYMBOL_HEIGHT;

            // Starts an animation that scrolls the reel downwards.
            Animated.timing(reels[col], {
                toValue,   // distance to scroll
                duration: 2500 + col * 450, // staggered timing
                easing: Easing.out(Easing.quad),
                useNativeDriver: true,
            }).start(() => {
                // Resets reel to exactly align with the chosen symbol.
                reels[col].setValue(finalIndex * SYMBOL_HEIGHT);
                resolve(finalIndex); // final stop index
            });
        });
    };

    // checks a row/diagonal:
    // 3 of same symbol (or with wilds) → big win.
    // 2 consecutive (with wild support) → small win.
    // All wilds → no payout.
    const evaluateLine = (line) => {
        console.log('▶️ Evaluating line:', line);

        // Count Wilds and collect non-Wild symbols
        const wildCount = line.filter((s) => s === "Wild").length;
        const nonWilds = line.filter((s) => s !== "Wild");

        // 1. All Wilds: No payout
        if (wildCount === 3) {
            console.log('❌ All Wilds - No payout');
            return { type: 0, symbol: null, matchedCells: [] };
        }

        // 2. All non-Wilds are the same (or only one non-Wild): 3-of-a-kind win
        if (
            nonWilds.length > 0 &&
            nonWilds.every((s) => s === nonWilds[0])
        ) {
            console.log('✅ 3-of-a-kind detected:', nonWilds[0]);
            return { type: 3, symbol: nonWilds[0], matchedCells: [0, 1, 2] };
        }

        // 3. Check contiguous 2-symbol pairs (as before)
        const pairs = [[0, 1], [1, 2]];
        const matchingPairs = [];

        for (const pair of pairs) {
            const [a, b] = pair;
            const sA = line[a];
            const sB = line[b];
            const sOther = line[3 - (a + b)];

            let candidate = null;

            if (sA !== "Wild" && sB !== "Wild") {
                if (sA === sB) {
                    candidate = sA;
                    console.log(`✅ Pair match [${a},${b}] both = ${sA}`);
                }
            } else if (sA === "Wild" && sB !== "Wild") {
                if (sOther === "Wild" || sOther === sB) {
                    candidate = sB;
                    console.log(`✅ Pair match [${a},${b}] Wild+${sB}, other=${sOther}`);
                } else {
                    console.log(`❌ [${a},${b}] Wild+${sB} blocked by other=${sOther}`);
                }
            } else if (sB === "Wild" && sA !== "Wild") {
                if (sOther === "Wild" || sOther === sA) {
                    candidate = sA;
                    console.log(`✅ Pair match [${a},${b}] ${sA}+Wild, other=${sOther}`);
                } else {
                    console.log(`❌ [${a},${b}] ${sA}+Wild blocked by other=${sOther}`);
                }
            }

            if (candidate) {
                const p2 = PAYOUT[candidate] ? (PAYOUT[candidate][2] || 0) : 0;
                matchingPairs.push({ pair, candidate, p2 });
            }
        }

        if (matchingPairs.length === 0) {
            console.log('❌ No matching pairs found');
            return { type: 0, symbol: null, matchedCells: [] };
        }

        matchingPairs.sort((x, y) => {
            if (y.p2 !== x.p2) return y.p2 - x.p2;
            const leftIndex = (pair) => (pair[0] === 0 ? 0 : 1);
            return leftIndex(x.pair) - leftIndex(y.pair);
        });

        const best = matchingPairs[0];
        console.log(`✅ 2-of-a-kind: ${best.candidate} at cells`, best.pair, "payout:", best.p2);

        return { type: 2, symbol: best.candidate, matchedCells: best.pair };
    };

    // Purpose → Converts winning line results into grid cell coordinates for UI highlights.
    // Ex. { "0-1": true, "0-2": true, "1-2": true } - Used for overlay highlights in UI.
    const computeWinningCellsFromLineResults = (lineResults) => {
        const win = {};
        lineResults.forEach((res, lineIdx) => {
            if (res.type === 0) return;
            res.matchedCells.forEach((cellIdx) => {
                let r, c;
                if (lineIdx === 0) {
                    r = 0; c = cellIdx;
                } else if (lineIdx === 1) {
                    r = 1; c = cellIdx;
                } else if (lineIdx === 2) {
                    r = 2; c = cellIdx;
                } else if (lineIdx === 3) {
                    r = cellIdx; c = cellIdx; // diag TL->BR
                } else if (lineIdx === 4) {
                    r = cellIdx; c = 2 - cellIdx; // diag TR->BL
                }
                win[`${r}-${c}`] = true;
            });
        });
        return win;
    };

    const spin = async () => {
        //Prevent multiple spins / no spins
        if (spinningRef.current) return;
        if (spinsRemaining <= 0) {
            Alert.alert('No spins', 'Please buy spins to play.');
            return;
        }
        // Start spin
        // setSpinning(true);
        spinningRef.current = true;
        setWinningCells({});
        setLastSpinWin(0); // Reset last spin win before spinning

        // spin() waits for all spinReel(col) promises:
        // Spin reels (get random results)
        // Calls spinReel(col) for each reel → gives stopping index for each reel.
        // Example: [5, 8, 2] means reel 0 stops at symbol index 5, reel 1 at 8, reel 2 at 2.
        const results = await Promise.all(reels.map((_, col) => spinReel(col)));
        console.log('🎯 Raw results (finalIndex per col):', results);

        // Build new 3x3 grid
        const len = SYMBOLS.length;
        const newGrid = Array.from({ length: ROWS }, () => Array(COLS).fill(""));
        console.log('newGrid', newGrid);

        for (let c = 0; c < COLS; c++) {
            // results[c] is the TOP visible symbol index after spin
            const topIndex = results[c];  // final stop symbol.
            const centerIndex = (topIndex + 1) % len; // symbol below.
            const bottomIndex = (topIndex + 2) % len; // next symbol.

            // Fills newGrid row by row. Ex. Col 0: King, Queen, Ace.
            newGrid[0][c] = SYMBOLS[topIndex];
            newGrid[1][c] = SYMBOLS[centerIndex];
            newGrid[2][c] = SYMBOLS[bottomIndex];

            console.log(
                `Col ${c}: finalIndex=${topIndex} -> top=${SYMBOLS[topIndex]}, center=${SYMBOLS[centerIndex]}, bottom=${SYMBOLS[bottomIndex]}`
            );
        }

        // log by rows
        console.log('🎰 Final Stopped Grid (By Rows):');
        newGrid.forEach((row, r) => {
            console.log(`Row ${r}:`, row);
        });

        // log by columns
        console.log('🎰 Final Stopped Grid (By Columns):');
        for (let c = 0; c < COLS; c++) {
            console.log(`Col ${c}: [${newGrid[0][c]}, ${newGrid[1][c]}, ${newGrid[2][c]}]`);
        }

        // Update state
        setGrid(newGrid);
        setSpinsRemaining((s) => s - 1);
        setPurchasedSpins((p) => Math.max(p - 1, 0)); // Only decrement if purchased spins remain

        // Scatter symbol check
        // scatter logic - Loops through grid → counts how many "Scatter" appear.
        let scatterCount = 0;
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                if (newGrid[r][c] === "Scatter") scatterCount++;
            }
        }

        let winnings = 0;
        let awardedFreeSpins = 0;
        // 2 scatters → small payout.
        if (scatterCount === 2) {
            winnings += PAYOUT["Scatter"][2] || 0;
        } else if (scatterCount >= 3) { //3+ scatters → award free spins.
            awardedFreeSpins += 5;
        }

        // Defines 5 paylines: 3 horizontal, 2 diagonal.
        const lines = [
            [newGrid[0][0], newGrid[0][1], newGrid[0][2]], // top row
            [newGrid[1][0], newGrid[1][1], newGrid[1][2]], // middle row
            [newGrid[2][0], newGrid[2][1], newGrid[2][2]], // bottom row
            [newGrid[0][0], newGrid[1][1], newGrid[2][2]], // diagonal ↘
            [newGrid[0][2], newGrid[1][1], newGrid[2][0]], // diagonal ↙
        ];

        // evaluateLine checks each line (returns type: 0=no win, 2=pair, 3=triple).
        // Collects results for all lines.

        const lineResults = lines.map((ln) => evaluateLine(ln));

        // For each winning line:
        // 3-of-a-kind → add payout or award free spins.
        // 2-of-a-kind → add payout.
        // Records winning line index.

        lineResults.forEach((res, idx) => {
            if (res.type === 0) return;
            const sym = res.symbol;
            if (!sym) return;
            const payoutSpec = PAYOUT[sym];
            if (!payoutSpec) return;
            if (res.type === 3) {
                const p = payoutSpec[3];
                if (typeof p === "number") {
                    // Multiply payout by spinPurchased (the per-spin price)
                    winnings += p * (spinPurchased || 1);
                    console.log(`💰 Line ${idx} 3-of-a-kind ${sym} payout = ${p} x ${spinPurchased || 1}`);
                } else if (typeof p === "string" && p.includes("free spins")) {
                    const n = parseInt(p, 10);
                    if (!isNaN(n)) {
                        awardedFreeSpins += n;
                        console.log(`🎁 Line ${idx} 3-of-a-kind ${sym} → ${n} free spins`);
                    }
                }
            } else if (res.type === 2) {
                const p2 = payoutSpec[2] || 0;
                if (typeof p2 === "number") {
                    winnings += p2;
                    console.log(`💰 Line ${idx} 2-of-a-kind ${sym} payout = ${p2}`);
                }
            }
        });

        // If free spins awarded → add them.
        if (awardedFreeSpins > 0) {
            console.log(`🎁 Awarded extra free spins: +${awardedFreeSpins}`);
            setSpinsRemaining((s) => s + awardedFreeSpins);
        }

        // Check if there was ANY winning line (pair or triple), even if payout = 0
        const hadAnyWin = lineResults.some((res) => res.type > 0);

        // If player won money → add to balance.
        if (winnings > 0) {
            console.log(`💵 Total winnings this spin: ${winnings}`);
            setBalance((b) => Number((b + winnings).toFixed(2)));
            setWinningAmount((b) => Number((b + winnings).toFixed(2)));
            setLastSpinWin(Number(winnings.toFixed(2)));
        } else if (hadAnyWin) {
            console.log("🔸 Matched line(s) but payout = 0 → No deduction");
            setLastSpinWin(0);
        } else {
            // ❌ Truly no win → deduct per spin cost
            if (spinPurchased) {
                setBalance((b) => Number((b - spinPurchased).toFixed(2)));
                console.log(`💸 Deducted spin cost: -${spinPurchased}`);
            }
            setLastSpinWin(0); // No win, set to 0
        }

        // Finds exact cell positions that are part of winning lines.
        // Updates UI highlight state.

        const winCellsObj = computeWinningCellsFromLineResults(lineResults);
        console.log('🏆 Winning cells:', winCellsObj);
        setWinningCells(winCellsObj);

        // Spin complete, unlocks the button.
        // setSpinning(false);
        spinningRef.current = false;
    };


    // Defines ranges for reel scroll animation.
    // Reels move from 0 to -fullHeight to simulate spinning.

    const inputRange = [0, SYMBOLS.length * SYMBOL_HEIGHT];
    const outputRange = [0, -SYMBOLS.length * SYMBOL_HEIGHT];


    // Calculate remaining spin cost
    const remainingSpinCost = spinPurchased && purchasedSpins >= 0
        ? Number((spinPurchased * purchasedSpins).toFixed(2))
        : 0;


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
                onRequestClose={onClose}
            >

                <ImageBackground
                    source={require('../../assets/images/solt-game/slotgame_bg.png')}
                    style={styles.modalContainer}
                    imageStyle={styles.modalContainerBg}
                >
                    <View style={styles.header}>
                        {/* Info Button */}
                        <TouchableOpacity
                            style={styles.infoButton}
                            onPress={() => setShowInfoModal(true)}
                        >
                            <Ionicons name="information-circle" size={28} color="#ffd700" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={28} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.slots}>
                        {reels.map((anim, col) => (
                            <View key={col} style={styles.reel}>
                                <View style={styles.overlayContainer} pointerEvents="none">
                                    {[0, 1, 2].map((row) => {
                                        const key = `${row}-${col}`;
                                        const isWin = !!winningCells[key];
                                        return (
                                            <View
                                                key={row}
                                                style={[
                                                    styles.overlayBox,
                                                    { top: row * SYMBOL_HEIGHT },
                                                    isWin && styles.overlayBoxActive,
                                                ]}
                                            >
                                                {isWin && <Text style={styles.overlayLabel}>WIN</Text>}
                                            </View>
                                        );
                                    })}
                                </View>

                                <Animated.View
                                    style={{
                                        transform: [
                                            {
                                                translateY: anim.interpolate({
                                                    inputRange,
                                                    outputRange,
                                                    extrapolate: 'extend',
                                                }),
                                            },
                                        ],
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
                    <View
                        style={styles.slotFooter}
                    >
                        {/* spin & spins remaining  box */}
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
                                >
                                    {/* <Text>SPIN</Text> */}
                                </ImageBackground>
                            </TouchableOpacity>
                            <View
                                style={styles.spinsRemainingBadge}
                            >
                                <ImageBackground
                                    source={require('../../assets/images/solt-game/spincount_bg.png')}
                                    style={styles.spinsRemainingBadgeImg}
                                    resizeMode="cover"
                                >
                                    <Text style={styles.spinsRemainingText}>{spinsRemaining}</Text>
                                </ImageBackground>
                            </View>
                        </View>
                        {/* wallet & win balance */}
                        <View style={styles.balanceContainer}>
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
                                    <Text style={styles.chipsText}>
                                        {balance.toFixed(2)}
                                    </Text>
                                </ScrollView>
                            </ImageBackground>
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
                                    <Text
                                        style={[styles.winAmountText, {
                                            marginLeft: String(lastSpinWin).length > 4 ? 50 : 30,
                                        }]}>
                                        {lastSpinWin.toFixed(2)}
                                    </Text>
                                </ScrollView>
                            </ImageBackground>
                        </View>
                        {/* buy 10 spin buttons */}
                        {!spinPurchased && (
                            <View style={styles.buyBtnContainer}>
                                {/* $0.20 option */}
                                <TouchableOpacity
                                    style={styles.buyButton}
                                    disabled={hasPurchased}
                                    onPress={() => buySpins(0.2, 0)}
                                >
                                    <ImageBackground
                                        source={hasPurchased
                                            ? require('../../assets/images/solt-game/bet_2_dis.png')
                                            : require('../../assets/images/solt-game/bet_2.png')
                                        }
                                        style={[styles.buyBtnBgImg]}
                                        resizeMode="cover"
                                    >
                                        <Animated.View
                                            style={{
                                                transform: [{ scale: buyButtonBounceAnims[0] }],
                                            }}
                                        >
                                            <Image style={[styles.buyBtnGiftImg,
                                            { opacity: (!hasPurchased || activeButtonIndex === 0) ? 1 : 0.5 },
                                            ]} resizeMode="contain"
                                                source={activeButtonIndex === 0
                                                    ? require('../../assets/images/solt-game/icon_gift_glow.png')
                                                    : require('../../assets/images/solt-game/icon_gift.png')
                                                } />
                                        </Animated.View>
                                    </ImageBackground>

                                </TouchableOpacity>

                                {/* $0.50 option */}
                                <TouchableOpacity
                                    style={styles.buyButton}
                                    onPress={() => buySpins(0.5, 1)}
                                    disabled={hasPurchased}
                                >
                                    <ImageBackground
                                        source={hasPurchased
                                            ? require('../../assets/images/solt-game/bet_5_dis.png')
                                            : require('../../assets/images/solt-game/bet_5.png')
                                        }
                                        style={[styles.buyBtnBgImg]}
                                        resizeMode="cover"
                                    >
                                        <Animated.View
                                            style={{
                                                transform: [{ scale: buyButtonBounceAnims[1] }],
                                            }}
                                        >
                                            <Image style={[styles.buyBtnGiftImg, { opacity: (!hasPurchased || activeButtonIndex === 1) ? 1 : 0.5 },]} resizeMode="contain"
                                                source={activeButtonIndex === 1
                                                    ? require('../../assets/images/solt-game/icon_gift_glow.png')
                                                    : require('../../assets/images/solt-game/icon_gift.png')
                                                } />
                                        </Animated.View>
                                    </ImageBackground>
                                </TouchableOpacity>

                                {/* $1.00 option */}
                                <TouchableOpacity
                                    style={styles.buyButton}
                                    onPress={() => buySpins(1.0, 2)}
                                    disabled={hasPurchased}
                                >
                                    <ImageBackground
                                        source={hasPurchased
                                            ? require('../../assets/images/solt-game/bet_10_dis.png')
                                            : require('../../assets/images/solt-game/bet_10.png')
                                        }
                                        style={[styles.buyBtnBgImg]}
                                        resizeMode="cover"
                                    >
                                        <Animated.View
                                            style={{
                                                transform: [{ scale: buyButtonBounceAnims[2] }],
                                            }}
                                        >
                                            <Image style={[styles.buyBtnGiftImg, { opacity: (!hasPurchased || activeButtonIndex === 2) ? 1 : 0.5 },]} resizeMode="contain"
                                                source={activeButtonIndex === 2
                                                    ? require('../../assets/images/solt-game/icon_gift_glow.png')
                                                    : require('../../assets/images/solt-game/icon_gift.png')
                                                } />
                                        </Animated.View>
                                    </ImageBackground>
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* how many spins purchased , suppose bought 10 spin for $2.00 after one spin it will show 1.8 after second 1.6 */}
                        {hasPurchased && spinPurchased && (
                            <View style={styles.remainingSpinCostBox}>
                                <View style={styles.remainingSpinConstContainer}>
                                    <ImageBackground
                                        source={require('../../assets/images/solt-game/bet_blank.png')}
                                        style={[styles.buyBtnBgImg, { alignItems: 'center', }]}
                                        resizeMode="cover"
                                    >
                                        <ScrollView
                                            horizontal
                                            showsHorizontalScrollIndicator={false}
                                            contentContainerStyle={styles.winAmountScrollBox}
                                        >
                                            <Text style={styles.spinPurchasedText}>
                                                {purchasedSpins <= 0 && spinsRemaining > 0
                                                    ? 'Extra Awarded Free Spins'
                                                    : remainingSpinCost.toFixed(2)}
                                            </Text>
                                        </ScrollView>
                                    </ImageBackground>
                                </View>
                            </View>
                        )}
                    </View>
                </ImageBackground>
            </Modal>


            {/* Info Modal */}
            {showInfoModal && (
                <InfoSlotGameModal
                    visible={showInfoModal}
                    onClose={() => setShowInfoModal(false)}
                />
            )}
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
        alignItems: 'start',
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
        width: SYMBOL_WIDTH * 0.9,   // little padding
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
