import React, { useContext, useEffect, useState } from 'react';
import { View, TouchableOpacity, Text, ScrollView, Alert, Animated, TextInput, StyleSheet } from 'react-native';
import Modal from 'react-native-modal';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { themeStyles } from '../../assets/styles/ThemeStyles';
import Apiclient from '../utils/Apiclient';
import { ThemeContext } from '../context/ThemeContext';
import Icon from 'react-native-vector-icons/Ionicons';
const ReportUserModal = ({ visible, onClose, userData }) => {
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
            // const reportData = {
            //   categoryId: selectedSubCategory?.id || selectedMainCategory?.id,
            //   description: description.trim(),
            //   reportedUserId: reportedUser.id
            // };

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
                    styles.reportCategoryCard,
                    selectedMainCategory?.id === category.id && styles.reportSelectedCategoryCard,
                ]}
                onPress={() => handleMainCategorySelect(category)}
                activeOpacity={0.8}
            >
                <View style={styles.reportCategoryContent}>
                    <Text style={[
                        styles.reportCategoryTitle,
                        selectedMainCategory?.id === category.id && styles.reportSelectedCategoryTitle,
                    ]}>
                        {category.title}
                    </Text>
                    <View style={styles.reportCategoryIconContainer}>
                        <Icon
                            name={selectedMainCategory?.id === category.id ? "chevron-down" : "chevron-forward"}
                            size={20}
                            color={selectedMainCategory?.id === category.id ? "#fff" : "#666"}
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
                <Text style={styles.reportSubCategoryHeader}>Select specific issue:</Text>
                {selectedMainCategory.children.map((subCategory) => (
                    <TouchableOpacity
                        key={subCategory.id}
                        style={[
                            styles.reportSubCategoryCard,
                            selectedSubCategory?.id === subCategory.id && styles.reportSelectedSubCategoryCard,
                        ]}
                        onPress={() => handleSubCategorySelect(subCategory)}
                        activeOpacity={0.8}
                    >
                        <View style={styles.reportSubCategoryContent}>
                            <View style={styles.reportRadioButton}>
                                {selectedSubCategory?.id === subCategory.id && (
                                    <View style={styles.radioButtonInner} />
                                )}
                            </View>
                            <Text style={[
                                styles.subCategoryTitle,
                                selectedSubCategory?.id === subCategory.id && styles.selectedSubCategoryTitle,
                            ]}>
                                {subCategory.title}
                            </Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </Animated.View>
        );
    };

    if (loading) {
        return (
            <View style={styles.reportLoadingContainer}>
                <Text style={styles.reportLoadingText}>Loading categories...</Text>
            </View>
        );
    }



    const showDescription =
        selectedSubCategory ||
        (selectedMainCategory && !selectedMainCategory.children?.length);

    const showSubmitButton = showDescription && description.trim();


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
                <View style={[styles.fullScreenModalOverlay, { flex: 1 }]}>
                    <View style={[styles.profileSettingModalBody, { flex: 1 }]}>
                        <View style={{ flexDirection: "row", justifyContent: 'flex-end', marginBottom: 5 }}>
                            <TouchableOpacity onPress={onClose} style={[styles.modalCloseBtn]}>
                                <Ionicons name="close" size={28} color="#fff" />
                            </TouchableOpacity>
                        </View>

                        {isModalRendered && (
                            <>
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
                                            <Text style={styles.reportSectionTitle}>What's the issue?</Text>
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
                                                <Icon name="arrow-back" size={20} color="#fff" style={{ marginRight: 8 }} />
                                                <Text style={{ fontSize: 18, fontWeight: '600', color: '#fff' }}>
                                                    {selectedMainCategory.title}
                                                </Text>
                                            </TouchableOpacity>
                                            {/* Show Subcategories only when MainCategory has children */}
                                            {selectedMainCategory?.children?.length > 0 && renderSubCategories()}

                                            {showDescription && (
                                                <Animated.View
                                                    style={[
                                                        styles.descriptionSection,
                                                        {
                                                            opacity: fadeAnim,
                                                            transform: [{ translateY: slideAnim }],
                                                        },
                                                    ]}
                                                >
                                                    <Text style={styles.descriptionLabel}>Describe what happened</Text>
                                                    <TextInput
                                                        style={styles.descriptionInput}
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

                                            {showSubmitButton && (
                                                <Animated.View
                                                    style={[
                                                        styles.submitSection,
                                                        {
                                                            opacity: fadeAnim,
                                                            transform: [{ translateY: slideAnim }],
                                                        },
                                                    ]}
                                                >
                                                    <TouchableOpacity
                                                        style={styles.submitButton}
                                                        onPress={handleSubmitReport}
                                                        activeOpacity={0.8}
                                                    >
                                                        <Text style={styles.submitButtonText}>Submit Report</Text>
                                                        <Icon name="send" size={20} color="#fff" style={styles.submitIcon} />
                                                    </TouchableOpacity>
                                                </Animated.View>
                                            )}
                                        </Animated.View>)}

                                </ScrollView>
                            </>
                        )}

                    </View>
                </View>
            </Modal>
        </>
    );
};


