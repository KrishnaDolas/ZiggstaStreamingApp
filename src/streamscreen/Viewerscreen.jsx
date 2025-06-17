import { View, Text, TouchableOpacity } from 'react-native';
import { styles, themeStyles } from '../../assets/styles/ThemeStyles';
import { RTCView } from 'react-native-webrtc';

const Viewerscreen = ({ remoteStream, localStream, isStreaming, isViewerStreaming, requestStreamPermission, hasRequestedStream, isFrontCamera, theme, viewerCount, toggleMute, switchCamera, leaveRoom }) => {
  return (
    <View style={styles.roomInfo}>
      <View style={styles.streamBox}>
        {isStreaming && (
          <View style={{ flexDirection: 'row', height: '100%' }}>
            {remoteStream && (
              <RTCView
                streamURL={remoteStream.toURL()}
                style={[styles.fullScreenVideo, { width: isViewerStreaming && localStream ? '50%' : '100%' }]}
                objectFit="cover"
                mirror={true}
              />
            )}
            {isViewerStreaming && localStream && (
              <RTCView
                streamURL={localStream.toURL()}
                style={[styles.fullScreenVideo, { width: '50%' }]}
                objectFit="cover"
                mirror={isFrontCamera}
              />
            )}
          </View>
        )}
        {isStreaming && (
          <View style={styles.controls}>
            {!isViewerStreaming && (
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
            <Text style={[styles.viewingText, themeStyles[theme].text]}>📡 Watching stream... ({viewerCount} viewers)</Text>
            <TouchableOpacity onPress={leaveRoom} style={[styles.startStreamingButton, themeStyles[theme].startButton]}>
              <Text style={styles.buttonText}>Leave Room</Text>
            </TouchableOpacity>
            {isViewerStreaming && (
              <>
                <TouchableOpacity onPress={toggleMute} style={[styles.startStreamingButton, themeStyles[theme].startButton]}>
                  <Text style={styles.buttonText}>{isMuted ? 'Unmute' : 'Mute'}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={switchCamera} style={[styles.startStreamingButton, themeStyles[theme].startButton]}>
                  <Text style={styles.buttonText}>Switch Camera</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}
        {!isStreaming && (
          <Text style={[styles.viewingText, themeStyles[theme].text]}>Waiting for host to start streaming...</Text>
        )}
      </View>
    </View>
  );
};

export default Viewerscreen;