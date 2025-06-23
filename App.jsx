import React, { useEffect, useState } from 'react';
import {
  PermissionsAndroid,
  Platform,
  ActivityIndicator,
  View,
  Text,
  StyleSheet,
  AppState,
  Alert,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Geolocation from 'react-native-geolocation-service';
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
  const [userAddress, setUserAddress] = useState('');
  const [userData, setUserData] = useState({});

  const handleLogin = () => setIsAuthenticated(true);



  // const handleLogout = async () => {
  //   await AsyncStorage.clear();
  //   setIsAuthenticated(false);
  // };

  const handleLogout = async () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to log out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              setIsAuthenticated(false);
              Alert.alert('Success', 'You have been logged out successfully.');
            } catch (error) {
              Alert.alert('Error', 'Failed to log out. Please try again.');
              console.error('Logout error:', error);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const requestLocationPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'This app needs access to your location.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Location permission denied');
          return;
        }
      }

      Geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude } = position.coords;
          fetchAddress(latitude, longitude);
        },
        error => {
          console.error('Location error:', error.code, error.message);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
          forceRequestLocation: true,
        }
      );
    } catch (error) {
      console.error('Permission error:', error);
    }
  };

  const fetchAddress = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=90c7b0d04a124d608bbadec11fe2c630`
      );
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        setUserAddress(data.results[0].components);
      } else {
        console.log('No address found');
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const userDataStored = await AsyncStorage.getItem('UserData');
        if (token) {
          setIsAuthenticated(true);
        }

        if (userDataStored) {
          setUserData(JSON.parse(userDataStored));
        }

        if (isConnected && !userAddress && !isAuthenticated) {
          await requestLocationPermission();
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
  }, [isConnected, userData, isAuthenticated]);

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
                        onLogout={handleLogout}
                        address={userAddress}
                        userData={userData}
                      />
                    )}
                  </Stack.Screen>
                  <Stack.Screen name="Profile">
                    {props => (
                      <ProfileScreen
                        {...props}
                        onLogout={handleLogout}
                        userData={userData}
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
                      userAddress={userAddress}
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
