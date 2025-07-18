import React, { use, useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  View,
  Text,
  StyleSheet,
  AppState,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import Geolocation from 'react-native-geolocation-service';
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
import Apiclient from './src/utils/Apiclient';
import TermsOfUseScreen from './src/screens/TermsOfUseScreen';

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
  const {
    userAddress,
    setUserAddress,
    userData,
    setUserData,
    setIpAddress,
    fetchProfileDetails,
    setSubscriptionStatus,
  } = useAppContext();


  const hasFetchedAddress = useRef(false); // Prevent multiple fetches

  const handleLogin = () => setIsAuthenticated(true);


  const handleLogout = async () => {
    try {
      // Only remove app/session-specific keys, not the theme
      await AsyncStorage.multiRemove([
        'token',
        'UserData',
        'locationTrackingEnabled',
        'onlyProfileVerified',
        'allowNotification',
        'distanceRange',
        'userAddress', // Clear userAddress on logout
        // 'locationPermission', // Clear location permission to prompt again
      ]);

      // Introduce a 2-second delay before clearing locationPermission
      setTimeout(async () => {
        await AsyncStorage.removeItem('locationPermission');
        console.log('locationPermission cleared after 2-second delay');
      }, 2000);

      setUserAddress(null);
      setUserData(null);
      setIpAddress('');
      setIsAuthenticated(false);
      hasFetchedAddress.current = false; // Allow re-fetch on next load
    } catch (error) {
      console.log('Logout failed:', error);
    }
  };

  const requestLocationPermission = async () => {
    try {
      console.log('Requesting location permission...');
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission Required',
            message: 'This app requires access to your location to provide personalized services.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        const isGranted = granted === PermissionsAndroid.RESULTS.GRANTED;
        console.log('Android permission result:', isGranted ? 'granted' : 'denied');
        await AsyncStorage.setItem('locationPermission', isGranted ? 'granted' : 'denied');
        return isGranted;
      } else {
        const auth = await Geolocation.requestAuthorization('whenInUse');
        const isGranted = auth === 'granted';
        console.log('iOS permission result:', isGranted ? 'granted' : 'denied');
        await AsyncStorage.setItem('locationPermission', isGranted ? 'granted' : 'denied');
        return isGranted;
      }
    } catch (error) {
      console.error('Permission request error:', error);
      await AsyncStorage.setItem('locationPermission', 'denied');
      return false;
    }
  };

  const fetchAddressFromCoords = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&apiKey=25127ca1c55f48909b03f43048040037`
      );
      const data = await response.json();
      if (data.features && data.features.length > 0) {
        const address = data.features[0].properties;
        const newAddress = {
          city: address.city || '',
          state: address.state || '',
          country: address.country || '',
          postcode: address.postcode || '',
          latitude,
          longitude,
          source: 'device',
        };
        setUserAddress(newAddress);
        await AsyncStorage.setItem('userAddress', JSON.stringify(newAddress)); // Persist userAddress
        hasFetchedAddress.current = true;
      } else {
        console.log('No address found from Geoapify');
      }
    } catch (error) {
      console.error('Geoapify reverse geocoding error:', error);
    }
  };

  const fetchAddressFromIP = async () => {
    try {
      const ipRes = await fetch('https://api64.ipify.org?format=json');
      const ipData = await ipRes.json();
      const ip = ipData.ip;
      setIpAddress(ip);

      const response = await fetch(
        `https://api.geoapify.com/v1/ipinfo?apiKey=25127ca1c55f48909b03f43048040037`
      );
      const json = await response.json();
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

      if (!address.postcode && address.latitude && address.longitude) {
        const reverseResponse = await fetch(
          `https://api.geoapify.com/v1/geocode/reverse?lat=${address.latitude}&lon=${address.longitude}&apiKey=25127ca1c55f48909b03f43048040037`
        );
        const reverseJson = await reverseResponse.json();
        const reverseAddress = reverseJson.features?.[0]?.properties || {};
        const newAddress = {
          city: reverseAddress.city || address.city,
          state: reverseAddress.state || address.state,
          country: reverseAddress.country || address.country,
          postcode: reverseAddress.postcode || '',
          latitude: address.latitude,
          longitude: address.longitude,
          ip,
          source: 'ip',
        };
        setUserAddress(newAddress);
        await AsyncStorage.setItem('userAddress', JSON.stringify(newAddress)); // Persist userAddress
      } else {
        setUserAddress(address);
        await AsyncStorage.setItem('userAddress', JSON.stringify(address)); // Persist userAddress
      }
      hasFetchedAddress.current = true;
    } catch (error) {
      console.error('IP-based location error:', error);
    }
  };


  // useEffect(() => {
  //   const init = async () => {
  //     try {
  //       const token = await AsyncStorage.getItem('token');
  //       const userDataStored = await AsyncStorage.getItem('UserData');
  //       const userAddressStored = await AsyncStorage.getItem('userAddress');
  //       if (token) {
  //         setIsAuthenticated(true);
  //       }

  //       if (userDataStored) {
  //         setUserData(JSON.parse(userDataStored));
  //       }

  //       if (userAddressStored) {
  //         setUserAddress(JSON.parse(userAddressStored));
  //         hasFetchedAddress.current = true; // ✅ Prevent re-fetch if exists
  //       }

  //       // Simulate splash delay
  //       setTimeout(() => {
  //         setIsLoading(false);
  //       }, 3000);
  //     } catch (e) {
  //       console.error('Init error:', e);
  //       setIsLoading(false);
  //     }
  //   };

  //   init();
  //   //eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [isConnected, isAuthenticated]);


  // const init = useCallback(async () => {
  //   try {
  //     const token = await AsyncStorage.getItem('token');
  //     const userDataStored = await AsyncStorage.getItem('UserData');
  //     const locationPermission = await AsyncStorage.getItem('locationPermission');
  //     const userAddressStored = await AsyncStorage.getItem('userAddress');

  //     if (token) setIsAuthenticated(true);
  //     if (userDataStored) setUserData(JSON.parse(userDataStored));
  //     if (userAddressStored) {
  //       setUserAddress(JSON.parse(userAddressStored));
  //       hasFetchedAddress.current = true;
  //     }

  //     if (isConnected && !hasFetchedAddress.current && !locationPermission) {
  //       if (locationPermission === 'granted') {
  //         Geolocation.getCurrentPosition(
  //           pos => fetchAddressFromCoords(pos.coords.latitude, pos.coords.longitude),
  //           err => {
  //             console.error('Location error:', err);
  //             fetchAddressFromIP();
  //           },
  //           { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000, forceRequestLocation: true }
  //         );
  //       } else {
  //         const granted = await requestLocationPermission();
  //         if (granted) {
  //           Geolocation.getCurrentPosition(
  //             pos => fetchAddressFromCoords(pos.coords.latitude, pos.coords.longitude),
  //             err => {
  //               console.error('Location error:', err);
  //               fetchAddressFromIP();
  //             },
  //             { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000, forceRequestLocation: true }
  //           );
  //         } else {
  //           fetchAddressFromIP();
  //         }
  //       }
  //     }

  //     setTimeout(() => setIsLoading(false), 3000);
  //   } catch (e) {
  //     console.error('Init error:', e);
  //     setIsLoading(false);
  //   }
  // }, [isConnected, isAuthenticated]);

  const init = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userDataStored = await AsyncStorage.getItem('UserData');
      const userAddressStored = await AsyncStorage.getItem('userAddress');
      const locationPermission = await AsyncStorage.getItem('locationPermission');

      if (token) setIsAuthenticated(true);
      if (userDataStored) setUserData(JSON.parse(userDataStored));
      if (userAddressStored) {
        setUserAddress(JSON.parse(userAddressStored));
        hasFetchedAddress.current = true;
      }

      // Only request permission if it hasn't been set
      if (isConnected && !hasFetchedAddress.current && !locationPermission) {
        const granted = await requestLocationPermission();
        if (granted) {
          Geolocation.getCurrentPosition(
            pos => fetchAddressFromCoords(pos.coords.latitude, pos.coords.longitude),
            err => {
              console.error('Location error:', err);
              fetchAddressFromIP();
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000, forceRequestLocation: true }
          );
        } else {
          fetchAddressFromIP();
        }
      } else if (isConnected && !hasFetchedAddress.current && locationPermission === 'granted') {
        Geolocation.getCurrentPosition(
          pos => fetchAddressFromCoords(pos.coords.latitude, pos.coords.longitude),
          err => {
            console.error('Location error:', err);
            fetchAddressFromIP();
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000, forceRequestLocation: true }
        );
      } else if (isConnected && !hasFetchedAddress.current) {
        fetchAddressFromIP();
      }

      setTimeout(() => setIsLoading(false), 3000);
    } catch (e) {
      console.error('Init error:', e);
      setIsLoading(false);
    }
  }, [isConnected, isAuthenticated]);

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    if (isConnected && !hasFetchedAddress.current) {
      init(); // Retry location if previously skipped
    }
  }, [isConnected, init]);

  useEffect(() => {
    console.log('App.jsx user address updated:', userAddress);
  }, [userAddress]);

  useEffect(() => {
    console.log('App.jsx userData storage:', userData);
  }, [userData]);

  // Function to check subscription status
  const checkSubscription = useCallback(async () => {
    try {
      if (!userData?.userid) return;
      const postData = {
        userID: userData.userid,
        DataType: 'Status',
      };

      const response = await Apiclient.post('/checkSubscription', postData);
      console.log('Subscription check response:', response);
      if (response.status === 200) {
        setSubscriptionStatus(response.data);
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
      setSubscriptionStatus({ success: false, message: 'Subscription check failed' });
    }
  }, [userData?.userid, setSubscriptionStatus]);



  useEffect(() => {
    if (isAuthenticated && userData?.userid) {
      fetchProfileDetails();
      checkSubscription();
    }
  }, [isAuthenticated, userData?.userid, fetchProfileDetails, checkSubscription]);

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
                  <Stack.Screen name="TermsOfUse">
                    {props => (
                      <TermsOfUseScreen
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
