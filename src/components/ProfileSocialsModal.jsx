// components/ProfileSocialsModal.js
import React, { useEffect, useLayoutEffect, useState } from 'react';
import { View, TouchableOpacity, Text, TextInput } from 'react-native';
import Modal from 'react-native-modal';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { styles, themeStyles } from '../../assets/styles/ThemeStyles';


const ProfileSocialsModal = ({ visible, onClose }) => {
    const [layoutReady, setLayoutReady] = useState(false);
    const [formData, setFormData] = useState({
        instagramUrl: '',
        twitterUrl: '',
        facebookUrl: '',
    })

    const socials = [
        { key: 'instagramUrl', icon: 'instagram', placeholder: 'your insta handle' },
        { key: 'twitterUrl', icon: 'twitter', placeholder: 'your twitter X handle' },
        { key: 'facebookUrl', icon: 'facebook', placeholder: 'your facebook handle' }
    ];

    useLayoutEffect(() => {
        if (visible) {
            setLayoutReady(true);
        } else {
            setLayoutReady(false);
        }
    }, [visible]);

    return (

        <>
            {layoutReady && (
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
                // backdropOpacity={0}
                >
                    <View style={[styles.profileModalOverlay]}>
                        <TouchableOpacity onPress={onClose} style={styles.profileModalClose}>
                            <Ionicons name="close" size={23} color="#333" />
                        </TouchableOpacity>
                        <View style={styles.profileMSocialBox}>
                            {socials.map((item, i) => (
                                <View key={i} style={[styles.profileMSocialBoxItem]}>
                                    <FontAwesome5 name={item.icon} size={24} color="#232323" style={[styles.profileMSocialBoxItemIcon]} />
                                    <TextInput value={formData[item.key]} onChangeText={(text) =>
                                        setFormData((prev) => ({ ...prev, [item.key]: text }))
                                    } placeholderTextColor="#999" placeholder={item.placeholder} style={[styles.profileMSocialBoxItemInput]} />
                                </View>
                            ))}
                        </View>

                    </View>
                </Modal>
            )}
        </>


    );
};

export default ProfileSocialsModal;
