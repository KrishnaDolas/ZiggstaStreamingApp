import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { styles, themeStyles } from '../../assets/styles/ThemeStyles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';
import Apiclient from '../utils/Apiclient';
export const LoginForm = ({ onLogin, ShowloginForm, SigninWithApple, SigninWithFacebook, SigninWithGoogle, theme }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    try {
      if (!email || !password) {
        setError('Please fill in all fields');
        return;
      }
      const parameter = {
        username: email,
        password: password,
      }

      const res = await Apiclient.post('/login', parameter)
      if (res.data.message === 'Login successful') {
        onLogin();
        console.log(res.data.user);
        await AsyncStorage.setItem('token', res.data.token);

        const userDataString = JSON.stringify(res.data.user);
        await AsyncStorage.setItem('UserData', userDataString);
        Alert.alert('Success', `LogIn Success.`, [{ text: 'OK' }]);
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

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  return (
    <>
      <ScrollView style={{ position: 'absolute', flex: 1, width: '100%', height: '100%', top: '20%' }}>
        <View style={[styles.formContainer, themeStyles[theme].formContainer]}>
          <Text style={[styles.formTitle, themeStyles[theme].text]}>Sign In</Text>
          <View style={[{ width: '100%', padding: '7' }]}>
            <Text style={[styles.SingInlabel, themeStyles[theme].SingInlabel]}>User Name</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              style={[styles.input, themeStyles[theme].input]}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor={themeStyles[theme].placeholder.color}
            />
          </View>
          <View style={[{ width: '100%', padding: '7' }]}>
            <Text style={[styles.SingInlabel, themeStyles[theme].SingInlabel]}>Password</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TextInput
                value={password}
                onChangeText={setPassword}
                style={[styles.input, themeStyles[theme].input]}
                secureTextEntry={!showPassword}
                placeholderTextColor={themeStyles[theme].placeholder.color}
              />
              <TouchableOpacity onPress={togglePasswordVisibility} style={{ padding: 10, position: 'absolute', right: 15, top: 10 }}>
                <Icon
                  name={showPassword ? 'eye' : 'eye-slash'}
                  size={20}
                  color={theme === 'light' ? 'black' : 'white'}
                />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.Loginerror}>
            {error ? <Text style={[styles.error, themeStyles[theme].error]}>{error}</Text> : null}
          </View>
          <TouchableOpacity style={[themeStyles[theme].button]} onPress={handleLogin}>
            <LinearGradient
              colors={['rgb(238, 41, 123)', 'rgb(183, 1, 255)']}
              start={{ x: 1, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.button}
            >
              <Text style={styles.buttonText}>Sign In</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => ShowloginForm()} style={{ alignItems: 'center', marginTop: 20 }}>
            <Text style={{ color: 'blue', textDecorationLine: 'underline', fontSize: 16 }}>
              Don't have an account? Sign Up
            </Text>
          </TouchableOpacity>
          <View style={[styles.Othersinginoption, { marginBottom: 80 }]}>
            <View style={styles.Loginoption}>
              <TouchableOpacity style={[styles.Loginoptionbtn, styles.Applebtn]} onPress={() => SigninWithApple()}>
                <Icon name="apple" size={24} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.Loginoptionbtn, styles.Facebookbtn]} onPress={() => SigninWithFacebook()}>
                <Icon name="facebook" size={24} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.Loginoptionbtn, styles.Googlebtn]} onPress={() => SigninWithGoogle()}>
                <Icon name="google" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </>
  );
};