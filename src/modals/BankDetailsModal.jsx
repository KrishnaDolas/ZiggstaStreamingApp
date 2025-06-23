import React, { useState } from 'react';
import { View, TouchableOpacity, Text, TextInput, Dimensions, ScrollView } from 'react-native';
import Modal from 'react-native-modal';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { styles } from '../../assets/styles/ThemeStyles';
import { Picker } from '@react-native-picker/picker';

const BankDetailsModal = ({ visible, onClose }) => {
    const screenHeight = Dimensions.get('window').height;
    const [selectedRegion, setSelectedRegion] = useState('');
    const [formData, setFormData] = useState({
        accountHolder: '',
        accountNumber: '',
        bankName: '',
        ifscCode: '',
        swiftCode: '',
        branchName: '',
        routingNumber: '',
        iban: '',
        bicSwiftCode: '',
        sortCode: '',
        bsbCode: '',
    });

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
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
                        <Text style={styles.bdLabel}>Routing Number (ABA):</Text>
                        <TextInput
                            style={styles.bdInput}
                            value={formData.routingNumber}
                            onChangeText={(text) => handleInputChange('routingNumber', text)}
                        />
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
                        <Text style={styles.bdLabel}>BIC/SWIFT Code:</Text>
                        <TextInput
                            style={styles.bdInput}
                            value={formData.bicSwiftCode}
                            onChangeText={(text) => handleInputChange('bicSwiftCode', text)}
                        />
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
                        <Text style={styles.bdLabel}>Account Number:</Text>
                        <TextInput
                            style={styles.bdInput}
                            value={formData.accountNumber}
                            onChangeText={(text) => handleInputChange('accountNumber', text)}
                        />
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
                        <Text style={styles.bdLabel}>IFSC Code:</Text>
                        <TextInput
                            style={styles.bdInput}
                            value={formData.ifscCode}
                            onChangeText={(text) => handleInputChange('ifscCode', text)}
                        />
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
                        <Text style={styles.bdLabel}>Account Number:</Text>
                        <TextInput
                            style={styles.bdInput}
                            value={formData.accountNumber}
                            onChangeText={(text) => handleInputChange('accountNumber', text)}
                        />
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
                        <Text style={styles.bdLabel}>Bank Code (if applicable):</Text>
                        <TextInput
                            style={styles.bdInput}
                            placeholder="e.g. BSA, BDO, DBS etc."
                            placeholderTextColor="gray"
                            value={formData.bsbCode}
                            onChangeText={(text) => handleInputChange('bsbCode', text)}
                        />
                        <Text style={styles.bdLabel}>SWIFT/BIC Code:</Text>
                        <TextInput
                            style={styles.bdInput}
                            value={formData.bicSwiftCode}
                            onChangeText={(text) => handleInputChange('bicSwiftCode', text)}
                        />
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
                        <Text style={styles.bdLabel}>SWIFT/BIC Code:</Text>
                        <TextInput
                            style={styles.bdInput}
                            value={formData.bicSwiftCode}
                            onChangeText={(text) => handleInputChange('bicSwiftCode', text)}
                        />
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
            animationIn="slideInUp"
            animationOut="slideOutDown"
            animationInTiming={400}
            animationOutTiming={300}
            backdropOpacity={0.4}
            useNativeDriver={true}
            style={[styles.fullScreenModalMain]}
        >
            <View style={[styles.fullScreenModalOverlay]}>
                <View style={[styles.profileSettingModalBody, { height: screenHeight * 1 }]}>
                    <View style={{ flexDirection: "row", justifyContent: 'flex-end', marginBottom: 5 }}>
                        <TouchableOpacity onPress={onClose} style={[styles.modalCloseBtn]}>
                            <Ionicons name="close" size={22} color="#333" />
                        </TouchableOpacity>
                    </View>
                    <Text style={[styles.modalSmallTitle, { fontWeight: '500' }]}>Your Bank Details</Text>
                    <ScrollView contentContainerStyle={{ paddingLeft: 10, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
                        <Text style={styles.bdLabel}>Select Region:</Text>
                        <View style={styles.bdPickerWrapper}>
                            <Picker
                                selectedValue={selectedRegion}
                                onValueChange={(value) => setSelectedRegion(value)}
                                style={styles.bdPicker}
                                dropdownIconColor="#414141" // For Android
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
                        <Text style={styles.bdLabel}>Account Holder Name:</Text>
                        <TextInput
                            style={styles.bdInput}
                            value={formData.accountHolder}
                            onChangeText={(text) => handleInputChange('accountHolder', text)}
                        />
                        <Text style={styles.bdLabel}>Bank Name:</Text>
                        <TextInput
                            style={styles.bdInput}
                            value={formData.bankName}
                            onChangeText={(text) => handleInputChange('bankName', text)}
                        />
                        {renderRegionFields()}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

export default BankDetailsModal;
