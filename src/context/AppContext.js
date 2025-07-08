import React, { createContext, useContext, useState } from 'react';

// 3️⃣ Create context
const AppContext = createContext();

// 4️⃣ Provider component
export const AppProvider = ({ children }) => {
    const [friendListType, setFriendListType] = useState('friends'); // 'friends' or 'blocked'
    const [userData, setUserData] = useState({});
    const [userAddress, setUserAddress] = useState('');
    const [ipAddress, setIpAddress] = useState('');
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
        }}>
            {children}
        </AppContext.Provider>
    );
};

// 5️⃣ Custom hook
export const useAppContext = () => useContext(AppContext);
