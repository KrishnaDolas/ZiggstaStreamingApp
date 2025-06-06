import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal
} from 'react-native';
import { styles } from '../../assets/styles/ThemeStyles';
import Ionicons from 'react-native-vector-icons/Ionicons';

export const CenterModal = ({ visible, onClose }) => {
    return (
        <Modal
            isVisible={visible}
            onBackdropPress={onClose}
            transparent useNativeDriver
            animationIn="zoomIn"
            animationOut="zoomOut"
            animationInTiming={300}
            animationOutTiming={200}
            backdropTransitionInTiming={300}
            backdropTransitionOutTiming={200}
            hideModalContentWhileAnimating>
            <View style={[styles.centerModalOverlay]}>
                <View style={[styles.centerModalCard]}>
                    <View style={{ flexDirection: "row", justifyContent: 'flex-end', marginBottom: 5 }}>
                        <TouchableOpacity
                            onPress={onClose}
                            style={[styles.modalCloseBtn]}
                        >
                            <Ionicons name="close" size={22} color="#333" />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.modalSmallTitle}>This is a centered modal popup</Text>
                    <View style={styles.modalButtonGroup}>
                        <TouchableOpacity style={styles.modalCommonButton}>
                            <Text style={styles.modalCommonButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.modalCommonButton}>
                            <Text style={styles.modalCommonButtonText}>Submit</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>

    );
};
