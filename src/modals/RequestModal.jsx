import React from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import Modal from 'react-native-modal';
import Ionicons from 'react-native-vector-icons/Ionicons';

const RequestModal = ({
    visible,
    onClose,
    StreamRequestList = [],
    streamGuest = [],
    socket
}) => {
    const GetAction=(targetId,action)=>{
        console.log(`Action: ${action} on Target ID: ${targetId}`);
       console.log( socket.id);
       socket.emit('host-control', {action: action,targetId: targetId}
       )
    }
    const AcceptStream=(action,requesterId)=>{
        console.log(`Action: ${action}, Requester ID: ${requesterId}`);
        if(action === 'approve') {
        socket.emit('approveStream', requesterId)
        }
        if( action === 'reject') {
          socket.emit('rejectStream', requesterId)
        }
      }
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
            <View style={{ backgroundColor: '#fff', padding: 20, borderTopLeftRadius: 12, borderTopRightRadius: 12, maxHeight: '90%' }}>
                {/* Section 1: Stream Requests */}
                <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Requests</Text>
                {StreamRequestList.length === 0 ? (
                    <Text style={{ marginBottom: 20 }}>No Pending Requests at this time</Text>
                ) : (
                    <FlatList
                        data={StreamRequestList}
                        keyExtractor={(item) => item.CustomID}
                        renderItem={({ item }) => (
                            <View style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                marginBottom: 12,
                                padding: 10,
                            }}>
                                <Text style={{ fontSize: 16 }}>{item.Name}</Text>
                                <TouchableOpacity
                                onPress={() => AcceptStream("approve", item.ID)}
                                style={{
                                    backgroundColor: 'black',
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
                        )}
                    />
                )}

                {/* Divider */}
                <View style={{ height: 1, backgroundColor: '#ddd', marginVertical: 15 }} />

                {/* Section 2: Stream Guests */}
                <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Guests</Text>
                {streamGuest.length === 0 ? (
                    <Text>No stream guests.</Text>
                ) : (
                    <FlatList
                        data={streamGuest}
                        keyExtractor={(item) => item.CustomID}
                        renderItem={({ item }) => (
                            <View style={{
                                padding: 10,
                                marginBottom: 12
                            }}>
                                <Text style={{ fontSize: 16, marginBottom: 8 }}>{item.Name}</Text>
                                <View style={{ flexDirection: 'row', gap: 15, alignItems: 'center' }}>
                                    {/* Mute/Unmute Button with Icon */}
                                    <TouchableOpacity
                                        onPress={() => GetAction(item.ID, item.muted ? 'unmute' : 'mute')}
                                        style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            backgroundColor: item.muted ? '#28a745' : '#ffc107',
                                            paddingVertical: 6,
                                            paddingHorizontal: 10,
                                            borderRadius: 6,
                                        }}
                                    >
                                        <Ionicons
                                            name={item.muted ? 'mic-outline' : 'mic-off-outline'}
                                            size={18}
                                            color="#fff"
                                            style={{ marginRight: 6 }}
                                        />
                                    </TouchableOpacity>

                                    {/* Remove Button with Icon */}
                                    <TouchableOpacity
                                        onPress={() => GetAction(item.ID,'stop-stream')}
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

export default RequestModal;
