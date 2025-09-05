import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Linking,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const HelpScreen = () => {
  const navigation = useNavigation();

  const helpItems = [
    {
      id: 'faq',
      title: 'Frequently Asked Questions',
      subtitle: 'Find answers to common questions',
      icon: 'help',
      screen: 'FAQ',
    },
    {
      id: 'contact',
      title: 'Contact Support',
      subtitle: 'Get help from our support team',
      icon: 'support',
      screen: 'ContactSupport',
    },
    {
      id: 'tutorials',
      title: 'Video Tutorials',
      subtitle: 'Learn how to use our features',
      icon: 'play-circle-filled',
      action: 'tutorials',
    },
    {
      id: 'troubleshooting',
      title: 'Troubleshooting Guide',
      subtitle: 'Solve common issues',
      icon: 'build',
      action: 'troubleshooting',
    },
  ];

  const legalItems = [
    {
      id: 'privacy',
      title: 'Privacy Policy',
      subtitle: 'How we protect your data',
      icon: 'privacy-tip',
      screen: 'PrivacyPolicy',
    },
    {
      id: 'terms',
      title: 'Terms of Service',
      subtitle: 'Our terms and conditions',
      icon: 'description',
      screen: 'TermsOfService',
    },
    {
      id: 'licenses',
      title: 'Open Source Licenses',
      subtitle: 'Third-party software licenses',
      icon: 'copyright',
      action: 'licenses',
    },
  ];

  const handleItemPress = (item: any) => {
    if (item.screen) {
      navigation.navigate(item.screen);
    } else if (item.action) {
      handleAction(item.action);
    }
  };

  const handleAction = (action: string) => {
    switch (action) {
      case 'tutorials':
        // Open tutorials URL or navigate to tutorials screen
        console.log('Open tutorials');
        break;
      case 'troubleshooting':
        // Navigate to troubleshooting guide
        console.log('Open troubleshooting');
        break;
      case 'licenses':
        // Show licenses
        console.log('Show licenses');
        break;
    }
  };

  const handleEmailSupport = () => {
    Linking.openURL('mailto:support@ailanguageprocessor.com');
  };

  const handleLiveChat = () => {
    // Open live chat or navigate to chat screen
    console.log('Open live chat');
  };

  const renderHelpItem = (item: any) => (
    <TouchableOpacity
      key={item.id}
      style={styles.helpItem}
      onPress={() => handleItemPress(item)}
    >
      <View style={styles.helpIcon}>
        <MaterialIcons name={item.icon as any} size={24} color="#5546FF" />
      </View>
      <View style={styles.helpContent}>
        <Text style={styles.helpTitle}>{item.title}</Text>
        <Text style={styles.helpSubtitle}>{item.subtitle}</Text>
      </View>
      <MaterialIcons name="chevron-right" size={24} color="#9CA3AF" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#6B7280" />
        </TouchableOpacity>
        <Text style={styles.title}>Help & Support</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Quick Help */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Get Help</Text>
          {helpItems.map(renderHelpItem)}
        </View>

        {/* Contact Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Us</Text>

          <TouchableOpacity style={styles.contactCard} onPress={handleLiveChat}>
            <View style={styles.contactIcon}>
              <MaterialIcons name="chat" size={24} color="#22C55E" />
            </View>
            <View style={styles.contactContent}>
              <Text style={styles.contactTitle}>Live Chat</Text>
              <Text style={styles.contactSubtitle}>Chat with our support team</Text>
              <Text style={styles.contactHours}>Available 24/7</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactCard} onPress={handleEmailSupport}>
            <View style={styles.contactIcon}>
              <MaterialIcons name="email" size={24} color="#F59E0B" />
            </View>
            <View style={styles.contactContent}>
              <Text style={styles.contactTitle}>Email Support</Text>
              <Text style={styles.contactSubtitle}>support@ailanguageprocessor.com</Text>
              <Text style={styles.contactHours}>Response within 24 hours</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Legal */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal</Text>
          {legalItems.map(renderHelpItem)}
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <View style={styles.appInfo}>
            <Text style={styles.appVersion}>AI Language Processor v1.0.0</Text>
            <Text style={styles.appDescription}>
              Transform your voice with advanced AI technology
            </Text>
          </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  helpItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  helpIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  helpContent: {
    flex: 1,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 2,
  },
  helpSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  contactContent: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 2,
  },
  contactSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  contactHours: {
    fontSize: 12,
    color: '#22C55E',
    fontWeight: '500',
  },
  appInfo: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  appVersion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  appDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default HelpScreen;
