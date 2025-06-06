import React, { useState, useContext } from 'react';
import { View, Text, Alert } from 'react-native';
import { ThemeContext } from '../context/ThemeContext';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { styles, themeStyles } from '../../assets/styles/ThemeStyles';

export const AuthScreen = ({ onLogin}) => {
  const [showLogin, setShowLogin] = useState(false);
  const { theme } = useContext(ThemeContext);

  const toggleForm = () => setShowLogin(!showLogin);
//x-api-key: 6cca5d4e-719b-4c28-aabd-4aeb2618ee1d
  const SigninWithApple=()=>{
    Alert.alert(
      "Coming Soon",
      "Sign in with Apple is not yet implemented.",
      [{ text: "OK" }]
    );
    // Implement Sign in with Apple logic here
    console.log("Sign in with Apple clicked");
  }

  const SigninWithGoogle=()=>{
  Alert.alert(
      "Coming Soon",
      "Sign in with Google is not yet implemented.",
      [{ text: "OK" }]
    );
    // Implement Sign in with Google logic here
    console.log("Sign in with Google clicked");
  }

  const SigninWithFacebook=()=>{
  Alert.alert(
      "Coming Soon",
      "Sign in with Facebook is not yet implemented.",
      [{ text: "OK" }]
    );
    // Implement Sign in with Facebook logic here
    console.log("Sign in with Facebook clicked");
  }

  return (
    <View style={[styles.authContainer, themeStyles[theme].container]}>
      {/* <Text style={[styles.title, themeStyles[theme].text]}>🎥 ZIGGSTA</Text> */}
      {showLogin ? (
        <LoginForm onLogin={onLogin} onToggleForm={toggleForm} SigninWithApple={SigninWithApple} SigninWithFacebook={SigninWithFacebook} SigninWithGoogle={SigninWithGoogle} />
      ) : (
        <RegisterForm/>
      )}
    </View>
  );
};