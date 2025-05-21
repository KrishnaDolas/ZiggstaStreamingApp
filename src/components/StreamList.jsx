import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View,TextInput } from "react-native";
import { styles, themeStyles } from "../../assets/styles/ThemeStyles";

const StreamList = ({ theme,lobbyLoading,lobbyError,rooms,joinRoom,createRoom ,roomId,setRoomId,loading,error}) => {
    return (
        <View style={[styles.formContainer, themeStyles[theme].formContainer]}>
            <Text style={[styles.lobbyTitle, themeStyles[theme].text]}>Available Rooms</Text>
            {lobbyLoading ? (
                <ActivityIndicator size="large" color={themeStyles[theme].primary} style={styles.loader} />
            ) : lobbyError ? (
                <Text style={[styles.error, themeStyles[theme].error]}>{lobbyError}</Text>
            ) : rooms.length === 0 ? (
                <Text style={[styles.roomText, themeStyles[theme].text]}>No rooms available</Text>
            ) : (
                <ScrollView style={styles.roomList}>
                    {rooms.map(room => (
                        <View key={room.roomId} style={[styles.roomItem, themeStyles[theme].roomItem]}>
                            <View>
                                <Text style={[styles.roomText, themeStyles[theme].text]}>Room ID: {room.roomId}</Text>
                                <Text style={[styles.roomText, themeStyles[theme].text]}>Viewers: {room.viewerCount}</Text>
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
                    ))}
                </ScrollView>
            )}
            <Text style={[styles.lobbyTitle, themeStyles[theme].text]}>Create or Join Room</Text>
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
            {error ? <Text style={[styles.error, themeStyles[theme].error]}>{error}</Text> : null}
        </View>
    );
}
export default StreamList;