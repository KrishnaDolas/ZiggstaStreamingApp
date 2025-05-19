import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { ThemeContext } from '../context/ThemeContext';
import { styles, themeStyles } from '../../assets/styles/ThemeStyles';

export const RegisterForm = ({ onRegister, onToggleForm, setError }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { theme } = useContext(ThemeContext);

  const handleRegister = () => {
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (email && password) {
      onRegister();
    } else {
      setError('Please fill all fields');
    }
  };

  return (
    <View style={[styles.formContainer, themeStyles[theme].formContainer]}>
      <Text style={[styles.formTitle, themeStyles[theme].text]}>Register</Text>
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
      <TextInput
        placeholder="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
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