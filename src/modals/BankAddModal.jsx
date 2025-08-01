import React, { useContext, useEffect, useState } from 'react';
import {
    View, TouchableOpacity, Text, TextInput, ScrollView, KeyboardAvoidingView, Platform,
    Alert,
    ActivityIndicator
} from 'react-native';
import Modal from 'react-native-modal';
import { Dropdown } from 'react-native-element-dropdown';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { styles, themeStyles } from '../../assets/styles/ThemeStyles';
import { Picker } from '@react-native-picker/picker';
import Apiclient from '../utils/Apiclient';
import MessageModal from './MessageModal';
import { SendErrorTotheServer } from '../utils/constant';
import { ThemeContext } from '../context/ThemeContext';

const BankAddModal = ({ visible, onClose, userData, bankListData, onSuccess }) => {
    const { theme } = useContext(ThemeContext);
    const [selectedRegion, setSelectedRegion] = useState('');
    const [isModalRendered, setIsModalRendered] = useState(false);
    const [visibleModal, setVisibleModal] = useState(null);
    const [message, setMessage] = useState(null);
    const [formData, setFormData] = useState({
        accountHolder: '',
        accountNumber: '',
        bankName: '',
        bankAddress: '',
        ifscCode: '',
        swiftCode: '',
        branchName: '',
        routingNumber: '',
        iban: '',
        bicSwiftCode: '',
        sortCode: '',
        bsbCode: '',
    });

    // Cleanup modals on unmount
    useEffect(() => {
        return () => {
            setVisibleModal(null); // Close all modals
        };
    }, []);

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    // Modified handleInputChange - no uppercase conversion here
    const handleInputChange = (field, value) => {
        const trimmedValue = value.trimStart(); // Trim only start to allow typing with space later
        setFormData(prev => ({ ...prev, [field]: trimmedValue }));
        setErrors(prev => ({ ...prev, [field]: '' }));
    };

    // Helper function to get autoCapitalize value for each field
    const getAutoCapitalize = (field) => {
        const uppercaseFields = ['ifscCode', 'bicSwiftCode', 'swiftCode', 'iban', 'bsbCode'];
        if (uppercaseFields.includes(field)) return 'characters';
        if (field === 'accountNumber' && selectedRegion === 'intl') return 'characters';
        return 'none';
    };

    // Helper function to format data for API (convert to uppercase where needed)
    const getFormattedFormData = () => {
        const uppercaseFields = ['ifscCode', 'bicSwiftCode', 'swiftCode', 'iban', 'bsbCode'];
        const formatted = { ...formData };

        // Convert specific fields to uppercase
        uppercaseFields.forEach(field => {
            if (formatted[field]) {
                formatted[field] = formatted[field].toUpperCase();
            }
        });

        // Handle accountNumber for international region
        if (selectedRegion === 'intl' && formatted.accountNumber) {
            formatted.accountNumber = formatted.accountNumber.toUpperCase();
        }

        return formatted;
    };

    const ErrorText = ({ field }) =>
        errors[field] ? <Text style={{ color: 'red', fontSize: 12 }}>{errors[field]}</Text> : null;


    const validateFields = () => {
        let tempErrors = {};

        const regex = {
            name: /^[a-zA-Z\s]+$/,                             // Valid for names like "John Doe"
            accountNumber: /^\d{8,20}$/,                       // 8–20 digits only
            ifsc: /^[A-Z]{4}0[A-Z0-9]{6}$/,                    // e.g., SBIN0001234
            swift: /^[A-Za-z0-9]{8,11}$/,                      // e.g., HDFCINBBXXX
            iban: /^[A-Z]{2}[0-9A-Z]{14,32}$/,                 // e.g., GB29NWBK60161331926819
            routing: /^\d{9}$/,                                // U.S. Routing number, 9 digits
            sortCode: /^\d{6}$/,                               // U.K. Sort code, 6 digits
            bsb: /^[A-Za-z0-9]{3,6}$/,                         // ✔️ Fixed: 3–6 alphanumeric characters
            address: /^[a-zA-Z0-9\s,./#()-]+$/,                // ✔️ Fixed: allows commas, slashes, dots, parentheses
        };

        if (!selectedRegion.trim()) tempErrors.selectedRegion = 'Region is required';

        if (!formData.accountHolder.trim()) {
            tempErrors.accountHolder = 'Account holder name is required';
        } else if (!regex.name.test(formData.accountHolder)) {
            tempErrors.accountHolder = 'Only alphabets and spaces allowed';
        }

        if (!formData.bankName.trim()) {
            tempErrors.bankName = 'Bank name is required';
        } else if (!regex.name.test(formData.bankName)) {
            tempErrors.bankName = 'Invalid bank name';
        }

        if (!formData.bankAddress.trim()) {
            tempErrors.bankAddress = 'Bank address is required';
        } else if (!regex.address.test(formData.bankAddress)) {
            tempErrors.bankAddress = 'Invalid bank address';
        }

        // Get formatted data for validation (with uppercase)
        const formattedData = getFormattedFormData();

        switch (selectedRegion) {
            case 'us':
                if (!formattedData.accountNumber.trim()) {
                    tempErrors.accountNumber = 'Account number is required';
                } else if (!regex.accountNumber.test(formattedData.accountNumber)) {
                    tempErrors.accountNumber = 'Account number should be 8–20 digits';
                }

                if (!formattedData.routingNumber.trim()) {
                    tempErrors.routingNumber = 'Routing number is required';
                } else if (!regex.routing.test(formattedData.routingNumber)) {
                    tempErrors.routingNumber = 'Routing number must be 9 digits';
                }
                break;

            case 'eu':
                if (!formattedData.iban.trim()) {
                    tempErrors.iban = 'IBAN is required';
                } else if (!regex.iban.test(formattedData.iban)) {
                    tempErrors.iban = 'Invalid IBAN format';
                }

                if (!formattedData.bicSwiftCode.trim()) {
                    tempErrors.bicSwiftCode = 'SWIFT/BIC code is required';
                } else if (!regex.swift.test(formattedData.bicSwiftCode)) {
                    tempErrors.bicSwiftCode = 'Invalid SWIFT/BIC format';
                }
                break;

            case 'uk':
                if (!formattedData.sortCode.trim()) {
                    tempErrors.sortCode = 'Sort code is required';
                } else if (!regex.sortCode.test(formattedData.sortCode)) {
                    tempErrors.sortCode = 'Sort code must be 6 digits';
                }

                if (!formattedData.accountNumber.trim()) {
                    tempErrors.accountNumber = 'Account number is required';
                } else if (!regex.accountNumber.test(formattedData.accountNumber)) {
                    tempErrors.accountNumber = 'Account number should be 8–20 digits';
                }
                break;

            case 'in':
                if (!formattedData.accountNumber.trim()) {
                    tempErrors.accountNumber = 'Account number is required';
                } else if (!regex.accountNumber.test(formattedData.accountNumber)) {
                    tempErrors.accountNumber = 'Account number should be 8–20 digits';
                }

                if (!formattedData.ifscCode.trim()) {
                    tempErrors.ifscCode = 'IFSC code is required';
                } else if (!regex.ifsc.test(formattedData.ifscCode)) {
                    tempErrors.ifscCode = 'Invalid IFSC code format';
                }
                break;

            case 'au':
                if (!formattedData.bsbCode.trim()) {
                    tempErrors.bsbCode = 'BSB code is required';
                } else if (!regex.bsb.test(formattedData.bsbCode)) {
                    tempErrors.bsbCode = 'BSB code must be 6 digits';
                }

                if (!formattedData.accountNumber.trim()) {
                    tempErrors.accountNumber = 'Account number is required';
                } else if (!regex.accountNumber.test(formattedData.accountNumber)) {
                    tempErrors.accountNumber = 'Account number should be 8–20 digits';
                }
                break;

            case 'sea':
                if (!formattedData.accountNumber.trim()) {
                    tempErrors.accountNumber = 'Account number is required';
                } else if (!regex.accountNumber.test(formattedData.accountNumber)) {
                    tempErrors.accountNumber = 'Account number should be 8–20 digits';
                }

                if (!formattedData.bsbCode.trim()) {
                    tempErrors.bsbCode = 'Bank code is required';
                } else if (!regex.bsb.test(formattedData.bsbCode)) {
                    tempErrors.bsbCode = 'Bank code should be 3–6 alphanumeric characters';
                }

                if (!formattedData.bicSwiftCode.trim()) {
                    tempErrors.bicSwiftCode = 'SWIFT/BIC code is required';
                } else if (!regex.swift.test(formattedData.bicSwiftCode)) {
                    tempErrors.bicSwiftCode = 'Invalid SWIFT/BIC format';
                }
                break;

            case 'intl':
                if (!formattedData.accountNumber.trim()) {
                    tempErrors.accountNumber = 'Account/IBAN is required';
                } else if (!regex.iban.test(formattedData.accountNumber)) {
                    tempErrors.accountNumber = 'Invalid IBAN/account number';
                }

                if (!formattedData.bicSwiftCode.trim()) {
                    tempErrors.bicSwiftCode = 'SWIFT/BIC code is required';
                } else if (!regex.swift.test(formattedData.bicSwiftCode)) {
                    tempErrors.bicSwiftCode = 'Invalid SWIFT/BIC format';
                }
                break;

            default:
                break;
        }

        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };


    const handleSubmit = async () => {
        if (!validateFields()) return;

        setLoading(true);

        // Get formatted data with uppercase fields
        const formattedData = getFormattedFormData();

        const payload = {
            UserID: userData.userid,
            BankName: formattedData.bankName.trim(),
            AccountNumber: formattedData.accountNumber.trim(),
            AccountHolderName: formattedData.accountHolder.trim(),
            IFSCCode: formattedData.ifscCode.trim(),
            SWIFTBIC: formattedData.swiftCode.trim() || formattedData.bicSwiftCode.trim(),
            IBAN: formattedData.iban.trim(),
            RoutingNumber: formattedData.routingNumber.trim(),
            Country: selectedRegion.toUpperCase(),
            Currency: 'AUD', // Optional or default
            BankAddress: formattedData.bankAddress.trim(),
            IsPrimary: bankListData?.length === 0 ? '1' : '0',
            SortCode: formattedData.sortCode.trim(),
            BSBCode: formattedData.bsbCode.trim(),
        };
        console.log('payload of saveuserbank', payload);
        try {
            const response = await Apiclient.post('https://api.streamalong.live/saveuserbank', payload);
            console.log('response of saveuserbank', response);
            if (response?.status === 201) {
                setMessage('Bank details saved successfully.');
                setVisibleModal('message-modal');
                setFormData({
                    accountHolder: '',
                    accountNumber: '',
                    bankName: '',
                    bankAddress: '',
                    ifscCode: '',
                    swiftCode: '',
                    branchName: '',
                    routingNumber: '',
                    iban: '',
                    bicSwiftCode: '',
                    sortCode: '',
                    bsbCode: '',
                });
                setSelectedRegion('');
                setTimeout(() => {
                    onSuccess?.();
                }, 2000);
            } else {
                // Alert.alert('Error', response?.data?.message || 'Something went wrong.');
                setMessage('Error', response?.data?.message || 'Something went wrong.');
                setVisibleModal('message-modal');
            }
        } catch (error) {
            Alert.alert('API Error', 'Unable to save bank details. Please try again later.');
            SendErrorTotheServer(error, 'handleAddBankDetails');
        } finally {
            setLoading(false);
        }
    };


    const renderRegionFields = () => {
        switch (selectedRegion) {
            case 'us':
                return (
                    <>
                        <Text style={[styles.bdLabel, themeStyles[theme].bdLabel]}>Account Number:</Text>
                        <TextInput
                            style={[styles.bdInput, themeStyles[theme].bdInput]}
                            value={formData.accountNumber}
                            onChangeText={(text) => handleInputChange('accountNumber', text)}
                            autoCapitalize={getAutoCapitalize('accountNumber')}
                            keyboardType="numeric"
                            maxLength={20}
                            minLength={8}
                        />
                        <ErrorText field="accountNumber" />

                        <Text style={[styles.bdLabel, themeStyles[theme].bdLabel]}>Routing Number (ABA):</Text>
                        <TextInput
                            style={[styles.bdInput, themeStyles[theme].bdInput]}
                            value={formData.routingNumber}
                            onChangeText={(text) => handleInputChange('routingNumber', text)}
                            autoCapitalize="none"
                            keyboardType="numeric"
                            maxLength={9}
                            minLength={9}
                        />
                        <ErrorText field="routingNumber" />
                    </>
                );
            case 'eu':
                return (
                    <>
                        <Text style={[styles.bdLabel, themeStyles[theme].bdLabel]}>IBAN:</Text>
                        <TextInput
                            style={[styles.bdInput, themeStyles[theme].bdInput]}
                            value={formData.iban}
                            onChangeText={(text) => handleInputChange('iban', text)}
                            autoCapitalize={getAutoCapitalize('iban')}
                            maxLength={34}
                            minLength={14}
                        />
                        <ErrorText field="iban" />

                        <Text style={[styles.bdLabel, themeStyles[theme].bdLabel]}>BIC/SWIFT Code:</Text>
                        <TextInput
                            style={[styles.bdInput, themeStyles[theme].bdInput]}
                            value={formData.bicSwiftCode}
                            onChangeText={(text) => handleInputChange('bicSwiftCode', text)}
                            autoCapitalize={getAutoCapitalize('bicSwiftCode')}
                            maxLength={11}
                            minLength={8}
                        />
                        <ErrorText field="bicSwiftCode" />
                    </>
                );
            case 'uk':
                return (
                    <>
                        <Text style={[styles.bdLabel, themeStyles[theme].bdLabel]}>Sort Code:</Text>
                        <TextInput
                            style={[styles.bdInput, themeStyles[theme].bdInput]}
                            value={formData.sortCode}
                            onChangeText={(text) => handleInputChange('sortCode', text)}
                            autoCapitalize="none"
                            keyboardType="numeric"
                            maxLength={6}
                            minLength={6}
                        />
                        <ErrorText field="sortCode" />

                        <Text style={[styles.bdLabel, themeStyles[theme].bdLabel]}>Account Number:</Text>
                        <TextInput
                            style={[styles.bdInput, themeStyles[theme].bdInput]}
                            value={formData.accountNumber}
                            onChangeText={(text) => handleInputChange('accountNumber', text)}
                            autoCapitalize={getAutoCapitalize('accountNumber')}
                            keyboardType="numeric"
                            maxLength={20}
                            minLength={8}
                        />
                        <ErrorText field="accountNumber" />
                    </>
                );
            case 'in':
                return (
                    <>
                        <Text style={[styles.bdLabel, themeStyles[theme].bdLabel]}>Account Number:</Text>
                        <TextInput
                            style={[styles.bdInput, themeStyles[theme].bdInput]}
                            value={formData.accountNumber}
                            onChangeText={(text) => handleInputChange('accountNumber', text)}
                            autoCapitalize={getAutoCapitalize('accountNumber')}
                            keyboardType="numeric"
                            maxLength={20}
                            minLength={8}
                        />
                        <ErrorText field="accountNumber" />

                        <Text style={[styles.bdLabel, themeStyles[theme].bdLabel]}>IFSC Code:</Text>
                        <TextInput
                            style={[styles.bdInput, themeStyles[theme].bdInput]}
                            value={formData.ifscCode}
                            onChangeText={(text) => handleInputChange('ifscCode', text)}
                            autoCapitalize={getAutoCapitalize('ifscCode')}
                            maxLength={11}
                            minLength={11}
                        />
                        <ErrorText field="ifscCode" />
                    </>
                );
            case 'au':
                return (
                    <>
                        <Text style={[styles.bdLabel, themeStyles[theme].bdLabel]}>BSB Code:</Text>
                        <TextInput
                            style={[styles.bdInput, themeStyles[theme].bdInput]}
                            placeholder="e.g. 123-456"
                            placeholderTextColor="gray"
                            value={formData.bsbCode}
                            onChangeText={(text) => handleInputChange('bsbCode', text)}
                            autoCapitalize={getAutoCapitalize('bsbCode')}
                            maxLength={6}
                            minLength={3}
                        />
                        <ErrorText field="bsbCode" />

                        <Text style={[styles.bdLabel, themeStyles[theme].bdLabel]}>Account Number:</Text>
                        <TextInput
                            style={[styles.bdInput, themeStyles[theme].bdInput]}
                            value={formData.accountNumber}
                            onChangeText={(text) => handleInputChange('accountNumber', text)}
                            autoCapitalize={getAutoCapitalize('accountNumber')}
                            keyboardType="numeric"
                            maxLength={20}
                            minLength={8}
                        />
                        <ErrorText field="accountNumber" />
                    </>
                );
            case 'sea':
                return (
                    <>
                        <Text style={[styles.bdLabel, themeStyles[theme].bdLabel]}>Account Number:</Text>
                        <TextInput
                            style={[styles.bdInput, themeStyles[theme].bdInput]}
                            value={formData.accountNumber}
                            onChangeText={(text) => handleInputChange('accountNumber', text)}
                            autoCapitalize={getAutoCapitalize('accountNumber')}
                            keyboardType="numeric"
                            maxLength={20}
                            minLength={8}
                        />
                        <ErrorText field="accountNumber" />

                        <Text style={[styles.bdLabel, themeStyles[theme].bdLabel]}>Bank Code (if applicable):</Text>
                        <TextInput
                            style={[styles.bdInput, themeStyles[theme].bdInput]}
                            placeholder="e.g. BSA, BDO, DBS etc."
                            placeholderTextColor="gray"
                            value={formData.bsbCode}
                            onChangeText={(text) => handleInputChange('bsbCode', text)}
                            autoCapitalize={getAutoCapitalize('bsbCode')}
                            maxLength={6}
                            minLength={3}
                        />
                        <ErrorText field="bsbCode" />

                        <Text style={[styles.bdLabel, themeStyles[theme].bdLabel]}>SWIFT/BIC Code:</Text>
                        <TextInput
                            style={[styles.bdInput, themeStyles[theme].bdInput]}
                            value={formData.bicSwiftCode}
                            onChangeText={(text) => handleInputChange('bicSwiftCode', text)}
                            autoCapitalize={getAutoCapitalize('bicSwiftCode')}
                            maxLength={11}
                            minLength={8}
                        />
                        <ErrorText field="bicSwiftCode" />
                    </>
                );
            case 'intl':
                return (
                    <>
                        <Text style={[styles.bdLabel, themeStyles[theme].bdLabel]}>Account Number / IBAN:</Text>
                        <TextInput
                            style={[styles.bdInput, themeStyles[theme].bdInput]}
                            value={formData.accountNumber}
                            onChangeText={(text) => handleInputChange('accountNumber', text)}
                            autoCapitalize={getAutoCapitalize('accountNumber')}
                            maxLength={34}
                            minLength={16}
                        />
                        <ErrorText field="accountNumber" />

                        <Text style={[styles.bdLabel, themeStyles[theme].bdLabel]}>SWIFT/BIC Code:</Text>
                        <TextInput
                            style={[styles.bdInput, themeStyles[theme].bdInput]}
                            value={formData.bicSwiftCode}
                            onChangeText={(text) => handleInputChange('bicSwiftCode', text)}
                            autoCapitalize={getAutoCapitalize('bicSwiftCode')}
                            maxLength={11}
                            minLength={8}
                        />
                        <ErrorText field="bicSwiftCode" />
                    </>
                );
            default:
                return null;
        }
    };


    const regions = [
        { label: '-- Select Region --', value: '' },
        { label: 'United States', value: 'us' },
        { label: 'European Union', value: 'eu' },
        { label: 'United Kingdom', value: 'uk' },
        { label: 'India', value: 'in' },
        { label: 'Australia', value: 'au' },
        { label: 'SE Asia', value: 'sea' },
        { label: 'Other International', value: 'intl' },
    ];

    return (
        <>
            <Modal
                isVisible={visible}
                onBackdropPress={onClose}
                onModalShow={() => setIsModalRendered(true)}
                onModalHide={() => setIsModalRendered(false)}
                animationIn="slideInUp"
                animationOut="slideOutDown"
                animationInTiming={400}
                animationOutTiming={300}
                backdropOpacity={0}
                useNativeDriver={true}
                propagateSwipe={true} // IMPORTANT
                style={styles.fullScreenModalMain}
            >
                <View style={[styles.fullScreenModalOverlay, themeStyles[theme].fullScreenModalOverlay, { flex: 1 }]}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
                        style={[styles.profileSettingModalBody, { flex: 1 }]}
                    >
                        <View style={{ flexDirection: "row", justifyContent: 'flex-end', marginBottom: 5 }}>
                            <TouchableOpacity onPress={onClose} style={styles.modalCloseBtn}>
                                <Ionicons name="close" size={28} color={theme === 'light' ? '#333' : '#fff'} />
                            </TouchableOpacity>
                        </View>
                        <Text style={[styles.modalSmallTitle, themeStyles[theme].modalSmallTitle, { fontWeight: '500' }]}>Your Bank Details</Text>
                        {isModalRendered && (
                            <ScrollView
                                contentContainerStyle={{ paddingLeft: 10, paddingBottom: 100 }}
                                showsVerticalScrollIndicator={false}
                                keyboardShouldPersistTaps="handled"
                            >
                                <Text style={[styles.bdLabel, themeStyles[theme].bdLabel]}>Select Region:</Text>
                                <View style={[styles.wdPickerWrapper, themeStyles[theme].wdPickerWrapper, { borderRadius: 30, borderColor: theme === 'light' && '#eaeaeb' }]}>
                                    <Dropdown
                                        style={[styles.wdDropdown, themeStyles[theme].wdDropdown, { borderRadius: 30 }]}
                                        data={regions}
                                        labelField="label"
                                        valueField="value"
                                        placeholder="-- Select Region --"
                                        value={selectedRegion}
                                        onChange={(item) => {
                                            setSelectedRegion(item.value);
                                            setErrors(prev => ({ ...prev, selectedRegion: '' }));
                                        }}
                                        placeholderStyle={{ color: theme === 'light' ? '#858585' : '#8b8b8bff' }}
                                        selectedTextStyle={{ color: theme === 'light' ? '#414141' : '#fff' }}
                                        iconColor="#414141"
                                        renderItem={(item) => {
                                            const isSelected = item.value === selectedRegion;
                                            return (
                                                <View
                                                    style={{
                                                        paddingVertical: 14,
                                                        paddingHorizontal: 14,
                                                        backgroundColor: isSelected
                                                            ? theme === 'light' ? '#e3ddff' : '#333360'
                                                            : theme === 'light' ? '#fff' : '#212121',
                                                    }}
                                                >
                                                    <Text
                                                        style={{
                                                            color: isSelected
                                                                ? theme === 'light' ? '#000' : '#fff'
                                                                : theme === 'light' ? '#000' : '#ccc',
                                                            fontWeight: isSelected ? '600' : '400',
                                                        }}
                                                    >
                                                        {item.label}
                                                    </Text>
                                                </View>
                                            );
                                        }}
                                    />
                                </View>
                                {/* <View style={styles.bdPickerWrapper}>
                                    <Picker
                                        selectedValue={selectedRegion}
                                        onValueChange={(value) => {
                                            setSelectedRegion(value);
                                            setErrors(prev => ({ ...prev, selectedRegion: '' }));
                                        }}
                                        style={styles.bdPicker}
                                        dropdownIconColor="#414141"
                                        mode="dropdown"
                                    >
                                        <Picker.Item label="-- Select Region --" value="" />
                                        <Picker.Item label="United States" value="us" />
                                        <Picker.Item label="European Union" value="eu" />
                                        <Picker.Item label="United Kingdom" value="uk" />
                                        <Picker.Item label="India" value="in" />
                                        <Picker.Item label="Australia" value="au" />
                                        <Picker.Item label="SE Asia" value="sea" />
                                        <Picker.Item label="Other International" value="intl" />
                                    </Picker>

                                </View> */}
                                <ErrorText field="selectedRegion" />

                                <Text style={[styles.bdLabel, themeStyles[theme].bdLabel]}>Account Holder Name:</Text>
                                <TextInput
                                    style={[styles.bdInput, themeStyles[theme].bdInput]}
                                    value={formData.accountHolder}
                                    onChangeText={(text) => handleInputChange('accountHolder', text)}
                                    autoCapitalize="words"
                                    maxLength={50} // Reasonable limit for names
                                    minLength={2}  // Minimum for a valid name
                                />
                                <ErrorText field="accountHolder" />

                                <Text style={[styles.bdLabel, themeStyles[theme].bdLabel]}>Bank Name:</Text>
                                <TextInput
                                    style={[styles.bdInput, themeStyles[theme].bdInput]}
                                    value={formData.bankName}
                                    onChangeText={(text) => handleInputChange('bankName', text)}
                                    autoCapitalize="words"
                                    maxLength={50} // Reasonable limit for bank names
                                    minLength={2}  // Minimum for a valid bank name
                                />
                                <ErrorText field="bankName" />
                                <Text style={[styles.bdLabel, themeStyles[theme].bdLabel]}>Bank Address:</Text>
                                <TextInput
                                    style={[styles.bdInput, themeStyles[theme].bdInput]}
                                    value={formData.bankAddress}
                                    onChangeText={(text) => handleInputChange('bankAddress', text)}
                                    autoCapitalize="words"
                                    multiline={true}
                                    numberOfLines={2}
                                    maxLength={100} // Reasonable limit for addresses
                                    minLength={5}   // Minimum for a valid address
                                />
                                <ErrorText field="bankAddress" />

                                {renderRegionFields()}
                                <View style={{ marginVertical: 10 }}>
                                    <TouchableOpacity style={styles.btnNav} onPress={handleSubmit} disabled={loading}>
                                        {loading ? (
                                            <ActivityIndicator color="#fff" />
                                        ) : (
                                            <Text style={{ color: 'white' }}>Add</Text>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            </ScrollView>
                        )}
                    </KeyboardAvoidingView>
                </View>
            </Modal>
            {visibleModal === 'message-modal' && (
                <MessageModal
                    visible={visibleModal === 'message-modal'}
                    message={message}
                    onClose={() => setVisibleModal(null)}
                />
            )}
        </>
    );
};

export default BankAddModal;
