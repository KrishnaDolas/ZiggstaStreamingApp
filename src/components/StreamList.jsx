import { useEffect, useState } from 'react';
import { Text, TouchableOpacity, TextInput, Image, FlatList, View, Alert, Dimensions, ScrollView, ActivityIndicator } from 'react-native';
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

const hardcodedImages = [
    require('../../assets/images/LS-1.jpg'),
    require('../../assets/images/LS-2.jpg'),
    require('../../assets/images/LS-3.jpg'),
    require('../../assets/images/LS-4.jpg'),
    require('../../assets/images/LS-5.jpg'),
    require('../../assets/images/LS-6.jpg'),
];


const StreamList = ({ theme, joinRoom, createRoom, userData, address,refreshlobby }) => {
    const route = useRoute();
    const insets = useSafeAreaInsets();
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


    // console.log('address', address);


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
            const response = await Apiclient.get(`/rooms/getroomsbylocation?geoLocation=${address.lat},${address.lon}`);
            if (response) {
                const livestreamlist= response.data.data.filter(item => item.isLive === 1);
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
            console.log(selecteddata);
            setIsFiltering(true);
            const response = await Apiclient.get(`/rooms/getrooms?isLive=1&Categories=${selecteddata}`);
            if (response) {
                const livestreamlist= response.data.data.filter(item => item.isLive === 1);
                console.log('Filtered Rooms:', response.data.data);
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
            console.log(error);
        } finally {
            setIsFiltering(false);
        }
    };

    useEffect(() => {
        if (selectedCategoryIndices.length > 0) {
            console.log('Selected category indices:', selectedCategoryIndices.join(','));
        } else {
            console.log('No categories selected');
        }
    }, [selectedCategoryIndices]);


    useEffect(() => {
        if (filteredRooms.length > 0) {
            const sorteddata = filteredRooms.sort((a, b) => a - b).join(',');
            filterroomdata(sorteddata);
        } else {
            if (isNearBy && address) {
                getRoomsByLocation();
            } else {
                if (searchFilteredData.length === 0) {
                    // Optionally refetch rooms or keep apiRooms unchanged
                    getRooms(); // or getRoomsByLocation() if isNearBy is true
                }
            }
        }
    }, [filteredRooms, isNearBy,refreshlobby]);

    // Function to create a room
    const submitroomnameandcreateroom = () => {
        if (roomIdInput.trim() === '') {
            Alert.alert('Error', 'Please enter a room name before creating a room.');
            return;
        } else if (selectedCategoryIndices.length === 0) {
            Alert.alert('Error', 'Please select at least one category before creating a room.');
            return;
        }
        callapiforcreateroom();
    };


    const callapiforcreateroom = async () => {
        try {
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
                geoLocation: `${address.lat},${address.lon}`,
            };
            console.log('created roomData', roomData);

            const response = await Apiclient.post('/rooms', roomData);
            console.log(response);
            if (response.data.roomID) {
                console.log('Room created successfully:', response);
                const roominfo={...roomData,roomID: response.data.roomID};
                createRoom(roominfo);
                setOpenStreamInputModal(false);
                setRoomIdInput('');
            }
        } catch (error) {
            console.log(error);
        }
    };
    const viewerjoinedroom = (item) => {
        const roomId = item.roomID.toString();
        const hostID = item.hostID.toString();
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
                    source={image}
                    style={[styles.streamListImage, { height: screenHeight * 0.3 - 40 }]}
                />
                <View style={[styles.streamListEyeCountContainer, themeStyles[theme].streamListEyeCountContainer]}>
                    <Text style={[styles.streamListEyeCount, themeStyles[theme].streamListEyeCount]}>{item.viewerCount || 0}</Text>
                    <Ionicons name="eye-outline" size={14} color={theme === 'light' ? '#fff' : '#fff'} />
                </View>
                <View style={styles.streamListOverlay}>
                    <Text style={[styles.streamListName, themeStyles[theme].streamListName]} numberOfLines={1}>
                        {item.RoomName}
                    </Text>
                    {/* <Text style={styles.streamListStatus} numberOfLines={1}>Hosted by ID: {item.hostID}</Text> */}
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
            console.error('Error fetching interest:', error);
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
            console.log('Updated apiRooms with search results:', searchFilteredData);
        } else {
            // Clear apiRooms when searchFilteredData is empty
            setApiRooms([]);
            console.log('searchFilteredData is empty, cleared apiRooms');
        }
    }, [searchFilteredData]);

    return (
        <LinearGradient
            style={{ height: '100%', width: '100%', position: 'relative' }}
            colors={[themeColors.headerGradientTop, themeColors.headerGradientBottom]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}>
            <StreamListHeader
                setGetselectcategory={setFilteredRooms}
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
                address={address}
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
                    <View style={{
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: screenHeight * 0.4,
                        padding: 20,
                    }}>
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
                    </View>
                ) : apiRooms.length === 0 ? (
                    <View style={{
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: screenHeight * 0.4,
                        padding: 20,
                    }}>
                        <Image
                            source={require('../../assets/images/NoStreamAvailable.png')}
                            style={[
                                styles.streamListImage,
                                { height: screenHeight * 0.3 - 40, resizeMode: 'contain' }
                            ]}
                        />
                    </View>
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
                    <View style={[styles.halfScreenModalOverlay]}>

                        <View style={[styles.profileSettingModalBody, { height: screenHeight * 0.5 }]}>
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
                                    placeholder="Enter Room Name/Topic"
                                    placeholderTextColor="#888"
                                    value={roomIdInput}
                                    onChangeText={setRoomIdInput}
                                    style={[styles.strHedSearchModalInput, { flex: 1 }]}
                                />
                                <TouchableOpacity onPress={submitroomnameandcreateroom}>
                                    <LinearGradient
                                        colors={['rgba(184, 58, 243, 1)', 'rgba(105, 80, 251, 1)']}
                                        start={{ x: 0.15, y: 1 }}
                                        end={{ x: 1, y: 0 }}
                                        style={[styles.strHedSearchModalSearchBtn, { height: 50 }]}>
                                        <Text
                                            style={{ color: '#fff', fontSize: 16, fontWeight: '400' }}>
                                            Start Room
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

            <Footer />
        </LinearGradient>
    );
};

export default StreamList;
