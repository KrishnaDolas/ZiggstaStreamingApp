import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import Apiclient from '../utils/Apiclient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, PermissionsAndroid, Alert, Linking } from 'react-native';
import ImagePickerCrop from 'react-native-image-crop-picker';
// 3️⃣ Create context
const AppContext = createContext();

// 4️⃣ Provider component
export const AppProvider = ({ children }) => {
    const [friendListType, setFriendListType] = useState('friends'); // 'friends' or 'blocked'
    const [userData, setUserData] = useState({});
    const [userAddress, setUserAddress] = useState('');
    const [ipAddress, setIpAddress] = useState('');
    const [profileData, setProfileData] = useState({});
    const [subscriptionStatus, setSubscriptionStatus] = useState(null);
    const [isInStreamRoom, setIsInStreamRoom] = useState(false);
    const [headerMainTab, setHeaderMainTab] = useState('foryou');
    const [modalStage, setModalStage] = useState('first');
    const [modalLabelName, setModalLabelName] = useState(null);
    const [modalVisibleStage, setModalVisibleStage] = useState(null);
    const [showAvatarPreview, setShowAvatarPreview] = useState(false);
    const [avatarToPreview, setAvatarToPreview] = useState(null);
    const [userProfileDetails, setUserProfileDetails] = useState({});
    const [isMainProfileOpened, setIsMainProfileOpened] = useState(false);
    const [avatarUploading, setAvatarUploading] = useState(false);
    const [isImagePickerOpen, setIsImagePickerOpen] = useState(false);
    const [profileUserId, setProfileUserId] = useState(null);

    useEffect(() => {
        console.log('modalStage changed to ', modalStage);
        console.log('modalLabelName changed to ', modalLabelName);
        console.log('modalVisibleStage changed to ', modalVisibleStage);
        console.log('is-main-profile ', isMainProfileOpened);
        console.log('profile-user-id', profileUserId);

    }, [modalStage, modalLabelName, modalVisibleStage, isMainProfileOpened, profileUserId]);

    // Define fetchProfileDetails within AppProvider
    const fetchProfileDetails = useCallback(async () => {
        try {
            if (!userData?.userid) return; // Guard clause
            const formData = {
                userid: userData?.userid,
            };
            const response = await Apiclient.post('/getUserDetails', formData);
            if (response.status === 200) {
                const userDataString = JSON.stringify(response.data.user);
                await AsyncStorage.setItem('UserData', userDataString);
                setProfileData(response.data.user || {});
                setUserData(response.data.user || {});
            }
        } catch (err) {
            console.log('Error fetching user profile details: ' + err.message);
        }
    }, [userData?.userid, setProfileData]);


    // profile on select function
    const onSelectImage = async (type) => {
        console.log('on-select-image-type', type);

        setAvatarUploading(true);
        setIsImagePickerOpen(true);

        try {
            let image = null;

            if (type === 'camera') {
                if (Platform.OS === 'android') {
                    const permission = PermissionsAndroid.PERMISSIONS.CAMERA;
                    const granted = await PermissionsAndroid.request(permission, {
                        title: 'Camera Permission',
                        message: 'App needs access to your camera to take photos.',
                        buttonNeutral: 'Ask Me Later',
                        buttonNegative: 'Cancel',
                        buttonPositive: 'OK',
                    });

                    if (granted === PermissionsAndroid.RESULTS.DENIED) {
                        Alert.alert(
                            'Permission Required',
                            'Camera permission is required to take a photo. Please allow it.'
                        );
                        setAvatarUploading(false);
                        setIsImagePickerOpen(false);
                        return;
                    }

                    if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
                        Alert.alert(
                            'Permission Denied',
                            'Camera permission was denied permanently. Open settings to allow access.',
                            [
                                { text: 'Cancel', style: 'cancel' },
                                { text: 'Open Settings', onPress: () => Linking.openSettings() },
                            ]
                        );
                        setAvatarUploading(false);
                        setIsImagePickerOpen(false);
                        return;
                    }

                    if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                        setAvatarUploading(false);
                        setIsImagePickerOpen(false);
                        return;
                    }
                }

                image = await ImagePickerCrop.openCamera({
                    width: 256,
                    height: 256,
                    cropping: true,
                    hideBottomControls: true,
                    freeStyleCropEnabled: false,
                    compressImageQuality: 0.7,
                    mediaType: 'photo',
                    includeBase64: false,
                });

            } else if (type === 'gallery') {
                image = await ImagePickerCrop.openPicker({
                    width: 256,
                    height: 256,
                    cropping: true,
                    hideBottomControls: true,
                    freeStyleCropEnabled: false,
                    compressImageQuality: 0.7,
                    mediaType: 'photo',
                    includeBase64: false,
                });
            }

            if (!image || image.cancelled) {
                setAvatarUploading(false);
                return;
            }

            const avatarFile = {
                uri: image.path,
                name: image.filename || `avatar_${Date.now()}.jpg`,
                type: image.mime,
            };

            uploadAvatarToServer(avatarFile);

        } catch (error) {
            if (error.message?.includes('cancelled') || error.code === 'E_PICKER_CANCELLED') {
                console.log('Image selection cancelled');
            } else {
                console.error('Image selection error:', error);
                Alert.alert('Error', 'Failed to select or crop image.');
            }
            setAvatarUploading(false);
        } finally {
            setIsImagePickerOpen(false);
        }
    };

    // profile upload to server
    const uploadAvatarToServer = async (avatarFile) => {
        console.log('avatarFile', avatarFile);

        setIsImagePickerOpen(false); // Reset flag when starting upload
        const formData = new FormData();
        formData.append('avatar', {
            uri: Platform.OS === 'ios' ? avatarFile.uri.replace('file://', '') : avatarFile.uri,
            type: avatarFile.type,
            name: avatarFile.name,
        });
        formData.append('userId', profileUserId);

        try {
            const response = await Apiclient.post('/avatar/upload', formData);
            const resJson = response.data;
            console.log('response avatar upload', resJson);
            if (response.status === 200) {
                Alert.alert('Message', resJson.message);
                setTimeout(() => {
                    setModalVisibleStage('profile-screen-modal');
                    setModalStage('first');
                    fetchProfileDetails();
                    setProfileUserId(null);
                }, 1500);
            } else {
                Alert.alert('Message', resJson.message || 'Please try again.');
                setProfileUserId(null);
            }
        } catch (error) {
            console.error('Avatar upload error:', error);
            setProfileUserId(null);
            Alert.alert('Error', 'Failed to upload avatar.');
        } finally {
            setAvatarUploading(false);
            setProfileUserId(null);
        }
    };

    return (
        <AppContext.Provider value={{
            friendListType,
            setFriendListType,
            userData,
            setUserData,
            userAddress,
            setUserAddress,
            ipAddress,
            setIpAddress,
            profileData,
            setProfileData,
            subscriptionStatus,
            setSubscriptionStatus,
            isInStreamRoom,
            setIsInStreamRoom,
            headerMainTab,
            setHeaderMainTab,
            modalStage,
            setModalStage,
            modalLabelName,
            setModalLabelName,
            modalVisibleStage,
            setModalVisibleStage,
            showAvatarPreview,
            setShowAvatarPreview,
            avatarToPreview,
            setAvatarToPreview,
            userProfileDetails,
            setUserProfileDetails,
            isMainProfileOpened,
            setIsMainProfileOpened,
            avatarUploading,
            setAvatarUploading,
            isImagePickerOpen,
            setIsImagePickerOpen,
            profileUserId,
            setProfileUserId,

            // functions
            fetchProfileDetails,
            onSelectImage,
        }}>
            {children}
        </AppContext.Provider>
    );
};

// 5️⃣ Custom hook
export const useAppContext = () => useContext(AppContext);
