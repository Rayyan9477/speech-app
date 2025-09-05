import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Switch,
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const SettingsScreen = () => {
  const navigation = useNavigation();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [biometricAuth, setBiometricAuth] = useState(false);

  const settingsSections = [
    {
      title: 'Account & Security',
      items: [
        {
          title: 'My Profile',
          subtitle: 'Manage your personal information',
          icon: 'person',
          action: 'profile',
        },
        {
          title: 'Change Password',
          subtitle: 'Update your account password',
          icon: 'lock',
          action: 'password',
        },
        {
          title: 'Biometric Authentication',
          subtitle: 'Use fingerprint or face ID',
          icon: 'fingerprint',
          type: 'switch',
          value: biometricAuth,
          onValueChange: setBiometricAuth,
        },
      ],
    },
    {
      title: 'App Appearance',
      items: [
        {
          title: 'App Language',
          subtitle: 'English (US)',
          icon: 'language',
          action: 'language',
        },
        {
          title: 'Choose Theme',
          subtitle: 'Light mode',
          icon: 'palette',
          action: 'theme',
        },
        {
          title: 'Dark Mode',
          subtitle: 'Enable dark theme',
          icon: 'brightness-6',
          type: 'switch',
          value: darkMode,
          onValueChange: setDarkMode,
        },
      ],
    },
    {
      title: 'Notifications',
      items: [
        {
          title: 'Push Notifications',
          subtitle: 'Receive app notifications',
          icon: 'notifications',
          type: 'switch',
          value: notifications,
          onValueChange: setNotifications,
        },
        {
          title: 'Email Notifications',
          subtitle: 'Get updates via email',
          icon: 'email',
          action: 'email-notifications',
        },
        {
          title: 'Processing Alerts',
          subtitle: 'Notify when processing completes',
          icon: 'notifications-active',
          action: 'processing-alerts',
        },
        {
          title: 'Notification Settings',
          subtitle: 'Manage all notifications',
          icon: 'settings',
          screen: 'NotificationSettings',
        },
      ],
    },
    {
      title: 'Billing & Subscriptions',
      items: [
        {
          title: 'Current Plan',
          subtitle: 'Pro Plan - Monthly',
          icon: 'credit-card',
          action: 'current-plan',
        },
        {
          title: 'Payment Methods',
          subtitle: 'Manage your payment options',
          icon: 'payment',
          action: 'payment-methods',
        },
        {
          title: 'Billing History',
          subtitle: 'View past transactions',
          icon: 'receipt',
          action: 'billing-history',
        },
        {
          title: 'Upgrade Plan',
          subtitle: 'Get more features',
          icon: 'upgrade',
          screen: 'UpgradePlan',
        },
      ],
    },
    {
      title: 'Data & Analytics',
      items: [
        {
          title: 'Usage Statistics',
          subtitle: 'View your app usage data',
          icon: 'analytics',
          action: 'analytics',
        },
        {
          title: 'Export Data',
          subtitle: 'Download your data',
          icon: 'download',
          action: 'export-data',
        },
        {
          title: 'Clear Cache',
          subtitle: 'Free up storage space',
          icon: 'cleaning-services',
          action: 'clear-cache',
        },
      ],
    },
    {
      title: 'Team & Collaboration',
      items: [
        {
          title: 'User Management',
          subtitle: 'Manage team members',
          icon: 'group',
          screen: 'UserManagement',
        },
        {
          title: 'Team Settings',
          subtitle: 'Configure team preferences',
          icon: 'settings',
          action: 'team-settings',
        },
      ],
    },
    {
      title: 'Help & Support',
      items: [
        {
          title: 'FAQ',
          subtitle: 'Frequently asked questions',
          icon: 'help',
          screen: 'FAQ',
        },
        {
          title: 'Contact Support',
          subtitle: 'Get help from our team',
          icon: 'support',
          screen: 'ContactSupport',
        },
        {
          title: 'Privacy Policy',
          subtitle: 'Read our privacy terms',
          icon: 'privacy-tip',
          screen: 'PrivacyPolicy',
        },
        {
          title: 'Terms of Service',
          subtitle: 'Review our terms',
          icon: 'description',
          screen: 'TermsOfService',
        },
      ],
    },
  ];

  const handleSettingPress = (item: any) => {
    if (item.screen) {
      navigation.navigate(item.screen);
      return;
    }

    switch (item.action) {
      case 'profile':
        Alert.alert('Profile', 'Profile management coming soon!');
        break;
      case 'password':
        Alert.alert('Change Password', 'Password change coming soon!');
        break;
      case 'language':
        Alert.alert('Language', 'Language selection coming soon!');
        break;
      case 'theme':
        Alert.alert('Theme', 'Theme selection coming soon!');
        break;
      case 'current-plan':
        Alert.alert('Current Plan', 'Plan management coming soon!');
        break;
      case 'payment-methods':
        Alert.alert('Payment Methods', 'Payment management coming soon!');
        break;
      case 'billing-history':
        Alert.alert('Billing History', 'Transaction history coming soon!');
        break;
      case 'upgrade':
        Alert.alert('Upgrade Plan', 'Plan upgrade coming soon!');
        break;
      case 'analytics':
        Alert.alert('Analytics', 'Usage statistics coming soon!');
        break;
      case 'export-data':
        Alert.alert('Export Data', 'Data export coming soon!');
        break;
      case 'clear-cache':
        Alert.alert('Clear Cache', 'Cache cleared successfully!');
        break;
      default:
        break;
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            // TODO: Implement logout
            Alert.alert('Success', 'Logged out successfully');
          },
        },
      ]
    );
  };

  const renderSettingItem = (item: any, sectionIndex: number, itemIndex: number) => (
    <TouchableOpacity
      key={`${sectionIndex}-${itemIndex}`}
      style={styles.settingItem}
      onPress={() => item.action && handleSettingPress(item.action)}
      disabled={item.type === 'switch'}
    >
      <View style={styles.settingLeft}>
        <View style={styles.settingIcon}>
          <MaterialIcons name={item.icon} size={24} color="#5546FF" />
        </View>
        <View style={styles.settingInfo}>
          <Text style={styles.settingTitle}>{item.title}</Text>
          <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
        </View>
      </View>

      {item.type === 'switch' ? (
        <Switch
          value={item.value}
          onValueChange={item.onValueChange}
          trackColor={{ false: '#E5E7EB', true: '#5546FF' }}
          thumbColor="#FFFFFF"
        />
      ) : (
        <MaterialIcons name="chevron-right" size={24} color="#9CA3AF" />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>Manage your app preferences</Text>
        </View>

        {/* Settings Sections */}
        {settingsSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionContent}>
              {section.items.map((item, itemIndex) =>
                renderSettingItem(item, sectionIndex, itemIndex)
              )}
            </View>
          </View>
        ))}

        {/* Logout Section */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <MaterialIcons name="logout" size={24} color="#EF4444" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appVersion}>Version 1.0.0</Text>
          <Text style={styles.appCopyright}>
            © 2024 AI Language Processor. All rights reserved.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  sectionContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  logoutButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#EF4444',
    marginLeft: 12,
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  appVersion: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  appCopyright: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default SettingsScreen;
