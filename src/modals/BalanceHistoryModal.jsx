/* eslint-disable react-native/no-inline-styles */
import React, { memo, useContext, useEffect, useState } from 'react';
import { View, TouchableOpacity, Text, ActivityIndicator, Image, FlatList } from 'react-native';
import Modal from 'react-native-modal';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { styles, themeStyles } from '../../assets/styles/ThemeStyles';
import { ThemeContext } from '../context/ThemeContext';
import { Dimensions } from 'react-native';
import Apiclient from '../utils/Apiclient';
import { useAppContext } from '../context/AppContext';
import SentIcon from '../../assets/images/icons/Sent.png';
import ReceivedIcon from '../../assets/images/icons/Received.png';
import Colors from '../../assets/styles/Colors';
import { RFValue } from 'react-native-responsive-fontsize';


/* ------------------ Row Component (memoized) ------------------ */
const TransactionRow = memo(({ item, index, theme, getStatusColor }) => {
    return (
        <View key={index} style={[styles.profileTableRow, themeStyles[theme].profileTableRow]}>
            <Text style={[styles.profileTableCell, styles.profileTableCellIndex, themeStyles[theme].profileTableCell]}>{index + 1}</Text>
            <Text style={[styles.profileTableCell, styles.profileTableCellUsername, themeStyles[theme].profileTableCell, { flex: 1.3 }]}>{item.Username}</Text>
            <Text style={[styles.profileTableCell, styles.profileTableCellAmount, themeStyles[theme].profileTableCell, { flex: 1, textAlign: 'center' }]}>{item.Amount}</Text>
            <Text style={[styles.profileTableCell, styles.profileTableCellAmount, themeStyles[theme].profileTableCell, {
                flex: 0.9,
                textAlign: 'center',
                fontSize: RFValue(10),
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
});

const BalanceHistoryModal = ({ visible, onClose }) => {
    const { theme } = useContext(ThemeContext);
    const { userData } = useAppContext();
    const screenHeight = Dimensions.get('window').height;
    const [balanceHistoryData, setBalanceHistoryData] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (visible) {
            getBalanceTransactions();
        }
    }, [visible]);


    // to get average daily income of user
    const getBalanceTransactions = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await Apiclient.get(`/transferCredit/getTransactions?userid=${userData.userid}`);
            if (response.status === 200) {
                // console.log('Balance transactions data:', response.data);
                setBalanceHistoryData(response.data || {});
            } else {
                setError('Failed to fetch balance transactions data');
            }
        } catch (err) {
            setError('Error fetching balance transactions data: ' + err.message);
        } finally {
            setLoading(false);
        }
    };


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
                    <View style={[styles.profileSettingModalBody, { flex: 1, marginHorizontal: 0 }]}>
                        {/* dark / light setting */}
                        <View style={[styles.profileSettingMDarkLightSetting]}>
                            <Text style={[styles.pSettingMDarkLightSTitle,
                            themeStyles[theme].pSettingMDarkLightSTitle, { marginLeft: 12, fontWeight: '600' }]}> Transactions</Text>
                        </View>
                        <View style={[styles.profileTable, themeStyles[theme].profileTable, { flex: 1 }]}>
                            <View style={[styles.profileTableHeader, themeStyles[theme].profileTableHeader]}>
                                <Text style={[styles.profileTableHeaderText, styles.profileTableCellIndex, themeStyles[theme].profileTableHeaderText]}>#</Text>
                                <Text style={[styles.profileTableHeaderText, styles.profileTableCellUsername, themeStyles[theme].profileTableHeaderText, { flex: 1.3 }]}>Username</Text>
                                <Text style={[styles.profileTableHeaderText, styles.profileTableCellAmount, themeStyles[theme].profileTableHeaderText, { flex: 1, textAlign: 'center' }]}>Amount</Text>
                                <Text style={[styles.profileTableHeaderText, styles.profileTableCellAmount, themeStyles[theme].profileTableHeaderText, { flex: 0.9, textAlign: 'center' }]}>Status</Text>
                                <Text style={[styles.profileTableHeaderText, styles.profileTableCellAmount, themeStyles[theme].profileTableHeaderText, { flex: 0.5 }]}>Type</Text>
                            </View>
                            {loading ? (
                                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                    <ActivityIndicator style={{ marginTop: 40 }} />
                                </View>
                            ) : error ? (
                                <Text style={{ textAlign: 'center', marginTop: 40, color: 'red' }}>
                                    {error}
                                </Text>
                            ) : (
                                <FlatList
                                    data={balanceHistoryData}
                                    keyExtractor={(_, i) => i.toString()}
                                    renderItem={({ item, index }) => (
                                        <TransactionRow
                                            item={item}
                                            index={index}
                                            theme={theme}
                                            getStatusColor={getStatusColor}
                                        />
                                    )}
                                    // contentContainerStyle={{ paddingBottom: 20 }}
                                    style={{ maxHeight: screenHeight * 0.5 }}
                                    initialNumToRender={10}
                                    maxToRenderPerBatch={10}
                                    windowSize={7}
                                    removeClippedSubviews={true}
                                />
                            )}
                        </View>
                    </View>
                </View>
            </Modal>
        </>

    );
};

export default BalanceHistoryModal;
