import {
    ActivityIndicator, ScrollView, Text, TouchableOpacity, TextInput, Image, FlatList, View,
    Modal,
    Alert
} from "react-native";

import { styles, themeStyles } from "../../assets/styles/ThemeStyles";
import { StreamListHeader } from "./StreamListHeader";
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import Footer from "./Footer";
import LinearGradient from "react-native-linear-gradient";
import { Dimensions } from 'react-native';
import { useState } from "react";

const streamData = [
    {
        id: 1,
        name: 'Stella Malone',
        description: 'Just Chilling Just Chilling',
        image: require('../../assets/images/LS-1.jpg'),
        viewerCount: '11k'
    },
    {
        id: 2,
        name: 'Mathew Hyden',
        description: 'On Vacations',
        image: require('../../assets/images/LS-2.jpg'),
        viewerCount: '5.3k'
    },
    {
        id: 3,
        name: 'Kitty Hazelwood',
        description: 'On Duty',
        image: require('../../assets/images/LS-3.jpg'),
        viewerCount: '2k'
    },
    {
        id: 4,
        name: 'Mitchel Santner',
        description: "Let's engage",
        image: require('../../assets/images/LS-4.jpg'),
        viewerCount: '100k'
    },
    {
        id: 5,
        name: 'Tom Curren',
        description: 'Come on Guys',
        image: require('../../assets/images/LS-5.jpg'),
        viewerCount: '100'
    },
    {
        id: 6,
        name: 'Sofia Jonson',
        description: "Talk About Beauty",
        image: require('../../assets/images/LS-6.jpg'),
        viewerCount: '10k'
    },
    {
        id: 7,
        name: 'Stella Malone',
        description: 'Just Chilling',
        image: require('../../assets/images/LS-1.jpg'),
        viewerCount: '5k'
    },
    {
        id: 8,
        name: 'Mathew Hyden',
        description: 'On Vacations',
        image: require('../../assets/images/LS-2.jpg'),
        viewerCount: '1.1k'
    },
];

