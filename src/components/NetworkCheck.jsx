/* eslint-disable react/no-unstable-nested-components */
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    Animated,
    Dimensions
} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');

const NetworkCheck = ({ visible = true, onReconnect }) => {
    const [checking, setChecking] = useState(false);
    const [pulseAnim] = useState(new Animated.Value(1));
    const [fadeAnim] = useState(new Animated.Value(0));

    useEffect(() => {
        if (visible) {
            // Fade in animation
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();

            // Continuous pulse animation for the icon
            const pulse = () => {
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.2,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                ]).start(() => pulse());
            };
            pulse();
        }
    }, [visible]);

    const handleRetry = async () => {
        setChecking(true);

        // Add a slight delay for better UX
        setTimeout(async () => {
            const state = await NetInfo.fetch();
            if (state.isConnected) {
                console.log("✅ Back Online");
                onReconnect && onReconnect();
            }
            setChecking(false);
        }, 1500);
    };

    const LoadingDots = () => {
        const [dots, setDots] = useState('');

        useEffect(() => {
            if (checking) {
                const interval = setInterval(() => {
                    setDots(prev => prev.length >= 3 ? '' : prev + '.');
                }, 500);
                return () => clearInterval(interval);
            }
        }, [checking]);

        return <Text style={styles.dots}>{dots}</Text>;
    };

    return (
        <Modal
            visible={visible}
            animationType="none"
            transparent={true}
            statusBarTranslucent={true}
        >
            <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
                {/* Background blur effect */}
                <View style={styles.blurBackground} />

                <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
                    <LinearGradient
                        colors={['#1a1a2e', '#16213e', '#0f0f23']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.card}
                    >
                        {/* Decorative top bar */}
                        <LinearGradient
                            colors={['#ff6b6b', '#ee5a24', '#ff3742']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.topBar}
                        />

                        {/* Main content */}
                        <View style={styles.content}>
                            {/* Animated icon with glow effect */}
                            <Animated.View style={[
                                styles.iconContainer,
                                { transform: [{ scale: pulseAnim }] }
                            ]}>
                                <LinearGradient
                                    colors={['#ff6b6b', '#ee5a24']}
                                    style={styles.iconGradient}
                                >
                                    <Icon name="wifi-off" size={50} color="#ffffff" />
                                </LinearGradient>

                                {/* Signal waves animation */}
                                <View style={styles.waveContainer}>
                                    <View style={[styles.wave, styles.wave1]} />
                                    <View style={[styles.wave, styles.wave2]} />
                                    <View style={[styles.wave, styles.wave3]} />
                                </View>
                            </Animated.View>

                            {/* Title with video chat theme */}
                            <Text style={styles.title}>Connection Lost</Text>
                            <Text style={styles.subtitle}>
                                Unable to connect. Check your internet and try again.
                            </Text>

                            {/* Connection details */}
                            <View style={styles.detailsContainer}>
                                <View style={styles.detailItem}>
                                    <Icon name="wifi-strength-off" size={20} color="#ff6b6b" />
                                    <Text style={styles.detailText}>No Internet Connection</Text>
                                </View>
                                <View style={styles.detailItem}>
                                    <Icon name="video-off" size={20} color="#74b9ff" />
                                    <Text style={styles.detailText}>Video Chat Disconnected</Text>
                                </View>
                            </View>

                            {/* Action buttons */}
                            <View style={styles.buttonContainer}>
                                <TouchableOpacity
                                    style={[styles.retryButton, checking && styles.retryButtonDisabled]}
                                    onPress={handleRetry}
                                    disabled={checking}
                                    activeOpacity={0.8}
                                >
                                    <LinearGradient
                                        colors={checking ? ['#636e72', '#636e72'] : ['#ff6b6b', '#ee5a24']}
                                        style={styles.buttonGradient}
                                    >
                                        <View style={styles.buttonContent}>
                                            {checking ? (
                                                <>
                                                    <Icon name="loading" size={20} color="#ffffff" />
                                                    <Text style={styles.buttonText}>
                                                        Reconnecting<LoadingDots />
                                                    </Text>
                                                </>
                                            ) : (
                                                <>
                                                    <Icon name="refresh" size={20} color="#ffffff" />
                                                    <Text style={styles.buttonText}>Try Again</Text>
                                                </>
                                            )}
                                        </View>
                                    </LinearGradient>
                                </TouchableOpacity>

                                {/* Settings hint */}
                                <View style={styles.helpTextContainer}>
                                    <Text style={styles.helpText}>
                                        Make sure you have a stable internet connection
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </LinearGradient>
                </Animated.View>
            </Animated.View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    blurBackground: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
    container: {
        width: width * 0.9,
        maxWidth: 400,
    },
    card: {
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 20,
    },
    topBar: {
        height: 4,
        width: '100%',
    },
    content: {
        padding: 30,
        alignItems: 'center',
    },
    iconContainer: {
        position: 'relative',
        marginBottom: 25,
    },
    iconGradient: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#ff6b6b',
        shadowOffset: {
            width: 0,
            height: 0,
        },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
    },
    waveContainer: {
        position: 'absolute',
        top: -20,
        left: -20,
        right: -20,
        bottom: -20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    wave: {
        position: 'absolute',
        borderWidth: 2,
        borderColor: '#ff6b6b',
        borderRadius: 70,
        opacity: 0.3,
    },
    wave1: {
        width: 120,
        height: 120,
    },
    wave2: {
        width: 140,
        height: 140,
        opacity: 0.2,
    },
    wave3: {
        width: 160,
        height: 160,
        opacity: 0.1,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: '#ffffff',
        marginBottom: 8,
        textAlign: 'center',
        letterSpacing: 0.5,
    },
    subtitle: {
        fontSize: 16,
        color: '#b2bec3',
        textAlign: 'center',
        marginBottom: 25,
        lineHeight: 22,
        opacity: 0.9,
    },
    detailsContainer: {
        width: '100%',
        marginBottom: 30,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        paddingHorizontal: 5,
    },
    detailText: {
        fontSize: 15,
        color: '#ddd',
        marginLeft: 12,
        fontWeight: '500',
    },
    buttonContainer: {
        width: '100%',
        alignItems: 'center',
    },
    retryButton: {
        width: '100%',
        borderRadius: 25,
        overflow: 'hidden',
        marginBottom: 15,
        shadowColor: '#ff6b6b',
        shadowOffset: {
            width: 0,
            height: 5,
        },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 8,
    },
    retryButtonDisabled: {
        shadowOpacity: 0,
        elevation: 0,
    },
    buttonGradient: {
        paddingVertical: 15,
        paddingHorizontal: 30,
    },
    buttonContent: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        color: '#ffffff',
        fontWeight: '700',
        fontSize: 17,
        marginLeft: 8,
        letterSpacing: 0.5,
    },
    dots: {
        color: '#ffffff',
        fontWeight: '700',
        fontSize: 17,
        width: 20,
    },
    settingsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 20,
        backgroundColor: 'rgba(116, 185, 255, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(116, 185, 255, 0.3)',
    },
    settingsText: {
        color: '#74b9ff',
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 8,
    },
    helpTextContainer: {
        marginTop: 5,
        paddingHorizontal: 10,
    },
    helpText: {
        color: '#b2bec3',
        fontSize: 14,
        textAlign: 'center',
        opacity: 0.8,
        fontWeight: '400',
    },
});

export default NetworkCheck;