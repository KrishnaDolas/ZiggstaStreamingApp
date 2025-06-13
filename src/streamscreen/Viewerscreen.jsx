import { View, Text, TouchableOpacity} from 'react-native';
import { styles, themeStyles } from '../../assets/styles/ThemeStyles';
import { RTCView } from 'react-native-webrtc';

const Viewerscreen = (props) => {
    const { remoteStream, localStream, isStreaming, requestStreamPermission,
         hasRequestedStream, isFrontCamera, theme,switchCamera,toggleMute,leaveRoom } = props;
         console.log('Viewerscreen props:', props);
    return (
        <View>
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
        </View>
    )
}
export default Viewerscreen;