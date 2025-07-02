/* eslint-disable react-native/no-inline-styles */
import React, { useLayoutEffect, useRef, useState } from 'react';
import { View, TouchableOpacity, Text, Animated, Image, Linking } from 'react-native';
import Modal from 'react-native-modal';
import { styles } from '../../assets/styles/ThemeStyles';
import { Dimensions, ScrollView } from 'react-native';
import { PanResponder } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import LinearGradient from 'react-native-linear-gradient';

const ProfileScreenModal = ({ visible, onClose }) => {
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

    //  check if layout is ready
    useLayoutEffect(() => {
        if (visible) {
            setLayoutReady(true);
        } else {
            setLayoutReady(false);
        }
    }, [visible]);


    // top gifters
    const topGifters = [
        {
            id: 1,
            name: 'Name 1',
            amount: '$2,500',
            image: require('../../assets/images/LS-3.jpg'), // Replace with actual image
            isTop: true,
        },
        {
            id: 2,
            name: 'Name 2',
            amount: '$1,200',
            image: require('../../assets/images/LS-3.jpg'), // Replace with actual image
            isTop: false,
        },
        {
            id: 3,
            name: 'Name 3',
            amount: '$950',
            image: require('../../assets/images/LS-3.jpg'), // Replace with actual image
            isTop: false,
        },
    ];

    // Example URLs — replace with the actual profile links
    const instagramUrl = 'https://www.instagram.com/yourprofile';
    const facebookUrl = 'https://www.facebook.com/yourprofile';
    const twitterUrl = 'https://twitter.com/yourprofile'; // or X link

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
                style={[styles.profileModalMain]}
            >
                <Animated.View
                    style={[
                        styles.profileModalOverlay,
                        { flex: 1, maxHeight: screenHeight * 0.8 + 30 },
                        { transform: [{ translateY: panY }] },
                    ]}
                    {...panResponder.panHandlers}
                >
                    {/* close modal */}
                    {/* <TouchableOpacity onPress={onClose} style={styles.profileModalClose}>
                            <Ionicons name="close" size={23} color="#333" />
                        </TouchableOpacity> */}
                    <View style={[{ marginHorizontal: 0, flex: 1 }]}>
                        {/* Header with Report button */}
                        <View style={styles.psmHeader}>
                            <TouchableOpacity style={styles.psmReportButton}>
                                <Text style={styles.psmReportButtonText}>Report</Text>
                            </TouchableOpacity>
                        </View>

                        {layoutReady && (
                            <View style={styles.psmProfileContainer}>
                                {/* Profile Content */}
                                <View style={styles.psmProfileTopCard}>
                                    {/* Profile Image */}
                                    <View style={[styles.psmProfileImageContainer]}>
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
                            </View>
                        )}

                        {layoutReady &&
                            <ScrollView
                                contentContainerStyle={{ paddingBottom: 40 }}
                                showsVerticalScrollIndicator={true}
                            >
                                <View style={styles.psmProfileContainer}>
                                    {/* Social Media Icons */}
                                    <View style={styles.psmSocialContainer}>
                                        <TouchableOpacity
                                            onPress={() => Linking.openURL(instagramUrl)}
                                            style={styles.psmSocialButton}
                                        >
                                            <View style={styles.psmInstagramIcon}>
                                                {/* <Text style={styles.psmSocialIconText}>📷</Text> */}
                                                <FontAwesome name="instagram" size={34} color="#833ab4" />
                                            </View>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            onPress={() => Linking.openURL(facebookUrl)}
                                            style={styles.psmSocialButton}
                                        >
                                            <View style={styles.psmFacebookIcon}>
                                                {/* <Text style={styles.psmSocialIconText}>f</Text> */}
                                                <FontAwesome name="facebook" size={34} color="#445fed" />
                                            </View>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            onPress={() => Linking.openURL(twitterUrl)}
                                            style={styles.psmSocialButton}
                                        >
                                            <View style={styles.psmTwitterIcon}>
                                                {/* <Text style={styles.psmSocialIconText}>𝕏</Text> */}
                                                <Image
                                                    source={require('../../assets/images/tx-logo-black.png')}
                                                    resizeMode="contain"
                                                    style={{
                                                        width: 26,
                                                        height: 26,
                                                    }}
                                                />
                                            </View>
                                        </TouchableOpacity>
                                    </View>
                                    {/* Top Gifters */}
                                    {/* <View style={styles.psmTopGiftersContainer}>
                                        <Text style={styles.psmTopGiftersTitle}>Top Gifters</Text>
                                        <LinearGradient
                                            colors={['rgba(105,238,218,1)', 'rgba(114,80,228,1)']}
                                            start={{ x: 0, y: 1 }}
                                            end={{ x: 0.8, y: 0.2 }}
                                            style={styles.psmTopGifterMainCard}
                                        >
                                            <View style={styles.psmTopGifterImageContainer}>
                                                <Image
                                                    source={topGifters[0].image}
                                                    style={styles.psmTopGifterMainImage}
                                                />
                                            </View>
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                <Text style={styles.psmTopGifterMainName}>{topGifters[0].name}</Text>
                                                <Text style={styles.psmTopGifterMainAmount}>{topGifters[0].amount}</Text>
                                            </View>
                                        </LinearGradient>
                                        <View style={styles.psmOtherGiftersContainer}>
                                            {topGifters.slice(1).map((gifter, index) => (
                                                <View
                                                    key={gifter.id}
                                                    style={[styles.psmOtherGifterCard,
                                                    {
                                                        borderLeftWidth: index === 0 ? 1 : 0,
                                                        borderLeftColor: '#f0f0f0',
                                                    }]}
                                                >
                                                    <View style={styles.psmOtherGifterImageContainer}>
                                                        <Image
                                                            source={gifter.image}
                                                            style={styles.psmOtherGifterImage}
                                                        />
                                                    </View>
                                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                        <Text style={styles.psmOtherGifterName}>{gifter.name}</Text>
                                                        <Text style={styles.psmOtherGifterAmount}>{gifter.amount}</Text>
                                                    </View>
                                                </View>
                                            ))}
                                        </View>
                                    </View> */}
                                </View>
                            </ScrollView>
                        }

                    </View>
                </Animated.View>
            </Modal>
        </>

    );
};

export default ProfileScreenModal;
