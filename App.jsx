import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  View,
  Text,
  StyleSheet,
  AppState,
  Platform,
  PermissionsAndroid,
  TouchableOpacity,
  Image,
  Alert,
  BackHandler,
  LogBox,
} from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import Geolocation from 'react-native-geolocation-service';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import SystemNavigationBar from 'react-native-system-navigation-bar';
import { ThemeProvider } from './src/context/ThemeProvider';
import { MainScreen } from './src/screens/MainScreen';
import { AuthScreen } from './src/screens/AuthScreen';
import { SplashScreen } from './src/screens/SplashScreen';
// import { ProfileScreen } from './src/screens/ProfileScreen';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { MessageListScreen } from './src/screens/MessageListScreen';
import { WalletDashboardScreen } from './src/screens/WalletDashboardScreen';
import { StatisticsSettingScreen } from './src/screens/StatisticsSettingScreen';
import { useAppContext } from './src/context/AppContext';
// import { debounceStorage } from './src/utils/debounceStorage';
import Apiclient from './src/utils/Apiclient';
import TermsOfUseScreen from './src/screens/TermsOfUseScreen';
import ProfileScreenModal from './src/modals/ProfileScreenModal';
import { ThemeContext } from './src/context/ThemeContext';
import { themeStyles } from './assets/styles/ThemeStyles';
import { ChatScreen } from './src/screens/ChatScreen';
import { SendErrorTotheServer, socket } from './src/utils/constant';
import NetworkCheck from './src/components/NetworkCheck';
import Colors from './assets/styles/Colors';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// const NetworkCheck = () => (
//   <View style={styles.center}>
//     <ActivityIndicator size="large" color="#0000ff" />
//     <Text style={styles.text}>No Internet Connection</Text>
//   </View>
// );

// Custom Tab Bar Component to handle Profile Modal
const CustomTabBar = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();
  const { theme } = useContext(ThemeContext);
  const { userData, isInStreamRoom } = useAppContext();
  const [visibleModal, setVisibleModal] = useState(null);

  const isDark = theme === 'dark';

  const iconColor = (isFocused) => {
    return isFocused ? '#d93a63' : (isDark ? '#fff' : 'grey');
  };

  if (isInStreamRoom) {
    return null; // Hide entire tab bar
  }


  // Footer styles to match your original styling
  const footerStyles = {
    footer: {
      position: 'absolute',
      bottom: insets.bottom,
      left: 0,
      right: 0,
      backgroundColor: isDark ? themeStyles.dark.footer?.backgroundColor || '#000' : 'white',
      paddingVertical: 10,
      // marginBottom: insets.bottom, // Add safe area padding
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      borderTopWidth: 1,
      borderTopColor: isDark ? themeStyles.dark.footer?.borderTopColor || '#333' : themeStyles.light.footer?.borderTopColor || '#e0e0e0',
      borderBottomWidth: 1,
      borderBottomColor: isDark ? themeStyles.dark.footer?.borderTopColor || '#333' : themeStyles.light.footer?.borderTopColor || '#e0e0e0',
    },
    footerItem: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    footerText: {
      fontSize: 12,
      color: '#fff',
    },
  };

  const getTabIcon = (routeName, isFocused, size = 25) => {
    const color = iconColor(isFocused);

    switch (routeName) {
      case 'Profile':
        return <FontAwesome name="user-o" size={size} color={color} />;
      case 'Stats':
        return <Ionicons name="stats-chart" size={size} color={color} />;
      case 'Main':
        return (
          <Image
            source={require('./assets/images/logo-icon.png')}
            resizeMode="contain"
            style={{
              width: 30,
              height: 30,
              tintColor: color,
            }}
          />
        );
      case 'Messages':
        return <Ionicons name="chatbox-ellipses-outline" size={size} color={color} />;
      case 'WalletDashboard':
        return <Ionicons name="wallet-outline" size={size} color={color} />;
      default:
        return null;
    }
  };

  const getTabLabel = (routeName) => {
    switch (routeName) {
      case 'Main':
        return 'Home';
      case 'WalletDashboard':
        return 'Wallet';
      default:
        return routeName;
    }
  };

  return (
    <>
      <View style={footerStyles.footer}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = getTabLabel(route.name);
          const isFocused = state.index === index;

          const onPress = () => {
            if (route.name === 'Profile') {
              // Show modal instead of navigating
              setVisibleModal('profile-screen-modal');
              return;
            }

            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              style={footerStyles.footerItem}
            >
              {getTabIcon(route.name, isFocused)}
              <Text style={[footerStyles.footerText, { color: iconColor(isFocused) }]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Profile Modal */}
      {visibleModal === 'profile-screen-modal' && (
        <ProfileScreenModal
          visible="true"
          onClose={() => setVisibleModal(null)}
          profileData={userData}
          isMainProfile={true}
          isProfileAvatarUpdate={true}
        />
      )}
    </>
  );
};

