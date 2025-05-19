import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, AsyncStorage } from 'react-native';
import axios from 'axios';
import { ThemeContext } from '../context/ThemeContext';
import { styles, themeStyles } from '../../assets/styles/ThemeStyles';
export const LoginForm = ({ onLogin, onToggleForm, setError }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { theme } = useContext(ThemeContext);
  
    const handleLogin = () => {
      axios
        .post('https://api.streamalong.live/login', {
          username: email,
          password: password,
        })
        .then((res) => {
          onLogin();
          // AsyncStorage.setItem('token', res.data.token);
          console.log(res); // This is your response body
        })
        .catch((err) => {
          console.log(err);
          onLogin();
          setError(err?.response?.data?.error || 'Something went wrong');
        });
    };
  
    return (
      <View style={[styles.formContainer, themeStyles[theme].formContainer]}>
        <Text style={[styles.formTitle, themeStyles[theme].text]}>Login</Text>
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          style={[styles.input, themeStyles[theme].input]}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor={themeStyles[theme].placeholder.color}
        />
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          style={[styles.input, themeStyles[theme].input]}
          secureTextEntry
          placeholderTextColor={themeStyles[theme].placeholder.color}
        />
        <TouchableOpacity style={[styles.button, themeStyles[theme].button]} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onToggleForm}>
          <Text style={[styles.toggleText, themeStyles[theme].linkText]}>Don't have an account? Register</Text>
        </TouchableOpacity>
      </View>
    );
  };