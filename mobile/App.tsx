import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider } from './src/lib/theme-provider';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

// Screens
import WelcomeScreen from './src/screens/WelcomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import OTPVerificationScreen from './src/screens/OTPVerificationScreen';
import HomeScreen from './src/screens/HomeScreen';
import TTSScreen from './src/screens/TTSScreen';
import VoiceChangerScreen from './src/screens/VoiceChangerScreen';
import VoiceTranslateScreen from './src/screens/VoiceTranslateScreen';
import VoiceLibraryScreen from './src/screens/VoiceLibraryScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import ProjectsScreen from './src/screens/ProjectsScreen';
import CreateProjectScreen from './src/screens/CreateProjectScreen';
import ProjectDetailScreen from './src/screens/projects/ProjectDetailScreen';
import ProjectSearchScreen from './src/screens/search/ProjectSearchScreen';
import VoiceSearchScreen from './src/screens/search/VoiceSearchScreen';
import VoiceCloningUploadScreen from './src/screens/voice-cloning/VoiceCloningUploadScreen';
import VoiceCloningRecordScreen from './src/screens/voice-cloning/VoiceCloningRecordScreen';
import VoiceCloningProcessingScreen from './src/screens/voice-cloning/VoiceCloningProcessingScreen';
import VoiceCloningIdentityScreen from './src/screens/voice-cloning/VoiceCloningIdentityScreen';
import AudioPlayerScreen from './src/screens/AudioPlayerScreen';
import HelpScreen from './src/screens/help/HelpScreen';
import FAQScreen from './src/screens/help/FAQScreen';
import UpgradePlanScreen from './src/screens/billing/UpgradePlanScreen';
import ReviewSummaryScreen from './src/screens/billing/ReviewSummaryScreen';
import SelectPaymentMethodScreen from './src/screens/billing/SelectPaymentMethodScreen';
import ProcessingPaymentScreen from './src/screens/billing/ProcessingPaymentScreen';
import UpgradeSuccessfulScreen from './src/screens/billing/UpgradeSuccessfulScreen';
import UserManagementScreen from './src/screens/user-management/UserManagementScreen';
import InviteTeammateScreen from './src/screens/user-management/InviteTeammateScreen';
import InviteSentScreen from './src/screens/user-management/InviteSentScreen';
import RemoveTeammateConfirmationScreen from './src/screens/user-management/RemoveTeammateConfirmationScreen';
import RemoveTeammateSuccessScreen from './src/screens/user-management/RemoveTeammateSuccessScreen';
import NotificationScreen from './src/screens/NotificationScreen';

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
        name="Projects"
        component={ProjectsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="work" size={size} color={color} />
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
            <Stack.Screen name="OTPVerification" component={OTPVerificationScreen} />
            <Stack.Screen name="Projects" component={ProjectsScreen} />
            <Stack.Screen name="CreateProject" component={CreateProjectScreen} />
            <Stack.Screen name="ProjectDetail" component={ProjectDetailScreen} />
            <Stack.Screen name="EditProject" component={CreateProjectScreen} />
            <Stack.Screen name="ProjectSearch" component={ProjectSearchScreen} />
            <Stack.Screen name="VoiceSearch" component={VoiceSearchScreen} />
            <Stack.Screen name="VoiceCloningUpload" component={VoiceCloningUploadScreen} />
            <Stack.Screen name="VoiceCloningRecord" component={VoiceCloningRecordScreen} />
            <Stack.Screen name="VoiceCloningProcessing" component={VoiceCloningProcessingScreen} />
            <Stack.Screen name="VoiceCloningIdentity" component={VoiceCloningIdentityScreen} />
            <Stack.Screen name="AudioPlayer" component={AudioPlayerScreen} />
            <Stack.Screen name="Help" component={HelpScreen} />
            <Stack.Screen name="FAQ" component={FAQScreen} />
            <Stack.Screen name="ContactSupport" component={HelpScreen} />
            <Stack.Screen name="PrivacyPolicy" component={HelpScreen} />
            <Stack.Screen name="TermsOfService" component={HelpScreen} />
            <Stack.Screen name="UpgradePlan" component={UpgradePlanScreen} />
            <Stack.Screen name="ReviewSummary" component={ReviewSummaryScreen} />
            <Stack.Screen name="SelectPaymentMethod" component={SelectPaymentMethodScreen} />
            <Stack.Screen name="ProcessingPayment" component={ProcessingPaymentScreen} />
            <Stack.Screen name="UpgradeSuccessful" component={UpgradeSuccessfulScreen} />
            <Stack.Screen name="UserManagement" component={UserManagementScreen} />
            <Stack.Screen name="InviteTeammate" component={InviteTeammateScreen} />
            <Stack.Screen name="InviteSent" component={InviteSentScreen} />
            <Stack.Screen name="RemoveTeammateConfirmation" component={RemoveTeammateConfirmationScreen} />
            <Stack.Screen name="RemoveTeammateSuccess" component={RemoveTeammateSuccessScreen} />
            <Stack.Screen name="NotificationSettings" component={NotificationScreen} />
            <Stack.Screen name="MainApp" component={TabNavigator} />
          </Stack.Navigator>
          <StatusBar style="auto" />
        </NavigationContainer>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
