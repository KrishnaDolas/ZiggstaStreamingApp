import React, { createContext, useCallback, useContext, useState } from 'react';
import Apiclient from '../utils/Apiclient';

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

    // Define fetchProfileDetails within AppProvider
    const fetchProfileDetails = useCallback(async () => {
        try {
            if (!userData?.userid) return; // Guard clause
            const formData = {
                userid: userData?.userid,
            };
            const response = await Apiclient.post('/getUserDetails', formData);
            if (response.status === 200) {
                setProfileData(response.data.user || {});
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
        }}>
            {children}
        </AppContext.Provider>
    );
};

// 5️⃣ Custom hook
export const useAppContext = () => useContext(AppContext);
