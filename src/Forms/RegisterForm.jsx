import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, Platform } from 'react-native';
import { styles, themeStyles } from '../../assets/styles/ThemeStyles';
import { globalStyles } from '../../assets/styles/GlobalStyles';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/Ionicons'; // Make sure react-native-vector-icons is installed
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { formatISO } from 'date-fns';

const questions = [
  {
    label: 'What is your Screen name?',
    field: 'screenname',
    placeholder: 'Enter your screen name',
  },
  {
    label: 'What is your Email?',
    field: 'email',
    placeholder: 'Enter your email',
  },
  {
    label: 'What is your Location?',
    field: 'location',
    placeholder: 'Enter your location',
  },
  { label: 'Date of Birth', field: 'dob', placeholder: 'YYYY-MM-DD' },
  { label: 'Gender', field: 'gender' },
  { label: 'Choose your Interests (Any 5)', field: 'interests' },
];

const genderOptions = ['Male', 'Female', 'Trans', 'Other'];
const interestOptions = [
  'Art & Music',
  'Entertainment & Gaming',
  'Family & Parenting',
  'Fashion & Shopping',
  'Food & Cooking',
  'Health & Fitness',
  'Hobbies & Activities',
  'News & Politics',
  'Religion & Spiritual',
  'Sports & Adventure',
  'Travel & Holidays',
];

