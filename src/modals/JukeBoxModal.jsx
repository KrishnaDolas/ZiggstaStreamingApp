/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    FlatList,
    StyleSheet,
    Alert,
    ActivityIndicator,
} from 'react-native';
import Modal from 'react-native-modal';
import Sound from 'react-native-sound';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAppContext } from '../context/AppContext';
import { SendErrorTotheServer, socket } from '../utils/constant';
import Apiclient from '../utils/Apiclient';

Sound.setCategory('Playback');

const MUSIC_LIST = [
    { id: '1', title: 'Calm Piano', file: 'gift_received.mp3' },
    { id: '2', title: 'Chill Beat', file: 'no_more_bets.mp3' },
    { id: '3', title: 'Soft Guitar', file: 'place_your_bet.mp3' },
    { id: '4', title: 'Lo-fi Vibes', file: 'success.mp3' },
];

const JukeBoxModal = ({ visible, onClose, hostDetails, roomId, }) => {
    const { userData } = useAppContext();
    const [search, setSearch] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [musicQueue, setMusicQueue] = useState([]);
    const [currentPlaying, setCurrentPlaying] = useState(null);
    const [activeMusicId, setActiveMusicId] = useState(null);

    const soundRef = useRef(null);

    // 🔍 Filter list efficiently
    const filteredList = useMemo(() => {
        return MUSIC_LIST.filter(item =>
            item.title.toLowerCase().includes(search.toLowerCase())
        );
    }, [search]);

    // 🛑 Stop sound on unmount / close
    useEffect(() => {
        if (!visible) {
            stopSound();
        }
        return () => stopSound();
    }, [visible]);


    // Listen for music queue updates from server
    useEffect(() => {
        if (!socket || !visible) return;

        const handleMusicQueueUpdate = (queue) => {
            console.log('🎵 [JukeBox] Received queue update:', queue);
            setMusicQueue(queue);

            // If no music is currently playing and queue has items, start playing
            if (!currentPlaying && queue.length > 0) {
                playNextInQueue();
            }
        };

        const handleMusicStarted = (musicData) => {
            console.log('🎵 [JukeBox] Music started:', musicData);
            setCurrentPlaying(musicData);
            setActiveMusicId(musicData.musicId);
        };

        const handleMusicEnded = () => {
            console.log('🎵 [JukeBox] Music ended, playing next');
            setCurrentPlaying(null);
            setActiveMusicId(null);
            playNextInQueue();
        };

        socket.on('music-queue-update', handleMusicQueueUpdate);
        socket.on('music-started', handleMusicStarted);
        socket.on('music-ended', handleMusicEnded);

        // Request initial queue
        if (roomId) {
            socket.emit('get-music-queue', roomId);
        }

        return () => {
            socket.off('music-queue-update', handleMusicQueueUpdate);
            socket.off('music-started', handleMusicStarted);
            socket.off('music-ended', handleMusicEnded);
        };
    }, [socket, visible, roomId, currentPlaying]);


    const stopSound = () => {
        if (soundRef.current) {
            soundRef.current.stop();
            soundRef.current.release();
            soundRef.current = null;
        }
        setActiveMusicId(null);
    };

    const playNextInQueue = () => {
        if (musicQueue.length > 0) {
            const nextMusic = musicQueue[0]; // Get first item in queue
            socket.emit('play-music-now', roomId, nextMusic);
        } else {
            setCurrentPlaying(null);
        }
    };

    const playSound = (item) => {
        // If this is the currently playing song, stop it
        if (currentPlaying?.musicId === item.id) {
            stopSound();
            socket.emit('stop-music', roomId);
            return;
        }

        // Add to queue on server
        const musicRequest = {
            userId: userData?.userid,
            userName: userData?.screenName,
            musicId: item.id,
            musicTitle: item.title,
            musicFile: item.file,
            timestamp: Date.now()
        };

        socket.emit('add-to-music-queue', roomId, musicRequest);

        // If queue was empty and no music is playing, play immediately
        if (musicQueue.length === 0 && !currentPlaying) {
            socket.emit('play-music-now', roomId, musicRequest);
        }

        Alert.alert('Success', `Added "${item.title}" to music queue!`);
    };

    const removeFromQueue = (item) => {
        // Only allow users to remove their own songs
        if (item.userId === userData?.userid) {
            socket.emit('remove-from-queue', roomId, item.musicId, userData?.userid);
        }
    };

    const renderQueueItem = ({ item, index }) => {
        const isUserItem = item.userId === userData?.userid;

        return (
            <View style={styles.queueItem}>
                <View style={styles.queueItemInfo}>
                    <Text style={styles.queueNumber}>{index + 1}</Text>
                    <View style={styles.queueTextContainer}>
                        <Text style={styles.queueTitle}>{item.musicTitle}</Text>
                        <Text style={styles.queueUser}>
                            Requested by: {item.userName}
                            {isUserItem && ' (You)'}
                        </Text>
                    </View>
                </View>
                {isUserItem && (
                    <TouchableOpacity
                        onPress={() => removeFromQueue(item)}
                        style={styles.removeButton}
                    >
                        <Ionicons name="close-circle" size={20} color="#FF3B30" />
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    const renderMusicItem = ({ item }) => {
        const isPlaying = currentPlaying?.musicId === item.id;
        const isInQueue = musicQueue.some(queueItem => queueItem.musicId === item.id);

        return (
            <TouchableOpacity
                activeOpacity={0.7}
                style={[styles.musicItem, isInQueue && styles.musicItemInQueue]}
                onPress={() => playSound(item)}
                disabled={isLoading}
            >
                <View style={styles.musicInfo}>
                    <Text style={styles.musicTitle}>{item.title}</Text>
                    <Text style={styles.musicDuration}>3:00 min</Text>
                </View>

                <View style={styles.musicActions}>
                    {isInQueue && (
                        <View style={styles.inQueueBadge}>
                            <Ionicons name="time" size={16} color="#fff" />
                            <Text style={styles.inQueueText}>In Queue</Text>
                        </View>
                    )}

                    {isLoading ? (
                        <ActivityIndicator size="small" color="#4CAF50" />
                    ) : (
                        <Ionicons
                            name={isPlaying ? 'pause-circle' : 'play-circle'}
                            size={26}
                            color={isPlaying ? '#4CAF50' : '#555'}
                        />
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <Modal
            isVisible={visible}
            onBackdropPress={onClose}
            onBackButtonPress={onClose}
            animationIn="slideInUp"
            animationOut="slideOutDown"
            backdropOpacity={0.5}
            useNativeDriver
            style={styles.modal}
        >
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.title}>JukeBox</Text>
                        <Text style={styles.subtitle}>Room Music Player</Text>
                    </View>
                    <TouchableOpacity onPress={onClose}>
                        <Ionicons name="close" size={24} color="#333" />
                    </TouchableOpacity>
                </View>

                {/* Currently Playing */}
                {currentPlaying && (
                    <View style={styles.currentPlaying}>
                        <Ionicons name="musical-notes" size={20} color="#4CAF50" />
                        <View style={styles.currentPlayingInfo}>
                            <Text style={styles.currentPlayingTitle}>
                                Now Playing: {currentPlaying.musicTitle}
                            </Text>
                            <Text style={styles.currentPlayingUser}>
                                Requested by: {currentPlaying.userName}
                            </Text>
                        </View>
                    </View>
                )}

                {/* Music Queue */}
                {musicQueue.length > 0 ? (
                    <View style={styles.queueSection}>
                        <Text style={styles.sectionTitle}>Up Next ({musicQueue.length})</Text>
                        <FlatList
                            data={musicQueue}
                            keyExtractor={(item, index) => `queue-${item.musicId}-${item.userId}-${index}`}
                            renderItem={renderQueueItem}
                            showsVerticalScrollIndicator={false}
                            style={styles.queueList}
                        />
                    </View>
                ) : (
                    <View style={styles.emptyQueue}>
                        <Ionicons name="musical-notes-outline" size={40} color="#CCCCCC" />
                        <Text style={styles.emptyQueueText}>No songs in queue</Text>
                        <Text style={styles.emptyQueueSubtext}>
                            Select a song below to add to the queue
                        </Text>
                    </View>
                )}

                {/* Search */}
                <View style={styles.searchBox}>
                    <Ionicons name="search" size={18} color="#999" />
                    <TextInput
                        placeholder="Search music..."
                        placeholderTextColor="#999"
                        value={search}
                        onChangeText={setSearch}
                        style={styles.searchInput}
                    />
                </View>

                {/* Music List */}
                <FlatList
                    data={filteredList}
                    keyExtractor={item => item.id}
                    renderItem={renderMusicItem}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    initialNumToRender={6}
                    maxToRenderPerBatch={8}
                    windowSize={10}
                    style={styles.musicList}
                    ListHeaderComponent={
                        <Text style={styles.sectionTitle}>Available Music</Text>
                    }
                    ListEmptyComponent={
                        <View style={styles.noResults}>
                            <Ionicons name="musical-note-off" size={30} color="#999" />
                            <Text style={styles.noResultsText}>No music found</Text>
                        </View>
                    }
                />
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modal: {
        margin: 0,
        justifyContent: 'flex-end',
    },
    container: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: 20,
        paddingHorizontal: 16,
        maxHeight: '70%',
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 14,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: '#222',
    },
    subtitle: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    currentPlaying: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E8F5E9',
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
    },
    currentPlayingInfo: {
        marginLeft: 10,
        flex: 1,
    },
    currentPlayingTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2E7D32',
    },
    currentPlayingUser: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    queueSection: {
        marginBottom: 12,
    },
    emptyQueue: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20,
        marginBottom: 12,
        backgroundColor: '#F9F9F9',
        borderRadius: 8,
    },
    emptyQueueText: {
        fontSize: 14,
        color: '#999',
        marginTop: 8,
    },
    emptyQueueSubtext: {
        fontSize: 12,
        color: '#CCC',
        marginTop: 4,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    queueList: {
        maxHeight: 150,
    },
    queueItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: '#F5F5F5',
        borderRadius: 6,
        marginBottom: 4,
    },
    queueItemInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    queueNumber: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#4CAF50',
        marginRight: 10,
        minWidth: 20,
    },
    queueTextContainer: {
        flex: 1,
    },
    queueTitle: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
    },
    queueUser: {
        fontSize: 11,
        color: '#666',
        marginTop: 2,
    },
    removeButton: {
        marginLeft: 10,
        padding: 4,
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F1F1F1',
        borderRadius: 10,
        paddingHorizontal: 10,
        marginBottom: 12,
    },
    searchInput: {
        flex: 1,
        height: 42,
        paddingLeft: 8,
        color: '#000',
        fontSize: 14,
    },
    musicList: {
        flex: 1,
    },
    noResults: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 30,
    },
    noResultsText: {
        fontSize: 14,
        color: '#999',
        marginTop: 8,
    },
    musicItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 0.6,
        borderColor: '#E0E0E0',
    },
    musicItemInQueue: {
        backgroundColor: '#F0F8FF',
    },
    musicInfo: {
        flex: 1,
    },
    musicTitle: {
        fontSize: 15,
        color: '#333',
        fontWeight: '500',
    },
    musicDuration: {
        fontSize: 12,
        color: '#999',
        marginTop: 2,
    },
    musicActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    inQueueBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FF9800',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 12,
        gap: 4,
    },
    inQueueText: {
        fontSize: 10,
        color: '#fff',
        fontWeight: '500',
    },
});

export default JukeBoxModal;



