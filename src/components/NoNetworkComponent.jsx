import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    Dimensions,
    TouchableOpacity,
    StatusBar,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const { width, height } = Dimensions.get('window');

const NoNetworkComponent = ({ onRetry, isRetrying, retryCount, maxRetries, retryStatus }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const waveAnim1 = useRef(new Animated.Value(0)).current;
    const waveAnim2 = useRef(new Animated.Value(0)).current;
    const waveAnim3 = useRef(new Animated.Value(0)).current;
    const floatAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Initial entrance animation
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 50,
                friction: 7,
                useNativeDriver: true,
            }),
        ]).start();

        // Continuous floating animation
        const floatAnimation = () => {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(floatAnim, {
                        toValue: 1,
                        duration: 3000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(floatAnim, {
                        toValue: 0,
                        duration: 3000,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        };

        // Pulsing animation for the main content
        const pulseAnimation = () => {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.05,
                        duration: 2000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 2000,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        };

        // Wave animations with delays
        const waveAnimation = () => {
            const createWave = (animValue, delay) => {
                Animated.loop(
                    Animated.sequence([
                        Animated.delay(delay),
                        Animated.timing(animValue, {
                            toValue: 1,
                            duration: 1500,
                            useNativeDriver: true,
                        }),
                        Animated.timing(animValue, {
                            toValue: 0,
                            duration: 1500,
                            useNativeDriver: true,
                        }),
                    ])
                ).start();
            };

            createWave(waveAnim1, 0);
            createWave(waveAnim2, 500);
            createWave(waveAnim3, 1000);
        };

        // Rotation animation for decorative elements
        const rotateAnimation = () => {
            Animated.loop(
                Animated.timing(rotateAnim, {
                    toValue: 1,
                    duration: 10000,
                    useNativeDriver: true,
                })
            ).start();
        };

        floatAnimation();
        pulseAnimation();
        waveAnimation();
        rotateAnimation();
    }, []);

    const handleRetry = () => {
        Animated.sequence([
            Animated.timing(scaleAnim, {
                toValue: 0.95,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start();

        if (onRetry) onRetry();
    };

    const spin = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    const floatY = floatAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -10],
    });

    const wave1Scale = waveAnim1.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
    });

    const wave2Scale = waveAnim2.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
    });

    const wave3Scale = waveAnim3.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
    });

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#0a0a0a" />

            {/* Background decorative elements */}
            <View style={styles.backgroundElements}>
                <Animated.View
                    style={[styles.decorativeCircle, styles.circle1, { transform: [{ rotate: spin }] }]}
                />
                <Animated.View
                    style={[styles.decorativeCircle, styles.circle2, { transform: [{ rotate: spin }] }]}
                />
            </View>

            {/* Wave animations */}
            <View style={styles.waveContainer}>
                <Animated.View
                    style={[
                        styles.wave,
                        styles.wave1,
                        {
                            transform: [{ scale: wave1Scale }],
                            opacity: waveAnim1.interpolate({
                                inputRange: [0, 0.5, 1],
                                outputRange: [0, 0.6, 0],
                            }),
                        },
                    ]}
                />
                <Animated.View
                    style={[
                        styles.wave,
                        styles.wave2,
                        {
                            transform: [{ scale: wave2Scale }],
                            opacity: waveAnim2.interpolate({
                                inputRange: [0, 0.5, 1],
                                outputRange: [0, 0.4, 0],
                            }),
                        },
                    ]}
                />
                <Animated.View
                    style={[
                        styles.wave,
                        styles.wave3,
                        {
                            transform: [{ scale: wave3Scale }],
                            opacity: waveAnim3.interpolate({
                                inputRange: [0, 0.5, 1],
                                outputRange: [0, 0.2, 0],
                            }),
                        },
                    ]}
                />
            </View>

            <Animated.View
                style={[
                    styles.content,
                    // {
                    //     opacity: fadeAnim,
                    //     transform: [{ scale: scaleAnim }, { scale: pulseAnim }, { translateY: floatY }],
                    // },
                ]}
            >
                {/* Streaming Icon */}
                <View style={styles.iconContainer}>
                    <View style={styles.streamingIcon}>
                        <View style={styles.playTriangle} />
                        <View style={styles.signalBars}>
                            <View style={[styles.signalBar, styles.bar1]} />
                            <View style={[styles.signalBar, styles.bar2]} />
                            <View style={[styles.signalBar, styles.bar3]} />
                        </View>
                        <View style={styles.disconnectedLine} />
                    </View>
                </View>

                {/* Title */}
                <Text style={styles.title}>Connection Lost</Text>

                {/* Subtitle */}
                <Text style={styles.subtitle}>
                    Unable to stream content right now.{'\n'}
                    Check your internet connection and try again.
                </Text>

                {/* Status indicator */}
                <View style={styles.statusContainer}>
                    <View style={styles.statusDot} />
                    <Text style={styles.statusText}>
                        {retryStatus || `Offline (Attempts: ${retryCount}/${maxRetries})`}
                    </Text>
                </View>

                {/* Retry Button */}
                <TouchableOpacity
                    style={[styles.retryButton, isRetrying && styles.retryButtonDisabled]}
                    onPress={handleRetry}
                    activeOpacity={0.8}
                    disabled={isRetrying || retryCount >= maxRetries}
                >
                    <View style={styles.buttonContent}>
                        <Text style={styles.retryText}>
                            {isRetrying ? 'Retrying...' : 'Retry Connection'}
                        </Text>
                        <Ionicons name="refresh" size={20} color="#fff" />
                    </View>
                </TouchableOpacity>

                {/* Troubleshooting Tips */}
                <View style={styles.tipsContainer}>
                    <Text style={styles.tipsTitle}>Troubleshooting:</Text>
                    <View style={styles.tipItem}>
                        <View style={styles.tipBullet} />
                        <Text style={styles.tipText}>Check your WiFi or mobile data</Text>
                    </View>
                    <View style={styles.tipItem}>
                        <View style={styles.tipBullet} />
                        <Text style={styles.tipText}>Move closer to your router</Text>
                    </View>
                    <View style={styles.tipItem}>
                        <View style={styles.tipBullet} />
                        <Text style={styles.tipText}>Restart your network connection</Text>
                    </View>
                </View>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a0a',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    backgroundElements: {
        position: 'absolute',
        width: '100%',
        height: '100%',
    },
    decorativeCircle: {
        position: 'absolute',
        borderWidth: 1,
        borderRadius: 100,
        borderColor: 'rgba(255, 107, 107, 0.1)',
    },
    circle1: {
        width: 200,
        height: 200,
        top: '10%',
        right: -50,
    },
    circle2: {
        width: 150,
        height: 150,
        bottom: '15%',
        left: -30,
        borderColor: 'rgba(116, 75, 162, 0.1)',
    },
    waveContainer: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    wave: {
        position: 'absolute',
        borderRadius: 200,
        borderWidth: 2,
    },
    wave1: {
        width: 150,
        height: 150,
        borderColor: '#ff6b6b',
    },
    wave2: {
        width: 200,
        height: 200,
        borderColor: '#764ba2',
    },
    wave3: {
        width: 250,
        height: 250,
        borderColor: '#667eea',
    },
    content: {
        alignItems: 'center',
        width: '100%',
        maxWidth: 350,
        zIndex: 1,
    },
    iconContainer: {
        marginBottom: 30,
        padding: 25,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 90,
        borderWidth: 2,
        borderColor: 'rgba(255, 107, 107, 0.3)',
    },
    streamingIcon: {
        width: 90,
        height: 90,
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
    },
    playTriangle: {
        width: 0,
        height: 0,
        borderLeftWidth: 25,
        borderRightWidth: 0,
        borderTopWidth: 15,
        borderBottomWidth: 15,
        borderLeftColor: '#ff6b6b',
        borderRightColor: 'transparent',
        borderTopColor: 'transparent',
        borderBottomColor: 'transparent',
        marginRight: -8,
    },
    signalBars: {
        position: 'absolute',
        top: 10,
        right: 10,
        flexDirection: 'row',
        alignItems: 'flex-end',
    },
    signalBar: {
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        marginHorizontal: 1,
        borderRadius: 1,
    },
    bar1: { width: 3, height: 8 },
    bar2: { width: 3, height: 12 },
    bar3: { width: 3, height: 16 },
    disconnectedLine: {
        position: 'absolute',
        width: 100,
        height: 3,
        backgroundColor: '#ff6b6b',
        borderRadius: 2,
        transform: [{ rotate: '45deg' }],
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#ffffff',
        textAlign: 'center',
        marginBottom: 15,
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    subtitle: {
        fontSize: 18,
        color: 'rgba(255, 255, 255, 0.7)',
        textAlign: 'center',
        lineHeight: 26,
        marginBottom: 25,
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 35,
        paddingHorizontal: 15,
        paddingVertical: 8,
        backgroundColor: 'rgba(255, 107, 107, 0.1)',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 107, 107, 0.3)',
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#ff6b6b',
        marginRight: 8,
    },
    statusText: {
        color: '#ff6b6b',
        fontSize: 14,
        fontWeight: '600',
    },
    retryButton: {
        width: '85%',
        marginBottom: 30,
        backgroundColor: '#ff6b6b',
        borderRadius: 30,
        shadowColor: '#ff6b6b',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    retryButtonDisabled: {
        backgroundColor: '#ff6b6b80',
        opacity: 0.6,
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 30,
    },
    retryText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: '600',
        marginRight: 10,
    },
    tipsContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 20,
        padding: 25,
        width: '100%',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    tipsTitle: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 15,
        textAlign: 'center',
    },
    tipItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    tipBullet: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#ff6b6b',
        marginRight: 12,
    },
    tipText: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 15,
        flex: 1,
    },
});

export default NoNetworkComponent;