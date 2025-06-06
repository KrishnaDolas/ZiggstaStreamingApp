// components/ProfileSocialsModal.js
import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import Modal from 'react-native-modal';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { styles } from '../../assets/styles/ThemeStyles';
import { Dimensions, ScrollView } from 'react-native';


const ShopManagerDetailsModal = ({ visible, onClose }) => {
    const screenHeight = Dimensions.get('window').height;
    return (

        <Modal
            isVisible={visible}
            onBackdropPress={onClose}
            animationIn="fadeInUp"
            animationOut="fadeOutDown"
            animationInTiming={500}
            animationOutTiming={300}
            backdropOpacity={0.4}
            style={[styles.profileModalMain]}
        // backdropOpacity={0}
        >
            <View style={[styles.profileModalOverlay]}>
                <TouchableOpacity onPress={onClose} style={styles.profileModalClose}>
                    <Ionicons name="close" size={23} color="#333" />
                </TouchableOpacity>
                <View style={[styles.shopManagerDetailsModalMain, { height: screenHeight * .4 }]}>
                    <ScrollView
                        contentContainerStyle={{ paddingBottom: 20 }}
                        showsVerticalScrollIndicator={false}
                    >
                        <Text style={styles.modalDarkTitle}>Shop Manager Details</Text>
                    </ScrollView>
                </View>
            </View>
        </Modal>

    );
};

export default ShopManagerDetailsModal;
