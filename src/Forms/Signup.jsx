import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { styles, themeStyles } from '../../assets/styles/ThemeStyles';
import LinearGradient from 'react-native-linear-gradient';
import Apiclient from '../utils/Apiclient';

export const Signup = ({
  userData,
  setUserData,
  ShowloginForm,
  onToggleForm,
  SigninWithApple,
  SigninWithFacebook,
  SigninWithGoogle,
  theme,
}) => {
  const [email, setEmail] = useState(userData.email || '');
  const [password, setPassword] = useState(userData.password || '');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isAbove18, setIsAbove18] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [termsError, setTermsError] = useState('');
  const [isFormValid, setIsFormValid] = useState(false);
  const [referrerCode, setReferrerCode] = useState('');

  const [checkingEmail, setCheckingEmail] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState(null);
  const [emailTouched, setEmailTouched] = useState(false);

  const [passwordTouched, setPasswordTouched] = useState(false);
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false);

  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotEmailTouched, setForgotEmailTouched] = useState(false);
  const [forgotPasswordError, setForgotPasswordError] = useState('');
  const [submitAttempted, setSubmitAttempted] = useState(false);

  // Email validation
  const isValidEmail = (email) => {
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(
      email.trim(),
    );
  };

  // Password validation
  const isValidPassword = (pass) => {
    const passwordRegex =
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)[A-Za-z\d]{6,12}$/;

    return passwordRegex.test(pass);
  };

  // Password match check
  const passwordsMatch =
    password.trim() !== '' &&
    confirmPassword.trim() !== '' &&
    password.trim() === confirmPassword.trim();

  // Validate form
  useEffect(() => {
    validateForm();
  }, [
    email,
    password,
    confirmPassword,
    acceptTerms,
    isAbove18,
    emailAvailable,
    emailTouched,
    passwordTouched,
    confirmPasswordTouched,
  ]);

  const validateForm = () => {
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');
    setTermsError('');
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    const trimmedConfirmPassword = confirmPassword.trim();

    if (email !== trimmedEmail) {
      setEmailError('Email should not start or end with spaces');
      setIsFormValid(false);
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      if (emailTouched) {
        setEmailError('Please enter a valid email address');
      } else {
        setEmailError('');
      }
      setIsFormValid(false);
      return;
    }

    if (emailAvailable === false) {
      setEmailError('Email is already registered');
      setIsFormValid(false);
      return;
    }

    if (password !== trimmedPassword) {
      setPasswordError('Password should not start or end with spaces');
      setIsFormValid(false);
      return;
    }

    if (/\s/.test(trimmedPassword)) {
      setPasswordError('Password cannot contain spaces');
      setIsFormValid(false);
      return;
    }

    if (!isValidPassword(trimmedPassword)) {

      if (submitAttempted) {
        setPasswordError(
          'Password must be 6-12 chars with uppercase, lowercase and number',
        );
      } else {
        setPasswordError('');
      }

      setIsFormValid(false);
      return;
    }

    if (confirmPassword !== trimmedConfirmPassword) {
      setConfirmPasswordError(
        'Confirm password should not start or end with spaces',
      );
      setIsFormValid(false);
      return;
    }

    if (trimmedPassword !== trimmedConfirmPassword) {

      if (submitAttempted) {
        setConfirmPasswordError('Passwords do not match');
      } else {
        setConfirmPasswordError('');
      }

      setIsFormValid(false);
      return;
    }

    if (!acceptTerms || !isAbove18) {
      setTermsError('Please accept terms and confirm age');
      setIsFormValid(false);
      return;
    }

    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');
    setTermsError('');
    setIsFormValid(true);
  };

  // Email availability check
  useEffect(() => {
    const trimmedEmail = email.trim();

    if (trimmedEmail.length > 5 && isValidEmail(trimmedEmail)) {
      setCheckingEmail(true);
      setEmailAvailable(null);

      const delayDebounceFn = setTimeout(() => {
        checkEmailExists(trimmedEmail);
      }, 500);

      return () => clearTimeout(delayDebounceFn);
    } else {
      setEmailAvailable(null);
    }
  }, [email]);

  // Check email exists
  const checkEmailExists = async (trimmedEmail) => {
    try {
      const res = await Apiclient.post('/register/checkEmail', {
        email: trimmedEmail,
      });

      if (res.data.available) {
        setEmailAvailable(true);
        setEmailError('');
        setPasswordError('');
        setConfirmPasswordError('');
        setTermsError('');
      } else {
        setEmailAvailable(false);
        setEmailError(
          res.data.message || 'Email is already registered.',
        );
      }
    } catch (err) {
      setEmailError('Error checking email');
      setEmailAvailable(false);
    } finally {
      setCheckingEmail(false);
    }
  };

  // Signup
  const handleSignUp = async () => {
    setSubmitAttempted(true);

    setEmailTouched(true);
    setPasswordTouched(true);
    setConfirmPasswordTouched(true);

    validateForm();

    if (!isFormValid) {
      return;
    }

    setUserData({
      email: email.trim(),
      password: password.trim(),
    });

    onToggleForm();
  };

  // Forgot Password
  const handleForgotPassword = () => {
    const trimmedEmail = forgotEmail.trim();

    if (!trimmedEmail) {
      setForgotPasswordError('Email is required');
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      setForgotPasswordError('Please enter a valid email address');
      return;
    }

    setForgotPasswordError('');

    Alert.alert(
      'Coming Soon',
      'Password reset functionality is coming soon.',
    );
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
            {forgotPasswordMode ? 'Forgot Password' : 'Sign Up'}
          </Text>

          {/* FORGOT PASSWORD FORM */}
          {forgotPasswordMode ? (
            <>
              <View style={{ width: '100%', padding: 7 }}>
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
                      isValidEmail(forgotEmail.trim()) ? (
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
                      {isValidEmail(forgotEmail.trim())
                        ? 'Valid email address'
                        : 'Invalid email address'}
                    </Text>
                  )}
              </View>

              {forgotPasswordError ? (
                <Text
                  style={[
                    styles.error,
                    themeStyles[theme].error,
                    { marginBottom: 10 },
                  ]}
                >
                  {forgotPasswordError}
                </Text>
              ) : null}

              <TouchableOpacity
                style={[
                  styles.button,
                  themeStyles[theme].button,
                  { marginTop: 10 },
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
                      theme === 'dark' ? '#fff' : 'blue',
                    textDecorationLine: 'underline',
                    fontSize: 16,
                  }}
                >
                  Back to Sign Up
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              {/* EMAIL */}
              <View style={{ width: '100%', padding: 7 }}>
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

                      if (emailTouched) {
                        setEmailError('');
                      }
                    }}
                    onFocus={() => {
                      setEmailError('');
                    }}
                    onBlur={() => {
                      setEmailTouched(true);
                      validateForm();
                    }}
                    style={[
                      styles.input,
                      themeStyles[theme].input,
                    ]}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholderTextColor={
                      themeStyles[theme].placeholder.color
                    }
                    placeholder="Email Address"
                    maxLength={50}
                  />

                  <View
                    style={{
                      position: 'absolute',
                      right: 20,
                      top: 23,
                    }}
                  >
                    {checkingEmail ? (
                      <Icon
                        name="spinner"
                        size={18}
                        color="gray"
                      />
                    ) : emailAvailable === true ? (
                      <Icon
                        name="check-circle"
                        size={20}
                        color="green"
                      />
                    ) : emailAvailable === false ? (
                      <Icon
                        name="times-circle"
                        size={20}
                        color="red"
                      />
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
                      marginTop: -5,
                      marginBottom: 5,
                      fontSize: 13,
                      width: '100%',
                      paddingHorizontal: 12,
                    }}
                  >
                    {emailError}
                  </Text>
                ) : null}
              </View>

              {/* PASSWORD */}
              <View style={{ width: '100%', padding: 7 }}>
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

                      if (passwordTouched) {
                        setPasswordError('');
                      }
                    }}
                    onFocus={() => {
                      setPasswordError('');
                    }}
                    onBlur={() => {
                      setPasswordTouched(true);
                      validateForm();
                    }}
                    style={[
                      styles.input,
                      themeStyles[theme].input,
                    ]}
                    secureTextEntry={!showPassword}
                    placeholderTextColor={
                      themeStyles[theme].placeholder.color
                    }
                    placeholder="Password"
                    maxLength={12}
                  />

                  <TouchableOpacity
                    onPress={() =>
                      setShowPassword(!showPassword)
                    }
                    style={{
                      padding: 10,
                      position: 'absolute',
                      right: 5,
                      top: 12,
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
                          ? '#1e1e1e'
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
              </View>

              {/* CONFIRM PASSWORD */}
              <View style={{ width: '100%', padding: 7 }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <TextInput
                    value={confirmPassword}
                    onChangeText={(text) => {
                      setConfirmPassword(text);

                      if (confirmPasswordTouched) {
                        setConfirmPasswordError('');
                      }
                    }}
                    onFocus={() => {
                      setConfirmPasswordError('');
                    }}
                    onBlur={() => {
                      setConfirmPasswordTouched(true);
                      validateForm();
                    }}
                    style={[
                      styles.input,
                      themeStyles[theme].input,
                    ]}
                    secureTextEntry={
                      !showConfirmPassword
                    }
                    placeholderTextColor={
                      themeStyles[theme].placeholder.color
                    }
                    placeholder="Confirm Password"
                    maxLength={12}
                  />

                  <TouchableOpacity
                    onPress={() =>
                      setShowConfirmPassword(
                        !showConfirmPassword,
                      )
                    }
                    style={{
                      padding: 10,
                      position: 'absolute',
                      right: 5,
                      top: 12,
                    }}
                  >
                    <Icon
                      name={
                        showConfirmPassword
                          ? 'eye'
                          : 'eye-slash'
                      }
                      size={20}
                      color={
                        theme === 'light'
                          ? '#1e1e1e'
                          : 'white'
                      }
                    />
                  </TouchableOpacity>
                </View>

                {confirmPasswordError ? (
                  <Text
                    style={{
                      color: 'red',
                      marginTop: 4,
                      fontSize: 13,
                      paddingHorizontal: 12,
                    }}
                  >
                    {confirmPasswordError}
                  </Text>
                ) : null}

              </View>

              {/* REFERRER CODE */}
              <View style={{ width: '100%', padding: 7 }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <TextInput
                    value={referrerCode}
                    onChangeText={setReferrerCode}
                    style={[
                      styles.input,
                      themeStyles[theme].input,
                    ]}
                    placeholderTextColor={
                      themeStyles[theme].placeholder.color
                    }
                    placeholder="Referrer Code (optional)"
                    maxLength={6}
                  />
                </View>
              </View>

              {/* TERMS */}
              <View
                style={{
                  width: '100%',
                  paddingHorizontal: 15,
                }}
              >
                <TouchableOpacity
                  onPress={() =>
                    setAcceptTerms(!acceptTerms)
                  }
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 10,
                  }}
                >
                  <Icon
                    name={
                      acceptTerms
                        ? 'check-square'
                        : 'square-o'
                    }
                    size={20}
                    color={
                      acceptTerms
                        ? 'green'
                        : theme === 'light'
                          ? '#b8b8b8ff'
                          : 'white'
                    }
                    style={{ marginRight: 10 }}
                  />

                  <Text
                    style={{
                      color:
                        theme === 'light'
                          ? '#444'
                          : '#fff',
                    }}
                  >
                    I accept the terms & conditions
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() =>
                    setIsAbove18(!isAbove18)
                  }
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 15,
                  }}
                >
                  <Icon
                    name={
                      isAbove18
                        ? 'check-square'
                        : 'square-o'
                    }
                    size={20}
                    color={
                      isAbove18
                        ? 'green'
                        : theme === 'light'
                          ? '#b8b8b8ff'
                          : 'white'
                    }
                    style={{ marginRight: 10 }}
                  />

                  <Text
                    style={{
                      color:
                        theme === 'light'
                          ? '#444'
                          : '#fff',
                    }}
                  >
                    I am above 18 years of age
                  </Text>
                </TouchableOpacity>
              </View>
              {termsError ? (
                <Text
                  style={{
                    color: 'red',
                    marginTop: 10,
                    marginLeft: 15,
                    fontSize: 13,
                  }}
                >
                  {termsError}
                </Text>
              ) : null}

              {/* SIGNUP BUTTON */}
              <TouchableOpacity
                style={[
                  styles.button,
                  themeStyles[theme].button,
                  {
                    marginTop: 0,
                    opacity: isFormValid ? 1 : 0.5,
                  },
                ]}
                onPress={handleSignUp}
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
                    Sign Up
                  </Text>
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

              {/* LOGIN */}
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
                  Already have an account? Sign In
                </Text>
              </TouchableOpacity>

              {/* SOCIAL LOGIN */}
              <View style={styles.Loginoption}>
                <TouchableOpacity
                  style={[
                    styles.Loginoptionbtn,
                    styles.Applebtn,
                  ]}
                  onPress={() => SigninWithApple()}
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