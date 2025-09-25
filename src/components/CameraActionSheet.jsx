import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    Animated,
    StyleSheet,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import Colors from '../../assets/styles/Colors';
import { useAppContext } from '../context/AppContext';


const CameraActionSheet = ({
    visible,
    onClose,
    title = 'Select Option',
    options = [],
    theme = 'light'
}) => {
    const slideAnim = useRef(new Animated.Value(0)).current;
    const { onSelectImage } = useAppContext();

    useEffect(() => {
        if (visible) {
            Animated.spring(slideAnim, {
                toValue: 1,
                useNativeDriver: true,
                tension: 100,
                friction: 8,
            }).start();
        } else {
            Animated.spring(slideAnim, {
                toValue: 0,
                useNativeDriver: true,
                tension: 100,
                friction: 8,
            }).start();
        }
    }, [visible]);


    const handleOptionPress = async (index) => {
        if (index === 0) {
            await onSelectImage('camera');
        } else if (index === 1) {
            await onSelectImage('gallery');
        }
        onClose();
    };

    const translateY = slideAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [300, 0],
    });

    const opacity = slideAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
    });

    const getIconForOption = (optionText) => {
        const text = optionText.toLowerCase();
        if (text.includes('camera') || text.includes('photo')) return 'camera';
        if (text.includes('gallery') || text.includes('library')) return 'images';
        if (text.includes('cancel')) return 'close';
        return 'ellipsis-horizontal';
    };

    const getColorForOption = (optionText, index) => {
        const text = optionText.toLowerCase();
        if (text.includes('cancel')) return '#FF6B6B';
        if (index === 0) return '#4ECDC4';
        if (index === 1) return '#45B7D1';
        return '#96CEB4';
    };



    return (
        <Modal
            transparent
            visible={visible}
            animationType="none"
            onRequestClose={onClose}
        >
            <TouchableOpacity
                style={styles.overlay}
                activeOpacity={1}
                onPress={onClose}
            >
                <Animated.View
                    style={[
                        styles.container,
                        {
                            backgroundColor: theme === 'dark' ? Colors.blackModalBgColor : '#FFFFFF',
                            transform: [{ translateY }],
                            opacity,
                        }
                    ]}
                >
                    {/* Handle Bar */}
                    <View style={styles.handleBar} />

                    {/* Title */}
                    <View style={styles.titleContainer}>
                        <Text style={[
                            styles.title,
                            { color: theme === 'dark' ? '#FFFFFF' : '#000000' }
                        ]}>
                            {title}
                        </Text>
                    </View>

                    {/* Options */}
                    <View style={styles.optionsContainer}>
                        {options.map((option, index) => {
                            if (option === 'Cancel') return null; // We'll handle cancel separately

                            const iconColor = getColorForOption(option, index);

                            return (
                                <TouchableOpacity
                                    key={index}
                                    style={[
                                        styles.optionButton,
                                        {
                                            borderBottomWidth: index === options.length - 2 ? 0 : 1,
                                            borderBottomColor: theme === 'dark' ? '#3A3A3C' : '#E5E5EA'
                                        }
                                    ]}
                                    onPress={() => handleOptionPress(index)}
                                    activeOpacity={0.7}
                                >
                                    <LinearGradient
                                        colors={[iconColor + '20', iconColor + '10']}
                                        style={styles.iconContainer}
                                    >
                                        <Ionicons
                                            name={getIconForOption(option)}
                                            size={24}
                                            color={iconColor}
                                        />
                                    </LinearGradient>

                                    <Text style={[
                                        styles.optionText,
                                        { color: theme === 'dark' ? '#FFFFFF' : '#000000' }
                                    ]}>
                                        {option}
                                    </Text>

                                    <Ionicons
                                        name="chevron-forward"
                                        size={20}
                                        color={theme === 'dark' ? '#8E8E93' : '#C7C7CC'}
                                    />
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {/* Cancel Button */}
                    <TouchableOpacity
                        style={[
                            styles.cancelButton,
                            {
                                backgroundColor: theme === 'dark' ? Colors.blackBtnBg : '#F2F2F7',
                                marginTop: 12
                            }
                        ]}
                        onPress={onClose}
                        activeOpacity={0.7}
                    >
                        <Ionicons
                            name="close-circle"
                            size={24}
                            color="#FF6B6B"
                            style={styles.cancelIcon}
                        />
                        <Text style={[
                            styles.cancelText,
                            { color: theme === 'dark' ? '#FFFFFF' : '#000000' }
                        ]}>
                            Cancel
                        </Text>
                    </TouchableOpacity>
                </Animated.View>
            </TouchableOpacity>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    container: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingBottom: 34, // Safe area for iPhone
        paddingHorizontal: 20,
        paddingTop: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: -4,
        },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 8,
    },
    handleBar: {
        width: 40,
        height: 4,
        backgroundColor: '#C7C7CC',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 20,
    },
    titleContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    optionsContainer: {
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 8,
    },
    optionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 4,
        minHeight: 60,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    optionText: {
        flex: 1,
        fontSize: 17,
        fontWeight: '500',
        letterSpacing: 0.3,
    },
    cancelButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 16,
        minHeight: 56,
    },
    cancelIcon: {
        marginRight: 8,
    },
    cancelText: {
        fontSize: 17,
        fontWeight: '600',
        letterSpacing: 0.3,
    },
});

export default CameraActionSheet;