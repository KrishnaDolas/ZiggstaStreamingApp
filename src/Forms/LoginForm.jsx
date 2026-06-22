import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { styles, themeStyles } from '../../assets/styles/ThemeStyles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';
import Apiclient from '../utils/Apiclient';
import { useAppContext } from '../context/AppContext';

export const LoginForm = ({
  onLogin,
  ShowloginForm,
  SigninWithApple,
  SigninWithFacebook,
  SigninWithGoogle,
  theme,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotEmailTouched, setForgotEmailTouched] = useState(false);

  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  const [error, setError] = useState('');
  const [forgotPasswordError, setForgotPasswordError] = useState('');

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const { setUserData } = useAppContext();
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Email validation
  const isValidEmail = (email) => {
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(
      email.trim(),
    );
  };


  // Login handler
  const handleLogin = async () => {
    if (loading) return;

    setError('');

    const trimmedEmail = email.trim();
    const trimmedPassword = password;

    if (!trimmedEmail || !trimmedPassword) {
      setError('Please fill in all fields');
      return;
    }

    // Email validation only
    if (email !== trimmedEmail) {
      setError('Email should not start or end with spaces');
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      const parameter = {
        email: trimmedEmail,
        password: trimmedPassword,
      };

      const res = await Apiclient.post('/auth/login', parameter);
      if (res.status === 200) {
        await AsyncStorage.setItem('token', res.data.token);

        const userDataString = JSON.stringify(res.data.user);

        await AsyncStorage.setItem('UserData', userDataString);

        setUserData(res.data.user); // IMPORTANT

        await AsyncStorage.setItem('username', trimmedEmail);
        await AsyncStorage.setItem('password', trimmedPassword);

        onLogin();
      } else {
        setError(res.data.message);
      }
    } catch (err) {
      setError(
        err?.response?.data?.error || 'Invalid credentials',
      );
    } finally {
      setLoading(false);
    }
  };

  // Forgot Password
  const handleForgotPassword = () => {
    const trimmedEmail = forgotEmail.trim();

    if (!trimmedEmail) {
      setForgotPasswordError('Email is required');
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      setForgotPasswordError(
        'Please enter a valid email address',
      );
      return;
    }

    setForgotPasswordError('');

    Alert.alert(
      'Coming Soon',
      'Password reset functionality is coming soon.',
    );
  };

  // Fetch stored credentials
  useEffect(() => {
    const fetchStoredCredentials = async () => {
      try {
        const username = await AsyncStorage.getItem(
          'username',
        );

        const storedPassword =
          await AsyncStorage.getItem('password');

        if (username !== null) {
          setEmail(username);
        }

        if (storedPassword !== null) {
          setPassword(storedPassword);
        }
      } catch (err) {
        console.warn(
          'Error reading from AsyncStorage:',
          err,
        );
      }
    };

    fetchStoredCredentials();
  }, []);

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <View
          style={[
            styles.formContainer,
            themeStyles[theme].formContainer,
            forgotPasswordMode && {
              minHeight: 460,
              justifyContent: 'center',
              paddingVertical: 25,
            },
          ]}
        >
          <Text
            style={[
              styles.formTitle,
              themeStyles[theme].text,
            ]}
          >
            {forgotPasswordMode
              ? 'Forgot Password'
              : 'Sign In'}
          </Text>

          {/* FORGOT PASSWORD SCREEN */}
          {forgotPasswordMode ? (
            <>
              <View style={{ width: '100%', padding: 7 }}>
                <Text
                  style={[
                    styles.SingInlabel,
                    themeStyles[theme].SingInlabel,
                  ]}
                >
                  Email
                </Text>

                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <TextInput
                    value={forgotEmail}
                    onChangeText={(text) => {
                      setForgotEmail(text);
                    }}
                    onBlur={() => {
                      setForgotEmailTouched(true);
                    }}
                    style={[
                      styles.input,
                      themeStyles[theme].input,
                    ]}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholder="Enter Email Address"
                    placeholderTextColor={
                      themeStyles[theme].placeholder.color
                    }
                    maxLength={50}
                  />

                  <View
                    style={{
                      position: 'absolute',
                      right: 20,
                      top: 23,
                    }}
                  >
                    {forgotEmail.length > 0 ? (
                      isValidEmail(
                        forgotEmail.trim(),
                      ) ? (
                        <Icon
                          name="check-circle"
                          size={20}
                          color="green"
                        />
                      ) : (
                        <Icon
                          name="times-circle"
                          size={20}
                          color="red"
                        />
                      )
                    ) : (
                      <Icon
                        name="envelope-o"
                        size={18}
                        color={
                          theme === 'light'
                            ? '#1e1e1e'
                            : 'white'
                        }
                      />
                    )}
                  </View>
                </View>

                {forgotEmailTouched &&
                  forgotEmail.length > 0 && (
                    <Text
                      style={{
                        color: isValidEmail(
                          forgotEmail.trim(),
                        )
                          ? 'green'
                          : 'red',
                        marginTop: 5,
                        fontSize: 13,
                      }}
                    >
                      {isValidEmail(
                        forgotEmail.trim(),
                      )
                        ? 'Valid email address'
                        : 'Invalid email address'}
                    </Text>
                  )}
              </View>

              {forgotPasswordError ? (
                <View style={styles.Loginerror}>
                  <Text
                    style={[
                      styles.error,
                      themeStyles[theme].error,
                    ]}
                  >
                    {forgotPasswordError}
                  </Text>
                </View>
              ) : null}

              <TouchableOpacity
                style={[
                  styles.button,
                  themeStyles[theme].button,
                ]}
                onPress={handleForgotPassword}
              >
                <LinearGradient
                  colors={[
                    'rgb(238, 41, 123)',
                    'rgb(183, 1, 255)',
                  ]}
                  start={{ x: 1, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={styles.gradientBackground}
                >
                  <Text style={styles.buttonText}>
                    Send Reset Link
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setForgotPasswordMode(false);
                  setForgotEmail('');
                  setForgotPasswordError('');
                }}
                style={{
                  alignItems: 'center',
                  marginTop: 20,
                }}
              >
                <Text
                  style={{
                    color:
                      theme === 'dark'
                        ? '#fff'
                        : 'blue',
                    textDecorationLine: 'underline',
                    fontSize: 16,
                  }}
                >
                  Back to Sign In
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              {/* EMAIL */}
              <View style={{ width: '100%', padding: 7 }}>
                <Text
                  style={[
                    styles.SingInlabel,
                    themeStyles[theme].SingInlabel,
                  ]}
                >
                  Email
                </Text>

                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <TextInput
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                    }}
                    onBlur={() => {
                      setEmailTouched(true);

                      const trimmedEmail = email.trim();

                      if (!trimmedEmail) {
                        setEmailError('Email is required');
                      } else if (email !== trimmedEmail) {
                        setEmailError(
                          'Email should not start or end with spaces',
                        );
                      } else if (!isValidEmail(trimmedEmail)) {
                        setEmailError(
                          'Please enter a valid email address',
                        );
                      } else {
                        setEmailError('');
                      }
                    }}
                    style={[
                      styles.input,
                      themeStyles[theme].input,
                    ]}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholder="Enter Email Address"
                    placeholderTextColor={
                      themeStyles[theme].placeholder.color
                    }
                    maxLength={50}
                  />

                  <View
                    style={{
                      position: 'absolute',
                      right: 20,
                      top: 23,
                    }}
                  >
                    {email.length > 0 ? (
                      isValidEmail(email.trim()) ? (
                        <Icon
                          name="check-circle"
                          size={20}
                          color="green"
                        />
                      ) : (
                        <Icon
                          name="times-circle"
                          size={20}
                          color="red"
                        />
                      )
                    ) : (
                      <Icon
                        name="envelope-o"
                        size={18}
                        color={
                          theme === 'light'
                            ? '#1e1e1e'
                            : 'white'
                        }
                      />
                    )}
                  </View>
                </View>

                {emailError ? (
                  <Text
                    style={{
                      color: 'red',
                      marginTop: 4,
                      fontSize: 13,
                      paddingHorizontal: 12,
                    }}
                  >
                    {emailError}
                  </Text>
                ) : null}

                {emailTouched &&
                  email.length > 0 && (
                    <Text
                      style={{
                        color: isValidEmail(email.trim())
                          ? 'green'
                          : 'red',
                        marginTop: 5,
                        fontSize: 13,
                      }}
                    >
                      {isValidEmail(email.trim())
                        ? 'Valid email address'
                        : 'Invalid email address'}
                    </Text>
                  )}
              </View>

              {/* PASSWORD */}
              <View style={{ width: '100%', padding: 7 }}>
                <Text
                  style={[
                    styles.SingInlabel,
                    themeStyles[theme].SingInlabel,
                  ]}
                >
                  Password
                </Text>

                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <TextInput
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                    }}
                    onBlur={() => {
                      setPasswordTouched(true);

                      if (!password.trim()) {
                        setPasswordError(
                          'Password is required',
                        );
                      } else {
                        setPasswordError('');
                      }
                    }}
                    style={[
                      styles.input,
                      themeStyles[theme].input,
                    ]}
                    secureTextEntry={!showPassword}
                    placeholder="Enter Password"
                    placeholderTextColor={
                      themeStyles[theme].placeholder.color
                    }
                    maxLength={12}
                  />

                  <View
                    style={{
                      position: 'absolute',
                      right: 50,
                      top: 23,
                    }}
                  >
                    {passwordTouched && password.length > 0 ? (
                      <Icon
                        name="check-circle"
                        size={20}
                        color="green"
                      />
                    ) : null}
                  </View>

                  <TouchableOpacity
                    onPress={
                      togglePasswordVisibility
                    }
                    style={{
                      padding: 10,
                      position: 'absolute',
                      right: 10,
                      top: 10,
                    }}
                  >
                    <Icon
                      name={
                        showPassword
                          ? 'eye'
                          : 'eye-slash'
                      }
                      size={20}
                      color={
                        theme === 'light'
                          ? 'black'
                          : 'white'
                      }
                    />
                  </TouchableOpacity>
                </View>

                {passwordError ? (
                  <Text
                    style={{
                      color: 'red',
                      marginTop: 4,
                      fontSize: 13,
                      paddingHorizontal: 12,
                    }}
                  >
                    {passwordError}
                  </Text>
                ) : null}

                {passwordTouched &&
                  password.length > 0 &&
                  !passwordError && (
                    <Text
                      style={{
                        color: 'green',
                        marginTop: 5,
                        fontSize: 13,
                      }}
                    >
                      Password looks good
                    </Text>
                  )}
              </View>

              {/* ERROR */}
              <View style={styles.Loginerror}>
                {error ? (
                  <Text
                    style={[
                      styles.error,
                      themeStyles[theme].error,
                    ]}
                  >
                    {error}
                  </Text>
                ) : null}
              </View>

              {/* SIGN IN BUTTON */}
              <TouchableOpacity
                style={[
                  styles.button,
                  themeStyles[theme].button,
                  {
                    opacity: loading ? 0.7 : 1,
                  },
                ]}
                onPress={handleLogin}
                disabled={loading}
              >
                <LinearGradient
                  colors={[
                    'rgb(238, 41, 123)',
                    'rgb(183, 1, 255)',
                  ]}
                  start={{ x: 1, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={styles.gradientBackground}
                >
                  {loading ? (
                    <ActivityIndicator
                      color="#fff"
                    />
                  ) : (
                    <Text style={styles.buttonText}>
                      Sign In
                    </Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* FORGOT PASSWORD */}
              <TouchableOpacity
                onPress={() =>
                  setForgotPasswordMode(true)
                }
                style={{
                  alignItems: 'center',
                  marginTop: 15,
                }}
              >
                <Text
                  style={{
                    color:
                      theme === 'dark'
                        ? '#fff'
                        : 'blue',
                    textDecorationLine: 'underline',
                    fontSize: 15,
                  }}
                >
                  Forgot Password?
                </Text>
              </TouchableOpacity>

              {/* SIGN UP */}
              <TouchableOpacity
                onPress={() => ShowloginForm()}
                style={{
                  alignItems: 'center',
                  marginTop: 20,
                }}
              >
                <Text
                  style={{
                    color:
                      theme === 'dark'
                        ? '#fff'
                        : 'blue',
                    textDecorationLine: 'underline',
                    fontSize: 16,
                  }}
                >
                  Don't have an account? Sign Up
                </Text>
              </TouchableOpacity>

              {/* SOCIAL LOGIN */}
              <View style={styles.Loginoption}>
                <TouchableOpacity
                  style={[
                    styles.Loginoptionbtn,
                    styles.Applebtn,
                  ]}
                  onPress={() =>
                    SigninWithApple()
                  }
                >
                  <Icon
                    name="apple"
                    size={24}
                    color="#fff"
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.Loginoptionbtn,
                    styles.Facebookbtn,
                  ]}
                  onPress={() =>
                    SigninWithFacebook()
                  }
                >
                  <Icon
                    name="facebook"
                    size={24}
                    color="#fff"
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.Loginoptionbtn,
                    styles.Googlebtn,
                  ]}
                  onPress={() =>
                    SigninWithGoogle()
                  }
                >
                  <Icon
                    name="google"
                    size={24}
                    color="#fff"
                  />
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </>
  );
};