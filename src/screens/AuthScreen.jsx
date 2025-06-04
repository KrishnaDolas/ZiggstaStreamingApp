import React, { useState, useContext } from 'react';
import { View, Text } from 'react-native';
import { ThemeContext } from '../context/ThemeContext';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { styles, themeStyles } from '../../assets/styles/ThemeStyles';

export const AuthScreen = ({ onLogin ,userAddress}) => {
  const [showLogin, setShowLogin] = useState(true);
  const { theme } = useContext(ThemeContext);

  const toggleForm = () => setShowLogin(!showLogin);

  return (
    <View style={[styles.authContainer, themeStyles[theme].container]}>
      {/* <Text style={[styles.title, themeStyles[theme].text]}>🎥 ZIGGSTA</Text> */}
      {showLogin ? (
        <LoginForm onLogin={onLogin} onToggleForm={toggleForm}/>
      ) : (
        <RegisterForm onRegister={onLogin} userAddress={userAddress} onToggleForm={toggleForm}/>
      )}
    </View>
  );
};