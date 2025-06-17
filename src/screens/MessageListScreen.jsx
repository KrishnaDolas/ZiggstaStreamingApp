import React, { useContext } from 'react';
import { View, Text, Image, SafeAreaView, FlatList, StatusBar } from 'react-native';
import { styles, themeStyles } from '../../assets/styles/ThemeStyles';
import themeColors from '../../assets/styles/Colors';
import { ThemeContext } from '../context/ThemeContext';
import Footer from '../components/Footer';
import { StreamListHeader } from '../components/StreamListHeader';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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

export const MessageListScreen = ({ userData }) => {
    const insetsTop = useSafeAreaInsets();
    const { theme } = useContext(ThemeContext);

    const renderItem = ({ item }) => (
        <View style={[styles.messageListContainer, themeStyles[theme].messageListContainer]}>
            <Image source={item.avatar} style={styles.messageListAvatar} />
            <View style={styles.messageListContent}>
                <Text numberOfLines={1} style={[styles.messageListName, themeStyles[theme].messageListName]}>{item.name}</Text>
                <Text numberOfLines={1} style={[styles.meListMessage, themeStyles[theme].meListMessage]}>{item.message}</Text>
            </View>
            <Text style={[styles.messageListTime, themeStyles[theme].messageListTime]}>{item.time}</Text>
        </View>
    );
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
                <StreamListHeader />
                <View
                    style={[
                        styles.messageListMainCardLayout,
                        themeStyles[theme].messageListMainCardLayout,
                    ]}>
                    <Text
                        style={[
                            styles.streamListMainTitle,
                            themeStyles[theme].streamListMainTitle,
                        ]}
                    >
                        Messages
                    </Text>
                    <FlatList
                        data={messages}
                        keyExtractor={(item) => item.id}
                        renderItem={renderItem}
                        contentContainerStyle={styles.messageListLayout}
                        initialNumToRender={10}
                    />
                </View>
                <Footer />
            </SafeAreaView>
        </LinearGradient>

    );
};

