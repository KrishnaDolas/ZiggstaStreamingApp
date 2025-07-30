/* eslint-disable react-native/no-inline-styles */
// components/ProfileSettingModal.js
import React, { useContext, useLayoutEffect, useState } from 'react';
import { View, TouchableOpacity, Text, TextInput, ActivityIndicator } from 'react-native';
import Modal from 'react-native-modal';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { styles, themeStyles } from '../../assets/styles/ThemeStyles';
import { Dimensions, ScrollView } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Apiclient from '../utils/Apiclient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppContext } from '../context/AppContext';
import { ThemeContext } from '../context/ThemeContext';

const SearchModal = ({ visible, onClose,
    setSearchFilteredData, categoryData }) => {
    const screenHeight = Dimensions.get('window').height;
    const { theme } = useContext(ThemeContext);
    const {
        userAddress,
        setHeaderMainTab, } = useAppContext();
    const [searchText, setSearchText] = useState('');
    const [searchBy, setSearchBy] = useState('user');
    const [layoutReady, setLayoutReady] = useState(false);
    const [isSearchLoading, setIsSearchLoading] = useState(false);
    const [isError, setIsError] = useState(null);
    const [selectedCategory, setSelectCategory] = useState([]);


    useLayoutEffect(() => {
        if (visible) {
            setLayoutReady(true);
            setIsError(null); // Clear error when modal opens
        } else {
            setLayoutReady(false);
            setSearchText('');
            setIsError(null);
        }
    }, [visible]);

    // Function to fetch searches data from the API

    const handleSearchByUser = async () => {
        if (searchBy === 'user' && searchText === '') {
            setSearchFilteredData([]);
            setIsError('Please enter a valid search term.');
            return;
        }

        setIsSearchLoading(true);
        setIsError(null);

        const filteredCategories = selectedCategory.sort((a, b) => a - b).join(',');
        const getIsVerified = await AsyncStorage.getItem('onlyProfileVerified');
        // const getMaxDistance = await AsyncStorage.getItem('distanceRange');
        // const checkLocationPermission = await AsyncStorage.getItem('locationPermission');
        // const userLocation = `${userAddress.latitude},${userAddress.longitude}`;
        const isVerifiedValue = getIsVerified === 'true' ? 1 : 0;


        // Construct query parameters
        let queryParams = `isLive=1&Categories=${filteredCategories}&username=${searchText.trim()}&isVerified=${isVerifiedValue}`;

        // if (checkLocationPermission === 'granted') {
        //     queryParams += `&maxDistance=${Number(getMaxDistance)}&userLocation=${userLocation}`;
        // }

        // console.log('queryParams', queryParams);

        try {
            const response = await Apiclient.get(`https://api.streamalong.live/rooms/getroomByHostname?${queryParams}`);
            const data = response?.data?.data;

            if (Array.isArray(data) && data.length > 0) {
                setSearchFilteredData(data);
                setSearchText('');
                setHeaderMainTab('foryou');
                onClose(); // ✅ Only close if successful
            } else {
                setIsError('No rooms found for this username.');
                setHeaderMainTab('foryou');
            }
        } catch (error) {
            const message = error?.response?.data?.error || 'Failed to fetch search results.';
            setIsError(message);
        } finally {
            setIsSearchLoading(false);
        }
    };


    // const handleClearSearch = () => {
    //     setSearchText('');
    //     setIsError(null);
    //     setSearchFilteredData([]);
    // };


    const toggleSelectCategory = (item) => {
        const isSelected = selectedCategory.includes(item.categoryID);
        let updated;

        if (isSelected) {
            // If already selected, remove it
            updated = selectedCategory.filter((id) => id !== item.categoryID);
        } else {
            // If not selected and already 3 selected, prevent adding more
            if (selectedCategory.length >= 3) {
                setIsError('You can only select up to 3 categories.');
                return;
            }
            updated = [...selectedCategory, item.categoryID];
        }

        setIsError(null); // clear any previous error
        setSelectCategory(updated);
    };


    return (
        <>
            {layoutReady &&
                <Modal
                    isVisible={visible}
                    onBackdropPress={onClose}
                    animationIn="slideInUp"
                    animationOut="slideOutDown"
                    animationInTiming={300}
                    animationOutTiming={200}
                    useNativeDriver={true}
                    avoidKeyboard={false}
                    backdropOpacity={0}
                    style={[styles.profileModalMain, { margin: 0 }]}
                >
                    <View style={[styles.profileModalOverlay, themeStyles[theme].profileModalOverlay, { height: screenHeight * 0.6 }]}>
                        {/* close modal */}
                        <TouchableOpacity onPress={onClose} style={styles.profileModalClose}>
                            <Ionicons name="close" size={28} color={theme === 'light' ? '#333' : '#fff'} />
                        </TouchableOpacity>
                        <View style={[styles.profileSettingModalBody]}>
                            <ScrollView
                                keyboardShouldPersistTaps="handled"  // Added this prop
                                showsVerticalScrollIndicator={true}
                                contentContainerStyle={{ paddingBottom: 100 }}
                            >
                                <View style={styles.strHedSearchTabBox}>
                                    {['user', 'category'].map((type) => (
                                        <TouchableOpacity
                                            key={type}
                                            onPress={() => {
                                                setSearchBy(type);
                                                setIsError(null);
                                            }}
                                            style={[
                                                styles.strHedSearchTabAction,
                                                { backgroundColor: searchBy === type ? '#d93a63' : '#fff' },
                                            ]}
                                        >
                                            <Text
                                                style={[
                                                    styles.strHedSearchTabActionText,
                                                    { color: searchBy === type ? '#fff' : '#d93a63' },
                                                ]}
                                            >
                                                {type.charAt(0).toUpperCase() + type.slice(1)}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                                {isSearchLoading && (
                                    <View style={{ paddingVertical: 10 }}>
                                        <ActivityIndicator size="small" color="#d93a63" />
                                        <Text style={{ color: theme === 'light' ? '#000' : '#fff', textAlign: 'center', marginTop: 5 }}>Searching...</Text>
                                    </View>
                                )}

                                {isError && (
                                    <View style={{ paddingVertical: 10 }}>
                                        <Text style={{ color: 'red', fontSize: 14, textAlign: 'center' }}>{isError}</Text>
                                    </View>
                                )}
                                <View style={[styles.strHedSearchModalTopForm]}>
                                    <TextInput
                                        placeholder="Search by user"
                                        placeholderTextColor="#888"
                                        value={searchText}
                                        onChangeText={setSearchText}
                                        style={[styles.strHedSearchModalInput, { flex: 1 }]}
                                    />
                                    {/* {searchText.length > 0 && (
                                        <TouchableOpacity onPress={handleClearSearch} style={{ padding: 10 }}>
                                            <Ionicons name="close-circle" size={20} color="#888" />
                                        </TouchableOpacity>
                                    )} */}
                                    <View style={[styles.strHedSearchModalFormBtnBox]}>
                                        <TouchableOpacity onPress={handleSearchByUser}>
                                            <LinearGradient
                                                colors={['rgba(184, 58, 243, 1)', 'rgba(105, 80, 251, 1)']}
                                                start={{ x: 0.15, y: 1 }}
                                                end={{ x: 1, y: 0 }}
                                                style={styles.strHedSearchModalSearchBtn}
                                            >
                                                <Text style={{ color: '#fff', fontSize: 15, fontWeight: '400' }}>Search</Text>
                                            </LinearGradient>
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {/* category data */}
                                {searchBy === 'category' && (
                                    <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
                                        {categoryData.map((item) => (
                                            <TouchableOpacity
                                                key={item.categoryID}
                                                disabled={
                                                    !selectedCategory.includes(item.categoryID) && selectedCategory.length >= 3
                                                }
                                                style={[
                                                    styles.modalCategoryButton,
                                                    selectedCategory.includes(item.categoryID) && styles.modalCategoryButtonActive,
                                                    { margin: 7, opacity: !selectedCategory.includes(item.categoryID) && selectedCategory.length >= 3 ? 0.5 : 1 }
                                                ]}
                                                onPress={() => toggleSelectCategory(item)}
                                            >
                                                <Text style={styles.modalCategoryText}>
                                                    {item.categoryName}
                                                </Text>
                                            </TouchableOpacity>

                                        ))}
                                    </View>
                                )}
                            </ScrollView>
                        </View>
                    </View>
                </Modal>
            }
        </>

    );
};

export default SearchModal;
