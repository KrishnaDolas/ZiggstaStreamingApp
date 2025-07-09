/* eslint-disable react-native/no-inline-styles */
import React, { useContext, useEffect, useState } from 'react';
import { View, Text, Image, SafeAreaView, FlatList, StatusBar, TouchableOpacity } from 'react-native';
import { styles, themeStyles } from '../../assets/styles/ThemeStyles';
import themeColors from '../../assets/styles/Colors';
import { ThemeContext } from '../context/ThemeContext';
import Footer from '../components/Footer';
import { StreamListHeader } from '../components/StreamListHeader';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import FriendActionsModal from '../modals/FriendActionsModal';
import { useAppContext } from '../context/AppContext';
import Apiclient from '../utils/Apiclient';
import { ActivityIndicator } from 'react-native';
import ProfileScreenModal from '../modals/ProfileScreenModal';

export const MessageListScreen = () => {
    const { userData } = useAppContext();
    const insetsTop = useSafeAreaInsets();
    const { theme } = useContext(ThemeContext);
    const [visibleModal, setVisibleModal] = useState(null);
    const [menuVisible, setMenuVisible] = useState(false);
    const { friendListType, setFriendListType } = useAppContext();
    const [friendInfo, setFriendInfo] = useState({});
    const [loading, setLoading] = useState(false);
    const [friendsData, setFriendsData] = useState([]);
    const [friendRequestsData, setFriendRequestsData] = useState([]);
    const [profileUserData, setProfileUserData] = useState({});

    // Function to fetch friends data blocked/unblocked user from the API

    const getFriendsData = async () => {
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
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (friendListType !== 'requests') {
            getFriendsData();
        }
    }, [friendListType, userData.userid]);


    // Function to fetch friends request user from the API

    const getFriendRequestData = async () => {
        if (!userData.userid) return
        setLoading(true);
        try {
            const response = await Apiclient.get(`/friends/requests/${userData.userid}`);
            console.log('response friends requests data', response);
            if (response.status === 200) {
                const data = response.data || [];
                setFriendRequestsData(data);
            }
        } catch (error) {
            console.error('Error fetching friends request data list:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (friendListType === 'requests') {
            getFriendRequestData();
        }
    }, [friendListType, userData.userid]);



    // manage friend request actions

    const handleFriendRequestResponse = async (receiverID, responseType) => {
        if (!userData.userid || !receiverID) return;

        const payload = {
            requesterID: receiverID,
            receiverID: userData.userid,
            response: responseType, // 'accepted' or 'declined'
        };
        console.log('payload /friends/respond :', payload);

        try {
            const response = await Apiclient.post('/friends/respond', payload); // Replace with your actual endpoint
            console.log(`Friend request ${responseType}`, response.data);

            if (response.status === 200 && response.data?.message) {
                alert(response.data.message);
            } else {
                alert(`Friend request ${responseType}`);
            }

            // Refresh request list after short delay
            setTimeout(() => {
                getFriendRequestData(); // Assuming this is accessible here
            }, 1000);
        } catch (error) {
            console.error(`Error ${responseType} friend request:`, error);
        }
    };

    const handleConfirm = (receiverID) => {
        handleFriendRequestResponse(receiverID, 'accepted');
    };

    const handleDelete = (receiverID) => {
        handleFriendRequestResponse(receiverID, 'rejected');
    };


    // un-block friend

    const handleUnBlock = async (blockedID) => {
        try {
            const payload = {
                blockerID: userData?.userid,
                blockedID: blockedID,
                action: 'unblock',
            };
            console.log('payload /friends/block :', payload);
            const response = await Apiclient.post('/friends/block', payload); // Replace with your actual endpoint
            console.log(`unblock user response`, response.data);

            if (response.status === 200 && response.data?.message) {
                alert(response.data.message);
                await getFriendsData();
            }

        } catch (error) {
            console.error(`Error getting when unblock user:`, error);
        }
    };


    const handleProfileOpen = (item) => {
        setProfileUserData(item);
        setVisibleModal('profile-screen-modal');
    };

    const renderItem = ({ item }) => {
        if (friendListType === 'requests') {
            return (
                <View style={[styles.messageListContainer, themeStyles[theme].messageListContainer, { alignItems: 'center' }]}>
                    <TouchableOpacity onPress={() => handleProfileOpen(item)}>
                        <Image source={require('../../assets/images/LS-1.jpg')} style={styles.messageListAvatar} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => alert(`chat open`)} style={{ flex: 1, marginRight: 10 }}>
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
                    <Image source={require('../../assets/images/LS-1.jpg')} style={styles.messageListAvatar} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => alert(`chat open`)} style={styles.messageListContent}>
                    <Text numberOfLines={1} style={[styles.messageListName, themeStyles[theme].messageListName]}>
                        {item.username}
                    </Text>
                    <Text numberOfLines={1} style={[styles.meListMessage, themeStyles[theme].meListMessage]}>
                        {item.message || 'Absolutely love this stream'}
                    </Text>
                    {friendListType === 'friends' && (
                        <Text style={[styles.messageListTime, themeStyles[theme].messageListTime]}>{item.created_date || '2:57 PM'}</Text>
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
    };

    const getTitle = () => {
        if (friendListType === 'friends') return 'Friends';
        if (friendListType === 'blocked') return 'Blocked Users';
        if (friendListType === 'requests') return 'Friend Requests';
        return '';
    };

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
                        {['friends', 'blocked', 'requests'].map((type) => (
                            <TouchableOpacity
                                key={type}
                                onPress={() => {
                                    setFriendListType(type);
                                    setMenuVisible(false);
                                }}
                                style={[styles.messListFilterTabBTn, {
                                    backgroundColor: friendListType === type ? '#d93a63' : '#f3f3f3',
                                }]}
                            >
                                <Text
                                    style={{
                                        fontSize: 14,
                                        fontWeight: '500',
                                        color: friendListType === type ? '#fff' : '#333',
                                    }}
                                >
                                    {type === 'friends'
                                        ? 'Friends'
                                        : type === 'blocked'
                                            ? 'Blocked Users'
                                            : 'Friend Requests'}
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
                                <View style={{ alignItems: 'center', paddingTop: 50 }}>
                                    <Image
                                        source={require('../../assets/images/friends-no-data-found.jpg')} // <- Replace with your static "no data" image
                                        style={{ width: 200, height: 200, resizeMode: 'contain' }}
                                    />
                                    <Text style={{ color: theme === 'dark' ? '#fff' : '#000', fontSize: 16 }}>
                                        {friendListType === 'friends' && 'No friends found'}
                                        {friendListType === 'blocked' && 'No blocked users'}
                                        {friendListType === 'requests' && 'No friend requests'}
                                    </Text>
                                </View>
                            ) : (
                                <FlatList
                                    data={friendListType === 'requests' ? friendRequestsData : friendsData}
                                    keyExtractor={(item, index) => index.toString()}
                                    renderItem={renderItem}
                                    contentContainerStyle={styles.messageListLayout}
                                    initialNumToRender={10}
                                />
                            )}
                        </>
                    )}
                </View>
                <Footer />
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
            </SafeAreaView>
        </LinearGradient>

    );
};

