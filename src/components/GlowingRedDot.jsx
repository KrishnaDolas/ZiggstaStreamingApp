import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
    withSequence,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

// Create animated component
const AnimatedView = Animated.createAnimatedComponent(View);

// Add this component where you need the glowing red dot
function GlowingRedDot() {
    const scale = useSharedValue(1);
    const opacity = useSharedValue(1);

    useEffect(() => {
        // Pulsing scale animation
        scale.value = withRepeat(
            withSequence(
                withTiming(1.3, { duration: 800 }),
                withTiming(1, { duration: 800 })
            ),
            -1,
            false
        );

        // Pulsing opacity for glow effect
        opacity.value = withRepeat(
            withSequence(
                withTiming(0.4, { duration: 800 }),
                withTiming(1, { duration: 800 })
            ),
            -1,
            false
        );
    }, []);

    const glowAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: opacity.value,
    }));

    const dotAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: 1 + (scale.value - 1) * 0.3 }],
    }));

    return (
        <View style={styles.redDotContainer}>
            {/* Outer glow layer */}
            <AnimatedView style={[styles.glowOuter, glowAnimatedStyle]} />

            {/* Middle glow layer */}
            <AnimatedView style={[styles.glowMiddle, glowAnimatedStyle]} />

            {/* Main red dot */}
            <AnimatedView style={[styles.redDot, dotAnimatedStyle]} />
        </View>
    );
}


// Updated styles
const styles = StyleSheet.create({
    redDotContainer: {
        position: 'absolute',
        top: -5,
        right: -5,
        width: 20,
        height: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    glowOuter: {
        position: 'absolute',
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#FF0000',
        opacity: 0.3,
    },
    glowMiddle: {
        position: 'absolute',
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: '#FF4444',
        opacity: 0.5,
    },
    redDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#FF0000',
        borderWidth: 1.5,
        borderColor: '#FFF',
        shadowColor: '#FF0000',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 4,
        elevation: 5,
    },
});


export default GlowingRedDot;