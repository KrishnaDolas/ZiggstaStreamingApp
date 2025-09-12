import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Image,
    ScrollView,
} from 'react-native';
import Modal from 'react-native-modal';
import Ionicons from 'react-native-vector-icons/Ionicons';


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


export default function InfoSlotGameModal({ visible, onClose }) {
    return (
        <>
            {/* Info Modal */}
            <Modal
                isVisible={visible}
                onBackdropPress={onClose}
                animationIn="zoomIn"
                animationOut="zoomOut"
                animationInTiming={300}
                animationOutTiming={200}
                useNativeDriver={true}
                backdropOpacity={0.8}
                style={styles.infoModalStyle}
                onRequestClose={onClose}
            >
                <View style={styles.infoModalContainer}>
                    <View style={styles.infoModalHeader}>
                        <Text style={styles.infoModalTitle}>How to Play</Text>
                        <TouchableOpacity
                            style={styles.infoCloseButton}
                            onPress={onClose}
                        >
                            <Ionicons name="close" size={24} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.infoModalContent} showsVerticalScrollIndicator={false}>
                        {/* Game Instructions Image */}
                        <View style={styles.infoImageContainer}>
                            <Image
                                source={require('../../assets/images/solt-game/game_ui.png')}
                                style={styles.infoInstructionImage}
                                resizeMode="contain"
                            />
                        </View>

                        {/* Game Rules */}
                        <View style={styles.infoTextContainer}>
                            <Text style={styles.infoSectionTitle}>Game Rules:</Text>

                            <View style={styles.infoRule}>
                                <Text style={styles.infoRuleBullet}>• </Text>
                                <Text style={styles.infoRuleText}>Purchase 10 spins to play ($0.20, $0.50, or $1.00 per spin).</Text>
                            </View>

                            <View style={styles.infoRule}>
                                <Text style={styles.infoRuleBullet}>• </Text>
                                <Text style={styles.infoRuleText}>Match 2 or 3 symbols in a row to win</Text>
                            </View>

                            <View style={styles.infoRule}>
                                <Text style={styles.infoRuleBullet}>• </Text>
                                <Text style={styles.infoRuleText}>Wild symbols substitute for any symbol</Text>
                            </View>

                            <View style={styles.infoRule}>
                                <Text style={styles.infoRuleBullet}>• </Text>
                                <Text style={styles.infoRuleText}>3 or more Scatter symbols award free spins</Text>
                            </View>

                            <View style={styles.infoRule}>
                                <Text style={styles.infoRuleBullet}>• </Text>
                                <Text style={styles.infoRuleText}>Higher bet = higher potential winnings</Text>
                            </View>

                            <Text style={styles.infoSectionTitle}>Paylines:</Text>
                            <View style={styles.infoRule}>
                                <Text style={styles.infoRuleBullet}>• </Text>
                                <Text style={styles.infoRuleText}>3 Horizontal lines (top, middle, bottom)</Text>
                            </View>
                            <View style={styles.infoRule}>
                                <Text style={styles.infoRuleBullet}>• </Text>
                                <Text style={styles.infoRuleText}>2 Diagonal lines (left-to-right, right-to-left)</Text>
                            </View>

                            <Text style={styles.infoSectionTitle}>Symbol Payouts:</Text>
                            <View style={styles.payoutContainer}>
                                <View style={styles.payoutRow}>
                                    <Image source={symbolIcons.Seven} style={styles.payoutSymbol} />
                                    <Text style={styles.payoutText}>Seven: 2.5x / 10x</Text>
                                </View>
                                <View style={styles.payoutRow}>
                                    <Image source={symbolIcons.Star} style={styles.payoutSymbol} />
                                    <Text style={styles.payoutText}>Star: 1x / 5x</Text>
                                </View>
                                <View style={styles.payoutRow}>
                                    <Image source={symbolIcons.Gift} style={styles.payoutSymbol} />
                                    <Text style={styles.payoutText}>Gift: 1x / 5x</Text>
                                </View>
                                <View style={styles.payoutRow}>
                                    <Image source={symbolIcons.Scatter} style={styles.payoutSymbol} />
                                    <Text style={styles.payoutText}>Scatter: 1x / Free Spins</Text>
                                </View>
                                <View style={styles.payoutRow}>
                                    <Image source={symbolIcons.Cherry} style={styles.payoutSymbol} />
                                    <Text style={styles.payoutText}>Cherry: 1x / 3x</Text>
                                </View>
                                <View style={styles.payoutRow}>
                                    <Image source={symbolIcons.Ace} style={styles.payoutSymbol} />
                                    <Text style={styles.payoutText}>Ace: 0x / 3x</Text>
                                </View>
                                <View style={styles.payoutRow}>
                                    <Image source={symbolIcons.King} style={styles.payoutSymbol} />
                                    <Text style={styles.payoutText}>King: 0x / 2x</Text>
                                </View>
                                <View style={styles.payoutRow}>
                                    <Image source={symbolIcons.Queen} style={styles.payoutSymbol} />
                                    <Text style={styles.payoutText}>Queen: 0x / 2x</Text>
                                </View>
                            </View>
                        </View>
                    </ScrollView>
                </View>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    // Info Modal Styles
    infoModalStyle: {
        justifyContent: 'center',
        alignItems: 'center',
        margin: 20,
    },
    infoModalContainer: {
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        borderRadius: 20,
        width: '100%',
        maxHeight: '80%',
        borderWidth: 2,
        borderColor: '#ffd700',
    },
    infoModalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    infoModalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#ffd700',
        textShadowColor: '#000',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    infoCloseButton: {
        padding: 5,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 15,
    },
    infoModalContent: {
        padding: 20,
    },
    infoImageContainer: {
        alignItems: 'center',
        marginBottom: 20,
        backgroundColor: 'rgba(255, 215, 0, 0.1)',
        borderRadius: 10,
        padding: 10,
    },
    infoInstructionImage: {
        width: '100%',
        height: 200,
    },
    infoTextContainer: {
        paddingHorizontal: 10,
    },
    infoSectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#ffd700',
        marginTop: 15,
        marginBottom: 10,
        textShadowColor: '#000',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    infoRule: {
        flexDirection: 'row',
        marginBottom: 8,
        alignItems: 'flex-start',
    },
    infoRuleBullet: {
        color: '#ffd700',
        fontSize: 16,
        fontWeight: 'bold',
        marginRight: 5,
    },
    infoRuleText: {
        color: '#fff',
        fontSize: 14,
        flex: 1,
        lineHeight: 20,
    },
    payoutContainer: {
        marginTop: 10,
        paddingBottom: 30,
    },
    payoutRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        backgroundColor: 'rgba(255, 215, 0, 0.1)',
        padding: 8,
        borderRadius: 8,
    },
    payoutSymbol: {
        width: 30,
        height: 30,
        marginRight: 15,
        resizeMode: 'contain',
    },
    payoutText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
});