export const RegisterForm = ({ userData, theme, userAddress, onLogin }) => {
  const [step, setStep] = useState(0);
  const [layoutWidth, setLayoutWidth] = useState(0);
  const scrollRef = useRef(null);
  const [errors, setErrors] = useState({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [formData, setFormData] = useState({
    screenname: '',
    email: '',
    location: '',
    dob: '',
    gender: '',
    interests: [],
    city: '',
    state: '',
    country: '',
    zipcode: '',
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    // console.log('userData:', userData);
    console.log('address:', userAddress);

    if (userData || userAddress) {
      const updatedForm = {
        screenname: userData?.username || '',
        email: '',
        location: userAddress?.city || '', // Set location to city from userAddress
        city: userAddress?.city || '',
        state: userAddress?.state_code || '',
        country: userAddress?.country || '',
        zipcode: userAddress?.postcode || '',
      };

      // console.log('Merged Form Data:', updatedForm);

      setFormData(prev => ({
        ...prev,
        ...updatedForm,
      }));

      // console.log('Form Data:', formData);
    }
  }, [userData, userAddress]);

  const toggleInterest = interest => {
    setFormData(prev => {
      const alreadySelected = prev.interests.includes(interest);
      if (alreadySelected) {
        return { ...prev, interests: prev.interests.filter(i => i !== interest) };
      } else if (prev.interests.length < 5) {
        return { ...prev, interests: [...prev.interests, interest] };
      }
      return prev;
    });
  };

  const renderStepContent = question => {
    if (question.field === 'gender') {
      return (
        <View>
          <View style={styles.btnGenderWrapper}>
            {genderOptions.map(gender => (
              <TouchableOpacity
                key={gender}
                onPress={() => handleChange('gender', gender)}
                style={[
                  styles.btnGender,
                  formData.gender === gender && styles.btnGenderActive,
                ]}>
                <Text style={{ color: 'white' }}>{gender}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {errors[question.field] ? (
            <Text style={{ color: 'red', marginTop: 5 }}>
              {errors[question.field]}
            </Text>
          ) : null}
        </View>
      );
    }

    if (question.field === 'interests') {
      return (
        <View>
          <ScrollView
            contentContainerStyle={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              paddingBottom: 20,
            }}
            showsVerticalScrollIndicator={true}>
            {interestOptions.map(interest => (
              <TouchableOpacity
                key={interest}
                onPress={() => toggleInterest(interest)}
                style={[
                  styles.btnInterest,
                  formData.interests.includes(interest) &&
                  styles.btnInterestActive,
                ]}>
                <Text style={{ color: 'white' }}>{interest}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          {errors[question.field] ? (
            <Text style={{ color: 'red', marginTop: 5 }}>
              {errors[question.field]}
            </Text>
          ) : null}
        </View>
      );
    }

    if (question.field === 'dob') {
      // Calculate max date for 18 years ago from current date
      const currentDate = new Date();
      const maxDate = new Date(currentDate.getFullYear() - 18, currentDate.getMonth(), currentDate.getDate());
      return (
        <View>
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            style={[
              globalStyles.input,
              {
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              },
            ]}>
            <Text style={{ color: formData.dob ? 'black' : '#999' }}>
              {formData.dob || 'YYYY-MM-DD'}
            </Text>
            <Icon name="calendar-outline" size={20} color="#555" />
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              testID="dateTimePicker"
              value={formData.dob ? new Date(formData.dob) : maxDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              maximumDate={maxDate}
              accentColor="#d93a63"
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) {
                  const year = selectedDate.getFullYear();
                  const month = String(selectedDate.getMonth() + 1).padStart(
                    2,
                    '0',
                  );
                  const day = String(selectedDate.getDate()).padStart(2, '0');
                  handleChange('dob', `${year}-${month}-${day}`);
                }
              }}
            />
          )}
          {errors[question.field] ? (
            <Text style={{ color: 'red', marginTop: 5 }}>
              {errors[question.field]}
            </Text>
          ) : null}
        </View>
      );
    }

    return (
      <>
        <TextInput
          style={globalStyles.input}
          placeholder={question.placeholder}
          placeholderTextColor="#9d9d9d"
          value={formData[question.field]}
          onChangeText={text => handleChange(question.field, text)}
          editable={question.field === 'location' ? false : true}
        />
        {errors[question.field] ? (
          <Text style={{ color: 'red', marginTop: 5 }}>
            {errors[question.field]}
          </Text>
        ) : null}
      </>
    );
  };

  const handleNext = () => {
    if (!validateStep()) {
      return;
    }
    if (step < questions.length - 1) {
      const newStep = step + 1;
      setStep(newStep);
      scrollRef.current?.scrollTo({ x: newStep * layoutWidth, animated: true });
    } else {
      const interestIndexes = formData.interests.map(interest =>
        interestOptions.indexOf(interest),
      );
      // Build final payload object
      const finalData = {
        username: userData?.username,
        password: userData?.password,
        email: formData.email,
        screenName: formData.screenname,
        dob: formatISO(formData.dob), // Convert from YYYY-MM-DD to DD-MM-YYYY
        gender: formData.gender,
        city: formData.city || formData.location,
        state: formData.state,
        country: formData.country,
        zipcode: formData.zipcode,
        interests: interestIndexes.join(','),
      };

      // console.log('✅ Final Payload to POST:', finalData);

      // Alert.alert('Registration Complete', JSON.stringify(formData, null, 2));

      //  send to API here using fetch()
      fetch('https://api.streamalong.live/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': '6cca5d4e-719b-4c28-aabd-4aeb2618ee1d',
        },
        body: JSON.stringify(finalData),
      })
        .then(res => res.json())
        .then(data => {
          if (data.message === 'User registered successfully') {
            userLogedIn();
            // Alert.alert('RUser registered successfully', data.message);
          } else {
            setErrors(data.message || 'Registration failed');
            Alert.alert('Registration failed', data.message);
          }
        })
        .catch(err => console.error('API Error:', err));
    }
  };

  const userLogedIn = async () => {
    const parameter = {
      username: userData?.username,
      password: userData?.password,
    };
    const res = await axios.post(
      'https://api.streamalong.live/login',
      parameter,
      {
        headers: {
          'x-api-key': '6cca5d4e-719b-4c28-aabd-4aeb2618ee1d',
        },
      },
    );
    if (res.data.message === 'Login successful') {
      Alert.alert('Success', `LogIn Success.`, [{ text: 'OK' }]);
      onLogin();
      console.log(res.data.user);
      await AsyncStorage.setItem('token', res.data.token);

      const userDataString = JSON.stringify(res.data.user);
      await AsyncStorage.setItem('UserData', userDataString);
    }
  };

  const handlePrevious = () => {
    if (step > 0) {
      const newStep = step - 1;
      setStep(newStep);
      scrollRef.current?.scrollTo({ x: newStep * layoutWidth, animated: true });
    }
  };

  const onScrollEnd = e => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / layoutWidth);
    // console.log('Scrolled to index:', index, 'offsetX:', offsetX);
    setStep(index);
  };

  const validateStep = () => {
    const currentQuestion = questions[step];
    const value = formData[currentQuestion.field];
    let error = '';

    switch (currentQuestion.field) {
      case 'screenname':
        if (!value || value.trim().length < 5) {
          error = 'Screen name must be at least 5 characters';
        }
        break;
      case 'email':
        if (!value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = 'Please enter a valid email address';
        }
        break;
      case 'location':
        if (!value || value.trim() === '') {
          error = 'Location is required';
        }
        break;
      case 'dob':
        if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
          error = 'Date must be in YYYY-MM-DD format';
        } else {
          const dob = new Date(value);
          const age = new Date().getFullYear() - dob.getFullYear();
          if (age < 13) {
            error = 'You must be at least 18 years old';
          }
        }
        break;
      case 'gender':
        if (!value) {
          error = 'Please select a gender';
        }
        break;
      case 'interests':
        if (!value || value.length < 1) {
          error = 'Select at least 1 interest';
        }
        break;
      default:
        break;
    }

    if (error) {
      setErrors(prev => ({ ...prev, [currentQuestion.field]: error }));
      return false;
    }

    // Clear previous error if validation passed
    setErrors(prev => ({ ...prev, [currentQuestion.field]: '' }));
    return true;
  };

  return (
    <View
      style={{ flex: 1 }}
      onLayout={event => {
        const { width } = event.nativeEvent.layout;
        setLayoutWidth(width);
      }}>
      {
        <>
          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            snapToInterval={layoutWidth}
            decelerationRate="fast"
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={onScrollEnd}
            scrollEventThrottle={16}
            style={{ flex: 1 }}>
            {questions.map((questionItem, index) => (
              <View key={index} style={{ width: layoutWidth }}>
                <View style={[styles.qAWrapper, { paddingHorizontal: 20 }]}>
                  <Text style={styles.question}>{questionItem.label}</Text>
                  {renderStepContent(questionItem)}
                </View>
              </View>
            ))}
          </ScrollView>

          {/* Navigation Buttons */}
          <View style={styles.buttons}>
            {step > 0 && (
              <TouchableOpacity onPress={handlePrevious} style={styles.btnNav}>
                <Text style={{ color: 'white' }}>Previous</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={handleNext} style={styles.btnNav}>
              <Text style={{ color: 'white' }}>
                {step === questions.length - 1 ? 'Finish' : 'Next'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Progress Dots */}
          <View style={styles.dotsContainer}>
            {questions.map((_, idx) => (
              <View
                key={idx}
                style={[styles.dot, step === idx && styles.dotActive]}
              />
            ))}
          </View>
        </>
      }
    </View>
  );
};
