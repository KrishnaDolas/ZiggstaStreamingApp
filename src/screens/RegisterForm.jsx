import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { ThemeContext } from '../context/ThemeContext';
import { styles, themeStyles } from '../../assets/styles/ThemeStyles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
export const RegisterForm = ({ onRegister,userAddress, onToggleForm, setError }) => {
  const { theme } = useContext(ThemeContext);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    selectedInterests: [],
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  const handleRegister = async() => {
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    try {
      const parameter={
        username: formData.username,
        password: formData.password,
        email: formData.email,
        screenName:'JUMBO',
        city: userAddress.city,
        country: userAddress.country,
        state: userAddress.state,
        zipcode: userAddress.postcode,
        interests: 'Music, Chess',
      }
      const res = await axios.post('https://api.streamalong.live/register',parameter );
      if(res.data.message === 'User registered successfully!') {
        console.log(res.data);
        console.log(formData.username);
        console.log(formData.password);
        await AsyncStorage.setItem('username', formData.username); // save token
       await  AsyncStorage.setItem('password', formData.password); // save token
        setError(''); // clear error
        onToggleForm()
        setFormData({
          username: '',
          email: '',
          password: '',
          confirmPassword: '',
          selectedInterests: [],
        });
      }else{
        setError(res.data.message)
      }
    } catch (err) {
      console.log(err);
      setError(err?.response?.data?.error || 'Something went wrong');
    }
  };

  return (
    <View style={[styles.formContainer, themeStyles[theme].formContainer]}>
      <Text style={[styles.formTitle, themeStyles[theme].text]}>Register</Text>
      <TextInput
        placeholder="UserName"
        value={formData.username}
        onChangeText={(text) => handleChange('username', text)}
        style={[styles.input, themeStyles[theme].input]}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholderTextColor={themeStyles[theme].placeholder.color}
      />
      <TextInput
        placeholder="Email"
        value={formData.email}
        onChangeText={(text) => handleChange('email', text)}
        style={[styles.input, themeStyles[theme].input]}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholderTextColor={themeStyles[theme].placeholder.color}
      />
      <TextInput
        placeholder="Password"
        value={formData.password}
        onChangeText={(text) => handleChange('password', text)}
        style={[styles.input, themeStyles[theme].input]}
        secureTextEntry
        placeholderTextColor={themeStyles[theme].placeholder.color}
      />
      <TextInput
        placeholder="Confirm Password"
        value={formData.confirmPassword}
        onChangeText={(text) => handleChange('confirmPassword', text)}
        style={[styles.input, themeStyles[theme].input]}
        secureTextEntry
        placeholderTextColor={themeStyles[theme].placeholder.color}
      />
      <TouchableOpacity style={[styles.button, themeStyles[theme].button]} onPress={handleRegister}>
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onToggleForm}>
        <Text style={[styles.toggleText, themeStyles[theme].linkText]}>Already have an account? Login</Text>
      </TouchableOpacity>
    </View>
  );
};