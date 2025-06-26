/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, Text, TextInput } from 'react-native';
import Modal from 'react-native-modal';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { styles } from '../../assets/styles/ThemeStyles';
import { Dimensions, ScrollView } from 'react-native';
import { globalStyles } from '../../assets/styles/GlobalStyles';
import Apiclient from '../utils/Apiclient';

const ChangeEmailModal = ({ visible, onClose, userData }) => {
    const screenHeight = Dimensions.get('window').height;
    const [currentEmail, setCurrentEmail] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');

    // get profile details from API
    useEffect(() => {
        const fetchProfileDetails = async () => {
            try {
                const formData = {
                    userid: userData.userid,
                };
                const response = await Apiclient.post('/getUserDetails', formData);
                if (response.status === 200) {
                    setCurrentEmail(response.data.user.email || {});
                }
            } catch (err) {
                setErrors('Error fetching user profile details: ' + err.message);
            }
        };
        fetchProfileDetails();
    }, [userData.userid]);



    const validate = () => {
        const newErrors = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        // if (!currentEmail.trim()) {
        //     newErrors.currentEmail = 'Current email is required.';
        // } else if (!emailRegex.test(currentEmail)) {
        //     newErrors.currentEmail = 'Enter a valid email address.';
        // }

        if (!newEmail.trim()) {
            newErrors.newEmail = 'New email is required.';
        } else if (!emailRegex.test(newEmail)) {
            newErrors.newEmail = 'Enter a valid email address.';
        } else if (currentEmail.trim() === newEmail.trim()) {
            newErrors.newEmail = 'New email must be different from current email.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };


    const handleSave = async () => {
        if (validate()) {
            try {
                const formData = {
                    userid: userData.userid,
                    email: newEmail,
                };
                const response = await Apiclient.post('/updateuser', formData);
                console.log('response update email', response.data);
                if (response.status === 200 && response.data.success) {
                    setSuccessMessage(response.data.message);
                    setNewEmail('');
                    setErrors({});

                    // Auto-close modal after short delay
                    setTimeout(() => {
                        setSuccessMessage('');
                        onClose();
                    }, 1500);
                } else {
                    setErrors(response.data.message);
                }
            } catch (err) {
                setErrors({ apiError: 'Error updating email: ' + err.message });
            }
        }
    };

    return (
        <Modal
            isVisible={visible}
            onBackdropPress={onClose}
            animationIn="slideInRight"
            animationOut="slideOutLeft"
            animationInTiming={400}
            animationOutTiming={300}
            backdropOpacity={0}
            useNativeDriver={true}
            hardwareAccelerated={true}
            style={{
                margin: 0,
                justifyContent: 'flex-end',
                alignItems: 'flex-end',
            }}
        >
            <View style={{
                width: '100%', // like drawer
                backgroundColor: '#fff',
                padding: 16,
                shadowColor: '#000',
                shadowOffset: { width: -3, height: 0 },
                shadowOpacity: 0.15,
                shadowRadius: 6,
                elevation: 8,
            }}>
                {/* close modal */}
                <View style={[styles.mySettingSubModalTitleBox]}>
                    <TouchableOpacity style={styles.mySettingSubModalClose} onPress={onClose}>
                        <FontAwesome name="angle-left" size={30} color="#d93a63" />
                    </TouchableOpacity>
                    <Text style={styles.mySettingSubModalTitle}>Change Email Address</Text>
                </View>
                <View style={[styles.profileSettingModalBody, { height: screenHeight * 0.3 - 10 }]}>
                    <ScrollView
                        // contentContainerStyle={{ paddingBottom: 20 }}
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Divider */}
                        <View style={[styles.profileSettingMDivider]} />
                        <View style={{ marginVertical: 10 }}>
                            <TextInput
                                style={globalStyles.input}
                                placeholder="Current Email"
                                placeholderTextColor="#9d9d9d"
                                value={currentEmail}
                                onChangeText={setCurrentEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                readOnly
                            />
                            {errors.currentEmail && (
                                <Text style={{ color: 'red', fontSize: 12, marginTop: 4 }}>
                                    {errors.currentEmail}
                                </Text>
                            )}
                        </View>
                        <View style={{ marginVertical: 10 }}>
                            <TextInput
                                style={globalStyles.input}
                                placeholder="New Email"
                                placeholderTextColor="#9d9d9d"
                                value={newEmail}
                                onChangeText={setNewEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                            {errors.newEmail && (
                                <Text style={{ color: 'red', fontSize: 12, marginTop: 4 }}>
                                    {errors.newEmail}
                                </Text>
                            )}
                        </View>
                        {successMessage !== '' && (
                            <Text style={{ color: 'green', fontSize: 13 }}>
                                {successMessage}
                            </Text>
                        )}
                        <View style={{ marginVertical: 10 }}>
                            <TouchableOpacity style={styles.btnNav} onPress={handleSave}>
                                <Text style={{ color: 'white' }}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>

                </View>

            </View>
        </Modal>

    );
};

export default ChangeEmailModal;
