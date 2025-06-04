// components/ProfileSettingModal.js
import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, Text, TextInput } from 'react-native';
import Modal from 'react-native-modal';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { styles, themeStyles } from '../../assets/styles/ThemeStyles';


const ProfileSettingModal = ({ visible, onClose }) => {

    const menuItems = [
        { label: 'Categories', icon: 'th-large' },
        { label: 'Blocked Users', icon: 'user-slash' },
        { label: 'Moderators', icon: 'user-shield' },
        { label: 'Privacy Settings', icon: 'shield-alt' },
    ];

    return (
        <Modal
            isVisible={visible}
            onBackdropPress={onClose}
            style={[styles.profileModalMain]}
        // backdropOpacity={0}
        >
            <View style={[styles.profileModalOverlay]}>
                <TouchableOpacity onPress={onClose} style={styles.profileModalClose}>
                    <Ionicons name="close" size={23} color="#333" />
                </TouchableOpacity>
                {/* Header Row */}
                <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 20,
                }}>
                    <Text style={{ fontSize: 16, fontWeight: '500', color: '#000' }}>Dark / Light Mode</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <FontAwesome5 name="cog" size={20} color="#007bff" />
                        <FontAwesome5 name="moon" size={18} color="#777" />
                    </View>
                </View>

                {/* Divider */}
                <View style={{ height: 1, backgroundColor: '#eee', marginBottom: 5 }} />

                {/* Menu Items */}
                {menuItems.map((item, index) => (
                    <TouchableOpacity key={index} style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingVertical: 12,
                        borderBottomWidth: index < menuItems.length - 1 ? 1 : 0,
                        borderColor: '#eee',
                    }}>
                        <FontAwesome5 name={item.icon} size={18} color="#000" style={{ width: 30 }} />
                        <Text style={{ fontSize: 15, color: '#000' }}>{item.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </Modal>

    );
};

export default ProfileSettingModal;
