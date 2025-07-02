/* eslint-disable react-native/no-inline-styles */
// components/ProfileSettingModal.js
import React, { useContext, useLayoutEffect, useRef, useState } from 'react';
import { View, TouchableOpacity, Text, Animated, Image } from 'react-native';
import Modal from 'react-native-modal';
import { styles } from '../../assets/styles/ThemeStyles';
import { ThemeContext } from '../context/ThemeContext';
import { Dimensions, ScrollView } from 'react-native';
import { PanResponder } from 'react-native';


const ProfileScreenModal = ({ visible, onClose }) => {
    const { theme, toggleTheme } = useContext(ThemeContext);
    const screenHeight = Dimensions.get('window').height;
    const [layoutReady, setLayoutReady] = useState(false);
    const panY = useRef(new Animated.Value(0)).current;


    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: (_, gestureState) => {
                return Math.abs(gestureState.dy) > 5;
            },
            onPanResponderMove: Animated.event(
                [null, { dy: panY }],
                { useNativeDriver: false }
            ),
            onPanResponderRelease: (_, gesture) => {
                if (gesture.dy > 120) {
                    onClose(); // dismiss if dragged down enough
                } else {
                    Animated.spring(panY, {
                        toValue: 0,
                        useNativeDriver: false,
                    }).start();
                }
            },
        })
    ).current;


    useLayoutEffect(() => {
        if (visible) {
            setLayoutReady(true);
        } else {
            setLayoutReady(false);
        }
    }, [visible]);

    return (
        <>
            {layoutReady &&
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
                    style={[styles.profileModalMain]}
                >
                    <Animated.View
                        style={[
                            styles.profileModalOverlay,
                            { flex: 1, maxHeight: screenHeight * 0.8 },
                            { transform: [{ translateY: panY }] },
                        ]}
                        {...panResponder.panHandlers}
                    >
                        {/* close modal */}
                        {/* <TouchableOpacity onPress={onClose} style={styles.profileModalClose}>
                            <Ionicons name="close" size={23} color="#333" />
                        </TouchableOpacity> */}
                        <View style={[{ marginHorizontal: 0 }]}>
                            <ScrollView
                                // contentContainerStyle={{ paddingBottom: 20 }}
                                showsVerticalScrollIndicator={true}
                            >
                                {/* Header with Report button */}
                                <View style={styles.psmHeader}>
                                    <TouchableOpacity style={styles.psmReportButton}>
                                        <Text style={styles.psmReportButtonText}>Report</Text>
                                    </TouchableOpacity>
                                </View>

                                {/* Profile Content */}
                                <View style={styles.psmProfileContainer}>
                                    <View style={styles.psmProfileTopCard}>
                                        {/* Profile Image */}
                                        <View style={styles.psmProfileImageContainer}>
                                            <Image
                                                source={require('../../assets/images/LS-3.jpg')}
                                                style={styles.psmProfileImage}
                                            />
                                        </View>

                                        {/* Name and ID */}
                                        <Text style={styles.psmProfileName}>Katherine Ziggler</Text>
                                        <Text style={styles.psmProfileId}>ID: 1298786</Text>

                                        {/* Stats Section */}
                                        <View style={styles.psmStatsContainer}>
                                            <View style={styles.psmStatItem}>
                                                <Text style={styles.psmStatLabel}>FRIENDS</Text>
                                                <Text style={styles.psmStatValue}>4k1</Text>
                                            </View>
                                            <View style={styles.psmStatItem}>
                                                <Text style={styles.psmStatLabel}>FOLLOWING</Text>
                                                <Text style={styles.psmStatValue}>1K2</Text>
                                            </View>
                                            <View style={styles.psmStatItem}>
                                                <Text style={styles.psmStatLabel}>FANS</Text>
                                                <Text style={styles.psmStatValue}>800</Text>
                                            </View>
                                        </View>
                                    </View>
                                    {/* Social Media Icons */}
                                    {/* <View style={styles.psmSocialContainer}>
                                        <TouchableOpacity style={styles.psmSocialButton}>
                                            <View style={styles.psmInstagramIcon}>
                                                <Text style={styles.psmSocialIconText}>📷</Text>
                                            </View>
                                        </TouchableOpacity>

                                        <TouchableOpacity style={styles.psmSocialButton}>
                                            <View style={styles.psmFacebookIcon}>
                                                <Text style={styles.psmSocialIconText}>f</Text>
                                            </View>
                                        </TouchableOpacity>

                                        <TouchableOpacity style={styles.psmSocialButton}>
                                            <View style={styles.psmTwitterIcon}>
                                                <Text style={styles.psmSocialIconText}>𝕏</Text>
                                            </View>
                                        </TouchableOpacity>
                                    </View> */}
                                </View>
                            </ScrollView>

                        </View>

                    </Animated.View>
                </Modal>
            }

        </>

    );
};

export default ProfileScreenModal;
