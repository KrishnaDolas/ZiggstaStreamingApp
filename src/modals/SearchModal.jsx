/* eslint-disable react-native/no-inline-styles */
// components/ProfileSettingModal.js
import React, { useEffect, useLayoutEffect, useState } from 'react';
import { View, TouchableOpacity, Text, TextInput, ActivityIndicator } from 'react-native';
import Modal from 'react-native-modal';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { styles } from '../../assets/styles/ThemeStyles';
import { Dimensions, ScrollView } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Apiclient from '../utils/Apiclient';

const SearchModal = ({ visible, onClose,
    setSearchFilteredData, categoryData }) => {
    const screenHeight = Dimensions.get('window').height;
    const [searchText, setSearchText] = useState('');
    const [searchBy, setSearchBy] = useState('user');
    const [layoutReady, setLayoutReady] = useState(false);
    const [isSearchLoading, setIsSearchLoading] = useState(false);
    const [isError, setIsError] = useState(null);

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

    // Function to fetch rooms from the API


    useEffect(() => {
        console.log('username', searchText);
    }, [searchText]);


    const handleSearchByUser = async () => {
        if (!searchText.trim()) {
            setSearchFilteredData([]);
            setIsError('Please enter a valid search term.');
            return;
        }

        setIsSearchLoading(true);
        setIsError(null);

        try {
            const response = await Apiclient.get(`https://api.streamalong.live/rooms/getroomByHostname?username=${searchText}`);
            const data = response?.data?.data;

            if (Array.isArray(data) && data.length > 0) {
                setSearchFilteredData(data);
                setSearchText('');
                onClose(); // ✅ Only close if successful
            } else {
                setIsError('No rooms found for this username.');
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
                    style={[styles.profileModalMain]}
                >
                    <View style={[styles.profileModalOverlay]}>
                        {/* close modal */}
                        <TouchableOpacity onPress={onClose} style={styles.profileModalClose}>
                            <Ionicons name="close" size={23} color="#333" />
                        </TouchableOpacity>
                        <View style={[styles.profileSettingModalBody, { height: screenHeight * 0.3 }]}>
                            <ScrollView
                                // contentContainerStyle={{ paddingBottom: 20 }}
                                showsVerticalScrollIndicator={true}
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
                                        <Text style={{ textAlign: 'center', marginTop: 5 }}>Searching...</Text>
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
                            </ScrollView>
                        </View>

                    </View>
                </Modal>
            }

        </>

    );
};

export default SearchModal;
