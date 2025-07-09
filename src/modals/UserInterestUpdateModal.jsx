/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, Text, Image, ActivityIndicator } from 'react-native';
import Modal from 'react-native-modal';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { styles } from '../../assets/styles/ThemeStyles';
import { Dimensions, ScrollView } from 'react-native';
import Apiclient from '../utils/Apiclient';
import { SendErrorTotheServer } from '../utils/constant';
import { useAppContext } from '../context/AppContext';
const screenHeight = Dimensions.get('window').height;

const UserInterestUpdateModal = ({ visible, onClose }) => {
    const { userData } = useAppContext();
    const [categoryData, setCategoryData] = useState([]);
    const [userInterestData, setUserInterestData] = useState([]);
    const [iscategoryLoading, setIsCategoryLoading] = useState(false);
    const [selectedInterestIds, setSelectedInterestIds] = useState([]);


    // Function to fetch categories from the API
    useEffect(() => {
        const getCategoryData = async () => {
            try {
                setIsCategoryLoading(true);
                const response = await Apiclient.post('/getcategories');
                console.log('getcategories response', response.data);
                if (response?.data?.categories) {
                    setCategoryData(response.data.categories);
                }
            } catch (error) {
                console.error('Error fetching get categories:', error);
                SendErrorTotheServer(error, 'getCategoryData');
            } finally {
                setIsCategoryLoading(false);
            }
        };
        getCategoryData();
    }, []);


    useEffect(() => {
        console.log('selectedInterestIds', selectedInterestIds);
    }, [selectedInterestIds]);

    // Function to fetch categories from the API
    useEffect(() => {
        const getUserInterestData = async () => {
            try {
                const postData = {
                    userID: userData.userid,
                }
                setIsCategoryLoading(true);
                const response = await Apiclient.post('/getUserInterests', postData);
                console.log('getUserInterests response', response.data);
                if (response?.data?.interests
                ) {
                    setUserInterestData(response.data.interests);
                    const ids = response.data.interests.map(item => item.CategoryID);
                    setSelectedInterestIds(ids); // pre-select user's interests
                }
            } catch (error) {
                console.error('Error fetching get user interest:', error);
                SendErrorTotheServer(error, 'getUserInterestData');
            } finally {
                setIsCategoryLoading(false);
            }
        };
        getUserInterestData();
    }, [userData.userid]);

    const toggleCategory = (id) => {
        setSelectedInterestIds((prev) => {
            if (prev.includes(id)) {
                return prev.filter(item => item !== id); // remove if already selected
            } else {
                return [...prev, id]; // add if not selected
            }
        });
    };

    return (
        <Modal
            isVisible={visible}
            onBackdropPress={onClose}
            animationIn="slideInRight"
            animationOut="slideOutLeft"
            animationInTiming={400}
            animationOutTiming={300}
            backdropOpacity={0}
            useNativeDriver={true}
            hardwareAccelerated={true}
            style={{
                margin: 0,
                justifyContent: 'flex-end',
                alignItems: 'flex-end',
            }}
        >
            <View style={{
                width: '100%', // like drawer
                backgroundColor: '#fff',
                padding: 16,
                shadowColor: '#000',
                shadowOffset: { width: -3, height: 0 },
                shadowOpacity: 0.15,
                shadowRadius: 6,
                elevation: 8,
            }}>
                {/* close modal */}
                <View style={[styles.mySettingSubModalTitleBox]}>
                    <TouchableOpacity style={styles.mySettingSubModalClose} onPress={onClose}>
                        <FontAwesome name="angle-left" size={30} color="#d93a63" />
                    </TouchableOpacity>
                    <Text style={styles.mySettingSubModalTitle}>Update Interest</Text>
                </View>
                <View style={[styles.profileSettingModalBody, { height: screenHeight * 0.6 - 40 }]}>
                    <ScrollView contentContainerStyle={{ alignItems: 'center', justifyContent: 'center', paddingBottom: 30 }}>
                        <View style={styles.modalCategoryContainer}>
                            {iscategoryLoading ? (
                                /* 👇 Loader while data is coming in */
                                <View style={{ flex: 1, marginVertical: 120 }}>
                                    <ActivityIndicator size="large" />
                                </View>
                            ) : (categoryData.map((category, index) => {
                                const isSelected = selectedInterestIds.includes(category.categoryID);
                                return (
                                    <TouchableOpacity
                                        key={category.categoryID}
                                        onPress={() => toggleCategory(category.categoryID)}
                                        style={[
                                            styles.modalCategoryButton,
                                            isSelected && styles.modalCategoryButtonActive, // Apply selected style
                                        ]}
                                    >
                                        <Text style={styles.modalCategoryText}>{category.categoryName}</Text>
                                    </TouchableOpacity>
                                );
                            }))}
                        </View>
                        {/* Confirm Button */}
                        {!iscategoryLoading && (
                            <TouchableOpacity
                                style={{
                                    backgroundColor: '#d93a63',
                                    paddingVertical: 12,
                                    paddingHorizontal: 30,
                                    borderRadius: 25,
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.2,
                                    shadowRadius: 4,
                                    elevation: 5,
                                    marginTop: 20,
                                }}
                                onPress={() => {
                                    onClose();
                                }}
                            >
                                <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Save</Text>
                            </TouchableOpacity>
                        )}
                    </ScrollView>

                </View>
            </View>
        </Modal>
    );
};

export default UserInterestUpdateModal;