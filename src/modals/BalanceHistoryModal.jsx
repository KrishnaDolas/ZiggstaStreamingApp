/* eslint-disable react-native/no-inline-styles */
import React, { useCallback, useContext, useEffect, useLayoutEffect, useState } from 'react';
import { View, TouchableOpacity, Text, ActivityIndicator, Image } from 'react-native';
import Modal from 'react-native-modal';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { styles, themeStyles } from '../../assets/styles/ThemeStyles';
import { ThemeContext } from '../context/ThemeContext';
import { Dimensions, ScrollView } from 'react-native';
import Apiclient from '../utils/Apiclient';
import { useAppContext } from '../context/AppContext';
import SentIcon from '../../assets/images/icons/Sent.png';
import ReceivedIcon from '../../assets/images/icons/Received.png';
import Colors from '../../assets/styles/Colors';

const BalanceHistoryModal = ({ visible, onClose }) => {
    const { theme } = useContext(ThemeContext);
    const { userData } = useAppContext();
    const screenHeight = Dimensions.get('window').height;
    const [layoutReady, setLayoutReady] = useState(false);
    const [balanceHistoryData, setBalanceHistoryData] = useState([]);
    const [isError, setIsError] = useState('');
    const [loading, setLoading] = useState(false);

    useLayoutEffect(() => {
        if (visible) {
            setLayoutReady(true);
        } else {
            setLayoutReady(false);
        }
    }, [visible]);


    // to get average daily income of user
    const getBalanceTransactions = useCallback(async () => {
        try {
            setLoading(true);
            setIsError('');
            const response = await Apiclient.get(`/transferCredit/getTransactions?userid=${userData.userid}`);
            if (response.status === 200) {
                // console.log('Balance transactions data:', response.data);
                setBalanceHistoryData(response.data || {});
            } else {
                setIsError('Failed to fetch balance transactions data');
            }
        } catch (err) {
            setIsError('Error fetching balance transactions data: ' + err.message);
        } finally {
            setLoading(false);
        }
    }, [userData.userid]);

    useEffect(() => {
        getBalanceTransactions();
    }, [getBalanceTransactions]);


    const getStatusColor = (status) => {
        switch (status.toUpperCase()) {
            case 'COMPLETED':
                return '#4CAF50'; // Green
            case 'PENDING':
                return '#FF9800'; // Orange
            case 'FAILED':
                return '#F44336'; // Red
            default:
                return theme === 'light' ? '#333' : '#ccc';
        }
    };

    // const getTypeColor = (type) => {
    //     switch (type.toLowerCase()) {
    //         case 'sent':
    //             return '#E91E63'; // Pink/Red
    //         case 'received':
    //             return '#3F51B5'; // Blue
    //         default:
    //             return theme === 'light' ? '#333' : '#ccc';
    //     }
    // };


    return (
        <>

            <Modal
                isVisible={visible}
                onBackdropPress={onClose}
                animationIn="slideInUp"
                animationOut="slideOutDown"
                animationInTiming={300}
                animationOutTiming={200}
                useNativeDriver={true}
                avoidKeyboard={false}
                backdropOpacity={0}
                style={[styles.profileModalMain]}
            >
                <View style={[styles.profileModalOverlay, { backgroundColor: theme === 'dark' ? Colors.blackCardColor : '#fff' }, { flex: 1, maxHeight: screenHeight * 0.7, padding: 0 }]}>
                    {/* close modal */}
                    <TouchableOpacity onPress={onClose} style={[styles.profileModalClose, { marginRight: 10, marginTop: 10 }]}>
                        <Ionicons name="close" size={28} color={theme === 'light' ? '#333' : '#fff'} />
                    </TouchableOpacity>
                    {layoutReady &&
                        <View style={[styles.profileSettingModalBody, { flex: 1, marginHorizontal: 0 }]}>
                            {/* dark / light setting */}
                            <View style={[styles.profileSettingMDarkLightSetting]}>
                                <Text style={[styles.pSettingMDarkLightSTitle,
                                themeStyles[theme].pSettingMDarkLightSTitle, { marginLeft: 12, fontWeight: '600' }]}> Transactions</Text>
                            </View>
                            <View style={[styles.profileTable, themeStyles[theme].profileTable]}>
                                <View style={[styles.profileTableHeader, themeStyles[theme].profileTableHeader]}>
                                    <Text style={[styles.profileTableHeaderText, styles.profileTableCellIndex, themeStyles[theme].profileTableHeaderText]}>#</Text>
                                    <Text style={[styles.profileTableHeaderText, styles.profileTableCellUsername, themeStyles[theme].profileTableHeaderText, { flex: 1.3 }]}>Username</Text>
                                    <Text style={[styles.profileTableHeaderText, styles.profileTableCellAmount, themeStyles[theme].profileTableHeaderText, { flex: 1, textAlign: 'center' }]}>Amount</Text>
                                    <Text style={[styles.profileTableHeaderText, styles.profileTableCellAmount, themeStyles[theme].profileTableHeaderText, { flex: 0.9, textAlign: 'center' }]}>Status</Text>
                                    <Text style={[styles.profileTableHeaderText, styles.profileTableCellAmount, themeStyles[theme].profileTableHeaderText, { flex: 0.5 }]}>Type</Text>
                                </View>
                                <ScrollView nestedScrollEnabled={true} contentContainerStyle={{ paddingBottom: 8 }} style={{ height: screenHeight * 0.5 + 20 }}>
                                    {loading ? (
                                        <View style={{ height: screenHeight * 0.5, justifyContent: 'center', alignItems: 'center' }}>
                                            <ActivityIndicator size="large" color={theme === 'light' ? '#333' : '#fff'} />
                                        </View>
                                    ) : isError ? (
                                        <View style={{ height: screenHeight * 0.5, justifyContent: 'center', alignItems: 'center' }}>
                                            <Text style={{ color: theme === 'light' ? '#f00' : '#f88', fontWeight: '600', textAlign: 'center', paddingHorizontal: 20 }}>
                                                {isError}
                                            </Text>
                                        </View>
                                    ) : balanceHistoryData?.length === 0 ? <>
                                        <>
                                            <View style={{ height: screenHeight * 0.5, justifyContent: 'center', alignItems: 'center' }}>
                                                <Text style={{ color: theme === 'light' ? '#777' : '#ccc', fontSize: 16, fontWeight: '500' }}>
                                                    No data found
                                                </Text>
                                            </View>
                                        </>
                                    </> : balanceHistoryData?.map((item, index) => {
                                        return (
                                            <View key={index} style={[styles.profileTableRow, themeStyles[theme].profileTableRow]}>
                                                <Text style={[styles.profileTableCell, styles.profileTableCellIndex, themeStyles[theme].profileTableCell]}>{index + 1}</Text>
                                                <Text style={[styles.profileTableCell, styles.profileTableCellUsername, themeStyles[theme].profileTableCell, { flex: 1.3 }]}>{item.Username}</Text>
                                                <Text style={[styles.profileTableCell, styles.profileTableCellAmount, themeStyles[theme].profileTableCell, { flex: 1, textAlign: 'center' }]}>{item.Amount}</Text>
                                                <Text style={[styles.profileTableCell, styles.profileTableCellAmount, themeStyles[theme].profileTableCell, {
                                                    flex: 0.9,
                                                    textAlign: 'center',
                                                    fontSize: 11,
                                                    fontWeight: '500',
                                                    color: getStatusColor(item.Status),
                                                }]}>{item.Status}</Text>
                                                <Text style={[styles.profileTableCell, styles.profileTableCellAmount, themeStyles[theme].profileTableCell, {
                                                    flex: 0.5,
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                }]}>
                                                    <Image
                                                        source={item.Type.toLowerCase() === 'sent' ? SentIcon : ReceivedIcon}
                                                        style={{
                                                            width: 22,
                                                            height: 22,
                                                            resizeMode: 'contain',
                                                            // tintColor: item.Type.toLowerCase() === 'sent' ? '#E91E63' : '#4CAF50',
                                                        }}
                                                    />
                                                </Text>
                                            </View>
                                        );
                                    })}
                                </ScrollView>
                            </View>
                        </View>
                    }
                </View>
            </Modal>
        </>

    );
};

export default BalanceHistoryModal;
