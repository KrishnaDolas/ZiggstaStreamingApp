/* eslint-disable react-native/no-inline-styles */
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { View, TouchableOpacity, Text, FlatList, Image, ActivityIndicator } from 'react-native';
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
import { getGenderFallbackImage, giftImages, SendErrorTotheServer } from '../utils/constant';
import FastImage from 'react-native-fast-image';


const ViewerTotalLIst = ({ visible, onClose, RoomID, userDetails }) => {
    const { theme } = useContext(ThemeContext);
    const [activeTab, setActiveTab] = useState(0);
    const [giftersdata, setGiftersData] = useState([])
    const [totalgifters, setTotalgifters] = useState([])
    const [viewersList, setViewersList] = useState([]);
    const LoaderRef = useRef(false)
    const [tabs] = useState(['Gifters', 'Viewers', 'Gifters List']);

    useEffect(() => {
        if (activeTab === 0) {
            HandleGetGiftersData();
        } else if (activeTab === 1) {
            GetViewers();
        } else if (activeTab === 2) {
            HandleTotalGifterData();
        }
    }, [activeTab]);

    const HandleGetGiftersData = async () => {
        try {
            LoaderRef.current = true
            const params = {
                "toUserID": userDetails?.userid,
                "roomId": RoomID
            }
            const responce = await Apiclient.post(`topgifters/getGiftsByRoom`, params)
            if (responce.data.success) {
                const data = responce.data.data;
                let totalAmount = data.reduce((total, item) => parseInt(total) + parseInt(item.totalGiftValue), 0)
                console.log('total gift value:', totalAmount);
                // setLoader((prevdata) => ({ ...prevdata, GifterListLoader: false }))
                // sort the data totalGiftValue wise
                let sortedData = responce.data.data.sort((a, b) => parseInt(b.totalGiftValue) - parseInt(a.totalGiftValue));
                setGiftersData(sortedData)
                LoaderRef.current = false
                console.log(sortedData);
            }
        } catch (error) {
            LoaderRef.current = false
            SendErrorTotheServer(error, "HandleGetGiftersdata")
        }
    }
    const HandleTotalGifterData = async () => {
        try {
            LoaderRef.current = true
            const params = {
                "roomId": RoomID
            }
            const responce = await Apiclient.post(`topgifters/getAllGifters`, params)
            if (responce.data.success) {
                const data = responce.data.data;
                let totalAmount = data.reduce((total, item) => parseInt(total) + parseInt(item.giftValue), 0)
                console.log('total gift value:', totalAmount);
                setTotalgifters(responce.data.data)
                LoaderRef.current = false
                console.log('total gifters data:', responce.data.data);
            }
        } catch (error) {
            LoaderRef.current = false
            SendErrorTotheServer(error, "HandleGetGiftersdata")
        }
    }
    const GetViewers = async () => {
        try {
            LoaderRef.current = true
            const response = await Apiclient.get(`/rooms/${RoomID}/members`)
            if (response.data) {
                setViewersList(response.data?.members || []);
                LoaderRef.current = false
                console.log('Viewers List:', response.data?.members);
            }
        } catch (error) {
            LoaderRef.current = false
            console.error('Error fetching viewers:', error);
        }
    }

    const RenderItemForGifters = (item, ind) => {
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
                    paddingHorizontal: '5',
                    backgroundColor: `${ind === 0 ? '#ffcbed' : ind === 1 ? '#fdd7bb' : ind === 2 ? '#c5e6de' : '#d9d9d9'}`,
                    paddingVertical: '5',
                    marginBottom: '5'
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
                            source={ind === 0 ? rank1Img : ind === 1 ? rank2Img : ind === 2 ? rank3Img : null}//giftersdata[0] ? rank1Img : giftersdata[1] ? rank2Img : giftersdata[2] ? rank3Img : null}
                            style={{ width: 40, height: 40, resizeMode: 'contain' }}
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
                        height: 40,
                        width: 40,
                        borderRadius: 30,
                        backgroundColor: '#ddd'
                    }}
                />

                {/* User Info */}
                <View style={{ marginLeft: 29, flex: 1 }}>
                    <Text
                        style={{ fontSize: 14, fontWeight: '600', color: '#222' }}
                    >
                        {item.screenName}
                    </Text>
                </View>
                <View>
                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            borderRadius: 20,
                            backgroundColor: '#d93a63',
                            paddingHorizontal: 10,
                            paddingVertical: 3,
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
                    paddingHorizontal: 10,
                    borderBottomWidth: 1, // optional: to give a border effect
                    borderBottomColor: "#d9d9d9",
                    paddingVertical: 10,
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

                <View style={{ marginLeft: 15, flex: 1 }}>
                    <Text
                        style={{ fontSize: 14, fontWeight: '600', color: '#222' }}
                    >
                        {item.username}
                    </Text>
                </View>
                <View style={{ marginLeft: 12 }}>
                    <Text
                        style={{
                            fontSize: 13,
                            color: '#666',
                            marginTop: 2
                        }}
                    >
                        {item?.location}
                    </Text>
                </View>
            </View>
        );
    };

    const RenderItemForGifterList = ({ item }) => {
        const GiftImage = giftImages[item?.giftIcon] || require('../../assets/images/gifts/diamond3.gif');
        return (
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 10,
                    borderBottomWidth: 1, // optional: to give a border effect
                    borderBottomColor: "#d9d9d9",
                    paddingVertical: 10,
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

                <View style={{ marginLeft: 15, flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: '#222' }}>
                        {item.screenName}
                    </Text>
                </View>
                <View style={{ marginRight: 15 }}>
                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            borderRadius: 12,
                            backgroundColor: '#d93a63',
                            paddingHorizontal: 9,
                            paddingVertical: 4,
                        }}
                    >
                        <Ionicons name="star" size={14} color="white" style={{ marginRight: 4 }} />
                        <Text style={{ fontSize: 13, fontWeight: '500', color: 'white' }}>
                            {item.giftValue}
                        </Text>
                    </View>
                </View>
                <View style={{ marginLeft: 12 }}>
                    <View style={{ flexDirection: 'row' }}
                    >
                        <FastImage
                            style={{ height: "40", width: '40' }}
                            source={GiftImage}
                            resizeMode={FastImage.resizeMode.contain}
                        />
                    </View>
                </View>
            </View>
        );
    };

    const FallbackUI = (tabtype) => {
        return (
            <View
                style={{
                    height: screenHeight * 0.4 + 30,
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
                    {LoaderRef.current ? <ActivityIndicator size="large" color={theme === 'light' ? '#a000df' : '#fff'} /> : `No ${tabtype} found`}
                </Text>
            </View>
        )
    }

    const renderTabContent = useCallback(() => {
        switch (activeTab) {
            case 0:
                return (
                    <FlatList
                        data={giftersdata}
                        keyExtractor={(item) => item?.fromUserID.toString()}
                        nestedScrollEnabled
                        contentContainerStyle={{ paddingBottom: 8 }}
                        style={{ height: screenHeight * 0.2 + 30 }}
                        ListEmptyComponent={() => FallbackUI('Gifters')}
                        renderItem={({ item, index }) => RenderItemForGifters(item, index)}
                    />
                );
            case 1:
                return (
                    <FlatList
                        data={viewersList}
                        keyExtractor={(item) => item.user_id.toString()}
                        nestedScrollEnabled
                        contentContainerStyle={{ paddingBottom: 8 }}
                        style={{ height: screenHeight * 0.2 + 30 }}
                        ListEmptyComponent={() => FallbackUI('Viewers')}
                        renderItem={RenderItemForViewer}
                    />
                );
            case 2:
                return (
                    <FlatList
                        data={totalgifters}
                        keyExtractor={(_, index) => index.toString()}
                        nestedScrollEnabled
                        contentContainerStyle={{ paddingBottom: 8 }}
                        style={{ height: screenHeight * 0.55 }}
                        ListEmptyComponent={() => FallbackUI('Gifters List')}
                        renderItem={RenderItemForGifterList}
                    />
                );
            default:
                return null;
        }
    }, [activeTab, giftersdata, viewersList, totalgifters]);


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
                                <Text style={{
                                    fontSize: 16,
                                    fontWeight: activeTab === index ? '700' : '400',
                                    color: activeTab === index
                                        ? (theme === 'light' ? '#007AFF' : '#0A84FF')
                                        : (theme === 'light' ? '#666' : '#999'),
                                }}>
                                    {tab}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    <View style={[{ height: screenHeight * 0.6 - 40 }]}>
                        {renderTabContent()}
                    </View>
                </View>
            </Modal>
        </>
    );
};

export default ViewerTotalLIst;