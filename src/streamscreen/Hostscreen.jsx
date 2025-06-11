import { Alert, Image, Keyboard, ScrollView, Text, TextInput, TouchableOpacity, View, } from "react-native"
import { styles } from "../../assets/styles/ThemeStyles";
import { useState,useEffect } from "react";
import { RTCView } from "react-native-webrtc";
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from "react-native-linear-gradient";

const chats = [
    {
        id: 1,
        userProfile: require('../../assets/images/LS-3.jpg'),
        userName: 'Kevin Spacey Kevin Spacey Kevin Spacey Kevin Spacey',
        message: 'This is looking good now This is looking good now This is looking good now',
    },
    {
        id: 2,
        userProfile: require('../../assets/images/LS-2.jpg'),
        userName: 'Mary Pollard',
        message: 'Yes we need that',
    },
    {
        id: 3,
        userProfile: require('../../assets/images/LS-1.jpg'),
        userName: 'Harry Styles',
        message: 'Absolutely love this stream',
    },
    {
        id: 4,
        userProfile: require('../../assets/images/LS-3.jpg'),
        userName: 'Kevin Spacey',
        message: 'This is looking good now',
    },
    {
        id: 5,
        userProfile: require('../../assets/images/LS-3.jpg'),
        userName: 'Kevin Spacey Kevin Spacey Kevin Spacey Kevin Spacey',
        message: 'This is looking good now This is looking good now This is looking good now',
    },
    {
        id: 6,
        userProfile: require('../../assets/images/LS-2.jpg'),
        userName: 'Mary Pollard',
        message: 'Yes we need that',
    },
];
const Hostscreen=(props)=>{
    const { localStream, isStreaming, isFrontCamera, isHost,switchCamera,toggleMute,leaveRoom } = props;

    const [keyboardOffset, setKeyboardOffset] = useState(0);
    const [userChatInput, setUserChatInput] = useState('');


    const confirmleaveRoom = () => {
        Alert.alert(
            "Leave Room",
            "Are you sure you want to leave the room?",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Leave",
                    onPress: () => leaveRoom(),
                    style: "destructive"
                }
            ]
        );
    };

    // Handle keyboard events to adjust the input box position

    useEffect(() => {
        const showSub = Keyboard.addListener('keyboardDidShow', (e) => {
            setKeyboardOffset(e.endCoordinates.height);
        });
        const hideSub = Keyboard.addListener('keyboardDidHide', () => {
            setKeyboardOffset(0);
        });

        return () => {
            showSub.remove();
            hideSub.remove();
        };
    }, []);


    return(
        <View style={styles.roomInfo}>
            {isHost && (
                <View style={styles.streamBox}>
                    {localStream && (
                        <RTCView
                            streamURL={localStream.toURL()}
                            style={styles.fullScreenVideo}
                            objectFit="cover"
                            mirror={isFrontCamera}
                        />
                    )}
                    {isStreaming ? (
                        <>
                            <View style={styles.controls}>
                                <View style={styles.strRoomHeader}>
                                    <View style={styles.strRoomHeaderLeft}>
                                        <Image style={styles.strRoomHeaderLeftProfileImg} source={require('../../assets/images/LS-3.jpg')} />
                                        <View style={styles.strRoomHeaderLeftProfileInfo}>
                                            <Text style={[styles.strRoomHeaderLeftProfileName]}>
                                                Angenlico Marias
                                            </Text>
                                            <View style={[styles.strRoomHeaderLeftProfileSubInfo]}>
                                                <Ionicons name="heart" solid size={16} color="#fff" />
                                                <Text style={[styles.strRoomHeaderLeftProfileSubText]}>12345</Text>
                                            </View>
                                        </View>
                                    </View>
                                    <View style={styles.strRoomHeaderRight}>
                                        <View style={styles.strRoomHeaderRWalletInfo}>
                                            <Ionicons name="diamond" solid size={14} color="#ffea23" />
                                            <Text style={styles.strRoomHeaderRWalletInfoText}>1023.250</Text>
                                        </View>
                                        <TouchableOpacity style={styles.strRoomHeaderRIconBox}>
                                            <Ionicons name="flag" size={28} color="#dc3131" />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={confirmleaveRoom} style={styles.strRoomHeaderRIconBox}>
                                            <Ionicons name="close" size={30} color="#fff" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                <LinearGradient
                                    colors={['rgba(8, 8, 8, 1)', 'rgba(8, 8, 8, 0)']}
                                    start={{ x: 0.5, y: 1 }}
                                    end={{ x: 0.5, y: 0 }}
                                    style={styles.strRoomFooter}
                                >
                                    <View style={styles.strLiveStats}>
                                        <Text style={styles.strTitle}>The world is a happy place</Text>
                                        <View style={styles.streamViewerCount}>
                                            <Ionicons name="eye-outline" size={18} color="#ffea23" />
                                            <Text style={styles.streamViewerCountTitle}>1.4k</Text>
                                        </View>
                                    </View>
                                    <View style={styles.strRoomFooterChatOrActionsBox}>
                                        <View style={[styles.streamChatContainer, { height: 150 }]}>
                                            <ScrollView
                                                // contentContainerStyle={{ paddingBottom: 20 }}
                                                showsVerticalScrollIndicator={false}
                                            >
                                                {chats.map((chat) => {
                                                    return (
                                                        <View key={chat.id} style={styles.streamChatItem}>
                                                            <Image style={styles.streamChatItemProfileImg} source={chat.userProfile} />
                                                            <View numberOfLines={1} style={styles.streamChatMessageBox}>
                                                                <Text numberOfLines={1} style={styles.streamChatUserName}>
                                                                    {chat.userName.length > 30 ? chat.userName.slice(0, 30) + '...' : chat.userName}
                                                                </Text>
                                                                <Text numberOfLines={1} style={styles.streamChatMessage}>
                                                                    {chat.message.length > 40 ? chat.message.slice(0, 40) + '...' : chat.message}
                                                                </Text>
                                                            </View>
                                                        </View>
                                                    );
                                                })}
                                            </ScrollView>
                                        </View>
                                        <View style={styles.strRoomFooterSocialActions}>
                                            <TouchableOpacity style={styles.strRoomFooterSocialActionsBtn}>
                                                <Ionicons name="person-add" size={30} color="#fff" />
                                            </TouchableOpacity>
                                            <TouchableOpacity style={styles.strRoomFooterSocialActionsBtn}>
                                                <Ionicons name="heart" size={30} color="#fff" />
                                            </TouchableOpacity>
                                            <TouchableOpacity style={styles.strRoomFooterSocialActionsBtn}>
                                                <Ionicons name="share-social-sharp" size={30} color="#fff" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                    <View style={[styles.strRoomBottomBox, { marginBottom: keyboardOffset }]}>
                                        <TextInput
                                            placeholder=""
                                            placeholderTextColor="#414141"
                                            value={userChatInput}
                                            onChangeText={setUserChatInput}
                                            style={styles.strRoomBottomBoxInput}
                                        />
                                        <TouchableOpacity style={styles.strRoomBottomBoxIconBox}>
                                            <Ionicons name="add-outline" size={30} color="#fff" />
                                        </TouchableOpacity>
                                        <TouchableOpacity style={[styles.strRoomBottomBoxIconBox]}>
                                            <Ionicons name="gift" size={30} color="#FF00FF" />
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.strRoomBottomBoxIconBox}>
                                            <Ionicons name="cart" size={30} color="#fff" />
                                        </TouchableOpacity>
                                    </View>
                                </LinearGradient>
                            </View>
                        </>
                    ) : null
                    }
                </View>
            )}
        </View>
    )
}
export default Hostscreen;