import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { View, Text, SafeAreaView, StatusBar, TouchableOpacity, TextInput, ScrollView, Dimensions, KeyboardAvoidingView, Platform } from 'react-native';
import { styles, themeStyles } from '../../assets/styles/ThemeStyles';
import themeColors from '../../assets/styles/Colors';
import { ThemeContext } from '../context/ThemeContext';
import Footer from '../components/Footer';
import { StreamListHeader } from '../components/StreamListHeader';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Dropdown } from 'react-native-element-dropdown';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppContext } from '../context/AppContext';
import Apiclient from '../utils/Apiclient';
import { SendErrorTotheServer } from '../utils/constant';
const screenWidth = Dimensions.get('window').width;
const cardWidth = screenWidth / 3 - 18; // 3 columns with margin


export const WalletDashboardScreen = () => {
    const { userData } = useAppContext();
    const insetsTop = useSafeAreaInsets();
    const { theme } = useContext(ThemeContext);
    const scrollRef = useRef(null);
    const [activeTab, setActiveTab] = useState('Deposit');
    const [selectedAmount, setSelectedAmount] = useState(5);
    const [paymentMethod, setPaymentMethod] = useState('');
    const [selectBankName, setSelectBankName] = useState('');
    const [userName, setUserName] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [friendsData, setFriendsData] = useState([]);
    const [filteredFriends, setFilteredFriends] = useState([]);
    const [isFocused, setIsFocused] = useState(false);
    const [selectedFriend, setSelectedFriend] = useState(null);
    const [bankListData, setBankListData] = useState([]);

    const amounts = [5, 10, 20, 50, 100, 500, 1000];
    const methods = ['Bank to Bank', 'Crypto', 'Case'];
    // const bankName = ['Bank 1', 'Bank 2', 'Bank 3'];

    // const getToken = async () => {
    //     const token = await AsyncStorage.getItem('token');
    //     console.log('token', token);
    // };

    // useEffect(() => {
    //     getToken();
    // }, []);


    // Function to fetch friends data blocked/unblocked user from the API

    const getFriendsData = useCallback(async () => {
        if (!userData.userid) return
        try {

            const postData = {
                userId: userData.userid,
                isBlocked: 0,
            };

            const response = await Apiclient.post('/getFriendsList', postData);
            // console.log('response getFriendsList', response.data.friends);
            if (response.status === 200) {
                const data = response.data?.friends || [];
                setFriendsData(data);
                setFriendsData(data);
                setFilteredFriends(data);
            }
        } catch (error) {
            console.error('Error fetching friends data list:', error);
            SendErrorTotheServer(error, 'getFriendsList');
        }
    }, [userData.userid]);

    useEffect(() => {
        getFriendsData();
    }, [getFriendsData]);

    // Filter friends based on userName input
    useEffect(() => {
        if (userName.trim() === '') {
            setFilteredFriends(friendsData);
        } else {
            const filtered = friendsData.filter(friend =>
                friend.username.toLowerCase().includes(userName.toLowerCase())
            );
            setFilteredFriends(filtered);
        }
    }, [userName, friendsData]);


    // useEffect(() => {
    //     console.log('selectedFriend', selectedFriend);
    // }, [selectedFriend]);

    // useEffect(() => {
    //     console.log('selectedAmount', selectedAmount);
    // }, [selectedAmount]);


    // Function to fetch social data from the API
    useEffect(() => {
        const getBankListData = async () => {
            try {
                const response = await Apiclient.post(`/saveuserbank/getUserBankList?userID=${userData.userid}`);
                const apiData = response.data?.data || [];

                // Transform API data to local format
                const transformedData = apiData.map((item, index) => ({
                    id: index + 1, // Unique ID for rendering
                    BankID: item.BankID,
                    bankName: item.BankName,
                    accountNumber: item.AccountNumber,
                    isPrimaryAccount: item.IsPrimary === 1 ? 'Y' : 'N',
                }));

                setBankListData(transformedData);
                // console.log('Bank List Data:', transformedData);
            } catch (error) {
                console.error('Error fetching bank list:', error);
            }
        };
        if (userData.userid) {
            getBankListData();
        }
    }, [userData.userid]);

    // Handle tab change
    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setErrorMessage('');
        setSelectedAmount(5);
        setPaymentMethod(methods[0]);
        setUserName('');
        setSelectedFriend(null);
    };

    const handleSubmit = async () => {
        // const token = await AsyncStorage.getItem('token');
        // if (!token || !userData?.userid) {
        //     setErrorMessage('Invalid user session');
        //     return;
        // }
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
            try {
                if (!selectedFriend) {
                    setErrorMessage('Please select a valid user');
                    return;
                }
                setErrorMessage('');
                const postData = {
                    // token: token,
                    senderId: userData.userid,
                    recipientId: selectedFriend.userid,
                    // amount: selectedAmount,
                    amount: Number(selectedAmount.toFixed(2)),
                };

                console.log('transfercredit postData', postData);
                const response = await Apiclient.post('/transfercredit', postData);
                if (response.status === 200) {
                    const data = response.data || [];
                    setErrorMessage(response.data?.message);
                    console.log('transfercredit response', data);
                } else {
                    setErrorMessage(response.data?.message);
                }
            } catch (error) {
                console.error('Error getting when transfer amount to user:', error);
                SendErrorTotheServer(error, 'getFriendRequestData');
                setErrorMessage('Error getting when transfer amount to user');
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
                    backgroundColor="#fff"
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
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={{ flex: 1 }}
                        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 80} // adjust as needed
                    >
                        <ScrollView
                            ref={scrollRef}
                            contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
                            keyboardShouldPersistTaps="handled"
                            nestedScrollEnabled={true}
                        >
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
                                        <Dropdown
                                            style={styles.wdDropdown}
                                            data={methods.map((item) => ({ label: item, value: item }))}
                                            labelField="label"
                                            valueField="value"
                                            placeholder="Select Deposit method"
                                            value={paymentMethod}
                                            onChange={(item) => setPaymentMethod(item.value)}
                                            // search
                                            placeholderStyle={{ color: '#858585' }}
                                            selectedTextStyle={{ color: '#414141' }}
                                            iconColor="#414141"
                                        />
                                    </View>

                                ) : activeTab === 'Withdraw' ? (
                                    <>
                                        {/* if tab is withdraw */}
                                        <View style={styles.wdPickerWrapper}>
                                            <Dropdown
                                                style={styles.wdDropdown}
                                                data={
                                                    bankListData.length > 0
                                                        ? bankListData.map((item) => ({ label: item.bankName, value: item.BankID }))
                                                        : [{ label: 'No bank data available', value: null }]
                                                }
                                                labelField="label"
                                                valueField="value"
                                                placeholder="Select Bank"
                                                value={selectBankName}
                                                onChange={(item) => {
                                                    if (item.value !== null) {
                                                        setSelectBankName(item.value);
                                                    }
                                                }}
                                                placeholderStyle={{ color: '#858585' }}
                                                selectedTextStyle={{ color: '#414141' }}
                                                iconColor="#414141"
                                            />
                                        </View>
                                    </>
                                ) : <>
                                    <View style={styles.wdPickerWrapper}>
                                        <Dropdown
                                            style={styles.wdDropdown}
                                            data={friendsData.length > 0 ? friendsData.map((friend) => ({
                                                label: friend.username,
                                                value: friend.userid,
                                                full: friend,
                                            })) : [{ label: 'No friends are available', value: null }]}
                                            search
                                            labelField="label"
                                            valueField="value"
                                            placeholder="Enter recipient username"
                                            searchPlaceholder="Type username"
                                            value={selectedFriend?.userid}
                                            onFocus={() => {
                                                setIsFocused(true);
                                                setTimeout(() => {
                                                    scrollRef.current?.scrollTo({
                                                        y: 400, // adjust this value based on layout
                                                        animated: true,
                                                    });
                                                }, 100); // Delay to wait for keyboard animation
                                            }}
                                            onBlur={() => setIsFocused(false)}
                                            onChange={(item) => {
                                                setUserName(item.label);
                                                setSelectedFriend(item.full);
                                            }}
                                            placeholderStyle={{ color: '#858585' }}
                                            selectedTextStyle={{ color: '#414141' }}
                                            iconColor="#414141"
                                            itemTextStyle={{ color: '#000' }}
                                        />
                                    </View>
                                </>}

                                {errorMessage !== '' && <Text style={styles.wdFormError}>{errorMessage}</Text>}
                                {/* actions bases on active tab */}
                                <TouchableOpacity onPress={handleSubmit} style={styles.wdFormButtonOverlay}>
                                    <LinearGradient
                                        colors={['rgba(184, 58, 243, 1)', 'rgba(105, 80, 251, 1)']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                        style={styles.wdFormGradientButton}
                                    >
                                        <Text style={styles.wdFormSubmitText}>{activeTab === 'Deposit' ? 'Deposit' : activeTab === 'Withdraw' ? 'Place Withdraw request' : 'Transfer'} </Text>
                                    </LinearGradient>
                                </TouchableOpacity>

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
                                        <Text style={styles.wdRefStateValue}>{userData?.CreditBalance}</Text>
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
                    </KeyboardAvoidingView>

                </View>
                <Footer />
            </SafeAreaView>
        </LinearGradient>

    );
};

