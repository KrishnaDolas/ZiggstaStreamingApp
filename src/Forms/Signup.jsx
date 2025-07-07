import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { styles, themeStyles } from '../../assets/styles/ThemeStyles';
import LinearGradient from 'react-native-linear-gradient';
export const Signup = ({
  userData,
  setUserData,
  ShowloginForm,
  onToggleForm,
  SigninWithApple,
  SigninWithFacebook,
  SigninWithGoogle,
  theme
}) => {
  const [username, setUsername] = useState(userData.username || '');
  const [password, setPassword] = useState(userData.password || '');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');


  const isValidUsername = name =>
    /^[a-zA-Z0-9_]+$/.test(name) && name.length >= 6 && !/\s/.test(name);

  const blacklistedUsernames = ['admin', 'root', 'test'];

  const handleSignUp = async () => {
    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();
    const trimmedConfirmPassword = confirmPassword.trim();

    try {
      // if (!username || !password || !confirmPassword) {
      //   setError('Please fill in all fields');
      //   return;
      // }
      if (username !== trimmedUsername) {
        setError('Username should not start or end with spaces');
        return;
      }
      if (!isValidUsername(trimmedUsername)) {
        setError('Username must be at least 6 characters with only letters, numbers, or _');
        return;
      }
      if (blacklistedUsernames.includes(trimmedUsername.toLowerCase())) {
        setError('This username is not allowed');
        return;
      }
      if (password !== trimmedPassword) {
        setError('Password should not start or end with spaces');
        return;
      }
      if (trimmedPassword.length < 6 || trimmedPassword.length > 12) {
        setError('Password must be between 6 and 12 characters long');
        return;
      }
      if (/\s/.test(trimmedPassword)) {
        setError('Password cannot contain spaces');
        return;
      }
      if (confirmPassword !== trimmedConfirmPassword) {
        setError('Confirm Password should not start or end with spaces');
        return;
      }
      if (trimmedPassword !== trimmedConfirmPassword) {
        setError('Passwords do not match');
        return;
      }

      setUserData({ username: trimmedUsername, password: trimmedPassword });
      onToggleForm();
      console.log(`Username: ${trimmedUsername}, Password: ${trimmedPassword}`);
    } catch (err) {
      console.log(err);
      setError(err?.response?.data?.error || 'Something went wrong');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <>
      <ScrollView style={{ position: 'absolute', flex: 1, width: '100%', height: '100%', top: '10%' }}>
        <View style={[styles.formContainer, themeStyles[theme].formContainer]}>
          <Text style={[styles.formTitle, themeStyles[theme].text]}>Sign Up</Text>
          <View style={[{ width: '100%', padding: '7' }]}>
            <Text style={[styles.SingInlabel, themeStyles[theme].SingInlabel]}>User Name</Text>
            <TextInput
              value={username}
              onChangeText={setUsername}
              style={[styles.input, themeStyles[theme].input]}
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
                secureTextEntry={!showConfirmPassword}
                placeholderTextColor={themeStyles[theme].placeholder.color}
              />
              <TouchableOpacity onPress={toggleConfirmPasswordVisibility} style={{ padding: 10, position: 'absolute', right: 15, top: 10 }}>
                <Icon
                  name={showConfirmPassword ? 'eye' : 'eye-slash'}
                  size={20}
                  color={theme === 'light' ? 'black' : 'white'}
                />
              </TouchableOpacity>
            </View>
          </View>
          <View style={[{ width: '100%', padding: '7' }]}>
            <Text style={[styles.SingInlabel, themeStyles[theme].SingInlabel]}>Confirm Password</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
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
          <TouchableOpacity style={[themeStyles[theme].button]} onPress={handleSignUp}>
            <LinearGradient
              colors={['rgb(238, 41, 123)', 'rgb(183, 1, 255)']}
              start={{ x: 1, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.button}
            >
              <Text style={styles.buttonText}>Sign Up</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => ShowloginForm()} style={{ alignItems: 'center', marginTop: 20 }}>
            <Text style={{ color: theme === 'dark' ? '#fff' : 'blue', textDecorationLine: 'underline', fontSize: 16 }}>Already have an account? Sign In</Text>
          </TouchableOpacity>
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
      </ScrollView>
    </>
  );
};