import React, { memo, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, Image, Alert } from 'react-native';
import Modal from 'react-native-modal';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { styles } from '../../assets/styles/ThemeStyles';
import { useAppContext } from '../context/AppContext';
import { getGenderFallbackImage, socket } from '../utils/constant';
const RequestModal = ({
    visible,
    onClose,
    StreamRequestList = [],
    streamGuest = [],
}) => {
    const {userData,userAddress}= useAppContext();
    const GetAction=(targetId,action)=>{
       socket.emit('host-control', {action: action,targetId: targetId}
       )
    }
    const AcceptStream=(action,requesterId,name,CustomID,item)=>{
        console.log(`Action: ${action}, Requester ID: ${requesterId}`);
        if(action === 'approve') {
            const Address=userAddress ?{country:userAddress?.country,city:userAddress?.city} : {country:'India',city:'Pune'}
            console.log(Address);
        socket.emit('approveStream', requesterId,Address,name,CustomID,item?.avatar)
        }
        if( action === 'reject') {
          socket.emit('rejectStream', requesterId)
        }
      }
      const RemoveAllRequest=()=>{
        StreamRequestList.forEach((item) => {
            socket.emit('rejectStream', item.ID);
        });
        onClose();
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
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Requests</Text>
                    {StreamRequestList?.length > 0 && (
                        <View style={{ borderRadius: "10%", backgroundColor: '#f2f2f2', paddingHorizontal: 10, paddingVertical: 0, flexDirection: 'row', alignItems: 'center', height: '25',marginBottom:20 }}>
                            <TouchableOpacity onPress={RemoveAllRequest}>
                                <Text style={{ fontSize: 12, color: 'red' }}>Remove ALL</Text>
                            </TouchableOpacity>
                        </View>)}
                </View>
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
                                <View style={{position:'relative'}}>
                                <Image style={styles.strRoomHeaderLeftProfileImg}
                                 source={!item?.avatar || item?.avatar === 'default' ? getGenderFallbackImage("") : { uri: item?.avatar }}
                                  />
                                </View>
                                <View style={{ flex: 1, marginLeft: 10, flexDirection: 'column' }}>
                                <Text style={{ fontSize: 16 }}>{item.Name}</Text>
                                <Text>{`${item?.country} (${item?.city})`}</Text>
                                </View>
                                <TouchableOpacity
                                disabled={streamGuest.length>=6?true:false}
                                onPress={() => AcceptStream("approve", item.ID,item.Name,item?.CustomID,item)}
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
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                marginBottom: 12,
                                padding: 10,
                            }}>
                                <View style={{position:'relative'}}>
                                <Image style={styles.strRoomHeaderLeftProfileImg}
                                 source={!item?.avatar || item?.avatar === 'default' ? getGenderFallbackImage("") : { uri: item?.avatar }}
                                  />
                                </View>
                                <View style={{ flex: 1, marginLeft: 10, flexDirection: 'column' }}>
                                <Text style={{ fontSize: 16 }}>{item.Name}</Text>
                                <Text>{`${item?.country} (${item?.city})`}</Text>
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
                                        onPress={() =>Alert.alert(
                                            'Remove Guest',
                                            `Are you sure you want to remove ${item.Name} from the stream?`,
                                            [
                                                { text: 'Cancel', style: 'cancel' },
                                                {
                                                    text: 'Remove',
                                                    onPress: () => GetAction(item.ID,'stop-stream')
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
