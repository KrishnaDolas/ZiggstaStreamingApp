/* eslint-disable react-native/no-inline-styles */
import React, { useContext, useEffect, useState } from 'react';
import { View, TouchableOpacity, Text, FlatList, Image } from 'react-native';
import Modal from 'react-native-modal';
import { styles } from '../../assets/styles/ThemeStyles';
import { Dimensions } from 'react-native';
import { ThemeContext } from '../context/ThemeContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
const screenHeight = Dimensions.get('window').height;
import Apiclient from '../utils/Apiclient';
import rank1Img from '../../assets/images/TopGifterBedge/trophy_1.png';
import rank2Img from '../../assets/images/TopGifterBedge/trophy_2.png';
import rank3Img from '../../assets/images/TopGifterBedge/trophy_3.png';
import { getGenderFallbackImage, SendErrorTotheServer } from '../utils/constant';


const ViewerTotalLIst = ({ visible, onClose, RoomID, userDetails }) => {
    const { theme } = useContext(ThemeContext);
    const [activeTab, setActiveTab] = useState(0);
    const [giftersdata, setGiftersData] = useState([])
    const [totalheaderCount, setTotalHeaderCount] = useState({ Gifter: 0, Viewer: 0, TotalGifter: 0 })
    const [totalgifters, setTotalgifters] = useState([])
    const [viewersList, setViewersList] = useState([]);


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
                // sort the data totalGiftValue wise
                let sortedData = responce.data.data.sort((a, b) => parseInt(b.totalGiftValue) - parseInt(a.totalGiftValue));
                setGiftersData(sortedData)
                console.log(sortedData);
            }
        } catch (error) {
            SendErrorTotheServer(error, "HandleGetGiftersdata")
        }
    }
    const HandleTotalGifterData = async () => {
        try {
            const params = {
                "roomId": RoomID
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
    const GetViewers=async()=>{
        try {
            const response = await Apiclient.get(`/rooms/${RoomID}/members`)
            if (response.data) {
                setViewersList(response.data.members || []);
                console.log('Viewers List:', response.data.members);
            }
        } catch (error) {
            console.error('Error fetching viewers:', error);
        }
    }
    useEffect(() => {
        HandleGetGiftersData()
        setTotalHeaderCount((prevdata) => ({ ...prevdata, Viewer: viewersList.length }))
        HandleTotalGifterData()
        GetViewers()
    }, [])
    const tabs = ['Gifters', 'Viewsers', 'Gifters List'];


    const RenderItemForGifters = ({ item }) => {
        // Handle rank images
        const getRankImage = () => {
            if (giftersdata[0]) return rank1Img;
            if (giftersdata[1]) return rank2Img;
            if (giftersdata[2]) return rank3Img;
            return null; // show number if not top 3
        };

        const rankImage = getRankImage();

        return (
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal:'5',
                    backgroundColor: `${giftersdata[0]? '#f8bddd':giftersdata[1]?'#f0caae':giftersdata[2]?'#b6d6cf':'#cacaca'}`,
                    paddingVertical:'5'
                }}
            >
                {/* Rank Icon or Number */}
                <View
                    style={{
                        width: 30,
                        height: 30,
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginRight: 10
                    }}
                >
                    {rankImage ? (
                        <Image
                            source={rankImage}
                            style={{ width: 40, height: 54, resizeMode: 'contain' }}
                        />
                    ) : (
                        <Text style={{ fontSize: 16, fontWeight: '700', color: '#555' }}>
                            {ind + 1}
                        </Text>
                    )}
                </View>

                {/* Avatar */}
                <Image
                    source={!item?.avatar || item?.avatar === 'default' ? getGenderFallbackImage(item?.gender) : { uri: item?.avatar }}
                    style={{
                        height: 50,
                        width: 50,
                        borderRadius: 30,
                        backgroundColor: '#ddd'
                    }}
                />

                {/* User Info */}
                <View style={{ marginLeft: 10, flex: 1 }}>
                    <Text
                        style={{
                            fontSize: 14,
                            fontWeight: '400',
                            color: '#222'
                        }}
                    >
                        {item.screenName}
                    </Text>
                </View>
                <View>
                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginTop: 0,
                            borderRadius: 20,
                            backgroundColor: '#00C4CC',
                            paddingHorizontal: 10,
                            paddingVertical: 3,
                            alignSelf: 'flex-start'
                        }}
                    >
                        <Ionicons name="star" size={14} color="white" style={{ marginRight: 4 }} />
                        <Text style={{ fontSize: 12, fontWeight: '500', color: 'white' }}>
                            {item.totalGiftValue}
                        </Text>
                    </View>
                </View>
            </View>
        );
    };


    const RenderItemForViewer = ({ item }) => {
        return (
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginVertical: 10,
                    paddingHorizontal: 10
                }}
            >
                <Image
                    source={!item?.avatar || item?.avatar === 'default' ? getGenderFallbackImage(item?.gender) : { uri: item?.avatar }}
                    style={{
                        height: 40,
                        width: 40,
                        borderRadius: 20,  // half of height & width for perfect circle
                        backgroundColor: '#ddd' // fallback color
                    }}
                />

                <View style={{ marginLeft: 12, flex: 1 }}>
                    <Text
                        style={{
                            fontSize: 16,
                            fontWeight: '600',
                            color: '#222'
                        }}
                    >
                        {item.username}
                    </Text>
                    <Text
                        style={{
                            fontSize: 13,
                            color: '#666',
                            marginTop: 2
                        }}
                    >
                        pune,India
                        {/* {`${item.country} (${item.city})`} */}
                    </Text>
                </View>
            </View>
        );
    };

    const RenderItemForGifterList = ({ item }) => {
        return (
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-around',
                    marginVertical: 12,
                    paddingHorizontal: 10
                }}
            >
                <Image
                    source={
                        !item?.avatar || item?.avatar === 'default'
                            ? getGenderFallbackImage(item?.gender)
                            : { uri: item?.avatar }
                    }
                    style={{
                        height: 40,
                        width: 40,
                        borderRadius: 20, // half of width/height for circular
                        backgroundColor: '#ddd' // fallback bg color
                    }}
                />

                <View style={{ marginLeft: 25, flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: '#222' }}>
                        {item.screenName}
                    </Text>
                </View>
                <View style={{ marginLeft: 12}}>
                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginTop: 5,
                            borderRadius: 12,
                            backgroundColor: '#00C4CC',
                            paddingHorizontal: 15,
                            paddingVertical: 4,
                        }}
                    >
                        <Ionicons name="star" size={14} color="white" style={{ marginRight: 4 }} />
                        <Text style={{ fontSize: 13, fontWeight: '500', color: 'white' }}>
                            {item.giftValue}
                        </Text>
                    </View>
                </View>
            </View>
        );
    };

    const FallbackUI = (tabtype) => {
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
                    <View >
                        <FlatList
                            data={giftersdata}   // your array of {ViewerName, ViewerID}
                            keyExtractor={(item, ind) => item?.fromUserID.toString()}
                            nestedScrollEnabled={true}
                            contentContainerStyle={{ paddingBottom: 8 }}
                            style={{ height: screenHeight * 0.2 + 30 }}
                            ListEmptyComponent={() => FallbackUI('Gifters')}
                            renderItem={RenderItemForGifters}
                        />
                    </View>
                );
            case 1:
                return (
                    <View>
                        <FlatList
                            data={viewersList}   // your array of {ViewerName, ViewerID}
                            keyExtractor={(item) => item.user_id.toString()}
                            nestedScrollEnabled={true}
                            contentContainerStyle={{ paddingBottom: 8 }}
                            style={{ height: screenHeight * 0.2 + 30 }}
                            ListEmptyComponent={() => FallbackUI('Viewers')}
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
                            ListEmptyComponent={() => FallbackUI('Gifters List')}
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
                    padding: 5,
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
                                    {tab === 'Gifters' ?<Text> <Ionicons name="star" size={16} color="aqua" />{totalheaderCount.Gifter} </Text>:
                                     tab === 'Viewsers' ?<Text> <Ionicons name="eye" size={16} color="black" />{totalheaderCount.Viewer} </Text>:
                                     tab === 'Gifters List' ?<Text> <Ionicons name="star" size={16} color="aqua" />{totalheaderCount.TotalGifter} </Text>: 0
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
                    <View style={[{ height: screenHeight * 0.6 - 40, marginTop: 10 }]}>
                        {renderTabContent()}
                    </View>
                </View>
            </Modal>
        </>
    );
};

export default ViewerTotalLIst;