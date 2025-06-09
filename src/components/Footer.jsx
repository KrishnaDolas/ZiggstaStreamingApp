import { Text, TouchableOpacity, View } from 'react-native';
import React, { useContext, useState } from 'react';
import { styles, themeStyles } from '../../assets/styles/ThemeStyles';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { ThemeContext } from '../context/ThemeContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

const Footer = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('Home');

  const iconColor = (tabName) => (activeTab === tabName ? '#d93a63' : 'grey');

  return (
    <View style={[styles.footer, themeStyles[theme].footer]}>

      <TouchableOpacity
        style={styles.footerItem}
        onPress={() => {
          setActiveTab('Home');
          navigation.navigate('Main');
        }}
      >
        <Ionicons name="home-outline" size={25} color={iconColor('Home')} />
        <Text style={[styles.footerText, { color: iconColor('Home') }]}>Home</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.footerItem}
        onPress={() => {
          setActiveTab('Profile');
          navigation.navigate('Profile');
        }}
      >
        <FontAwesome name="user-o" size={25} color={iconColor('Profile')} />
        <Text style={[styles.footerText, { color: iconColor('Profile') }]}>Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.footerItem}
        onPress={() => {
          setActiveTab('Live');
          console.log('Live');
        }}
      >
        <Ionicons name="play-outline" size={25} color={iconColor('Live')} />
        <Text style={[styles.footerText, { color: iconColor('Live') }]}>Live</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.footerItem}
        onPress={() => {
          setActiveTab('Messages');
          navigation.navigate('Messages');
        }}
      >
        <Ionicons name="chatbubbles-outline" size={25} color={iconColor('Messages')} />
        <Text style={[styles.footerText, { color: iconColor('Messages') }]}>Messages</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.footerItem}
        onPress={() => {
          setActiveTab('Settings');
          console.log('Settings');
        }}
      >
        <Ionicons name="settings-outline" size={25} color={iconColor('Settings')} />
        <Text style={[styles.footerText, { color: iconColor('Settings') }]}>Settings</Text>
      </TouchableOpacity>

    </View>
  );
};

export default Footer;
