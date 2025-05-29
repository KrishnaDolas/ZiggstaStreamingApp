import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  Alert,
} from 'react-native';
import { styles, themeStyles } from '../../assets/styles/ThemeStyles';

const { width, height } = Dimensions.get('window');

const questions = [
  { label: 'What is your Name?', field: 'name', placeholder: 'Enter your name' },
  { label: 'What is your Email?', field: 'email', placeholder: 'Enter your email' },
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

export const RegisterForm = ({ onRegister,userAddress, onToggleForm, setError }) => {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
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
      return prev; // Don't allow more than 5
    });
  };

  const renderStepContent = () => {
    const question = questions[step];

    if (question.field === 'gender') {
      return (
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
              <Text style={formData.gender === gender}>{gender}</Text>
            </TouchableOpacity>
          ))}
        </View>
      );
    }

    if (question.field === 'interests') {
      return (
        <View style={styles.btnInterestsWrapper}>
          {interestOptions.map((interest) => (
            <TouchableOpacity
              key={interest}
              onPress={() => toggleInterest(interest)}
              style={[
                styles.btnInterest,
                formData.interests.includes(interest) && styles.btnInterestActive,
              ]}
            >
              <Text
                style={formData.interests.includes(interest) && { color: 'black' }}
              >
                {interest}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      );
    }

    return (
      <TextInput
        style={styles.answer}
        placeholder={question.placeholder}
        value={formData[question.field]}
        onChangeText={(text) => handleChange(question.field, text)}
      />
    );
  };

  const handleNext = () => {
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      Alert.alert('Registration Complete', JSON.stringify(formData, null, 2));
    }
  };

  const handlePrevious = () => {
    if (step > 0) setStep(step - 1);
  };

  return (
    <View style={styles.carousel}>
      <View style={styles.slide}>
        <View style={styles.qAWrapper}>
          <Text style={styles.question}>{questions[step].label}</Text>
          {renderStepContent()}
        </View>

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

        <View style={styles.dotsContainer}>
          {questions.map((_, idx) => (
            <View
              key={idx}
              style={[styles.dot, step === idx && styles.dotActive]}
            />
          ))}
        </View>
      </View>
    </View>
  );
}



