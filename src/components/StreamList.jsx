import { useEffect, useState } from 'react';
import { Text, TouchableOpacity, TextInput, Image, FlatList, View, Alert, Dimensions, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { styles, themeStyles } from '../../assets/styles/ThemeStyles';
import Modal from 'react-native-modal';
import { format } from 'date-fns';
import { StreamListHeader } from './StreamListHeader';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Footer from './Footer';
import LinearGradient from 'react-native-linear-gradient';
import Apiclient from '../utils/Apiclient';
import StreamListSkeleton from './StreamListSkeleton';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import themeColors from '../../assets/styles/Colors';
import { useRoute } from '@react-navigation/native';
import { useAppContext } from '../context/AppContext';
import GoogleBannerAd from './GoogleBannerAd';
import { getGenderFallbackImage } from '../utils/constant';

const hardcodedImages = [
    require('../../assets/images/LS-1.jpg'),
    require('../../assets/images/LS-2.jpg'),
    require('../../assets/images/LS-3.jpg'),
    require('../../assets/images/LS-4.jpg'),
    require('../../assets/images/LS-5.jpg'),
    require('../../assets/images/LS-6.jpg'),
];


const StreamList = ({ theme, joinRoom, createRoom, refreshlobby, leaveroomrefresh, setCurrentStreamData }) => {
    const route = useRoute();
    const insets = useSafeAreaInsets();
    const { userData, userAddress, subscriptionStatus } = useAppContext()
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
    const [userDetails, setUserDetails] = useState([]);
    const [isFavourite, setIsFavourite] = useState(false);
    const [searchFilteredData, setSearchFilteredData] = useState([]);
    const [isdisable, setIsDisable] = useState(false); // for disabling the button when creating room
    const [refreshing, setRefreshing] = useState(false);

    // Function to fetch user details from the API
    const getUserDetails = async () => {
        try {
            const formData = {
                userid: userData?.userid,
            };
            const response = await Apiclient.post('/getUserDetails', formData);
            if (response) {
                const user = response.data.user;
                setUserDetails(user || []);
            }
        } catch (error) {
            console.error('Error fetching userDetails:', error);
        }
    };

    useEffect(() => {
        if (userData?.userid) {
            getUserDetails();
        }
    }, [userData?.userid]);

    useEffect(() => {
        if (
            isFavourite &&
            userDetails?.Interests &&
            categoryData.length > 0
        ) {
            const interestArray = userDetails.Interests
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
    }, [isFavourite, userDetails, categoryData]);

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


    // Function to fetch rooms by location from the API
    const getRoomsByLocation = async () => {
        try {
            setIsInitialLoading(true);
            const response = await Apiclient.get(`/rooms/getroomsbylocation?geoLocation=${userAddress.latitude},${userAddress.longitude}`);
            if (response) {
                const livestreamlist = response.data.data.filter(item => item.isLive === 1);
                setApiRooms(livestreamlist || []);
                setNearByRoomData(livestreamlist || []);
            }
        } catch (error) {
            console.error('Error fetching rooms:', error);
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
    const submitroomnameandcreateroom = () => {
        if (roomIdInput.trim() === '') {
            Alert.alert('Error', 'Please enter the stream description before creating stream.');
            return;
        } else if (selectedCategoryIndices.length === 0) {
            Alert.alert('Error', 'Please select at least one category before creating a stream.');
            return;
        }
        callapiforcreateroom();
    };


    const callapiforcreateroom = async () => {
        try {
            setIsDisable(true); // Disable button after room creation
            //7 character room ID
            const sortcategories = selectedCategoryIndices.sort((a, b) => a - b);
            const roomData = {
                RoomName: roomIdInput,
                hostID: userData.userid,
                startDate: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss"),
                endDate: format(new Date(Date.now() + 60 * 60 * 1000), "yyyy-MM-dd'T'HH:mm:ss"), // 1 hour later
                participants: '',
                thumbNail: 'dummyimg.jpg',
                physicalLocation: 'pune',
                Categories: sortcategories.join(','),
                geoLocation: `${userAddress.latitude},${userAddress.longitude}`,
            };

            const response = await Apiclient.post('/rooms', roomData);
            if (response.data.roomID) {
                const roominfo = { ...roomData, roomID: response.data.roomID };
                createRoom(roominfo);
                setOpenStreamInputModal(false);
                setRoomIdInput('');
            }
        } catch (error) {
            setIsDisable(false); // Disable button after room creation
            console.log(error);
        }
    };
    const viewerjoinedroom = (item) => {
        setCurrentStreamData(item);
        const roomId = item.roomID.toString();
        if (item.hostID === userData.userid) {
            joinRoom(roomId, item);
        } else {
            joinRoom(roomId, item);
        }
    }

    const renderItem = ({ item, index }) => {
        const image = hardcodedImages[index % hardcodedImages.length];

        return (
            <TouchableOpacity
                style={styles.streamListCard}
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


    // Function to fetch user interest from the API
    const getInterestData = async () => {
        try {
            setIsInterestLoading(true);
            const response = await Apiclient.post('/getcategories');
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

    useEffect(() => {
        if (searchFilteredData?.length > 0) {
            // Update apiRooms with search results
            setApiRooms(searchFilteredData);
        } else {
            // Clear apiRooms when searchFilteredData is empty
            setApiRooms([]);
        }
    }, [searchFilteredData]);


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


    return (
        <LinearGradient
            style={{ height: '100%', width: '100%', position: 'relative' }}
            colors={[themeColors.headerGradientTop, themeColors.headerGradientBottom]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}>
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
            <View
                style={[
                    styles.streamListMainCardLayout,
                    themeStyles[theme].streamListMainCardLayout,
                ]}>
                <Text
                    style={[
                        styles.streamListMainTitle,
                        themeStyles[theme].streamListMainTitle,
                    ]}>
                    For You
                </Text>
                {isFiltering && (
                    <View style={styles.isFilteringOverlay}>
                        <View style={[styles.isFilteringBlurBackground, themeStyles[theme].isFilteringBlurBackground]} />
                        <ActivityIndicator size="large" color={theme === 'light' ? '#a000df' : '#fff'} />
                    </View>
                )}


                {isInitialLoading ? (
                    <StreamListSkeleton count={6} columns={2} />
                ) : apiRooms.length === 0 && searchFilteredData.length > 0 ? (
                    <ScrollView
                        contentContainerStyle={{
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: screenHeight * 0.5,
                            paddingHorizontal: 20,
                        }}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={handleRefresh}
                                colors={['#d93a63']}
                                tintColor="#d93a63"
                            />
                        }
                    >
                        <Image
                            source={require('../../assets/images/default-streamer.jpg')}
                            style={[
                                styles.streamListImage,
                                { height: screenHeight * 0.3 - 40, resizeMode: 'contain' }
                            ]}
                        />
                        <Text style={{
                            marginTop: 16,
                            fontSize: 16,
                            color: '#666',
                            textAlign: 'center'
                        }}>
                            No rooms found for this search.
                        </Text>
                    </ScrollView>
                ) : apiRooms.length === 0 ? (
                    <ScrollView
                        contentContainerStyle={{
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: screenHeight * 0.5,
                            paddingHorizontal: 20,
                        }}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={handleRefresh}
                                colors={['#d93a63']}
                                tintColor="#d93a63"
                            />
                        }
                    >
                        <Image
                            source={require('../../assets/images/NoStreamAvailable.png')}
                            style={[
                                styles.streamListImage,
                                { height: screenHeight * 0.3 - 40, resizeMode: 'contain' }
                            ]}
                        />
                    </ScrollView>
                ) : (
                    <FlatList
                        data={apiRooms}
                        keyExtractor={item => item.roomID.toString()}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.streamListScrollContainer}
                        initialNumToRender={8}
                        numColumns={2}
                        columnWrapperStyle={styles.streamListGrid}
                        renderItem={renderItem}
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                    />)}
            </View>

            <View style={[
                styles.streamListFiltersBtnGroup,
                insets.bottom > 0 && { paddingBottom: insets.bottom },
            ]}>
                {/* <TouchableOpacity style={styles.streamListFiltersWhiteBtn}>
                    <FontAwesome6 name="wrench" size={24} color="#262628" />
                </TouchableOpacity> */}
                <TouchableOpacity
                    style={styles.streamListFiltersColorBtn}
                    onPress={() => setOpenStreamInputModal(true)}>
                    <Text style={styles.streamListFiltersColorBtnText}>Start Stream</Text>
                </TouchableOpacity>
                {!subscriptionStatus?.success && (
                    <GoogleBannerAd />
                )}
                {/* <TouchableOpacity style={styles.streamListFiltersWhiteBtn}>
                    <FontAwesome6 name="filter" size={24} color="#262628" />
                </TouchableOpacity> */}
            </View>

            {openStreamInputModal && (
                <Modal isVisible={openStreamInputModal}
                    // onBackdropPress={onClose}
                    animationIn="slideInUp"
                    animationOut="slideOutDown"
                    animationInTiming={400}
                    animationOutTiming={300}
                    backdropOpacity={0.4}
                    style={[styles.halfScreenModalMain]}
                    useNativeDriver={true}
                >
                    <View style={[styles.halfScreenModalOverlay, { paddingHorizontal: 4 }]}>

                        <View style={[styles.profileSettingModalBody, { height: screenHeight * 0.6 }]}>
                            <View style={{ flexDirection: "row", justifyContent: 'flex-end', marginBottom: 5 }}>
                                <TouchableOpacity
                                    onPress={() => setOpenStreamInputModal(false)}
                                    style={[styles.modalCloseBtn]}
                                >
                                    <Ionicons name="close" size={24} color="#333" />
                                </TouchableOpacity>
                            </View>
                            <View style={styles.strHedSearchModalForm}>
                                <TextInput
                                    placeholder="Enter Stream Description"
                                    placeholderTextColor="#888"
                                    value={roomIdInput}
                                    onChangeText={setRoomIdInput}
                                    style={[styles.strHedSearchModalInput, { flex: 1, paddingHorizontal: 12 }]}
                                />
                                <TouchableOpacity onPress={submitroomnameandcreateroom} disabled={isdisable}>
                                    <LinearGradient
                                        colors={['#de0037', '#de0037']}
                                        start={{ x: 0.15, y: 1 }}
                                        end={{ x: 1, y: 0 }}
                                        style={[styles.strHedSearchModalSearchBtn, { height: 50 }]}>
                                        <Text
                                            style={{ color: '#fff', fontSize: 16, fontWeight: '400' }}>
                                            Start Stream
                                        </Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                            <Text style={[styles.modalSmallTitle, { marginBottom: 10 }]}>Interests</Text>
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

                    </View>
                </Modal>
            )
            }

            {/* <Footer /> */}
        </LinearGradient>
    );
};

export default StreamList;
