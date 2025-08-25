import React, { useCallback, useContext, useState } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    ScrollView,
    TextInput,
    Modal,
    ActivityIndicator
} from 'react-native';
import { styles, themeStyles } from '../../assets/styles/ThemeStyles';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useRoute } from '@react-navigation/native';
import SearchModal from '../modals/SearchModal';
import { useAppContext } from '../context/AppContext';
import { ThemeContext } from '../context/ThemeContext';
import CategoriesModal from '../modals/CategoriesModal';
import MessageModal from '../modals/MessageModal';

export const StreamListHeader = ({ setGetselectcategory, getselectcategory, isInterestLoading, categoryData, isNearBy,
    setIsNearBy, isFavourite,
    setIsFavourite, searchFilteredData,
    setSearchFilteredData }) => {
    const { theme } = useContext(ThemeContext);
    const { profileData,
        headerMainTab,
        setHeaderMainTab,
    } = useAppContext();
    const route = useRoute();
    const [showSearch, setShowSearch] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [isSearchModalReady, setIsSearchModalReady] = useState(false);
    const [searchBy, setSearchBy] = useState('user');
    const [visibleModal, setVisibleModal] = useState(null);
    const [message, setMessage] = useState(null);


    // ✅ Memoize heart toggle
    const handleToggleLiked = useCallback(() => {
        setIsFavourite((prev) => !prev);
        setHeaderMainTab('foryou');
    }, [setIsFavourite]);

    const handleClearFilter = () => {
        setGetselectcategory([]);
        setIsFavourite(false);
        setIsNearBy(false);
    };

    const handleConnect = useCallback((item) => {
        setMessage(`this feature is not implemented yet.`)
        setVisibleModal('message-modal');
    }, []);

    const handleEvents = useCallback((item) => {
        setMessage(`this feature is not implemented yet.`)
        setVisibleModal('message-modal');
    }, []);


    const handleLeaderBoards = useCallback((item) => {
        // setMessage(`this feature is not implemented yet.`)
        // setVisibleModal('message-modal');
        setHeaderMainTab('leaderboards');
        setIsNearBy(false);
        setIsFavourite(false);
        // setVisibleModal('category');
    }, []);

    return (
        <>
            <View style={[styles.streamListHeader, themeStyles[theme].streamListHeader]} >
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
                            {/* <FontAwesome name='dollar' solid size={14} color="#fff" /> */}
                            <Image
                                source={require('../../assets/images/icons/star.png')} // Adjust the path as needed
                                style={{ width: 14, height: 14 }}
                                resizeMode="contain"
                            />
                            <Text style={styles.streamHeaderCountTitle}>{profileData?.CreditBalance}</Text>
                        </View>
                        <TouchableOpacity style={{ marginRight: 12 }}>
                            <Ionicons name='notifications' solid size={18} color={theme === 'light' ? '#000' : '#fff'} />
                        </TouchableOpacity>
                    </View>
                </View>
                {route.name === 'Main' && (
                    <View style={styles.streamListHeaderBottom}>
                        {/* Left Fixed Icon */}
                        <TouchableOpacity onPress={handleClearFilter} style={[styles.strHeaderFixedIcon, { paddingHorizontal: getselectcategory?.length === 0 ? 3 : 8 }]}>
                            {(
                                <View
                                    style={{
                                        // opacity: getselectcategory?.length > 0 ? 1 : 0
                                        display: getselectcategory?.length > 0 ? 'flex' : 'none'
                                    }}>
                                    <Image
                                        source={require('../../assets/images/icons/filter-remove.png')}
                                        style={{
                                            width: 23,
                                            height: 23,
                                            tintColor: theme === 'light' ? '#d93a63' : '#d93a63',
                                        }}
                                        resizeMode="contain"
                                    />
                                </View>
                            )}
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
                            {/* <TouchableOpacity
                                onPress={() => setHeaderMainTab('foryou')}
                                style={[styles.strHeaderCategoryButton, { marginLeft: 2, display: headerMainTab === 'foryou' ? 'none' : 'flex' }, themeStyles[theme].strHeaderCategoryButton, headerMainTab === 'foryou' &&
                                    styles.btnInterestActive]}>
                                <Text style={[styles.strHeaderCategoryText, themeStyles[theme].strHeaderCategoryText, headerMainTab === 'foryou' && styles.btnInterestActiveText]}>
                                    For You
                                </Text>
                            </TouchableOpacity> */}
                            <TouchableOpacity onPress={() => {
                                setIsNearBy(!isNearBy);
                                setHeaderMainTab('foryou');
                            }} style={[styles.strHeaderCategoryButton, { marginLeft: headerMainTab === 'foryou' && 2 }, themeStyles[theme].strHeaderCategoryButton, isNearBy &&
                                styles.btnInterestActive]}>
                                <Text style={[styles.strHeaderCategoryText, themeStyles[theme].strHeaderCategoryText, isNearBy && styles.btnInterestActiveText]}>
                                    Nearby
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => {
                                setVisibleModal('category');
                                setHeaderMainTab('foryou');
                            }} style={[styles.strHeaderCategoryButton, themeStyles[theme].strHeaderCategoryButton, getselectcategory?.length > 0 &&
                                styles.btnInterestActive]}>
                                <Text style={[styles.strHeaderCategoryText, themeStyles[theme].strHeaderCategoryText, getselectcategory?.length > 0 && styles.btnInterestActiveText]}>
                                    Categories
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleConnect} style={[styles.strHeaderCategoryButton, themeStyles[theme].strHeaderCategoryButton]}>
                                <Text style={[styles.strHeaderCategoryText, themeStyles[theme].strHeaderCategoryText]}>
                                    Connect
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => {
                                handleToggleLiked();
                            }} style={[styles.strHeaderCategoryButton, themeStyles[theme].strHeaderCategoryButton, isFavourite &&
                                styles.btnInterestActive]}>
                                <Text style={[styles.strHeaderCategoryText, themeStyles[theme].strHeaderCategoryText, isFavourite && styles.btnInterestActiveText]}>
                                    Favourites
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleConnect} style={[styles.strHeaderCategoryButton, themeStyles[theme].strHeaderCategoryButton]}>
                                <Text style={[styles.strHeaderCategoryText, themeStyles[theme].strHeaderCategoryText]}>
                                    Events
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleLeaderBoards} style={[styles.strHeaderCategoryButton, themeStyles[theme].strHeaderCategoryButton, headerMainTab === 'leaderboards' &&
                                styles.btnInterestActive]}>
                                <Text style={[styles.strHeaderCategoryText, themeStyles[theme].strHeaderCategoryText, headerMainTab === 'leaderboards' && styles.btnInterestActiveText]}>
                                    Leaderboard
                                </Text>
                            </TouchableOpacity>
                        </ScrollView>}
                        {/* Right Fixed Icon */}
                        <TouchableOpacity style={styles.strHeaderFixedIcon} onPress={() => setVisibleModal('search')}>
                            <Ionicons name="search" size={20} color="#d93a63" />
                        </TouchableOpacity>
                    </View>
                )
                }
                <LinearGradient
                    colors={theme === 'light' ? ['rgba(0, 0, 0, 0.05)', 'transparent'] : ['rgba(27, 27, 27, 0.69)', 'transparent']}
                    style={styles.bottomShadow}
                />
                {/* Search Modal */}
                {
                    showSearch && (
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
                {
                    visibleModal === 'search' && (
                        <SearchModal
                            visible="true"
                            onClose={() => setVisibleModal(null)}
                            searchFilteredData={searchFilteredData}
                            setSearchFilteredData={setSearchFilteredData}
                            categoryData={categoryData}
                        />
                    )
                }
                {
                    visibleModal === 'category' && (
                        <CategoriesModal
                            visible="true"
                            onClose={() => setVisibleModal(null)}
                            categoryData={categoryData}
                            getselectcategory={getselectcategory}
                            setGetselectcategory={setGetselectcategory}
                        />
                    )
                }
                {
                    visibleModal === 'message-modal' && (
                        <MessageModal
                            visible={visibleModal === 'message-modal'}
                            message={message}
                            onClose={() => setVisibleModal(null)}
                        />
                    )
                }

            </View>
        </>

    );
};
