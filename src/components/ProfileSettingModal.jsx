/* eslint-disable react-native/no-inline-styles */
// components/ProfileSettingModal.js
import React, { useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { View, TouchableOpacity, Text, Animated, Easing } from 'react-native';
import Modal from 'react-native-modal';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { styles } from '../../assets/styles/ThemeStyles';
import { ThemeContext } from '../context/ThemeContext';
import { Dimensions, ScrollView } from 'react-native';
import MySettingSubModal from '../modals/MySettingSubModal';

const ProfileSettingModal = ({ visible, onClose, onLogout }) => {
    const { theme, toggleTheme } = useContext(ThemeContext);
    const screenHeight = Dimensions.get('window').height;
    const [visibleModal, setVisibleModal] = useState(false);
    const [modalLabelName, setModalLabelName] = useState('');
    const [layoutReady, setLayoutReady] = useState(false);
    const isDark = theme === 'dark';

    const animation = useRef(new Animated.Value(isDark ? 1 : 0)).current;


    useEffect(() => {
        Animated.timing(animation, {
            toValue: isDark ? 1 : 0,
            duration: 300,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
        }).start();
    }, [isDark, animation]);

    useLayoutEffect(() => {
        if (visible) {
            setLayoutReady(true);
        } else {
            setLayoutReady(false);
        }
    }, [visible]);

    const toggle = () => {
        toggleTheme(); // this should toggle between 'dark' and 'light'
    };

    const sunBgColor = animation.interpolate({
        inputRange: [0, 1],
        outputRange: ['#007bff', '#fff'],
    });

    const moonBgColor = animation.interpolate({
        inputRange: [0, 1],
        outputRange: ['#fff', '#007bff'],
    });

    const menuItems = [
        {
            label: 'My Account',
            icon: 'user',
            onPress: () => { setVisibleModal(true); setModalLabelName('My Account'); },
        },
        {
            label: 'Privacy Settings',
            icon: 'user-secret',
            onPress: () => { setVisibleModal(true); setModalLabelName('Privacy Settings'); },
        },
        {
            label: 'Search Settings',
            icon: 'search-sharp',
            onPress: () => { setVisibleModal(true); setModalLabelName('Search Settings'); },
        },
        {
            label: 'Notification',
            icon: 'notifications-outline',
            onPress: () => { setVisibleModal(true); setModalLabelName('Notification'); },
        },
        // {
        //     label: 'Log Out',
        //     icon: 'sign-out-alt',
        //     onPress: onLogout,
        // },
    ];


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
                // backdropOpacity={0}
                // backdropColor='#fafafa'
                >
                    <View style={[styles.profileModalOverlay]}>
                        {/* close modal */}
                        <TouchableOpacity onPress={onClose} style={styles.profileModalClose}>
                            <Ionicons name="close" size={23} color="#333" />
                        </TouchableOpacity>
                        <View style={[styles.profileSettingModalBody, { height: screenHeight * 0.3 + 20 }]}>
                            <ScrollView
                                // contentContainerStyle={{ paddingBottom: 20 }}
                                showsVerticalScrollIndicator={false}
                            >
                                {/* dark / light setting */}
                                <View style={[styles.profileSettingMDarkLightSetting]}>
                                    <Text style={styles.pSettingMDarkLightSTitle}>Dark / Light Mode</Text>
                                    <View style={styles.pSettingMDarkLightSIconBoxWrapper}>
                                        <TouchableOpacity onPress={toggle}>
                                            <Animated.View style={[styles.pSettingMDarkLightSIconBox, {
                                                backgroundColor: sunBgColor,
                                            }]}>
                                                <FontAwesome5 name="sun" size={20} solid color={theme === 'light' ? '#fff' : '#888'} />
                                            </Animated.View>
                                        </TouchableOpacity>

                                        <TouchableOpacity onPress={toggle}>
                                            <Animated.View style={[styles.pSettingMDarkLightSIconBox, {
                                                backgroundColor: moonBgColor,
                                            }]}>
                                                <FontAwesome5 name="moon" size={18} solid color={theme === 'dark' ? '#fff' : '#888'} />
                                            </Animated.View>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                {/* Divider */}
                                <View style={[styles.profileSettingMDivider]} />
                                {/* Menu Items */}
                                {menuItems.map((item, index) => (
                                    <TouchableOpacity onPress={item.onPress} key={index} style={[styles.profileSettingMMenuList, {
                                        borderBottomWidth: index < menuItems.length - 1 ? 1 : 0,
                                    }]}>
                                        <View style={styles.profileSettingMMenuListItem}>
                                            {item.label === 'Notification' ?
                                                <Ionicons name={item.icon} size={20} color="#232323" style={{ width: 30 }} /> : item.label === 'Search Settings' ? <Ionicons name={item.icon} size={20} color="#232323" style={{ width: 30 }} /> : <FontAwesome5 name={item.icon} size={18} color="#232323" style={{ width: 30 }} />
                                            }
                                            <Text style={{ fontSize: 15, color: '#000' }}>{item.label}</Text>
                                        </View>
                                        <FontAwesome5 name="chevron-right" size={14} regular color="#888" style={{ width: 30 }} />
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>

                        </View>

                    </View>
                </Modal>
            }

            {visibleModal && (
                <MySettingSubModal visible="true" modalLabelName={modalLabelName} onClose={() => setVisibleModal(null)} onLogout={onLogout} />
            )
            }

        </>

    );
};

export default ProfileSettingModal;
