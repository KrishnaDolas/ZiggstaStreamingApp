import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
  FlatList,
  ActivityIndicator,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import { styles, themeStyles } from '../../assets/styles/ThemeStyles';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import WebView from 'react-native-webview';
import { Dropdown } from 'react-native-element-dropdown';
import { useAppContext } from '../context/AppContext';
import Apiclient from '../utils/Apiclient';
import { SendErrorTotheServer } from '../utils/constant';
import Icon from 'react-native-vector-icons/MaterialIcons';
// import { NetworkInfo } from 'react-native-network-info';
import Geolocation from 'react-native-geolocation-service';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const screenHeight = Dimensions.get('window').height;
const initialWidth = Dimensions.get('window').width; // Fallback width

const questions = [
  {
    label: 'Enter Your Screen Name and Username',
    fields: ['screenname', 'userName'], // Combined fields
    placeholders: {
      screenname: 'Enter your screen name',
      userName: 'Enter your username',
    },
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

// Helper: return date 18 years ago from today in YYYY-MM-DD
const getDefaultDOB = () => {
  const today = new Date();
  today.setFullYear(today.getFullYear() - 18);
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const isValidUsername = name =>
  /^[a-zA-Z0-9_]+$/.test(name) && name.length >= 6 && !/\s/.test(name);

export const RegisterForm = ({
  userData,
  theme,
  onLogin,
}) => {
  const insets = useSafeAreaInsets();
  const { userAddress, setUserAddress, ipAddress, setIpAddress, setUserData } = useAppContext();
  const [step, setStep] = useState(0);
  const [layoutWidth, setLayoutWidth] = useState(initialWidth);
  const scrollRef = useRef(null);
  const webViewRef = useRef(null);
  const [errors, setErrors] = useState({});
  const [isValidStep, setIsValidStep] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const [mapInitialized, setMapInitialized] = useState(false);
  const [webViewLoaded, setWebViewLoaded] = useState(false); // New state for WebView load status
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedDay, setSelectedDay] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [interestOptions, setInterestOptions] = useState([]); // Dynamic interest options
  const [categories, setCategories] = useState([]); // Store full categories data for categoryID mapping
  const [usernameStatus, setUsernameStatus] = useState(null); // null, 'checking', 'available', 'taken'
  const [usernameCheckMessage, setUsernameCheckMessage] = useState('');

  const [formData, setFormData] = useState({
    screenname: '',
    userName: '',
    location: '',
    dob: getDefaultDOB(), // ✅ default 18 years ago
    gender: '',
    interests: [],
    city: '',
    state: '',
    country: '',
    postcode: '',
  });



  const requestLocationPermission = async () => {
    try {
      console.log('Requesting location permission...');
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission Required',
            message: 'This app requires access to your location to provide personalized services.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        const isGranted = granted === PermissionsAndroid.RESULTS.GRANTED;
        console.log('Android permission result:', isGranted ? 'granted' : 'denied');
        await AsyncStorage.setItem('locationPermission', isGranted ? 'granted' : 'denied');
        return isGranted;
      } else {
        const auth = await Geolocation.requestAuthorization('whenInUse');
        const isGranted = auth === 'granted';
        console.log('iOS permission result:', isGranted ? 'granted' : 'denied');
        await AsyncStorage.setItem('locationPermission', isGranted ? 'granted' : 'denied');
        return isGranted;
      }
    } catch (error) {
      console.error('Permission request error:', error);
      await AsyncStorage.setItem('locationPermission', 'denied');
      return false;
    }
  };

  const fetchAddressFromCoords = async (latitude, longitude) => {
    try {
      // First try standard reverse geocoding
      let response = await fetch(
        `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&apiKey=25127ca1c55f48909b03f43048040037`
      );
      let data = await response.json();
      let address = data.features?.[0]?.properties || {};
      console.log('Reverse geocoding (device):', address);

      // If no postcode, try searching for a nearby postal code
      if (!address.postcode && latitude && longitude) {
        const searchResponse = await fetch(
          `https://api.geoapify.com/v1/geocode/search?text=postcode&lat=${latitude}&lon=${longitude}&limit=1&apiKey=25127ca1c55f48909b03f43048040037`
        );
        const searchJson = await searchResponse.json();
        address = searchJson.features?.[0]?.properties || address;
        console.log('Nearby postcode search (device):', address);
      }

      const newAddress = {
        city: address.city || '',
        state: address.state || '',
        country: address.country || '',
        postcode: address.postcode || '',
        latitude,
        longitude,
        source: 'device',
      };
      updateLocationData(newAddress);
      await AsyncStorage.setItem('userAddress', JSON.stringify(newAddress));
    } catch (error) {
      console.error('Geoapify reverse geocoding error:', error);
    }
  };

  const fetchAddressFromIP = async () => {
    try {
      const ipRes = await fetch('https://api64.ipify.org?format=json');
      const ipData = await ipRes.json();
      const ip = ipData.ip;
      setIpAddress(ip);

      const response = await fetch(
        `https://api.geoapify.com/v1/ipinfo?apiKey=25127ca1c55f48909b03f43048040037`
      );
      const json = await response.json();
      const address = {
        city: json.city?.name || '',
        state: json.state?.name || '',
        country: json.country?.name || '',
        postcode: json.postcode || '',
        latitude: json.location?.latitude || null,
        longitude: json.location?.longitude || null,
        ip,
        source: 'ip',
      };

      if (!address.postcode && address.latitude && address.longitude) {
        const reverseResponse = await fetch(
          `https://api.geoapify.com/v1/geocode/reverse?lat=${address.latitude}&lon=${address.longitude}&type=postcode&apiKey=25127ca1c55f48909b03f43048040037`
        );
        const reverseJson = await reverseResponse.json();
        const reverseAddress = reverseJson.features?.[0]?.properties || {};
        console.log('Reverse geocoding (IP):', reverseAddress);
        const newAddress = {
          city: reverseAddress.city || address.city,
          state: reverseAddress.state || address.state,
          country: reverseAddress.country || address.country,
          postcode: reverseAddress.postcode || '',
          latitude: address.latitude,
          longitude: address.longitude,
          ip,
          source: 'ip',
        };
        updateLocationData(newAddress);
        await AsyncStorage.setItem('userAddress', JSON.stringify(newAddress));
      } else {
        updateLocationData(address);
        await AsyncStorage.setItem('userAddress', JSON.stringify(address));
      }
    } catch (error) {
      console.error('IP-based location error:', error);
    }
  };

  useEffect(() => {
    const checkLocationPermission = async () => {
      try {
        // Clear existing locationPermission to force a new prompt
        await AsyncStorage.removeItem('locationPermission');
        console.log('Cleared existing locationPermission to force new prompt');

        // Request permission every time the registration form mounts
        const granted = await requestLocationPermission();
        if (granted) {
          Geolocation.getCurrentPosition(
            position => {
              const { latitude, longitude } = position.coords;
              console.log('Got device location:', { latitude, longitude });
              fetchAddressFromCoords(latitude, longitude);
            },
            error => {
              console.error('Location error:', error.code, error.message);
              fetchAddressFromIP();
              Alert.alert(
                'Location Permission Denied',
                'Using approximate location from IP. For better accuracy, enable location access in settings.',
                [{ text: 'OK' }]
              );
            },
            {
              enableHighAccuracy: true,
              timeout: 15000,
              maximumAge: 10000,
              forceRequestLocation: true,
            }
          );
        } else {
          console.log('Location permission denied, using IP-based location');
          fetchAddressFromIP();
          Alert.alert(
            'Location Permission Denied',
            'Using approximate location from IP. For better accuracy, enable location access in settings.',
            [{ text: 'OK' }]
          );
        }
      } catch (error) {
        console.error('Error checking location permission:', error);
        fetchAddressFromIP();
        Alert.alert(
          'Location Error',
          'Unable to check location permission. Using approximate location.',
          [{ text: 'OK' }]
        );
      }
    };
    checkLocationPermission();
  }, []);


  // Function to fetch user interest from the API

  useEffect(() => {
    const getInterestData = async () => {
      try {
        const response = await Apiclient.post('/getcategories');
        // console.log('response getcategories', response);
        if (response?.data?.categories) {
          const categoriesData = response.data.categories;
          setCategories(categoriesData); // Store full categories data
          setInterestOptions(categoriesData.map(cat => cat.categoryName)); // Set interest options
        }
      } catch (error) {
        console.error('Error fetching get categories:', error);
      }
    };
    getInterestData();
  }, []);

  // Check username availability with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.userName && isValidUsername(formData.userName)) {
        checkUserNameExists(formData.userName.trim());
      } else {
        setUsernameStatus(null);
        setUsernameCheckMessage('');
        validateStep(); // Trigger validation for invalid username
      }
    }, 500); // Debounce for 500ms

    return () => clearTimeout(timer);
  }, [formData.userName]);

  // Function to check if username exists
  const checkUserNameExists = async (trimmedUserName) => {
    if (!isValidUsername(trimmedUserName)) {
      setUsernameStatus(null);
      setUsernameCheckMessage('');
      validateStep(); // Trigger validation for invalid username
      return;
    }
    setUsernameStatus('checking');
    try {
      const res = await Apiclient.post('/register/checkUsername', { username: trimmedUserName });
      if (res.data.available) {
        setUsernameStatus('available');
        setUsernameCheckMessage(''); // Clear message for available username
        setErrors(prev => ({ ...prev, userName: '' })); // Clear userName error
        setIsValidStep(true); // Enable Next button
      } else {
        setUsernameStatus('taken');
        setUsernameCheckMessage(res.data.message || 'Username is already taken.');
        setErrors(prev => ({
          ...prev,
          userName: res.data.message || 'Username is already taken.',
        })); // Set error
        setIsValidStep(false); // Disable Next button
      }
    } catch (err) {
      console.log('user name taken catch err', err);
      if (err.response && err.response.status === 409 && err.response.data) {
        setUsernameStatus('taken');
        // setUsernameCheckMessage(err.response.data.message || 'Username is already taken.');
        setUsernameCheckMessage('Username is already taken.');
        // setErrors(prev => ({
        //   ...prev,
        //   userName: err.response.data.message || 'Username is already taken.',
        // })); // Set error
        setErrors(prev => ({
          ...prev,
          userName: 'Username is already taken.',
        })); // Set error
        setIsValidStep(false); // Disable Next button
      } else {
        console.error('Error checking username:', err);
        setUsernameStatus('error');
        setUsernameCheckMessage('You’ve made too many requests. Please try again after a short while.');
        setErrors(prev => ({
          ...prev,
          userName: 'You’ve made too many requests. Please try again after a short while.',
        })); // Set error
        setIsValidStep(false); // Disable Next button on error
        SendErrorTotheServer(err, 'checkUserNameExists');
      }
    }
  };

  const updateLocationData = (address, source = 'device') => {
    const newAddress = {
      city: address.city || '',
      state: address.state || '',
      country: address.country || '',
      postcode: address.postcode || '',
      lat: address.latitude || address.lat || null,
      lon: address.longitude || address.lon || null,
      ip: ipAddress || address.ip || '',
      source,
    };

    setFormData(prev => ({
      ...prev,
      location: newAddress.city || address.formatted || '',
      city: newAddress.city,
      state: newAddress.state,
      country: newAddress.country,
      postcode: newAddress.postcode,
    }));

    setUserAddress(prev => ({
      ...prev,
      ...newAddress,
    }));

    if (newAddress.lat && newAddress.lon && webViewLoaded) {
      updateMapLocationByCoords(newAddress.lat, newAddress.lon);
      setMapInitialized(true);
    }
  };


  useEffect(() => {
    if (userAddress && userAddress.latitude && userAddress.longitude && webViewLoaded && !mapInitialized) {
      updateMapLocationByCoords(userAddress.latitude, userAddress.longitude);
      setMapInitialized(true);
    }
    if (userAddress && userAddress.city) {
      setFormData(prev => ({
        ...prev,
        location: userAddress.city,
        city: userAddress.city,
        state: userAddress.state || '',
        country: userAddress.country || '',
        postcode: userAddress.postcode || '',
      }));
    }
  }, [userAddress, webViewLoaded]);


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
      handleLocationSearch(value);
    }
    if (field === 'userName') {
      setUsernameCheckMessage(''); // Clear username check message from API
      validateStep(); // Validate immediately to set error for invalid username
    }
  };

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

  // Handle location search with autocomplete
  const handleLocationSearch = async text => {
    if (text.length < 3) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(
          text
        )}&format=json&apiKey=25127ca1c55f48909b03f43048040037`
      );
      const json = await response.json();
      setSearchResults(json.results || []);
    } catch (err) {
      console.error('Error fetching autocomplete results:', err);
      setSearchResults([]);
    }
  };

  // Handle selection from autocomplete results
  const handleSelectLocation = async item => {
    console.log('Selected item:', item);
    // Check if postcode is missing and coordinates are available
    if (!item.postcode && item.lat && item.lon) {
      try {
        // Try reverse geocoding with postcode type
        let reverseResponse = await fetch(
          `https://api.geoapify.com/v1/geocode/reverse?lat=${item.lat}&lon=${item.lon}&type=postcode&apiKey=25127ca1c55f48909b03f43048040037`
        );
        let reverseJson = await reverseResponse.json();
        let reverseAddress = reverseJson.features?.[0]?.properties || {};
        console.log('Reverse geocoding (postcode type):', reverseAddress);
        updateLocationData(
          {
            ...item,
            city: reverseAddress.city || item.city,
            state: reverseAddress.state || item.state,
            country: reverseAddress.country || item.country,
            postcode: reverseAddress.postcode || '',
          },
          'search'
        );
      } catch (err) {
        console.error('Error fetching reverse geocoding for search:', err);
        updateLocationData(item, 'search'); // Fallback to item if reverse geocoding fails
      }
    } else {
      updateLocationData(item, 'search');
    }
    setSearchResults([]);
    setIsSearching(false);
  };


  const updateMapLocationByCoords = (lat, lon) => {
    if (webViewRef.current && lat && lon) {
      const jsCode = `
        map.setView([${lat}, ${lon}], 13);
        if (marker) {
          marker.setLatLng([${lat}, ${lon}]);
        } else {
          marker = L.marker([${lat}, ${lon}]).addTo(map);
        }
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'CURRENT_LOCATION', lat: ${lat}, lon: ${lon} }));
      `;
      webViewRef.current.injectJavaScript(jsCode);
      console.log('Map updated with coordinates:', lat, lon); // Debugging log
    } else {
      console.log('WebView not ready or invalid coordinates:', { webViewRef: !!webViewRef.current, lat, lon }); // Debugging log
    }
  };


  const onMapMessage = message => {
    try {
      const address = JSON.parse(message);
      if (address.type !== 'CURRENT_LOCATION') {
        updateLocationData(address, 'tap');
      }
    } catch (err) {
      console.error('Failed to parse map address:', err);
    }
  };

  const renderStepContent = question => {
    if (question.fields) {
      // Combined screenname and userName step
      return (
        <View>
          {/* Screen Name Input */}
          <Text style={{ fontSize: 16, color: theme === 'dark' ? '#fff' : '#333', marginBottom: 5 }}>
            Screen Name
          </Text>
          <TextInput
            style={[styles.input, themeStyles[theme].input, { marginVertical: 0 }]}
            placeholder={question.placeholders.screenname}
            placeholderTextColor="#9d9d9d"
            value={formData.screenname}
            onChangeText={text => handleChange('screenname', text)}
            maxLength={13}
          />
          {/* Info message below the input */}
          <Text style={{ fontSize: 13, color: theme === 'dark' ? '#bbb' : '#555', marginTop: 5, marginBottom: 10 }}>
            This name will be visible on your profile and across the app.
          </Text>
          {errors.screenname && (
            <Text style={{ color: '#0035ff', marginTop: 5, marginBottom: 10 }}>
              {errors.screenname}
            </Text>
          )}
          {/* Username Input */}
          <Text style={{ fontSize: 16, color: theme === 'dark' ? '#fff' : '#333', marginTop: 10, marginBottom: 5 }}>
            Username
          </Text>
          <View style={{ position: 'relative' }}>
            <TextInput
              style={[
                styles.input,
                themeStyles[theme].input,
                { marginVertical: 0 },
                usernameStatus === 'taken' && { borderColor: 'red', borderWidth: 1 },
              ]}
              placeholder={question.placeholders.userName}
              placeholderTextColor="#9d9d9d"
              value={formData.userName}
              onChangeText={text => handleChange('userName', text)}
              maxLength={30}
            />
            {usernameStatus === 'checking' && (
              <ActivityIndicator
                style={{ position: 'absolute', right: 13, top: 13 }}
                size="small"
                color="#666"
              />
            )}
            {usernameStatus === 'available' && (
              <Icon
                name="check"
                size={20}
                color="green"
                style={{ position: 'absolute', right: 13, top: 13 }}
              />
            )}
            {errors.userName && (
              <Text style={{ color: '#0035ff', marginTop: 5 }}>
                {errors.userName}
              </Text>
            )}
          </View>
        </View>
      );
    }

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
                <Text style={{ color: 'white', textAlign: 'center' }}>{gender}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {errors[question.field] ? (
            <Text style={{ color: '#0035ff', marginTop: 5 }}>
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
            <Text style={{ color: '#0035ff', marginTop: 5 }}>
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
            <Text style={{ color: '#0035ff', marginTop: 5 }}>
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
            style={[styles.input, themeStyles[theme].input, { marginVertical: 0 }]}
            placeholder={question.placeholder}
            placeholderTextColor="#9d9d9d"
            value={formData.location}
            onChangeText={text => handleChange('location', text)}
          />
          <Text
            style={{
              fontSize: 14,
              color: theme === 'dark' ? '#ccc' : '#666',
              marginTop: 8,
              marginLeft: 4,
              textAlign: 'left',
            }}>
            Enter city name for best search results
          </Text>
          {errors.location && (
            <Text style={{ color: 'red' }}>{errors.location}</Text>
          )}
          {userAddress?.source === 'ip' && (
            <Text style={{ color: '#0035ff', marginTop: 5 }}>
              Using approximate location from IP. For better accuracy, enable location access in settings.
            </Text>
          )}
          {isSearching && searchResults.length > 0 && (
            <FlatList
              data={searchResults}
              keyExtractor={item => item.place_id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={{
                    padding: 10,
                    borderBottomWidth: 1,
                    borderBottomColor: '#ddd',
                    backgroundColor: theme === 'dark' ? '#333' : '#fff',
                  }}
                  onPress={() => handleSelectLocation(item)}>
                  <Text style={{ color: theme === 'dark' ? '#fff' : '#000' }}>
                    {item.formatted}
                  </Text>
                </TouchableOpacity>
              )}
              style={{
                maxHeight: 150,
                marginTop: 5,
                backgroundColor: theme === 'dark' ? '#333' : '#fff',
                borderRadius: 8,
              }}
            />
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
                    const map = L.map('map').setView([0, 0], 1);
                    L.tileLayer(\`https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey=\${key}\`, {
                      maxZoom: 18
                    }).addTo(map);
                    let marker = null;
                    async function rev(lat, lon, source = 'tap') {
                      const res = await fetch(\`https://api.geoapify.com/v1/geocode/reverse?lat=\${lat}&lon=\${lon}&apiKey=\${key}\`);
                      const json = await res.json();
                      const address = json.features?.[0]?.properties || {};
                      window.ReactNativeWebView.postMessage(JSON.stringify({ ...address, lat, lon, source }));
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
                          const res = await fetch(\`https://api.geoapify.com/v1/geocode/autocomplete?text=\${encodeURIComponent(city)}&format=json&apiKey=\${key}\`);
                          const json = await res.json();
                          const location = json.results?.[0]?.geometry?.coordinates;
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
              onLoad={() => {
                setWebViewLoaded(true);
                console.log('WebView loaded'); // Debugging log
              }}
            />
          </View>
        </View>
      );
    }

    // Modified username input with check tick and status message
    // if (question.field === 'userName') {
    //   return (
    //     <View style={{ position: 'relative' }}>
    //       <TextInput
    //         style={[
    //           styles.input, themeStyles[theme].input, { marginVertical: 0 },
    //           usernameStatus === 'taken' && { borderColor: 'red', borderWidth: 1, },
    //         ]}
    //         placeholder={question.placeholder}
    //         placeholderTextColor="#9d9d9d"
    //         value={formData[question.field]}
    //         onChangeText={text => handleChange(question.field, text)}
    //       />
    //       {usernameStatus === 'checking' && (
    //         <ActivityIndicator
    //           style={{ position: 'absolute', right: 13, top: 13 }}
    //           size="small"
    //           color="#666"
    //         />
    //       )}
    //       {usernameStatus === 'available' && (
    //         <Icon
    //           name="check"
    //           size={20}
    //           color="green"
    //           style={{ position: 'absolute', right: 13, top: 13 }}
    //         />
    //       )}
    //       {errors[question.field] && (
    //         <Text style={{ color: '#0035ff', marginTop: 5 }}>
    //           {errors[question.field]}
    //         </Text>
    //       )}
    //     </View>
    //   );
    // }

    return (
      <>
        <TextInput
          style={[styles.input, themeStyles[theme].input, { marginVertical: 0 }]}
          placeholder={question.placeholder}
          placeholderTextColor="#9d9d9d"
          value={formData[question.field]}
          onChangeText={text => handleChange(question.field, text)}
        // editable={question.field === 'location' ? false : true}
        />
        {errors[question.field] ? (
          <Text style={{ color: '#0035ff', marginTop: 5 }}>
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

      if (isSubmitting) return; // Prevent duplicate submission
      // Map selected interest names to their categoryIDs and sort in ascending order
      const interestIds = formData.interests
        .map(interest => {
          const category = categories.find(cat => cat.categoryName === interest);
          return category ? category.categoryID : null;
        })
        .filter(id => id !== null)
        .sort((a, b) => a - b); // Sort numerically in ascending order

      // Build final payload object
      const finalData = {
        username: formData.userName.trim(),
        password: userData?.password.trim(),
        email: userData?.email,
        screenName: formData.screenname.trim(),
        dob: formData.dob,
        gender: formData.gender,
        city: formData.city || userAddress?.city || formData.location || '',
        state: formData.state || userAddress?.state || '',
        country: formData.country || userAddress?.country || '',
        zipcode: userAddress?.postcode || formData.postcode || '',
        interests: interestIds.join(','),
      };

      console.log('✅ Final Payload to POST:', finalData);

      setIsSubmitting(true); // Start loader

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
        .then(async data => {
          if (data.message === 'User registered successfully') {
            await userLogedIn();
          } else {
            setErrors(data.message || 'Registration failed');
            Alert.alert('Registration failed', data.message);
          }
        })
        .catch(err => {
          console.error('API Error:', err);
          SendErrorTotheServer(err, 'handleRegistration');
        })
        .finally(() => {
          setIsSubmitting(false); // Stop loader
        });
    }
  };

  const userLogedIn = async () => {
    const parameter = {
      email: userData?.email,
      password: userData?.password,
    };
    const res = await axios.post(
      'https://api.streamalong.live/auth/login',
      parameter,
      {
        headers: {
          'x-api-key': '6cca5d4e-719b-4c28-aabd-4aeb2618ee1d',
        },
      },
    );
    if (res.data.message === 'Login successful') {
      // Alert.alert('Welcome!', 'You’ve successfully logged in.', [
      //   { text: 'Continue' },
      // ]);
      setUserData(res.data.user);
      await AsyncStorage.setItem('token', res.data.token);
      await AsyncStorage.setItem('UserData', JSON.stringify(res.data.user));
      onLogin();
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
    let error = {};
    let isValid = true;

    if (currentQuestion.fields) {
      // Validate both screenname and userName
      const screenname = formData.screenname.trim();
      const userName = formData.userName;

      // Screen name validation
      if (!screenname || screenname.length < 5) {
        error.screenname = 'Screen name must be at least 5 characters';
        isValid = false;
      } else if (screenname.length > 12) {
        error.screenname = 'Screen name cannot be more than 12 characters';
        isValid = false;
      } else {
        error.screenname = ''; // Explicitly clear error when valid
      }

      // Username validation
      if (!userName || !isValidUsername(userName)) {
        error.userName = 'Username must be at least 6 characters with only letters, numbers, or underscores';
        isValid = false;
      } else if (usernameStatus === 'taken') {
        error.userName = usernameCheckMessage;
        isValid = false;
      } else if (usernameStatus === 'checking') {
        error.userName = 'Checking username availability...';
        isValid = false;
      } else {
        error.userName = ''; // Explicitly clear error when valid
      }
    } else {
      const value = formData[currentQuestion.field];
      switch (currentQuestion.field) {
        case 'location':
          if (!value || value.trim() === '') {
            error.location = 'Location is required';
            isValid = false;
          } else {
            error.location = ''; // Clear error
          }
          break;
        case 'dob':
          if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
            error.dob = 'Please select a valid date';
            isValid = false;
          } else {
            error.dob = ''; // Clear error
          }
          break;
        case 'gender':
          if (!value) {
            error.gender = 'Please select a gender';
            isValid = false;
          } else {
            error.gender = ''; // Clear error
          }
          break;
        case 'interests':
          if (!value || value.length < 2) {
            error.interests = 'Select at least 2 interests';
            isValid = false;
          } else {
            error.interests = ''; // Clear error
          }
          break;
        default:
          break;
      }
    }

    // Update errors state, ensuring previous errors are preserved unless explicitly cleared
    setErrors(prev => ({
      ...prev,
      screenname: error.screenname !== undefined ? error.screenname : prev.screenname,
      userName: error.userName !== undefined ? error.userName : prev.userName,
      location: error.location !== undefined ? error.location : prev.location,
      dob: error.dob !== undefined ? error.dob : prev.dob,
      gender: error.gender !== undefined ? error.gender : prev.gender,
      interests: error.interests !== undefined ? error.interests : prev.interests,
    }));

    setIsValidStep(isValid && !(currentQuestion.fields && usernameStatus !== 'available'));
    return isValid;
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
                <View style={[styles.qAWrapper, { paddingHorizontal: 20, paddingTop: 0 }]}>
                  <Text style={[styles.question, themeStyles[theme].question]}>{questionItem.label}</Text>
                  {renderStepContent(questionItem)}
                </View>
              </View>
            ))}
          </ScrollView>

          {/* Navigation Buttons */}
          <View style={[styles.buttons, { marginBottom: 0, paddingBottom: insets.bottom, justifyContent: 'space-between' }]}>
            <TouchableOpacity
              onPress={handlePrevious}
              style={[styles.btnNav, step === 0 && { opacity: 0 }]} // Hide visually but maintain layout
              disabled={step === 0}
            >
              <Text style={{ color: 'white' }}>Previous</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleNext}
              style={[styles.btnNav, (!isValidStep || isSubmitting) && { opacity: 0.5 }]}
              disabled={!isValidStep || isSubmitting}>
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={{ color: 'white' }}>
                  {step === questions.length - 1 ? 'Finish' : 'Next'}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Progress Dots */}
          {questions[step]?.field !== 'location' && isValidStep && (
            <View style={[styles.dotsContainer, { bottom: insets.bottom + 80 }]}>
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