const styles = StyleSheet.create({
    fullScreenModalOverlay: {
        padding: 10,
        backgroundColor: '#0f0f0f',

    },
    fullScreenModalMain: {
        justifyContent: 'start',
        margin: 0,
    },
    reportLoadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0f0f0f',
    },
    reportLoadingText: {
        color: '#fff',
        fontSize: 16,
    },
    reportUserInfoCard: {
        backgroundColor: '#0f0f0f',
        borderRadius: 16,
        // paddingHorizontal: 2,
        paddingTop: 10,
        marginBottom: 24,
    },
    reportUserInfoContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    reportUserDetails: {
        flex: 1,
    },
    reportUserName: {
        fontSize: 20,
        fontWeight: '700',
        color: '#d93a63',
    },
    reportCategoriesSection: {
        marginBottom: 24,
    },
    reportSectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 16,
    },
    reportCategoriesContainer: {
        gap: 12,
    },
    reportCategoryCard: {
        backgroundColor: '#1a1a1a',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#333',
    },
    reportSelectedCategoryCard: {
        backgroundColor: '#ff4757',
        borderColor: '#ff4757',
    },
    reportCategoryContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    reportCategoryTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: '#fff',
        flex: 1,
    },
    reportSelectedCategoryTitle: {
        color: '#fff',
    },
    reportCategoryIconContainer: {
        marginLeft: 12,
    },
    reportSubCategoriesContainer: {
        marginBottom: 24,
    },
    reportSubCategoryHeader: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 16,
    },
    reportSubCategoryCard: {
        backgroundColor: '#1a1a1a',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#333',
    },
    reportSelectedSubCategoryCard: {
        backgroundColor: '#2a2a2a',
        borderColor: '#ff4757',
    },
    reportSubCategoryContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    reportRadioButton: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#666',
        marginRight: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioButtonInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#ff4757',
    },
    subCategoryTitle: {
        fontSize: 16,
        color: '#fff',
        flex: 1,
    },
    selectedSubCategoryTitle: {
        color: '#fff',
    },
    descriptionSection: {
        marginBottom: 32,
    },
    descriptionLabel: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 12,
    },
    descriptionInput: {
        backgroundColor: '#1a1a1a',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: '#fff',
        minHeight: 120,
        borderWidth: 1,
        borderColor: '#333',
    },
    submitSection: {
        marginBottom: 40,
    },
    submitButton: {
        backgroundColor: '#ff4757',
        borderRadius: 12,
        padding: 18,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#ff4757',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    submitButtonText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
        marginRight: 8,
    },
    submitIcon: {
        marginLeft: 4,
    },
});

export default ReportUserModal;
