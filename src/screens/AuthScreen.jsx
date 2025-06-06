import React, { useState, useContext } from 'react';
import { View, Text, Alert } from 'react-native';
import { ThemeContext } from '../context/ThemeContext';
import { RegisterForm } from './RegisterForm';
import { styles, themeStyles } from '../../assets/styles/ThemeStyles';
import { Signup } from '../Forms/Signup';
import { LoginForm } from '../Forms/LoginForm';

export const AuthScreen = ({ onLogin, userAddress}) => {
  const [showsingup, setshowsingup] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const { theme } = useContext(ThemeContext);
  const [userData, setUserData] = useState({username: '', password: ''});

  const toggleForm = () => setshowsingup(!showsingup);
  const ShowloginForm=()=>{
    setShowLogin(!showLogin);
  }
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
      {showLogin? 
       ( 
       <LoginForm ShowloginForm={ShowloginForm} onLogin={onLogin} theme={theme} SigninWithApple={SigninWithApple} SigninWithFacebook={SigninWithFacebook} SigninWithGoogle={SigninWithGoogle} />
      ) :showsingup ? (
        <Signup userData={userData} setUserData={setUserData} ShowloginForm={ShowloginForm} onToggleForm={toggleForm} SigninWithApple={SigninWithApple} SigninWithFacebook={SigninWithFacebook} SigninWithGoogle={SigninWithGoogle} theme={theme} />
      ) : (
        <RegisterForm userData={userData} theme={theme} userAddress={userAddress}/>
      )}
    </View>
  );
};