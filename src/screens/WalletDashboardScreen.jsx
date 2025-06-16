import React, { useContext, useEffect, useState } from 'react';
import { View, Text, SafeAreaView, StatusBar, TouchableOpacity } from 'react-native';
import { styles, themeStyles } from '../../assets/styles/ThemeStyles';
import { ThemeContext } from '../context/ThemeContext';
import Footer from '../components/Footer';
import { StreamListHeader } from '../components/StreamListHeader';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import { Appearance } from 'react-native';

const colorScheme = Appearance.getColorScheme(); // 'dark' or 'light'

const isDark = colorScheme === 'dark';


export const WalletDashboardScreen = ({ userData }) => {
    const insetsTop = useSafeAreaInsets();
    const { theme } = useContext(ThemeContext);

    const [activeTab, setActiveTab] = useState('Deposit');
    const [selectedAmount, setSelectedAmount] = useState(5);
    const [paymentMethod, setPaymentMethod] = useState('Bank to Bank');
    const [selectBankName, setSelectBankName] = useState('Bank 1');
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
        if (!paymentMethod) {
            setErrorMessage('Please select a payment method');
        } else {
            setErrorMessage('');
            // Add your submission logic here
        }
    };


    useEffect(() => {
        console.log('activeTab', activeTab);
    }, [activeTab]);


    return (
        <LinearGradient
            style={[styles.messageListGradientBox, { paddingTop: insetsTop.top }]}
            colors={['#a000df', '#fc4692']}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}>
            <SafeAreaView style={[styles.messageListSafeView]}>
                <StatusBar
                    hidden={false} // Show the status bar
                    barStyle="light-content"
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
                    {/* Tab Buttons */}
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
                    {/* selected amount */}
                    <Text
                        style={[
                            styles.streamListMainTitle,
                            themeStyles[theme].streamListMainTitle,
                            ,
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
                    {/* forms */}
                    {/* Picker */}
                    <View style={styles.wDFormContainer}>
                        <View style={styles.wdPickerWrapper}>
                            {activeTab === 'Deposit' ? (
                                <Picker
                                    selectedValue={paymentMethod}
                                    onValueChange={(itemValue) => setPaymentMethod(itemValue)}
                                    style={styles.wdPicker}
                                    dropdownIconColor="#414141" // For Android
                                    mode="dropdown"
                                >
                                    {methods.map((method, index) => (
                                        <Picker.Item key={index} label={method} value={method} color="#41414" />
                                    ))}
                                </Picker>
                            ) : activeTab === 'Withdraw' ? <Picker
                                selectedValue={selectBankName}
                                onValueChange={(itemValue) => setSelectBankName(itemValue)}
                                style={styles.wdPicker}
                                dropdownIconColor="#414141" // For Android
                                mode="dropdown"
                            >
                                {bankName.map((method, index) => (
                                    <Picker.Item key={index} label={method} value={method} color="#41414" />
                                ))}
                            </Picker> : <Picker
                                selectedValue={paymentMethod}
                                onValueChange={(itemValue) => setPaymentMethod(itemValue)}
                                style={styles.wdPicker}
                                dropdownIconColor="#414141" // For Android
                                mode="dropdown"
                            >
                                {methods.map((method, index) => (
                                    <Picker.Item key={index} label={method} value={method} color="#41414" />
                                ))}
                            </Picker>}

                        </View>
                        {/* {errorMessage !== '' && <Text style={styles.wdFormError}>{errorMessage}</Text>} */}
                        <Text style={styles.wdFormError}>This is an error message</Text>

                        {/* Submit Button */}
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
                            Add funds to your account securely using any supported payment method.
                        </Text>
                    </View>

                </View>
                <Footer />
            </SafeAreaView>
        </LinearGradient>

    );
};

