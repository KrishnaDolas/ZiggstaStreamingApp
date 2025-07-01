import React, { useContext, useState } from 'react';
import { View, Text, Image, SafeAreaView, FlatList, StatusBar, TouchableOpacity, Modal, Pressable } from 'react-native';
import { styles, themeStyles } from '../../assets/styles/ThemeStyles';
import themeColors from '../../assets/styles/Colors';
import { ThemeContext } from '../context/ThemeContext';
import Footer from '../components/Footer';
import { StreamListHeader } from '../components/StreamListHeader';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';


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
        name: 'Harry Styles',
        message: 'Absolutely love this stream',
        time: '2:57 PM',
        avatar: require('../../assets/images/LS-2.jpg'),
    },
    {
        id: '3',
        name: 'Harry Styles',
        message: 'Absolutely love this stream',
        time: '2:57 PM',
        avatar: require('../../assets/images/LS-3.jpg'),
    },
    {
        id: '4',
        name: 'Harry Styles',
        message: 'Absolutely love this stream',
        time: '2:57 PM',
        avatar: require('../../assets/images/LS-4.jpg'),
    },
    {
        id: '5',
        name: 'Harry Styles',
        message: 'Absolutely love this stream',
        time: '2:57 PM',
        avatar: require('../../assets/images/LS-5.jpg'),
    },
    {
        id: '6',
        name: 'Harry Styles',
        message: 'Absolutely love this stream',
        time: '2:57 PM',
        avatar: require('../../assets/images/LS-6.jpg'),
    },
    {
        id: '7',
        name: 'Harry Styles',
        message: 'Absolutely love this stream',
        time: '2:57 PM',
        avatar: require('../../assets/images/LS-1.jpg'),
    },
    {
        id: '8',
        name: 'Harry Styles',
        message: 'Absolutely love this stream',
        time: '2:57 PM',
        avatar: require('../../assets/images/LS-6.jpg'),
    },
    {
        id: '9',
        name: 'Harry Styles',
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

    const [menuVisible, setMenuVisible] = useState(false);
    const [listType, setListType] = useState('friends'); // 'friends' or 'blocked'



    const handleConfirm = (id) => {
        alert(`Friend request from ${id} confirmed`);
    };

    const handleDelete = (id) => {
        alert(`Friend request from ${id} deleted`);
    };

    const renderItem = ({ item }) => {
        if (listType === 'requests') {
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
                    <Image source={item.avatar} style={styles.messageListAvatar} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => alert(`chat open`)} style={styles.messageListContent}>
                    <Text numberOfLines={1} style={[styles.messageListName, themeStyles[theme].messageListName]}>
                        {item.name}
                    </Text>
                    <Text numberOfLines={1} style={[styles.meListMessage, themeStyles[theme].meListMessage]}>
                        {item.message}
                    </Text>
                </TouchableOpacity>
                {listType === 'blocked' ? (
                    <TouchableOpacity
                        onPress={() => alert(`Unblocked ${item.name}`)}
                        style={{
                            paddingVertical: 6,
                            paddingHorizontal: 12,
                            backgroundColor: '#d93a63',
                            borderRadius: 6,
                        }}>
                        <Text style={{ color: '#fff', fontWeight: '500', fontSize: 14 }}>Unblock</Text>
                    </TouchableOpacity>
                ) : (
                    <Text style={[styles.messageListTime, themeStyles[theme].messageListTime]}>{item.time}</Text>
                )}
            </View>
        );
    };

    const getTitle = () => {
        if (listType === 'friends') return 'Friends';
        if (listType === 'blocked') return 'Blocked Users';
        if (listType === 'requests') return 'Friend Requests';
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
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingRight: 12 }}>
                        <Text
                            style={[styles.streamListMainTitle, themeStyles[theme].streamListMainTitle]}
                        >
                            {getTitle()}
                        </Text>
                        <TouchableOpacity
                            style={{
                                backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fafafa',
                                height: 30,
                                width: 30,
                                flexDirection: 'row',
                                justifyContent: 'center',
                                alignItems: 'center',
                                borderRadius: 30,
                            }}
                            onPress={() => setMenuVisible(true)}
                        >
                            <Feather
                                name="more-vertical"
                                size={20}
                                color={theme === 'dark' ? '#fff' : '#000'}
                            />
                        </TouchableOpacity>
                    </View>

                    <FlatList
                        data={listType === 'requests' ? friendRequests : messages}
                        keyExtractor={(item) => item.id}
                        renderItem={renderItem}
                        contentContainerStyle={styles.messageListLayout}
                        initialNumToRender={10}
                    />
                </View>
                <Footer />

                {/* Menu Modal */}
                <Modal
                    visible={menuVisible}
                    transparent
                    animationType="fade"
                    onRequestClose={() => setMenuVisible(false)}
                >
                    <Pressable
                        onPress={() => setMenuVisible(false)}
                        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' }}
                    >
                        <View
                            style={{
                                position: 'absolute',
                                top: 100,
                                right: 20,
                                backgroundColor: '#fff',
                                borderRadius: 6,
                                padding: 10,
                                elevation: 5,
                                shadowColor: '#000',
                                shadowOpacity: 0.2,
                                shadowOffset: { width: 0, height: 2 },
                            }}
                        >
                            {['friends', 'blocked', 'requests'].map((type) => (
                                <TouchableOpacity
                                    key={type}
                                    onPress={() => {
                                        setListType(type);
                                        setMenuVisible(false);
                                    }}
                                    style={{
                                        paddingVertical: 6,
                                        backgroundColor: listType === type ? '#f3f3f3' : 'transparent',
                                        borderRadius: 4,
                                        paddingHorizontal: 10,
                                        marginBottom: 4,
                                    }}
                                >
                                    <Text
                                        style={{
                                            fontSize: 14,
                                            fontWeight: listType === type ? 'bold' : 'normal',
                                            color: listType === type ? '#333' : '#666',
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
                    </Pressable>
                </Modal>
            </SafeAreaView>
        </LinearGradient>

    );
};

