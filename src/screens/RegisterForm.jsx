import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { styles, themeStyles } from '../../assets/styles/ThemeStyles';
import { globalStyles } from '../../assets/styles/GlobalStyles';

const questions = [
  { label: 'What is your Full Name?', field: 'name', placeholder: 'Enter your name' },
  { label: 'What is your Username?', field: 'username', placeholder: 'Enter your username' },
  { label: 'What is your Location?', field: 'location', placeholder: 'Enter your location' },
  { label: 'Date of Birth', field: 'dob', placeholder: 'YYYY-MM-DD' },
  { label: 'Gender', field: 'gender' },
  { label: 'Choose your Interests (Any 5)', field: 'interests' },
];

const genderOptions = ['Male', 'Female', 'Trans', 'Other'];
const interestOptions = [
  'Art & Music', 'Entertainment & Gaming', 'Family & Parenting', 'Fashion & Shopping',
  'Food & Cooking', 'Health & Fitness', 'Hobbies & Activities', 'News & Politics',
  'Religion & Spiritual', 'Sports & Adventure', 'Travel & Holidays',
];

export const RegisterForm = ({ onRegister, userAddress, onToggleForm, setError }) => {
  const [step, setStep] = useState(0);
  const [layoutWidth, setLayoutWidth] = useState(0);
  const scrollRef = useRef(null);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    location: '',
    dob: '',
    gender: '',
    interests: [],
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleInterest = (interest) => {
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

  const renderStepContent = (question) => {
    if (question.field === 'gender') {
      return (
        <View>
        <View style={styles.btnGenderWrapper}>
          {genderOptions.map((gender) => (
            <TouchableOpacity
              key={gender}
              onPress={() => handleChange('gender', gender)}
              style={[
                styles.btnGender,
                formData.gender === gender && styles.btnGenderActive,
              ]}
            >
              <Text style={{ color: 'white' }}>{gender}</Text>
            </TouchableOpacity>
          ))}

        </View>
          {errors[question.field] ? (
          <Text style={{ color: 'red', marginTop: 5 }}>{errors[question.field]}</Text>
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
          showsVerticalScrollIndicator={true}
        >
          {interestOptions.map((interest) => (
            <TouchableOpacity
              key={interest}
              onPress={() => toggleInterest(interest)}
              style={[
                styles.btnInterest,
                formData.interests.includes(interest) && styles.btnInterestActive,
              ]}
            >
              <Text style={{ color: 'white' }}>{interest}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
          {errors[question.field] ? (
          <Text style={{ color: 'red', marginTop: 5 }}>{errors[question.field]}</Text>
        ) : null}
        </View>
      );
    }

    return (
      <>
      <TextInput
        style={globalStyles.input}
        placeholder={question.placeholder}
        placeholderTextColor="black"
        value={formData[question.field]}
        onChangeText={(text) => handleChange(question.field, text)}
      />
      {errors[question.field] ? (
      <Text style={{ color: 'red', marginTop: 5 }}>{errors[question.field]}</Text>
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
      Alert.alert('Registration Complete', JSON.stringify(formData, null, 2));
    }
  };

  const handlePrevious = () => {
    if (step > 0) {
      const newStep = step - 1;
      setStep(newStep);
      scrollRef.current?.scrollTo({ x: newStep * layoutWidth, animated: true });
    }
  };

  const onScrollEnd = (e) => {
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
    case 'name':
      if (!value || value.trim().length < 5) {
        error = 'Full name must be at least 5 characters';
      }
      break;
    case 'username':
      if (!value || !/^[a-zA-Z0-9_]{5,15}$/.test(value)) {
        error = 'Username must be 5–15 characters and alphanumeric';
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
    setErrors((prev) => ({ ...prev, [currentQuestion.field]: error }));
    return false;
  }

  // Clear previous error if validation passed
  setErrors((prev) => ({ ...prev, [currentQuestion.field]: '' }));
  return true;
};


  return (
    <View
      style={{ flex: 1 }}
      onLayout={(event) => {
        const { width } = event.nativeEvent.layout;
        setLayoutWidth(width);
      }}
    >
      { (
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
            style={{ flex: 1 }}
          >
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
      )}
    </View>
  );
};
