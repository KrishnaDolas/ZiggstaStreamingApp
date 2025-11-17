/* eslint-disable react-native/no-inline-styles */
// components/ProfileSettingModal.js
import React, { useContext, useLayoutEffect, useRef, useState } from 'react';
import { View, TouchableOpacity, Text, TextInput, FlatList } from 'react-native';
import Modal from 'react-native-modal';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { styles, themeStyles } from '../../assets/styles/ThemeStyles';
import { Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppContext } from '../context/AppContext';
import { ThemeContext } from '../context/ThemeContext';

const LocationChangeModal = ({ visible, onClose }) => {
    const screenHeight = Dimensions.get('window').height;
    const { theme } = useContext(ThemeContext);
    const {
        userAddress,
        setHeaderMainTab,
    } = useAppContext();
    const [searchText, setSearchText] = useState('');
    const [layoutReady, setLayoutReady] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [editable, setEditable] = useState(false); // 👈 new state for enabling edit
    const inputRef = useRef(null);

    useLayoutEffect(() => {
        const loadSavedLocation = async () => {
            if (visible) {
                setLayoutReady(true);
                try {
                    const savedLocationStr = await AsyncStorage.getItem('userLocation');
                    if (savedLocationStr) {
                        const savedLocation = JSON.parse(savedLocationStr);
                        if (savedLocation?.formatted) {
                            setSearchText(savedLocation.formatted);
                            setSelectedLocation(savedLocation);
                            console.log('📍 Loaded saved location:', savedLocation.formatted);
                            setEditable(false); // initially not editable
                            return;
                        }
                    }

                    // Fallback: use user's city if available
                    if (userAddress?.city) {
                        setSearchText(userAddress.city);
                        setEditable(false);
                        console.log('📍 Using userAddress city:', userAddress.city);
                    } else {
                        setSearchText('');
                        setEditable(true); // allow editing if nothing found
                    }
                } catch (error) {
                    console.error('Error loading saved location:', error);
                }
            } else {
                // Reset when modal closes
                setLayoutReady(false);
                setSearchText('');
                setSearchResults([]);
                setSelectedLocation(null);
                setEditable(false);
            }
        };

        loadSavedLocation();
    }, [visible]);


    const handleChange = value => {
        setSearchText(value);
        if (editable) handleLocationSearch(value);
    };

    const handleSelectLocation = async item => {

        const city =
            item.city || item.town || item.village || '';
        const country = item.country || '';

        const updatedItem = {
            ...item,
            city,
            country,
            formatted: item.formatted || `${city}, ${country}`,
        };
        setSelectedLocation(updatedItem);
        setSearchText(updatedItem.formatted || '');
        setSearchResults([]);
    };


    const handleLocationSearch = async text => {
        if (text.length < 2) {
            setSearchResults([]);
            return;
        }
        try {
            const response = await fetch(
                `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(
                    text
                )}&format=json&apiKey=25127ca1c55f48909b03f43048040037`
            );
            const json = await response.json();
            setSearchResults(json.results || []);
        } catch (err) {
            console.error('Error fetching autocomplete results:', err);
            setSearchResults([]);
        }
    };

    // ✅ Save Location (Lat & Lon)
    const handleSaveLocation = async () => {
        if (!selectedLocation) {
            alert('Please select a location first.');
            return;
        }
        const { lat, lon, formatted, city, country } = selectedLocation;

        try {
            await AsyncStorage.setItem(
                'userLocation',
                JSON.stringify({ lat, lon, formatted, city, country })
            );
            console.log('✅ Location saved:', { lat, lon, formatted, city, country });
            setHeaderMainTab('foryou');
            alert('Location saved successfully!');
            onClose();
        } catch (error) {
            console.error('Error saving location:', error);
            setHeaderMainTab('foryou');
            alert('Failed to save location.');
        }
    };


    // ✅ Clear Location
    const handleClearLocation = async () => {
        try {
            await AsyncStorage.removeItem('userLocation');
            console.log('🗑️ Location cleared');
            setHeaderMainTab('foryou');
            alert('Saved location cleared.');
            setSelectedLocation(null);
            setSearchText('');
            setEditable(true);
        } catch (error) {
            setHeaderMainTab('foryou');
            console.error('Error clearing location:', error);
            alert('Failed to clear location.');
        }
    };


    const renderListItem = ({ item }) => (
        <TouchableOpacity
            style={{
                padding: 10,
                borderBottomWidth: 1,
                borderBottomColor: '#ddd',
                backgroundColor: theme === 'dark' ? '#333' : '#fff',
            }}
            onPress={() => handleSelectLocation(item)}
        >
            <Text style={{ color: theme === 'dark' ? '#fff' : '#000' }}>
                {item.city || item.town || item.village || item.formatted}
            </Text>
        </TouchableOpacity>
    );

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
                    <View
                        style={[
                            styles.profileModalOverlay,
                            themeStyles[theme].profileModalOverlay,
                            { flex: 1, maxHeight: screenHeight * 0.7 },
                        ]}
                    >
                        {/* close modal */}
                        <TouchableOpacity onPress={onClose} style={[styles.profileModalClose, { marginBottom: 10 }]}>
                            <Ionicons name="close" size={28} color={theme === 'light' ? '#333' : '#fff'} />
                        </TouchableOpacity>
                        {/* FlatList replacing ScrollView */}
                        <FlatList
                            data={searchResults}
                            keyExtractor={item => item.place_id?.toString() || Math.random().toString()}
                            renderItem={renderListItem}
                            keyboardShouldPersistTaps="handled"
                            showsVerticalScrollIndicator={true}
                            ListHeaderComponent={
                                <View style={{ paddingHorizontal: 10 }}>

                                    {/* Title */}
                                    <Text
                                        style={{
                                            color: theme === 'light' ? '#000' : '#fff',
                                            fontWeight: '600',
                                            fontSize: 18,
                                        }}
                                    >
                                        Change Stream Location
                                    </Text>

                                    {/* Input */}
                                    <View style={{ paddingVertical: 20, flexDirection: 'row', alignItems: 'center' }}>
                                        <TextInput
                                            ref={inputRef}
                                            style={[
                                                styles.strHedSearchModalInput,
                                                themeStyles[theme].strHedSearchModalInput,
                                                { flex: 1, opacity: editable ? 1 : 0.6 },
                                            ]}
                                            placeholder="Enter new location"
                                            placeholderTextColor="#9d9d9d"
                                            value={searchText}
                                            onChangeText={handleChange}
                                            editable={editable}
                                        />
                                        {!editable && (
                                            <TouchableOpacity
                                                onPress={() => {
                                                    setEditable(true);
                                                    setTimeout(() => inputRef.current?.focus(), 100); // 👈 autofocus after enabling
                                                }}
                                                style={{ marginLeft: 8 }}
                                            >
                                                <Ionicons name="create-outline" size={22} color="#888" />
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                </View>
                            }
                            ListFooterComponent={
                                <View style={{ flexDirection: 'row', paddingHorizontal: 10, marginTop: 20 }}>
                                    {/* Save Button */}
                                    <TouchableOpacity
                                        onPress={handleSaveLocation}
                                        style={{
                                            borderRadius: 30,
                                            marginHorizontal: 7,
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            overflow: 'hidden',
                                            flex: 1,
                                            height: 45,
                                        }}
                                    >
                                        <LinearGradient
                                            colors={['rgba(184, 58, 243, 1)', 'rgba(105, 80, 251, 1)']}
                                            start={{ x: 0.15, y: 1 }}
                                            end={{ x: 1, y: 0 }}
                                            style={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                right: 0,
                                                bottom: 0,
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                            }}
                                        >
                                            <Text
                                                style={{ color: '#fff', fontSize: 15, fontWeight: '400' }}
                                            >
                                                Save
                                            </Text>
                                        </LinearGradient>
                                    </TouchableOpacity>

                                    {/* Clear Button */}
                                    <TouchableOpacity
                                        onPress={handleClearLocation}
                                        style={{
                                            borderRadius: 30,
                                            marginHorizontal: 7,
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            overflow: 'hidden',
                                            flex: 1,
                                            height: 45,
                                        }}
                                    >
                                        <LinearGradient
                                            colors={['rgba(73, 73, 73, 1)', 'rgba(145, 145, 145, 1)']}
                                            start={{ x: 0.15, y: 1 }}
                                            end={{ x: 1, y: 0 }}
                                            style={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                right: 0,
                                                bottom: 0,
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                            }}
                                        >
                                            <Text
                                                style={{ color: '#fff', fontSize: 15, fontWeight: '400' }}
                                            >
                                                Clear
                                            </Text>
                                        </LinearGradient>
                                    </TouchableOpacity>
                                </View>
                            }
                            contentContainerStyle={{ paddingBottom: 100 }}
                        />
                    </View>
                </Modal>
            }
        </>

    );
};

export default LocationChangeModal;
