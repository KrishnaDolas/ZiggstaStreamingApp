// components/FullScreenModal.js
import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import Modal from 'react-native-modal';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { styles } from '../../assets/styles/ThemeStyles';
import { Dimensions, ScrollView } from 'react-native';

const FullScreenModal = ({ visible, onClose }) => {
    const screenHeight = Dimensions.get('window').height;
    return (
        <Modal
            isVisible={visible}
            onBackdropPress={onClose}
            animationIn="slideInUp"
            animationOut="slideOutDown"
            animationInTiming={400}
            animationOutTiming={300}
            backdropOpacity={0.4}
            style={[styles.fullScreenModalMain]}
            useNativeDriver={true}
        // backdropOpacity={0}
        // backdropColor='#fafafa'
        >
            <View style={[styles.fullScreenModalOverlay]}>

                <View style={[styles.profileSettingModalBody, { height: screenHeight * 1 }]}>
                    <View style={{ flexDirection: "row", justifyContent: 'flex-end', marginBottom: 5 }}>
                        <TouchableOpacity
                            onPress={onClose}
                            style={[styles.modalCloseBtn]}
                        >
                            <Ionicons name="close" size={22} color="#333" />
                        </TouchableOpacity>
                    </View>
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                    >
                        <Text style={styles.modalLargeTitle}>Full Screen Popup</Text>
                        <Text style={styles.modalSmallTitle}>This popup slides in from the bottom and covers the full screen.</Text>
                    </ScrollView>

                </View>

            </View>
        </Modal>

    );
};

export default FullScreenModal;
