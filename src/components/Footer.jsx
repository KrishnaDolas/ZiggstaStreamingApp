import { Text, TouchableOpacity, View } from 'react-native';
import React, { useContext } from 'react';
import { styles, themeStyles } from '../../assets/styles/ThemeStyles';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { ThemeContext } from '../context/ThemeContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Footer = () => {
  const insets = useSafeAreaInsets();
  const { theme } = useContext(ThemeContext);
  const navigation = useNavigation();
  const route = useRoute();

  // Automatically determine the active tab based on current route name
  const getActiveTab = () => {
    switch (route.name) {
      case 'Main':
        return 'Home';
      case 'Profile':
        return 'Profile';
      case 'Messages':
        return 'Messages';
      case 'Live':
        return 'Live';
      case 'WalletDashboard':
        return 'WalletDashboard';
      default:
        return '';
    }
  };

  // Get the active tab based on the current route
  const activeTab = getActiveTab();

  const iconColor = (tabName) => (activeTab === tabName ? '#d93a63' : 'grey');

  return (
    <View style={[styles.footer, themeStyles[theme].footer, { paddingBottom: insets.bottom }]}>
      <TouchableOpacity
        style={styles.footerItem}
        onPress={() => {
          if (route.name !== 'Main') {
            navigation.navigate('Main');
          }
        }}
      >
        <Ionicons name="home-outline" size={25} color={iconColor('Home')} />
        <Text style={[styles.footerText, { color: iconColor('Home') }]}>Home</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.footerItem}
        onPress={() => {
          if (route.name !== 'Profile') {
            navigation.navigate('Profile');
          }
        }}
      >
        <FontAwesome name="user-o" size={25} color={iconColor('Profile')} />
        <Text style={[styles.footerText, { color: iconColor('Profile') }]}>Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.footerItem}
        onPress={() => {
          if (route.name !== 'Live') {
            navigation.navigate('Live');
          }
        }}
      >
        <Ionicons name="play-outline" size={25} color={iconColor('Live')} />
        <Text style={[styles.footerText, { color: iconColor('Live') }]}>Live</Text>
      </TouchableOpacity>

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

      <TouchableOpacity
        style={styles.footerItem}
        onPress={() => {
          if (route.name !== 'WalletDashboard') {
            navigation.navigate('WalletDashboard');
          }
        }}
      >
        <Ionicons name="wallet-outline" size={25} color={iconColor('WalletDashboard')} />
        <Text style={[styles.footerText, { color: iconColor('WalletDashboard') }]}>Settings</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Footer;
