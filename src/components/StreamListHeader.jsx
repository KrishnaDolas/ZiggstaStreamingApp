import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    ScrollView,
    TextInput,
    Modal,
    Animated
} from 'react-native';
import { styles } from '../../assets/styles/ThemeStyles';
import LinearGradient from 'react-native-linear-gradient';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useRoute } from '@react-navigation/native';
import Apiclient from '../utils/Apiclient';
// const categoryData = [
//     'Art & Music',
//     'Entertainment & Gaming',
//     'Family & Parenting',
//     'Fashion & Shopping',
//     'Food & Cooking',
//     'Health & Fitness',
//     'Hobbies & Activities',
//     'News & Politics',
//     'Religion & Spiritual',
//     'Sports & Adventure',
//     'Travel & Holidays',
// ];

export const StreamListHeader = ({ setGetselectcategory, userData }) => {
    const route = useRoute();
    const [showSearch, setShowSearch] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [selectedset, setSelectedset] = useState([]); // State to track selected category
    const [categoryData, setCategoryData] = useState([]);
    const [selectedinterest, setSelectedinterest] = useState([]); // State to track selected interest
    const [isLiked, setIsLiked] = useState(true);
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handleToggleLiked = () => {
        setIsLiked(!isLiked);
    };

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(scaleAnim, {
                    toValue: 1.2,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(scaleAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);


    // Function to fetch user interest from the API
    const getInterestData = async () => {
        try {
            const formData = {
                userID: userData?.userid,
            };
            const response = await Apiclient.post('/getUserInterests', formData);
            if (response?.data?.interests) {
                setCategoryData(response.data.interests);
            }
        } catch (error) {
            console.error('Error fetching interest:', error);
        }
    };

    useEffect(() => {
        getInterestData();
    }, []);



    const selectedcategory = (item) => {
        const isSelected = selectedinterest.includes(item.CategoryID);
        if (isSelected) {
            const updated = selectedinterest.filter(id => id !== item.CategoryID);
            setSelectedinterest(updated);
            setGetselectcategory(updated);
        } else {
            const updated = [...selectedinterest, item.CategoryID];
            setSelectedinterest(updated);
            setGetselectcategory(updated);
        }
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
                    <View style={styles.streamHeaderCountBox}>
                        <Ionicons name='eye-outline' solid size={16} color="#fff" />
                        <Text style={styles.streamHeaderCountTitle}>245</Text>
                    </View>
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
                            {isLiked ? (
                                <Ionicons name="heart-sharp" size={22} color="#d93a63" />
                            ) : (
                                <Ionicons name="heart-outline" size={22} color="#d93a63" />
                            )}
                        </Animated.View>
                    </TouchableOpacity>
                    {/* Scrollable Category Buttons */}
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.strHeaderScrollCategoryContainer}
                    >
                        {categoryData.map((item) => (
                            <TouchableOpacity key={item.CategoryID} style={[styles.strHeaderCategoryButton,
                            selectedinterest.includes(item.CategoryID) &&
                            styles.btnInterestActive]}
                                onPress={() => selectedcategory(item)}>
                                <Text style={[
                                    styles.strHeaderCategoryText,
                                    selectedinterest.includes(item.CategoryID) && styles.btnInterestActiveText
                                ]}>
                                    {item.CategoryName}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {/* Right Fixed Icon */}
                    <TouchableOpacity style={styles.strHeaderFixedIcon} onPress={() => setShowSearch(true)}>
                        <Ionicons name="search" size={20} color="#d93a63" />
                    </TouchableOpacity>
                </View>
            )}
            {/* Search Modal */}
            {showSearch && (
                <Modal visible={showSearch} transparent animationType="fade">
                    <View style={[styles.strHedSearchModalOverlay]}>
                        <View style={[styles.strHedSearchModalCard]}>
                            <View style={{ flexDirection: "row", justifyContent: 'flex-end', marginBottom: 14 }}>
                                <TouchableOpacity
                                    onPress={() => setShowSearch(false)}
                                    style={[styles.strHedSearchModalCloseBtn]}
                                >
                                    <Ionicons name="close" size={14} color="#fff" />
                                </TouchableOpacity>
                            </View>
                            <View style={[styles.strHedSearchModalForm]}>
                                <TextInput
                                    placeholder="Search Categories"
                                    placeholderTextColor="#888"
                                    value={searchText}
                                    onChangeText={setSearchText}
                                    style={[styles.strHedSearchModalInput]}
                                />
                                <TouchableOpacity>
                                    <LinearGradient
                                        colors={['rgba(184, 58, 243, 1)', 'rgba(105, 80, 251, 1)']}
                                        start={{ x: 0.15, y: 1 }}
                                        end={{ x: 1, y: 0 }}
                                        style={styles.strHedSearchModalSearchBtn}
                                    >
                                        <Text style={{ color: '#fff', fontSize: 16, fontWeight: '400' }}>Search</Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            )}

        </View>

    );
};
