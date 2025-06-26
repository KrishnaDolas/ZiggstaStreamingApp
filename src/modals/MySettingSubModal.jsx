/* eslint-disable react-native/no-inline-styles */
import React, { useState } from 'react';
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

const MySettingSubModal = ({ visible, modalLabelName, onClose, onLogout }) => {
    const screenHeight = Dimensions.get('window').height;
    const [isLocationTrackingEnabled, setIsLocationTrackingEnabled] = useState(false);
    const [isAdultContentEnabled, setIsAdultContentEnabled] = useState(false);
    const [distanceRange, setDistanceRange] = useState(10);
    const [visibleModal, setVisibleModal] = useState('');

    const getMenuItems = () => {
        switch (modalLabelName) {
            case 'My Account':
                return [
                    { label: 'Change email address:', icon: 'envelope', onPress: () => { setVisibleModal('change-email'); }, rightArrowVisible: true },
                    { label: 'Confirm email:', icon: 'check-square', onPress: () => { }, rightArrowVisible: true },
                    { label: 'Change password:', icon: 'unlock-alt', onPress: () => { setVisibleModal('change-password'); }, rightArrowVisible: true },
                    { label: 'Delete account', icon: 'trash-alt', onPress: () => { }, rightArrowVisible: true },
                ];
            case 'Privacy Settings':
                return [
                    { label: 'Location tracking:', icon: 'map-marker-alt', type: 'toggle', onPress: () => { }, rightArrowVisible: false },
                    { label: 'Blocked users:', icon: 'user-alt-slash', type: 'slider', onPress: () => { }, rightArrowVisible: true },
                ];
            case 'Search Settings':
                return [
                    { label: 'Categories', icon: 'icons', onPress: () => { }, rightArrowVisible: true },
                    { label: 'Distance (Km)', icon: 'people-arrows', type: 'slider', onPress: () => { }, rightArrowVisible: false },
                    // { label: 'Adult content:', icon: 'male', type: 'toggle', onPress: () => { }, rightArrowVisible: false },
                    { label: 'Only verified profiles:', icon: 'user-check', onPress: () => { }, rightArrowVisible: true },
                ];
            case 'Notification':
                return [
                    { label: 'Allow Notifications [ON/OFF]:', icon: 'bell', onPress: () => { }, rightArrowVisible: true },
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
                    width: '100%', // like drawer
                    backgroundColor: '#fff',
                    padding: 16,
                    shadowColor: '#000',
                    shadowOffset: { width: -3, height: 0 },
                    shadowOpacity: 0.15,
                    shadowRadius: 6,
                    elevation: 8,
                }}>
                    {/* close modal */}
                    <View style={[styles.mySettingSubModalTitleBox]}>
                        <TouchableOpacity style={styles.mySettingSubModalClose} onPress={onClose}>
                            <FontAwesome name="angle-left" size={30} color="#d93a63" />
                        </TouchableOpacity>
                        <Text style={styles.mySettingSubModalTitle}>{modalLabelName}</Text>
                    </View>
                    <View style={[styles.profileSettingModalBody, { height: screenHeight * 0.3 - 10 }]}>
                        <ScrollView
                            // contentContainerStyle={{ paddingBottom: 20 }}
                            showsVerticalScrollIndicator={false}
                        >
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
                                    {item.rightArrowVisible ? (
                                        <FontAwesome5 name="chevron-right" size={14} regular color="#888" style={{ width: 30 }} />
                                    ) : (
                                        item.label === 'Location tracking:' ? (
                                            <Switch
                                                value={isLocationTrackingEnabled}
                                                onValueChange={setIsLocationTrackingEnabled}
                                                trackColor={{ false: '#ccc', true: '#4CAF50' }}  // green like iOS
                                                thumbColor="#ffffff"                             // white thumb
                                                ios_backgroundColor="#ccc"
                                                style={{ transform: [{ scaleX: 1.1 }, { scaleY: 1.1 }] }} // slightly bigger
                                            />
                                        ) : item.label === 'Distance (Km)' ? (
                                            <View style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 10, paddingRight: 10 }}>
                                                <Slider
                                                    style={{ width: '70%' }}
                                                    minimumValue={0}
                                                    maximumValue={200}
                                                    step={1}
                                                    value={distanceRange}
                                                    onValueChange={setDistanceRange}
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
                                                onValueChange={setIsAdultContentEnabled}
                                                trackColor={{ false: '#ccc', true: '#4CAF50' }}  // green like iOS
                                                thumbColor="#ffffff"                             // white thumb
                                                ios_backgroundColor="#ccc"
                                                style={{ transform: [{ scaleX: 1.1 }, { scaleY: 1.1 }] }} // slightly bigger
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
                <ChangeEmailModal visible="true" onClose={() => setVisibleModal(null)} />
            )
            }
            {visibleModal === 'change-password' && (
                <ChangePasswordModal visible="true" onClose={() => setVisibleModal(null)} />
            )
            }
        </>

    );
};

export default MySettingSubModal;
