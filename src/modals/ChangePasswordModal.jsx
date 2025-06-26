/* eslint-disable react-native/no-inline-styles */
import React, { useState } from 'react';
import { View, TouchableOpacity, Text, TextInput } from 'react-native';
import Modal from 'react-native-modal';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { styles } from '../../assets/styles/ThemeStyles';
import { Dimensions, ScrollView } from 'react-native';
import { globalStyles } from '../../assets/styles/GlobalStyles';

const ChangePasswordModal = ({ visible, onClose }) => {
    const screenHeight = Dimensions.get('window').height;

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState({});
    
    // State for password visibility toggles
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const validate = () => {
        const newErrors = {};
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

        if (!currentPassword.trim()) {
            newErrors.currentPassword = 'Current password is required.';
        }

        if (!newPassword.trim()) {
            newErrors.newPassword = 'New password is required.';
        } else if (!passwordRegex.test(newPassword)) {
            newErrors.newPassword = 'Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character.';
        } else if (currentPassword.trim() === newPassword.trim()) {
            newErrors.newPassword = 'New password must be different from current password.';
        }

        if (!confirmPassword.trim()) {
            newErrors.confirmPassword = 'Please confirm your new password.';
        } else if (newPassword.trim() !== confirmPassword.trim()) {
            newErrors.confirmPassword = 'Passwords do not match.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = () => {
        if (validate()) {
            // Proceed to save
            console.log('Changing password:', { currentPassword, newPassword });
            // reset state if needed
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setErrors({});
            onClose(); // Close modal after saving
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
                    <Text style={styles.mySettingSubModalTitle}>Change Password</Text>
                </View>
                <View style={[styles.profileSettingModalBody, { height: screenHeight * 0.4 - 10 }]}>
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Divider */}
                        <View style={[styles.profileSettingMDivider]} />
                        
                        {/* Current Password */}
                        <View style={{ marginVertical: 10 }}>
                            <View style={[globalStyles.inputContainer, { flexDirection: 'row', alignItems: 'center' }]}>
                                <TextInput
                                    style={[globalStyles.input, { flex: 1 }]}
                                    placeholder="Current Password"
                                    placeholderTextColor="#9d9d9d"
                                    value={currentPassword}
                                    onChangeText={setCurrentPassword}
                                    secureTextEntry={!showCurrentPassword}
                                />
                                <TouchableOpacity 
                                    onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                                    style={{ padding: 10 }}
                                >
                                    <FontAwesome 
                                        name={showCurrentPassword ? 'eye-slash' : 'eye'} 
                                        size={20} 
                                        color="#9d9d9d" 
                                    />
                                </TouchableOpacity>
                            </View>
                            {errors.currentPassword && (
                                <Text style={{ color: 'red', fontSize: 12, marginTop: 4 }}>
                                    {errors.currentPassword}
                                </Text>
                            )}
                        </View>
                        
                        {/* New Password */}
                        <View style={{ marginVertical: 10 }}>
                            <View style={[globalStyles.inputContainer, { flexDirection: 'row', alignItems: 'center' }]}>
                                <TextInput
                                    style={[globalStyles.input, { flex: 1 }]}
                                    placeholder="New Password"
                                    placeholderTextColor="#9d9d9d"
                                    value={newPassword}
                                    onChangeText={setNewPassword}
                                    secureTextEntry={!showNewPassword}
                                />
                                <TouchableOpacity 
                                    onPress={() => setShowNewPassword(!showNewPassword)}
                                    style={{ padding: 10 }}
                                >
                                    <FontAwesome 
                                        name={showNewPassword ? 'eye-slash' : 'eye'} 
                                        size={20} 
                                        color="#9d9d9d" 
                                    />
                                </TouchableOpacity>
                            </View>
                            {errors.newPassword && (
                                <Text style={{ color: 'red', fontSize: 12, marginTop: 4 }}>
                                    {errors.newPassword}
                                </Text>
                            )}
                        </View>
                        
                        {/* Confirm Password */}
                        <View style={{ marginVertical: 10 }}>
                            <View style={[globalStyles.inputContainer, { flexDirection: 'row', alignItems: 'center' }]}>
                                <TextInput
                                    style={[globalStyles.input, { flex: 1 }]}
                                    placeholder="Confirm New Password"
                                    placeholderTextColor="#9d9d9d"
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    secureTextEntry={!showConfirmPassword}
                                />
                                <TouchableOpacity 
                                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                    style={{ padding: 10 }}
                                >
                                    <FontAwesome 
                                        name={showConfirmPassword ? 'eye-slash' : 'eye'} 
                                        size={20} 
                                        color="#9d9d9d" 
                                    />
                                </TouchableOpacity>
                            </View>
                            {errors.confirmPassword && (
                                <Text style={{ color: 'red', fontSize: 12, marginTop: 4 }}>
                                    {errors.confirmPassword}
                                </Text>
                            )}
                        </View>
                        
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

export default ChangePasswordModal;