// Bottom Tab Navigator
const BottomTabNavigator = ({ onLogout, userData, userAddress }) => {
  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{
          headerShown: false,
        }}
        initialRouteName="Main"
      >
        <Tab.Screen
          name="Profile"
          component={View} // Dummy component since we handle with modal
        />
        <Tab.Screen name="Stats">
          {(props) => (
            <StatisticsSettingScreen
              {...props}
              onLogout={onLogout}
              userData={userData}
              address={userAddress}
            />
          )}
        </Tab.Screen>
        <Tab.Screen name="Main">
          {(props) => (
            <MainScreen
              {...props}
              userData={userData}
              isAuthenticated={true}
            />
          )}
        </Tab.Screen>
        <Tab.Screen name="Messages">
          {(props) => (
            <MessageListScreen
              {...props}
              userData={userData}
            />
          )}
        </Tab.Screen>
        <Tab.Screen name="WalletDashboard">
          {(props) => (
            <WalletDashboardScreen
              {...props}
              userData={userData}
            />
          )}
        </Tab.Screen>
      </Tab.Navigator>
    </View>
  );
};

const App = () => {
  const { theme } = useContext(ThemeContext) || 'dark';
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(true);
  const navigationRef = useRef();
  const [currentRouteName, setCurrentRouteName] = useState(null);
  const [isNavigationReady, setIsNavigationReady] = useState(false);
  const {
    userAddress,
    setUserAddress,
    userData,
    setUserData,
    setProfileData,
    setIpAddress,
    fetchProfileDetails,
    setSubscriptionStatus,
    setModalStage,
    setModalLabelName,
    setModalVisibleStage,
  } = useAppContext();

  const hasFetchedAddress = useRef(false); // Prevent multiple fetches

  const handleLogin = () => setIsAuthenticated(true);

  useEffect(() => {
    if (theme === 'dark') {
      SystemNavigationBar.setNavigationColor('#000000', 'light', 'navigation');
    } else {
      SystemNavigationBar.setNavigationColor('#ffffff', 'dark', 'navigation');
    }
  }, [theme]);


  const handleLogout = async () => {
    try {
      // Only remove app/session-specific keys, not the theme
      await AsyncStorage.multiRemove([
        'token',
        'UserData',
        'locationTrackingEnabled',
        'onlyProfileVerified',
        'allowNotification',
        'distanceRange',
        'userAddress', // Clear userAddress on logout
        'locationPermission', // Clear location permission to prompt again
      ]);
      setModalStage('first');
      setModalLabelName(null);
      setModalVisibleStage(null);
      setUserAddress(null);
      setUserData(null);
      setProfileData(null);
      setIpAddress('');
      setIsAuthenticated(false);
      hasFetchedAddress.current = false; // Allow re-fetch on next load
      socket.disconnect(); // Disconnect socket on logout
    } catch (error) {
      SendErrorTotheServer(error, 'handleLogout');
    }
  };

  const requestLocationPermission = async () => {
    try {
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
        await AsyncStorage.setItem('locationPermission', isGranted ? 'granted' : 'denied');
        return isGranted;
      } else {
        const auth = await Geolocation.requestAuthorization('whenInUse');
        const isGranted = auth === 'granted';
        await AsyncStorage.setItem('locationPermission', isGranted ? 'granted' : 'denied');
        return isGranted;
      }
    } catch (error) {
      SendErrorTotheServer(error, 'requestLocationPermission');
      await AsyncStorage.setItem('locationPermission', 'denied');
      return false;
    }
  };

  const fetchAddressFromCoords = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&apiKey=25127ca1c55f48909b03f43048040037`
      );
      const data = await response.json();
      if (data.features && data.features.length > 0) {
        const address = data.features[0].properties;
        const newAddress = {
          city: address.city || '',
          state: address.state || '',
          country: address.country || '',
          postcode: address.postcode || '',
          latitude,
          longitude,
          source: 'device',
        };
        setUserAddress(newAddress);
        await AsyncStorage.setItem('userAddress', JSON.stringify(newAddress)); // Persist userAddress
        hasFetchedAddress.current = true;
      }
    } catch (error) {
      SendErrorTotheServer(error, 'fetchAddressFromCoords');
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
          `https://api.geoapify.com/v1/geocode/reverse?lat=${address.latitude}&lon=${address.longitude}&apiKey=25127ca1c55f48909b03f43048040037`
        );
        const reverseJson = await reverseResponse.json();
        const reverseAddress = reverseJson.features?.[0]?.properties || {};
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
        setUserAddress(newAddress);
        await AsyncStorage.setItem('userAddress', JSON.stringify(newAddress)); // Persist userAddress
      } else {
        setUserAddress(address);
        await AsyncStorage.setItem('userAddress', JSON.stringify(address)); // Persist userAddress
      }
      hasFetchedAddress.current = true;
    } catch (error) {
      SendErrorTotheServer(error, 'fetchAddressFromIP');
    }
  };

  const init = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userDataStored = await AsyncStorage.getItem('UserData');
      const userAddressStored = await AsyncStorage.getItem('userAddress');
      const locationPermission = await AsyncStorage.getItem('locationPermission');

      if (token) setIsAuthenticated(true);
      if (userDataStored) setUserData(JSON.parse(userDataStored));
      if (userAddressStored) {
        setUserAddress(JSON.parse(userAddressStored));
        hasFetchedAddress.current = true;
      }
      // Only request permission if it hasn't been set
      if (isConnected && !hasFetchedAddress.current && !locationPermission) {
        const granted = await requestLocationPermission();
        if (granted) {
          Geolocation.getCurrentPosition(
            pos => fetchAddressFromCoords(pos.coords.latitude, pos.coords.longitude),
            err => {
              fetchAddressFromIP();
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000, forceRequestLocation: true }
          );
        } else {
          fetchAddressFromIP();
        }
      } else if (isConnected && !hasFetchedAddress.current && locationPermission === 'granted') {
        Geolocation.getCurrentPosition(
          pos => fetchAddressFromCoords(pos.coords.latitude, pos.coords.longitude),
          err => {
            fetchAddressFromIP();
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000, forceRequestLocation: true }
        );
      } else if (isConnected && !hasFetchedAddress.current) {
        fetchAddressFromIP();
      }

      setTimeout(() => setIsLoading(false), 3000);
    } catch (e) {
      SendErrorTotheServer(e, 'init');
      setIsLoading(false);
    }
  }, [isConnected, isAuthenticated]);

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    if (isConnected && !hasFetchedAddress.current) {
      init(); // Retry location if previously skipped
    }
  }, [isConnected, init]);


  // Function to check subscription status
  const checkSubscription = useCallback(async () => {
    try {
      if (!userData?.userid) return;
      const postData = {
        userID: userData.userid,
        DataType: 'Status',
      };

      const response = await Apiclient.post('/checkSubscription', postData);
      if (response.status === 200) {
        setSubscriptionStatus(response.data);
      }
    } catch (error) {
      SendErrorTotheServer(error, 'checkSubscription');
      setSubscriptionStatus({ success: false, message: 'Subscription check failed' });
    }
  }, [userData?.userid, setSubscriptionStatus]);



  useEffect(() => {
    if (isAuthenticated && userData?.userid) {
      fetchProfileDetails();
      checkSubscription();
    }
  }, [isAuthenticated, userData?.userid, fetchProfileDetails, checkSubscription]);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isInternetReachable === true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const onBackPress = () => {
      if (currentRouteName === 'Main' || currentRouteName === 'Profile' || currentRouteName === 'Stats' || currentRouteName === 'Messages' || currentRouteName === 'WalletDashboard') {
        Alert.alert(
          'Exit Ziggsta',
          'Do you want to close Ziggsta?',
          [
            { text: 'No', onPress: () => null, style: 'cancel' },
            { text: 'Yes', onPress: () => BackHandler.exitApp() },
          ],
          { cancelable: false }
        );
        return true; // prevent default back action
      }
      return false; // allow default back behavior
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

    return () => subscription.remove();
  }, [currentRouteName]);

  useEffect(() => {
    LogBox.ignoreLogs([
      'new NativeEventEmitter', // your existing ignore
      'useInsertionEffect must not schedule updates', // 👈 add this line
    ]);
  }, []);



  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <NavigationContainer ref={navigationRef} onReady={() => {
          setIsNavigationReady(true);
          setCurrentRouteName(navigationRef.current.getCurrentRoute()?.name);
        }}
          onStateChange={async () => {
            if (isNavigationReady && navigationRef.current) {
              const currentRoute = navigationRef.current.getCurrentRoute();
              setCurrentRouteName(currentRoute?.name);
            }
          }}>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            {!isConnected && <Stack.Screen name="NetworkCheck" component={NetworkCheck} />}
            {!isAuthenticated && <Stack.Screen name="Splash" component={SplashScreen} />}
            {isAuthenticated ? (
              <>
                <Stack.Screen name="MainTabs">
                  {(props) => (
                    <BottomTabNavigator
                      {...props}
                      onLogout={handleLogout}
                      userData={userData}
                      userAddress={userAddress}
                    />
                  )}
                </Stack.Screen>
                <Stack.Screen name="TermsOfUse">
                  {(props) => (
                    <TermsOfUseScreen
                      {...props}
                      userData={userData}
                    />
                  )}
                </Stack.Screen>
                <Stack.Screen name="ChatScreen"
                  options={{
                    windowSoftInputMode: "adjustResize",
                  }}>
                  {(props) => (
                    <ChatScreen
                      {...props}
                      userData={userData}
                    />
                  )}
                </Stack.Screen>
              </>
            ) : (
              <Stack.Screen name="Auth">
                {props => (
                  <AuthScreen
                    {...props}
                    onLogin={handleLogin}
                  />
                )}
              </Stack.Screen>
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>

    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    marginTop: 10,
    fontSize: 16,
  },
});

export default App;
