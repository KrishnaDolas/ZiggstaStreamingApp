/* eslint-disable react-native/no-inline-styles */
import React, { useContext, useEffect, useState } from 'react';
import { View, TouchableOpacity, Text, FlatList, Image } from 'react-native';
import Modal from 'react-native-modal';
import { styles } from '../../assets/styles/ThemeStyles';
import { Dimensions } from 'react-native';
import { ThemeContext } from '../context/ThemeContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
const screenHeight = Dimensions.get('window').height;
import chatimage from '../../assets/images/LS-2.jpg';
import Apiclient from '../utils/Apiclient';
import { SendErrorTotheServer } from '../utils/constant';


const ViewerTotalLIst = ({ visible, onClose, totalRoomviewerList,RoomID,userDetails }) => {
    const { theme } = useContext(ThemeContext);
    const [activeTab, setActiveTab] = useState(0);
    const [giftersdata, setGiftersData] = useState([])
    const [totleGiftValue, setTotalGiftValue] = useState(0)

    useEffect(() => {
        const HandleGetGiftersData = async () => {
            try {
                // const params = {
                //     "toUserID": userDetails?.userid,
                //     "roomId": RoomID
                // }
                const params = {
                    "toUserID": userDetails?.userid,
                    "roomId": RoomID
                }
                console.log(params);
                const responce = await Apiclient.post(`topgifters/getGiftsByRoom`, params)
                if (responce.data.success) {
                    const data = responce.data.data;
                    let totalAmount = data.reduce((total, item) => total + item.giftValue, 0)
                    setTotalGiftValue(totalAmount)
                    setGiftersData(responce.data.data)
                }
            } catch (error) {
                SendErrorTotheServer(error, "HandleGetGiftersdata")
            }
        }
        HandleGetGiftersData()
    }, [])
    const tabs = ['This Stream', 'This Week', 'All Time'];

    useEffect(() => {
        console.log(totalRoomviewerList);
    }, [totalRoomviewerList])

    const renderTabContent = () => {
        switch (activeTab) {
            case 0:
                return (
                    <View>
                        <View>
                            {/* <Text style={{ fontSize: 16 }}>Gifters</Text>
                            <FlatList
                                data={totalRoomviewerList}   // your array of {ViewerName, ViewerID}
                                keyExtractor={(item) => item.ViewerID.toString()}
                                nestedScrollEnabled={true}
                                contentContainerStyle={{ paddingBottom: 8 }}
                                style={{ height: screenHeight * 0.2 + 30 }}
                                ListEmptyComponent={() => (
                                    <View
                                        style={{
                                            height: screenHeight * 0.2,
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <Text
                                            style={{
                                                color: theme === 'light' ? '#777' : '#ccc',
                                                fontSize: 16,
                                                fontWeight: '500',
                                            }}
                                        >
                                            No Viewer At this Movement
                                        </Text>
                                    </View>
                                )}
                                renderItem={({ item, index }) => (
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: '15' }} >
                                        <View>
                                            <Text style={{ fontSize: 19 }}>{index + 1}</Text>
                                        </View>
                                        <Image source={chatimage} style={{ height: '60', width: '60', borderRadius: 40 }} />
                                        <View style={{ marginLeft: '10' }}>
                                            <Text style={{ fontSize: 17, letterSpacing: 2, fontWeight: 500 }} >{item.ViewerName}</Text>
                                            <Text style={{ fontSize: 12 }}>{`${item.country}(${item.city})`}</Text>
                                            <View style={{ flexDirection: 'row', alignItems: 'center',marginTop:'3', borderRadius: 20, backgroundColor: 'aqua', paddingHorizontal: '7', paddingVertical: '2' }}>
                                                <Text>
                                                    <Ionicons name="diamond" size={14} color="white" />{'\t'}
                                                </Text>
                                                <Text style={{ fontSize: 14 }}>5600</Text>
                                            </View>
                                        </View>
                                    </View>
                                )}
                            /> */}
                        </View>
                        <View>
                            <Text style={{ fontSize: 16 }}>Viewers</Text>
                            <FlatList
                                data={totalRoomviewerList}   // your array of {ViewerName, ViewerID}
                                keyExtractor={(item) => item.ViewerID.toString()}
                                nestedScrollEnabled={true}
                                contentContainerStyle={{ paddingBottom: 8 }}
                                style={{ height: screenHeight * 0.2 + 30 }}
                                ListEmptyComponent={() => (
                                    <View
                                        style={{
                                            height: screenHeight * 0.2,
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <Text
                                            style={{
                                                color: theme === 'light' ? '#777' : '#ccc',
                                                fontSize: 16,
                                                fontWeight: '500',
                                            }}
                                        >
                                            No Viewer At this Movement
                                        </Text>
                                    </View>
                                )}
                                renderItem={({ item, index }) => (
                                    <View style={{ flexDirection: 'row', marginTop: '15' }} >
                                        <Image source={chatimage} style={{ height: '40', width: '40', borderRadius: 20 }} />
                                        <View style={{ marginLeft: '10' }}>
                                            <Text style={{ fontSize: 17 }} >{item.ViewerName}</Text>
                                            <Text style={{ fontSize: 12 }}>{`${item.country}(${item.city})`}</Text>
                                        </View>
                                    </View>
                                )}
                            />
                        </View>
                    </View>
                );
            case 1:
                const oneWeekAgo = new Date();
                oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
                // Filter last 7 days transactions
                const lastWeekTransactions = giftersdata.filter(item => new Date(item.transDate) >= oneWeekAgo);

                console.log(lastWeekTransactions);
                return (
                    <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                        <Text style={{ color: theme === 'light' ? '#666' : '#ccc', fontSize: 16 }}>
                            This Week viewers content
                        </Text>
                        {/* Add your This Week content here */}
                    </View>
                );
            case 2:
                return (
                    <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                        <Text style={{ color: theme === 'light' ? '#666' : '#ccc', fontSize: 16 }}>
                            All Time viewers content
                        </Text>
                        {/* Add your All Time content here */}
                    </View>
                );
            default:
                return null;
        }
    };

    return (
        <>
            <Modal
                isVisible={visible}
                onBackdropPress={onClose}
                animationIn="slideInUp"
                animationOut="slideOutDown"
                animationInTiming={400}
                animationOutTiming={300}
                backdropOpacity={0}
                useNativeDriver={true}
                hardwareAccelerated={true}
                style={{
                    margin: 0,
                    justifyContent: 'flex-end',
                    alignItems: 'flex-end',
                }}
            >
                <View style={{
                    width: '100%', // like drawer
                    backgroundColor: theme === 'light' ? '#fff' : '#2a2a2a',
                    padding: 16,
                    shadowColor: '#000',
                    shadowOffset: { width: -3, height: 0 },
                    shadowOpacity: 0.15,
                    shadowRadius: 6,
                    elevation: 8,
                }}>
                    <TouchableOpacity onPress={onClose} style={[styles.profileModalClose, { marginBottom: 5 }]}>
                        <Ionicons name="close" size={28} color={theme === 'light' ? '#333' : '#fff'} />
                    </TouchableOpacity>
                    <View style={{
                        flexDirection: 'row',
                        marginTop: 15,
                        marginBottom: 10,
                        borderBottomWidth: 1,
                        borderBottomColor: theme === 'light' ? '#e0e0e0' : '#404040',
                    }}>
                        {tabs.map((tab, index) => (
                            <TouchableOpacity
                                key={index}
                                style={{
                                    flex: 1,
                                    paddingVertical: 12,
                                    paddingHorizontal: 8,
                                    alignItems: 'center',
                                    borderBottomWidth: activeTab === index ? 2 : 0,
                                    borderBottomColor: theme === 'light' ? '#007AFF' : '#0A84FF',
                                }}
                                onPress={() => setActiveTab(index)}
                            >
                                <Text>
                                    <Ionicons name="diamond" size={16} color="aqua" /> {tab === 'This Stream' ? totleGiftValue : 40}
                                </Text>
                                <Text style={{
                                    fontSize: 14,
                                    fontWeight: activeTab === index ? '600' : '400',
                                    color: activeTab === index
                                        ? (theme === 'light' ? '#007AFF' : '#0A84FF')
                                        : (theme === 'light' ? '#666' : '#999'),
                                }}>
                                    {tab}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    <View style={[styles.profileSettingModalBody, { height: screenHeight * 0.6 - 40, marginTop: 10 }]}>
                        {renderTabContent()}
                    </View>
                </View>
            </Modal>
        </>
    );
};

export default ViewerTotalLIst;