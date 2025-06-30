import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    ScrollView,
    TextInput,
    Modal,
    Animated,
    ActivityIndicator
} from 'react-native';
import { styles } from '../../assets/styles/ThemeStyles';
import LinearGradient from 'react-native-linear-gradient';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useRoute } from '@react-navigation/native';
import SearchModal from '../modals/SearchModal';

export const StreamListHeader = ({ setGetselectcategory, userData, isInterestLoading, categoryData, isNearBy,
    setIsNearBy, isFavourite,
    setIsFavourite, selectedCategoryIndices, searchFilteredData,
    setSearchFilteredData, address }) => {
    const route = useRoute();
    const [showSearch, setShowSearch] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [selectedinterest, setSelectedinterest] = useState([]); // State to track selected interest
    const [isSearchModalReady, setIsSearchModalReady] = useState(false);
    const [searchBy, setSearchBy] = useState('user');
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const [visibleModal, setVisibleModal] = useState(null);

    // Sync selectedinterest with selectedCategoryIndices
    useEffect(() => {
        if (selectedCategoryIndices) {
            setSelectedinterest(selectedCategoryIndices);
            setGetselectcategory(selectedCategoryIndices); // Ensure StreamList's filteredRooms is updated
        }
    }, [selectedCategoryIndices, setGetselectcategory]);

    // ✅ Memoize heart toggle
    const handleToggleLiked = useCallback(() => {
        setIsFavourite((prev) => !prev);
    }, [setIsFavourite]);

    // ✅ Animate heart icon once
    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(scaleAnim, { toValue: 1.2, duration: 300, useNativeDriver: true }),
                Animated.timing(scaleAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
            ])
        ).start();
    }, []);


    const selectedcategory = (item) => {
        const isSelected = selectedinterest.includes(item.categoryID);
        let updated;
        if (isSelected) {
            updated = selectedinterest.filter((id) => id !== item.categoryID);
        } else {
            updated = [...selectedinterest, item.categoryID];
        }
        setSelectedinterest(updated);
        setGetselectcategory(updated); // Update StreamList's filteredRooms
    };


    return (
        <View style={[styles.streamListHeader]} >
            {/* header top */}
            <View style={styles.streamListHeaderTop}>
                <Image
                    source={require('../../assets/images/logo_ziggsta_hor.png')}
                    style={styles.streamHeaderLeftImg}
                    resizeMode="contain"
                />
                <View style={styles.streamHeaderRightBox}>
                    {/* <View style={styles.streamHeaderCountBox}>
                        <Ionicons name='eye-outline' solid size={16} color="#fff" />
                        <Text style={styles.streamHeaderCountTitle}>245</Text>
                    </View> */}
                    <View style={styles.streamHeaderCountBox}>
                        <FontAwesome name='dollar' solid size={14} color="#fff" />
                        <Text style={styles.streamHeaderCountTitle}>{userData?.CreditBalance}</Text>
                    </View>
                    <TouchableOpacity style={{ marginRight: 12 }}>
                        <Ionicons name='notifications' solid size={18} color="#000" />
                    </TouchableOpacity>
                </View>
            </View>
            {route.name === 'Main' && (
                <View style={styles.streamListHeaderBottom}>
                    {/* Left Fixed Icon */}
                    <TouchableOpacity style={styles.strHeaderFixedIcon} onPress={() => {
                        handleToggleLiked();
                    }}>
                        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                            {isFavourite ? (
                                <Ionicons name="heart-sharp" size={22} color="#d93a63" />
                            ) : (
                                <Ionicons name="heart-outline" size={22} color="#d93a63" />
                            )}
                        </Animated.View>
                    </TouchableOpacity>
                    {/* Scrollable Category Buttons */}
                    {isInterestLoading ? (
                        <View style={{ flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                            <ActivityIndicator size="small" color="#d93a63" />
                        </View>
                    ) : <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.strHeaderScrollCategoryContainer}
                    >
                        <TouchableOpacity onPress={() => setIsNearBy(!isNearBy)} style={[styles.strHeaderCategoryButton, isNearBy &&
                            styles.btnInterestActive]}>
                            <Text style={[styles.strHeaderCategoryText, isNearBy && styles.btnInterestActiveText]}>
                                Nearby
                            </Text>
                        </TouchableOpacity>
                        {categoryData.map((item) => (
                            <TouchableOpacity
                                key={item.categoryID}
                                style={[styles.strHeaderCategoryButton,
                                selectedinterest.includes(item.categoryID) &&
                                styles.btnInterestActive]}
                                onPress={() => selectedcategory(item)}
                            >
                                <Text style={[
                                    styles.strHeaderCategoryText,
                                    selectedinterest.includes(item.categoryID) && styles.btnInterestActiveText
                                ]}>
                                    {item.categoryName}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>}
                    {/* Right Fixed Icon */}
                    <TouchableOpacity style={styles.strHeaderFixedIcon} onPress={() => setVisibleModal('search')}>
                        <Ionicons name="search" size={20} color="#d93a63" />
                    </TouchableOpacity>
                </View>
            )}
            {/* Search Modal */}
            {showSearch && (
                <Modal
                    visible={showSearch}
                    transparent
                    animationType="fade"
                    onShow={() => setIsSearchModalReady(true)} // Trigger after layout
                    onRequestClose={() => {
                        setShowSearch(false);
                        setIsSearchModalReady(false); // Reset
                    }}
                >
                    {isSearchModalReady && (
                        <View style={[styles.strHedSearchModalOverlay]}>
                            <View style={[styles.strHedSearchModalCard]}>
                                <View style={{ flexDirection: "row", justifyContent: 'flex-end', marginBottom: 14 }}>
                                    <TouchableOpacity
                                        onPress={() => {
                                            setShowSearch(false);
                                            setIsSearchModalReady(false); // Reset on close
                                        }}
                                        style={[styles.strHedSearchModalCloseBtn]}
                                    >
                                        <Ionicons name="close" size={14} color="#fff" />
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.strHedSearchTabBox}>
                                    {['user', 'category'].map((type) => (
                                        <TouchableOpacity
                                            key={type}
                                            onPress={() => setSearchBy(type)}
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

                                <View style={[styles.strHedSearchModalTopForm]}>
                                    <TextInput
                                        placeholder={`Search by ${searchBy === 'user' ? 'user' : 'category'}`}
                                        placeholderTextColor="#888"
                                        value={searchText}
                                        onChangeText={setSearchText}
                                        style={[styles.strHedSearchModalInput, { flex: 1 }]}
                                    />
                                    <View style={[styles.strHedSearchModalFormBtnBox]}>
                                        <TouchableOpacity>
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

                            </View>
                        </View>
                    )}

                </Modal>
            )
            }
            {visibleModal === 'search' && (
                <SearchModal
                    visible="true"
                    onClose={() => setVisibleModal(null)}
                    searchFilteredData={searchFilteredData}
                    setSearchFilteredData={setSearchFilteredData}
                    categoryData={categoryData}
                    selectedcategory={selectedcategory}
                    selectedinterest={selectedinterest}
                    address={address}
                />
            )}

        </View>

    );
};
