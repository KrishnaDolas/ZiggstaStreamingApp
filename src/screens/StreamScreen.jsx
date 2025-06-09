
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { RTCView } from 'react-native-webrtc';

const StreamScreen = (props) => {
    const { isHost, localStream, remoteStream, isStreaming, isMuted, isFrontCamera,
         theme, toggleMute, switchCamera, startStreaming, stopStreaming, leaveRoom } = props;
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
              <View style={styles.controls}>
                <TouchableOpacity style={[styles.controlButton, themeStyles[theme].button]} onPress={toggleMute}>
                  <Text style={styles.buttonText}>{isMuted ? 'Unmute' : 'Mute'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.controlButton, themeStyles[theme].button]} onPress={switchCamera}>
                  <Text style={styles.buttonText}>Switch Camera</Text>
                </TouchableOpacity>
              </View>
            ) : null}
            <View style={styles.streamControls}>
              {!isStreaming ? (
                <TouchableOpacity style={[styles.startStreamingButton, themeStyles[theme].startButton]} onPress={startStreaming}>
                  <Text style={styles.buttonText}>Start Streaming</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={[styles.stopStreamingButton, themeStyles[theme].stopButton]} onPress={stopStreaming}>
                  <Text style={styles.buttonText}>Stop Streaming</Text>
                </TouchableOpacity>
              )}
            </View>
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
    );
    }