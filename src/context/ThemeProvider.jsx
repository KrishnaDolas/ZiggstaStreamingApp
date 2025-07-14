import React, { useEffect, useState } from 'react';
import { ThemeContext } from './ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');

  // Load theme from AsyncStorage
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('APP_THEME');
        if (savedTheme) {
          setTheme(savedTheme);
        }
      } catch (error) {
        console.log('Failed to load theme from storage:', error);
      }
    };

    loadTheme();
  }, []);

  // Toggle and store theme
  const toggleTheme = async () => {
    try {
      const newTheme = theme === 'light' ? 'dark' : 'light';
      setTheme(newTheme);
      await AsyncStorage.setItem('APP_THEME', newTheme);
    } catch (error) {
      console.log('Failed to save theme to storage:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};