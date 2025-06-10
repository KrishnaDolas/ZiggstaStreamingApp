import React, { useContext, useState } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    ScrollView,
    StatusBar,
    TextInput,
    Modal
} from 'react-native';
import { styles } from '../../assets/styles/ThemeStyles';
import ImmersiveMode from 'react-native-immersive';
import { ThemeContext } from '../context/ThemeContext';
import LinearGradient from 'react-native-linear-gradient';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
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

export const StreamListHeader = ({setGetselectcategory}) => {
    const { theme } = useContext(ThemeContext);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [selectedset, setSelectedset] = useState([]); // State to track selected category
    const [selectedinterest, setSelectedinterest] = useState([]); // State to track selected interest
    const toggleFullscreen = () => {
        if (isFullScreen) {
            StatusBar.setHidden(false, 'fade');
            ImmersiveMode.off(); // Exit immersive mode
        } else {
            StatusBar.setHidden(true, 'fade');
            ImmersiveMode.on(); // Enter immersive mode (hides bottom nav too)
        }

        setIsFullScreen(!isFullScreen);
    };
    const selectedcategory = (category) => {
        if (selectedset.includes(category)) {
            const newSelectedSet = selectedset.filter(item => item !== category);
            setGetselectcategory(newSelectedSet); 
            setSelectedset(newSelectedSet); // Update the selectedset state
        } else {
            const newSelectedSet = [...selectedset, category];
            setSelectedset(newSelectedSet); // Update the selectedset state
            setGetselectcategory(newSelectedSet);
        }
        // Log the index and selected category
        const value= categoryData[category] || 'Unknown Category';
        if(!selectedinterest.includes(value)) { // Check if the value is already selected
        setSelectedinterest((values)=>[...values,value]); // Update the selected interest state
        }else{
            const newSelectedInterest = selectedinterest.filter(item => item !== value);
            setSelectedinterest(newSelectedInterest); // Update the selected interest state
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
                    <TouchableOpacity style={{ marginRight: 16 }} onPress={toggleFullscreen}>
                        <SimpleLineIcons name='size-fullscreen' size={18} color="#fff" />
                    </TouchableOpacity>
                    <View style={styles.streamHeaderCountBox}>
                        <Ionicons name='aperture' solid size={16} color="#fff" />
                        <Text style={styles.streamHeaderCountTitle}>2125</Text>
                    </View>
                    <View style={styles.streamHeaderCountBox}>
                        <Ionicons name='star' solid size={16} color="#fff" />
                        <Text style={styles.streamHeaderCountTitle}>2125</Text>
                    </View>
                    <TouchableOpacity style={{ marginRight: 12 }}>
                        <Ionicons name='notifications' solid size={18} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>
            <View style={styles.streamListHeaderBottom}>
                {/* Left Fixed Icon */}
                <TouchableOpacity style={styles.strHeaderFixedIcon}>
                    <FontAwesome5 name="crown" size={18} color="#fff" />
                </TouchableOpacity>

                {/* Scrollable Category Buttons */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.strHeaderScrollCategoryContainer}
                >
                    {categoryData.map((category, index) => (
                        <TouchableOpacity key={index} style={[styles.strHeaderCategoryButton,
                        selectedinterest.includes(category) &&
                        styles.btnInterestActive,]}
                        onPress={() => selectedcategory(index)}>
                        <Text style={styles.strHeaderCategoryText}>{category}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Right Fixed Icon */}
                <TouchableOpacity style={styles.strHeaderFixedIcon} onPress={() => setShowSearch(true)}>
                    <Ionicons name="search" size={20} color="#fff" />
                </TouchableOpacity>
            </View>

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
