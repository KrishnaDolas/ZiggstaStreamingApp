import React, { useContext, useEffect, useState } from 'react';
import { View, TouchableOpacity, Text, ScrollView, Alert, Animated, TextInput, StyleSheet, ActivityIndicator } from 'react-native';
import Modal from 'react-native-modal';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { styles, themeStyles } from '../../assets/styles/ThemeStyles';
import Apiclient from '../utils/Apiclient';
import { ThemeContext } from '../context/ThemeContext';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAppContext } from '../context/AppContext';
const ReportUserModal = ({ visible, onClose, reportData }) => {
    const { userData } = useAppContext();
    const { theme } = useContext(ThemeContext);
    const [isModalRendered, setIsModalRendered] = useState(false); // prevent content shifts
    const [categories, setCategories] = useState([]);
    const [selectedMainCategory, setSelectedMainCategory] = useState(null);
    const [selectedSubCategory, setSelectedSubCategory] = useState(null);
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(true);
    const [fadeAnim] = useState(new Animated.Value(0));
    const [slideAnim] = useState(new Animated.Value(50));

    useEffect(() => {
        fetchCategories();
        // Animate screen entrance
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 600,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await Apiclient.post('/flagReporting/getFlagCategories');
            if (response.data.success) {
                setCategories(response.data.data);
            } else {
                Alert.alert('Error', 'Failed to load categories');
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            Alert.alert('Error', 'Failed to load categories');
        } finally {
            setLoading(false);
        }
    };

    const handleMainCategorySelect = (category) => {
        setSelectedMainCategory(category);
        setSelectedSubCategory(null);
    };

    const handleSubCategorySelect = (subCategory) => {
        setSelectedSubCategory(subCategory);
    };

    const handleSubmitReport = async () => {
        if (!selectedSubCategory && !selectedMainCategory) {
            Alert.alert('Error', 'Please select a category');
            return;
        }

        if (!description.trim()) {
            Alert.alert('Error', 'Please describe what happened');
            return;
        }

        try {
            // Here you would make your API call to submit the report
            const payload = {
                category_id: selectedSubCategory?.id || selectedMainCategory?.id,
                details: description.trim(),
                reported_user_id: reportData.userid,
                user_id: userData.userid, // Assuming userData contains the current user's ID
                video_id: '',
            };
            console.log('Submitting report with data:', payload);

            Alert.alert(
                'Report Submitted',
                'Thank you for your report. We will review it and take appropriate action.',
                [
                    {
                        text: 'OK',
                        onPress: () => onClose(),
                    },
                ]
            );
        } catch (error) {
            console.error('Error submitting report:', error);
            Alert.alert('Error', 'Failed to submit report. Please try again.');
        }
    };

    const renderMainCategories = () => {
        return categories.map((category) => (
            <TouchableOpacity
                key={category.id}
                style={[
                    styles.reportCategoryCard, themeStyles[theme].reportCategoryCard,
                    selectedMainCategory?.id === category.id && styles.reportSelectedCategoryCard,
                ]}
                onPress={() => handleMainCategorySelect(category)}
                activeOpacity={0.8}
            >
                <View style={styles.reportCategoryContent}>
                    <Text style={[
                        styles.reportCategoryTitle, themeStyles[theme].reportCategoryTitle,
                        selectedMainCategory?.id === category.id && styles.reportSelectedCategoryTitle,
                    ]}>
                        {category.title}
                    </Text>
                    <View style={styles.reportCategoryIconContainer}>
                        <Icon
                            name={selectedMainCategory?.id === category.id ? "chevron-down" : "chevron-forward"}
                            size={16}
                            color={
                                selectedMainCategory?.id === category.id
                                    ? '#fff'
                                    : (theme === 'dark' ? '#fff' : '#000')
                            }
                        />
                    </View>
                </View>
            </TouchableOpacity>
        ));
    };

    const renderSubCategories = () => {
        if (!selectedMainCategory || !selectedMainCategory.children?.length) return null;

        return (
            <Animated.View
                style={[
                    styles.reportSubCategoriesContainer,
                    {
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }],
                    },
                ]}
            >
                <Text style={[styles.reportSubCategoryHeader, themeStyles[theme].reportSubCategoryHeader]}>Select specific issue:</Text>
                {selectedMainCategory.children.map((subCategory) => (
                    <TouchableOpacity
                        key={subCategory.id}
                        style={[
                            styles.reportSubCategoryCard, themeStyles[theme].reportSubCategoryCard,
                            selectedSubCategory?.id === subCategory.id && styles.reportSelectedSubCategoryCard, selectedSubCategory?.id === subCategory.id && themeStyles[theme].reportSelectedSubCategoryCard,
                        ]}
                        onPress={() => handleSubCategorySelect(subCategory)}
                        activeOpacity={0.8}
                    >
                        <View style={styles.reportSubCategoryContent}>
                            <View style={styles.reportRadioButton}>
                                {selectedSubCategory?.id === subCategory.id && (
                                    <View style={styles.reportRadioButtonInner} />
                                )}
                            </View>
                            <Text style={[
                                styles.reportSubCategoryTitle, themeStyles[theme].reportSubCategoryTitle,
                                // selectedSubCategory?.id === subCategory.id && styles.reportSelectedSubCategoryTitle,
                            ]}>
                                {subCategory.title}
                            </Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </Animated.View>
        );
    };

    const showDescription =
        selectedSubCategory ||
        (selectedMainCategory && !selectedMainCategory.children?.length);

    // const showSubmitButton = showDescription && description.trim();


    return (
        <>
            <Modal
                isVisible={visible}
                onBackdropPress={onClose}
                onModalShow={() => setIsModalRendered(true)}
                onModalHide={() => setIsModalRendered(false)}
                animationIn="slideInUp"
                animationOut="slideOutDown"
                animationInTiming={400}
                animationOutTiming={300}
                backdropOpacity={0}
                useNativeDriver={true}
                style={styles.fullScreenModalMain}
            >
                <View style={[styles.fullScreenModalOverlay, themeStyles[theme].fullScreenModalOverlay, { flex: 1 }]}>
                    <View style={[styles.profileSettingModalBody, { flex: 1 }]}>
                        <View style={{ flexDirection: "row", justifyContent: 'flex-end', marginBottom: 5 }}>
                            <TouchableOpacity onPress={onClose} style={[styles.modalCloseBtn]}>
                                <Ionicons name="close" size={28} color={theme === 'dark' ? '#fff' : '#000'} />
                            </TouchableOpacity>
                        </View>

                        {isModalRendered && (
                            <>
                                {loading ? (
                                    <View style={[styles.reportLoadingContainer, themeStyles[theme].reportLoadingContainer]}>
                                        <ActivityIndicator size="large" />
                                        <Text style={{
                                            color: theme === 'dark' ? '#fff' : '#000',
                                            fontSize: 16,
                                            marginTop: 15,
                                        }}>Loading categories...</Text>
                                    </View>) : (
                                    <ScrollView
                                        contentContainerStyle={{ paddingTop: 10, paddingBottom: 100 }}
                                        showsVerticalScrollIndicator={false}
                                        initialNumToRender={5}
                                        removeClippedSubviews={false}
                                    >
                                        <Animated.View
                                            style={[
                                                styles.reportUserInfoCard,
                                                {
                                                    opacity: fadeAnim,
                                                    transform: [{ translateY: slideAnim }],
                                                },
                                            ]}
                                        >
                                            <View style={styles.reportUserInfoContent}>
                                                <View style={styles.reportUserDetails}>
                                                    {/* <Text style={styles.reportUserName}>{reportedUser.name}</Text> */}
                                                    <Text style={styles.reportUserName}>Why are you reporting this person?</Text>
                                                </View>
                                            </View>
                                        </Animated.View>
                                        {!selectedMainCategory && (
                                            <Animated.View
                                                style={[
                                                    styles.reportCategoriesSection,
                                                    {
                                                        opacity: fadeAnim,
                                                        transform: [{ translateY: slideAnim }],
                                                    },
                                                ]}
                                            >
                                                <Text style={[styles.reportSectionTitle, themeStyles[theme].reportSectionTitle]}>What's the issue?</Text>
                                                <View style={styles.reportCategoriesContainer}>
                                                    {renderMainCategories()}
                                                </View>
                                            </Animated.View>
                                        )}


                                        {selectedMainCategory && (
                                            <Animated.View
                                                style={[
                                                    styles.reportCategoriesSection,
                                                    {
                                                        opacity: fadeAnim,
                                                        transform: [{ translateY: slideAnim }],
                                                    },
                                                ]}
                                            >
                                                <TouchableOpacity
                                                    onPress={() => {
                                                        setSelectedMainCategory(null);
                                                        setSelectedSubCategory(null);
                                                    }}
                                                    style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}
                                                >
                                                    <Icon name="arrow-back" size={20} color={theme === 'dark' ? '#fff' : '#000'} style={{ marginRight: 8 }} />
                                                    <Text style={{ fontSize: 18, fontWeight: '600', color: theme === 'dark' ? '#fff' : '#000' }}>
                                                        {selectedMainCategory.title}
                                                    </Text>
                                                </TouchableOpacity>
                                                {/* Show Subcategories only when MainCategory has children */}
                                                {selectedMainCategory?.children?.length > 0 && renderSubCategories()}

                                                {showDescription && (
                                                    <Animated.View
                                                        style={[
                                                            styles.reportDescriptionSection,
                                                            {
                                                                opacity: fadeAnim,
                                                                transform: [{ translateY: slideAnim }],
                                                            },
                                                        ]}
                                                    >
                                                        <Text style={[styles.reportDescriptionLabel, themeStyles[theme].reportDescriptionLabel]}>Describe what happened</Text>
                                                        <TextInput
                                                            style={[styles.reportDescriptionInput, themeStyles[theme].reportDescriptionInput]}
                                                            multiline
                                                            numberOfLines={4}
                                                            value={description}
                                                            onChangeText={setDescription}
                                                            placeholder="Please provide details about the issue..."
                                                            placeholderTextColor="#999"
                                                            textAlignVertical="top"
                                                        />
                                                    </Animated.View>
                                                )}

                                                <Animated.View
                                                    style={[
                                                        styles.reportSubmitSection,
                                                        {
                                                            opacity: fadeAnim,
                                                            transform: [{ translateY: slideAnim }],
                                                        },
                                                    ]}
                                                >
                                                    <TouchableOpacity
                                                        style={[
                                                            styles.reportSubmitButton,
                                                            { opacity: !description.trim() ? 0.6 : 1 }, // Disabled look
                                                        ]}
                                                        onPress={handleSubmitReport}
                                                        disabled={!description.trim()} // Disable press
                                                    >
                                                        <Text style={styles.reportSubmitButtonText}>Send Report</Text>
                                                    </TouchableOpacity>
                                                </Animated.View>
                                            </Animated.View>)}

                                    </ScrollView>
                                )}
                            </>
                        )}

                    </View>
                </View>
            </Modal>
        </>
    );
};

export default ReportUserModal;
