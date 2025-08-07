import React, { useState, useContext } from 'react';
import { View, Alert, ActivityIndicator } from 'react-native';
import { ThemeContext } from '../context/ThemeContext';
import { RegisterForm } from '../Forms/RegisterForm';
import { styles, themeStyles } from '../../assets/styles/ThemeStyles';
import { Signup } from '../Forms/Signup';
import { LoginForm } from '../Forms/LoginForm';
import Colors from '../../assets/styles/Colors';

export const AuthScreen = ({ onLogin }) => {
  const [showsingup, setshowsingup] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const { theme } = useContext(ThemeContext);
  const [userData, setUserData] = useState({ email: '', password: '' });


  const toggleForm = () => {
    setLoading(true);
    setTimeout(() => {
      setshowsingup(!showsingup);
      setLoading(false);
    }, 2000); // Loader displays for 2 seconds
  };


  const ShowloginForm = () => {
    setShowLogin(!showLogin);
  }


  const SigninWithApple = () => {
    Alert.alert(
      "Coming Soon",
      "Sign in with Apple is not yet implemented.",
      [{ text: "OK" }]
    );
    // Implement Sign in with Apple logic here
    console.log("Sign in with Apple clicked");
  }

  const SigninWithGoogle = () => {
    Alert.alert(
      "Coming Soon",
      "Sign in with Google is not yet implemented.",
      [{ text: "OK" }]
    );
    // Implement Sign in with Google logic here
    console.log("Sign in with Google clicked");
  }

  const SigninWithFacebook = () => {
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
      {loading && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: theme === 'dark' ? Colors.blackBgColor : '#fff', // Semi-transparent overlay
            zIndex: 1000,
          }}
        >
          <ActivityIndicator
            size="large"
          />
        </View>
      )}
      {showLogin ?
        (
          <LoginForm ShowloginForm={ShowloginForm} onLogin={onLogin} theme={theme} SigninWithApple={SigninWithApple} SigninWithFacebook={SigninWithFacebook} SigninWithGoogle={SigninWithGoogle} />
        ) : showsingup ? (
          <Signup userData={userData} setUserData={setUserData} ShowloginForm={ShowloginForm} onToggleForm={toggleForm} SigninWithApple={SigninWithApple} SigninWithFacebook={SigninWithFacebook} SigninWithGoogle={SigninWithGoogle} theme={theme} />
        ) : (
          <RegisterForm userData={userData} theme={theme} onLogin={onLogin} />
        )}
    </View>
  );
};