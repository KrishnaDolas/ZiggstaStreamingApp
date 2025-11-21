import React, { useContext, useEffect, useState } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator
} from 'react-native';
import { styles, themeStyles } from '../../assets/styles/ThemeStyles';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
// import SearchModal from '../modals/SearchModal';
import { useAppContext } from '../context/AppContext';
import { ThemeContext } from '../context/ThemeContext';
import CategoriesModal from '../modals/CategoriesModal';
import MessageModal from '../modals/MessageModal';
import LocationChangeModal from '../modals/LocationChangeModal';

export const StreamListHeader = ({
    setGetselectcategory,
    getselectcategory,
    isInterestLoading,
    categoryData,
    isNearBy,
    setIsNearBy,
    isFavourite,
    setIsFavourite,
}) => {
    const { theme } = useContext(ThemeContext);
    const navigation = useNavigation();
    const { profileData,
        headerMainTab,
        setHeaderMainTab,
    } = useAppContext();
    const route = useRoute();
    const [visibleModal, setVisibleModal] = useState(null);
    const [message, setMessage] = useState(null);


    // ✅ Memoize heart toggle
    const handleToggleLiked = () => {
        setIsFavourite((prev) => !prev);
        setHeaderMainTab('foryou');
    };

    const handleClearFilter = () => {
        setGetselectcategory([]);
        setIsFavourite(false);
        setIsNearBy(false);
    };

    const handleConnect = (item) => {
        setMessage('This feature is not implemented yet.');
        setVisibleModal('message-modal');
    };


    const handleLeaderBoards = (item) => {
        setHeaderMainTab('leaderboards');
        setIsNearBy(false);
        setIsFavourite(false);
    };


    const handleLogoPress = () => {
        if (route.name === 'Main') {
            setIsNearBy(prev => !prev);
            setHeaderMainTab('foryou');
        } else {
            navigation.navigate('Main');
        }
    };

    useEffect(() => {
        console.log('route.name', route.name);
    }, [route.name]);


    return (
        <View style={[styles.streamListHeader, themeStyles[theme].streamListHeader]} >
            {/* header top */}
            <View style={styles.streamListHeaderTop}>
                <TouchableOpacity onPress={handleLogoPress}>
                    <Image
                        source={require('../../assets/images/logo_ziggsta_hor.png')}
                        style={styles.streamHeaderLeftImg}
                        resizeMode="contain"
                    />
                </TouchableOpacity>
                <View style={styles.streamHeaderRightBox}>
                    <TouchableOpacity onPress={() => navigation.navigate('WalletDashboard')} style={styles.streamHeaderCountBox}>
                        <Image
                            source={require('../../assets/images/icons/icon_z.png')}
                            style={{ width: 26, height: 26 }}
                            resizeMode="contain"
                        />
                        <Text style={styles.streamHeaderCountTitle}> {Number(profileData?.CreditBalance ?? 0).toFixed(0)}</Text>
                    </TouchableOpacity>
                    {/* <TouchableOpacity style={{ marginRight: 12 }}>
                            <Ionicons name='notifications' solid size={18} color={theme === 'light' ? '#000' : '#fff'} />
                        </TouchableOpacity> */}
                </View>
            </View>
            {route.name === 'Main' && (
                <View style={styles.streamListHeaderBottom}>
                    {/* Left Fixed Icon */}
                    <TouchableOpacity
                        onPress={handleClearFilter}
                        style={[
                            styles.strHeaderFixedIcon,
                            {
                                paddingHorizontal: getselectcategory?.length === 0 ? 3 : 8
                            }
                        ]}>
                        {(
                            <View
                                style={{
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
                        <TouchableOpacity
                            onPress={() => {
                                setIsNearBy(!isNearBy);
                                setHeaderMainTab('foryou');
                            }}
                            style={[
                                styles.strHeaderCategoryButton,
                                {
                                    marginLeft: headerMainTab === 'foryou' && 2,
                                },
                                themeStyles[theme].strHeaderCategoryButton,
                                isNearBy &&
                                styles.btnInterestActive,
                            ]}
                        >
                            <Text style={[
                                styles.strHeaderCategoryText,
                                themeStyles[theme].strHeaderCategoryText,
                                isNearBy && styles.btnInterestActiveText
                            ]}>
                                Nearby
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => {
                                setVisibleModal('category');
                                setHeaderMainTab('foryou');
                            }}
                            style={[
                                styles.strHeaderCategoryButton,
                                themeStyles[theme].strHeaderCategoryButton,
                                getselectcategory?.length > 0 &&
                                styles.btnInterestActive,
                            ]}>
                            <Text
                                style={[
                                    styles.strHeaderCategoryText,
                                    themeStyles[theme].strHeaderCategoryText,
                                    getselectcategory?.length > 0 && styles.btnInterestActiveText]}
                            >
                                Categories
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleConnect}
                            style={[
                                styles.strHeaderCategoryButton,
                                themeStyles[theme].strHeaderCategoryButton,
                            ]}>
                            <Text
                                style={[
                                    styles.strHeaderCategoryText,
                                    themeStyles[theme].strHeaderCategoryText,
                                ]}>
                                Connect
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => {
                                handleToggleLiked();
                            }}
                            style={[
                                styles.strHeaderCategoryButton,
                                themeStyles[theme].strHeaderCategoryButton,
                                isFavourite &&
                                styles.btnInterestActive,
                            ]}>
                            <Text
                                style={[
                                    styles.strHeaderCategoryText,
                                    themeStyles[theme].strHeaderCategoryText,
                                    isFavourite && styles.btnInterestActiveText,
                                ]}>
                                Favourites
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleConnect}
                            style={[
                                styles.strHeaderCategoryButton,
                                themeStyles[theme].strHeaderCategoryButton,
                            ]}>
                            <Text
                                style={[
                                    styles.strHeaderCategoryText,
                                    themeStyles[theme].strHeaderCategoryText,
                                ]}>
                                Events
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleLeaderBoards}
                            style={[
                                styles.strHeaderCategoryButton,
                                themeStyles[theme].strHeaderCategoryButton,
                                headerMainTab === 'leaderboards' &&
                                styles.btnInterestActive]}
                        >
                            <Text
                                style={[
                                    styles.strHeaderCategoryText,
                                    themeStyles[theme].strHeaderCategoryText,
                                    headerMainTab === 'leaderboards' && styles.btnInterestActiveText,
                                ]}>
                                Leaderboard
                            </Text>
                        </TouchableOpacity>
                    </ScrollView>}
                    {/* Right Fixed Icon */}
                    {/* <TouchableOpacity style={styles.strHeaderFixedIcon} onPress={() => setVisibleModal('search')}>
                            <Ionicons name="search" size={20} color="#d93a63" />
                        </TouchableOpacity> */}
                    <TouchableOpacity
                        style={styles.strHeaderFixedIcon}
                        onPress={() => setVisibleModal('location-change')}
                    >
                        <Ionicons name="location" size={21} color="#d93a63" />
                    </TouchableOpacity>
                </View>
            )
            }
            <LinearGradient
                colors={theme === 'light' ? ['rgba(0, 0, 0, 0.05)', 'transparent'] : ['rgba(27, 27, 27, 0.69)', 'transparent']}
                style={styles.bottomShadow}
            />
            {/* ----------------------- MODALS ----------------------- */}
            <View pointerEvents="box-none" style={{ position: 'absolute', zIndex: 9999 }}>

                {visibleModal === 'category' && (
                    <CategoriesModal
                        visible={visibleModal === 'category'}
                        onClose={() => setVisibleModal(null)}
                        categoryData={categoryData}
                        getselectcategory={getselectcategory}
                        setGetselectcategory={setGetselectcategory}
                    />
                )}

                {visibleModal === 'location-change' && (
                    <LocationChangeModal
                        visible={visibleModal === 'location-change'}
                        onClose={() => setVisibleModal(null)}
                    />
                )}

                {visibleModal === 'message-modal' && (
                    <MessageModal
                        visible={visibleModal === 'message-modal'}
                        message={message}
                        onClose={() => setVisibleModal(null)}
                    />
                )}
            </View>
        </View>

    );
};
