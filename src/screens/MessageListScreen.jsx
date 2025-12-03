/* eslint-disable react-native/no-inline-styles */
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { View, Text, Image, FlatList, StatusBar, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { styles, themeStyles } from '../../assets/styles/ThemeStyles';
import themeColors from '../../assets/styles/Colors';
import { ThemeContext } from '../context/ThemeContext';
import { StreamListHeader } from '../components/StreamListHeader';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import FriendActionsModal from '../modals/FriendActionsModal';
import { useAppContext } from '../context/AppContext';
import Apiclient from '../utils/Apiclient';
import { ActivityIndicator } from 'react-native';
import ProfileScreenModal from '../modals/ProfileScreenModal';
import { getGenderFallbackImage, SendErrorTotheServer } from '../utils/constant';
import MessageModal from '../modals/MessageModal';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

export const MessageListScreen = () => {
    const {
        userData,
        setModalStage,
        setModalVisibleStage,
        modalStage,
        modalVisibleStage,
        setShowAvatarPreview,
        setAvatarToPreview,
        profileUserData,
        setProfileUserData,
    } = useAppContext();
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const { theme } = useContext(ThemeContext);
    const [visibleModal, setVisibleModal] = useState(null);
    const [menuVisible, setMenuVisible] = useState(false);
    const { friendListType, setFriendListType } = useAppContext();
    const [friendInfo, setFriendInfo] = useState({});
    const [loading, setLoading] = useState(false);
    const [friendsData, setFriendsData] = useState([]);
    const [friendRequestsData, setFriendRequestsData] = useState([]);
    const [message, setMessage] = useState(null);
    // Add this state near other states
    const [refreshing, setRefreshing] = useState(false);

    // ✅ Use ref for processingIds
    const processingActionsRef = useRef({}); // { [id]: action }
    const [refreshUI, setRefreshUI] = useState(false); // force re-render when ref changes


    const addProcessingAction = (id, action) => {
        processingActionsRef.current[id] = action;
        setRefreshUI(prev => !prev);
    };

    const removeProcessingAction = (id) => {
        delete processingActionsRef.current[id];
        setRefreshUI(prev => !prev);
    };

    const getProcessingAction = (id) => {
        return processingActionsRef.current[id] || null;
    };

    const isProcessing = (id) => !!getProcessingAction(id)

    // Cleanup modals on unmount
    useEffect(() => {
        return () => {
            setVisibleModal(null); // Close all modals
        };
    }, []);

    // Function to fetch friends data blocked/unblocked user from the API
    const getFriendsData = useCallback(async () => {
        if (!userData.userid) return;

        if (!refreshing) setLoading(true);
        try {

            const postData = {
                userId: userData.userid,
                isBlocked: friendListType === 'blocked' ? 1 : 0,
            };

            const response = await Apiclient.post('/getFriendsList', postData);
            console.log('response getFriendsList', response.data);
            if (response.status === 200) {
                const data = response.data?.friends || [];
                // const uniqueUsers = Array.from(new Map(data.map(user => [user.userid, user])).values());
                setFriendsData(data);
            }
        } catch (error) {
            console.error('Error fetching friends data list:', error);
            SendErrorTotheServer(error, 'getFriendsList');
        } finally {
            setLoading(false);
        }
    }, [userData.userid, friendListType]);


    useFocusEffect(
        useCallback(() => {
            setLoading(true);
            setRefreshing(false); // reset pull refresh state when screen comes back

            if (friendListType === 'requests') {
                getFriendRequestData();
            } else {
                getFriendsData();
            }

            return () => {
                setLoading(false); // cleanup when leaving screen
            };
        }, [friendListType])
    );



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
        if (!receiverID || !userData.userid) {
            return;
        }
        // already processing this item
        if (isProcessing(receiverID)) {
            return;
        }
        // mark which action is running
        addProcessingAction(receiverID, responseType);
        try {
            const payload = {
                requesterID: receiverID,
                receiverID: userData.userid,
                response: responseType, // 'accepted' or 'declined'
            };
            const response = await Apiclient.post('/friends/respond', payload);
            if (response.status === 200 && response.data?.message) {
                setMessage(response.data.message);
                setVisibleModal('message-modal');
                // Refresh request list after short delay
                setTimeout(() => {
                    getFriendRequestData();
                }, 2000);
            }
        } catch (error) {
            console.error(`Error ${responseType} friend request:`, error);
            SendErrorTotheServer(`Error ${responseType} friend request:`, 'handleFriendRequestResponse');
        } finally {
            removeProcessingAction(receiverID);
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
        if (!blockedID || !userData.userid) {
            return;
        }
        if (isProcessing(blockedID)) {
            return;
        }
        addProcessingAction(blockedID, 'unblock');

        try {
            const payload = {
                blockerID: userData?.userid,
                blockedID: blockedID,
                action: 'unblock',
            };
            const response = await Apiclient.post('/friends/block', payload);
            if (response.status === 200 && response.data?.message) {
                setMessage(response.data.message);
                setVisibleModal('message-modal');
                setTimeout(() => {
                    getFriendsData();
                }, 2000);
            }
        } catch (error) {
            console.error('Error getting when unblock user:', error);
            SendErrorTotheServer(error, 'handleUnBlock');
        } finally {
            removeProcessingAction(blockedID);
        }
    }, [userData?.userid, getFriendsData]);


    const handleProfileOpen = useCallback((item) => {
        setProfileUserData(item);
        setModalVisibleStage('profile-modal');
        setModalStage('first');
    }, []);


    const handleFriendActionOpen = useCallback((item) => {
        setFriendInfo(item);
        setModalVisibleStage('friend-action');
        setModalStage('first');
    }, []);


    const handleChatOpen = useCallback((item) => {
        if (friendListType === 'friends') {
            navigation.navigate('ChatScreen', {
                chatUser: item,
            });
        }
    }, [navigation, friendListType]);

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
            const procAction = getProcessingAction(item.RequesterID); // 'accepted' | 'rejected' | null
            const isItemProcessing = isProcessing(item.RequesterID);
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
                    <TouchableOpacity style={{ flex: 1, marginRight: 10 }}>
                        <Text numberOfLines={1} style={[styles.messageListName, themeStyles[theme].messageListName]}>
                            {item.screenName}
                        </Text>
                    </TouchableOpacity>
                    <View style={styles.frActionBox}>
                        <TouchableOpacity
                            disabled={isItemProcessing}
                            onPress={() => handleConfirm(item.RequesterID)}
                            style={[styles.frActionConfirmBtn, isItemProcessing && { opacity: 0.6 }]}
                        >
                            <Text
                                style={[
                                    styles.frActionBtnText,
                                    { color: '#fff' }]}
                            >
                                {procAction === 'accepted' ? 'Processing...' : 'Confirm'}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            disabled={isItemProcessing}
                            onPress={() => handleDelete(item.RequesterID)}
                            style={[
                                styles.frActionDeleteBtn,
                                themeStyles[theme].frActionDeleteBtn,
                                isItemProcessing && { opacity: 0.6 }]}
                        >
                            <Text
                                style={[
                                    styles.frActionBtnText,
                                    {
                                        color: theme === 'light' ?
                                            '#111' : '#fff',
                                    }]}
                            >
                                {procAction === 'rejected' ? 'Processing...' : 'Delete'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            );
        }


        // Friends / Blocked list item
        const procAction = getProcessingAction(item.userid);
        const isItemProcessing = isProcessing(item.userid);

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
                        {item.screenName}
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
                        disabled={isItemProcessing}
                        onPress={() => handleUnBlock(item.userid)}
                        style={[
                            styles.frActionDeleteBtn,
                            themeStyles[theme].frActionDeleteBtn,
                            isItemProcessing && { opacity: 0.6 }]}
                    >
                        <Text
                            style={[
                                styles.frActionBtnText,
                                {
                                    color: theme === 'light' ?
                                        '#111' : '#fff',
                                }]}
                        >
                            {procAction === 'unblock' ? 'Processing...' : 'Unblock'}
                        </Text>
                    </TouchableOpacity>
                ) : (
                    <>
                        <TouchableOpacity
                            onPress={() => handleFriendActionOpen(item)}
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
        <SafeAreaView style={[styles.SafeAreaView, themeStyles[theme].SafeAreaView]}>
            <StatusBar
                barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
                backgroundColor={theme === 'dark' ? '#121212' : '#ffffff'}
                translucent={false}
            />
            <StreamListHeader />
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
                                backgroundColor:
                                    friendListType === type
                                        ? '#d93a63'
                                        : theme === 'dark'
                                            ? '#323232'
                                            : '#f3f3f3',
                                marginRight: index === 2 ? 0 : 8,
                            }]}
                        >
                            <Text
                                style={{
                                    fontSize: 14,
                                    fontWeight: '500',
                                    color: friendListType === type ? '#fff' : theme === 'dark'
                                        ? '#FFFFFF'
                                        : '#333333',
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
                {loading && !refreshing ? (
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
                                extraData={refreshUI}
                                refreshControl={
                                    <RefreshControl
                                        refreshing={refreshing}
                                        onRefresh={handleRefresh}
                                        tintColor="#d93a63"
                                        colors={['#d93a63']}
                                    />
                                }
                            />
                        )}
                    </>
                )}
            </View>
            {/* <Footer /> */}
            {modalVisibleStage === 'friend-action' && modalStage === 'first' && (
                <FriendActionsModal
                    visible={modalVisibleStage === 'friend-action'}
                    onClose={() => {
                        setModalVisibleStage(null);
                    }}
                    userData={userData}
                    friendInfo={friendInfo}
                    getFriendsData={getFriendsData}
                />
            )}
            {modalVisibleStage === 'profile-modal' && modalStage === 'first' && (
                <ProfileScreenModal
                    visible={modalVisibleStage === 'profile-modal'}
                    onClose={() => {
                        setModalVisibleStage(null);
                        setShowAvatarPreview(false);
                        setAvatarToPreview(null);
                        setProfileUserData({});
                    }}
                    profileData={profileUserData}
                />
            )}
            {visibleModal === 'message-modal' && (
                <MessageModal
                    visible={visibleModal === 'message-modal'}
                    message={message}
                    onClose={() => setVisibleModal(null)}
                />
            )}
        </SafeAreaView>

    );
};

