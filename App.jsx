import React, {useEffect, useState } from 'react';
import { MainScreen } from './src/screens/MainScreen';
import { AuthScreen } from './src/screens/AuthScreen';
import { ThemeProvider } from './src/context/ThemeProvider';
import { SplashScreen } from './src/screens/SplashScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Main App Component
const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };
  useEffect(()=>{
  setTimeout(() => {
    setIsLoading(false);
  }, 3000);
  const checkAuth = async () => {
    const token = await AsyncStorage.getItem('token');
    console.log(token);
    console.log(!!token);
    setIsAuthenticated(!!token);
  };

  checkAuth();
  },[])
  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    setIsAuthenticated(false);
  };
  return (
    <ThemeProvider>
      {isLoading?<SplashScreen/> :isAuthenticated ? <MainScreen onLogout={handleLogout} /> : <AuthScreen onLogin={handleLogin} />}
    </ThemeProvider>
  );
};

export default App;