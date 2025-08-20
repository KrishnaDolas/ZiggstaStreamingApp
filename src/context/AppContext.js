import React, { createContext, useCallback, useContext, useState } from 'react';
import Apiclient from '../utils/Apiclient';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
            fetchProfileDetails,
            subscriptionStatus,
            setSubscriptionStatus,
            isInStreamRoom,
            setIsInStreamRoom,
            headerMainTab,
            setHeaderMainTab,
        }}>
            {children}
        </AppContext.Provider>
    );
};

// 5️⃣ Custom hook
export const useAppContext = () => useContext(AppContext);
