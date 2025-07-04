import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
  Platform,
} from 'react-native';
import { styles } from '../../assets/styles/ThemeStyles';
import { globalStyles } from '../../assets/styles/GlobalStyles';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import { formatISO } from 'date-fns';
import WebView from 'react-native-webview';
import Geolocation from 'react-native-geolocation-service';
import { check, request, PERMISSIONS, RESULTS, openSettings } from 'react-native-permissions';
import Icon from 'react-native-vector-icons/Ionicons';
import { Dropdown } from 'react-native-element-dropdown';

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
  { label: 'Date of Birth', field: 'dob', placeholder: 'YYYY-MM-DD' },
  { label: 'Gender', field: 'gender' },
  { label: 'Choose your Interests (Any 2)', field: 'interests' },
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
  const [locationPermission, setLocationPermission] = useState(null);
  const [mapInitialized, setMapInitialized] = useState(false);

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

  const [selectedYear, setSelectedYear] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedDay, setSelectedDay] = useState('');


  // Request location permission on mount
  useEffect(() => {
    const checkLocationPermission = async () => {
      try {
        const platformPermission =
          Platform.OS === 'ios'
            ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
            : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;

        let status = await check(platformPermission);
        setLocationPermission(status);

        if (status === RESULTS.GRANTED) {
          getCurrentLocation();
        } else {
          // Clear location fields if permission is denied
          setFormData(prev => ({
            ...prev,
            location: '',
            city: '',
            state: '',
            country: '',
            zipcode: '',
          }));
        }
      } catch (err) {
        console.error('Permission check error:', err);
      }
    };

    checkLocationPermission();
  }, []);

  // Function to get current location
  const getCurrentLocation = async () => {
    try {
      Geolocation.getCurrentPosition(
        async position => {
          const { latitude, longitude } = position.coords;
          try {
            const response = await fetch(
              `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&apiKey=25127ca1c55f48909b03f43048040037`
            );
            const json = await response.json();
            const address = json.features?.[0]?.properties || {};
            setUserAddress({
              ...address,
              lat: latitude,
              lon: longitude,
              source: 'current',
            });
            setFormData(prev => ({
              ...prev,
              location: address.city || '',
              city: address.city || '',
              state: address.state || '',
              country: address.country || '',
              zipcode: address.postcode || '',
            }));
            updateMapLocationByCoords(latitude, longitude);
            setMapInitialized(true);
          } catch (err) {
            console.error('Error fetching address:', err);
            Alert.alert('Error', 'Unable to get current location.');
          }
        },
        error => {
          console.error('Error getting location:', error);
          Alert.alert('Error', 'Unable to get current location.');
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    } catch (err) {
      console.error('Geolocation error:', err);
    }
  };

  // Function to handle location permission request and get current location
  const requestCurrentLocation = async () => {
    try {
      const platformPermission =
        Platform.OS === 'ios'
          ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
          : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;

      let status = await check(platformPermission);
      if (status === RESULTS.DENIED) {
        status = await request(platformPermission);
      }
      setLocationPermission(status);

      if (status === RESULTS.GRANTED) {
        getCurrentLocation();
      } else if (status === RESULTS.BLOCKED) {
        Alert.alert(
          'Permission Denied',
          'Location access is required to get your current location. Please enable location permissions in your device settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Open Settings',
              onPress: async () => {
                try {
                  await openSettings();
                } catch (err) {
                  console.error('Error opening settings:', err);
                  Alert.alert('Error', 'Unable to open settings.');
                }
              },
            },
          ]
        );
      } else {
        Alert.alert(
          'Permission Denied',
          'Location permission is required to get your current location.',
          [{ text: 'OK' }]
        );
      }
    } catch (err) {
      console.error('Permission request error:', err);
      Alert.alert('Error', 'Unable to request location permission.');
    }
  };

  // Function to update map to specific coordinates
  const updateMapLocationByCoords = (lat, lon) => {
    if (webViewRef.current) {
      const jsCode = `
        map.setView([${lat}, ${lon}], 13);
        marker.setLatLng([${lat}, ${lon}]);
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'CURRENT_LOCATION', lat: ${lat}, lon: ${lon} }));
      `;
      webViewRef.current.injectJavaScript(jsCode);
    }
  };



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
    validateStep();
  }, [selectedYear, selectedMonth, selectedDay]);


  useEffect(() => {
    // Validate current step whenever formData changes
    validateStep();
  }, [formData, step]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === 'location') {
      updateMapLocation(value);
      // Clear other address fields when user types manually
      setFormData(prev => ({
        ...prev,
        city: '',
        state: '',
        country: '',
        zipcode: '',
      }));
      setUserAddress({});
    }
  };

  useEffect(() => {
    console.log('address:', userAddress);
    if (userData || userAddress) {
      const updatedForm = {
        screenname: userData?.username || '',
        // email: '',
        // location: userAddress?.city || '', // Set location to city from userAddress
        city: userAddress?.city || '',
        state: userAddress?.state_code || '',
        country: userAddress?.country || '',
        zipcode: userAddress?.postcode || '',
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
    if (webViewRef.current && cityName && cityName.length > 2) {
      const trimmedCity = cityName.trim();
      console.log('trimmedCity', `'${trimmedCity}'`);
      const escapedCity = trimmedCity.replace(/'/g, "\\'");
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
      if (address.type !== 'CURRENT_LOCATION') {
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
        setMapInitialized(true);
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

    // dob input
    if (question.field === 'dob') {
      const years = Array.from({ length: 50 }, (_, i) => {
        const year = new Date().getFullYear() - i;
        return { label: `${year}`, value: `${year}` };
      });

      const months = Array.from({ length: 12 }, (_, i) => {
        const month = String(i + 1).padStart(2, '0');
        return { label: month, value: month };
      });

      const days = Array.from({ length: 31 }, (_, i) => {
        const day = String(i + 1).padStart(2, '0');
        return { label: day, value: day };
      });

      const dropdownStyle = {
        backgroundColor: '#fff',
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        height: 50,
        paddingHorizontal: 10,
        marginBottom: 10,
      };

      const itemTextStyle = {
        fontSize: 16,
        color: '#333',
      };

      const containerStyle = {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
        zIndex: 5000,
      };

      return (
        <View style={{ zIndex: 5000 }}>
          <View style={containerStyle}>
            {/* Day Dropdown */}
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  marginBottom: 5,
                  fontSize: 16,
                  color: theme === 'dark' ? '#fff' : '#333',
                }}>
                Day
              </Text>
              <Dropdown
                style={dropdownStyle}
                data={days}
                labelField="label"
                valueField="value"
                placeholder="DD"
                value={selectedDay}
                onChange={item => setSelectedDay(item.value)}
                containerStyle={{
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: '#ddd',
                  backgroundColor: '#fff',
                  maxHeight: Dimensions.get('window').height * 0.4,
                }}
                itemTextStyle={itemTextStyle}
                selectedTextStyle={itemTextStyle}
                placeholderStyle={itemTextStyle}
                dropdownPosition="auto"
              />
            </View>
            {/* Month Dropdown */}
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  marginBottom: 5,
                  fontSize: 16,
                  color: theme === 'dark' ? '#fff' : '#333',
                }}>
                Month
              </Text>
              <Dropdown
                style={dropdownStyle}
                data={months}
                labelField="label"
                valueField="value"
                placeholder="MM"
                value={selectedMonth}
                onChange={item => setSelectedMonth(item.value)}
                containerStyle={{
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: '#ddd',
                  backgroundColor: '#fff',
                  maxHeight: Dimensions.get('window').height * 0.4,
                }}
                itemTextStyle={itemTextStyle}
                selectedTextStyle={itemTextStyle}
                placeholderStyle={itemTextStyle}
                dropdownPosition="auto"
              />
            </View>
            {/* Year Dropdown */}
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  marginBottom: 5,
                  fontSize: 16,
                  color: theme === 'dark' ? '#fff' : '#333',
                }}>
                Year
              </Text>
              <Dropdown
                style={dropdownStyle}
                data={years}
                labelField="label"
                valueField="value"
                placeholder="YYYY"
                value={selectedYear}
                onChange={item => setSelectedYear(item.value)}
                containerStyle={{
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: '#ddd',
                  backgroundColor: '#fff',
                  maxHeight: Dimensions.get('window').height * 0.4,
                }}
                itemTextStyle={itemTextStyle}
                selectedTextStyle={itemTextStyle}
                placeholderStyle={itemTextStyle}
                dropdownPosition="auto"
              />
            </View>
          </View>
          {errors[question.field] ? (
            <Text style={{ color: 'red', marginTop: 5 }}>
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
            style={[globalStyles.input]}
            placeholder={question.placeholder}
            placeholderTextColor="#9d9d9d"
            value={formData.location}
            onChangeText={text => {
              handleChange('location', text);
              updateMapLocation(text); // 🔄 Pan map to city
            }}
          // onChangeText={text => {
          //   const trimmedText = text.trim();
          //   handleChange('location', trimmedText);
          //   updateMapLocation(trimmedText);
          // }}
          />
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: "flex-end" }}>
            <TouchableOpacity
              onPress={requestCurrentLocation}
              style={globalStyles.getCurrentLocationBtn}>
              <Icon name="location-outline" size={16} color="#fff" style={{ marginRight: 6 }} />
              <Text style={{ color: 'white', fontWeight: '600' }}>
                {locationPermission === RESULTS.GRANTED ? 'Show My Current Location' : 'Allow Permission'}
              </Text>
            </TouchableOpacity>
          </View>

          {errors.location && (
            <Text style={{ color: 'red' }}>{errors.location}</Text>
          )}
          {locationPermission !== RESULTS.GRANTED && (
            <Text style={{ color: '#555', marginTop: 5, fontSize: 14 }}>
              Please allow location permission to auto-detect your location, or type your city above.
            </Text>
          )}

          <View
            style={{
              height: screenHeight * 0.5 + 60,
              marginTop: 10,
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
                  const map = L.map('map').setView([0, 0], 1); // Initialize with world view
                  L.tileLayer(\`https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey=\${key}\`, {
                    maxZoom: 18
                  }).addTo(map);
                  let marker = null; // Marker is null until a location is set
                  async function rev(lat, lon, source = 'tap') {
                    const res = await fetch(\`https://api.geoapify.com/v1/geocode/reverse?lat=\${lat}&lon=\${lon}&apiKey=\${key}\`);
                    const json = await res.json();
                    const address = json.features?.[0]?.properties || {};
                    window.ReactNativeWebView.postMessage(JSON.stringify({ ...address, source }));
                  }
                  map.on('click', e => {
                    const { lat, lng } = e.latlng;
                    if (marker) {
                      marker.setLatLng([lat, lng]);
                    } else {
                      marker = L.marker([lat, lng]).addTo(map);
                    }
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
                          if (marker) {
                            marker.setLatLng([lat, lon]);
                          } else {
                            marker = L.marker([lat, lon]).addTo(map);
                          }
                          rev(lat, lon, 'search');
                        }
                      } else if (msg.type === 'CURRENT_LOCATION') {
                        const { lat, lon } = msg;
                        map.setView([lat, lon], 13);
                        if (marker) {
                          marker.setLatLng([lat, lon]);
                        } else {
                          marker = L.marker([lat, lon]).addTo(map);
                        }
                        rev(lat, lon, 'current');
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
      setIsScrolling(true);
      scrollRef.current?.scrollTo({ x: newStep * layoutWidth, animated: true });
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
        { text: 'Continue' },
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
      scrollRef.current?.scrollTo({ x: newStep * layoutWidth, animated: true });
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
      scrollRef.current?.scrollTo({ x: step * layoutWidth, animated: false });
      return;
    }

    // Snap to the nearest valid step
    if (newStep >= 0 && newStep < questions.length && newStep !== step) {
      scrollRef.current?.scrollTo({ x: newStep * layoutWidth, animated: false });
    } else if (newStep !== step) {
      // Revert to current step if out of bounds
      scrollRef.current?.scrollTo({ x: step * layoutWidth, animated: false });
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
      scrollRef.current?.scrollTo({ x: step * layoutWidth, animated: true });
      return;
    }

    // Update step if within bounds and different from current step
    if (newStep >= 0 && newStep < questions.length && newStep !== step) {
      setStep(newStep);
      setIsScrolling(true);
      scrollRef.current?.scrollTo({ x: newStep * layoutWidth, animated: true });
      setTimeout(() => setIsScrolling(false), 500); // Reset scrolling flag after animation
    } else {
      // Revert to current step if out of bounds or no change
      scrollRef.current?.scrollTo({ x: step * layoutWidth, animated: true });
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

    setErrors(prev => ({ ...prev, [currentQuestion.field]: error }));
    setIsValidStep(!error);
    return !error;
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
            onScroll={onScroll}
            onMomentumScrollEnd={onScrollEnd}
            scrollEventThrottle={16}
            nestedScrollEnabled={true}
            scrollEnabled={isValidStep && questions[step]?.field !== 'location'}
            // scrollEnabled={questions[step]?.field !== 'location'}
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
          <View style={[styles.buttons, { justifyContent: step > 0 ? 'space-between' : 'flex-end' }]}>
            {step > 0 && (
              <TouchableOpacity onPress={handlePrevious} style={styles.btnNav}>
                <Text style={{ color: 'white' }}>Previous</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={handleNext}
              style={[styles.btnNav, !isValidStep && { opacity: 0.5 }]}
              disabled={!isValidStep}>
              <Text style={{ color: 'white' }}>
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
