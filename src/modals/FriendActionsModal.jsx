/* eslint-disable react-native/no-inline-styles */
// components/ProfileSettingModal.js
import React, { useCallback, useEffect, useState } from 'react';
import { View, TouchableOpacity, Text, Image } from 'react-native';
import Modal from 'react-native-modal';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { styles } from '../../assets/styles/ThemeStyles';
import { ScrollView } from 'react-native';
import { useAppContext } from '../context/AppContext';
import Apiclient from '../utils/Apiclient';
import MessageModal from './MessageModal';
import { getGenderFallbackImage, SendErrorTotheServer } from '../utils/constant';
import ProfileScreenModal from './ProfileScreenModal';


const FriendActionsModal = ({ visible, onClose, friendInfo, getFriendsData }) => {
    const { userData } = useAppContext();
    const [isModalRendered, setIsModalRendered] = useState(false);
    const [visibleModal, setVisibleModal] = useState(null);
    const [message, setMessage] = useState(null);


    // useEffect(() => {
    //     console.log('friendInfo', friendInfo);
    // }, [friendInfo]);

    // Cleanup modals on unmount
    useEffect(() => {
        return () => {
            setVisibleModal(null); // Close all modals
        };
    }, []);

    // block friend

    const handleBlock = useCallback(async () => {
        try {
            const payload = {
                blockerID: userData?.userid,
                blockedID: friendInfo?.userid,
                action: 'block',
            };
            // console.log('payload /friends/block :', payload);
            const response = await Apiclient.post('/friends/block', payload); // Replace with your actual endpoint
            // console.log(`block user response`, response.data);

            if (response.status === 200 && response.data?.message) {
                setMessage(response.data.message);
                setVisibleModal('message-modal');
                // Refresh request list after short delay
                setTimeout(async () => {
                    onClose();
                    await getFriendsData();
                }, 1500);
            }

        } catch (error) {
            console.error(`Error getting when block user:`, error);
            SendErrorTotheServer(error, 'handleBlock');
        }
    }, [friendInfo?.userid, userData?.userid, getFriendsData, onClose]);

    const handleFollowToggle = useCallback(async () => {
        const currentStatus = friendInfo?.isFollowing;
        const action = currentStatus === 1 ? 'unfollow' : 'follow';

        const payload = {
            userID: userData?.userid,
            targetID: friendInfo?.userid,
            action: action,
        };

        try {
            // console.log(`Calling /followers with payload`, payload);
            const response = await Apiclient.post('/followers', payload);

            if (response.status === 200 && response.data?.message) {
                setMessage(response.data.message);
                setVisibleModal('message-modal');

                // Refresh the parent data after a short delay
                setTimeout(async () => {
                    onClose();
                    await getFriendsData();
                }, 1500);
            }
        } catch (error) {
            console.error('Error while updating follow status:', error);
            SendErrorTotheServer(error, 'handleFollowToggle');
        }
    }, [friendInfo?.isFollowing, friendInfo?.userid, userData?.userid, getFriendsData, onClose]);


    const handleChat = async () => {
        setMessage('Not implemented yet');
        setVisibleModal('message-modal');
    };


    const menuItems = [
        {
            label: `Message  ${friendInfo.username?.split(' ')[0]}`,
            icon: 'chatbox-outline', // Better match for Facebook
            lib: 'ionicons',
            onPress: handleChat,
        },
        {
            label: `${friendInfo.isFollowing === 1 ? 'Unfollow' : 'Follow'} ${friendInfo.username?.split(' ')[0]}`,
            icon: friendInfo.isFollowing === 1 ? 'person-remove-outline' : 'person-add-outline',
            lib: 'ionicons',
            onPress: handleFollowToggle,

        },
        {
            label: `Block ${friendInfo.username?.split(' ')[0]}'s Profile`,
            icon: 'remove-circle-outline', // Better for "block"
            lib: 'ionicons',
            onPress: handleBlock,
        },
        // {
        //     label: `Unfriend ${friendInfo.username?.split(' ')[0]}`,
        //     icon: 'person-remove', // Solid unfriend icon
        //     lib: 'ionicons',
        // },
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
                                onPress={() => setVisibleModal('profile-screen-modal')}>
                                <Image
                                    source={!friendInfo?.avatar || friendInfo?.avatar === 'default'
                                        ? getGenderFallbackImage(friendInfo?.gender)
                                        : { uri: friendInfo?.avatar }
                                    }
                                    style={styles.messageListAvatar}
                                />
                                <Text numberOfLines={1} style={[styles.messageListName]}>
                                    {friendInfo.name}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={onClose}>
                                <Ionicons name="close" size={28} color="#333" />
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
                                                <Ionicons name={item.icon}
                                                    size={20}
                                                    color="#232323"
                                                    style={{
                                                        width: 30,
                                                        textShadowColor: '#000',
                                                        textShadowOffset: { width: 0.5, height: 0.5 },
                                                        textShadowRadius: 1,
                                                    }} />
                                            ) : (
                                                <FontAwesome5 name={item.icon} size={18} color="#232323" style={{ width: 30 }} />
                                            )}
                                            <Text style={{ fontSize: 15, color: '#000', fontWeight: '400' }}>{item.label}</Text>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>

                        </View>

                    </View>
                }

            </Modal>
            {visibleModal === 'message-modal' && (
                <MessageModal
                    visible={visibleModal === 'message-modal'}
                    message={message}
                    onClose={() => setVisibleModal(null)}
                />
            )}
            {visibleModal === 'profile-screen-modal' && (
                <ProfileScreenModal visible="true" onClose={() => setVisibleModal(null)} profileData={friendInfo} />
            )}
        </>

    );
};

export default FriendActionsModal;
