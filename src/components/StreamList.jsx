import { useEffect, useRef, useState } from 'react';
import { Text, TouchableOpacity, TextInput, Image, FlatList, View, Alert, Dimensions, ScrollView, ActivityIndicator } from 'react-native';
import { styles, themeStyles } from '../../assets/styles/ThemeStyles';
import Modal from 'react-native-modal';
import { format } from 'date-fns';
import { StreamListHeader } from './StreamListHeader';
import Ionicons from 'react-native-vector-icons/Ionicons';
// import Footer from './Footer';
import LinearGradient from 'react-native-linear-gradient';
import Apiclient from '../utils/Apiclient';
import StreamListSkeleton from './StreamListSkeleton';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import { useAppContext } from '../context/AppContext';
import GoogleBannerAd from './GoogleBannerAd';
import { getGenderFallbackImage, requestPermissions, showPermissionAlert, socket } from '../utils/constant';
import { LeaderBoards } from './LeaderBoards';
import AsyncStorage from '@react-native-async-storage/async-storage';

const StreamList = ({ theme, joinRoom, createRoom, refreshlobby, leaveroomrefresh, setCurrentStreamData }) => {
    const route = useRoute();
    const insets = useSafeAreaInsets();
    const { userData,
        userAddress,
        headerMainTab } = useAppContext();

    const screenHeight = Dimensions.get('window').height;
    const [openStreamInputModal, setOpenStreamInputModal] = useState(false);
    const [roomIdInput, setRoomIdInput] = useState('');
    const [apiRooms, setApiRooms] = useState([]);
    const [selectedCategoryIndices, setSelectedCategoryIndices] = useState([]); // store selected indices
    const [filteredRooms, setFilteredRooms] = useState([]); // store filtered rooms
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [isFiltering, setIsFiltering] = useState(false);
    const [categoryData, setCategoryData] = useState([]);
    const [isInterestLoading, setIsInterestLoading] = useState(false);
    const [isNearBy, setIsNearBy] = useState(false);
    const [nearByRoomData, setNearByRoomData] = useState([]);
    const [isFavourite, setIsFavourite] = useState(false);
    const [searchFilteredData, setSearchFilteredData] = useState([]);
    const [isDisable, setIsDisable] = useState(false); // for disabling the button when creating room
    const [refreshing, setRefreshing] = useState(false);

    const disableBtnRef = useRef(null);

    useEffect(() => {
        if (searchFilteredData?.length > 0) {
            // Update apiRooms with search results
            setApiRooms(searchFilteredData);
        } else {
            // Clear apiRooms when searchFilteredData is empty
            setApiRooms([]);
        }
    }, [searchFilteredData]);

    useEffect(() => {
        if (
            isFavourite &&
            userData?.Interests &&
            categoryData?.length > 0
        ) {
            const interestArray = userData?.Interests
                .split(',')
                .map(id => parseInt(id))
                .filter(id =>
                    categoryData.some(cat => cat.categoryID === id) // only valid IDs
                );
            setFilteredRooms(interestArray);
            setSelectedCategoryIndices(interestArray);
        } else if (!isFavourite) {
            setSelectedCategoryIndices([]);
            setFilteredRooms([]);
        }
    }, [isFavourite, userData, categoryData]);

    // Function to toggle category selection
    const toggleCategory = (categoryID) => {
        // select only 5 categories at a time
        if (selectedCategoryIndices.length >= 3 && !selectedCategoryIndices.includes(categoryID)) {
            Alert.alert('Limit Reached', 'You can select up to 3 categories only.');
            return;
        }
        setSelectedCategoryIndices(prev => {
            if (prev.includes(categoryID)) {
                return prev.filter(id => id !== categoryID); // unselect
            } else {
                return [...prev, categoryID]; // select
            }
        });
    };


    // Function to fetch rooms from the API
    const getRooms = async () => {
        try {
            setIsInitialLoading(true);
            const response = await Apiclient.get('/rooms/getrooms?isLive=1');
            // console.log('response get rooms ', response.data);

            if (response) {
                setApiRooms(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching rooms:', error);
        } finally {
            setIsInitialLoading(false);
        }
    };

    const getRoomsByLocation = async () => {
        try {
            setIsInitialLoading(true);

            // Try to read stored location
            const savedLocationStr = await AsyncStorage.getItem('userLocation');
            let lat, lon, formatted;

            if (savedLocationStr) {
                const savedLocation = JSON.parse(savedLocationStr);
                lat = savedLocation.lat;
                lon = savedLocation.lon;
                formatted = savedLocation.formatted;
                console.log('✅ Saved user location:', lat, lon, formatted);
            } else if (userAddress?.latitude && userAddress?.longitude) {
                // Fallback if no saved location
                lat = userAddress.latitude;
                lon = userAddress.longitude;
                console.log('📍 Using current location:', lat, lon);
            } else {
                console.warn('⚠️ No location available');
                setIsInitialLoading(false);
                return;
            }

            // Build query
            const queryParams = `geoLocation=${lat},${lon}`;
            console.log('queryParams =>', queryParams);

            // API call
            const response = await Apiclient.get(`/rooms/getroomsbylocation?${queryParams}`);

            if (response?.data?.data) {
                const livestreamlist = response.data.data.filter(item => item.isLive === 1);
                setApiRooms(livestreamlist || []);
                setNearByRoomData(livestreamlist || []);
                console.log('🎥 Rooms fetched:', livestreamlist.length);
            } else {
                console.warn('⚠️ No rooms found for this location.');
                setApiRooms([]);
                setNearByRoomData([]);
            }
        } catch (error) {
            console.error('❌ Error fetching rooms:', error);
        } finally {
            setIsInitialLoading(false);
        }
    };

    // filter rooms based on selected categories

    const filterroomdata = async (selecteddata) => {
        try {
            setIsFiltering(true);
            const response = await Apiclient.get(`/rooms/getrooms?isLive=1&Categories=${selecteddata}`);
            if (response) {
                const livestreamlist = response.data.data.filter(item => item.isLive === 1);
                const filtered = livestreamlist || [];

                let combinedRooms = filtered;

                if (isNearBy && nearByRoomData.length > 0) {
                    // Merge filtered + nearby and remove duplicates
                    combinedRooms = Array.from(new Map(
                        [...nearByRoomData, ...filtered].map(item => [item.roomID, item])
                    ).values());
                }

                setApiRooms(combinedRooms);
            }
        } catch (error) {
        } finally {
            setIsFiltering(false);
        }
    };

    useEffect(() => {
        if (filteredRooms.length > 0) {
            const sorteddata = filteredRooms.sort((a, b) => a - b).join(',');
            filterroomdata(sorteddata);
        } else {
            if (isNearBy && userAddress) {
                getRoomsByLocation();
            } else {
                if (searchFilteredData.length === 0) {
                    // Optionally refetch rooms or keep apiRooms unchanged
                    getRooms(); // or getRoomsByLocation() if isNearBy is true
                }
            }
        }
    }, [filteredRooms, isNearBy, refreshlobby, leaveroomrefresh]);

    // Function to create a room
    const submitroomnameandcreateroom = async () => {
        if (disableBtnRef.current === true) {
            return;
        }
        const IsAccepted = await requestPermissions();
        if (selectedCategoryIndices.length === 0) {
            Alert.alert('Message', 'Please select at least one category before creating a stream.');
            return;
        } else if (!IsAccepted && socket?.connected) {
            showPermissionAlert()
            return;
        }

        setIsDisable(true); // disable immediately
        disableBtnRef.current = true;

        callapiforcreateroom();
    };


    const callapiforcreateroom = async () => {
        try {
            // Sort categories before sending
            const sortcategories = selectedCategoryIndices.sort((a, b) => a - b);

            // Try to get userLocation from AsyncStorage
            const savedLocationStr = await AsyncStorage.getItem('userLocation');
            let lat, lon, formattedLocation;

            if (savedLocationStr) {
                const savedLocation = JSON.parse(savedLocationStr);
                lat = savedLocation.lat;
                lon = savedLocation.lon;
                formattedLocation = savedLocation.formatted;
                console.log('📍 Using saved location:', formattedLocation);
            } else if (userAddress?.latitude && userAddress?.longitude) {
                lat = userAddress.latitude;
                lon = userAddress.longitude;
                formattedLocation = userAddress.city;
                console.log('📍 Using current GPS location');
            } else {
                console.warn('⚠️ No location found, defaulting to 0,0');
                lat = 0;
                lon = 0;
                formattedLocation = 'Unknown';
            }

            const roomData = {
                RoomName: roomIdInput || ' ',
                hostID: userData.userid,
                startDate: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss"),
                endDate: format(new Date(Date.now() + 60 * 60 * 1000), "yyyy-MM-dd'T'HH:mm:ss"), // 1 hour later
                participants: '',
                thumbNail: 'dummyimg.jpg',
                physicalLocation: formattedLocation,
                Categories: sortcategories.join(','),
                geoLocation: `${lat},${lon}`,
            };

            console.log('🛰️ Room data payload:', roomData);


            // API call
            const response = await Apiclient.post('/rooms', roomData);

            if (response.data.roomID) {
                // setIsDisable(false); // Enable button after room creation
                const roominfo = { ...roomData, roomID: response.data.roomID };
                createRoom(roominfo);
                setOpenStreamInputModal(false);
                setRoomIdInput('');
            } else {
                console.warn('⚠️ Room creation failed:', response?.data);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setIsDisable(false);
            disableBtnRef.current = false;
        }
    };


    const viewerjoinedroom = (item) => {
        setCurrentStreamData(item);
        const roomId = item.roomID.toString();
        if (item.hostID === userData.userid) {
            Alert.alert('Stream Ended', 'This stream has ended. You cannot join your own stream.', [{ text: 'OK' }])
        } else {
            joinRoom(roomId, item);
        }
    };




    // Function to fetch user interest from the API
    const getInterestData = async () => {
        try {
            setIsInterestLoading(true);

            const payload = {
                isEnabled: 1,
            };

            const response = await Apiclient.post('/getcategories', payload);
            if (response?.data?.categories) {
                setCategoryData(response.data.categories);
            }
        } catch (error) {
            console.error('Error fetching get categories:', error);
        } finally {
            setIsInterestLoading(false);
        }
    };

    useEffect(() => {
        if (route?.name === 'Main') {
            getInterestData();
        }
    }, [route?.name]);


    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            if (filteredRooms.length > 0) {
                const sorteddata = filteredRooms.sort((a, b) => a - b).join(',');
                await filterroomdata(sorteddata);
            } else if (isNearBy && userAddress) {
                await getRoomsByLocation();
            } else {
                await getRooms();
            }
        } catch (error) {
            console.error('Error on pull-to-refresh:', error);
        } finally {
            setRefreshing(false);
        }
    };


    const renderItem = ({ item, index }) => {

        const isLeftItem = index % 2 === 0;

        return (
            <TouchableOpacity
                style={[
                    styles.streamListCard,
                    {
                        marginRight: isLeftItem ? 10 : 0  // space between columns
                    }
                ]}
                onPress={() => viewerjoinedroom(item)
                }
            >
                <Image
                    // source={image}
                    source={!item?.avatar || item?.avatar === 'default'
                        ? getGenderFallbackImage(item?.gender)
                        : { uri: item?.avatar }
                    }
                    style={[styles.streamListImage, { height: screenHeight * 0.3 - 40 }]}
                />
                {/* Bottom gradient overlay */}
                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.7)']}
                    style={styles.gradientOverlay}
                />
                <View style={[styles.streamListEyeCountContainer, themeStyles[theme].streamListEyeCountContainer]}>
                    <Text style={[styles.streamListEyeCount, themeStyles[theme].streamListEyeCount]}>{item.viewerCount || 0}</Text>
                    <Ionicons name="eye-outline" size={14} color={theme === 'light' ? '#fff' : '#fff'} />
                </View>
                <View style={styles.streamListOverlay}>
                    <Text
                        style={[styles.streamListName, themeStyles[theme].streamListName]}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                    >
                        {item.hostScreenName || item.screenName}
                    </Text>
                    <Text style={styles.streamListStatus}
                        numberOfLines={1}
                        ellipsizeMode="tail">{item.RoomName}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    const listColumns = isInitialLoading ? 1 : 2;


    return (
        <View style={{ flex: 1, }}>
            <StreamListHeader
                setGetselectcategory={setFilteredRooms}
                getselectcategory={filteredRooms}
                filteredRooms={filteredRooms}
                userData={userData}
                isInterestLoading={isInterestLoading}
                categoryData={categoryData}
                isNearBy={isNearBy}
                setIsNearBy={setIsNearBy}
                isFavourite={isFavourite}
                setIsFavourite={setIsFavourite}
                selectedCategoryIndices={selectedCategoryIndices}
                searchFilteredData={searchFilteredData}
                setSearchFilteredData={setSearchFilteredData}
            />
            {headerMainTab === 'foryou' ? (
                <>
                    <FlatList
                        key={`cols-${listColumns}`}   // 👈 this forces a re-render safely
                        data={isInitialLoading ? [] : apiRooms}
                        numColumns={listColumns}
                        keyExtractor={(item, index) => item?.roomID?.toString() || index.toString()}
                        renderItem={!isInitialLoading ? renderItem : null}
                        showsVerticalScrollIndicator={false}
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        scrollEnabled={!isInitialLoading}
                        contentContainerStyle={[
                            styles.streamListScrollContainer,
                            apiRooms.length === 0 && !isInitialLoading && {
                                flex: 1,
                                justifyContent: 'center',
                                alignItems: 'center',
                            },
                        ]}
                        ListHeaderComponent={
                            isInitialLoading ? (
                                <StreamListSkeleton count={6} columns={2} />
                            ) : null
                        }
                        ListEmptyComponent={
                            !isInitialLoading && (
                                <View style={{ alignItems: 'center' }}>
                                    <Image
                                        source={require('../../assets/images/NoStreamAvailable.png')}
                                        style={{ width: 200, height: 200, resizeMode: 'contain' }}
                                    />
                                </View>
                            )
                        }
                    />


                    <View style={[
                        styles.streamListFiltersBtnGroup,
                        { bottom: insets.bottom + 74 },
                    ]}>
                        <TouchableOpacity
                            style={styles.streamListFiltersColorBtn}
                            onPress={() => setOpenStreamInputModal(true)}>
                            <Text style={styles.streamListFiltersColorBtnText}>Start Stream</Text>
                        </TouchableOpacity>
                        {/* {!subscriptionStatus?.success && (
                            <GoogleBannerAd />
                        )} */}
                    </View>
                </>
            ) : headerMainTab === 'leaderboards' ? (
                <LeaderBoards />
            ) : null
            }

            {
                openStreamInputModal && (
                    <Modal isVisible={openStreamInputModal}
                        onBackdropPress={() => setOpenStreamInputModal(false)}
                        animationIn="slideInUp"
                        animationOut="slideOutDown"
                        animationInTiming={300}
                        animationOutTiming={200}
                        useNativeDriver={true}
                        avoidKeyboard={false}
                        backdropOpacity={0}
                        style={[styles.profileModalMain]}
                    >
                        <View style={[styles.profileModalOverlay,
                        themeStyles[theme].profileModalOverlay, { flex: 1, maxHeight: screenHeight * 0.7 }]}>

                            <View style={{ flexDirection: "row", justifyContent: 'flex-end', marginBottom: 5 }}>
                                <TouchableOpacity
                                    onPress={() => setOpenStreamInputModal(false)}
                                    style={[styles.modalCloseBtn]}
                                >
                                    <Ionicons name="close" size={24} color={theme === 'light' ? '#333' : '#fff'} />
                                </TouchableOpacity>
                            </View>
                            <View style={styles.strHedSearchModalForm}>
                                <TextInput
                                    placeholder="Enter Stream Title (optional)"
                                    placeholderTextColor="#888"
                                    value={roomIdInput}
                                    onChangeText={setRoomIdInput}
                                    style={[styles.strHedSearchModalInput, themeStyles[theme].strHedSearchModalInput, { flex: 1, paddingHorizontal: 12 }]}
                                />
                                <TouchableOpacity
                                    style={[
                                        styles.strHedSearchModalSearchBtn,
                                        { height: 50, minWidth: 115, backgroundColor: isDisable ? '#888' : '#de0037' }
                                    ]}
                                    onPress={submitroomnameandcreateroom}
                                    disabled={disableBtnRef.current === true}
                                >
                                    <Text
                                        style={{ color: '#fff', fontSize: 16, fontWeight: '400' }}>
                                        {isDisable ? 'Processing...' : 'Start Stream'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                            <Text style={[styles.modalSmallTitle, themeStyles[theme].modalSmallTitle, { marginBottom: 10 }]}>Interests</Text>
                            {isInterestLoading ? (
                                <View style={{ height: 200, width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                                    <ActivityIndicator size="large" color="#d93a63" />
                                </View>
                            ) :
                                <ScrollView
                                    showsVerticalScrollIndicator={false}
                                >
                                    <View style={styles.modalCategoryContainer}>
                                        {categoryData.map((category, index) => {
                                            const isSelected = selectedCategoryIndices.includes(category.categoryID);
                                            return (
                                                <TouchableOpacity
                                                    key={category.categoryID}
                                                    onPress={() => toggleCategory(category.categoryID)}
                                                    style={[
                                                        styles.modalCategoryButton,
                                                        isSelected && styles.modalCategoryButtonActive,
                                                    ]}>
                                                    <Text style={styles.modalCategoryText}>{category.categoryName}</Text>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>
                                </ScrollView>
                            }
                        </View>
                    </Modal>
                )
            }
            {/* <Footer /> */}
        </View>
    );
};

export default StreamList;
