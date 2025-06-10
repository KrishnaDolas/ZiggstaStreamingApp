import { View, Text, TouchableOpacity, Alert } from "react-native"
import { styles, themeStyles } from "../../assets/styles/ThemeStyles"
import { RTCView } from "react-native-webrtc"
import Ionicons from 'react-native-vector-icons/Ionicons';

const StreamRoom = ({ isHost, localStream, isFrontCamera, isStreaming, toggleMute,
    isMuted, switchCamera, remoteStream,
    requestStreamPermission, hasRequestedStream, leaveRoom, theme
}) => {
    
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
    }

    return (
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
                            <Text style={{backgroundColor:'transparent',color:'white',fontSize:16,padding:10}}>
                                <Ionicons name="star" size={17} /> Art & Music</Text>
                            <Ionicons name="close" size={30} color="yellow" style={{ position: 'absolute', top: 10, right: 10 }} onPress={confirmleaveRoom} />
                        </View>
                        </>
                    ) : null}
                </View>
            )}
            {!isHost && (
                <View style={styles.streamBox}>
                    {isStreaming && remoteStream ? (
                        <>
                            <RTCView
                                streamURL={remoteStream.toURL()}
                                style={styles.fullScreenVideo}
                                objectFit="cover"
                                mirror={true}
                            />
                            <Text style={[styles.viewingText, themeStyles[theme].text]}>📡 Watching stream...</Text>
                        </>
                    ) : localStream ? (
                        <RTCView
                            streamURL={localStream.toURL()}
                            style={styles.fullScreenVideo}
                            objectFit="cover"
                            mirror={isFrontCamera}
                        />
                    ) : null}
                    {!isStreaming && (
                        <TouchableOpacity
                            style={[styles.startStreamingButton, hasRequestedStream && styles.disabledButton, themeStyles[theme].startButton]}
                            onPress={requestStreamPermission}
                            disabled={hasRequestedStream}
                        >
                            <Text style={styles.buttonText}>
                                {hasRequestedStream ? 'Awaiting Permission...' : 'Request to Stream'}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}
            <TouchableOpacity style={[styles.leaveButton, themeStyles[theme].stopButton]} onPress={leaveRoom}>
                <Text style={styles.buttonText}>Leave Room</Text>
            </TouchableOpacity>
        </View>
    )
}
export default StreamRoom