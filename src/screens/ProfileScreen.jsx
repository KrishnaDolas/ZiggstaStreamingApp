import React, { useContext, useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { styles, themeStyles } from '../../assets/styles/ThemeStyles';
import { ThemeContext } from '../context/ThemeContext';
import LinearGradient from 'react-native-linear-gradient';
import { ActivityIndicator } from 'react-native';
import Footer from '../components/Footer';
import ProfileSocialsModal from '../components/ProfileSocialsModal';
import ProfileSettingModal from '../components/ProfileSettingModal';
import ShopManagerDetailsModal from '../components/ShopManagerDetailsModal';
import Apiclient from '../utils/Apiclient';
import { CenterModal } from '../components/CenterModal';
import FullScreenModal from '../components/FullScreenModal';
import HalfScreenModal from '../components/HalfScreenModal';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const tableData = [
    {
        userName: 'Chris Evanson',
        amount: '$1005',
    },
    {
        userName: 'Perry Walker',
        amount: '$980',
    },
    {
        userName: 'Jasmine Senna',
        amount: '$750',
    },
    {
        userName: 'Alfred William DCosta II',
        amount: '$690',
    },
    {
        userName: 'John Wick',
        amount: '$600',
    },
    {
        userName: 'Callum Jones',
        amount: '$500',
    },
    {
        userName: 'Allan Donald',
        amount: '$200',
    },
];

export const ProfileScreen = ({ userData, onLogout }) => {
    const { theme } = useContext(ThemeContext);
    const insetsTop = useSafeAreaInsets();
    const [visibleModal, setVisibleModal] = useState(null);
    const [profileData, setProfileData] = useState({});
    const [isUserLoading, setIsUserLoading] = useState(false);
    const [isUserError, setIsUserError] = useState(null);

    // get profile details from API
    useEffect(() => {
        const fetchProfileDetails = async () => {
            setIsUserLoading(false);
            setIsUserError('');
            try {
                const formData = {
                    'userid': userData.userid,
                };
                const response = await Apiclient.post('/getUserDetails', formData);
                console.log('profile data', response.data.user);
                if (response.status === 200) {
                    setProfileData(response.data.user || {});
                } else {
                    setIsUserError('Failed to fetch rooms');
                }
            } catch (err) {
                setIsUserError('Error fetching rooms: ' + err.message);
            } finally {
                setIsUserLoading(false);
            }
        };
        fetchProfileDetails();
    }, [userData.userid]);

    return (
        <SafeAreaView style={{ flex: 1, position: 'relative', paddingBottom: 80, paddingTop: insetsTop.top }}>
            <StatusBar
                hidden={false} // Show the status bar
                barStyle="dark-content"
            />
            {isUserLoading ? (
                <View style={styles.activityIndicatorMain}>
                    <ActivityIndicator size="large" color={theme === 'light' ? '#000' : '#fff'} />
                </View>
            ) : (
                <>
                    {/* Error Message */}
                    {isUserError ? (
                        <View style={styles.profileErrorBoxMain}>
                            <Text style={styles.profileErrorText}>
                                {isUserError} Error Occur When Getting User Profile Data
                            </Text>
                        </View>
                    ) : null}
                    {/* Fixed Header */}
                    <View style={[styles.profileHeader, themeStyles[theme].profileHeader]}>
                        <View style={[styles.profileBlockLeftBox]}>
                            <Image
                                source={require('../../assets/images/favicon.png')}
                                style={styles.profileHeaderLogo}
                            />
                            <Image
                                source={require('../../assets/images/LS-3.jpg')}
                                style={styles.profileAvatar}
                            />
                        </View>
                        <View style={styles.profileBlockRightBox}>
                            <View style={styles.profileBlock}>
                                <Text style={[styles.profileMainText, themeStyles[theme].profileMainText]}>Username</Text>
                                <Text style={[styles.profileValueText, themeStyles[theme].profileValueText]}>{profileData.screenName}</Text>
                            </View>

                            <View style={styles.profileBlock}>
                                <Text style={[styles.profileMainText, themeStyles[theme].profileMainText]}>Balance</Text>
                                <Text style={[styles.profileValueText, themeStyles[theme].profileValueText]}>#{profileData?.CreditBalance}.00</Text>
                            </View>
                        </View>


                    </View>
                    {/* Scrollable Content */}
                    <ScrollView showsVerticalScrollIndicator={false} style={[styles.profileScrollContainer, themeStyles[theme].profileScrollContainer]}>
                        {/* Stat Cards */}
                        <View style={styles.profileStatCards}>
                            <View style={[styles.profileStatCard, themeStyles[theme].profileStatCard]}>
                                <Text style={[styles.profileStatLabel, themeStyles[theme].profileStatLabel]}>Avg. Daily Revenue</Text>
                                <Text style={[styles.profileStatValue, themeStyles[theme].profileStatValue]}>#1234.00</Text>
                            </View>
                            <View style={{ width: 5 }} />
                            <View style={[styles.profileStatCard, themeStyles[theme].profileStatCard]}>
                                <Text style={[styles.profileStatLabel, themeStyles[theme].profileStatLabel]}>Avg. Daily Time</Text>
                                <Text style={[styles.profileStatValue, themeStyles[theme].profileStatValue]}>4h 32min</Text>
                            </View>
                        </View>
                        {/* History Table */}
                        <View style={[styles.profileTable, themeStyles[theme].profileTable]}>
                            <View style={[styles.profileTableHeader, themeStyles[theme].profileTableHeader]}>
                                <Text style={[styles.profileTableHeaderText, styles.profileTableCellIndex, themeStyles[theme].profileTableHeaderText]}>#</Text>
                                <Text style={[styles.profileTableHeaderText, styles.profileTableCellUsername, themeStyles[theme].profileTableHeaderText]}>Username</Text>
                                <Text style={[styles.profileTableHeaderText, styles.profileTableCellAmount, themeStyles[theme].profileTableHeaderText]}>Amount</Text>
                            </View>
                            <ScrollView nestedScrollEnabled={true} contentContainerStyle={{ paddingBottom: 8 }} style={{ maxHeight: 205 }}>
                                {tableData.map((item, index) => {
                                    return (
                                        <View key={index} style={styles.profileTableRow}>
                                            <Text style={[styles.profileTableCell, styles.profileTableCellIndex, themeStyles[theme].profileTableCell]}>{index + 1}</Text>
                                            <Text style={[styles.profileTableCell, styles.profileTableCellUsername, themeStyles[theme].profileTableCell]}>{item.userName}</Text>
                                            <Text style={[styles.profileTableCell, styles.profileTableCellAmount, themeStyles[theme].profileTableCell]}>{item.amount}</Text>
                                        </View>
                                    )
                                })}
                            </ScrollView>
                        </View>
                        {/* Action Buttons */}
                        <View style={styles.profileButtonGrid}>
                            <TouchableOpacity onPress={() => setVisibleModal('half-screen-modal')} style={[styles.profileActionBtnBox]}>
                                <LinearGradient
                                    colors={theme === 'light' ? ['rgba(232,232,232,1)', 'rgba(250,250,250,1)'] : ['#444', '#666']}
                                    start={{ x: 0.5, y: 1 }}
                                    end={{ x: 0.5, y: 0 }}
                                    style={styles.profileActionButton}
                                >
                                    <Text style={[styles.profileActionButtonText, themeStyles[theme].profileActionButtonText]}>Banking Details</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setVisibleModal('shop-manager')} style={[styles.profileActionBtnBox]}>
                                <LinearGradient
                                    colors={theme === 'light' ? ['rgba(232,232,232,1)', 'rgba(250,250,250,1)'] : ['#444', '#666']}
                                    start={{ x: 0.5, y: 1 }}
                                    end={{ x: 0.5, y: 0 }}
                                    style={styles.profileActionButton}
                                >
                                    <Text style={[styles.profileActionButtonText, themeStyles[theme].profileActionButtonText]}>Shop Manager</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setVisibleModal('social')} style={[styles.profileActionBtnBox]}>
                                <LinearGradient
                                    colors={theme === 'light' ? ['rgba(232,232,232,1)', 'rgba(250,250,250,1)'] : ['#444', '#666']}
                                    start={{ x: 0.5, y: 1 }}
                                    end={{ x: 0.5, y: 0 }}
                                    style={styles.profileActionButton}
                                >
                                    <Text style={[styles.profileActionButtonText, themeStyles[theme].profileActionButtonText]}>Socials</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setVisibleModal('setting')} style={[styles.profileActionBtnBox]}>
                                <LinearGradient
                                    colors={theme === 'light' ? ['rgba(232,232,232,1)', 'rgba(250,250,250,1)'] : ['#444', '#666']}
                                    start={{ x: 0.5, y: 1 }}
                                    end={{ x: 0.5, y: 0 }}
                                    style={styles.profileActionButton}
                                >
                                    <Text style={[styles.profileActionButtonText, themeStyles[theme].profileActionButtonText]}>Settings</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                    {/* Modals */}
                    {visibleModal === 'shop-manager' && (
                        <ShopManagerDetailsModal visible="true" onClose={() => setVisibleModal(null)} />
                    )}
                    {visibleModal === 'social' && (
                        <ProfileSocialsModal visible="true" onClose={() => setVisibleModal(null)} />
                    )}
                    {visibleModal === 'setting' && (
                        <ProfileSettingModal visible="true" onClose={() => setVisibleModal(null)} />
                    )}

                    {/* center modal */}
                    {visibleModal === 'center-modal' && (
                        <CenterModal visible="true" onClose={() => setVisibleModal(null)} />
                    )}
                    {/* full screen modal */}
                    {visibleModal === 'full-screen-modal' && (
                        <FullScreenModal visible="true" onClose={() => setVisibleModal(null)} />
                    )}
                    {/* full screen modal */}
                    {visibleModal === 'half-screen-modal' && (
                        <HalfScreenModal visible="true" onClose={() => setVisibleModal(null)} />
                    )}
                    <Footer />
                </>)}
        </SafeAreaView>
    );
};
