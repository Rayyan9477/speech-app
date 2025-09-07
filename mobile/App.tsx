import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, useTheme } from './src/lib/theme-provider';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from './shared/design-system';

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

// New Enhanced Screens
import SplashScreen from './src/screens/SplashScreen';
import WalkthroughScreen from './src/screens/WalkthroughScreen';
import MultiStepSignupScreen from './src/screens/MultiStepSignupScreen';
import SignupCompleteScreen from './src/screens/SignupCompleteScreen';
import TTSProjectCreationScreen from './src/screens/TTSProjectCreationScreen';
import EnhancedTTSEditorScreen from './src/screens/EnhancedTTSEditorScreen';
import VoiceManagementScreen from './src/screens/VoiceManagementScreen';
import EnhancedProjectManagementScreen from './src/screens/EnhancedProjectManagementScreen';
import ComprehensiveSettingsScreen from './src/screens/ComprehensiveSettingsScreen';
import AudioSharingScreen from './src/screens/AudioSharingScreen';
import AudioLibraryScreen from './src/screens/AudioLibraryScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator() {
  const { colors, isDark } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopWidth: 0,
          elevation: isDark ? 8 : 12,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: -2,
          },
          shadowOpacity: isDark ? 0.25 : 0.1,
          shadowRadius: 12,
          paddingBottom: Spacing[2],
          paddingTop: Spacing[2],
          height: 70,
          paddingHorizontal: Spacing[4],
        },
        tabBarActiveTintColor: Colors.primary[500],
        tabBarInactiveTintColor: colors.text.tertiary,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          marginTop: 2,
        },
        tabBarIconStyle: {
          marginTop: 2,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <MaterialIcons 
              name={focused ? "home" : "home"} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />
      <Tab.Screen
        name="My Voices"
        component={VoiceLibraryScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <MaterialIcons 
              name={focused ? "record-voice-over" : "record-voice-over"} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />
      <Tab.Screen
        name="My Projects"
        component={ProjectsScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <MaterialIcons 
              name={focused ? "work" : "work-outline"} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />
      <Tab.Screen
        name="Account"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <MaterialIcons 
              name={focused ? "person" : "person-outline"} 
              size={24} 
              color={color} 
            />
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
            initialRouteName="Splash"
            screenOptions={{
              headerShown: false,
            }}
          >
            {/* Enhanced Authentication Flow */}
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="Walkthrough" component={WalkthroughScreen} />
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
            <Stack.Screen name="MultiStepSignup" component={MultiStepSignupScreen} />
            <Stack.Screen name="SignupComplete" component={SignupCompleteScreen} />
            <Stack.Screen name="OTPVerification" component={OTPVerificationScreen} />
            
            {/* Enhanced TTS Workflow */}
            <Stack.Screen name="TTSProjectCreation" component={TTSProjectCreationScreen} />
            <Stack.Screen name="TTSEditor" component={EnhancedTTSEditorScreen} />
            
            {/* Audio Management */}
            <Stack.Screen name="AudioPlayer" component={AudioPlayerScreen} />
            <Stack.Screen name="AudioSharing" component={AudioSharingScreen} />
            <Stack.Screen name="AudioLibrary" component={AudioLibraryScreen} />
            
            {/* Enhanced Voice Management */}
            <Stack.Screen name="VoiceManagement" component={VoiceManagementScreen} />
            
            {/* Enhanced Project Management */}
            <Stack.Screen name="EnhancedProjects" component={EnhancedProjectManagementScreen} />
            
            {/* Comprehensive Settings */}
            <Stack.Screen name="ComprehensiveSettings" component={ComprehensiveSettingsScreen} />
            
            {/* Original Screens */}
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
