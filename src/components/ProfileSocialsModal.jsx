// components/ProfileSocialsModal.js
import React, { useContext, useEffect, useState } from 'react';
import { View, TouchableOpacity, TextInput, Text, ActivityIndicator, Image, Dimensions } from 'react-native';
import Modal from 'react-native-modal';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { styles, themeStyles } from '../../assets/styles/ThemeStyles';
import Apiclient from '../utils/Apiclient';
import { useAppContext } from '../context/AppContext';
// import { SendErrorTotheServer } from '../utils/constant';
import { ThemeContext } from '../context/ThemeContext';
const screenHeight = Dimensions.get('window').height;


const ProfileSocialsModal = ({ visible, onClose }) => {
    const { theme } = useContext(ThemeContext);
    const { userData } = useAppContext();
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        instagramUrl: '',
        twitterUrl: '',
        facebookUrl: '',
    });
    const [loading, setLoading] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');
    const socials = [
        { key: 'instagramUrl', icon: 'instagram', type: 'icon', placeholder: 'your insta id' },
        { key: 'twitterUrl', image: require('../../assets/images/tx-logo-black.png'), type: 'image', placeholder: 'your twitter X handle' },
        { key: 'facebookUrl', icon: 'facebook', type: 'icon', placeholder: 'your facebook id' },
    ];

    const platformKeyMap = {
        instagram: 'instagramUrl',
        twitter: 'twitterUrl',
        facebook: 'facebookUrl',
    };

    const platformDomainMap = {
        instagramUrl: 'https://instagram.com/',
        twitterUrl: 'https://twitter.com/',
        facebookUrl: 'https://facebook.com/',
    };

    // Function to fetch social data from the API
    useEffect(() => {
        const getSocialsData = async () => {
            setSaveMessage('');
            setLoading(true);
            try {
                const response = await Apiclient.get(`/userSocials/getUserSocials?userid=${userData.userid}`);
                if (response.status === 200 && response.data?.socials?.length) {
                    const socialsData = response.data.socials;
                    // console.log('socialsData', socialsData);
                    const updatedFormData = { ...formData };
                    socialsData.forEach(item => {
                        const key = platformKeyMap[item.platform.toLowerCase()];
                        if (key) {
                            updatedFormData[key] = item.handle_or_url;
                        }
                    });
                    console.log('updatedFormData', updatedFormData);
                    setFormData(updatedFormData);
                } else {
                    console.log("No socials found for user:", userData.userid);
                    setFormData([]);
                }
            } catch (error) {
                const message = error?.response?.data?.message || error.message;
                console.error('Error fetching socials:', message);
                setFormData([]);
                // SendErrorTotheServer(error, 'getUserSocials');
            } finally {
                setLoading(false);
            }
        };
        if (userData?.userid) {
            getSocialsData();
        }
    }, [userData?.userid]);


    const handleUpdateSocialData = async () => {
        if (submitting) return; // prevent multiple submissions
        setSubmitting(true);
        const postData = {
            userid: userData.userid,
            socialSet1: { platform: "Instagram", handle_or_url: formData.instagramUrl === '' ? null : formData.instagramUrl },
            socialSet2: { platform: "Twitter", handle_or_url: formData.twitterUrl === '' ? null : formData.twitterUrl },
            socialSet3: { platform: "Facebook", handle_or_url: formData.facebookUrl === '' ? null : formData.facebookUrl },
        };
        console.log('postData', postData);
        try {
            const response = await Apiclient.post('/userSocials', postData);
            console.log('Socials updated:', response.data);
            setSaveMessage(response?.data?.message || 'Updated successfully.');
            setTimeout(() => {
                onClose(); // refresh after update if needed
            }, 1500);
        } catch (error) {
            console.error('Error updating socials:', error);
            setSaveMessage('Failed to update socials.');
        } finally {
            setSubmitting(false);
        }
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
                useNativeDriver={false}
                avoidKeyboard={true}
                backdropOpacity={0}
                style={[styles.profileModalMain, { flex: 1, }]}
                propagateSwipe={true}
                swipeDirection={['down']}
                onSwipeComplete={onClose}
            >
                <View style={[styles.profileModalOverlay,
                themeStyles[theme].profileModalOverlay]}>
                    <TouchableOpacity onPress={onClose} style={styles.profileModalClose}>
                        <Ionicons name="close" size={28} color={theme === 'light' ? '#333' : '#fff'} />
                    </TouchableOpacity>
                    <View style={[styles.profileMSocialBox]}>
                        {loading ? (
                            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: screenHeight * 0.3 }}>
                                <ActivityIndicator size="large" />
                            </View>
                        ) : socials.map((item, i) => {
                            return (
                                <View key={i} style={[styles.profileMSocialBoxItem, themeStyles[theme].profileMSocialBoxItem]}>
                                    {item.type === 'icon' ? (
                                        <FontAwesome5
                                            name={item.icon}
                                            size={24}
                                            color={theme === 'light' ? '#232323' : '#fff'}
                                            style={[styles.profileMSocialBoxItemIcon]}
                                        />
                                    ) : (
                                        <Image
                                            source={item.image}
                                            style={[styles.profileMSocialBoxItemIcon, { width: 20, height: 20, resizeMode: 'contain', tintColor: theme === 'dark' ? '#fff' : undefined, }]}
                                        />
                                    )}
                                    <TextInput
                                        value={formData[item.key]}
                                        onChangeText={(text) => {
                                            const prefix = platformDomainMap[item.key];
                                            let clean = text;

                                            // If the text starts with the prefix, remove it
                                            if (text.startsWith(prefix)) {
                                                clean = text.replace(prefix, '');
                                            }

                                            // Also prevent accidental full pasting of a full URL
                                            const regexDomain = new RegExp(/^https:\/\/[a-z]+\.[a-z]+\/?/i);
                                            clean = clean.replace(regexDomain, '');

                                            setFormData((prev) => ({ ...prev, [item.key]: clean }));
                                        }}
                                        placeholderTextColor="#999"
                                        placeholder={item.placeholder}
                                        style={[styles.profileMSocialBoxItemInput, themeStyles[theme].profileMSocialBoxItemInput]}
                                    />
                                </View>
                            )
                        })}
                    </View>
                    {saveMessage ? (
                        <Text style={{ color: '#28a745', textAlign: 'center' }}>{saveMessage}</Text>
                    ) : null}
                    {(visible && !loading) && (
                        <View style={{ marginVertical: 10 }}>
                            <TouchableOpacity
                                style={[styles.btnNav, submitting && { opacity: 0.7 }]}
                                onPress={handleUpdateSocialData}
                                disabled={submitting}
                            >
                                {submitting ? (
                                    <ActivityIndicator color="#fff" size="small" />
                                ) : (
                                    <Text style={{ color: 'white' }}>Save</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </Modal>
        </>


    );
};

export default ProfileSocialsModal;
