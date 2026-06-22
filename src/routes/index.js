// Central place for navigation definitions:
// - Root stack
// - Bottom tab navigator used by authenticated area

import React from 'react';
import { View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// screens
import NetworkCheck from '../components/NetworkCheck';
import { SplashScreen } from '../screens/SplashScreen';
import { AuthScreen } from '../screens/AuthScreen';
import { MainScreen } from '../screens/MainScreen';
import { MessageListScreen } from '../screens/MessageListScreen';
import { WalletDashboardScreen } from '../screens/WalletDashboardScreen';
import { StatisticsSettingScreen } from '../screens/StatisticsSettingScreen';
import TermsOfUseScreen from '../screens/TermsOfUseScreen';
import SettingsProfile from '../screens/SettingsProfile';
import { ChatScreen } from '../screens/ChatScreen';
import AirwallexHPP from '../screens/AirwallexHPP';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();


// ----------------------
// Bottom tab navigator
// ----------------------
export const BottomTabNavigator = ({
  onLogout,
  userData,
  userAddress,
  tabBar: TabBarComponent,
}) => {

  console.log(
    '[BOTTOM_TAB_RENDER]',
    typeof TabBarComponent
  );

  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        tabBar={
          TabBarComponent
            ? (props) => <TabBarComponent {...props} />
            : undefined
        }
        screenOptions={{
          headerShown: false,
        }}
        initialRouteName="Main"
      >
        <Tab.Screen
          name="Profile"
          component={View}
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


// ----------------------
// Root stack navigator
// ----------------------
export const AppStackNavigator = ({
  isConnected,
  isAuthenticated,
  isLoading,
  handleLogin,
  handleLogout,
  userData,
  userAddress,
  CustomTabBar,
}) => {

  console.log('[APP_STACK_RENDER]', {
    isConnected,
    isAuthenticated,
    isLoading,
  });

  // ====================================
  // OFFLINE
  // ====================================

  if (!isConnected) {

    return (
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen
          name="NetworkCheck"
          component={NetworkCheck}
        />
      </Stack.Navigator>
    );
  }

  // ====================================
  // SPLASH
  // ====================================

  if (isLoading) {

    return (
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
        />
      </Stack.Navigator>
    );
  }

  // ====================================
  // AUTH FLOW
  // ====================================

  if (!isAuthenticated) {

    return (
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Auth">
          {(props) => (
            <AuthScreen
              {...props}
              onLogin={handleLogin}
            />
          )}
        </Stack.Screen>
      </Stack.Navigator>
    );
  }

  // ====================================
  // AUTHENTICATED FLOW
  // ====================================

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="MainTabs">
        {(props) => (
          <BottomTabNavigator
            {...props}
            onLogout={handleLogout}
            userData={userData}
            userAddress={userAddress}
            tabBar={CustomTabBar}
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

      <Stack.Screen name="SettingsProfile">
        {(props) => (
          <SettingsProfile
            {...props}
            onLogout={handleLogout}
            userData={userData}
          />
        )}
      </Stack.Screen>

      <Stack.Screen name="AirwallexHPP">
        {(props) => (
          <AirwallexHPP {...props} />
        )}
      </Stack.Screen>

      <Stack.Screen
        name="ChatScreen"
        options={{
          windowSoftInputMode: 'adjustResize',
        }}
      >
        {(props) => (
          <ChatScreen
            {...props}
            userData={userData}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
};