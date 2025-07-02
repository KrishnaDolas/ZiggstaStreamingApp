import React, { useContext, useEffect, useState } from 'react';
import { View, Text, Image, SafeAreaView, FlatList, StatusBar, TouchableOpacity, Modal, Pressable } from 'react-native';
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


const messages = [
    {
        id: '1',
        name: 'Harry Styles',
        message: 'Absolutely love this stream Absolute! Absolutely',
        time: '2:57 PM',
        avatar: require('../../assets/images/LS-1.jpg'),
    },
    {
        id: '2',
        name: 'Emma Watson',
        message: 'Absolutely love this stream',
        time: '2:57 PM',
        avatar: require('../../assets/images/LS-2.jpg'),
    },
    {
        id: '3',
        name: 'Chris Evans',
        message: 'Absolutely love this stream',
        time: '2:57 PM',
        avatar: require('../../assets/images/LS-3.jpg'),
    },
    {
        id: '4',
        name: 'Zendaya Coleman',
        message: 'Absolutely love this stream',
        time: '2:57 PM',
        avatar: require('../../assets/images/LS-4.jpg'),
    },
    {
        id: '5',
        name: 'Robert Downey',
        message: 'Absolutely love this stream',
        time: '2:57 PM',
        avatar: require('../../assets/images/LS-5.jpg'),
    },
    {
        id: '6',
        name: 'Scarlett Johansson',
        message: 'Absolutely love this stream',
        time: '2:57 PM',
        avatar: require('../../assets/images/LS-6.jpg'),
    },
    {
        id: '7',
        name: 'Tom Holland',
        message: 'Absolutely love this stream',
        time: '2:57 PM',
        avatar: require('../../assets/images/LS-1.jpg'),
    },
    {
        id: '8',
        name: 'Natalie Portman',
        message: 'Absolutely love this stream',
        time: '2:57 PM',
        avatar: require('../../assets/images/LS-6.jpg'),
    },
    {
        id: '9',
        name: 'Chris Hemsworth',
        message: 'Absolutely love this stream',
        time: '2:57 PM',
        avatar: require('../../assets/images/LS-1.jpg'),
    },
];


const friendRequests = [
    {
        id: '101',
        name: 'Olivia Rodrigo',
        avatar: require('../../assets/images/LS-3.jpg'),
    },
    {
        id: '102',
        name: 'Zayn Malik',
        avatar: require('../../assets/images/LS-4.jpg'),
    },
];

export const MessageListScreen = ({ userData }) => {
    const insetsTop = useSafeAreaInsets();
    const { theme } = useContext(ThemeContext);
    const [visibleModal, setVisibleModal] = useState(null);
    const [menuVisible, setMenuVisible] = useState(false);
    const { friendListType, setFriendListType } = useAppContext();
    const [friendInfo, setFriendInfo] = useState({});
    const [loading, setLoading] = useState(false);
    const [friendsData, setFriendsData] = useState([]);

    // Function to fetch social data from the API
    useEffect(() => {
        const getFriendsData = async () => {
            if (!userData.userid) return
            setLoading(true);
            try {

                const postData = {
                    userId: userData.userid,
                    isBlocked: friendListType === 'blocked' ? 1 : 0,
                };

                console.log('postData', postData);
                const response = await Apiclient.post('/getFriendsList', postData);
                if (response.status === 200) {
                    const data = response.data?.friends || [];
                    setFriendsData(data);
                }
            } catch (error) {
                console.error('Error fetching bank list:', error);
            } finally {
                setLoading(false);
            }
        };
        if (friendListType !== 'requests') {
            getFriendsData();
        }
    }, [friendListType, userData.userid]);

    const handleConfirm = (id) => {
        alert(`Friend request from ${id} confirmed`);
    };

    const handleDelete = (id) => {
        alert(`Friend request from ${id} deleted`);
    };

    const renderItem = ({ item }) => {
        if (friendListType === 'requests') {
            return (
                <View style={[styles.messageListContainer, themeStyles[theme].messageListContainer, { alignItems: 'center' }]}>
                    <TouchableOpacity onPress={() => alert(`Profile Open`)}>
                        <Image source={item.avatar} style={styles.messageListAvatar} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => alert(`chat open`)} style={{ flex: 1, marginRight: 10 }}>
                        <Text numberOfLines={1} style={[styles.messageListName, themeStyles[theme].messageListName]}>
                            {item.name}
                        </Text>
                    </TouchableOpacity>
                    <View style={{ flexDirection: 'row', gap: 5 }}>
                        <TouchableOpacity
                            onPress={() => handleConfirm(item.name)}
                            style={{ backgroundColor: '#d93a63', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6 }}>
                            <Text style={{ color: '#fff', fontWeight: '500', fontSize: 14 }}>Confirm</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => handleDelete(item.name)}
                            style={{ backgroundColor: '#f1f1f1', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6 }}>
                            <Text style={{ color: '#111', fontWeight: '500', fontSize: 14 }}>Delete</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            );
        }

        return (
            <View style={[styles.messageListContainer, themeStyles[theme].messageListContainer]}>
                <TouchableOpacity onPress={() => alert(`Profile Open`)}>
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
                        onPress={() => alert(`Unblocked ${item.username}`)}
                        style={{
                            paddingVertical: 6,
                            paddingHorizontal: 12,
                            backgroundColor: '#f3f3f3',
                            borderRadius: 6,
                        }}>
                        <Text style={{ color: '#000', fontWeight: '500', fontSize: 14 }}>Unblock</Text>
                    </TouchableOpacity>
                ) : (
                    <>
                        <TouchableOpacity
                            onPress={() => { setVisibleModal('friend-action'); setFriendInfo(item); }}
                            style={{
                                backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fafafa',
                                height: 30,
                                width: 30,
                                flexDirection: 'row',
                                justifyContent: 'center',
                                alignItems: 'center',
                                borderRadius: 30,
                            }}
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
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginHorizontal: 10,
                            marginTop: 10,
                            flexWrap: 'wrap'
                        }}
                    >
                        {['friends', 'blocked', 'requests'].map((type) => (
                            <TouchableOpacity
                                key={type}
                                onPress={() => {
                                    setFriendListType(type);
                                    setMenuVisible(false);
                                }}
                                style={{
                                    paddingVertical: 6,
                                    backgroundColor: friendListType === type ? '#d93a63' : '#f3f3f3',
                                    borderRadius: 4,
                                    paddingHorizontal: 10,
                                    // marginBottom: 4,
                                    marginRight: 8,
                                }}
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
                        <FlatList
                            data={friendListType === 'requests' ? friendRequests : friendsData}
                            keyExtractor={(item, index) => index}
                            renderItem={renderItem}
                            contentContainerStyle={styles.messageListLayout}
                            initialNumToRender={10}
                        />)}
                </View>
                <Footer />
                {visibleModal === 'friend-action' && (
                    <FriendActionsModal
                        visible="true"
                        onClose={() => setVisibleModal(null)}
                        userData={userData}
                        friendInfo={friendInfo}
                    />
                )}
            </SafeAreaView>
        </LinearGradient>

    );
};

