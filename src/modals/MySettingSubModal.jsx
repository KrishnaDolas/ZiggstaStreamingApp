import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, Text, Switch } from 'react-native';
import Modal from 'react-native-modal';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { styles } from '../../assets/styles/ThemeStyles';
import { Dimensions, ScrollView } from 'react-native';
import Slider from '@react-native-community/slider';
import ChangeEmailModal from './ChangeEmailModal';
import ChangePasswordModal from './ChangePasswordModal';
import EmailConfirmModal from './EmailConfirmModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppContext } from '../context/AppContext';
import { useNavigation } from '@react-navigation/native';
import UserInterestUpdateModal from './UserInterestUpdateModal';

const MySettingSubModal = ({ visible, modalLabelName, onClose, userData }) => {
    const screenHeight = Dimensions.get('window').height;
    const [isLocationTrackingEnabled, setIsLocationTrackingEnabled] = useState(false);
    const [isAdultContentEnabled, setIsAdultContentEnabled] = useState(false);
    const [onlyProfileVerified, setOnlyProfileVerified] = useState(false);
    const [allowNotification, setAllowNotification] = useState(false);
    const [distanceRange, setDistanceRange] = useState(10);
    const [visibleModal, setVisibleModal] = useState('');
    const { setFriendListType } = useAppContext();
    const navigation = useNavigation();


    // Load preferences from AsyncStorage
    useEffect(() => {
        const initToggleStates = async () => {
            try {
                const locationTracking = await AsyncStorage.getItem('locationTrackingEnabled');
                const profileVerified = await AsyncStorage.getItem('onlyProfileVerified');
                const notifications = await AsyncStorage.getItem('allowNotification');
                const distance = await AsyncStorage.getItem('distanceRange');

                if (locationTracking !== null) setIsLocationTrackingEnabled(locationTracking === 'true');
                if (profileVerified !== null) setOnlyProfileVerified(profileVerified === 'true');
                if (notifications !== null) setAllowNotification(notifications === 'true');
                if (distance !== null) setDistanceRange(parseInt(distance));
            } catch (error) {
                console.error('Error loading preferences:', error);
            }
        };

        if (visible) {
            initToggleStates();
        }
    }, [visible]);

    // ✅ Simple toggle for location tracking
    const handleToggleLocationTracking = async (value) => {
        setIsLocationTrackingEnabled(value);
        await AsyncStorage.setItem('locationTrackingEnabled', JSON.stringify(value));
    };


    // Handle other toggle changes with persistence
    // const handleAdultContentToggle = async (value) => {
    //     setIsAdultContentEnabled(value);
    //     await AsyncStorage.setItem('adultContentEnabled', value.toString());
    // };

    const handleProfileVerifiedToggle = async (value) => {
        setOnlyProfileVerified(value);
        await AsyncStorage.setItem('onlyProfileVerified', value.toString());
    };

    const handleNotificationToggle = async (value) => {
        setAllowNotification(value);
        await AsyncStorage.setItem('allowNotification', value.toString());
    };

    const handleDistanceChange = async (value) => {
        setDistanceRange(value);
        await AsyncStorage.setItem('distanceRange', value.toString());
    };


    // useEffect(() => {
    //     const checkVerifiedStatus = async () => {
    //         const status = await AsyncStorage.getItem('onlyProfileVerified');
    //         console.log('onlyProfileVerified', status);
    //     };
    //     checkVerifiedStatus();
    // }, [onlyProfileVerified]);


    // useEffect(() => {
    //     const checkDistanceStatus = async () => {
    //         const status = await AsyncStorage.getItem('distanceRange');
    //         console.log('distanceRange', status);
    //     };
    //     checkDistanceStatus();
    // }, [distanceRange]);


    const getMenuItems = () => {
        switch (modalLabelName) {
            case 'My Account':
                return [
                    { label: 'Change email address:', icon: 'envelope', onPress: () => { setVisibleModal('change-email'); }, rightArrowVisible: true },
                    { label: 'Confirm email:', icon: 'check-square', onPress: () => { setVisibleModal('email-confirm'); }, rightArrowVisible: true },
                    { label: 'Change password:', icon: 'unlock-alt', onPress: () => { setVisibleModal('change-password'); }, rightArrowVisible: true },
                    { label: 'Delete account', icon: 'trash-alt', onPress: () => { }, rightArrowVisible: true },
                ];
            case 'Privacy Settings':
                return [
                    // { label: 'Location tracking:', icon: 'map-marker-alt', type: 'toggle', rightArrowVisible: false },
                    {
                        label: 'Blocked users:', icon: 'user-alt-slash', type: 'slider',
                        onPress: () => {
                            setFriendListType('blocked');
                            navigation.navigate('Messages');
                        },
                        rightArrowVisible: true,
                    },
                ];
            case 'Search Settings':
                return [
                    { label: 'Categories', icon: 'icons', onPress: () => { setVisibleModal('categories'); }, rightArrowVisible: true },
                    // { label: 'Distance (km)', icon: 'people-arrows', type: 'slider', onPress: () => { }, rightArrowVisible: false },
                    // { label: 'Adult content:', icon: 'male', type: 'toggle', onPress: () => { }, rightArrowVisible: false },
                    { label: 'Only verified profiles:', icon: 'user-check', type: 'toggle', onPress: () => { }, rightArrowVisible: false },
                ];
            case 'Notification':
                return [
                    { label: 'Allow Notifications:', icon: 'bell', type: 'toggle', onPress: () => { }, rightArrowVisible: false },
                ];
            default:
                return [];
        }
    };

    const menuItems = getMenuItems();

    return (
        <>
            <Modal
                isVisible={visible}
                onBackdropPress={onClose}
                animationIn="slideInRight"
                animationOut="slideOutLeft"
                animationInTiming={400}
                animationOutTiming={300}
                backdropOpacity={0}
                useNativeDriver={true}
                hardwareAccelerated={true}
                style={{
                    margin: 0,
                    justifyContent: 'flex-end',
                    alignItems: 'flex-end',
                }}
            >
                <View style={{
                    width: '100%',
                    backgroundColor: '#fff',
                    padding: 16,
                    shadowColor: '#000',
                    shadowOffset: { width: -3, height: 0 },
                    shadowOpacity: 0.15,
                    shadowRadius: 6,
                    elevation: 8,
                }}>
                    <View style={[styles.mySettingSubModalTitleBox]}>
                        <TouchableOpacity style={styles.mySettingSubModalClose} onPress={onClose}>
                            <FontAwesome name="angle-left" size={30} color="#d93a63" />
                        </TouchableOpacity>
                        <Text style={styles.mySettingSubModalTitle}>{modalLabelName}</Text>
                    </View>
                    <View style={[styles.profileSettingModalBody, { height: screenHeight * 0.3 - 10 }]}>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View style={[styles.profileSettingMDivider]} />
                            {menuItems.map((item, index) => (
                                <TouchableOpacity onPress={item.onPress} key={index} style={[styles.profileSettingMMenuList, {
                                    borderBottomWidth: index < menuItems.length - 1 ? 1 : 0,
                                }]}>
                                    <View style={styles.profileSettingMMenuListItem}>
                                        {item.label === 'Notification' ?
                                            <Ionicons name={item.icon} size={20} color="#232323" style={{ width: 30 }} /> :
                                            item.label === 'Search Settings' ?
                                                <Ionicons name={item.icon} size={20} color="#232323" style={{ width: 30 }} /> :
                                                <FontAwesome5 name={item.icon} size={18} color="#232323" style={{ width: 30 }} />
                                        }
                                        <Text style={{ fontSize: 15, color: '#000' }}>{item.label}</Text>
                                    </View>
                                    {item.rightArrowVisible ? (
                                        <FontAwesome5 name="chevron-right" size={14} regular color="#888" style={{ width: 30 }} />
                                    ) : (
                                        item.label === 'Location tracking:' ? (
                                            <Switch
                                                value={isLocationTrackingEnabled}
                                                onValueChange={handleToggleLocationTracking}
                                                trackColor={{ false: '#ccc', true: '#4CAF50' }}
                                                thumbColor="#ffffff"
                                                ios_backgroundColor="#ccc"
                                                style={{ transform: [{ scaleX: 1.1 }, { scaleY: 1.1 }] }}
                                            />
                                        ) : item.label === 'Distance (km)' ? (
                                            <View style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 10, paddingRight: 10 }}>
                                                <Slider
                                                    style={{ width: '70%' }}
                                                    minimumValue={100}
                                                    maximumValue={400}
                                                    step={1}
                                                    value={distanceRange}
                                                    onValueChange={setDistanceRange}
                                                    onSlidingComplete={handleDistanceChange}
                                                    minimumTrackTintColor="#ccc"
                                                    maximumTrackTintColor="#ccc"
                                                    thumbTintColor="#4CAF50"
                                                />
                                                <Text style={{ textAlign: 'right', fontSize: 13, color: '#444' }}>
                                                    {distanceRange}
                                                </Text>
                                            </View>
                                        ) : item.label === 'Adult content:' ? (
                                            <Switch
                                                value={isAdultContentEnabled}
                                                // onValueChange={handleAdultContentToggle}
                                                trackColor={{ false: '#ccc', true: '#4CAF50' }}  // green like iOS
                                                thumbColor="#ffffff"                             // white thumb
                                                ios_backgroundColor="#ccc"
                                                style={{ transform: [{ scaleX: 1.1 }, { scaleY: 1.1 }] }} // slightly bigger
                                            />
                                        ) : item.label === 'Only verified profiles:' ? (
                                            <Switch
                                                value={onlyProfileVerified}
                                                onValueChange={handleProfileVerifiedToggle}
                                                trackColor={{ false: '#ccc', true: '#4CAF50' }}
                                                thumbColor="#ffffff"
                                                ios_backgroundColor="#ccc"
                                                style={{ transform: [{ scaleX: 1.1 }, { scaleY: 1.1 }] }}
                                            />
                                        ) : item.label === 'Allow Notifications:' ? (
                                            <Switch
                                                value={allowNotification}
                                                onValueChange={handleNotificationToggle}
                                                trackColor={{ false: '#ccc', true: '#4CAF50' }}
                                                thumbColor="#ffffff"
                                                ios_backgroundColor="#ccc"
                                                style={{ transform: [{ scaleX: 1.1 }, { scaleY: 1.1 }] }}
                                            />
                                        ) : null
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
            {visibleModal === 'change-email' && (
                <ChangeEmailModal visible="true" onClose={() => setVisibleModal(null)} userData={userData} />
            )}
            {visibleModal === 'change-password' && (
                <ChangePasswordModal visible="true" onClose={() => setVisibleModal(null)} userData={userData} />
            )}
            {visibleModal === 'email-confirm' && (
                <EmailConfirmModal visible="true" onClose={() => setVisibleModal(null)} userData={userData} />
            )}
            {visibleModal === 'categories' && (
                <UserInterestUpdateModal visible="true" onClose={() => setVisibleModal(null)} userData={userData} />
            )}
        </>
    );
};

export default MySettingSubModal;