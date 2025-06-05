import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View, TextInput, Image } from "react-native";
import { styles, themeStyles } from "../../assets/styles/ThemeStyles";
import { StreamListHeader } from "./StreamListHeader";
import Ionicons from 'react-native-vector-icons/Ionicons';
import Footer from "./Footer";

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

    const handleCardPress = (item) => {
        // You can navigate or do something on click
        console.log('Clicked:', item.name);
    };


    return (
        <View style={[styles.formContainer, themeStyles[theme].formContainer]}>
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
            <Text style={[styles.streamListMainTitle, themeStyles[theme].streamListMainTitle]}>For You</Text>
            <ScrollView
                showsVerticalScrollIndicator={false}
                style={{ paddingBottom: 100, paddingHorizontal: 10 }}
            >
                <View style={styles.streamListGrid}>
                    {streamData.map((item) => (
                        <TouchableOpacity key={item.id} style={styles.streamListCard} onPress={() => handleCardPress(item)}>
                            <Image source={item.image} style={styles.streamListImage} />
                            <View style={styles.streamListEyeCountContainer}>
                                <Text style={styles.streamListEyeCount}>{item.viewerCount}</Text>
                                <Ionicons name='eye-outline' size={14} color="#fff" />
                            </View>
                            <View style={styles.streamListOverlay}>
                                <Text style={styles.streamListName} numberOfLines={1}>{item.name}</Text>
                                <Text style={styles.streamListStatus} numberOfLines={1}>{item.description}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
            <Footer />
        </View>
    );
}
export default StreamList;