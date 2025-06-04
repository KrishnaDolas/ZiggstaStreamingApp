import React, { useState, useContext, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity,Alert, ScrollView  } from 'react-native';
import axios from 'axios';
import { ThemeContext } from '../context/ThemeContext';
import { styles, themeStyles } from '../../assets/styles/ThemeStyles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
 const navigation = useNavigation();
export const LoginForm = ({ onLogin, onToggleForm, setError }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { theme } = useContext(ThemeContext);
  
    const handleLogin = async () => {
      try {
        if (!email || !password) {
          setError('Please fill in all fields');
          return;
        }
        const parameter={
          username: email,
          password: password,
        }
        const res = await axios.post('https://api.streamalong.live/login',parameter, {
          headers: {
            'x-api-key': '6cca5d4e-719b-4c28-aabd-4aeb2618ee1d',
          },
        }
        );
        if(res.data.message==='Login successful') {
          console.log(res.data.user);
          await AsyncStorage.setItem('token', res.data.token);

      const userDataString = JSON.stringify(res.data.user);
      await AsyncStorage.setItem('UserData', userDataString);
          onLogin();
          navigation.navigate('Auth')
          Alert.alert('Success',  `LogIn Success.`, [{ text: 'OK' }]);
        }
      } catch (err) {
        console.log(err);
        setError(err?.response?.data?.error || 'Something went wrong');
      }
    };
    
    useEffect(() => {
      const fetchStoredCredentials = async () => {
        try {
          const username = await AsyncStorage.getItem('username');
          const password = await AsyncStorage.getItem('password');
          if (username !== null) {
            setEmail(username);
          }
          if (password !== null) {
            setPassword(password);
          } 

        } catch (err) {
          console.warn('Error reading from AsyncStorage:', err);
        }
      };
    
      fetchStoredCredentials();
    }, []); // No need to depend on email or password if just reading on mount
    
    return (
      <>
      <ScrollView style={{position:'absolute', flex:1, width:'100%', height:'100%',top:'30%'}}>
      <View style={[styles.formContainer, themeStyles[theme].formContainer]}>
        <Text style={[styles.formTitle, themeStyles[theme].text]}>Sign In</Text>
        <View style={[{ width:'100%',padding:'7' }]}>
        <Text style={[styles.SingInlabel,themeStyles[theme].SingInlabel]}>User Name</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          style={[styles.input, themeStyles[theme].input]}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor={themeStyles[theme].placeholder.color}
        />
        </View>
        <View style={[{ width:'100%',padding:'7' }]}>
        <Text style={[styles.SingInlabel,themeStyles[theme].SingInlabel]}>Password</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          style={[styles.input, themeStyles[theme].input]}
          secureTextEntry
          placeholderTextColor={themeStyles[theme].placeholder.color}
        />
        </View>
        <LinearGradient
          colors={['rgb(238, 41, 123)', 'rgb(183, 1, 255)']}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.button}
        >
        <TouchableOpacity style={[themeStyles[theme].button]} onPress={handleLogin}>
          <Text style={styles.buttonText}>Sign In</Text>
        </TouchableOpacity>
        </LinearGradient>
        <TouchableOpacity onPress={onToggleForm}>
          <Text style={[styles.toggleText, themeStyles[theme].linkText]}>Don't have an account? Register</Text>
        </TouchableOpacity>
      </View>
      </ScrollView>
      </>
    );
  };