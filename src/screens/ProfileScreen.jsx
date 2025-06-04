import React, { useContext } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { styles, themeStyles } from '../../assets/styles/ThemeStyles';
import { ThemeContext } from '../context/ThemeContext';

export const ProfileScreen = () => {
    const { theme } = useContext(ThemeContext);

    return (
        <SafeAreaView style={{ flex: "1" }}>
            {/* Fixed Header */}
            <View style={styles.profileHeader}>
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
            <ScrollView contentContainerStyle={[styles.profileScrollContainer, themeStyles[theme].profileScrollContainer]}>
                <View style={styles.profileContainer}>
                    {/* Stat Cards */}
                    <View style={styles.profileStatCards}>
                        <View style={[styles.profileStatCard, { backgroundColor: '#fff' }]}>
                            <Text style={[styles.profileStatLabel, { color: 'rgb(136, 136, 136)' }]}>Avg. Daily Revenue</Text>
                            <Text style={[styles.profileStatValue, { color: 'rgb(255, 9, 214)' }]}>#1234.00</Text>
                        </View>
                        <View style={[styles.profileStatCard, { backgroundColor: '#fff' }]}>
                            <Text style={[styles.profileStatLabel, { color: 'rgb(136, 136, 136)' }]}>Avg. Daily Time</Text>
                            <Text style={[styles.profileStatValue, { color: 'rgb(255, 9, 214)' }]}>4h 32min</Text>
                        </View>
                    </View>

                    {/* History Table */}
                    {/* <View style={[styles.profileTable, { backgroundColor: '#f9fafb' }]}>
                        <View style={styles.profileTableHeader}>
                            <Text style={styles.profileTableHeaderText}>Date</Text>
                            <Text style={styles.profileTableHeaderText}>Result</Text>
                            <Text style={styles.profileTableHeaderText}>Amount</Text>
                        </View>
                        <View style={styles.profileTableRow}>
                            <Text style={styles.profileTableCell}>2025-06-01</Text>
                            <Text style={styles.profileTableCell}>Win</Text>
                            <Text style={styles.profileTableCell}>₹1000</Text>
                        </View>
                        <View style={styles.profileTableRow}>
                            <Text style={styles.profileTableCell}>2025-05-30</Text>
                            <Text style={styles.profileTableCell}>Loss</Text>
                            <Text style={styles.profileTableCell}>₹500</Text>
                        </View>
                    </View> */}

                    {/* Action Buttons */}
                    {/* <View style={styles.profileButtonGrid}>
                        <TouchableOpacity style={[styles.profileActionButton, { backgroundColor: '#3b82f6' }]}>
                            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Edit Profile</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.profileActionButton, { backgroundColor: '#10b981' }]}>
                            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Withdraw</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.profileActionButton, { backgroundColor: '#f97316' }]}>
                            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Deposit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.profileActionButton, { backgroundColor: '#64748b' }]}>
                            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Logout</Text>
                        </TouchableOpacity>
                    </View> */}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};
