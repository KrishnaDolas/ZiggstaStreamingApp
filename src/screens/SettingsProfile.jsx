import React, { useContext, useEffect, useRef, useState } from 'react';
import {
    View,
    TouchableOpacity,
    StatusBar,
    Text,
    BackHandler,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ThemeContext } from '../context/ThemeContext';
import { useAppContext } from '../context/AppContext';
import { styles, themeStyles } from '../../assets/styles/ThemeStyles';
import Icon from 'react-native-vector-icons/Ionicons';
import ProfileSettingModal from '../components/ProfileSettingModal';
import MySettingSubModal from '../modals/MySettingSubModal';
import ChangeEmailModal from '../modals/ChangeEmailModal';
import EmailConfirmModal from '../modals/EmailConfirmModal';
import ChangePasswordModal from '../modals/ChangePasswordModal';
import UserInterestUpdateModal from '../modals/UserInterestUpdateModal';
import BankDetailsModal from '../modals/BankDetailsModal';
import BankAddModal from '../modals/BankAddModal';
import ShopManagerDetailsModal from '../components/ShopManagerDetailsModal';
import ProfileSocialsModal from '../components/ProfileSocialsModal';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

const SettingsProfile = ({ onLogout, userData }) => {
    const insets = useSafeAreaInsets();
    const { theme } = useContext(ThemeContext);
    const {
        modalStage,
        setModalStage,
        modalLabelName,
        setModalLabelName,
        modalVisibleStage,
        setModalVisibleStage,
    } = useAppContext();
    const [visibleModal, setVisibleModal] = useState(null);
    const navigation = useNavigation();
    const isScreenFocused = useRef(false);


    // Handle hardware back button
    useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            if (isScreenFocused.current) {
                // When hardware back is pressed and screen is focused
                setModalVisibleStage('profile-screen-modal');
                setModalStage('first');
                // Let the default back action happen
                return false;
            }
            return false;
        });

        return () => backHandler.remove();
    }, []);

    // Track screen focus
    useFocusEffect(
        React.useCallback(() => {
            isScreenFocused.current = true;

            return () => {
                isScreenFocused.current = false;
            };
        }, [])
    );

    // Handle manual back button press
    const handleBackPress = () => {
        navigation.goBack();
        setModalVisibleStage('profile-screen-modal');
        setModalStage('first');
    };



    return (
        <>
            <View style={[styles.settingProfileContainer,
            themeStyles[theme].settingProfileContainer,
            {
                paddingTop: insets.top,
                paddingBottom: insets.bottom,
            }]}>
                <StatusBar
                    barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
                    backgroundColor={theme === 'dark' ? '#121212' : '#ffffff'}
                    translucent={false}
                />
                <View style={[styles.settingProfileHeader, themeStyles[theme].settingProfileHeader]}>
                    <TouchableOpacity style={styles.settingProfileBackButton}
                        onPress={handleBackPress}>
                        <Ionicons name="chevron-back" size={24} color={theme === 'light' ? '#333' : '#fff'} />
                    </TouchableOpacity>
                    <Text style={[styles.settingProfileHeaderTitle, themeStyles[theme].settingProfileHeaderTitle]}>Settings</Text>
                </View>
                <View style={styles.settingProfileLayoutContainer}>
                    <View style={styles.profileButtonGrid}>
                        <TouchableOpacity
                            onPress={() => {
                                setModalVisibleStage('bank-details');
                                setModalStage('first');
                                setModalLabelName(null);
                            }}
                            style={[styles.profileActionBtnBox, themeStyles[theme].profileActionBtnBox]}
                        >
                            <Icon name="card-outline" size={26} color="#4CAF50" style={styles.actionButtonIcon} />
                            <Text style={[styles.profileActionButtonText, themeStyles[theme].profileActionButtonText]}>Banking Details</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setVisibleModal('shop-manager')}
                            style={[styles.profileActionBtnBox, themeStyles[theme].profileActionBtnBox]}
                        >
                            <Icon name="storefront-outline" size={24} color="#FF9800" style={styles.actionButtonIcon} />
                            <Text style={[styles.profileActionButtonText, themeStyles[theme].profileActionButtonText]}>Shop Manager</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setVisibleModal('social')}
                            style={[styles.profileActionBtnBox, themeStyles[theme].profileActionBtnBox]}
                        >
                            <Icon name="people-outline" size={28} color="#2196F3" style={styles.actionButtonIcon} />
                            <Text style={[styles.profileActionButtonText, themeStyles[theme].profileActionButtonText]}>Socials</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => {
                                setModalVisibleStage('setting');
                                setModalStage('first');
                                setModalLabelName(null);
                            }}
                            style={[styles.profileActionBtnBox, themeStyles[theme].profileActionBtnBox]}
                        >
                            <Icon name="settings-outline" size={27} color="#9C27B0" style={styles.actionButtonIcon} />
                            <Text style={[styles.profileActionButtonText, themeStyles[theme].profileActionButtonText]}>Settings</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {modalVisibleStage === 'setting' && modalStage === 'first' && (
                <ProfileSettingModal
                    visible={modalVisibleStage === 'setting'}
                    onClose={() => setModalVisibleStage(null)}
                    onLogout={onLogout}
                />
            )}
            {modalVisibleStage === 'sub-setting' && modalStage === 'second' && (
                <MySettingSubModal
                    visible={modalVisibleStage === 'sub-setting'}
                    modalLabelName={modalLabelName}
                    onClose={() => {
                        setModalVisibleStage('setting');
                        setModalStage('first');
                        setModalLabelName(null);
                    }}
                />
            )}
            {modalVisibleStage === 'change-email' && modalStage === 'third' && (
                <ChangeEmailModal
                    visible={modalVisibleStage === 'change-email'}
                    onClose={() => {
                        setModalVisibleStage('sub-setting');
                        setModalStage('second');
                        setModalLabelName('My Account');
                    }}
                    userData={userData}
                />
            )
            }
            {modalVisibleStage === 'confirm-email' && modalStage === 'third' && (
                <EmailConfirmModal
                    visible={modalVisibleStage === 'confirm-email'}
                    onClose={() => {
                        setModalVisibleStage('sub-setting');
                        setModalStage('second');
                        setModalLabelName('My Account');
                    }}
                />
            )
            }
            {modalVisibleStage === 'change-password' && modalStage === 'third' && (
                <ChangePasswordModal
                    visible={modalVisibleStage === 'change-password'}
                    onClose={() => {
                        setModalVisibleStage('sub-setting');
                        setModalStage('second');
                        setModalLabelName('My Account');
                    }}
                    userData={userData}
                />
            )
            }
            {modalVisibleStage === 'update-interest' && modalStage === 'third' && (
                <UserInterestUpdateModal
                    visible={modalVisibleStage === 'update-interest'}
                    onClose={() => {
                        setModalVisibleStage('sub-setting');
                        setModalStage('second');
                        setModalLabelName('Search Settings');
                    }}
                />
            )
            }
            {/* full screen modal */}
            {modalVisibleStage === 'bank-details' && (
                <BankDetailsModal
                    visible={modalVisibleStage === 'bank-details'}
                    onClose={() => setModalVisibleStage(null)}
                    userData={userData}
                />
            )}
            {modalVisibleStage === 'add-bank' && modalStage === 'second' && (
                <BankAddModal
                    visible={modalVisibleStage === 'add-bank'}
                    onClose={() => {
                        setModalVisibleStage('bank-details');
                        setModalStage('first');
                        setModalLabelName(null);
                    }}
                    userData={userData}
                />
            )}
            {visibleModal === 'shop-manager' && (
                <ShopManagerDetailsModal visible="true" onClose={() => setVisibleModal(null)} />
            )}
            {visibleModal === 'social' && (
                <ProfileSocialsModal visible="true" onClose={() => setVisibleModal(null)} userData={userData} />
            )}

        </>
    );
};

export default SettingsProfile;
