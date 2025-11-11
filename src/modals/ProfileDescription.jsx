import React, { useContext, useEffect, useState } from 'react';
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Pressable,
} from 'react-native';
import { useAppContext } from '../context/AppContext';
import Apiclient from '../utils/Apiclient';
import { SendErrorTotheServer } from '../utils/constant';
import { ThemeContext } from '../context/ThemeContext';
import Colors from '../../assets/styles/Colors';

export const ProfileDescription = ({ visible, onClose }) => {
    const { theme } = useContext(ThemeContext);
    const { profileDescription, profileUserId } = useAppContext();
    const [description, setDescription] = useState(profileDescription);
    const [message, setMessage] = useState('');


    const themedStyles = StyleSheet.create({
        modalOverlay: {
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 10,
        },
        modalContainer: {
            backgroundColor: theme === 'light' ? '#fff' : Colors.blackModalBgColor,
            borderRadius: 12,
            padding: 14,
            width: '100%',
            alignItems: 'center',
            elevation: 2,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 4,
        },
        modalTitle: {
            fontSize: 17,
            fontWeight: 'bold',
            marginBottom: 20,
            color: theme === 'light' ? 'grey' : '#fff',
            textAlign: 'center',
        },
        textInput: {
            width: '100%',
            borderWidth: 1,
            borderColor: theme === 'light' ? '#ddd' : Colors.blackInputBorderColor,
            borderRadius: 8,
            padding: 12,
            fontSize: 16,
            backgroundColor: theme === 'light' ? '#f9f9f9' : Colors.blackInputBgColor,
            marginBottom: 24,
            color: theme === 'light' ? '#333' : '#fff',
        },
        charCount: {
            alignSelf: 'flex-end',
            color: theme === 'light' ? '#999' : '#fff',
            fontSize: 12,
            marginTop: -18,
            marginBottom: 20,
            marginRight: 4,
        },
        buttonContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            width: '100%',
            gap: 12,
        },
        button: {
            flex: 1,
            paddingVertical: 12,
            paddingHorizontal: 24,
            borderRadius: 8,
            alignItems: 'center',
        },
        cancelButton: {
            backgroundColor: '#d93a63',
        },
        saveButton: {
            backgroundColor: '#d93a63',
        },
        buttonText: {
            fontSize: 16,
            fontWeight: '600',
        },
        cancelButtonText: {
            color: '#fff',
        },
        saveButtonText: {
            color: '#fff',
        },
        messageText: {
            color: 'green',
            marginBottom: 10,
        },
    });

    // ✅ sync description when modal opens
    useEffect(() => {
        if (visible) {
            setDescription(profileDescription || '');
        }
    }, [visible, profileDescription]);

    const handleUpdateDescription = async () => {
        try {
            const payload = {
                userId: profileUserId,
                description: description,
            };
            console.log('payload updateDescription', payload);

            const response = await Apiclient.post('/profile/updateDescription', payload);
            console.log('response updateDescription', response.data);
            if (response.status === 200) {
                setDescription(response.data.data.description);
                setMessage(response.data.message);
                setTimeout(() => {
                    onClose();
                }, 2500);
            }
        } catch (error) {
            SendErrorTotheServer(error, 'updateDescription');
        }
    };

    return (
        <Modal
            visible={visible}
            onBackdropPress={onClose}
            backdropOpacity={0}
            transparent={true}
            animationIn="slideInUp"
            animationOut="slideOutDown"
            useNativeDriver={true}
            hardwareAccelerated={true}
            onRequestClose={onClose}
        >

            <Pressable onPress={onClose} style={{ flex: 1 }}>
                <View style={themedStyles.modalOverlay}>
                    <View style={themedStyles.modalContainer}>
                        <Text style={themedStyles.modalTitle}>Profile Bio</Text>

                        <TextInput
                            style={themedStyles.textInput}
                            placeholder="Add bio"
                            value={description}
                            onChangeText={setDescription}
                            multiline={true}
                            textAlignVertical="top"
                            placeholderTextColor="#999"
                            maxLength={60}
                        />
                        <Text style={themedStyles.charCount}>{description.length}/60</Text>
                        {message && (
                            <Text style={{ color: 'green', marginBottom: 10 }}>{message}</Text>
                        )}
                        <View style={themedStyles.buttonContainer}>
                            <TouchableOpacity onPress={onClose} style={[themedStyles.button, themedStyles.cancelButton]}>
                                <Text style={[themedStyles.buttonText, themedStyles.cancelButtonText]}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleUpdateDescription}
                                // disabled={processing}
                                style={[
                                    themedStyles.button,
                                    themedStyles.saveButton,
                                    // processing && { opacity: 0.6 }
                                ]}
                            >
                                <Text style={[themedStyles.buttonText, themedStyles.saveButtonText]}>
                                    {/* {processing ? 'Saving...' : 'Save'} */}
                                    Save
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Pressable>
        </Modal>
    );
};