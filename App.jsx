// App entry: sets up providers, navigation, auth/bootstrap logic, global modals.

import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  View,
  Text,
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import Geolocation from 'react-native-geolocation-service';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import SystemNavigationBar from 'react-native-system-navigation-bar';

// contexts and styles
import { ThemeContext } from './src/context/ThemeContext';
import { themeStyles } from './assets/styles/ThemeStyles';
import { useAppContext } from './src/context/AppContext';

// api client and constants
import Apiclient from './src/utils/Apiclient';
import { SendErrorTotheServer, socket } from './src/utils/constant';

// shared UI
import { ErrorBoundary } from './src/components/ErrorBoundary';
import NetworkCheck from './src/components/NetworkCheck';
import CameraActionSheet from './src/components/CameraActionSheet';

// screens
import { MainScreen } from './src/screens/MainScreen';
import { AuthScreen } from './src/screens/AuthScreen';
import { SplashScreen } from './src/screens/SplashScreen';
import { MessageListScreen } from './src/screens/MessageListScreen';
import { WalletDashboardScreen } from './src/screens/WalletDashboardScreen';
import { StatisticsSettingScreen } from './src/screens/StatisticsSettingScreen';
import TermsOfUseScreen from './src/screens/TermsOfUseScreen';
import { ChatScreen } from './src/screens/ChatScreen';
import SettingsProfile from './src/screens/SettingsProfile';
import AirwallexHPP from './src/screens/AirwallexHPP';

// modals
import ProfileScreenModal from './src/modals/ProfileScreenModal';
import AvatarPrevModal from './src/modals/AvatarPrevModal';
import ReportUserModal from './src/modals/ReportUserModal';
import { ProfileDescription } from './src/modals/ProfileDescription';

// navigators (moved into routes folder)
import {
  AppStackNavigator,
  BottomTabNavigator,
} from './src/routes';

// ----------------------
// Profile modal wrapper
// ----------------------
// This wraps ProfileScreenModal so it can access a navigation object from
// React Navigation hooks, while still being triggered as a modal from context.
// After – no useNavigation, no navigation prop
const ProfileModalWithNavigation = ({
  visible,
  onClose,
  profileData,
  isMainProfile,
  isProfileAvatarUpdate,
}) => {
  return (
    <ProfileScreenModal
      visible={visible}
      onClose={onClose}
      profileData={profileData}
      isMainProfile={isMainProfile}
      isProfileAvatarUpdate={isProfileAvatarUpdate}
    />
  );
};


// ----------------------
// Custom bottom tab bar
// ----------------------
// Replaces the default tab bar. It:
// - Hides itself when user is in a stream room.
// - Uses icons & labels from design.
// - Opens profile as a modal instead of a regular tab screen.
const CustomTabBar = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();
  const themeContext = useContext(ThemeContext);

console.log(
  '[THEME_CONTEXT]',
  themeContext
);

