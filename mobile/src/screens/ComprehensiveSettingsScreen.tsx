import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  StatusBar,
  Alert,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const ComprehensiveSettingsScreen = () => {
  const navigation = useNavigation();
  
  // Settings state
  const [settings, setSettings] = useState({
    notifications: {
      pushNotifications: true,
      emailNotifications: true,
      projectUpdates: true,
      marketingEmails: false,
    },
    app: {
      darkMode: false,
      language: 'English',
      autoSave: true,
      highQualityAudio: true,
    },
    privacy: {
      analytics: true,
      crashReporting: true,
      dataSharing: false,
    },
    subscription: {
      plan: 'Free',
      renewalDate: '2024-02-15',
      autoRenew: true,
    },
  });

  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const settingsSections = [
    {
      id: 'account',
      title: 'Account & Profile',
      icon: 'person',
      items: [
        { id: 'profile', title: 'My Profile', subtitle: 'Edit your personal information', icon: 'edit' },
        { id: 'subscription', title: 'Subscription', subtitle: 'Free Plan', icon: 'star', badge: 'Upgrade' },
        { id: 'billing', title: 'Billing & Payments', subtitle: 'Manage payment methods', icon: 'payment' },
        { id: 'team', title: 'Team Management', subtitle: 'Invite and manage teammates', icon: 'group' },
      ],
    },
    {
      id: 'app',
      title: 'App Preferences',
      icon: 'settings',
      items: [
        { id: 'appearance', title: 'App Appearance', subtitle: 'Light mode', icon: 'palette', type: 'navigation' },
        { id: 'language', title: 'Language', subtitle: 'English', icon: 'language', type: 'navigation' },
        { id: 'audio', title: 'Audio Quality', subtitle: 'High quality enabled', icon: 'high-quality', type: 'toggle', key: 'app.highQualityAudio' },
        { id: 'autosave', title: 'Auto-save Projects', subtitle: 'Save progress automatically', icon: 'save', type: 'toggle', key: 'app.autoSave' },
      ],
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: 'notifications',
      items: [
        { id: 'push', title: 'Push Notifications', subtitle: 'Get notified about updates', icon: 'phone-android', type: 'toggle', key: 'notifications.pushNotifications' },
        { id: 'email', title: 'Email Notifications', subtitle: 'Receive updates via email', icon: 'email', type: 'toggle', key: 'notifications.emailNotifications' },
        { id: 'project', title: 'Project Updates', subtitle: 'Notifications about your projects', icon: 'folder', type: 'toggle', key: 'notifications.projectUpdates' },
        { id: 'marketing', title: 'Marketing Emails', subtitle: 'Product news and tips', icon: 'campaign', type: 'toggle', key: 'notifications.marketingEmails' },
      ],
    },
    {
      id: 'privacy',
      title: 'Privacy & Security',
      icon: 'security',
      items: [
        { id: 'password', title: 'Change Password', subtitle: 'Update your account password', icon: 'lock', type: 'navigation' },
        { id: 'two-factor', title: 'Two-Factor Authentication', subtitle: 'Add an extra layer of security', icon: 'verified-user', type: 'navigation' },
        { id: 'analytics', title: 'Usage Analytics', subtitle: 'Help improve the app', icon: 'analytics', type: 'toggle', key: 'privacy.analytics' },
        { id: 'crash', title: 'Crash Reporting', subtitle: 'Automatically report crashes', icon: 'bug-report', type: 'toggle', key: 'privacy.crashReporting' },
        { id: 'data', title: 'Data Sharing', subtitle: 'Share data for research', icon: 'share', type: 'toggle', key: 'privacy.dataSharing' },
      ],
    },
    {
      id: 'support',
      title: 'Help & Support',
      icon: 'help',
      items: [
        { id: 'faq', title: 'FAQ', subtitle: 'Frequently asked questions', icon: 'quiz', type: 'navigation' },
        { id: 'contact', title: 'Contact Support', subtitle: 'Get help from our team', icon: 'support-agent', type: 'navigation' },
        { id: 'feedback', title: 'Send Feedback', subtitle: 'Share your thoughts', icon: 'feedback', type: 'navigation' },
        { id: 'docs', title: 'Documentation', subtitle: 'Learn how to use Voicify', icon: 'library-books', type: 'navigation' },
      ],
    },
    {
      id: 'legal',
      title: 'Legal',
      icon: 'gavel',
      items: [
        { id: 'privacy-policy', title: 'Privacy Policy', subtitle: 'How we protect your data', icon: 'policy', type: 'navigation' },
        { id: 'terms', title: 'Terms of Service', subtitle: 'Our terms and conditions', icon: 'description', type: 'navigation' },
        { id: 'licenses', title: 'Third-party Licenses', subtitle: 'Open source acknowledgments', icon: 'copyright', type: 'navigation' },
      ],
    },
  ];

  const subscriptionPlans = [
    {
      id: 'free',
      name: 'Free',
      price: '$0',
      period: '/month',
      features: ['10 voice generations', '2 AI voices', 'Basic export formats'],
      current: true,
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '$19',
      period: '/month',
      features: ['Unlimited generations', '50+ AI voices', 'All export formats', 'Voice cloning', 'Priority support'],
      popular: true,
    },
    {
      id: 'team',
      name: 'Team',
      price: '$49',
      period: '/month',
      features: ['Everything in Pro', 'Team collaboration', 'Advanced analytics', 'Custom branding', 'Dedicated support'],
    },
  ];

  const updateSetting = (key: string, value: boolean) => {
    const keys = key.split('.');
    setSettings(prev => {
      const newSettings = { ...prev };
      let current = newSettings as any;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newSettings;
    });
  };

  const getSettingValue = (key: string): boolean => {
    const keys = key.split('.');
    let current = settings as any;
    
    for (const k of keys) {
      current = current[k];
    }
    
    return current;
  };

  const handleItemPress = (item: any) => {
    switch (item.type) {
      case 'navigation':
        // Navigate to specific setting screen
        console.log(`Navigate to ${item.id}`);
        break;
      case 'toggle':
        // Toggle setting
        if (item.key) {
          updateSetting(item.key, !getSettingValue(item.key));
        }
        break;
      default:
        // Default navigation
        console.log(`Default action for ${item.id}`);
        break;
    }

    // Handle special cases
    if (item.id === 'subscription') {
      setShowUpgradeModal(true);
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
            // Perform logout
            navigation.navigate('Welcome' as never);
          },
        },
      ]
    );
  };

  const renderSettingItem = (item: any) => (
    <TouchableOpacity
      key={item.id}
      style={styles.settingItem}
      onPress={() => handleItemPress(item)}
      activeOpacity={0.8}
    >
      <View style={styles.settingItemIcon}>
        <MaterialIcons
          name={item.icon as keyof typeof MaterialIcons.glyphMap}
          size={24}
          color="#6366f1"
        />
      </View>
      
      <View style={styles.settingItemContent}>
        <Text style={styles.settingItemTitle}>{item.title}</Text>
        <Text style={styles.settingItemSubtitle}>{item.subtitle}</Text>
      </View>

      <View style={styles.settingItemAction}>
        {item.badge && (
          <View style={styles.settingBadge}>
            <Text style={styles.settingBadgeText}>{item.badge}</Text>
          </View>
        )}
        
        {item.type === 'toggle' && item.key ? (
          <Switch
            value={getSettingValue(item.key)}
            onValueChange={(value) => updateSetting(item.key, value)}
            trackColor={{ false: '#e5e7eb', true: '#a7f3d0' }}
            thumbColor={getSettingValue(item.key) ? '#10b981' : '#f3f4f6'}
          />
        ) : (
          <MaterialIcons name="chevron-right" size={20} color="#9ca3af" />
        )}
      </View>
    </TouchableOpacity>
  );

  const renderUpgradePlan = (plan: any) => (
    <View
      key={plan.id}
      style={[
        styles.planCard,
        plan.current && styles.currentPlanCard,
        plan.popular && styles.popularPlanCard,
      ]}
    >
      {plan.popular && (
        <View style={styles.popularBadge}>
          <Text style={styles.popularBadgeText}>Most Popular</Text>
        </View>
      )}
      
      <Text style={styles.planName}>{plan.name}</Text>
      <View style={styles.planPricing}>
        <Text style={styles.planPrice}>{plan.price}</Text>
        <Text style={styles.planPeriod}>{plan.period}</Text>
      </View>
      
      <View style={styles.planFeatures}>
        {plan.features.map((feature, index) => (
          <View key={index} style={styles.planFeature}>
            <MaterialIcons name="check" size={16} color="#10b981" />
            <Text style={styles.planFeatureText}>{feature}</Text>
          </View>
        ))}
      </View>
      
      <TouchableOpacity
        style={[
          styles.planButton,
          plan.current && styles.currentPlanButton,
        ]}
        disabled={plan.current}
        activeOpacity={0.8}
      >
        <Text style={[
          styles.planButtonText,
          plan.current && styles.currentPlanButtonText,
        ]}>
          {plan.current ? 'Current Plan' : 'Upgrade'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <MaterialIcons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Settings</Text>
          <Text style={styles.headerSubtitle}>Manage your preferences</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileAvatar}>
            <MaterialIcons name="person" size={32} color="white" />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>John Doe</Text>
            <Text style={styles.profileEmail}>john.doe@example.com</Text>
            <View style={styles.profileBadge}>
              <Text style={styles.profileBadgeText}>{settings.subscription.plan} Plan</Text>
            </View>
          </View>
        </View>

        {/* Settings Sections */}
        {settingsSections.map((section) => (
          <View key={section.id} style={styles.settingsSection}>
            <View style={styles.sectionHeader}>
              <MaterialIcons
                name={section.icon as keyof typeof MaterialIcons.glyphMap}
                size={20}
                color="#6366f1"
              />
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>
            
            <View style={styles.sectionContent}>
              {section.items.map(renderSettingItem)}
            </View>
          </View>
        ))}

        {/* Logout Button */}
        <View style={styles.logoutSection}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <MaterialIcons name="logout" size={24} color="#ef4444" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Upgrade Modal */}
      <Modal
        visible={showUpgradeModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Upgrade Your Plan</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowUpgradeModal(false)}
              activeOpacity={0.7}
            >
              <MaterialIcons name="close" size={24} color="#374151" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.upgradeSubtitle}>
              Unlock more features with a premium plan
            </Text>

            <View style={styles.plansContainer}>
              {subscriptionPlans.map(renderUpgradePlan)}
            </View>

            <View style={styles.upgradeFeatures}>
              <Text style={styles.upgradeFeaturesTitle}>Why upgrade?</Text>
              <View style={styles.upgradeFeaturesList}>
                <View style={styles.upgradeFeature}>
                  <MaterialIcons name="auto-awesome" size={20} color="#6366f1" />
                  <Text style={styles.upgradeFeatureText}>Unlimited voice generations</Text>
                </View>
                <View style={styles.upgradeFeature}>
                  <MaterialIcons name="voice-over-off" size={20} color="#6366f1" />
                  <Text style={styles.upgradeFeatureText}>Access to 50+ premium voices</Text>
                </View>
                <View style={styles.upgradeFeature}>
                  <MaterialIcons name="file-download" size={20} color="#6366f1" />
                  <Text style={styles.upgradeFeatureText}>Export in all formats</Text>
                </View>
                <View style={styles.upgradeFeature}>
                  <MaterialIcons name="support-agent" size={20} color="#6366f1" />
                  <Text style={styles.upgradeFeatureText}>Priority customer support</Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    marginRight: 16,
    padding: 8,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  scrollContainer: {
    flex: 1,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  profileBadge: {
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  profileBadgeText: {
    fontSize: 12,
    color: '#6366f1',
    fontWeight: '500',
  },
  settingsSection: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 8,
  },
  sectionContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  settingItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0e7ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingItemContent: {
    flex: 1,
  },
  settingItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  settingItemSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  settingItemAction: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingBadge: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 12,
  },
  settingBadgeText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },
  logoutSection: {
    paddingHorizontal: 16,
    marginTop: 32,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#fee2e2',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  closeButton: {
    padding: 8,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  upgradeSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginVertical: 20,
  },
  plansContainer: {
    marginBottom: 32,
  },
  planCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    position: 'relative',
  },
  currentPlanCard: {
    backgroundColor: '#f0f4ff',
    borderColor: '#6366f1',
  },
  popularPlanCard: {
    backgroundColor: '#fef3c7',
    borderColor: '#f59e0b',
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    left: 20,
    backgroundColor: '#f59e0b',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularBadgeText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },
  planName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  planPricing: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  planPrice: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#6366f1',
  },
  planPeriod: {
    fontSize: 16,
    color: '#6b7280',
    marginLeft: 4,
  },
  planFeatures: {
    marginBottom: 20,
  },
  planFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  planFeatureText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
  },
  planButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  currentPlanButton: {
    backgroundColor: '#e5e7eb',
  },
  planButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  currentPlanButtonText: {
    color: '#9ca3af',
  },
  upgradeFeatures: {
    backgroundColor: '#f0f4ff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  upgradeFeaturesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  upgradeFeaturesList: {
    gap: 12,
  },
  upgradeFeature: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  upgradeFeatureText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 12,
  },
});

export default ComprehensiveSettingsScreen;