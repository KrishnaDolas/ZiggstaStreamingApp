/* eslint-disable react-native/no-inline-styles */
import React, { useContext, useEffect, useState } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import Modal from 'react-native-modal';
import { styles } from '../../assets/styles/ThemeStyles';
import { Dimensions, ScrollView } from 'react-native';
import { ThemeContext } from '../context/ThemeContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Colors from '../../assets/styles/Colors';
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


    useEffect(() => {
        console.log('getselectcategory', getselectcategory);
    }, [getselectcategory]);

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
                }}>
                    {/* close modal */}
                    <TouchableOpacity onPress={onClose} style={[styles.profileModalClose, { marginBottom: 5 }]}>
                        <Ionicons name="close" size={28} color={theme === 'light' ? '#333' : '#fff'} />
                    </TouchableOpacity>
                    <View style={[styles.mySettingSubModalTitleBox]}>
                        <Text style={{ fontSize: 20, marginLeft: 10, fontWeight: '500', color: theme === 'light' ? '#000' : '#fff' }}>Categories</Text>
                    </View>
                    <View style={[styles.profileSettingModalBody, { height: screenHeight * 0.6 - 40, marginTop: 10 }]}>
                        <ScrollView contentContainerStyle={{ alignItems: 'center', justifyContent: 'center', paddingBottom: 30 }}>
                            <View style={styles.modalCategoryContainer}>
                                {categoryData.map((item, index) => {
                                    return (
                                        <TouchableOpacity
                                            key={item.categoryID}
                                            onPress={() => selectedcategory(item)}
                                            style={[
                                                styles.modalCategoryButton,
                                                selectedinterest.includes(item.categoryID) && styles.modalCategoryButtonActive, // Apply selected style
                                            ]}
                                        >
                                            <Text style={styles.modalCategoryText}>{item.categoryName}</Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                            {/* Confirm Button */}
                            <TouchableOpacity
                                onPress={handleSend}
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
                                    marginTop: 25,
                                }}
                            // onPress={handleUpdateInterests}
                            >
                                <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Ok</Text>
                            </TouchableOpacity>
                        </ScrollView>

                    </View>
                </View>
            </Modal>
        </>
    );
};

export default CategoriesModal;