const theme = themeContext?.theme || 'dark';
  const {
    isInStreamRoom,
    userData,
    setModalVisibleStage,
    modalVisibleStage,
    modalStage,
    setModalStage,
    setShowAvatarPreview,
    setAvatarToPreview,
    setProfileUserData,
    profileUserData,
  } = useAppContext();

  const isDark = theme === 'dark';

  const iconColor = (isFocused) =>
    isFocused ? '#d93a63' : isDark ? '#fff' : 'grey';

  // When in live stream room, hide the entire tab bar area.
  if (isInStreamRoom) {
    return null;
  }

  // Local styles, kept here because colors depend on theme.
  const footerStyles = {
    footer: {
      position: 'absolute',
      bottom: insets.bottom,
      left: 0,
      right: 0,
      backgroundColor: isDark
        ? themeStyles.dark.footer?.backgroundColor || '#000'
        : 'white',
      paddingVertical: 10,
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      borderTopWidth: 1,
      borderTopColor: isDark
        ? themeStyles.dark.footer?.borderTopColor || '#333'
        : themeStyles.light.footer?.borderTopColor || '#e0e0e0',
      borderBottomWidth: 1,
      borderBottomColor: isDark
        ? themeStyles.dark.footer?.borderTopColor || '#333'
        : themeStyles.light.footer?.borderTopColor || '#e0e0e0',
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
        return (
          <Ionicons
            name="chatbox-ellipses-outline"
            size={size}
            color={color}
          />
        );
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
      {/* Custom bottom footer with icons & labels */}
      <View style={footerStyles.footer}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = getTabLabel(route.name);
          const isFocused = state.index === index;

          const onPress = () => {
            // Special handling: Profile tab opens the profile modal instead of tab screen
            if (route.name === 'Profile') {
              setModalVisibleStage('profile-screen-modal');
              setModalStage('first');
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
              <Text
                style={[
                  footerStyles.footerText,
                  { color: iconColor(isFocused) },
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Profile-related modals triggered by tab / context */}
      <>
        {/* Main profile modal (current user) */}
        {modalVisibleStage === 'profile-screen-modal' &&
          modalStage === 'first' && (
            <ProfileModalWithNavigation
              visible={modalVisibleStage === 'profile-screen-modal'}
              onClose={() => {
                setModalVisibleStage(null);
                setShowAvatarPreview(false);
                setAvatarToPreview(null);
                setModalStage('first');
              }}
              profileData={userData}
              isMainProfile={true}
              isProfileAvatarUpdate={true}
            />
          )}

        {/* Friend profile modal */}
        {modalVisibleStage === 'friend-profile-modal' &&
          modalStage === 'second' && (
            <ProfileModalWithNavigation
              visible={modalVisibleStage === 'friend-profile-modal'}
              onClose={() => {
                setModalVisibleStage(null);
                setModalStage('first');
                setProfileUserData({});
              }}
              profileData={profileUserData}
            />
          )}
      </>
    </>
  );
};

// ----------------------
// Main App component
// ----------------------
// Handles:
// - Theme + system nav bar color
// - Auth state + async bootstrap
// - Location + IP address resolution
// - Subscription/profile bootstrapping
// - Global modals & hardware back button
const App = () => {
  console.log('[APP STARTED]');

useEffect(() => {

  const originalError =
    console.error;

  console.error = (
    ...args
  ) => {

    originalError(...args);

    try {

      socket.emit(
        'client_promise_error',
        {
          args: JSON.stringify(args),
          timestamp: Date.now(),
        }
      );

    } catch (e) {}

  };

  return () => {

    console.error =
      originalError;

  };

}, []);

useEffect(() => {

  const previousHandler =
    ErrorUtils.getGlobalHandler();

  ErrorUtils.setGlobalHandler(
    (
      error,
      isFatal
    ) => {

      try {

        socket.emit(
          'client_crash',
          {
            message:
              error?.message,
            stack:
              error?.stack,
            isFatal,
            timestamp:
              Date.now(),
          }
        );

      } catch (e) {}

      previousHandler(
        error,
        isFatal
      );

    }
  );

}, []);
  
  const themeContext = useContext(ThemeContext);
const theme = themeContext?.theme || 'dark';

  // Auth / startup flags
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Network & navigation
  const [isConnected, setIsConnected] = useState(true);
  const navigationRef = useRef();
  const [currentRouteName, setCurrentRouteName] = useState(null);
  const [isNavigationReady, setIsNavigationReady] = useState(false);

  // Global app context
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
    modalStage,
    modalVisibleStage,
    setShowAvatarPreview,
    userProfileDetails,
    isMainProfileOpened,
    setAvatarToPreview,
    setProfileUserId,
    profileUserData,
    setProfileUserData,
    setProfileDescription,
  } = useAppContext();

  // Used as a guard to avoid refetching location repeatedly
  const hasFetchedAddress = useRef(false);

  const handleLogin = () => setIsAuthenticated(true);

  // Update Android system nav bar color to match theme
  useEffect(() => {
    if (theme === 'dark') {
      SystemNavigationBar.setNavigationColor('#000000', 'light', 'navigation');
    } else {
      SystemNavigationBar.setNavigationColor('#ffffff', 'dark', 'navigation');
    }
  }, [theme]);

  // Clear auth/session state and close socket
  const handleLogout = async () => {
    try {
      // Only remove app-specific keys; preserve theme, etc.
      await AsyncStorage.multiRemove([
        'token',
        'UserData',
        'locationTrackingEnabled',
        'onlyProfileVerified',
        'allowNotification',
        'distanceRange',
        'userAddress',
        'locationPermission',
      ]);

      setModalStage('first');
      setModalLabelName(null);
      setModalVisibleStage(null);
      setUserAddress(null);
      setUserData(null);
      setProfileData(null);
      setIpAddress('');
      setIsAuthenticated(false);
      hasFetchedAddress.current = false;
      socket.disconnect();
    } catch (error) {
      SendErrorTotheServer(error, 'handleLogout');
    }
  };

  // Request OS-level location permission and persist the result
  const requestLocationPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission Required',
            message:
              'This app requires access to your location to provide personalized services.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        const isGranted = granted === PermissionsAndroid.RESULTS.GRANTED;
        await AsyncStorage.setItem(
          'locationPermission',
          isGranted ? 'granted' : 'denied',
        );
        return isGranted;
      } else {
        const auth = await Geolocation.requestAuthorization('whenInUse');
        const isGranted = auth === 'granted';
        await AsyncStorage.setItem(
          'locationPermission',
          isGranted ? 'granted' : 'denied',
        );
        return isGranted;
      }
    } catch (error) {
      SendErrorTotheServer(error, 'requestLocationPermission');
      await AsyncStorage.setItem('locationPermission', 'denied');
      return false;
    }
  };

  // Use device GPS coordinates to fetch a full address and store it
  const fetchAddressFromCoords = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&apiKey=25127ca1c55f48909b03f43048040037`,
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
        await AsyncStorage.setItem('userAddress', JSON.stringify(newAddress));
        hasFetchedAddress.current = true;
      }
    } catch (error) {
      SendErrorTotheServer(error, 'fetchAddressFromCoords');
    }
  };

  // Fallback when device location is not available:
  // derive approximate address from IP + optional reverse geocode for postcode.
  const fetchAddressFromIP = async () => {
    try {
      const ipRes = await fetch('https://api64.ipify.org?format=json');
      const ipData = await ipRes.json();
      const ip = ipData.ip;
      setIpAddress(ip);

      const response = await fetch(
        `https://api.geoapify.com/v1/ipinfo?apiKey=25127ca1c55f48909b03f43048040037`,
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

      // If postcode missing but have coordinates, do reverse geocode for better accuracy
      if (!address.postcode && address.latitude && address.longitude) {
        const reverseResponse = await fetch(
          `https://api.geoapify.com/v1/geocode/reverse?lat=${address.latitude}&lon=${address.longitude}&apiKey=25127ca1c55f48909b03f43048040037`,
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
        await AsyncStorage.setItem('userAddress', JSON.stringify(newAddress));
      } else {
        setUserAddress(address);
        await AsyncStorage.setItem('userAddress', JSON.stringify(address));
      }

      hasFetchedAddress.current = true;
    } catch (error) {
      SendErrorTotheServer(error, 'fetchAddressFromIP');
    }
  };

  // Initial bootstrap:
  // - Reads token/userData from AsyncStorage
  // - Restores address if available, otherwise resolves via location/IP
  // - Starts splash timer
  const init = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userDataStored = await AsyncStorage.getItem('UserData');
      const userAddressStored = await AsyncStorage.getItem('userAddress');
      const locationPermission = await AsyncStorage.getItem(
        'locationPermission',
      );

      if (token) setIsAuthenticated(true);
      if (userDataStored) setUserData(JSON.parse(userDataStored));

      if (userAddressStored) {
        setUserAddress(JSON.parse(userAddressStored));
        hasFetchedAddress.current = true;
      }

      // If we are online and have no cached address, resolve it.
      if (isConnected && !hasFetchedAddress.current && !locationPermission) {
        // First time: ask for location permission
        const granted = await requestLocationPermission();
        if (granted) {
          Geolocation.getCurrentPosition(
            (pos) =>
              fetchAddressFromCoords(
                pos.coords.latitude,
                pos.coords.longitude,
              ),
            () => {
              fetchAddressFromIP();
            },
            {
              enableHighAccuracy: true,
              timeout: 15000,
              maximumAge: 10000,
              forceRequestLocation: true,
            },
          );
        } else {
          fetchAddressFromIP();
        }
      } else if (
        isConnected &&
        !hasFetchedAddress.current &&
        locationPermission === 'granted'
      ) {
        // Permission already granted earlier, directly try device location
        Geolocation.getCurrentPosition(
          (pos) =>
            fetchAddressFromCoords(pos.coords.latitude, pos.coords.longitude),
          () => {
            fetchAddressFromIP();
          },
          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 10000,
            forceRequestLocation: true,
          },
        );
      } else if (isConnected && !hasFetchedAddress.current) {
        // Permission was denied, fallback to IP-based location
        fetchAddressFromIP();
      }

      // Artificial splash timeout
      setTimeout(() => setIsLoading(false), 3000);
    } catch (e) {
      SendErrorTotheServer(e, 'init');
      setIsLoading(false);
    }
  }, [isConnected, setUserAddress, setUserData]);

  useEffect(() => {
    init();
  }, [init]);

  // If network comes back and location was not resolved, retry bootstrap
  useEffect(() => {
    if (isConnected && !hasFetchedAddress.current) {
      init(); 
    }
  }, [isConnected, init]);

  // Subscription status fetch for logged-in user
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
      setSubscriptionStatus({
        success: false,
        message: 'Subscription check failed',
      });
    }
  }, [userData?.userid, setSubscriptionStatus]);

  // When logged in + have userid:
  // - Fetch profile details
  // - Check subscription status
