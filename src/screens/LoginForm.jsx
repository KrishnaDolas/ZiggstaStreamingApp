import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity,Alert  } from 'react-native';
import axios from 'axios';
import { ThemeContext } from '../context/ThemeContext';
import { styles, themeStyles } from '../../assets/styles/ThemeStyles';
import AsyncStorage from '@react-native-async-storage/async-storage';
export const LoginForm = ({ onLogin, onToggleForm, setError }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { theme } = useContext(ThemeContext);
  
    const handleLogin = async () => {
      try {
        const res = await axios.post('https://api.streamalong.live/login', {
          username: email,
          password: password,
        });
    
        await AsyncStorage.setItem('token', res.data.token); // save token
        onLogin(); // notify parent component
        Alert.alert('Success', `${email} has successfully logged in!`, [{ text: 'OK' }]);
      } catch (err) {
        console.log(err);
        setError(err?.response?.data?.error || 'Something went wrong');
      }
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