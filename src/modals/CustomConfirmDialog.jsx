
import React, { useContext, useEffect } from 'react';
import Modal from 'react-native-modal';
import {
    // Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    Animated,
    TouchableWithoutFeedback,
} from 'react-native';
import { ThemeContext } from '../context/ThemeContext';
import Colors from '../../assets/styles/Colors';

const { width } = Dimensions.get('window');

const CustomConfirmDialog = ({
    visible,
    title,
    message,
    onCancel,
    onConfirm,
    cancelText = 'Cancel',
    confirmText = 'OK',
}) => {
    const { theme } = useContext(ThemeContext);
    const scaleValue = React.useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.spring(scaleValue, {
                toValue: 1,
                friction: 6,
                tension: 50,
                useNativeDriver: true,
            }).start();
        } else {
            scaleValue.setValue(0);
        }
    }, [visible]);


    return (
        <Modal
            isVisible={visible}
            backdropOpacity={0.7}
            animationIn="zoomIn"
            animationOut="zoomOut"
            useNativeDriver
            onBackdropPress={onCancel}
            avoidKeyboard
            statusBarTranslucent
        >
            {/* <TouchableWithoutFeedback onPress={onCancel}>
                <View style={styles.overlay}> */}
            {/* Backdrop blur effect - you can remove this if @react-native-community/blur is not available */}
            {/* <View style={styles.backdrop} /> */}

            <Animated.View
                style={[
                    styles.dialogContainer,
                    theme === 'dark' && styles.dialogContainerDark,
                    { transform: [{ scale: scaleValue }] },
                ]}
            >
                {/* Dialog Header */}
                <View style={[styles.header, theme === 'dark' && styles.headerDark]}>
                    <Text style={[styles.title, theme === 'dark' && styles.titleDark]}>{title}</Text>
                </View>

                {/* Dialog Body */}
                <View style={[styles.body, theme === 'dark' && styles.bodyDark]}>
                    <Text style={[styles.message, theme === 'dark' && styles.messageDark]}>{message}</Text>
                </View>

                {/* Dialog Footer */}
                <View style={[styles.footer, theme === 'dark' && styles.footerDark]}>
                    <TouchableOpacity
                        style={[
                            styles.button,
                            styles.cancelButton,
                            theme === 'dark' && styles.cancelButtonDark
                        ]}
                        onPress={onCancel}
                        activeOpacity={0.8}
                    >
                        <Text style={[
                            styles.cancelButtonText,
                            theme === 'dark' && styles.cancelButtonTextDark
                        ]}>
                            {cancelText}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.button,
                            styles.confirmButton,
                            theme === 'dark' && styles.confirmButtonDark
                        ]}
                        onPress={onConfirm}
                        activeOpacity={0.8}
                    >
                        <Text style={[
                            styles.confirmButtonText,
                            theme === 'dark' && styles.confirmButtonTextDark
                        ]}>
                            {confirmText}
                        </Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>
            {/* </View>
            </TouchableWithoutFeedback> */}
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    backdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    // Light Theme Styles
    dialogContainer: {
        backgroundColor: '#ffffff',
        borderRadius: 20,
        width: width * 0.85,
        maxWidth: 400,
        overflow: 'hidden',
        alignSelf: 'center',
        paddingBottom: 10,
    },
    header: {
        paddingTop: 25,
        paddingBottom: 10,
        backgroundColor: '#fff',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1a1a1a',
        textAlign: 'center',
        letterSpacing: 0.5,
    },
    body: {
        paddingHorizontal: 25,
        paddingBottom: 30,
        backgroundColor: '#fff',
    },
    message: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        lineHeight: 24,
        marginTop: 10,
    },
    footer: {
        flexDirection: 'row',
        backgroundColor: '#f8f9fa',
        borderTopWidth: 1,
        borderTopColor: '#e9ecef',
    },
    button: {
        flex: 1,
        paddingVertical: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: 'transparent',
        borderRightWidth: 1,
        borderRightColor: '#e9ecef',
    },
    confirmButton: {
        backgroundColor: 'transparent',
    },
    cancelButtonText: {
        fontSize: 17,
        color: '#6c757d',
        fontWeight: '600',
    },
    confirmButtonText: {
        fontSize: 17,
        color: '#007AFF',
        fontWeight: '600',
    },

    // Dark Theme Styles
    dialogContainerDark: {
        backgroundColor: Colors.blackModalBgColor,
        shadowColor: '#000',
        shadowOpacity: 0.5,
    },
    headerDark: {
        backgroundColor: Colors.blackCardColor,
    },
    titleDark: {
        color: '#ffffff',
    },
    bodyDark: {
        backgroundColor: Colors.blackCardColor,
    },
    messageDark: {
        color: '#a1a1a6',
    },
    footerDark: {
        backgroundColor: Colors.blackBtnBg,
        borderTopColor: Colors.blackDividers,
    },
    cancelButtonDark: {
        borderRightColor: '#38383a',
    },
    confirmButtonDark: {
        backgroundColor: 'transparent',
    },
    cancelButtonTextDark: {
        color: '#a1a1a6',
    },
    confirmButtonTextDark: {
        color: '#0a84ff',
    },
});

export default CustomConfirmDialog;