useEffect(() => {
  console.log('USER DATA:', userData);
  console.log('USER ID:', userData?.userid);
console.log('USER DATA FULL:', JSON.stringify(userData, null, 2));
  if (userData?.userid) {
    console.log('FETCH PROFILE NOW');

    fetchProfileDetails();
    checkSubscription();
  }
}, [userData?.userid]);

  // Network connectivity listeners
  useEffect(() => {
    // Initial state
    NetInfo.fetch().then((state) => {
      setIsConnected(state.isConnected);
    });

    // Subscribe to changes
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    console.log('is app connected', isConnected);
  }, [isConnected]);

  // Android hardware back button behavior:
  // When on any main tab screen, show "Exit app?" alert instead of going back.
  useEffect(() => {
    const onBackPress = () => {
      if (
        currentRouteName === 'Main' ||
        currentRouteName === 'Profile' ||
        currentRouteName === 'Stats' ||
        currentRouteName === 'Messages' ||
        currentRouteName === 'WalletDashboard'
      ) {
        Alert.alert(
          'Exit Ziggsta',
          'Do you want to close Ziggsta?',
          [
            { text: 'No', onPress: () => null, style: 'cancel' },
            { text: 'Yes', onPress: () => BackHandler.exitApp() },
          ],
          { cancelable: false },
        );
        return true;
      }
      return false;
    };

    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      onBackPress,
    );

    return () => subscription.remove();
  }, [currentRouteName]);

  // Ignore noisy React Native warnings that are already known
  useEffect(() => {
    LogBox.ignoreLogs([
      'new NativeEventEmitter',
      'useInsertionEffect must not schedule updates',
    ]);
  }, []);
  console.log('[APP RENDER]');

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <NavigationContainer
          ref={navigationRef}
          onReady={() => {
            setIsNavigationReady(true);
            setCurrentRouteName(navigationRef.current.getCurrentRoute()?.name);
          }}
          onStateChange={() => {
            if (isNavigationReady && navigationRef.current) {
              const currentRoute = navigationRef.current.getCurrentRoute();
              setCurrentRouteName(currentRoute?.name);
            }
          }}
        >
          {/* Main app stack, split into routes file for clarity */}
          <AppStackNavigator
            isConnected={isConnected}
            isAuthenticated={isAuthenticated}
            isLoading={isLoading}
            handleLogin={handleLogin}
            handleLogout={handleLogout}
            userData={userData}
            userAddress={userAddress}
            CustomTabBar={CustomTabBar}
            
          />
        </NavigationContainer>

        {/* -------- Global modals that float above navigation -------- */}

        {/* Avatar preview modal (profile picture preview/update) */}
        {modalVisibleStage === 'profile-avatar-prv' &&
          modalStage === 'second' && (
            <AvatarPrevModal
              visible={modalVisibleStage === 'profile-avatar-prv'}
              onClose={() => {
                setShowAvatarPreview(false);
                setModalVisibleStage(
                  isMainProfileOpened ? 'profile-screen-modal' : 'profile-modal',
                );
                setModalStage('first');
                setAvatarToPreview(null);
                setProfileUserData({});
              }}
            />
          )}

        {/* Profile description modal (edit profile bio) */}
        {modalVisibleStage === 'profile-description' &&
          modalStage === 'second' && (
            <ProfileDescription
              visible={modalVisibleStage === 'profile-description'}
              onClose={() => {
                setModalVisibleStage(
                  isMainProfileOpened ? 'profile-screen-modal' : 'profile-modal',
                );
                setModalStage('first');
                setProfileUserData({});
                setProfileUserId(null);
              }}
            />
          )}

        {/* User report modal (report a user or content) */}
        {modalVisibleStage === 'report-user' && modalStage === 'second' && (
          <ReportUserModal
            visible={modalVisibleStage === 'report-user'}
            onClose={() => {
              setModalVisibleStage(null);
              setModalStage('first');
              setProfileUserData({});
            }}
            reportData={userProfileDetails}
            reportType="User"
          />
        )}

        {/* Camera action sheet for profile image update */}
        {modalVisibleStage === 'camera-action-sheet' &&
          modalStage === 'second' && (
            <CameraActionSheet
              visible={modalVisibleStage === 'camera-action-sheet'}
              onClose={() => {
                setModalVisibleStage('profile-screen-modal');
                setModalStage('first');
                setProfileUserId(null);
              }}
              title="Update Profile Picture"
              options={['Take Photo', 'Choose from Gallery', 'Cancel']}
              theme={theme}
            />
          )}
      </SafeAreaProvider>
    </ErrorBoundary>
  );
};

export default App;
