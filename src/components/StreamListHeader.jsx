import React, { useContext } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native';
import { styles, themeStyles } from '../../assets/styles/ThemeStyles';
import { ThemeContext } from '../context/ThemeContext';
import LinearGradient from 'react-native-linear-gradient';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

const categoryData = ['Art & Music', 'Food & Drink', 'Health & Fitness', 'News & Politics']

export const StreamListHeader = () => {
    const { theme } = useContext(ThemeContext);

    return (
        <LinearGradient style={styles.streamListHeader} colors={['#c300ff', '#c300ff']} >
            {/* header top */}
            <View style={styles.streamListHeaderTop}>
                <Image
                    source={require('../../assets/images/logo_ziggsta_hor.png')}
                    style={styles.streamHeaderLeftImg}
                    resizeMode="contain"
                />
                <View style={styles.streamHeaderRightBox}>
                    <TouchableOpacity style={{ marginRight: 12 }}>
                        <SimpleLineIcons name='size-fullscreen' size={14} color="#fff" />
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
                        <TouchableOpacity key={index} style={styles.strHeaderCategoryButton}>
                            <Text style={styles.strHeaderCategoryText}>{category}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Right Fixed Icon */}
                <TouchableOpacity style={styles.strHeaderFixedIcon}>
                    <Ionicons name="search" size={20} color="#fff" />
                </TouchableOpacity>
            </View>
        </LinearGradient>

    );
};
