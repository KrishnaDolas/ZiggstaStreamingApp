/* eslint-disable react-native/no-inline-styles */
import React, { memo, useContext, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, Image, Alert, Dimensions } from 'react-native';
import Modal from 'react-native-modal';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { styles } from '../../assets/styles/ThemeStyles';
import { useAppContext } from '../context/AppContext';
import { getGenderFallbackImage, socket } from '../utils/constant';
import { ThemeContext } from '../context/ThemeContext';
import Colors from '../../assets/styles/Colors';

const screenHeight = Dimensions.get('window').height;


const RequestModal = ({
    visible,
    onClose,
    StreamRequestList = [],
    streamGuest = [],
}) => {
    const { theme } = useContext(ThemeContext);
    const { userAddress } = useAppContext();

    // ✅ Track which requests are already being processed
    const [processingIds, setProcessingIds] = useState([]);

    // const GetAction = (targetId, action) => {
    //     console.log('targetId', targetId);
    //     console.log('action', action);

    //     // socket.emit('host-control', { action: action, targetId: targetId });
    //     socket.emit('host-control', { action: action, targetId: targetId }, () => {
    //         // ✅ Clear lock if user removed
    //         setProcessingIds((prev) => prev.filter((id) => id !== targetId));
    //     });
    // };


    const GetAction = (targetId, action) => {
        console.log('targetId', targetId);
        console.log('action', action);

        socket.emit('host-control', { action: action, targetId: targetId }, () => {
            console.log(`Server ack for ${action} on ${targetId}`);

            // ✅ Always clear if stop-stream
            if (action === 'stop-stream') {
                setProcessingIds((prev) => {
                    const updated = prev.filter((id) => id !== targetId);
                    console.log('Clearing stop-stream lock. Before:', prev, 'After:', updated);
                    return updated;
                });
            } else {
                // For other actions, only clear if it was being processed
                setProcessingIds((prev) => prev.filter((id) => id !== targetId));
            }
        });
    };

    useEffect(() => {
        // ✅ Keep only IDs that still exist in the request list
        setProcessingIds((prev) =>
            prev.filter((id) =>
                StreamRequestList.some((item) => item.ID === id)
            )
        );
    }, [StreamRequestList]);


    const AcceptStream = (action, requesterId, name, CustomID, item) => {
        // prevent multiple clicks
        if (processingIds.includes(requesterId)) return;

        setProcessingIds((prev) => [...prev, requesterId]);

        console.log(`Action: ${action}, Requester ID: ${requesterId}`);
        if (action === 'approve') {
            const Address = userAddress ?
                {
                    country: userAddress?.country,
                    city: userAddress?.city,
                }
                :
                {
                    country: 'India',
                    city: 'Pune',
                };
            console.log(Address);
            // socket.emit('approveStream', requesterId, Address, name, CustomID, item?.avatar);
            socket.emit('approveStream', requesterId, Address, name, CustomID, item?.avatar, () => {
                // ✅ clear lock after server acknowledges
                setProcessingIds((prev) => prev.filter((id) => id !== requesterId));
            });
        }
        if (action === 'reject') {
            // socket.emit('rejectStream', requesterId);
            socket.emit('rejectStream', requesterId, () => {
                setProcessingIds((prev) => prev.filter((id) => id !== requesterId));
            });
        }
    };

    const RemoveAllRequest = () => {
        StreamRequestList.forEach((item) => {
            socket.emit('rejectStream', item.ID);
        });
        onClose();
    };



    useEffect(() => {
        console.log('processingIds', processingIds);
        console.log('StreamRequestList', StreamRequestList);
    }, [processingIds, StreamRequestList]);

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
            style={{
                justifyContent: 'flex-end',
                margin: 0,
            }}
        >
            <View style={{
                backgroundColor: theme === 'light' ? '#fff'
                    :
                    Colors.blackModalBgColor,
                padding: 20,
                borderTopLeftRadius: 12,
                borderTopRightRadius: 12,
                flex: 1,
                maxHeight: 220,
            }}>
                {/* Section 1: Stream Requests */}
                <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                }}>
                    <Text
                        style={{
                            fontSize: 18,
                            color: theme === 'light' ? '#000' : '#fff',
                            fontWeight: 'bold',
                            marginBottom: 10,
                        }}
                    >
                        Requests
                    </Text>
                    {StreamRequestList?.length > 0 && (
                        <View
                            style={{
                                borderRadius: 3,
                                backgroundColor: theme === 'light' ? '#f2f2f2'
                                    : Colors.blackBtnBg,
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
                    <Text
                        style={{
                            color: theme === 'light' ? '#000' : '#fff',
                            marginBottom: 20,
                        }}>
                        No Pending Requests at this time
                    </Text>
                ) : (
                    <FlatList
                        data={StreamRequestList}
                        keyExtractor={(item) => item.CustomID}
                        renderItem={({ item }) => {
                            const isDisabled =
                                streamGuest.length >= 6 || processingIds.includes(item.ID);
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
                                                getGenderFallbackImage(item.Gender)
                                                : { uri: item?.avatar }}
                                        />
                                    </View>
                                    <View
                                        style={{
                                            flex: 1,
                                            marginLeft: 10,
                                            flexDirection: 'column',
                                        }}>
                                        <Text style={{ fontSize: 16, color: theme === 'light' ? '#000' : '#fff' }}>{item.Name}</Text>
                                        <Text style={{ color: theme === 'light' ? '#000' : '#fff' }}>{`${item?.country} (${item?.city})`}</Text>
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
                                        source={!item?.avatar || item?.avatar === 'default' ? getGenderFallbackImage(item.Gender) : { uri: item?.avatar }}
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
                                        style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            backgroundColor: !item.IsMuted ? '#28a745' : '#ffc107',
                                            paddingVertical: 6,
                                            paddingHorizontal: 10,
                                            borderRadius: 6,
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
