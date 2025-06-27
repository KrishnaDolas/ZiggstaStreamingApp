import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, Text, ScrollView } from 'react-native';
import Modal from 'react-native-modal';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { styles } from '../../assets/styles/ThemeStyles';
import BankAddModal from './BankAddModal';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const dummyData = [
    {
        id: 1,
        bankName: 'Bank Of India',
        accountNumber: '1234567890',
        ifscCode: 'BKID0001234',
        isPrimaryAccount: 'Y',
    },
    {
        id: 2,
        bankName: 'State Bank of India',
        accountNumber: '9876543210',
        ifscCode: 'SBIN0005678',
        isPrimaryAccount: 'N',
    },
    // {
    //     id: 3,
    //     bankName: 'State Bank of India',
    //     accountNumber: '9876543210',
    //     ifscCode: 'SBIN0005678',
    //     isPrimaryAccount: 'Y',
    // },
];

const BankDetailsModal = ({ visible, onClose, userData }) => {
    const [bankListData, setBankListData] = useState([]);
    const [isModalRendered, setIsModalRendered] = useState(false); // prevent content shifts
    const [visibleModal, setVisibleModal] = useState(null);

    useEffect(() => {
        // Replace this with API call if needed
        setBankListData(dummyData);
    }, []);

    const handleSetPrimary = (selectedId) => {
        const updatedList = bankListData.map((item) =>
            item.id === selectedId
                ? { ...item, isPrimaryAccount: 'Y' }
                : { ...item, isPrimaryAccount: 'N' }
        );
        setBankListData(updatedList);
    };

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
                                <Ionicons name="close" size={22} color="#333" />
                            </TouchableOpacity>
                        </View>

                        {isModalRendered && (
                            <>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 10 }}>
                                    <Text style={[styles.modalSmallTitle, { fontWeight: '500', marginBottom: 0 }]}>Your Bank Details List</Text>
                                    {bankListData.length < 3 && (
                                        <TouchableOpacity onPress={() => setVisibleModal('add-bank')} style={styles.btnNav}>
                                            <Text style={{ color: 'white' }}>Add</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                                <ScrollView
                                    contentContainerStyle={{ paddingTop: 10, paddingBottom: 100 }}
                                    showsVerticalScrollIndicator={false}
                                    initialNumToRender={5}
                                    removeClippedSubviews={false}
                                >
                                    {bankListData.length === 0 ?
                                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 40 }}>
                                            <Text style={{ fontSize: 16 }}>No bank details have been added yet.</Text>
                                        </View>
                                        :
                                        <>
                                            {bankListData.map((item) => (
                                                <View
                                                    key={item.id}
                                                    style={{
                                                        padding: 15,
                                                        backgroundColor: '#f4f4f4',
                                                        borderRadius: 10,
                                                        marginBottom: 10,
                                                    }}
                                                >
                                                    <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{item.bankName}</Text>
                                                    <Text>Account Number: {item.accountNumber}</Text>
                                                    <Text>IFSC Code: {item.ifscCode}</Text>

                                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                                                        <TouchableOpacity
                                                            onPress={() => handleSetPrimary(item.id)}
                                                            style={{ flexDirection: 'row', alignItems: 'center' }}
                                                        >
                                                            <FontAwesome
                                                                name={item.isPrimaryAccount === 'Y' ? 'dot-circle-o' : 'circle-o'}
                                                                size={20}
                                                                color={item.isPrimaryAccount === 'Y' ? 'green' : '#888'}
                                                                style={{ marginRight: 8 }}
                                                            />
                                                            <Text style={{ fontSize: 14 }}>
                                                                {item.isPrimaryAccount === 'Y' ? 'Primary Account' : 'Set as Primary'}
                                                            </Text>
                                                        </TouchableOpacity>

                                                        <TouchableOpacity
                                                            // onPress={() => handleDeleteBank(item.id)}
                                                            style={{
                                                                height: 30,
                                                                width: 30,
                                                                backgroundColor: '#e74c3c',
                                                                borderRadius: 20,
                                                                justifyContent: 'center',
                                                                alignItems: 'center',
                                                            }}
                                                        >
                                                            <FontAwesome name="trash" size={16} color="#fff" />
                                                        </TouchableOpacity>
                                                    </View>
                                                </View>

                                            ))}
                                            {bankListData.length >= 3 && (
                                                <Text style={{ color: '#000', fontWeight: '500', fontSize: 13, marginBottom: 10 }}>
                                                    Note: Maximum of 3 bank accounts can be added.
                                                </Text>
                                            )}
                                        </>
                                    }
                                </ScrollView>
                            </>
                        )}

                    </View>
                </View>
            </Modal>
            {visibleModal === 'add-bank' && bankListData.length < 3 && (
                <BankAddModal
                    visible={true}
                    onClose={() => setVisibleModal(null)}
                    userData={userData}
                    bankListData={bankListData}
                />
            )}

        </>
    );
};

export default BankDetailsModal;
