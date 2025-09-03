import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider } from './src/lib/theme-provider';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Screens
import WelcomeScreen from './src/screens/WelcomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import HomeScreen from './src/screens/HomeScreen';
import TTSScreen from './src/screens/TTSScreen';
import VoiceChangerScreen from './src/screens/VoiceChangerScreen';
import VoiceTranslateScreen from './src/screens/VoiceTranslateScreen';
import VoiceLibraryScreen from './src/screens/VoiceLibraryScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#e5e5e5',
          borderTopWidth: 1,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarActiveTintColor: '#5546FF',
        tabBarInactiveTintColor: '#9CA3AF',
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="TTS"
        component={TTSScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="volume-up" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Voice Changer"
        component={VoiceChangerScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="mic" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Translate"
        component={VoiceTranslateScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="translate" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Library"
        component={VoiceLibraryScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="library-music" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="settings" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Welcome"
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
            <Stack.Screen name="MainApp" component={TabNavigator} />
          </Stack.Navigator>
          <StatusBar style="auto" />
        </NavigationContainer>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
