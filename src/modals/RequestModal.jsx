/* eslint-disable react-native/no-inline-styles */
import React, { memo, useContext, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, Image, Alert } from 'react-native';
import Modal from 'react-native-modal';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { styles } from '../../assets/styles/ThemeStyles';
import { useAppContext } from '../context/AppContext';
import { getGenderFallbackImage, socket } from '../utils/constant';
import { ThemeContext } from '../context/ThemeContext';
import Colors from '../../assets/styles/Colors';
const RequestModal = ({
    visible,
    onClose,
    StreamRequestList = [],
    streamGuest = [],
}) => {
    const { theme } = useContext(ThemeContext);
    const { userAddress } = useAppContext();
    const [processingIds, setProcessingIds] = useState([]);
    const [muteProcessingIds, setMuteProcessingIds] = useState([]);

    // --- Helper Functions ---
    const lockAction = (id) => setProcessingIds((prev) => [...prev, id]);
    const unlockAction = (id) => setProcessingIds((prev) => prev.filter((pid) => pid !== id));
    const isProcessing = (id) => processingIds.includes(id);


    const lockMuteAction = (id) => setMuteProcessingIds((prev) => [...prev, id]);
    const unlockMuteAction = (id) => setMuteProcessingIds((prev) => prev.filter((pid) => pid !== id));
    const isMuteProcessing = (id) => muteProcessingIds.includes(id);

    // --- Accept/Reject stream request ---
    const AcceptStream = (action, requesterId, name, CustomID, item) => {

        if (isProcessing(requesterId)) return; // Prevent multiple clicks

        lockAction(requesterId);

        console.log(`Action: ${action}, Requester ID: ${requesterId}`);

        const Address = userAddress ?
            { country: userAddress?.country, city: userAddress?.city }
            : { country: 'India', city: 'Pune' };

        console.log(Address);

        if (action === 'approve') {
            socket.emit('approveStream', requesterId, Address, name, CustomID, item?.avatar, item?.Gender, () => {
                unlockAction(requesterId); // Release lock on ack
            });
        }
        if (action === 'reject') {
            socket.emit('rejectStream', requesterId, () => {
                unlockAction(requesterId);
            });
        }

        // Fallback: release lock if server never responds
        setTimeout(() => unlockAction(requesterId), 5000);
    };

    // --- Generic host control actions (mute/unmute/stop) ---
    const GetAction = (targetId, action) => {
        console.log('action', action);
        // Handle mute/unmute separately with quick release
        if (action === 'mute' || action === 'unmute') {
            if (isMuteProcessing(targetId)) return;

            lockMuteAction(targetId);
            socket.emit('host-control', { action, targetId }, () => {
                unlockMuteAction(targetId);
            });

            // Quick release for mute actions
            setTimeout(() => unlockMuteAction(targetId), 1000);
            return;
        }

        // Handle other actions (stop-stream, etc.) with normal processing
        if (isProcessing(targetId)) return;

        lockAction(targetId);
        socket.emit('host-control', { action, targetId }, () => {
            unlockAction(targetId);
        });

        setTimeout(() => unlockAction(targetId), 5000);

    };

    // --- Remove all pending requests ---
    const RemoveAllRequest = () => {
        StreamRequestList.forEach((item) => {
            socket.emit('rejectStream', item.ID);
        });
        onClose();
    };

    // --- Keep processingIds in sync with existing requests ---
    useEffect(() => {
        setProcessingIds((prev) =>
            prev.filter((id) => StreamRequestList.some((item) => item.ID === id))
        );
    }, [StreamRequestList]);


    return (
        <Modal
            isVisible={visible}
            onBackdropPress={onClose}
            animationIn="slideInUp"
            animationOut="slideOutDown"
            animationInTiming={300}
            animationOutTiming={200}
            useNativeDriver={true}
            backdropOpacity={0.3}
            style={{ margin: 0, justifyContent: 'flex-end' }}
        >
            <View style={{
                backgroundColor: theme === 'light' ?
                    '#fff' : Colors.blackModalBgColor,
                padding: 20,
                borderTopLeftRadius: 12,
                borderTopRightRadius: 12,
                maxHeight: '90%',
            }}>
                {/* Section 1: Stream Requests */}
                <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                }}>
                    <Text style={{
                        fontSize: 18,
                        color: theme === 'light' ?
                            '#000' : '#fff',
                        fontWeight: 'bold',
                        marginBottom: 10,
                    }}>
                        Requests
                    </Text>
                    {StreamRequestList?.length > 0 && (
                        <View style={{
                            borderRadius: 3,
                            backgroundColor: theme === 'light' ?
                                '#f2f2f2' : Colors.blackBtnBg,
                            paddingHorizontal: 10,
                            paddingVertical: 0,
                            flexDirection: 'row',
                            alignItems: 'center',
                            height: '25',
                            marginBottom: 20,
                        }}>
                            <TouchableOpacity onPress={RemoveAllRequest}>
                                <Text style={{ fontSize: 12, color: 'red' }}>Remove ALL</Text>
                            </TouchableOpacity>
                        </View>)}
                </View>
                {StreamRequestList.length === 0 ? (
                    <Text style={{
                        color: theme === 'light' ?
                            '#000' : '#fff',
                        marginBottom: 20,
                    }}>No Pending Requests at this time</Text>
                ) : (
                    <FlatList
                        data={StreamRequestList}
                        keyExtractor={(item) => item.CustomID}
                        renderItem={({ item }) => {
                            const isDisabled = streamGuest.length >= 6 || isProcessing(item.ID);
                            return (
                                <View style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    marginBottom: 12,
                                    padding: 10,
                                }}>
                                    <View style={{ position: 'relative' }}>
                                        <Image
                                            style={styles.strRoomHeaderLeftProfileImg}
                                            source={!item?.avatar || item?.avatar === 'default' ?
                                                getGenderFallbackImage(item.Gender) : { uri: item?.avatar }}
                                        />
                                    </View>
                                    <View style={{ flex: 1, marginLeft: 10, flexDirection: 'column' }}>
                                        <Text style={{
                                            fontSize: 16,
                                            color: theme === 'light' ? '#000' : '#fff',
                                        }}>
                                            {item.Name}
                                        </Text>
                                        <Text style={{
                                            color: theme === 'light' ? '#000' : '#fff',
                                        }}>
                                            {`${item?.country} (${item?.city})`}
                                        </Text>
                                    </View>
                                    <TouchableOpacity
                                        disabled={isDisabled}
                                        onPress={() => AcceptStream('approve', item.ID, item.Name, item?.CustomID, item)}
                                        style={{
                                            backgroundColor: streamGuest.length >= 6 ? 'grey' : 'black',
                                            paddingVertical: 4,
                                            paddingHorizontal: 9,
                                            borderRadius: 6,
                                        }}
                                    >
                                        <View style={{ position: 'relative', marginRight: 6 }}>
                                            <Ionicons name="videocam-outline" size={22} color="#fff" />
                                            <Ionicons
                                                name="add-circle"
                                                size={10}
                                                color="#fff"
                                                style={{
                                                    position: 'absolute',
                                                    bottom: 0,
                                                    right: 9,
                                                    backgroundColor: 'black',
                                                    borderRadius: 6,
                                                }}
                                            />
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            )
                        }}
                    />
                )}

                {/* Divider */}
                <View style={{ height: 1, backgroundColor: theme === 'light' ? '#ddd' : Colors.blackDividers, marginVertical: 15 }} />

                {/* Section 2: Stream Guests */}
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme === 'light' ? '#000' : '#fff', marginBottom: 10 }}>Guests</Text>
                {streamGuest.length === 0 ? (
                    <Text style={{ color: theme === 'light' ? '#000' : '#fff', }}>No stream guests.</Text>
                ) : (
                    <FlatList
                        data={streamGuest}
                        keyExtractor={(item) => item.CustomID}
                        renderItem={({ item }) => (
                            <View style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                marginBottom: 12,
                                padding: 10,
                            }}>
                                <View style={{ position: 'relative' }}>
                                    <Image style={styles.strRoomHeaderLeftProfileImg}
                                        source={!item?.avatar || item?.avatar === 'default' ? getGenderFallbackImage(item.gender) : { uri: item?.avatar }}
                                    />
                                </View>
                                <View style={{ flex: 1, marginLeft: 10, flexDirection: 'column' }}>
                                    <Text style={{ fontSize: 16, color: theme === 'light' ? '#000' : '#fff' }}>{item.Name}</Text>
                                    <Text style={{ color: theme === 'light' ? '#000' : '#fff' }}>{`${item?.country} (${item?.city})`}</Text>
                                </View>
                                {/* <Text style={{ fontSize: 16, marginBottom: 8 }}>{item.Name}</Text> */}
                                <View style={{ flexDirection: 'row', gap: 15, alignItems: 'center' }}>
                                    {/* Mute/Unmute Button with Icon */}
                                    <TouchableOpacity
                                        onPress={() => GetAction(item.ID, item.IsMuted ? 'unmute' : 'mute')}
                                        disabled={isMuteProcessing(item.ID)}
                                        style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            backgroundColor: !item.IsMuted ? '#28a745' : '#ffc107',
                                            paddingVertical: 6,
                                            paddingHorizontal: 10,
                                            borderRadius: 6,
                                            opacity: isMuteProcessing(item.ID) ? 0.6 : 1,
                                        }}
                                    >
                                        <Ionicons
                                            name={!item.IsMuted ? 'mic-outline' : 'mic-off-outline'}
                                            size={18}
                                            color="#fff"
                                            style={{ marginRight: 6 }}
                                        />
                                    </TouchableOpacity>

                                    {/* Remove Button with Icon */}
                                    <TouchableOpacity
                                        onPress={() => Alert.alert(
                                            'Remove Guest',
                                            `Are you sure you want to remove ${item.Name} from the stream?`,
                                            [
                                                { text: 'Cancel', style: 'cancel' },
                                                {
                                                    text: 'Remove',
                                                    onPress: () => GetAction(item.ID, 'stop-stream'),
                                                },
                                            ],
                                            { cancelable: true },
                                        )}
                                        style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            backgroundColor: '#dc3545',
                                            paddingVertical: 6,
                                            paddingHorizontal: 10,
                                            borderRadius: 6,
                                        }}
                                    >
                                        <Ionicons
                                            name="close-circle-outline"
                                            size={18}
                                            color="#fff"
                                            style={{ marginRight: 6 }}
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                    />
                )}
            </View>
        </Modal>
    );
};

export default memo(RequestModal);
