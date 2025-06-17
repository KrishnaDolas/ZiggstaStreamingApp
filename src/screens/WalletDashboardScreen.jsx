import React, { useContext, useState } from 'react';
import { View, Text, SafeAreaView, StatusBar, TouchableOpacity, TextInput, ScrollView, Dimensions } from 'react-native';
import { styles, themeStyles } from '../../assets/styles/ThemeStyles';
import themeColors from '../../assets/styles/Colors';
import { ThemeContext } from '../context/ThemeContext';
import Footer from '../components/Footer';
import { StreamListHeader } from '../components/StreamListHeader';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
const screenWidth = Dimensions.get('window').width;
const cardWidth = screenWidth / 3 - 22; // 3 columns with margin


export const WalletDashboardScreen = ({ userData }) => {
    const insetsTop = useSafeAreaInsets();
    const { theme } = useContext(ThemeContext);

    const [activeTab, setActiveTab] = useState('Deposit');
    const [selectedAmount, setSelectedAmount] = useState(5);
    const [paymentMethod, setPaymentMethod] = useState('');
    const [selectBankName, setSelectBankName] = useState('');
    const [userName, setUserName] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const amounts = [5, 10, 20, 50, 100, 500, 1000];
    const methods = ['Bank to Bank', 'Crypto', 'Case'];
    const bankName = ['Bank 1', 'Bank 2', 'Bank 3'];


    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setErrorMessage('');
        setSelectedAmount(5);
        setPaymentMethod(methods[0]);
    };

    const handleSubmit = () => {
        if (activeTab === 'Deposit') {
            if (!paymentMethod) {
                setErrorMessage('Please select a payment method');
            } else {
                setErrorMessage('');
            }
        } else if (activeTab === 'Withdraw') {
            if (!selectBankName) {
                setErrorMessage('Please select bank name');
            } else {
                setErrorMessage('');
            }
        } else {
            if (userName === '') {
                setErrorMessage('Please enter user name');
            } else {
                setErrorMessage('');
            }
        }
    };

    return (
        <LinearGradient
            style={[styles.messageListGradientBox, { paddingTop: insetsTop.top }]}
            colors={[themeColors.headerGradientTop, themeColors.headerGradientBottom]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}>
            <SafeAreaView style={[styles.messageListSafeView]}>
                <StatusBar
                    hidden={false} // Show the status bar
                    barStyle="dark-content"
                />
                <StreamListHeader />
                <View
                    style={[
                        styles.messageListMainCardLayout,
                        themeStyles[theme].messageListMainCardLayout,
                    ]}>
                    <Text
                        style={[
                            styles.streamListMainTitle,
                            themeStyles[theme].streamListMainTitle,
                        ]}
                    >
                        Wallet Dashboard
                    </Text>
                    <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}>
                        {/* wallet tabs button */}
                        <View style={styles.wdTabContainer}>
                            {['Deposit', 'Withdraw', 'Transfer'].map((tab, index) => (
                                <TouchableOpacity
                                    key={tab}
                                    style={[styles.wdTabButton, activeTab === tab && styles.wdActiveTab, { marginLeft: index === 0 ? 0 : 8 }]}
                                    onPress={() => handleTabChange(tab)}
                                >
                                    <Text style={[styles.wdTabText, activeTab === tab && styles.wdActiveTabText]}>
                                        {tab}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        {/* select amount */}
                        <Text
                            style={[
                                styles.streamListMainTitle,
                                themeStyles[theme].streamListMainTitle,
                                { fontWeight: '400' }
                            ]}
                        >
                            Select Amount
                        </Text>
                        <View style={styles.wdAmountContainer}>
                            {amounts.map((amount) => (
                                <TouchableOpacity
                                    key={amount}
                                    style={[
                                        styles.wdAmountButton,
                                        selectedAmount === amount && styles.wdAmountSelected,
                                    ]}
                                    onPress={() => setSelectedAmount(amount)}
                                >
                                    <Text
                                        style={[
                                            styles.wdAmountText,
                                            selectedAmount === amount && styles.wdAmountTextSelected,
                                        ]}
                                    >
                                        {amount}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        {/* forms inputs based on wallet tabs  */}
                        <View style={styles.wDFormContainer}>

                            {/* if tab is deposit */}
                            {activeTab === 'Deposit' ? (
                                <View style={styles.wdPickerWrapper}>
                                    <Picker
                                        selectedValue={paymentMethod}
                                        onValueChange={(itemValue) => setPaymentMethod(itemValue)}
                                        style={styles.wdPicker}
                                        dropdownIconColor="#414141" // For Android
                                        mode="dropdown"
                                    >
                                        <Picker.Item label="Select Deposit method" value="" color="#999999" />
                                        {methods.map((method, index) => (
                                            <Picker.Item key={index} label={method} value={method} color="#41414" />
                                        ))}
                                    </Picker>
                                </View>

                            ) : activeTab === 'Withdraw' ? (
                                <>
                                    {/* if tab is withdraw */}
                                    <View style={styles.wdPickerWrapper}>
                                        <Picker
                                            selectedValue={selectBankName}
                                            onValueChange={(itemValue) => setSelectBankName(itemValue)}
                                            style={styles.wdPicker}
                                            dropdownIconColor="#414141" // For Android
                                            mode="dropdown"
                                        >
                                            <Picker.Item label="Select Bank" value="" color="#999999" />
                                            {bankName.map((method, index) => (
                                                <Picker.Item key={index} label={method} value={method} color="#41414" />
                                            ))}
                                        </Picker>
                                    </View>
                                </>
                            ) : <>
                                {/* if tab is transfer */}
                                <TextInput
                                    value={userName}
                                    onChangeText={setUserName}
                                    style={styles.wdInput}
                                    autoCapitalize="none"
                                    placeholder="Enter recipient username"
                                    placeholderTextColor="#858585"
                                />
                            </>}

                            {errorMessage !== '' && <Text style={styles.wdFormError}>{errorMessage}</Text>}
                            {/* <Text style={styles.wdFormError}>This is an error message</Text> */}
                            {/* actions bases on active tab */}
                            <LinearGradient
                                colors={['rgba(184, 58, 243, 1)', 'rgba(105, 80, 251, 1)']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.wdFormGradientButton}
                            >
                                <TouchableOpacity onPress={handleSubmit} style={styles.wdFormButtonOverlay}>
                                    <Text style={styles.wdFormSubmitText}>{activeTab === 'Deposit' ? 'Deposit' : activeTab === 'Withdraw' ? 'Place Withdraw request' : 'Transfer'} </Text>
                                </TouchableOpacity>
                            </LinearGradient>

                            {/* Info Text */}
                            <Text style={styles.wdFormInfoText}>
                                {activeTab === 'Deposit' ?
                                    'Add funds to your account securely using any supported payment method.' : activeTab === 'Withdraw' ? 'Transfer your balance to your bank or preferred payout option.' : 'Transfer credits to another Ziggster.'}
                            </Text>
                        </View>

                        {/* Referral stats */}
                        <Text
                            style={[
                                styles.streamListMainTitle,
                                themeStyles[theme].streamListMainTitle,
                                { fontWeight: '400' }
                            ]}
                        >
                            Referral Stats
                        </Text>
                        <View style={styles.wDReferralStatsContainer}>
                            <View style={styles.wDReferralStatsRow}>
                                <View style={[styles.wdRefStateCard, { width: cardWidth }]}>
                                    <Text style={styles.wdRefStateTitle}>Balance</Text>
                                    <Text style={styles.wdRefStateValue}>200</Text>
                                </View>
                                <View style={[styles.wdRefStateCard, { width: cardWidth }]}>
                                    <Text style={styles.wdRefStateTitle}>Today's Signups</Text>
                                    <Text style={styles.wdRefStateValue}>20</Text>
                                </View>
                                <View style={[styles.wdRefStateCard, { width: cardWidth }]}>
                                    <Text style={styles.wdRefStateTitle}>Monthly Signup</Text>
                                    <Text style={styles.wdRefStateValue}>180</Text>
                                </View>
                            </View>
                            <View style={styles.wDReferralStatsRow}>
                                <View style={[styles.wdRefStateCard, { width: cardWidth }]}>
                                    <Text style={styles.wdRefStateTitle}>Total Signup</Text>
                                    <Text style={styles.wdRefStateValue}>400</Text>
                                </View>
                                <View style={[styles.wdRefStateCard, { width: cardWidth }]}>
                                    <Text style={styles.wdRefStateTitle}>Analytics</Text>
                                    <Text style={styles.wdRefStateValue}>30</Text>
                                </View>
                                <View style={[styles.wdRefStateCard, { width: cardWidth }]}>
                                    <Text style={styles.wdRefStateTitle}>Coming Soon</Text>
                                    <Text style={styles.wdRefStateValue}>?</Text>
                                </View>
                            </View>
                        </View>
                    </ScrollView>
                </View>
                <Footer />
            </SafeAreaView>
        </LinearGradient>

    );
};

