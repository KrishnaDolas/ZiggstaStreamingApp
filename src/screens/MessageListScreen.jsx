/* eslint-disable react-native/no-inline-styles */
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { View, Text, Image, SafeAreaView, FlatList, StatusBar, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { styles, themeStyles } from '../../assets/styles/ThemeStyles';
import themeColors from '../../assets/styles/Colors';
import { ThemeContext } from '../context/ThemeContext';
import { StreamListHeader } from '../components/StreamListHeader';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import FriendActionsModal from '../modals/FriendActionsModal';
import { useAppContext } from '../context/AppContext';
import Apiclient from '../utils/Apiclient';
import { ActivityIndicator } from 'react-native';
import ProfileScreenModal from '../modals/ProfileScreenModal';
import { getGenderFallbackImage, SendErrorTotheServer } from '../utils/constant';
import MessageModal from '../modals/MessageModal';
import { useNavigation } from '@react-navigation/native';

export const MessageListScreen = () => {
    const { userData } = useAppContext();
    const insetsTop = useSafeAreaInsets();
    const navigation = useNavigation();
    const { theme } = useContext(ThemeContext);
    const [visibleModal, setVisibleModal] = useState(null);
    const [menuVisible, setMenuVisible] = useState(false);
    const { friendListType, setFriendListType } = useAppContext();
    const [friendInfo, setFriendInfo] = useState({});
    const [loading, setLoading] = useState(false);
    const [friendsData, setFriendsData] = useState([]);
    const [friendRequestsData, setFriendRequestsData] = useState([]);
    const [profileUserData, setProfileUserData] = useState({});
    const [message, setMessage] = useState(null);
    const [isUnblocking, setIsUnblocking] = useState(false); // New state to prevent multiple unblock triggers
    // Add this state near other states
    const [refreshing, setRefreshing] = useState(false);

    // Cleanup modals on unmount
    useEffect(() => {
        return () => {
            setVisibleModal(null); // Close all modals
        };
    }, []);

    // Function to fetch friends data blocked/unblocked user from the API

    const getFriendsData = useCallback(async () => {
        if (!userData.userid) return
        setLoading(true);
        try {

            const postData = {
                userId: userData.userid,
                isBlocked: friendListType === 'blocked' ? 1 : 0,
            };

            const response = await Apiclient.post('/getFriendsList', postData);
            console.log('response getFriendsList', response.data);
            if (response.status === 200) {
                const data = response.data?.friends || [];
                setFriendsData(data);
            }
        } catch (error) {
            console.error('Error fetching friends data list:', error);
            SendErrorTotheServer(error, 'getFriendsList');
        } finally {
            setLoading(false);
        }
    }, [userData.userid, friendListType]);

    useEffect(() => {
        if (friendListType !== 'requests') {
            getFriendsData();
        }
    }, [friendListType, getFriendsData]);


    // Function to fetch friends request user from the API

    const getFriendRequestData = useCallback(async () => {
        if (!userData.userid) return
        setLoading(true);
        try {
            const response = await Apiclient.get(`/friends/requests/${userData.userid}`);
            // console.log('response friends requests data', response.data);
            if (response.status === 200) {
                const data = response.data || [];
                setFriendRequestsData(data);
            }
        } catch (error) {
            console.error('Error fetching friends request data list:', error);
            SendErrorTotheServer(error, 'getFriendRequestData');
        } finally {
            setLoading(false);
        }
    }, [userData.userid]);

    useEffect(() => {
        if (friendListType === 'requests') {
            getFriendRequestData();
        }
    }, [friendListType, getFriendRequestData]);



    // manage friend request actions

    const handleFriendRequestResponse = useCallback(async (receiverID, responseType) => {
        if (!userData.userid || !receiverID) return;

        const payload = {
            requesterID: receiverID,
            receiverID: userData.userid,
            response: responseType, // 'accepted' or 'declined'
        };
        try {
            const response = await Apiclient.post('/friends/respond', payload); // Replace with your actual endpoint
            // console.log(`Friend request ${responseType}`, response.data);
            if (response.status === 200 && response.data?.message) {
                setMessage(response.data.message);
                setVisibleModal('message-modal');
                // Refresh request list after short delay
                setTimeout(() => {
                    getFriendRequestData(); // Assuming this is accessible here
                }, 2000);
            }
        } catch (error) {
            console.error(`Error ${responseType} friend request:`, error);
            SendErrorTotheServer(`Error ${responseType} friend request:`, 'handleFriendRequestResponse');
        }
    }, [userData.userid, getFriendRequestData]);

    const handleConfirm = useCallback((receiverID) => {
        handleFriendRequestResponse(receiverID, 'accepted');
    }, [handleFriendRequestResponse]);

    const handleDelete = useCallback((receiverID) => {
        handleFriendRequestResponse(receiverID, 'rejected');
    }, [handleFriendRequestResponse]);


    // un-block friend

    const handleUnBlock = useCallback(async (blockedID) => {
        if (isUnblocking) return; // Prevent multiple unblock calls
        setIsUnblocking(true); // Lock the unblock action
        try {
            const payload = {
                blockerID: userData?.userid,
                blockedID: blockedID,
                action: 'unblock',
            };
            const response = await Apiclient.post('/friends/block', payload); // Replace with your actual endpoint
            // console.log(`unblock user response`, response.data);
            if (response.status === 200 && response.data?.message) {
                setMessage(response.data.message);
                setVisibleModal('message-modal');
                setTimeout(() => {
                    getFriendsData();
                    setIsUnblocking(false); // Unlock after fetching data
                }, 2000);
            }

        } catch (error) {
            console.error(`Error getting when unblock user:`, error);
            SendErrorTotheServer(error, 'handleUnBlock');
            setIsUnblocking(false); // Unlock on error
        }
    }, [userData?.userid, getFriendsData, isUnblocking]);


    const handleProfileOpen = useCallback((item) => {
        setProfileUserData(item);
        setVisibleModal('profile-screen-modal');
    }, []);


    const handleChatOpen = useCallback((item) => {
        // setMessage(`Chat feature is not implemented yet.`)
        // setVisibleModal('message-modal');
        // Navigate to ChatScreen instead of showing message modal
        navigation.navigate('ChatScreen', {
            chatUser: item,
        });
    }, [navigation]);

    // Add this function
    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            if (friendListType === 'requests') {
                await getFriendRequestData();
            } else {
                await getFriendsData();
            }
        } catch (error) {
            console.error('Error on pull-to-refresh:', error);
            SendErrorTotheServer(error, 'handleRefresh');
        } finally {
            setRefreshing(false);
        }
    }, [friendListType, getFriendsData, getFriendRequestData]);


    const renderItem = useCallback(({ item }) => {
        if (friendListType === 'requests') {
            return (
                <View style={[styles.messageListContainer, themeStyles[theme].messageListContainer, { alignItems: 'center' }]}>
                    <TouchableOpacity onPress={() => handleProfileOpen(item)}>
                        <Image
                            source={!item?.avatar || item?.avatar === 'default'
                                ? getGenderFallbackImage(item?.gender)
                                : { uri: item?.avatar }
                            }
                            style={styles.messageListAvatar}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleChatOpen(item)} style={{ flex: 1, marginRight: 10 }}>
                        <Text numberOfLines={1} style={[styles.messageListName, themeStyles[theme].messageListName]}>
                            {item.Username}
                        </Text>
                    </TouchableOpacity>
                    <View style={styles.frActionBox}>
                        <TouchableOpacity
                            onPress={() => handleConfirm(item.RequesterID)}
                            style={styles.frActionConfirmBtn}>
                            <Text style={[styles.frActionBtnText, { color: '#fff' }]}>Confirm</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => handleDelete(item.RequesterID)}
                            style={styles.frActionDeleteBtn}>
                            <Text style={[styles.frActionBtnText, { color: '#111' }]}>Delete</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            );
        }

        return (
            <View style={[styles.messageListContainer, themeStyles[theme].messageListContainer]}>
                <TouchableOpacity onPress={() => handleProfileOpen(item)}>
                    <Image
                        source={!item?.avatar || item?.avatar === 'default'
                            ? getGenderFallbackImage(item?.gender)
                            : { uri: item?.avatar }
                        }
                        style={styles.messageListAvatar}
                    />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleChatOpen(item)} style={styles.messageListContent}>
                    <Text numberOfLines={1} style={[styles.messageListName, themeStyles[theme].messageListName]}>
                        {item.username}
                    </Text>
                    <Text numberOfLines={1} style={[styles.meListMessage, themeStyles[theme].meListMessage]}>
                        {item.message || 'No messages'}
                    </Text>
                    {friendListType === 'friends' && item.created_date !== null && (
                        <Text style={[styles.messageListTime, themeStyles[theme].messageListTime]}>{item.created_date}</Text>
                    )}
                </TouchableOpacity>
                {friendListType === 'blocked' ? (
                    <TouchableOpacity
                        onPress={() => handleUnBlock(item.userid)}
                        style={styles.frActionDeleteBtn}>
                        <Text style={[styles.frActionBtnText, { color: '#111' }]}>Unblock</Text>
                    </TouchableOpacity>
                ) : (
                    <>
                        <TouchableOpacity
                            onPress={() => { setVisibleModal('friend-action'); setFriendInfo(item); }}
                            style={[styles.flUserModalBtn, {
                                backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fafafa',

                            }]}
                        >
                            <Feather
                                name="more-horizontal"
                                size={20}
                                color={theme === 'dark' ? '#fff' : '#000'}
                            />
                        </TouchableOpacity>
                    </>
                )}
            </View>
        );
    }, [friendListType, theme, handleProfileOpen, handleConfirm, handleDelete, handleUnBlock, handleChatOpen]);

    const getTitle = useCallback(() => {
        if (friendListType === 'friends') return 'Friends';
        if (friendListType === 'blocked') return 'Blocked Users';
        if (friendListType === 'requests') return 'Friend Requests';
        return '';
    }, [friendListType]);

    return (
        <LinearGradient
            style={[styles.messageListGradientBox, { paddingTop: insetsTop.top }]}
            colors={[themeColors.headerGradientTop, themeColors.headerGradientBottom]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}>
            <SafeAreaView style={styles.messageListSafeView}>
                <StatusBar
                    hidden={false} // Show the status bar
                    barStyle="dark-content"
                />
                <StreamListHeader userData={userData} />
                <View
                    style={[
                        styles.messageListMainCardLayout,
                        themeStyles[theme].messageListMainCardLayout,
                    ]}>
                    {/* filter */}
                    <View
                        style={styles.messListFilterTab}
                    >
                        {['friends', 'blocked', 'requests'].map((type, index) => (
                            <TouchableOpacity
                                key={type}
                                onPress={() => {
                                    setFriendListType(type);
                                    setMenuVisible(false);
                                }}
                                style={[styles.messListFilterTabBTn, {
                                    backgroundColor: friendListType === type ? '#d93a63' : '#f3f3f3',
                                    marginRight: index === 2 ? 0 : 8,
                                }]}
                            >
                                <Text
                                    style={{
                                        fontSize: 14,
                                        fontWeight: '500',
                                        color: friendListType === type ? '#fff' : '#333',
                                        textAlign: 'center',
                                    }}
                                >
                                    {type === 'friends'
                                        ? 'Friends'
                                        : type === 'blocked'
                                            ? 'Blocked'
                                            : 'Requests'}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingRight: 12 }}>
                        <Text
                            style={[styles.streamListMainTitle, themeStyles[theme].streamListMainTitle]}
                        >
                            {getTitle()}
                        </Text>
                    </View>
                    {loading ? (
                        <View style={{ flex: 1, justifyContent: 'start', alignItems: 'center', paddingVertical: 40 }}>
                            <ActivityIndicator size="large" color="#d93a63" />
                        </View>
                    ) : (
                        <>
                            {(friendListType === 'requests' ? friendRequestsData.length === 0 : friendsData.length === 0) ? (
                                <ScrollView
                                    contentContainerStyle={{ alignItems: 'center', paddingTop: 50 }}
                                    refreshControl={
                                        <RefreshControl
                                            refreshing={refreshing}
                                            onRefresh={handleRefresh}
                                            colors={['#d93a63']}
                                            tintColor="#d93a63"
                                        />
                                    }
                                >
                                    <Image
                                        source={require('../../assets/images/friends-no-data-found.png')}
                                        style={{ width: 200, height: 200, resizeMode: 'contain' }}
                                    />
                                    <Text style={{ color: theme === 'dark' ? '#fff' : '#000', fontSize: 16 }}>
                                        {friendListType === 'friends' && 'No friends found'}
                                        {friendListType === 'blocked' && 'No blocked users'}
                                        {friendListType === 'requests' && 'No friend requests'}
                                    </Text>
                                </ScrollView>
                            ) : (
                                <FlatList
                                    data={friendListType === 'requests' ? friendRequestsData : friendsData}
                                    keyExtractor={(item, index) => index.toString()}
                                    renderItem={renderItem}
                                    contentContainerStyle={styles.messageListLayout}
                                    initialNumToRender={10}
                                    refreshing={refreshing} // <-- Add this
                                    onRefresh={handleRefresh} // <-- And this
                                />
                            )}
                        </>
                    )}
                </View>
                {/* <Footer /> */}
                {visibleModal === 'friend-action' && (
                    <FriendActionsModal
                        visible="true"
                        onClose={() => setVisibleModal(null)}
                        userData={userData}
                        friendInfo={friendInfo}
                        getFriendsData={getFriendsData}
                    />
                )}
                {visibleModal === 'profile-screen-modal' && (
                    <ProfileScreenModal visible="true" onClose={() => setVisibleModal(null)} profileData={profileUserData} />
                )}
                {visibleModal === 'message-modal' && (
                    <MessageModal
                        visible={visibleModal === 'message-modal'}
                        message={message}
                        onClose={() => setVisibleModal(null)}
                    />
                )}
            </SafeAreaView>
        </LinearGradient>

    );
};

