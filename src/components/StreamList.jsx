import { useEffect, useState } from 'react';
import { Text, TouchableOpacity, TextInput, Image, FlatList, View, Alert, Dimensions, ScrollView, ActivityIndicator } from 'react-native';
import { styles, themeStyles } from '../../assets/styles/ThemeStyles';
import Modal from 'react-native-modal';
import { format } from 'date-fns';
import { StreamListHeader } from './StreamListHeader';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import Footer from './Footer';
import LinearGradient from 'react-native-linear-gradient';
import Apiclient from '../utils/Apiclient';
import StreamListSkeleton from './StreamListSkeleton';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import themeColors from '../../assets/styles/Colors';

const hardcodedImages = [
    require('../../assets/images/LS-1.jpg'),
    require('../../assets/images/LS-2.jpg'),
    require('../../assets/images/LS-3.jpg'),
    require('../../assets/images/LS-4.jpg'),
    require('../../assets/images/LS-5.jpg'),
    require('../../assets/images/LS-6.jpg'),
];

const categoryData = [
    'Art & Music',
    'Entertainment & Gaming',
    'Family & Parenting',
    'Fashion & Shopping',
    'Food & Cooking',
    'Health & Fitness',
    'Hobbies & Activities',
    'News & Politics',
    'Religion & Spiritual',
    'Sports & Adventure',
    'Travel & Holidays',
];


const StreamList = ({ theme, joinRoom, createRoom, userData }) => {
    const insets = useSafeAreaInsets();
    const screenHeight = Dimensions.get('window').height;
    const [openStreamInputModal, setOpenStreamInputModal] = useState(false);
    const [roomIdInput, setRoomIdInput] = useState('');
    const [apiRooms, setApiRooms] = useState([]);
    const [selectedCategoryIndices, setSelectedCategoryIndices] = useState([]); // store selected indices
    const [filteredRooms, setFilteredRooms] = useState([]); // store filtered rooms
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [isFiltering, setIsFiltering] = useState(false);

    // Function to toggle category selection
    const toggleCategory = (index) => {
        // selct the only 5 categories at a time
        if (selectedCategoryIndices.length >= 5 && !selectedCategoryIndices.includes(index)) {
            Alert.alert('Limit Reached', 'You can select up to 5 categories only.');
            return;
        }
        setSelectedCategoryIndices(prev => {
            if (prev.includes(index)) {
                return prev.filter(i => i !== index); // unselect
            } else {
                return [...prev, index]; // select
            }
        });
    };

    // Function to fetch rooms from the API
    const getRooms = async () => {
        try {
            setIsInitialLoading(true);
            const response = await Apiclient.get('/rooms/getrooms')
            if (response) {
                setApiRooms(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching rooms:', error);
        } finally {
            setIsInitialLoading(false);
        }
    };

    const filterroomdata = async (selecteddata) => {
        try {
            console.log(selecteddata);
            setIsFiltering(true);
            const response = await Apiclient.get(`/rooms/getrooms?Categories=${selecteddata}`)
            if (response) {
                console.log('Filtered Rooms:', response.data.data);
                setApiRooms(response.data.data || []);
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
            getRooms();
        }
        console.log(userData);
    }, [filteredRooms]);

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
            const roomId = Math.random().toString(36).substring(2, 4);
            const sortcategories = selectedCategoryIndices.sort((a, b) => a - b);
            const roomData = {
                RoomName: roomIdInput,
                hostID: userData.userid,
                startDate: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss"),
                endDate: format(new Date(Date.now() + 60 * 60 * 1000), "yyyy-MM-dd'T'HH:mm:ss"), // 1 hour later
                participants: '',
                thumbNail: 'dummyimg.jpg',
                physicalLocation: 'pune',
                Categories: sortcategories.join(',')
            };
            console.log(roomData);

            const response = await Apiclient.post('/rooms', roomData);
            console.log(response);
            if (response.data.roomID) {
                console.log('Room created successfully:', response);
                createRoom(response.data.roomID.toString());
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
        if(item.hostID === userData.userid){
            createRoom(roomId,hostID);
        }else{
            joinRoom(roomId,hostID);
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


    return (
        <LinearGradient
            style={{ height: '100%', width: '100%', position: 'relative' }}
            colors={[themeColors.headerGradientTop, themeColors.headerGradientBottom]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}>
            <StreamListHeader setGetselectcategory={setFilteredRooms} userData={userData} />
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

                        <View style={[styles.profileSettingModalBody, { maxHeight: screenHeight * 0.5 }]}>
                            <View style={{ flexDirection: "row", justifyContent: 'flex-end', marginBottom: 5 }}>
                                <TouchableOpacity
                                    onPress={() => setOpenStreamInputModal(false)}
                                    style={[styles.modalCloseBtn]}
                                >
                                    <Ionicons name="close" size={22} color="#333" />
                                </TouchableOpacity>
                            </View>
                            <View style={styles.strHedSearchModalForm}>
                                <TextInput
                                    placeholder="Enter Room Name/Topic"
                                    placeholderTextColor="#888"
                                    value={roomIdInput}
                                    onChangeText={setRoomIdInput}
                                    style={styles.strHedSearchModalInput}
                                />
                                <TouchableOpacity onPress={submitroomnameandcreateroom}>
                                    <LinearGradient
                                        colors={['rgba(184, 58, 243, 1)', 'rgba(105, 80, 251, 1)']}
                                        start={{ x: 0.15, y: 1 }}
                                        end={{ x: 1, y: 0 }}
                                        style={styles.strHedSearchModalSearchBtn}>
                                        <Text
                                            style={{ color: '#fff', fontSize: 16, fontWeight: '400' }}>
                                            Create Room
                                        </Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                            <Text style={[styles.modalSmallTitle, { marginBottom: 10 }]}>Interests</Text>
                            <ScrollView
                                showsVerticalScrollIndicator={false}
                            >
                                <View style={styles.modalCategoryContainer}>
                                    {categoryData.map((category, index) => {
                                        const isSelected = selectedCategoryIndices.includes(index);
                                        return (
                                            <TouchableOpacity key={index} onPress={() => toggleCategory(index)} style={[
                                                styles.modalCategoryButton,
                                                isSelected && styles.modalCategoryButtonActive,
                                            ]}>
                                                <Text style={styles.modalCategoryText}>{category}</Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            </ScrollView>
                        </View>

                    </View>
                </Modal>
            )}

            <Footer />
        </LinearGradient>
    );
};

export default StreamList;
