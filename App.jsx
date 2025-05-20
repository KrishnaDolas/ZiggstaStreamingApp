import React, { useEffect, useState } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ThemeProvider } from './src/context/ThemeProvider';
import { MainScreen } from './src/screens/MainScreen';
import { AuthScreen } from './src/screens/AuthScreen';
import { SplashScreen } from './src/screens/SplashScreen';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userAddress, setUserAddress] = useState('');

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    await AsyncStorage.clear();
    setIsAuthenticated(false);
  };

  // Request location permission and get location/address
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
          console.log('Coordinates:', latitude, longitude);
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
        const address = data.results[0].formatted;
        console.log(data.results[0].components);
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
      setTimeout(() => {
        setIsLoading(false);
      }, 3000);

      const token = await AsyncStorage.getItem('token');
      setIsAuthenticated(!!token);

      await requestLocationPermission(); // trigger location/address fetch
    };

    init();
  }, []);

  return (
    <ThemeProvider>
      {isLoading ? (
        <SplashScreen />
      ) : isAuthenticated ? (
        <MainScreen onLogout={handleLogout} address={userAddress} />
      ) : (
        <AuthScreen onLogin={handleLogin} userAddress={userAddress} />
      )}
    </ThemeProvider>
  );
};

export default App;
