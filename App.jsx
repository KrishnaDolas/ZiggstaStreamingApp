import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  View,
  Text,
  StyleSheet,
  AppState,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { ThemeProvider } from './src/context/ThemeProvider';
import { MainScreen } from './src/screens/MainScreen';
import { AuthScreen } from './src/screens/AuthScreen';
import { SplashScreen } from './src/screens/SplashScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { MessageListScreen } from './src/screens/MessageListScreen';
import { WalletDashboardScreen } from './src/screens/WalletDashboardScreen';
import { StatisticsSettingScreen } from './src/screens/StatisticsSettingScreen';
import { useAppContext } from './src/context/AppContext';
import { debounceStorage } from './src/utils/debounceStorage';

const Stack = createNativeStackNavigator();

const NetworkCheck = () => (
  <View style={styles.center}>
    <ActivityIndicator size="large" color="#0000ff" />
    <Text style={styles.text}>No Internet Connection</Text>
  </View>
);

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(true);
  const { userAddress, setUserAddress, userData, setUserData, setIpAddress } = useAppContext();
  const hasFetchedAddress = useRef(false); // Prevent multiple fetches
  const handleLogin = () => setIsAuthenticated(true);



  const handleLogout = async () => {
    await AsyncStorage.clear();
    setUserAddress(null);
    setUserData(null);
    setIpAddress('');
    setIsAuthenticated(false);
    hasFetchedAddress.current = false; // Allow re-fetch on next load
  };

  const fetchAddressFromIP = async () => {
    if (hasFetchedAddress.current) return; // Prevent multiple fetches
    hasFetchedAddress.current = true;
    try {
      // Step 1: Get public IP of the device
      const ipRes = await fetch('https://api64.ipify.org?format=json');
      const ipData = await ipRes.json();
      const ip = ipData.ip;
      setIpAddress(ip); // Corrected to set the IP directly

      // Step 2: Use IP to get location info
      const response = await fetch(
        `https://api.geoapify.com/v1/ipinfo?apiKey=25127ca1c55f48909b03f43048040037`
      );
      const json = await response.json();
      console.log('App.jsx ip info api call', json);

      // Step 3: Extract address details
      const address = {
        city: json.city?.name || '',
        state: json.state?.name || '',
        country: json.country?.name || '',
        postcode: json.postcode || '',
        latitude: json.location?.latitude || null,
        longitude: json.location?.longitude || null,
        ip,
        source: 'ip',
      };
      console.log('App.jsx ip info address', address);

      // Step 4: If postcode is missing, perform reverse geocoding
      if (!address.postcode && address.latitude && address.longitude) {
        const reverseResponse = await fetch(
          `https://api.geoapify.com/v1/geocode/reverse?lat=${address.latitude}&lon=${address.longitude}&apiKey=25127ca1c55f48909b03f43048040037`
        );
        const reverseJson = await reverseResponse.json();
        const reverseAddress = reverseJson.features?.[0]?.properties || {};
        console.log('App.jsx reverse api call', reverseAddress);
        address.city = reverseAddress.city || address.city;
        address.state = reverseAddress.state || address.state;
        address.country = reverseAddress.country || address.country;
        address.postcode = reverseAddress.postcode || '';
      }

      setUserAddress(address);
      debounceStorage('userAddress', address);
    } catch (error) {
      console.error('Failed to get IP/location:', error);
      hasFetchedAddress.current = false; // Allow retry on next load
    }
  };

  useEffect(() => {
    console.log('App.jsx user address updated:', userAddress);
  }, [userAddress]);

  useEffect(() => {
    const init = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const userDataStored = await AsyncStorage.getItem('UserData');
        const userAddressStored = await AsyncStorage.getItem('userAddress');
        if (token) {
          setIsAuthenticated(true);
        }

        if (userDataStored) {
          setUserData(JSON.parse(userDataStored));
        }

        if (userAddressStored) {
          setUserAddress(JSON.parse(userAddressStored));
          hasFetchedAddress.current = true; // ✅ Prevent re-fetch if exists
        }

        // Simulate splash delay
        setTimeout(() => {
          setIsLoading(false);
        }, 3000);
      } catch (e) {
        console.error('Init error:', e);
        setIsLoading(false);
      }
    };

    init();
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected,isAuthenticated]);

  // ✅ NEW: Fetch IP location only after login and if online
  useEffect(() => {
    if (isAuthenticated && !hasFetchedAddress.current) {
      fetchAddressFromIP();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isInternetReachable === true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'background') {
        // console.log('App is in background');
        // You can pause stream, release resources, etc.
      }
      if (nextAppState === 'active') {
        // console.log('App is in foreground');
      }
    });

    return () => subscription.remove();
  }, []);

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <ThemeProvider >
          <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              {!isConnected && <Stack.Screen name="NetworkCheck" component={NetworkCheck} />}
              {!isAuthenticated && <Stack.Screen name="Splash" component={SplashScreen} />}
              {isAuthenticated ? (
                <>
                  <Stack.Screen name="Main">
                    {props => (
                      <MainScreen
                        {...props}
                        isAuthenticated={isAuthenticated}
                      />
                    )}
                  </Stack.Screen>
                  <Stack.Screen name="Profile">
                    {props => (
                      <ProfileScreen
                        {...props}
                        onLogout={handleLogout}
                        userData={userData}
                        address={userAddress}
                      />
                    )}
                  </Stack.Screen>
                  <Stack.Screen name="Stats">
                    {props => (
                      <StatisticsSettingScreen
                        {...props}
                        onLogout={handleLogout}
                        userData={userData}
                        address={userAddress}
                      />
                    )}
                  </Stack.Screen>
                  <Stack.Screen name="Messages">
                    {props => (
                      <MessageListScreen
                        {...props}
                        userData={userData}
                      />
                    )}
                  </Stack.Screen>
                  <Stack.Screen name="WalletDashboard">
                    {props => (
                      <WalletDashboardScreen
                        {...props}
                        userData={userData}
                      />
                    )}
                  </Stack.Screen>
                  {/* <Stack.Screen name="Profile" component={ProfileScreen} /> */}
                </>
              ) : (
                <Stack.Screen name="Auth">
                  {props => (
                    <AuthScreen
                      {...props}
                      onLogin={handleLogin}
                    />
                  )}
                </Stack.Screen>
              )}
            </Stack.Navigator>
          </NavigationContainer>
        </ThemeProvider>

      </SafeAreaProvider>

    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    marginTop: 10,
    fontSize: 16,
  },
});

export default App;
