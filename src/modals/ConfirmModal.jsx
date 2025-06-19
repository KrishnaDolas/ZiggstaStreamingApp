import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal
} from 'react-native';
import { styles } from '../../assets/styles/ThemeStyles';

export const ConfirmModal = ({ visible, onClose, leaveRoom }) => {
    return (
        <Modal
            isVisible={visible}
            // onBackdropPress={onClose}
            transparent useNativeDriver
            animationIn="zoomIn"
            animationOut="zoomOut"
            animationInTiming={300}
            animationOutTiming={200}
            backdropTransitionInTiming={300}
            backdropTransitionOutTiming={200}
            hideModalContentWhileAnimating>
            <View style={[styles.centerModalOverlay, { backgroundColor: 'transparent' }]}>
                <View style={[styles.centerModalCard]}>
                    <Text style={styles.modalSmallTitle}>Are you sure to close stream ?</Text>
                    <View style={styles.modalButtonGroup}>
                        <TouchableOpacity onPress={onClose} style={styles.modalCommonButton}>
                            <Text style={styles.modalCommonButtonText}>No</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => leaveRoom()} style={styles.modalCommonButton}>
                            <Text style={styles.modalCommonButtonText}>Yes</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>

    );
};
