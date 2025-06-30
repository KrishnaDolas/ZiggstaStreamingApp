import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, Text, ScrollView, ActivityIndicator, Alert } from 'react-native';
import Modal from 'react-native-modal';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { styles } from '../../assets/styles/ThemeStyles';
import BankAddModal from './BankAddModal';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Apiclient from '../utils/Apiclient';

const BankDetailsModal = ({ visible, onClose, userData }) => {
    const [bankListData, setBankListData] = useState([]);
    const [isModalRendered, setIsModalRendered] = useState(false); // prevent content shifts
    const [visibleModal, setVisibleModal] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [messageType, setMessageType] = useState('success'); // or 'error'
    // Function to fetch social data from the API
    const getBankListData = async () => {
        setLoading(true);
        try {
            const response = await Apiclient.post(`/saveuserbank/getUserBankList?userID=${userData.userid}`);
            const apiData = response.data?.data || [];

            // Transform API data to local format
            const transformedData = apiData.map((item, index) => ({
                id: index + 1, // Unique ID for rendering
                BankID: item.BankID,
                bankName: item.BankName,
                accountNumber: item.AccountNumber,
                isPrimaryAccount: item.IsPrimary === 1 ? 'Y' : 'N',
            }));

            setBankListData(transformedData);
        } catch (error) {
            console.error('Error fetching bank list:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (userData.userid) {
            getBankListData();
        }
    }, []);


    const handleSetPrimary = async (bankId) => {
        try {
            const postData = {
                userid: userData.userid,
                BankID: bankId,
                isPrimary: 1,
            };
            const response = await Apiclient.post('/saveuserbank/setPrimaryAccount', postData);
            console.log('response set primary key :', response);

            setMessageType('success');
            setMessage(response.data.message || 'Primary account set successfully.');

            setTimeout(() => {
                setMessage(null);
                getBankListData();
            }, 2000);
        } catch (error) {
            setMessageType('error');
            setMessage('Failed to set primary account.');
            console.error('Error setting primary account:', error);
            setTimeout(() => setMessage(null), 2000);
        }
    };



    const handleDeleteBank = async (bankId) => {
        Alert.alert(
            'Confirm Deletion',
            'Are you sure you want to delete this bank account?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Delete',
                    onPress: async () => {
                        try {
                            const postData = {
                                userid: userData.userid,
                                BankID: bankId,
                            };
                            const response = await Apiclient.post('/saveuserbank/delete', postData);
                            console.log('response bank delete :', response);

                            setMessageType('success');
                            setMessage(response.data.message || 'Bank deleted successfully.');

                            setTimeout(() => {
                                setMessage(null);
                                getBankListData();
                            }, 2000);
                        } catch (error) {
                            setMessageType('error');
                            setMessage('Failed to delete bank account.');
                            console.error('Error deleting bank account:', error);
                            setTimeout(() => setMessage(null), 2000);
                        }
                    },
                    style: 'destructive',
                },
            ],
            { cancelable: true }
        );
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
                                {message && (
                                    <View
                                        style={{
                                            // backgroundColor: messageType === 'success' ? '#d4edda' : '#f8d7da',
                                            // borderColor: messageType === 'success' ? '#c3e6cb' : '#f5c6cb',
                                            // borderWidth: 1,
                                            // padding: 10,
                                            // borderRadius: 5,
                                            marginBottom: 10,
                                        }}
                                    >
                                        <Text style={{ color: messageType === 'success' ? '#d4edda' : '#f8d7da' }}>{message}</Text>
                                    </View>
                                )}

                                {loading ? (
                                    <View style={{ flex: 1, justifyContent: 'start', alignItems: 'center', paddingTop: 60 }}>
                                        <ActivityIndicator size="large" />
                                        <Text style={{ marginTop: 10 }}>Loading bank details...</Text>
                                    </View>
                                ) : <ScrollView
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
                                                    {/* <Text>IFSC Code: {item.ifscCode}</Text> */}

                                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                                                        <TouchableOpacity
                                                            onPress={() => handleSetPrimary(item.BankID)}
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
                                                            onPress={() => handleDeleteBank(item.BankID)}
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
                                </ScrollView>}

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
