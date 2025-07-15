import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
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
  const [error, setError] = useState('');
  const [isFormValid, setIsFormValid] = useState(false);

  const [checkingEmail, setCheckingEmail] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState(null); // null = untouched

  const isValidEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  useEffect(() => {
    validateForm();
  }, [email, password, confirmPassword, acceptTerms, isAbove18, emailAvailable]);


  const validateForm = () => {
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    const trimmedConfirmPassword = confirmPassword.trim();

    if (email !== trimmedEmail) {
      setError('Email should not start or end with spaces');
      setIsFormValid(false);
      return;
    }
    if (!isValidEmail(trimmedEmail)) {
      setError('Please enter a valid email address');
      setIsFormValid(false);
      return;
    }

    if (emailAvailable === false) {
      setError('Email is already registered');
      setIsFormValid(false);
      return;
    }

    if (password !== trimmedPassword) {
      setError('Password should not start or end with spaces');
      setIsFormValid(false);
      return;
    }

    if (trimmedPassword.length < 6 || trimmedPassword.length > 12) {
      setError('Password must be 6–12 characters');
      setIsFormValid(false);
      return;
    }

    if (/\s/.test(trimmedPassword)) {
      setError('Password cannot contain spaces');
      setIsFormValid(false);
      return;
    }

    if (confirmPassword !== trimmedConfirmPassword) {
      setError('Confirm password should not start or end with spaces');
      setIsFormValid(false);
      return;
    }

    if (trimmedPassword !== trimmedConfirmPassword) {
      setError('Passwords do not match');
      setIsFormValid(false);
      return;
    }

    if (!acceptTerms || !isAbove18) {
      setError('Please accept terms and confirm age');
      setIsFormValid(false);
      return;
    }

    setError('');
    setIsFormValid(true);
  };


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

  const checkEmailExists = async (trimmedEmail) => {
    try {
      const res = await Apiclient.post('/register/checkEmail', { email: trimmedEmail });

      if (res.data.available) {
        setEmailAvailable(true);
        setError('');
      } else {
        setEmailAvailable(false);
        setError(res.data.message || 'Email is already registered.');
      }
    } catch (err) {
      setError('Error checking email');
      setEmailAvailable(false);
    } finally {
      setCheckingEmail(false);
    }
  };



  const handleSignUp = async () => {
    setUserData({ email: email.trim(), password: password.trim() });
    onToggleForm();
    console.log(`Email: ${email.trim()}, Password: ${password.trim()}`);
  };





  return (
    <>
      <ScrollView style={{ position: 'absolute', flex: 1, width: '100%', height: '100%', top: '10%' }}>
        <View style={[styles.formContainer, themeStyles[theme].formContainer]}>
          <Text style={[styles.formTitle, themeStyles[theme].text]}>Sign Up</Text>
          <View style={[{ width: '100%', padding: '7' }]}>
            {/* <Text style={[styles.SingInlabel, themeStyles[theme].SingInlabel]}>User Name</Text> */}
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TextInput
                value={email}
                onChangeText={setEmail}
                style={[styles.input, themeStyles[theme].input, { paddingRight: 40 }]}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor={themeStyles[theme].placeholder.color}
                placeholder="Email Address"
                maxLength={50}
                autoFocus
              />
              <View style={{ position: 'absolute', right: 12, top: 13 }}>
                {checkingEmail ? (
                  <Icon name="spinner" size={18} color="gray" style={{ transform: [{ rotate: '90deg' }] }} />
                ) : emailAvailable === true ? (
                  <Icon name="check" size={18} color="green" />
                ) : emailAvailable === false ? (
                  <Icon name="close" size={18} color="red" />
                ) : (
                  <Icon name="envelope-o" size={18} color={theme === 'light' ? '#1e1e1e' : 'white'} />
                )}
              </View>
            </View>
            {emailAvailable === true && <Text style={{ color: 'green', marginTop: 5 }}>Email is available.</Text>}
            {emailAvailable === false && <Text style={{ color: 'red', marginTop: 5 }}>Email is already registered.</Text>}
          </View>
          <View style={[{ width: '100%', padding: '7' }]}>
            {/* <Text style={[styles.SingInlabel, themeStyles[theme].SingInlabel]}>Password</Text> */}
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TextInput
                value={password}
                onChangeText={setPassword}
                style={[styles.input, themeStyles[theme].input]}
                secureTextEntry={!showConfirmPassword}
                placeholderTextColor={themeStyles[theme].placeholder.color}
                placeholder="Password"
                maxLength={12}
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={{ padding: 10, position: 'absolute', right: 12, top: 12 }}>
                <Icon
                  name={showConfirmPassword ? 'eye' : 'eye-slash'}
                  size={20}
                  color={theme === 'light' ? '#1e1e1e' : 'white'}
                />
              </TouchableOpacity>
            </View>
          </View>
          <View style={[{ width: '100%', padding: '7' }]}>
            {/* <Text style={[styles.SingInlabel, themeStyles[theme].SingInlabel]}>Confirm Password</Text> */}
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                style={[styles.input, themeStyles[theme].input]}
                secureTextEntry={!showPassword}
                placeholderTextColor={themeStyles[theme].placeholder.color}
                placeholder="Confirm Password"
                maxLength={12}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ padding: 10, position: 'absolute', right: 12, top: 12 }}>
                <Icon
                  name={showPassword ? 'eye' : 'eye-slash'}
                  size={20}
                  color={theme === 'light' ? '#1e1e1e' : 'white'}
                />
              </TouchableOpacity>
            </View>
          </View>
          {/* accept terms and conditions */}
          <View style={[{ width: '100%', paddingHorizontal: 15 }]}>
            <TouchableOpacity
              onPress={() => setAcceptTerms(!acceptTerms)}
              style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}
            >
              <Icon
                name={acceptTerms ? 'check-square' : 'square-o'}
                size={20}
                color={theme === 'light' ? '#1e1e1e' : 'white'}
                style={{ marginRight: 10 }}
              />
              <Text style={{ color: theme === 'light' ? '#1e1e1e' : '#fff' }}>
                I accept the terms & conditions
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setIsAbove18(!isAbove18)}
              style={{ flexDirection: 'row', alignItems: 'center' }}
            >
              <Icon
                name={isAbove18 ? 'check-square' : 'square-o'}
                size={20}
                color={theme === 'light' ? '#1e1e1e' : 'white'}
                style={{ marginRight: 10 }}
              />
              <Text style={{ color: theme === 'light' ? '#1e1e1e' : '#fff' }}>
                I am above 18 years of age
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.Loginerror}>
            {error ? <Text style={[styles.error, themeStyles[theme].error]}>{error}</Text> : null}
          </View>
          <TouchableOpacity disabled={!isFormValid} style={[themeStyles[theme].button, { opacity: isFormValid ? 1 : 0.5 }]} onPress={handleSignUp}>
            <LinearGradient
              colors={['rgb(238, 41, 123)', 'rgb(183, 1, 255)']}
              start={{ x: 1, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={[styles.button, { marginTop: 0 }]}
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