import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

export type RootStackParamList = {
  // Auth Flow
  Splash: undefined;
  Walkthrough: undefined;
  Welcome: undefined;
  Login: undefined;
  ForgotPassword: undefined;
  Signup: undefined;
  MultiStepSignup: undefined;
  SignupComplete: undefined;
  OTPVerification: { email: string };

  // Main App
  MainApp: undefined;

  // TTS Flow
  TTSProjectCreation: undefined;
  TTSEditor: { projectId?: string };

  // Audio Management
  AudioPlayer: { audioUrl: string; title?: string };
  AudioSharing: { audioUrl: string; title?: string };
  AudioLibrary: undefined;

  // Voice Management
  VoiceManagement: undefined;

  // Project Management
  EnhancedProjects: undefined;
  ProjectDetail: { projectId: string };
  CreateProject: undefined;
  EditProject: { projectId: string };
  ProjectSearch: undefined;

  // Voice Search and Cloning
  VoiceSearch: undefined;
  VoiceCloningUpload: undefined;
  VoiceCloningRecord: undefined;
  VoiceCloningProcessing: { voiceData: any };
  VoiceCloningIdentity: { voiceId: string };

  // Settings and Help
  ComprehensiveSettings: undefined;
  Help: undefined;
  FAQ: undefined;
  ContactSupport: undefined;
  PrivacyPolicy: undefined;
  TermsOfService: undefined;

  // Billing
  UpgradePlan: undefined;
  ReviewSummary: { planId: string };
  SelectPaymentMethod: { planId: string };
  ProcessingPayment: { paymentData: any };
  UpgradeSuccessful: { planName: string };

  // User Management
  UserManagement: undefined;
  InviteTeammate: undefined;
  InviteSent: { email: string };
  RemoveTeammateConfirmation: { teammateId: string };
  RemoveTeammateSuccess: { teammateName: string };

  // Notifications
  NotificationSettings: undefined;
};

export type TabParamList = {
  Home: undefined;
  'My Voices': undefined;
  'My Projects': undefined;
  Account: undefined;
};

export type RootStackScreenProps<Screen extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, Screen>;

export type TabScreenProps<Screen extends keyof TabParamList> = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, Screen>,
  NativeStackScreenProps<RootStackParamList>
>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}