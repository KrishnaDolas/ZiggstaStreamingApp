import React, { useState } from 'react';
import {
    View, TouchableOpacity, Text, TextInput, ScrollView, KeyboardAvoidingView, Platform,
    Alert,
    ActivityIndicator
} from 'react-native';
import Modal from 'react-native-modal';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { styles } from '../../assets/styles/ThemeStyles';
import { Picker } from '@react-native-picker/picker';
import Apiclient from '../utils/Apiclient';

const BankAddModal = ({ visible, onClose, userData, bankListData, onSuccess }) => {
    const [selectedRegion, setSelectedRegion] = useState('');
    const [isModalRendered, setIsModalRendered] = useState(false);
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

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);


    // const handleInputChange = (field, value) => {
    //     const trimmedValue = value.trimStart(); // Trim only start to allow typing with space later
    //     setFormData(prev => ({ ...prev, [field]: trimmedValue }));
    //     setErrors(prev => ({ ...prev, [field]: '' }));
    // };
    // Modified handleInputChange - no uppercase conversion here
    const handleInputChange = (field, value) => {
        const trimmedValue = value.trimStart(); // Trim only start to allow typing with space later
        setFormData(prev => ({ ...prev, [field]: trimmedValue }));
        setErrors(prev => ({ ...prev, [field]: '' }));
    };

    // const handleInputChange = (field, value) => {
    //     const trimmedValue = value.trimStart();
    //     let finalValue = trimmedValue;

    //     // Apply uppercase for specific banking codes
    //     switch (field) {
    //         case 'ifscCode':
    //         case 'bicSwiftCode':
    //         case 'swiftCode':
    //         case 'iban':
    //         case 'bsbCode':
    //             finalValue = trimmedValue.toUpperCase();
    //             break;
    //         case 'accountNumber':
    //             // For international region, treat as IBAN (uppercase)
    //             if (selectedRegion === 'intl') {
    //                 finalValue = trimmedValue.toUpperCase();
    //             }
    //             break;
    //         default:
    //             finalValue = trimmedValue;
    //     }

    //     setFormData(prev => ({ ...prev, [field]: finalValue }));
    //     setErrors(prev => ({ ...prev, [field]: '' }));
    // };

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

        // setLoading(true);

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
                Alert.alert('Success', 'Bank details saved successfully.');
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
                onSuccess?.();
            } else {
                Alert.alert('Error', response?.data?.message || 'Something went wrong.');
            }
        } catch (error) {
            Alert.alert('API Error', 'Unable to save bank details. Please try again later.');
        } finally {
            setLoading(false);
        }
    };


    const renderRegionFields = () => {
        switch (selectedRegion) {
            case 'us':
                return (
                    <>
                        <Text style={styles.bdLabel}>Account Number:</Text>
                        <TextInput
                            style={styles.bdInput}
                            value={formData.accountNumber}
                            onChangeText={(text) => handleInputChange('accountNumber', text)}
                            autoCapitalize={getAutoCapitalize('accountNumber')}
                            keyboardType="numeric"
                        />
                        <ErrorText field="accountNumber" />

                        <Text style={styles.bdLabel}>Routing Number (ABA):</Text>
                        <TextInput
                            style={styles.bdInput}
                            value={formData.routingNumber}
                            onChangeText={(text) => handleInputChange('routingNumber', text)}
                            autoCapitalize="none"
                            keyboardType="numeric"
                        />
                        <ErrorText field="routingNumber" />
                    </>
                );
            case 'eu':
                return (
                    <>
                        <Text style={styles.bdLabel}>IBAN:</Text>
                        <TextInput
                            style={styles.bdInput}
                            value={formData.iban}
                            onChangeText={(text) => handleInputChange('iban', text)}
                            autoCapitalize={getAutoCapitalize('iban')}
                        />
                        <ErrorText field="iban" />

                        <Text style={styles.bdLabel}>BIC/SWIFT Code:</Text>
                        <TextInput
                            style={styles.bdInput}
                            value={formData.bicSwiftCode}
                            onChangeText={(text) => handleInputChange('bicSwiftCode', text)}
                            autoCapitalize={getAutoCapitalize('bicSwiftCode')}
                        />
                        <ErrorText field="bicSwiftCode" />
                    </>
                );
            case 'uk':
                return (
                    <>
                        <Text style={styles.bdLabel}>Sort Code:</Text>
                        <TextInput
                            style={styles.bdInput}
                            value={formData.sortCode}
                            onChangeText={(text) => handleInputChange('sortCode', text)}
                            autoCapitalize="none"
                            keyboardType="numeric"
                        />
                        <ErrorText field="sortCode" />

                        <Text style={styles.bdLabel}>Account Number:</Text>
                        <TextInput
                            style={styles.bdInput}
                            value={formData.accountNumber}
                            onChangeText={(text) => handleInputChange('accountNumber', text)}
                            autoCapitalize={getAutoCapitalize('accountNumber')}
                            keyboardType="numeric"
                        />
                        <ErrorText field="accountNumber" />
                    </>
                );
            case 'in':
                return (
                    <>
                        <Text style={styles.bdLabel}>Account Number:</Text>
                        <TextInput
                            style={styles.bdInput}
                            value={formData.accountNumber}
                            onChangeText={(text) => handleInputChange('accountNumber', text)}
                            autoCapitalize={getAutoCapitalize('accountNumber')}
                            keyboardType="numeric"
                        />
                        <ErrorText field="accountNumber" />

                        <Text style={styles.bdLabel}>IFSC Code:</Text>
                        <TextInput
                            style={styles.bdInput}
                            value={formData.ifscCode}
                            onChangeText={(text) => handleInputChange('ifscCode', text)}
                            autoCapitalize={getAutoCapitalize('ifscCode')}
                        />
                        <ErrorText field="ifscCode" />
                    </>
                );
            case 'au':
                return (
                    <>
                        <Text style={styles.bdLabel}>BSB Code:</Text>
                        <TextInput
                            style={styles.bdInput}
                            placeholder="e.g. 123-456"
                            placeholderTextColor="gray"
                            value={formData.bsbCode}
                            onChangeText={(text) => handleInputChange('bsbCode', text)}
                            autoCapitalize={getAutoCapitalize('bsbCode')}
                        />
                        <ErrorText field="bsbCode" />

                        <Text style={styles.bdLabel}>Account Number:</Text>
                        <TextInput
                            style={styles.bdInput}
                            value={formData.accountNumber}
                            onChangeText={(text) => handleInputChange('accountNumber', text)}
                            autoCapitalize={getAutoCapitalize('accountNumber')}
                            keyboardType="numeric"
                        />
                        <ErrorText field="accountNumber" />
                    </>
                );
            case 'sea':
                return (
                    <>
                        <Text style={styles.bdLabel}>Account Number:</Text>
                        <TextInput
                            style={styles.bdInput}
                            value={formData.accountNumber}
                            onChangeText={(text) => handleInputChange('accountNumber', text)}
                            autoCapitalize={getAutoCapitalize('accountNumber')}
                            keyboardType="numeric"
                        />
                        <ErrorText field="accountNumber" />

                        <Text style={styles.bdLabel}>Bank Code (if applicable):</Text>
                        <TextInput
                            style={styles.bdInput}
                            placeholder="e.g. BSA, BDO, DBS etc."
                            placeholderTextColor="gray"
                            value={formData.bsbCode}
                            onChangeText={(text) => handleInputChange('bsbCode', text)}
                            autoCapitalize={getAutoCapitalize('bsbCode')}
                        />
                        <ErrorText field="bsbCode" />

                        <Text style={styles.bdLabel}>SWIFT/BIC Code:</Text>
                        <TextInput
                            style={styles.bdInput}
                            value={formData.bicSwiftCode}
                            onChangeText={(text) => handleInputChange('bicSwiftCode', text)}
                            autoCapitalize={getAutoCapitalize('bicSwiftCode')}
                        />
                        <ErrorText field="bicSwiftCode" />
                    </>
                );
            case 'intl':
                return (
                    <>
                        <Text style={styles.bdLabel}>Account Number / IBAN:</Text>
                        <TextInput
                            style={styles.bdInput}
                            value={formData.accountNumber}
                            onChangeText={(text) => handleInputChange('accountNumber', text)}
                            autoCapitalize={getAutoCapitalize('accountNumber')}
                        />
                        <ErrorText field="accountNumber" />

                        <Text style={styles.bdLabel}>SWIFT/BIC Code:</Text>
                        <TextInput
                            style={styles.bdInput}
                            value={formData.bicSwiftCode}
                            onChangeText={(text) => handleInputChange('bicSwiftCode', text)}
                            autoCapitalize={getAutoCapitalize('bicSwiftCode')}
                        />
                        <ErrorText field="bicSwiftCode" />
                    </>
                );
            default:
                return null;
        }
    };

    return (
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
            <View style={[styles.fullScreenModalOverlay, { flex: 1 }]}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
                    style={[styles.profileSettingModalBody, { flex: 1 }]}
                >
                    <View style={{ flexDirection: "row", justifyContent: 'flex-end', marginBottom: 5 }}>
                        <TouchableOpacity onPress={onClose} style={styles.modalCloseBtn}>
                            <Ionicons name="close" size={22} color="#333" />
                        </TouchableOpacity>
                    </View>
                    <Text style={[styles.modalSmallTitle, { fontWeight: '500' }]}>Your Bank Details</Text>
                    {isModalRendered && (
                        <ScrollView
                            contentContainerStyle={{ paddingLeft: 10, paddingBottom: 100 }}
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled"
                        >
                            <Text style={styles.bdLabel}>Select Region:</Text>
                            <View style={styles.bdPickerWrapper}>
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

                            </View>
                            <ErrorText field="selectedRegion" />

                            <Text style={styles.bdLabel}>Account Holder Name:</Text>
                            <TextInput
                                style={styles.bdInput}
                                value={formData.accountHolder}
                                onChangeText={(text) => handleInputChange('accountHolder', text)}
                                autoCapitalize="words"
                            />
                            <ErrorText field="accountHolder" />

                            <Text style={styles.bdLabel}>Bank Name:</Text>
                            <TextInput
                                style={styles.bdInput}
                                value={formData.bankName}
                                onChangeText={(text) => handleInputChange('bankName', text)}
                                autoCapitalize="words"
                            />
                            <ErrorText field="bankName" />
                            <Text style={styles.bdLabel}>Bank Address:</Text>
                            <TextInput
                                style={styles.bdInput}
                                value={formData.bankAddress}
                                onChangeText={(text) => handleInputChange('bankAddress', text)}
                                autoCapitalize="words"
                                multiline={true}
                                numberOfLines={2}
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
    );
};

export default BankAddModal;
