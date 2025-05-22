import { Text, TouchableOpacity, View } from 'react-native';
import React, { useContext } from 'react';
import { styles, themeStyles } from '../../assets/styles/ThemeStyles';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { ThemeContext } from '../context/ThemeContext';
import Ionicons from 'react-native-vector-icons/Ionicons';

const Footer = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  return (
    <View style={[styles.footer, themeStyles[theme].footer]}>
      <TouchableOpacity style={styles.footerItem} onPress={() => console.log('Home')}>
        <FontAwesome name="home" size={25} color="grey" />
        <Text style={[styles.footerText, themeStyles[theme].text]}>Home</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.footerItem} onPress={() => console.log('Profile')}>
        <FontAwesome name="user-o" size={25} color="grey" />
        <Text style={[styles.footerText, themeStyles[theme].text]}>Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.footerItem} onPress={() => console.log('Live')}>
        <Ionicons name="play-outline" size={25} color="grey" />
        <Text style={[styles.footerText, themeStyles[theme].text]}>Live</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.footerItem} onPress={() => console.log('Messages')}>
        <Ionicons name="chatbubbles-outline" size={25} color="grey" />
        <Text style={[styles.footerText, themeStyles[theme].text]}>Messages</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.footerItem} onPress={() => console.log('Settings')}>
        <Ionicons name="settings-outline" size={25} color="grey" />
        <Text style={[styles.footerText, themeStyles[theme].text]}>Settings</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Footer;
