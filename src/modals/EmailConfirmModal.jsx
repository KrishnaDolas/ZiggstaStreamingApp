/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import { View, TouchableOpacity, Text, Image } from 'react-native';
import Modal from 'react-native-modal';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { styles } from '../../assets/styles/ThemeStyles';
import { Dimensions, ScrollView } from 'react-native';

const EmailConfirmModal = ({ visible, onClose, userData }) => {
    const screenHeight = Dimensions.get('window').height;



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
                    <Text style={styles.mySettingSubModalTitle}>Email Confirmation</Text>
                </View>
                <View style={[styles.profileSettingModalBody, { height: screenHeight * 0.5 - 40 }]}>
                    <ScrollView contentContainerStyle={{ alignItems: 'center', justifyContent: 'center', paddingBottom: 30 }}>
                        {/* Image */}
                        <View style={{ marginBottom: 20 }}>
                            <Image
                                source={require('../../assets/images/confirmation-email.jpg')}
                                style={{ width: 140, height: 140, resizeMode: 'contain' }}
                            />
                        </View>

                        {/* Confirmation Message */}
                        <Text style={{ fontSize: 18, fontWeight: '600', color: '#333', textAlign: 'center', marginBottom: 10 }}>
                            Confirm Your Email Address
                        </Text>
                        <Text style={{ fontSize: 14, color: '#666', textAlign: 'center', paddingHorizontal: 25, marginBottom: 30 }}>
                            To continue, please confirm your email address. We’ve sent a link to your registered email. Click the button below once you've confirmed.
                        </Text>
                        {/* Confirm Button */}
                        <TouchableOpacity
                            style={{
                                backgroundColor: '#d93a63',
                                paddingVertical: 12,
                                paddingHorizontal: 30,
                                borderRadius: 25,
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.2,
                                shadowRadius: 4,
                                elevation: 5,
                            }}
                            onPress={() => {
                                onClose();
                            }}
                        >
                            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Confirm Email</Text>
                        </TouchableOpacity>
                    </ScrollView>

                </View>
            </View>
        </Modal>
    );
};

export default EmailConfirmModal;