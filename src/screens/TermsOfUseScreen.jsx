import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    SafeAreaView,
    Linking,
    Alert,
    StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';

const TermsOfUseScreen = ({ navigation }) => {
    const insetsTop = useSafeAreaInsets();
    const [activeTab, setActiveTab] = useState('about');

    const tabs = [
        { id: 'about', label: 'About Us', icon: 'people-outline' },
        { id: 'privacy', label: 'Privacy Policy', icon: 'shield-outline' },
        { id: 'terms', label: 'Terms & Conditions', icon: 'document-text-outline' }
    ];

    const handleExternalLink = async (url) => {
        try {
            const supported = await Linking.canOpenURL(url);
            if (supported) {
                await Linking.openURL(url);
            } else {
                Alert.alert('Error', 'Cannot open this URL');
            }
        } catch (error) {
            Alert.alert('Error', 'An error occurred while opening the link');
        }
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'about':
                return (
                    <ScrollView style={styles.contentContainer}>
                        <View style={styles.centerContent}>
                            <View style={[styles.iconContainer, { backgroundColor: '#E3F2FD' }]}>
                                <Ionicons name="people-outline" size={40} color="#1976D2" />
                            </View>
                            <Text style={styles.title}>About StreamSphere</Text>
                            <Text style={styles.subtitle}>Connecting the world through live video</Text>
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Our Mission</Text>
                            <Text style={styles.sectionText}>
                                StreamSphere is a live streaming platform designed to connect people from around the world. Our mission is to empower creators, foster meaningful interactions, and build communities through real-time video content.
                            </Text>

                            <Text style={styles.sectionTitle}>What We Do</Text>
                            <Text style={styles.sectionText}>
                                We provide a stage for streamers to showcase their talents, chat with followers, and collaborate with other creators in multi-host environments. Whether you're broadcasting, joining as a guest, or watching others, StreamSphere brings entertainment closer to you.
                            </Text>

                            <Text style={styles.sectionTitle}>Core Values</Text>
                            <View style={styles.valueItem}>
                                <View style={styles.bullet} />
                                <Text style={styles.valueText}>Safety and user trust come first</Text>
                            </View>
                            <View style={styles.valueItem}>
                                <View style={styles.bullet} />
                                <Text style={styles.valueText}>Encouraging creativity and diversity</Text>
                            </View>
                            <View style={styles.valueItem}>
                                <View style={styles.bullet} />
                                <Text style={styles.valueText}>Innovating for real-time engagement</Text>
                            </View>
                        </View>
                        {/* 
                        <TouchableOpacity
                            style={[styles.linkButton, { backgroundColor: '#1976D2' }]}
                            onPress={() => handleExternalLink('https://your-streamingapp.com/about')}
                        >
                            <Ionicons name="open-outline" size={20} color="white" />
                            <Text style={styles.linkButtonText}>Visit Our Website</Text>
                        </TouchableOpacity> */}
                    </ScrollView>
                );

            case 'privacy':
                return (
                    <ScrollView style={styles.contentContainer}>
                        <View style={styles.centerContent}>
                            <View style={[styles.iconContainer, { backgroundColor: '#E8F5E8' }]}>
                                <Ionicons name="shield-outline" size={40} color="#388E3C" />
                            </View>
                            <Text style={styles.title}>Privacy Policy</Text>
                            <Text style={styles.subtitle}>Your privacy in a live world matters</Text>
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>User Data Collection</Text>
                            <Text style={styles.sectionText}>
                                We collect information such as usernames, profile data, streaming interactions, and basic device info to enhance your experience. Data is used for account management, security, and feature improvements.
                            </Text>

                            <Text style={styles.sectionTitle}>Streaming Privacy</Text>
                            <Text style={styles.sectionText}>
                                While live video is public, we provide controls for managing visibility, audience interactions, and reporting abuse. Sensitive information should never be shared during streams.
                            </Text>

                            <Text style={styles.sectionTitle}>Third-Party Services</Text>
                            <Text style={styles.sectionText}>
                                To support features like payments, analytics, and video delivery, we integrate with third-party providers who follow industry data protection standards.
                            </Text>
                        </View>

                        {/* <View style={styles.warningBox}>
                            <Text style={styles.warningText}>
                                <Text style={styles.warningBold}>Reminder:</Text> You are in control of your data. Adjust your privacy settings anytime in your profile.
                            </Text>
                        </View>

                        <TouchableOpacity
                            style={[styles.linkButton, { backgroundColor: '#388E3C' }]}
                            onPress={() => handleExternalLink('https://your-streamingapp.com/privacy-policy')}
                        >
                            <Ionicons name="open-outline" size={20} color="white" />
                            <Text style={styles.linkButtonText}>Read Full Privacy Policy</Text>
                        </TouchableOpacity> */}
                    </ScrollView>
                );

            case 'terms':
                return (
                    <ScrollView style={styles.contentContainer}>
                        <View style={styles.centerContent}>
                            <View style={[styles.iconContainer, { backgroundColor: '#F3E5F5' }]}>
                                <Ionicons name="document-text-outline" size={40} color="#7B1FA2" />
                            </View>
                            <Text style={styles.title}>Terms & Conditions</Text>
                            <Text style={styles.subtitle}>Our rules for safe and fun streaming</Text>
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Using the Platform</Text>
                            <Text style={styles.sectionText}>
                                By accessing StreamSphere, you agree to follow our content policies and community guidelines. You must be at least 18 years old or have parental consent to use this platform.
                            </Text>

                            <Text style={styles.sectionTitle}>Content Responsibility</Text>
                            <Text style={styles.sectionText}>
                                You are responsible for what you stream or post. Nudity, hate speech, or any illegal activity is strictly prohibited and may result in account suspension.
                            </Text>

                            <Text style={styles.sectionTitle}>Moderation and Enforcement</Text>
                            <Text style={styles.sectionText}>
                                We use automated tools and community reporting to keep the platform safe. Repeat violations may lead to permanent bans.
                            </Text>

                            <Text style={styles.sectionTitle}>Subscriptions and Payments</Text>
                            <Text style={styles.sectionText}>
                                If you subscribe to creators or make purchases, you agree to the pricing and refund terms shown during checkout.
                            </Text>
                        </View>

                        {/* <View style={[styles.warningBox, { backgroundColor: '#FFEBEE', borderColor: '#FFCDD2' }]}>
                            <Text style={[styles.warningText, { color: '#C62828' }]}>
                                <Text style={styles.warningBold}>Important:</Text> These terms are subject to change. We will notify users of significant updates.
                            </Text>
                        </View>

                        <TouchableOpacity
                            style={[styles.linkButton, { backgroundColor: '#7B1FA2' }]}
                            onPress={() => handleExternalLink('https://your-streamingapp.com/terms-conditions')}
                        >
                            <Ionicons name="open-outline" size={20} color="white" />
                            <Text style={styles.linkButtonText}>Read Full Terms & Conditions</Text>
                        </TouchableOpacity> */}
                    </ScrollView>
                );

            default:
                return null;
        }
    };

    return (
        <SafeAreaView style={[styles.container, { paddingBottom: 80, paddingTop: insetsTop.top }]}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Legal Information</Text>
            </View>

            <View style={styles.tabContainer}>
                {tabs.map((tab) => (
                    <TouchableOpacity
                        key={tab.id}
                        style={[
                            styles.tab,
                            activeTab === tab.id && styles.activeTab
                        ]}
                        onPress={() => setActiveTab(tab.id)}
                    >
                        <Ionicons
                            name={tab.icon}
                            size={24}
                            color={activeTab === tab.id ? '#1976D2' : '#666'}
                        />
                        <Text style={[
                            styles.tabLabel,
                            activeTab === tab.id && styles.activeTabLabel
                        ]}>
                            {tab.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {renderContent()}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    backButton: {
        padding: 8,
        marginRight: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#333',
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    tab: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 8,
    },
    activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: '#1976D2',
    },
    tabLabel: {
        fontSize: 12,
        fontWeight: '500',
        color: '#666',
        marginTop: 4,
        textAlign: 'center',
    },
    activeTabLabel: {
        color: '#1976D2',
    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    centerContent: {
        alignItems: 'center',
        marginBottom: 24,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    section: {
        backgroundColor: '#F5F5F5',
        padding: 20,
        borderRadius: 12,
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
    },
    sectionText: {
        fontSize: 16,
        color: '#666',
        lineHeight: 24,
        marginBottom: 16,
    },
    valueItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    bullet: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#1976D2',
        marginTop: 8,
        marginRight: 12,
    },
    valueText: {
        flex: 1,
        fontSize: 16,
        color: '#666',
        lineHeight: 24,
    },
    warningBox: {
        backgroundColor: '#FFF3E0',
        borderWidth: 1,
        borderColor: '#FFE0B2',
        padding: 16,
        borderRadius: 8,
        marginBottom: 20,
    },
    warningText: {
        fontSize: 14,
        color: '#E65100',
        lineHeight: 20,
    },
    warningBold: {
        fontWeight: 'bold',
    },
    linkButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 12,
        marginBottom: 20,
    },
    linkButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
});

export default TermsOfUseScreen;
