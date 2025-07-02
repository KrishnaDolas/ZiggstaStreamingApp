// components/ProfileSocialsModal.js
import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, TextInput, Text, ActivityIndicator, Image } from 'react-native';
import Modal from 'react-native-modal';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { styles } from '../../assets/styles/ThemeStyles';
import Apiclient from '../utils/Apiclient';


const ProfileSocialsModal = ({ visible, onClose, userData }) => {
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
    const getSocialsData = async () => {
        setLoading(true);
        try {
            const response = await Apiclient.get(`/userSocials/getUserSocials?userid=${userData.userid}`);
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
        } catch (error) {
            console.error('Error fetching socials:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (userData?.userid) {
            setSaveMessage('');
            getSocialsData();
        }
    }, []);


    const handleUpdateSocialData = async () => {

        const postData = {
            userid: userData.userid,
            socialSet1: { platform: "Instagram", handle_or_url: formData.instagramUrl },
            socialSet2: { platform: "Twitter", handle_or_url: formData.twitterUrl },
            socialSet3: { platform: "Facebook", handle_or_url: formData.facebookUrl },
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
                <View style={[styles.profileModalOverlay]}>
                    <TouchableOpacity onPress={onClose} style={styles.profileModalClose}>
                        <Ionicons name="close" size={23} color="#333" />
                    </TouchableOpacity>
                    <View style={[styles.profileMSocialBox]}>
                        {loading ? (
                            <ActivityIndicator size="large" />
                        ) : socials.map((item, i) => {
                            return (
                                <View key={i} style={[styles.profileMSocialBoxItem]}>
                                    {item.type === 'icon' ? (
                                        <FontAwesome5
                                            name={item.icon}
                                            size={24}
                                            color="#232323"
                                            style={[styles.profileMSocialBoxItemIcon]}
                                        />
                                    ) : (
                                        <Image
                                            source={item.image}
                                            style={[styles.profileMSocialBoxItemIcon, { width: 20, height: 20, resizeMode: 'contain' }]}
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
                                        style={[styles.profileMSocialBoxItemInput]}
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
                            <TouchableOpacity style={styles.btnNav} onPress={handleUpdateSocialData}>
                                <Text style={{ color: 'white' }}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </Modal>
        </>


    );
};

export default ProfileSocialsModal;
