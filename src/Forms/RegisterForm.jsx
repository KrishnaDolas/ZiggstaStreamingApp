import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import {styles} from '../../assets/styles/ThemeStyles';
import {globalStyles} from '../../assets/styles/GlobalStyles';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {formatISO} from 'date-fns';
import WebView from 'react-native-webview';
import DropDownPicker from 'react-native-dropdown-picker';

const screenHeight = Dimensions.get('window').height;
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
  {label: 'Date of Birth', field: 'dob', placeholder: 'YYYY-MM-DD'},
  {label: 'Gender', field: 'gender'},
  {label: 'Choose your Interests (Any 2)', field: 'interests'},
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

// Helper: return date 18 years ago from today in YYYY-MM-DD
const getDefaultDOB = () => {
  const today = new Date();
  today.setFullYear(today.getFullYear() - 18);
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const RegisterForm = ({
  userData,
  theme,
  userAddress,
  setUserAddress,
  onLogin,
}) => {
  const [step, setStep] = useState(0);
  const [layoutWidth, setLayoutWidth] = useState(0);
  const scrollRef = useRef(null);
  const webViewRef = useRef(null);
  const [errors, setErrors] = useState({});
  const [isValidStep, setIsValidStep] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);

  const [formData, setFormData] = useState({
    screenname: '',
    email: '',
    location: '',
    dob: getDefaultDOB(), // ✅ default 18 years ago
    gender: '',
    interests: [],
    city: '',
    state: '',
    country: '',
    zipcode: '',
  });

  const [openYear, setOpenYear] = useState(false);
  const [openMonth, setOpenMonth] = useState(false);
  const [openDay, setOpenDay] = useState(false);

  const [selectedYear, setSelectedYear] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedDay, setSelectedDay] = useState('');
  const [yearDropdownY, setYearDropdownY] = useState(0);
  const [monthDropdownY, setMonthDropdownY] = useState(0);
  const [dayDropdownY, setDayDropdownY] = useState(0);

  useEffect(() => {
    if (formData.dob) {
      const [y, m, d] = formData.dob.split('-');
      setSelectedYear(y);
      setSelectedMonth(m);
      setSelectedDay(d);
    }
  }, [formData.dob]);

  useEffect(() => {
    if (selectedYear && selectedMonth && selectedDay) {
      const dobValue = `${selectedYear}-${selectedMonth}-${selectedDay}`;
      handleChange('dob', dobValue);
    }
  }, [selectedYear, selectedMonth, selectedDay]);

  useEffect(() => {
    // Validate current step whenever formData changes
    validateStep();
  }, [formData, step]);

  const handleChange = (field, value) => {
    setFormData(prev => ({...prev, [field]: value}));
  };

  useEffect(() => {
    console.log('address:', userAddress);
    if (userData || userAddress) {
      const updatedForm = {
        screenname: userData?.username || '',
        // email: '',
        // location: userAddress?.city || '', // Set location to city from userAddress
        // city: userAddress?.city || '',
        // state: userAddress?.state_code || '',
        // country: userAddress?.country || '',
        // zipcode: userAddress?.postcode || '',
        // location: '', // Set location to city from userAddress
        // city: '',
        // state: '',
        // country: '',
        // zipcode: '',
      };

      setFormData(prev => ({
        ...prev,
        ...updatedForm,
      }));
    }
  }, [userData, userAddress]);

  const toggleInterest = interest => {
    setFormData(prev => {
      const alreadySelected = prev.interests.includes(interest);
      if (alreadySelected) {
        return {
          ...prev,
          interests: prev.interests.filter(i => i !== interest),
        };
      } else {
        return {
          ...prev,
          interests: [...prev.interests, interest],
        };
      }
    });
  };

  // Callback for map taps returned via WebView message
  // const onMapMessage = city => {
  //   console.log('city', city);
  //   handleChange('location', city);
  // };

  const updateMapLocation = cityName => {
    if (webViewRef.current && cityName.length > 2) {
      const escapedCity = cityName.replace(/'/g, "\\'");
      const jsCode = `
      window.postMessage(JSON.stringify({ type: 'SEARCH_CITY', payload: '${escapedCity}' }), '*');
    `;
      webViewRef.current.injectJavaScript(jsCode);
    }
  };

  const onMapMessage = message => {
    try {
      const address = JSON.parse(message);
      console.log('📍 Address from map:', address);

      setFormData(prev => ({
        ...prev,
        location: address.source === 'tap' ? address.city || '' : prev.location,
        city: address.city || '',
        state: address.state || '',
        country: address.country || '',
        zipcode: address.postcode || '',
      }));

      if (typeof setUserAddress === 'function') {
        setUserAddress(address);
      }
    } catch (err) {
      console.error('Failed to parse map address:', err);
    }
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
                <Text style={{color: 'white'}}>{gender}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {errors[question.field] ? (
            <Text style={{color: 'red', marginTop: 5}}>
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
                <Text style={{color: 'white'}}>{interest}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          {errors[question.field] ? (
            <Text style={{color: 'red', marginTop: 5}}>
              {errors[question.field]}
            </Text>
          ) : null}
        </View>
      );
    }

    // dob input
    if (question.field === 'dob') {
      const years = Array.from({length: 50}, (_, i) => {
        const year = new Date().getFullYear() - i;
        return {label: `${year}`, value: `${year}`};
      });

      const months = Array.from({length: 12}, (_, i) => {
        const month = String(i + 1).padStart(2, '0');
        return {label: month, value: month};
      });

      const days = Array.from({length: 31}, (_, i) => {
        const day = String(i + 1).padStart(2, '0');
        return {label: day, value: day};
      });

      const dropdownStyle = {
        backgroundColor: '#fff',
        borderColor: '#ccc',
        borderRadius: 10,
        height: 50,
        marginBottom: 10,
        paddingHorizontal: 10,
      };

      const getModalContainerStyle = dropdownY => ({
        width: Dimensions.get('window').width * 0.5,
        maxHeight: Dimensions.get('window').height * 0.4,
        backgroundColor: '#fff',
        borderRadius: 15,
        borderColor: '#ddd',
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
        position: 'absolute',
        top: Dimensions.get('window').height * 0.3 - 40 - dropdownY,
        left: Dimensions.get('window').width * 0.25,
      });

      const containerStyle = {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
        zIndex: 5000,
      };

      const itemTextStyle = {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
      };

      return (
        <View style={{zIndex: 5000, pointerEvents: 'box-none'}}>
          <View style={[containerStyle, {pointerEvents: 'auto'}]}>
            {/* day */}
            <View
              style={{flex: 1, zIndex: 2000}}
              onLayout={event => setDayDropdownY(event.nativeEvent.layout.y)}>
              <Text
                style={{
                  marginBottom: 5,
                  fontSize: 16,
                  color: theme === 'dark' ? '#fff' : '#333',
                }}>
                Day
              </Text>
              <DropDownPicker
                open={openDay}
                value={selectedDay}
                items={days}
                setOpen={setOpenDay}
                setValue={setSelectedDay}
                placeholder="DD"
                style={dropdownStyle}
                listMode="MODAL"
                dropDownDirection="BOTTOM"
                modalContentContainerStyle={getModalContainerStyle(
                  dayDropdownY,
                )}
                textStyle={itemTextStyle}
                modalProps={{
                  animationType: 'fade',
                  transparent: true,
                  presentationStyle: 'overFullScreen',
                }}
                modalTitle="Select Day"
                modalTitleStyle={{
                  fontSize: 18,
                  fontWeight: 'bold',
                  color: '#333',
                  textAlign: 'center',
                }}
                showCloseButton={true}
                closeButtonStyle={{padding: 10}}
                closeButtonTextStyle={{color: '#007AFF', fontSize: 16}}
                zIndex={2000}
              />
            </View>
            {/* month */}
            <View
              style={{flex: 1, zIndex: 3000}}
              onLayout={event => setMonthDropdownY(event.nativeEvent.layout.y)}>
              <Text
                style={{
                  marginBottom: 5,
                  fontSize: 16,
                  color: theme === 'dark' ? '#fff' : '#333',
                }}>
                Month
              </Text>
              <DropDownPicker
                open={openMonth}
                value={selectedMonth}
                items={months}
                setOpen={setOpenMonth}
                setValue={setSelectedMonth}
                placeholder="MM"
                style={dropdownStyle}
                listMode="MODAL"
                dropDownDirection="BOTTOM"
                modalContentContainerStyle={getModalContainerStyle(
                  monthDropdownY,
                )}
                textStyle={itemTextStyle}
                modalProps={{
                  animationType: 'fade',
                  transparent: true,
                  presentationStyle: 'overFullScreen',
                }}
                modalTitle="Select Month"
                modalTitleStyle={{
                  fontSize: 18,
                  fontWeight: 'bold',
                  color: '#333',
                  textAlign: 'center',
                }}
                showCloseButton={true}
                closeButtonStyle={{padding: 10}}
                closeButtonTextStyle={{color: '#007AFF', fontSize: 16}}
                zIndex={3000}
              />
            </View>
            {/* year */}
            <View
              style={{flex: 1, zIndex: 4000}}
              onLayout={event => setYearDropdownY(event.nativeEvent.layout.y)}>
              <Text
                style={{
                  marginBottom: 5,
                  fontSize: 16,
                  color: theme === 'dark' ? '#fff' : '#333',
                }}>
                Year
              </Text>
              <DropDownPicker
                open={openYear}
                value={selectedYear}
                items={years}
                setOpen={setOpenYear}
                setValue={setSelectedYear}
                placeholder="YYYY"
                style={dropdownStyle}
                listMode="MODAL"
                dropDownDirection="BOTTOM"
                modalContentContainerStyle={getModalContainerStyle(
                  yearDropdownY,
                )}
                textStyle={itemTextStyle}
                modalProps={{
                  animationType: 'fade',
                  transparent: true,
                  presentationStyle: 'overFullScreen',
                }}
                modalTitle="Select Year"
                modalTitleStyle={{
                  fontSize: 18,
                  fontWeight: 'bold',
                  color: '#333',
                  textAlign: 'center',
                }}
                showCloseButton={true}
                closeButtonStyle={{padding: 10}}
                closeButtonTextStyle={{color: '#007AFF', fontSize: 16}}
                zIndex={4000}
              />
            </View>
          </View>
          {errors[question.field] ? (
            <Text style={{color: 'red', marginTop: 5}}>
              {errors[question.field]}
            </Text>
          ) : null}
        </View>
      );
    }

    if (question.field === 'location') {
      return (
        <View>
          <TextInput
            style={globalStyles.input}
            placeholder={question.placeholder}
            placeholderTextColor="#9d9d9d"
            value={formData.location}
            onChangeText={text => {
              handleChange('location', text);
              updateMapLocation(text); // 🔄 Pan map to city
            }}
          />
          {errors.location && (
            <Text style={{color: 'red'}}>{errors.location}</Text>
          )}

          <View
            style={{
              height: screenHeight * 0.5 + 60,
              marginTop: 20,
              backgroundColor: '#fff',
              padding: 5,
              borderRadius: 10,
            }}>
            <WebView
              ref={webViewRef}
              originWhitelist={['*']}
              javaScriptEnabled
              source={{
                html: `
              <!DOCTYPE html><html><head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
                <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
                <style>
                  html, body, #map { margin: 0; height: 100%; width: 100%; }
                  .leaflet-control-attribution { display: none !important; }
                </style>
              </head><body>
                <div id="map"></div>
                <script>
                  const key = "25127ca1c55f48909b03f43048040037";
                  const map = L.map('map').setView([18.5204, 73.8567], 13);
                  L.tileLayer(\`https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey=\${key}\`, {
                    maxZoom: 18
                  }).addTo(map);
                  const marker = L.marker([18.5204, 73.8567]).addTo(map);

                  async function rev(lat, lon, source = 'tap') {
                    const res = await fetch(\`https://api.geoapify.com/v1/geocode/reverse?lat=\${lat}&lon=\${lon}&apiKey=\${key}\`);
                    const json = await res.json();
                    const address = json.features?.[0]?.properties || {};
                    window.ReactNativeWebView.postMessage(JSON.stringify({ ...address, source }));
                  }

                  map.on('click', e => {
                    const { lat, lng } = e.latlng;
                    marker.setLatLng([lat, lng]);
                    rev(lat, lng, 'tap');
                  });

                  window.addEventListener('message', async (event) => {
                    try {
                      const msg = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
                      if (msg.type === 'SEARCH_CITY') {
                        const city = msg.payload;
                        const res = await fetch(\`https://api.geoapify.com/v1/geocode/search?text=\${encodeURIComponent(city)}&limit=1&apiKey=\${key}\`);
                        const json = await res.json();
                        const location = json.features?.[0]?.geometry?.coordinates;
                        if (location) {
                          const [lon, lat] = location;
                          map.setView([lat, lon], 13);
                          marker.setLatLng([lat, lon]);
                          rev(lat, lon, 'search');
                        }
                      }
                    } catch (err) {
                      console.error('Map message error:', err);
                    }
                  });
                </script>
              </body></html>
            `,
              }}
              onMessage={e => onMapMessage(e.nativeEvent.data)}
            />
          </View>
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
          // editable={question.field === 'location' ? false : true}
        />
        {errors[question.field] ? (
          <Text style={{color: 'red', marginTop: 5}}>
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
      setIsScrolling(true);
      scrollRef.current?.scrollTo({x: newStep * layoutWidth, animated: true});
      setTimeout(() => setIsScrolling(false), 500); // Reset scrolling flag after animation
    } else {
      const interestIndexes = formData.interests.map(interest =>
        interestOptions.indexOf(interest),
      );
      // Build final payload object
      const finalData = {
        username: userData?.username.trim(),
        password: userData?.password.trim(),
        email: formData.email.trim(),
        screenName: formData.screenname.trim(),
        // dob: formData.dob ? formatISO(formData.dob) : null,
        dob: formData.dob,
        // dob: formData.dob,
        gender: formData.gender,
        city: formData.city || formData.location,
        state: formData.state,
        country: formData.country,
        zipcode: formData.zipcode,
        interests: interestIndexes.join(','),
      };

      console.log('✅ Final Payload to POST:', finalData);

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
      Alert.alert('Welcome!', 'You’ve successfully logged in.', [
        {text: 'Continue'},
      ]);
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
      setIsScrolling(true);
      scrollRef.current?.scrollTo({x: newStep * layoutWidth, animated: true});
      setTimeout(() => setIsScrolling(false), 500); // Reset scrolling flag after animation
    }
  };

  const onScroll = e => {
    if (isScrolling) return; // Ignore scroll events during programmatic scrolling

    const offsetX = e.nativeEvent.contentOffset.x;
    const calculatedStep = Math.round(offsetX / layoutWidth);
    let newStep = calculatedStep;

    // Restrict step to current, previous, or next step only
    if (calculatedStep > step + 1) {
      newStep = step + 1;
    } else if (calculatedStep < step - 1) {
      newStep = step - 1;
    }

    // Prevent forward scrolling if step is invalid or field is 'location'
    if (
      newStep > step &&
      (!isValidStep || questions[step]?.field === 'location')
    ) {
      scrollRef.current?.scrollTo({x: step * layoutWidth, animated: false});
      return;
    }

    // Snap to the nearest valid step
    if (newStep >= 0 && newStep < questions.length && newStep !== step) {
      scrollRef.current?.scrollTo({x: newStep * layoutWidth, animated: false});
    } else if (newStep !== step) {
      // Revert to current step if out of bounds
      scrollRef.current?.scrollTo({x: step * layoutWidth, animated: false});
    }
  };

  const onScrollEnd = e => {
    if (isScrolling) return; // Ignore momentum scroll end during programmatic scrolling

    const offsetX = e.nativeEvent.contentOffset.x;
    const calculatedStep = Math.round(offsetX / layoutWidth);
    let newStep = calculatedStep;

    // Restrict step to current, previous, or next step only
    if (calculatedStep > step + 1) {
      newStep = step + 1;
    } else if (calculatedStep < step - 1) {
      newStep = step - 1;
    }

    // Prevent forward scrolling if step is invalid or field is 'location'
    if (
      newStep > step &&
      (!isValidStep || questions[step]?.field === 'location')
    ) {
      scrollRef.current?.scrollTo({x: step * layoutWidth, animated: true});
      return;
    }

    // Update step if within bounds and different from current step
    if (newStep >= 0 && newStep < questions.length && newStep !== step) {
      setStep(newStep);
      setIsScrolling(true);
      scrollRef.current?.scrollTo({x: newStep * layoutWidth, animated: true});
      setTimeout(() => setIsScrolling(false), 500); // Reset scrolling flag after animation
    } else {
      // Revert to current step if out of bounds or no change
      scrollRef.current?.scrollTo({x: step * layoutWidth, animated: true});
    }
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
        if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
          error = 'Please select a valid date';
        }
        break;
      case 'gender':
        if (!value) {
          error = 'Please select a gender';
        }
        break;
      case 'interests':
        if (!value || value.length < 2) {
          error = 'Select at least 2 interest';
        }
        break;
      default:
        break;
    }

    setErrors(prev => ({...prev, [currentQuestion.field]: error}));
    setIsValidStep(!error);
    return !error;
  };

  return (
    <View
      style={{flex: 1}}
      onLayout={event => {
        const {width} = event.nativeEvent.layout;
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
            onScroll={onScroll}
            onMomentumScrollEnd={onScrollEnd}
            scrollEventThrottle={16}
            nestedScrollEnabled={true}
            scrollEnabled={isValidStep && questions[step]?.field !== 'location'}
            // scrollEnabled={questions[step]?.field !== 'location'}
            style={{flex: 1}}>
            {questions.map((questionItem, index) => (
              <View key={index} style={{width: layoutWidth}}>
                <View style={[styles.qAWrapper, {paddingHorizontal: 20}]}>
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
                <Text style={{color: 'white'}}>Previous</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={handleNext}
              style={[styles.btnNav, !isValidStep && {opacity: 0.5}]}
              disabled={!isValidStep}>
              <Text style={{color: 'white'}}>
                {step === questions.length - 1 ? 'Finish' : 'Next'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Progress Dots */}
          {questions[step]?.field !== 'location' && isValidStep && (
            <View style={styles.dotsContainer}>
              {questions.map((_, idx) => (
                <View
                  key={idx}
                  style={[styles.dot, step === idx && styles.dotActive]}
                />
              ))}
            </View>
          )}
        </>
      }
    </View>
  );
};
