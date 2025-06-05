import React, { useContext, useState } from 'react';
import { View, FlatList, Text, Image, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { styles, themeStyles } from '../../assets/styles/ThemeStyles';
import { ThemeContext } from '../context/ThemeContext';
import LinearGradient from 'react-native-linear-gradient';
import Footer from '../components/Footer';
import ProfileSocialsModal from '../components/ProfileSocialsModal';
import ProfileSettingModal from '../components/ProfileSettingModal';
import ShopManagerDetailsModal from '../components/ShopManagerDetailsModal';

const tableData = [
    {
        userName: 'Chris Evanson',
        amount: '$1005'
    },
    {
        userName: 'Perry Walker',
        amount: '$980'
    },
    {
        userName: 'Jasmine Senna',
        amount: '$750'
    },
    {
        userName: `Alfred William D'Costa II`,
        amount: '$690'
    },
    {
        userName: 'John Wick',
        amount: '$600'
    },
    {
        userName: 'Callum Jones',
        amount: '$500'
    },
    {
        userName: 'Allan Donald',
        amount: '$200'
    },
]


export const ProfileScreen = () => {
    const ROWS_TO_DISPLAY = 5;
    const { theme, toggleTheme } = useContext(ThemeContext);
    const [visibleModal, setVisibleModal] = useState(null);

    return (
        <SafeAreaView style={{ flex: 1, position: 'relative' }}>
            {/* Fixed Header */}
            <View style={[styles.profileHeader, themeStyles[theme].profileHeader]}>
                <View style={[styles.profileBlockLeftBox]}>
                    <Image
                        source={{ uri: 'https://test.streamalong.live/images/logo-icon.png' }}
                        style={styles.profileHeaderLogo}
                    />
                    <Image
                        source={{ uri: 'https://test.streamalong.live/images/LS-3.jpg' }}
                        style={styles.profileAvatar}
                    />
                </View>
                <View style={styles.profileBlockRightBox}>
                    <View style={styles.profileBlock}>
                        <Text style={[styles.profileMainText, themeStyles[theme].profileMainText]}>Username</Text>
                        <Text style={[styles.profileValueText, themeStyles[theme].profileValueText]}>Katherine Z</Text>
                    </View>

                    <View style={styles.profileBlock}>
                        <Text style={[styles.profileMainText, themeStyles[theme].profileMainText]}>Balance</Text>
                        <Text style={[styles.profileValueText, themeStyles[theme].profileValueText]}>#1234.00</Text>
                    </View>
                </View>


            </View>
            {/* Scrollable Content */}
            <ScrollView style={[styles.profileScrollContainer, themeStyles[theme].profileScrollContainer]}>
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
                    <FlatList
                        data={tableData}
                        initialNumToRender={ROWS_TO_DISPLAY}
                        keyExtractor={(item, index) => index.toString()}
                        contentContainerStyle={{ paddingBottom: 8 }}
                        style={{ maxHeight: 205 }} // Scrollable table height
                        renderItem={({ item, index }) => (
                            <View style={styles.profileTableRow}>
                                <Text style={[styles.profileTableCell, styles.profileTableCellIndex, themeStyles[theme].profileTableCell]}>{index + 1}</Text>
                                <Text style={[styles.profileTableCell, styles.profileTableCellUsername, themeStyles[theme].profileTableCell]}>{item.userName}</Text>
                                <Text style={[styles.profileTableCell, styles.profileTableCellAmount, themeStyles[theme].profileTableCell]}>{item.amount}</Text>
                            </View>
                        )}
                    />
                </View>
                {/* Action Buttons */}
                <View style={styles.profileButtonGrid}>
                    <TouchableOpacity style={[styles.profileActionBtnBox]}>
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
                <ShopManagerDetailsModal visible='true' onClose={() => setVisibleModal(null)} />
            )}
            {visibleModal === 'social' && (
                <ProfileSocialsModal visible='true' onClose={() => setVisibleModal(null)} />
            )}
            {visibleModal === 'setting' && (
                <ProfileSettingModal visible='true' onClose={() => setVisibleModal(null)} />
            )}
            < Footer />
        </SafeAreaView >
    );
};
