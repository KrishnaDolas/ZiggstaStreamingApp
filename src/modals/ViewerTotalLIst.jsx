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


const ViewerTotalLIst = ({ visible, onClose, totalRoomviewerList, RoomID, userDetails }) => {
    const { theme } = useContext(ThemeContext);
    const [activeTab, setActiveTab] = useState(0);
    const [giftersdata, setGiftersData] = useState([])
    const [totalheaderCount, setTotalHeaderCount] = useState({ Gifter: 0, Viewer: 0, TotalGifter: 0 })
    const [totalgifters, setTotalgifters] = useState([])



    const HandleGetGiftersData = async () => {
        try {
            const params = {
                "toUserID": userDetails?.userid,
                "roomId": RoomID
            }
            const responce = await Apiclient.post(`topgifters/getGiftsByRoom`, params)
            if (responce.data.success) {
                const data = responce.data.data;
                let totalAmount = data.reduce((total, item) => parseInt(total) + parseInt(item.totalGiftValue), 0)
                setTotalHeaderCount((prevdata) => ({ ...prevdata, Gifter: totalAmount }))
                console.log('total gift value:', totalAmount);
                setGiftersData(responce.data.data)
            }
        } catch (error) {
            SendErrorTotheServer(error, "HandleGetGiftersdata")
        }
    }
    const HandleTotalGifterData = async () => {
        try {
            const params = {
                "roomId": 955
            }
            const responce = await Apiclient.post(`topgifters/getAllGifters`, params)
            if (responce.data.success) {
                const data = responce.data.data;
                let totalAmount = data.reduce((total, item) => parseInt(total) + parseInt(item.giftValue), 0)
                setTotalHeaderCount((prevdata) => ({ ...prevdata, TotalGifter: totalAmount }))
                console.log('total gift value:', totalAmount);
                setTotalgifters(responce.data.data)
            }
        } catch (error) {
            SendErrorTotheServer(error, "HandleGetGiftersdata")
        }
    }
    useEffect(() => {
        HandleGetGiftersData()
        setTotalHeaderCount((prevdata) => ({ ...prevdata, Viewer: totalRoomviewerList.length }))
        HandleTotalGifterData()
    }, [totalRoomviewerList])
    const tabs = ['Gifters', 'Viewsers', 'Gifters List'];

    const RenderItemForGifters = ({ item }) => {
        return (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: '15' }} >
                <View>
                    <Text style={{ fontSize: 19 }}>1</Text>
                </View>
                <Image source={chatimage} style={{ height: '60', width: '60', borderRadius: 40 }} />
                <View style={{ marginLeft: '10' }}>
                    <Text style={{ fontSize: 17, letterSpacing: 2, fontWeight: 500 }} >{item.screenName}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: '3', borderRadius: 20, backgroundColor: 'aqua', paddingHorizontal: '7', paddingVertical: '2' }}>
                        <Text>
                            <Ionicons name="diamond" size={14} color="white" />{'\t'}
                        </Text>
                        <Text style={{ fontSize: 14 }}>{item.totalGiftValue}</Text>
                    </View>
                </View>
            </View>
        )
    }

    const RenderItemForViewer = ({ item }) => {
        return (
            <View style={{ flexDirection: 'row', marginTop: '15' }} >
                <Image source={chatimage} style={{ height: '40', width: '40', borderRadius: 20 }} />
                <View style={{ marginLeft: '10' }}>
                    <Text style={{ fontSize: 17 }} >{item.ViewerName}</Text>
                    <Text style={{ fontSize: 12 }}>{`${item.country}(${item.city})`}</Text>
                </View>
            </View>
        )
    }
    const RenderItemForGifterList = ({ item }) => {
        return (
            <View style={{ flexDirection: 'row', marginTop: '15' }} >
                <Image source={chatimage} style={{ height: '40', width: '40', borderRadius: 20 }} />
                <View style={{ marginLeft: '10' }}>
                    <Text style={{ fontSize: 14 }} >{item.screenName}</Text>
                </View>
            </View>
        )
    }
    const FallbackUI=(tabtype)=>{
        return (
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
                    No {tabtype} At this Movement
                </Text>
            </View>
        )
    }

    const renderTabContent = () => {
        switch (activeTab) {
            case 0:
                return (
                    <View>
                        <View>
                            <FlatList
                                data={giftersdata}   // your array of {ViewerName, ViewerID}
                                keyExtractor={(item) => item?.fromUserID.toString()}
                                nestedScrollEnabled={true}
                                contentContainerStyle={{ paddingBottom: 8 }}
                                style={{ height: screenHeight * 0.2 + 30 }}
                                ListEmptyComponent={()=>FallbackUI('Gifters')}
                                renderItem={RenderItemForGifters}
                            />
                        </View>
                    </View>
                );
            case 1:
                return (
                    <View>
                        <FlatList
                            data={totalRoomviewerList}   // your array of {ViewerName, ViewerID}
                            keyExtractor={(item) => item.ViewerID.toString()}
                            nestedScrollEnabled={true}
                            contentContainerStyle={{ paddingBottom: 8 }}
                            style={{ height: screenHeight * 0.2 + 30 }}
                            ListEmptyComponent={()=>FallbackUI('Viewers')}
                            renderItem={RenderItemForViewer}
                        />
                    </View>
                );
            case 2:
                return (
                    <View>
                        <FlatList
                            data={totalgifters}   // your array of {ViewerName, ViewerID}
                            keyExtractor={(_, index) => index.toString()}
                            nestedScrollEnabled={true}
                            contentContainerStyle={{ paddingBottom: 8 }}
                            style={{ height: screenHeight * 0.55 }}
                            ListEmptyComponent={()=>FallbackUI('Gifters List')}
                            renderItem={RenderItemForGifterList}
                        />
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
                                {/* <View style={{flexDirection:'row', alignItems:'center'}}>
                                    {tab === 'Gifters' ?<Text> <Ionicons name="diamond" size={16} color="aqua" />{totalheaderCount.Gifter} </Text>:
                                     tab === 'Viewsers' ?<Text> <Ionicons name="eye" size={16} color="black" />{totalheaderCount.Viewer} </Text>:
                                     tab === 'Gifters List' ?<Text> <Ionicons name="diamond" size={16} color="aqua" />{totalheaderCount.TotalGifter} </Text>: 0
                                     }
                                </View> */}
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