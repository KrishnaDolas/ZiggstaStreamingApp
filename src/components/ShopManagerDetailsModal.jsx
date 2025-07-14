// components/ProfileSocialsModal.js
import React, { useContext } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import Modal from 'react-native-modal';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { styles, themeStyles } from '../../assets/styles/ThemeStyles';
import { Dimensions, ScrollView } from 'react-native';
import { ThemeContext } from '../context/ThemeContext';


const ShopManagerDetailsModal = ({ visible, onClose }) => {
    const { theme } = useContext(ThemeContext);
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
            useNativeDriver={true}
        // backdropOpacity={0}
        >
            <View style={[styles.profileModalOverlay,
            themeStyles[theme].profileModalOverlay]}>
                <TouchableOpacity onPress={onClose} style={styles.profileModalClose}>
                    <Ionicons name="close" size={28} color={theme === 'light' ? '#333' : '#fff'} />
                </TouchableOpacity>
                <View style={[styles.shopManagerDetailsModalMain, { height: screenHeight * 0.4 }]}>
                    <ScrollView
                        contentContainerStyle={{ paddingBottom: 20 }}
                        showsVerticalScrollIndicator={false}
                    >
                        <Text style={[styles.modalDarkTitle, { color: theme === 'dark' && '#fff' }]}>Shop Manager Details</Text>
                    </ScrollView>
                </View>
            </View>
        </Modal>

    );
};

export default ShopManagerDetailsModal;
