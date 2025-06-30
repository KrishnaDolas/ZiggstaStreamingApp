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

const BankAddModal = ({ visible, onClose, userData, bankListData }) => {
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


    const handleInputChange = (field, value) => {
        const trimmedValue = value.trimStart(); // Trim only start to allow typing with space later
        setFormData(prev => ({ ...prev, [field]: trimmedValue }));
        setErrors(prev => ({ ...prev, [field]: '' }));
    };

    const ErrorText = ({ field }) =>
        errors[field] ? <Text style={{ color: 'red', fontSize: 12 }}>{errors[field]}</Text> : null;

    const validateFields = () => {
        let tempErrors = {};

        const regex = {
            name: /^[a-zA-Z\s]+$/,
            accountNumber: /^\d{8,20}$/,
            ifsc: /^[A-Z]{4}0[A-Z0-9]{6}$/,
            swift: /^[A-Za-z0-9]{8,11}$/,
            iban: /^[A-Z]{2}[A-Z0-9]{14,34}$/,
            routing: /^\d{9}$/,
            sortCode: /^\d{6}$/,
            bsb: /^\d{3,6}$/,
            address: /^[a-zA-Z0-9\s,.-]+$/,
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

        switch (selectedRegion) {
            case 'us':
                if (!formData.accountNumber.trim()) {
                    tempErrors.accountNumber = 'Account number is required';
                } else if (!regex.accountNumber.test(formData.accountNumber)) {
                    tempErrors.accountNumber = 'Account number should be 8–20 digits';
                }

                if (!formData.routingNumber.trim()) {
                    tempErrors.routingNumber = 'Routing number is required';
                } else if (!regex.routing.test(formData.routingNumber)) {
                    tempErrors.routingNumber = 'Routing number must be 9 digits';
                }
                break;

            case 'eu':
                if (!formData.iban.trim()) {
                    tempErrors.iban = 'IBAN is required';
                } else if (!regex.iban.test(formData.iban)) {
                    tempErrors.iban = 'Invalid IBAN format';
                }

                if (!formData.bicSwiftCode.trim()) {
                    tempErrors.bicSwiftCode = 'SWIFT/BIC code is required';
                } else if (!regex.swift.test(formData.bicSwiftCode)) {
                    tempErrors.bicSwiftCode = 'Invalid SWIFT/BIC format';
                }
                break;

            case 'uk':
                if (!formData.sortCode.trim()) {
                    tempErrors.sortCode = 'Sort code is required';
                } else if (!regex.sortCode.test(formData.sortCode)) {
                    tempErrors.sortCode = 'Sort code must be 6 digits';
                }

                if (!formData.accountNumber.trim()) {
                    tempErrors.accountNumber = 'Account number is required';
                } else if (!regex.accountNumber.test(formData.accountNumber)) {
                    tempErrors.accountNumber = 'Account number should be 8–20 digits';
                }
                break;

            case 'in':
                if (!formData.accountNumber.trim()) {
                    tempErrors.accountNumber = 'Account number is required';
                } else if (!regex.accountNumber.test(formData.accountNumber)) {
                    tempErrors.accountNumber = 'Account number should be 8–20 digits';
                }

                if (!formData.ifscCode.trim()) {
                    tempErrors.ifscCode = 'IFSC code is required';
                } else if (!regex.ifsc.test(formData.ifscCode)) {
                    tempErrors.ifscCode = 'Invalid IFSC code format';
                }
                break;

            case 'au':
                if (!formData.bsbCode.trim()) {
                    tempErrors.bsbCode = 'BSB code is required';
                } else if (!regex.bsb.test(formData.bsbCode)) {
                    tempErrors.bsbCode = 'BSB code must be 6 digits';
                }

                if (!formData.accountNumber.trim()) {
                    tempErrors.accountNumber = 'Account number is required';
                } else if (!regex.accountNumber.test(formData.accountNumber)) {
                    tempErrors.accountNumber = 'Account number should be 8–20 digits';
                }
                break;

            case 'sea':
                if (!formData.accountNumber.trim()) {
                    tempErrors.accountNumber = 'Account number is required';
                } else if (!regex.accountNumber.test(formData.accountNumber)) {
                    tempErrors.accountNumber = 'Account number should be 8–20 digits';
                }

                if (!formData.bsbCode.trim()) {
                    tempErrors.bsbCode = 'Bank code is required';
                } else if (!regex.bsb.test(formData.bsbCode)) {
                    tempErrors.bsbCode = 'Bank code should be 3–6 digits';
                }

                if (!formData.bicSwiftCode.trim()) {
                    tempErrors.bicSwiftCode = 'SWIFT/BIC code is required';
                } else if (!regex.swift.test(formData.bicSwiftCode)) {
                    tempErrors.bicSwiftCode = 'Invalid SWIFT/BIC format';
                }
                break;

            case 'intl':
                if (!formData.accountNumber.trim()) {
                    tempErrors.accountNumber = 'Account/IBAN is required';
                } else if (!regex.iban.test(formData.accountNumber)) {
                    tempErrors.accountNumber = 'Invalid IBAN/account number';
                }

                if (!formData.bicSwiftCode.trim()) {
                    tempErrors.bicSwiftCode = 'SWIFT/BIC code is required';
                } else if (!regex.swift.test(formData.bicSwiftCode)) {
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
        const payload = {
            UserID: userData.userid,
            BankName: formData.bankName,
            AccountNumber: formData.accountNumber,
            AccountHolderName: formData.accountHolder,
            IFSCCode: formData.ifscCode,
            SWIFTBIC: formData.swiftCode || formData.bicSwiftCode,
            IBAN: formData.iban,
            RoutingNumber: formData.routingNumber,
            Country: selectedRegion,
            Currency: 'AUD', // Optional or default
            BankAddress: formData.bankAddress,
            IsPrimary: bankListData?.length === 0 ? '1' : '0',
            SortCode: formData.sortCode,
            BSBCode: formData.bsbCode,
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
                onClose();
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
                        />
                        <ErrorText field="accountNumber" />

                        <Text style={styles.bdLabel}>Routing Number (ABA):</Text>
                        <TextInput
                            style={styles.bdInput}
                            value={formData.routingNumber}
                            onChangeText={(text) => handleInputChange('routingNumber', text)}
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
                        />
                        <ErrorText field="iban" />

                        <Text style={styles.bdLabel}>BIC/SWIFT Code:</Text>
                        <TextInput
                            style={styles.bdInput}
                            value={formData.bicSwiftCode}
                            onChangeText={(text) => handleInputChange('bicSwiftCode', text)}
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
                        />
                        <ErrorText field="sortCode" />

                        <Text style={styles.bdLabel}>Account Number:</Text>
                        <TextInput
                            style={styles.bdInput}
                            value={formData.accountNumber}
                            onChangeText={(text) => handleInputChange('accountNumber', text)}
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
                        />
                        <ErrorText field="accountNumber" />

                        <Text style={styles.bdLabel}>IFSC Code:</Text>
                        <TextInput
                            style={styles.bdInput}
                            value={formData.ifscCode}
                            onChangeText={(text) => handleInputChange('ifscCode', text)}
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
                        />
                        <ErrorText field="bsbCode" />

                        <Text style={styles.bdLabel}>Account Number:</Text>
                        <TextInput
                            style={styles.bdInput}
                            value={formData.accountNumber}
                            onChangeText={(text) => handleInputChange('accountNumber', text)}
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
                        />
                        <ErrorText field="accountNumber" />

                        <Text style={styles.bdLabel}>Bank Code (if applicable):</Text>
                        <TextInput
                            style={styles.bdInput}
                            placeholder="e.g. BSA, BDO, DBS etc."
                            placeholderTextColor="gray"
                            value={formData.bsbCode}
                            onChangeText={(text) => handleInputChange('bsbCode', text)}
                        />
                        <ErrorText field="bsbCode" />

                        <Text style={styles.bdLabel}>SWIFT/BIC Code:</Text>
                        <TextInput
                            style={styles.bdInput}
                            value={formData.bicSwiftCode}
                            onChangeText={(text) => handleInputChange('bicSwiftCode', text)}
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
                        />
                        <ErrorText field="accountNumber" />

                        <Text style={styles.bdLabel}>SWIFT/BIC Code:</Text>
                        <TextInput
                            style={styles.bdInput}
                            value={formData.bicSwiftCode}
                            onChangeText={(text) => handleInputChange('bicSwiftCode', text)}
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
                            />
                            <ErrorText field="accountHolder" />

                            <Text style={styles.bdLabel}>Bank Name:</Text>
                            <TextInput
                                style={styles.bdInput}
                                value={formData.bankName}
                                onChangeText={(text) => handleInputChange('bankName', text)}
                            />
                            <ErrorText field="bankAddress" />
                            <Text style={styles.bdLabel}>Bank Address:</Text>
                            <TextInput
                                style={styles.bdInput}
                                value={formData.bankAddress}
                                onChangeText={(text) => handleInputChange('bankAddress', text)}
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
