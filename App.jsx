import React, { useEffect, useState } from 'react';
import {
  PermissionsAndroid,
  Platform,
  ActivityIndicator,
  View,
  Text,
  StyleSheet,
} from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { ThemeProvider } from './src/context/ThemeProvider';
import { MainScreen } from './src/screens/MainScreen';
import { AuthScreen } from './src/screens/AuthScreen';
import { SplashScreen } from './src/screens/SplashScreen';

// ✅ Offline screen component
const NetworkCheck = () => {
  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color="#0000ff" />
      <Text style={styles.text}>No Internet Connection</Text>
    </View>
  );
};

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(true);
  const [userAddress, setUserAddress] = useState('');

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    await AsyncStorage.clear();
    setIsAuthenticated(false);
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
        `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=c4e3347f0fd44efbbb4fc4f7c7985659`
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
      const token = await AsyncStorage.getItem('token');
      setIsAuthenticated(!!token);

      // Trigger location only if connected
      if (isConnected) {
        await requestLocationPermission();
      }

      setTimeout(() => {
        setIsLoading(false);
      }, 3000);
    };

    init();
  }, [isConnected]);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isInternetReachable === true);
    });

    return () => unsubscribe();
  }, []);

  return (
    <ThemeProvider>
      {!isConnected ? (
        <NetworkCheck />
      ) : isLoading ? (
        <SplashScreen />
      ) : isAuthenticated ? (
        <MainScreen onLogout={handleLogout} address={userAddress} />
      ) : (
        <AuthScreen onLogin={handleLogin} userAddress={userAddress} />
      )}
    </ThemeProvider>
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
