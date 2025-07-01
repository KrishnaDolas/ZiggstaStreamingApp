/* eslint-disable react-native/no-inline-styles */
// components/ProfileSettingModal.js
import React, { useState } from 'react';
import { View, TouchableOpacity, Text, Image } from 'react-native';
import Modal from 'react-native-modal';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { styles } from '../../assets/styles/ThemeStyles';
import { ScrollView } from 'react-native';

const FriendActionsModal = ({ visible, onClose, friendInfo }) => {

    const [isModalRendered, setIsModalRendered] = useState(false);

    const menuItems = [
        {
            label: `Message  ${friendInfo.name?.split(' ')[0]}`,
            icon: 'chatbubble-ellipses-outline', // Ionicons
            lib: 'ionicons',
        },
        {
            label: `Unfollow ${friendInfo.name?.split(' ')[0]}`,
            icon: 'person-remove-outline', // Ionicons
            lib: 'ionicons',
        },
        {
            label: `Block ${friendInfo.name?.split(' ')[0]}'s Profile`,
            icon: 'hand-left-outline', // Ionicons
            lib: 'ionicons',
        },
        {
            label: `Unfriend ${friendInfo.name?.split(' ')[0]}`,
            icon: 'person-remove-outline', // Ionicons
            lib: 'ionicons',
        },
    ];


    return (
        <>
            <Modal
                isVisible={visible}
                onBackdropPress={onClose}
                onModalShow={() => setIsModalRendered(true)}
                onModalHide={() => setIsModalRendered(false)}
                animationIn="slideInUp"
                animationOut="slideOutDown"
                animationInTiming={300}
                animationOutTiming={250}
                backdropOpacity={0.3}
                backdropTransitionInTiming={200}
                backdropTransitionOutTiming={200}
                useNativeDriver={true}
                propagateSwipe={true}
                style={[{ justifyContent: 'flex-end', margin: 0 }]} // Bottom sheet style
            >
                {isModalRendered &&

                    <View style={{
                        backgroundColor: '#fff',
                        borderTopLeftRadius: 15,
                        borderTopRightRadius: 15,
                        padding: 10,
                        maxHeight: '60%', // So it doesn’t take full screen
                    }}>
                        {/* close modal */}

                        <View
                            style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                paddingHorizontal: 10,
                                paddingVertical: 8,
                            }}>
                            <TouchableOpacity
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    flex: 1,
                                }}
                                onPress={() => alert(`Profile Open`)}>
                                <Image source={require('../../assets/images/LS-1.jpg')} style={styles.messageListAvatar} />
                                <Text numberOfLines={1} style={[styles.messageListName]}>
                                    {friendInfo.name}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={onClose}>
                                <Ionicons name="close" size={23} color="#333" />
                            </TouchableOpacity>
                        </View>
                        <View style={[styles.profileSettingModalBody]}>
                            <ScrollView
                                // contentContainerStyle={{ paddingBottom: 20 }}
                                showsVerticalScrollIndicator={true}
                            >
                                {/* Divider */}
                                <View style={[styles.profileSettingMDivider]} />
                                {/* Menu Items */}
                                {menuItems.map((item, index) => (
                                    <TouchableOpacity onPress={item.onPress} key={index} style={[styles.profileSettingMMenuList, {
                                        borderBottomWidth: index < menuItems.length - 1 ? 1 : 0,
                                    }]}>
                                        <View style={styles.profileSettingMMenuListItem}>
                                            {item.lib === 'ionicons' ? (
                                                <Ionicons name={item.icon} size={20} color="#232323" style={{ width: 30 }} />
                                            ) : (
                                                <FontAwesome5 name={item.icon} size={18} color="#232323" style={{ width: 30 }} />
                                            )}
                                            <Text style={{ fontSize: 15, color: '#000' }}>{item.label}</Text>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>

                        </View>

                    </View>
                }

            </Modal>
        </>

    );
};

export default FriendActionsModal;
