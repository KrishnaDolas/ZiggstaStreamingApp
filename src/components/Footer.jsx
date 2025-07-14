import { Image, Text, TouchableOpacity, View } from 'react-native';
import React, { useContext, useState } from 'react';
import { styles, themeStyles } from '../../assets/styles/ThemeStyles';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { ThemeContext } from '../context/ThemeContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ProfileScreenModal from '../modals/ProfileScreenModal';
import { useAppContext } from '../context/AppContext';


const Footer = () => {
  const insets = useSafeAreaInsets();
  const { theme } = useContext(ThemeContext);
  const navigation = useNavigation();
  const route = useRoute();
  const [visibleModal, setVisibleModal] = useState(null);
  const { userData } = useAppContext();
  // Automatically determine the active tab based on current route name
  const getActiveTab = () => {
    switch (route.name) {
      case 'Main':
        return 'Main';
      case 'Profile':
        return 'Profile';
      case 'Messages':
        return 'Messages';
      case 'Stats':
        return 'Stats';
      case 'WalletDashboard':
        return 'WalletDashboard';
      default:
        return '';
    }
  };

  // Get the active tab based on the current route
  const activeTab = getActiveTab();
  const isDark = theme === 'dark';

  const iconColor = (tabName) => {
    if (activeTab === tabName) return '#d93a63'; // active = pink
    return isDark ? '#fff' : 'grey';             // inactive = white (dark) or grey (light)
  };

  return (
    <>
      <View style={[styles.footer, themeStyles[theme].footer, { paddingBottom: insets.bottom }]}>

        {/* Profile */}
        <TouchableOpacity
          style={[styles.footerItem, themeStyles[theme].footerItem]}
          // onPress={() => {
          //   if (route.name !== 'Profile') {
          //     navigation.navigate('Profile');
          //   }
          // }}
          onPress={() => setVisibleModal('profile-screen-modal')}
        >
          <FontAwesome name="user-o" size={25} color={iconColor('Profile')} />
          <Text style={[styles.footerText, { color: iconColor('Profile') }]}>Profile</Text>
        </TouchableOpacity>
        {/* Setting */}
        <TouchableOpacity
          style={styles.footerItem}
          onPress={() => {
            if (route.name !== 'Stats') {
              navigation.navigate('Stats');
            }
          }}
        >
          <Ionicons name="stats-chart" size={25} color={iconColor('Stats')} />
          <Text style={[styles.footerText, { color: iconColor('Stats') }]}>Stats</Text>
        </TouchableOpacity>
        {/* home */}
        <TouchableOpacity
          style={styles.footerItem}
          onPress={() => {
            if (route.name !== 'Home') {
              navigation.navigate('Main');
            }
          }}
        >
          {/* <Ionicons name="home-outline" size={25} color={iconColor('Main')} /> */}
          <Image
            source={require('../../assets/images/logo-icon.png')}
            resizeMode="contain"
            style={{
              width: 30,
              height: 30,
              tintColor:
                activeTab === 'Main'
                  ? '#d93a63' // active tab = pink
                  : isDark
                    ? '#fff'    // inactive + dark theme = white
                    : '#999',   // inactive + light theme = gray
            }}
          />
          <Text style={[styles.footerText, { color: iconColor('Main') }]}>Home</Text>
        </TouchableOpacity>
        {/* message */}
        <TouchableOpacity
          style={styles.footerItem}
          onPress={() => {
            if (route.name !== 'Messages') {
              navigation.navigate('Messages');
            }
          }}
        >
          <Ionicons name="chatbox-ellipses-outline" size={25} color={iconColor('Messages')} />
          <Text style={[styles.footerText, { color: iconColor('Messages') }]}>Messages</Text>
        </TouchableOpacity>
        {/* wallet */}
        <TouchableOpacity
          style={styles.footerItem}
          onPress={() => {
            if (route.name !== 'WalletDashboard') {
              navigation.navigate('WalletDashboard');
            }
          }}
        >
          <Ionicons name="wallet-outline" size={25} color={iconColor('WalletDashboard')} />
          <Text style={[styles.footerText, { color: iconColor('WalletDashboard') }]}>Wallet</Text>
        </TouchableOpacity>
      </View>
      {/* Bottom Modal */}
      {visibleModal === 'profile-screen-modal' && (
        <ProfileScreenModal visible="true" onClose={() => setVisibleModal(null)} profileData={userData} />
      )}

    </>
  );
};

export default Footer;
