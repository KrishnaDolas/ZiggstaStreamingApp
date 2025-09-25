/* eslint-disable react-native/no-inline-styles */
import React, { useContext } from 'react';
import { View, TouchableOpacity, Text, Image } from 'react-native';
import Modal from 'react-native-modal';
import { Dimensions } from 'react-native';
import { ThemeContext } from '../context/ThemeContext';
import Colors from '../../assets/styles/Colors';
import { useAppContext } from '../context/AppContext';

const AvatarPrevModal = ({ visible, onClose }) => {
    const { theme } = useContext(ThemeContext) || 'dark';
    const { avatarToPreview } = useAppContext();

    return (
        <>
            <Modal
                isVisible={visible}
                onBackdropPress={onClose}
                useNativeDriver
                style={{ margin: 0, justifyContent: 'center', alignItems: 'center' }}
            >
                <View style={{ backgroundColor: theme === 'dark' ? Colors.blackModalBgColor : '#fff', padding: 10, borderRadius: 10 }}>
                    <Image
                        source={{ uri: avatarToPreview }}
                        style={{
                            width: Dimensions.get('window').width * 0.8,
                            height: Dimensions.get('window').width * 0.8,
                            borderRadius: 10,
                            resizeMode: 'contain',
                        }}
                    />
                    <TouchableOpacity
                        onPress={onClose}
                        style={{ marginTop: 10, alignSelf: 'center' }}
                    >
                        <Text style={{ color: theme === 'dark' ? '#fff' : '#000', fontSize: 16 }}>Close</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
        </>
    );
};

export default AvatarPrevModal;