/* eslint-disable react-native/no-inline-styles */
import React, { useContext, useEffect, useState } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import Modal from 'react-native-modal';
import { styles } from '../../assets/styles/ThemeStyles';
import { Dimensions, ScrollView } from 'react-native';
import { ThemeContext } from '../context/ThemeContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Colors from '../../assets/styles/Colors';
import LinearGradient from 'react-native-linear-gradient';
const screenHeight = Dimensions.get('window').height;

const CategoriesModal = ({ visible, onClose, categoryData, getselectcategory, setGetselectcategory }) => {
    const { theme } = useContext(ThemeContext);
    const [selectedinterest, setSelectedinterest] = useState([]); // State to track selected interest

    // Sync selectedinterest with previously selected categories when modal opens
    useEffect(() => {
        if (visible) {
            setSelectedinterest(getselectcategory || []);
        }
    }, [visible]);

    const selectedcategory = (item) => {
        const isSelected = selectedinterest.includes(item.categoryID);
        let updated;
        if (isSelected) {
            updated = selectedinterest.filter((id) => id !== item.categoryID);
        } else {
            updated = [...selectedinterest, item.categoryID];
        }
        setSelectedinterest(updated);
        // setGetselectcategory(updated); // Update StreamList's filteredRooms
    };

    const handleSend = () => {
        setGetselectcategory(selectedinterest); // Pass selection to parent
        onClose(); // Close modal
    };

    return (
        <>
            <Modal
                isVisible={visible}
                onBackdropPress={onClose}
                animationIn="slideInUp"
                animationOut="slideOutDown"
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
                    backgroundColor: theme === 'light' ? '#fff' : Colors.blackModalBgColor,
                    padding: 16,
                    shadowColor: '#000',
                    shadowOffset: { width: -3, height: 0 },
                    shadowOpacity: 0.15,
                    shadowRadius: 6,
                    elevation: 8,
                    paddingBottom: 5,
                }}>
                    {/* close modal */}
                    <TouchableOpacity onPress={onClose} style={[styles.profileModalClose, { marginBottom: 5 }]}>
                        <Ionicons name="close" size={28} color={theme === 'light' ? '#333' : '#fff'} />
                    </TouchableOpacity>
                    <View style={[styles.mySettingSubModalTitleBox, { paddingTop: 0 }]}>
                        <Text style={{ fontSize: 20, marginLeft: 10, fontWeight: '500', color: theme === 'light' ? '#000' : '#fff' }}>Categories</Text>
                    </View>
                    <View style={[
                        styles.profileSettingModalBody,
                        {
                            height: screenHeight * 0.6 - 40,
                        }]}>
                        <ScrollView
                            contentContainerStyle={{
                                alignItems: 'center',
                                justifyContent: 'center',
                                paddingBottom: 20,
                            }}
                            showsVerticalScrollIndicator={false}>
                            <View style={styles.modalCategoryContainer}>
                                {categoryData.map((item, index) => {
                                    return (
                                        <TouchableOpacity
                                            key={item.categoryID}
                                            onPress={() => selectedcategory(item)}
                                            style={[
                                                styles.categoryBtn,
                                                selectedinterest.includes(item.categoryID) && styles.categoryBtnActive, // Apply selected style
                                            ]}
                                        >
                                            <Text style={styles.modalCategoryText}>{item.categoryName}</Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </ScrollView>
                        {/* Confirm Button */}
                        <View
                            style={{
                                paddingVertical: 10,
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <TouchableOpacity
                                onPress={handleSend}
                                style={{
                                    borderRadius: 30,
                                    marginHorizontal: 7,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    overflow: 'hidden',
                                    width: 80,
                                    height: 40,
                                }}
                            // onPress={handleUpdateInterests}
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
                                    <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Ok</Text>
                                </LinearGradient>

                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </>
    );
};

export default CategoriesModal;