const StreamList = ({ theme, lobbyLoading, lobbyError, rooms, joinRoom, createRoom, roomId, setRoomId, loading, error }) => {
    const screenHeight = Dimensions.get('window').height;
    const [openStreamInputModal, setOpenStreamInputModal] = useState(false);
    const [roomIdInput, setRoomIdInput] = useState('');

    const submitroomnameandcreateroom=()=>{
        if (roomIdInput.trim() === '') {
            Alert.alert('Error', 'Please enter a room name before creating a room.');
            return;
        }
        createRoom();
        setOpenStreamInputModal(false);
        setRoomIdInput('');
    }
    const renderItem = (item) => {
        return (
            <TouchableOpacity style={styles.streamListCard} onPress={() => joinRoom(item.id)}>
                <Image source={item.image} style={[styles.streamListImage, { height: screenHeight * 0.3 - 40 }]} />
                <View style={styles.streamListEyeCountContainer}>
                    <Text style={styles.streamListEyeCount}>{item.viewerCount}</Text>
                    <Ionicons name='eye-outline' size={14} color="#fff" />
                </View>
                <View style={styles.streamListOverlay}>
                    <Text style={styles.streamListName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.streamListStatus} numberOfLines={1}>{item.description}</Text>
                </View>
            </TouchableOpacity>
        )
    }

    return (
        <LinearGradient style={{ height: '100%', width: '100%', position: "relative" }} colors={['#a000df', '#fc4692']} start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }} >
            {/* <Text style={[styles.lobbyTitle, themeStyles[theme].text]}>Available Rooms</Text>
            {lobbyLoading ? (
                <ActivityIndicator size="large" color={themeStyles[theme].primary} style={styles.loader} />
            ) : lobbyError ? (
                <Text style={[styles.error, themeStyles[theme].error]}>{lobbyError}</Text>
            ) : rooms.length === 0 ? (
                <Text style={[styles.roomText, themeStyles[theme].text]}>No rooms available</Text>
            ) : (
                <ScrollView style={styles.roomList}>
                    {rooms.map((room,ind)=>{
                        return(
                            <View key={ind} style={[styles.roomItem, themeStyles[theme].roomItem]}>
                            <View>
                                <Text style={[styles.roomText, themeStyles[theme].text]}>Room ID: {room.roomID}</Text>
                                <Text style={[styles.roomText, themeStyles[theme].text]}>Room Name: {room.RoomName}</Text>
                                <Text style={[styles.roomText, themeStyles[theme].text]}>Viewers: {room.viewerCount}</Text>
                                {room.participants.split(',').map((participant, index) => (
                                    <Text key={index} style={[styles.roomText, themeStyles[theme].text]}>
                                        Participant {index + 1}: {participant}
                                    </Text>
                                ))}
                                <Text style={[styles.roomText, themeStyles[theme].text]}>participants: {room.host}</Text>
                                <Text style={[styles.roomText, themeStyles[theme].text]}>
                                    Status: {room.isStreaming ? 'Streaming' : 'Not Streaming'}
                                </Text>
                            </View>
                            <TouchableOpacity
                                style={[styles.joinButton, themeStyles[theme].button]}
                                onPress={() => joinRoom(room.roomId)}
                            >
                                <Text style={styles.buttonText}>Join</Text>
                            </TouchableOpacity>
                        </View>
                        )
                    })}
                </ScrollView>
            )} */}


            {/* <Text style={[styles.lobbyTitle, themeStyles[theme].text]}>Create or Join Room</Text>
            <TextInput
                placeholder="Enter Room ID"
                value={roomId}
                onChangeText={setRoomId}
                style={[styles.input, themeStyles[theme].input]}
                placeholderTextColor={themeStyles[theme].placeholder.color}
            />
            {loading ? (
                <ActivityIndicator size="large" color={themeStyles[theme].primary} style={styles.loader} />
            ) : (
                <>
                    <TouchableOpacity style={[styles.button, themeStyles[theme].button]} onPress={createRoom}>
                        <Text style={styles.buttonText}>Create Room</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.button, themeStyles[theme].button]} onPress={() => joinRoom()}>
                        <Text style={styles.buttonText}>Join Room</Text>
                    </TouchableOpacity>
                </>
            )}
            {error ? <Text style={[styles.error, themeStyles[theme].error]}>{error}</Text> : null} */}

            {/* rohit code  */}

            <StreamListHeader />
            <View style={[styles.streamListMainCardLayout, themeStyles[theme].streamListMainCardLayout]}>
                <Text style={[styles.streamListMainTitle, themeStyles[theme].streamListMainTitle]}>For You</Text>
                <FlatList
                    data={streamData}
                    keyExtractor={(item) => item.id.toString()}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.streamListScrollContainer}
                    initialNumToRender={8}
                    // windowSize={5}
                    numColumns={2} // Adjust based on your grid layout
                    columnWrapperStyle={styles.streamListGrid}
                    renderItem={(item) => renderItem(item.item)}
                />
            </View>

            <View style={[styles.streamListFiltersBtnGroup]}>
                <TouchableOpacity style={[styles.streamListFiltersWhiteBtn]}>
                    <FontAwesome6 name='wrench' size={24} color="#262628" />
                </TouchableOpacity>
                {/* <TouchableOpacity style={[styles.streamListFiltersColorBtn]} onPress={() => createRoom()}>
                    <Text style={[styles.streamListFiltersColorBtnText]}>Start Stream</Text>
                </TouchableOpacity> */}
                <TouchableOpacity style={[styles.streamListFiltersColorBtn]} onPress={() => setOpenStreamInputModal(true)}>
                    <Text style={[styles.streamListFiltersColorBtnText]}>Start Stream</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.streamListFiltersWhiteBtn]}>
                    <FontAwesome6 name='filter' size={24} color="#262628" />
                </TouchableOpacity>
            </View>
            {/* stream input Modal */}
            {openStreamInputModal && (
                <Modal visible={openStreamInputModal} transparent animationType="fade">
                    <View style={[styles.roomInputModalOverlay]}>
                        <View style={[styles.roomInputModalCard]}>
                            <View style={{ flexDirection: "row", justifyContent: 'flex-end', marginBottom: 14 }}>
                                <TouchableOpacity
                                    onPress={() => setOpenStreamInputModal(false)}
                                    style={[styles.strHedSearchModalCloseBtn]}
                                >
                                    <Ionicons name="close" size={14} color="#fff" />
                                </TouchableOpacity>
                            </View>
                            <View style={[styles.strHedSearchModalForm]}>
                                <TextInput
                                    placeholder="Enter Room Name"
                                    placeholderTextColor="#888"
                                    value={roomIdInput}
                                    onChangeText={setRoomIdInput}
                                    style={[styles.strHedSearchModalInput]}
                                />
                                <TouchableOpacity onPress={submitroomnameandcreateroom}>
                                    <LinearGradient
                                        colors={['rgba(184, 58, 243, 1)', 'rgba(105, 80, 251, 1)']}
                                        start={{ x: 0.15, y: 1 }}
                                        end={{ x: 1, y: 0 }}
                                        style={styles.strHedSearchModalSearchBtn}
                                    >
                                        <Text style={{ color: '#fff', fontSize: 16, fontWeight: '400' }}>Create Room</Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            )}

            <Footer />
        </LinearGradient>

    );
}
export default StreamList;