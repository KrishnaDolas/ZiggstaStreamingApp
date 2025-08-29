Copy

import React, {
    useState,
    useRef,
    useEffect,
    useCallback,
    useContext,
} from 'react';
import {
    View,
    Text,
    Image,
    SafeAreaView,
    FlatList,
    StatusBar,
    TouchableOpacity,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    Alert,
    Animated,
    Dimensions,
} from 'react-native';
import { ThemeContext } from '../context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { getGenderFallbackImage, socket } from '../utils/constant';
import Colors from '../../assets/styles/Colors';
import { useAppContext } from '../context/AppContext';
import Apiclient from '../utils/Apiclient';

const { width } = Dimensions.get('window');

export const ChatScreen = ({ route, navigation }) => {
    const { chatUser } = route.params; // User data passed from MessageListScreen
    const { userData } = useAppContext();
    const { theme } = useContext(ThemeContext);
    const insets = useSafeAreaInsets();

    const [messages, setMessages] = useState([]);

    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [userStatus, setUserStatus] = useState('offline'); // online, offline, typing
    const [replyingTo, setReplyingTo] = useState(null);
    const flatListRef = useRef(null);
    const inputRef = useRef(null);
    const typingAnimation = useRef(new Animated.Value(0)).current;
    const typingTimeoutRef = useRef(null);

    // Simulate user status changes
    useEffect(() => {
        if (socket.connected) {
            socket.emit('user-online', chatUser?.userid);
        }
    }, []);

    const handleInputChange = text => {
        if (!isTyping) {
            socket.emit('isTyping', chatUser?.userid, userData?.userid);
        }
        setIsTyping(true);
        setInputText(text);
        // Clear previous timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Set new timeout to emit stopTyping after 1 second of inactivity
        typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
            if (socket.connected) {
                socket.emit('stopTyping', chatUser?.userid, userData?.userid);
            }
        }, 1000); // Adjust delay as needed
    };

    //Socket-events

    const handleUserTyping = userid => {
        if (chatUser?.userid === userid) {
            setUserStatus('typing');
        }
    };
    const HandleStopTyping = userid => {
        if (chatUser?.userid === userid && socket.connected) {
            socket.emit('user-online', chatUser?.userid);
        }
    };
    const HandleUserOnline = userid => {
        if (chatUser?.userid === userid) {
            setUserStatus('online');
        }
    };
    const HandleUseroffline = userid => {
        if (chatUser?.userid === userid) {
            setUserStatus('offline');
            return;
        }
    };
    const HandleReceiveMsg = message => {
        setMessages(prev => [...prev, message]);
        // Scroll to bottom
        // setTimeout(() => {
        //   flatListRef.current?.scrollToEnd({animated: true});
        // }, 100);
        flatListRef.current?.scrollToEnd({ animated: true });
    };

    useEffect(() => {
        socket.on('user-online', HandleUserOnline);
        socket.on('user-offline', HandleUseroffline);
        socket.on('isTyping', handleUserTyping);
        socket.on('stopTyping', HandleStopTyping);
        socket.on('receive-msg', HandleReceiveMsg);
        return () => {
            socket.off('user-online', HandleUserOnline);
            socket.off('user-offline', HandleUserOnline);
            socket.off('isTyping', handleUserTyping);
            socket.off('stopTyping', HandleStopTyping);
            socket.off('receive-msg', HandleReceiveMsg);
        };
    }, []);

    const getChatLogs = useCallback(async () => {
        const payload = {
            fromUserID: userData.userid,
            toUserID: chatUser?.userid,
            limit: 50,
            offset: 0,
        };
        try {
            const response = await Apiclient.post('/chatlogs/getChatLogs', payload);
            console.log('message', response.data.messages);
            if (response.status === 200) {
                // Sort messages by created_at to ensure correct order
                const sortedMessages = response.data.messages.sort(
                    (a, b) => a.created_at - b.created_at,
                );
                setMessages(sortedMessages);
                console.log('Fetched messages:', sortedMessages.length); // Debug log
            }
        } catch (error) { }
    }, [chatUser?.userid, userData.userid]);

    useEffect(() => {
        getChatLogs();
    }, [getChatLogs]);

    // Scroll to the last message when messages are updated
    useEffect(() => {
        if (messages.length > 0 && flatListRef.current) {
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: false });
            }, 100);
        }
    }, [messages]);

    // Typing animation
    useEffect(() => {
        if (userStatus === 'typing') {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(typingAnimation, {
                        toValue: 1,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(typingAnimation, {
                        toValue: 0,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                ]),
            ).start();
        }
    }, [userStatus, typingAnimation]);

    const sendMessage = useCallback(() => {
        if (inputText.trim().length === 0) return;

        const newMessage = {
            id: Date.now().toString(),
            message: inputText.trim(),
            sender_id: userData?.userid,
            receiver_id: chatUser?.userid,
            created_at: new Date().getTime(),
            status: 'pending',
            replyTo: replyingTo?.message,
        };
        socket.emit('send-msg', newMessage);
        setInputText('');
        setReplyingTo(null);

        setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);

        // insted of settimeout use this to remove after 100ms, force scroll to bottom
        // flatListRef.current?.scrollToEnd({animated: true});
    }, [inputText, replyingTo, chatUser?.userid, userData?.userid]);

    const handleLongPress = useCallback(message => {
        Alert.alert('Message Options', 'What would you like to do?', [
            { text: 'Reply', onPress: () => setReplyingTo(message) },
            // { text: 'Copy', onPress: () => { } },
            { text: 'Delete', onPress: () => { }, style: 'destructive' },
            { text: 'Cancel', style: 'cancel' },
        ]);
    }, []);

    const formatTime = useCallback(timestamp => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }, []);

    const getStatusIcon = useCallback(status => {
        switch (status) {
            case 'sent':
                return <Feather name="check" size={18} solid color="#999999" />;
            case 'delivered':
                return (
                    <Ionicons name="checkmark-done" size={18} solid color="#999999" />
                );
            case 'read':
                return (
                    <Ionicons name="checkmark-done" size={18} solid color="#34B7F1" />
                );
            default:
                return null;
        }
    }, []);

    const renderMessage = useCallback(
        ({ item, index }) => {
            const isMe = item.sender_id === userData?.userid;
            const isLastMessage = index === messages.length - 1;

            return (
                <View
                    style={[
                        chatStyles.messageContainer,
                        isMe
                            ? chatStyles.myMessageContainer
                            : chatStyles.otherMessageContainer,
                    ]}>
                    {item.replyTo && (
                        <View
                            style={[
                                chatStyles.replyContainer,
                                {
                                    backgroundColor: isMe
                                        ? 'rgba(0, 0, 0, 0.31)'
                                        : 'rgba(0,0,0,0.1)',
                                },
                            ]}>
                            <View style={chatStyles.replyBorder} />
                            <Text
                                style={[chatStyles.replyText, { color: isMe ? '#fff' : '#666' }]}>
                                {item.replyTo.text}
                            </Text>
                        </View>
                    )}

                    <TouchableOpacity
                        onLongPress={() => handleLongPress(item)}
                        style={[
                            chatStyles.messageBubble,
                            isMe ? chatStyles.myMessageBubble : chatStyles.otherMessageBubble,
                            {
                                backgroundColor: isMe
                                    ? '#d93a63'
                                    : theme === 'dark'
                                        ? Colors.blackCardColor
                                        : '#f0f0f0',
                            },
                        ]}>
                        <Text
                            style={[
                                chatStyles.messageText,
                                { color: isMe ? '#fff' : theme === 'dark' ? '#fff' : '#333' },
                            ]}>
                            {item.message}
                        </Text>

                        <View style={chatStyles.messageFooter}>
                            <Text
                                style={[
                                    chatStyles.timeText,
                                    {
                                        color: isMe
                                            ? 'rgba(255,255,255,0.8)'
                                            : theme === 'dark'
                                                ? '#999'
                                                : '#666',
                                    },
                                ]}>
                                {formatTime(item.created_at)}
                            </Text>
                            {isMe && (
                                <View style={chatStyles.statusContainer}>
                                    {getStatusIcon(item.status)}
                                </View>
                            )}
                        </View>
                    </TouchableOpacity>
                </View>
            );
        },
        [messages, theme, handleLongPress, formatTime, getStatusIcon],
    );

    const renderHeader = () => (
        <View
            style={[
                chatStyles.header,
                {
                    backgroundColor: theme === 'dark' ? Colors.blackBgColor : '#fff',
                    paddingTop: insets.top,
                    borderBottomColor:
                        theme === 'dark' ? Colors.blackDividers : '#e0e0e0',
                },
            ]}>
            <View style={chatStyles.headerContent}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={chatStyles.backButton}>
                    <Feather
                        name="arrow-left"
                        size={24}
                        color={theme === 'dark' ? '#fff' : '#333'}
                    />
                </TouchableOpacity>

                <TouchableOpacity style={chatStyles.userInfo}>
                    <View style={chatStyles.avatarContainer}>
                        <Image
                            source={
                                !chatUser?.avatar || chatUser?.avatar === 'default'
                                    ? getGenderFallbackImage(chatUser?.gender)
                                    : { uri: chatUser?.avatar }
                            }
                            style={chatStyles.avatar}
                        />
                        <View
                            style={[
                                chatStyles.statusDot,
                                {
                                    backgroundColor:
                                        userStatus === 'online' || userStatus === 'typing'
                                            ? '#4CAF50'
                                            : '#999',
                                },
                            ]}
                        />
                    </View>

                    <View style={chatStyles.userDetails}>
                        <Text
                            style={[
                                chatStyles.userName,
                                { color: theme === 'dark' ? '#fff' : '#333' },
                            ]}>
                            {chatUser?.screenName || chatUser?.screenName || 'User'}
                        </Text>

                        {userStatus === 'typing' ? (
                            <Animated.View
                                style={[
                                    chatStyles.typingContainer,
                                    { opacity: typingAnimation },
                                ]}>
                                <Text style={[chatStyles.statusText, { color: '#d93a63' }]}>
                                    typing...
                                </Text>
                            </Animated.View>
                        ) : (
                            <Text
                                style={[
                                    chatStyles.statusText,
                                    { color: userStatus === 'online' ? '#4CAF50' : '#999' },
                                ]}>
                                {userStatus}
                            </Text>
                        )}
                    </View>
                </TouchableOpacity>

                {/* <View style={chatStyles.headerActions}>
                    <TouchableOpacity style={chatStyles.actionButton}>
                        <Feather
                            name="phone"
                            size={20}
                            color={theme === 'dark' ? '#fff' : '#333'}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity style={chatStyles.actionButton}>
                        <Feather
                            name="video"
                            size={20}
                            color={theme === 'dark' ? '#fff' : '#333'}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity style={chatStyles.actionButton}>
                        <Feather
                            name="more-vertical"
                            size={20}
                            color={theme === 'dark' ? '#fff' : '#333'}
                        />
                    </TouchableOpacity>
                </View> */}
            </View>
        </View>
    );

    const renderInputArea = () => (
        <View
            style={[
                chatStyles.inputContainer,
                {
                    backgroundColor: theme === 'dark' ? Colors.blackBgColor : '#fff',
                    borderTopColor: theme === 'dark' ? Colors.blackDividers : '#e0e0e0',
                },
            ]}>
            {replyingTo && (
                <View
                    style={[
                        chatStyles.replyPreview,
                        {
                            backgroundColor:
                                theme === 'dark' ? Colors.blackCardColor : '#f5f5f5',
                        },
                    ]}>
                    <View style={chatStyles.replyPreviewContent}>
                        <Feather name="corner-up-left" size={16} color="#d93a63" />
                        <Text
                            style={[
                                chatStyles.replyPreviewText,
                                { color: theme === 'dark' ? '#ccc' : '#666' },
                            ]}>
                            Replying to: {replyingTo?.message}
                        </Text>
                    </View>
                    <TouchableOpacity onPress={() => setReplyingTo(null)}>
                        <Feather name="x" size={18} color="#999" />
                    </TouchableOpacity>
                </View>
            )}

            <View style={chatStyles.inputRow}>
                <TouchableOpacity style={chatStyles.attachButton}>
                    <Feather name="paperclip" size={20} color="#999" />
                </TouchableOpacity>

                <View
                    style={[
                        chatStyles.textInputContainer,
                        {
                            backgroundColor:
                                theme === 'dark' ? Colors.blackInputBgColor : '#f5f5f5',
                        },
                    ]}>
                    <TextInput
                        ref={inputRef}
                        style={[
                            chatStyles.textInput,
                            { color: theme === 'dark' ? '#fff' : '#333' },
                        ]}
                        placeholder="Type a message..."
                        placeholderTextColor={theme === 'dark' ? '#999' : '#666'}
                        value={inputText}
                        onChangeText={handleInputChange}
                        multiline
                        maxLength={1000}
                    />
                </View>

                <TouchableOpacity
                    onPress={sendMessage}
                    style={[
                        chatStyles.sendButton,
                        { opacity: inputText.trim().length > 0 ? 1 : 0.5 },
                    ]}>
                    <LinearGradient
                        colors={['#d93a63', '#e85a7a']}
                        style={chatStyles.sendButtonGradient}>
                        <MaterialIcons name="send" size={20} color="#fff" />
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView
            style={[
                chatStyles.container,
                {
                    backgroundColor: theme === 'dark' ? Colors.blackBgColor : '#fff',
                    paddingBottom: insets.bottom,
                },
            ]}>
            <StatusBar
                barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
                backgroundColor={theme === 'dark' ? '#121212' : '#ffffff'}
                translucent={false}
            />
            {renderHeader()}

            <KeyboardAvoidingView
                style={chatStyles.content}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <View
                    style={[
                        chatStyles.messagesContainer,
                        {
                            backgroundColor:
                                theme === 'dark' ? Colors.blackBgColor : '#f8f8f8',
                        },
                    ]}>
                    <FlatList
                        ref={flatListRef}
                        data={messages}
                        keyExtractor={item => item.id}
                        renderItem={renderMessage}
                        contentContainerStyle={chatStyles.messagesList}
                        showsVerticalScrollIndicator={false}
                        // onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}

                        // New props for direct jump to the last message
                        initialScrollIndex={messages.length > 0 ? messages.length - 1 : 0}
                        getItemLayout={(data, index) => ({
                            length: 80, // 🔹 adjust approx height of a chat bubble
                            offset: 90 * index,
                            index,
                        })}
                    />
                </View>

                {renderInputArea()}
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const chatStyles = {
    container: {
        flex: 1,
    },
    header: {
        borderBottomWidth: 1,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        height: 60,
    },
    backButton: {
        marginRight: 12,
        padding: 4,
    },
    userInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarContainer: {
        position: 'relative',
        marginRight: 12,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    statusDot: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 12,
        height: 12,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: '#fff',
    },
    userDetails: {
        flex: 1,
    },
    userName: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '400',
    },
    typingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionButton: {
        marginLeft: 16,
        padding: 4,
    },
    content: {
        flex: 1,
    },
    messagesContainer: {
        flex: 1,
    },
    messagesList: {
        paddingVertical: 16,
        paddingHorizontal: 16,
    },
    messageContainer: {
        marginBottom: 12,
    },
    myMessageContainer: {
        alignItems: 'flex-end',
    },
    otherMessageContainer: {
        alignItems: 'flex-start',
    },
    messageBubble: {
        maxWidth: width * 0.75,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
    },
    myMessageBubble: {
        borderBottomRightRadius: 4,
    },
    otherMessageBubble: {
        borderBottomLeftRadius: 4,
    },
    messageText: {
        fontSize: 16,
        lineHeight: 20,
    },
    messageFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        marginTop: 4,
    },
    timeText: {
        fontSize: 11,
        marginRight: 4,
    },
    statusContainer: {
        marginLeft: 4,
    },
    replyContainer: {
        marginBottom: 6,
        paddingLeft: 12,
        paddingRight: 16,
        paddingVertical: 6,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
    },
    replyBorder: {
        width: 3,
        height: '100%',
        backgroundColor: '#d93a63',
        marginRight: 8,
        borderRadius: 2,
    },
    replyText: {
        fontSize: 13,
        fontStyle: 'italic',
    },
    inputContainer: {
        borderTopWidth: 1,
        paddingBottom: 16,
    },
    replyPreview: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    replyPreviewContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    replyPreviewText: {
        marginLeft: 8,
        fontSize: 13,
        flex: 1,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: 16,
        paddingTop: 12,
    },
    attachButton: {
        marginRight: 12,
        padding: 8,
    },
    textInputContainer: {
        flex: 1,
        borderRadius: 20,
        paddingHorizontal: 16,
        marginRight: 12,
        minHeight: 40,
        justifyContent: 'center',
    },
    textInput: {
        fontSize: 16,
        maxHeight: 100,
        paddingVertical: 8,
    },
    sendButton: {
        marginBottom: 0,
    },
    sendButtonGradient: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
};