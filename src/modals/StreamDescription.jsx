import React, { useState } from 'react';
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Pressable,
} from 'react-native';

export const UpdateStreamDescriptionModal = ({ visible, onClose, description = '', HandleNewStreamDesciption }) => {
    const [streamDescription, setStreamDescription] = useState(description);
    const handleSave = () => {
        if (!streamDescription.trim()) {
            return;
        }
        onClose();
        HandleNewStreamDesciption(streamDescription);
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
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Stream Description</Text>

                        <TextInput
                            style={styles.textInput}
                            placeholder="Add description"
                            value={streamDescription}
                            onChangeText={setStreamDescription}
                            multiline={true}
                            textAlignVertical="top"
                            placeholderTextColor="#999"
                        />

                        <View style={styles.buttonContainer}>
                            <TouchableOpacity onPress={onClose} style={[styles.button, styles.cancelButton]}>
                                <Text style={[styles.buttonText, styles.cancelButtonText]}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleSave} style={[styles.button, styles.saveButton]}>
                                <Text style={[styles.buttonText, styles.saveButtonText]}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Pressable>

        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
    },
    modalContainer: {
        backgroundColor: '#fff',
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
        color: 'grey',
        textAlign: 'center',
    },
    textInput: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#f9f9f9',
        marginBottom: 24,
        color: '#333',
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
        borderWidth: 1,
        borderColor: '#ddd',
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
});