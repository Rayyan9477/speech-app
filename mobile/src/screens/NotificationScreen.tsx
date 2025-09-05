import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Switch,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const NotificationScreen = () => {
  const navigation = useNavigation();

  const [notifications, setNotifications] = useState({
    push: true,
    email: false,
    sms: false,
    projectUpdates: true,
    voiceProcessing: true,
    teamActivity: false,
    marketing: false,
    security: true,
  });

  const handleToggle = (key: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const notificationCategories = [
    {
      title: 'General',
      items: [
        {
          key: 'push',
          title: 'Push Notifications',
          subtitle: 'Receive notifications on your device',
          icon: 'notifications',
          value: notifications.push,
        },
        {
          key: 'email',
          title: 'Email Notifications',
          subtitle: 'Get updates via email',
          icon: 'email',
          value: notifications.email,
        },
        {
          key: 'sms',
          title: 'SMS Notifications',
          subtitle: 'Receive text messages',
          icon: 'sms',
          value: notifications.sms,
        },
      ],
    },
    {
      title: 'Activity',
      items: [
        {
          key: 'projectUpdates',
          title: 'Project Updates',
          subtitle: 'When projects are completed or fail',
          icon: 'work',
          value: notifications.projectUpdates,
        },
        {
          key: 'voiceProcessing',
          title: 'Voice Processing',
          subtitle: 'When voice cloning is complete',
          icon: 'mic',
          value: notifications.voiceProcessing,
        },
        {
          key: 'teamActivity',
          title: 'Team Activity',
          subtitle: 'When team members join or leave',
          icon: 'group',
          value: notifications.teamActivity,
        },
      ],
    },
    {
      title: 'Other',
      items: [
        {
          key: 'marketing',
          title: 'Marketing & Updates',
          subtitle: 'Product updates and promotions',
          icon: 'campaign',
          value: notifications.marketing,
        },
        {
          key: 'security',
          title: 'Security Alerts',
          subtitle: 'Important security notifications',
          icon: 'security',
          value: notifications.security,
        },
      ],
    },
  ];

  const renderNotificationItem = (item: any) => (
    <View key={item.key} style={styles.notificationItem}>
      <View style={styles.notificationLeft}>
        <View style={styles.notificationIcon}>
          <MaterialIcons name={item.icon as any} size={20} color="#5546FF" />
        </View>
        <View style={styles.notificationInfo}>
          <Text style={styles.notificationTitle}>{item.title}</Text>
          <Text style={styles.notificationSubtitle}>{item.subtitle}</Text>
        </View>
      </View>
      <Switch
        value={item.value}
        onValueChange={() => handleToggle(item.key as keyof typeof notifications)}
        trackColor={{ false: '#E5E7EB', true: '#5546FF' }}
        thumbColor="#FFFFFF"
      />
    </View>
  );

  const handleTestNotification = () => {
    // TODO: Send test notification
    console.log('Test notification sent');
  };

  const handleNotificationHistory = () => {
    // TODO: Navigate to notification history
    console.log('Navigate to notification history');
  };

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
        <Text style={styles.title}>Notifications</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleTestNotification}>
            <MaterialIcons name="notifications-active" size={20} color="#5546FF" />
            <Text style={styles.actionButtonText}>Test Notification</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleNotificationHistory}>
            <MaterialIcons name="history" size={20} color="#6B7280" />
            <Text style={styles.actionButtonText}>Notification History</Text>
          </TouchableOpacity>
        </View>

        {/* Notification Categories */}
        {notificationCategories.map((category, categoryIndex) => (
          <View key={categoryIndex} style={styles.category}>
            <Text style={styles.categoryTitle}>{category.title}</Text>
            <View style={styles.categoryContent}>
              {category.items.map(renderNotificationItem)}
            </View>
          </View>
        ))}

        {/* Notification Schedule */}
        <View style={styles.scheduleSection}>
          <Text style={styles.sectionTitle}>Quiet Hours</Text>
          <Text style={styles.scheduleDescription}>
            Set times when you don't want to receive notifications
          </Text>

          <View style={styles.scheduleCard}>
            <View style={styles.scheduleRow}>
              <Text style={styles.scheduleLabel}>Start Time</Text>
              <TouchableOpacity style={styles.timeButton}>
                <Text style={styles.timeText}>10:00 PM</Text>
                <MaterialIcons name="schedule" size={16} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.scheduleRow}>
              <Text style={styles.scheduleLabel}>End Time</Text>
              <TouchableOpacity style={styles.timeButton}>
                <Text style={styles.timeText}>8:00 AM</Text>
                <MaterialIcons name="schedule" size={16} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.scheduleRow}>
              <Text style={styles.scheduleLabel}>Days</Text>
              <TouchableOpacity style={styles.daysButton}>
                <Text style={styles.daysText}>Mon - Fri</Text>
                <MaterialIcons name="expand-more" size={16} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Device Settings */}
        <View style={styles.deviceSection}>
          <Text style={styles.sectionTitle}>Device Settings</Text>

          <View style={styles.deviceCard}>
            <TouchableOpacity style={styles.deviceItem}>
              <MaterialIcons name="phone-android" size={20} color="#22C55E" />
              <View style={styles.deviceInfo}>
                <Text style={styles.deviceName}>iPhone 13</Text>
                <Text style={styles.deviceStatus}>Notifications enabled</Text>
              </View>
              <MaterialIcons name="chevron-right" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Save Button */}
        <View style={styles.saveSection}>
          <TouchableOpacity style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Save Preferences</Text>
          </TouchableOpacity>
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
  quickActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  actionButtonText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
  },
  category: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  categoryContent: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  notificationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  notificationInfo: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  notificationSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  scheduleSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  scheduleDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  scheduleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scheduleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  scheduleLabel: {
    fontSize: 16,
    color: '#1F2937',
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  timeText: {
    fontSize: 14,
    color: '#374151',
    marginRight: 8,
  },
  daysButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  daysText: {
    fontSize: 14,
    color: '#374151',
    marginRight: 8,
  },
  deviceSection: {
    padding: 20,
  },
  deviceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  deviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  deviceInfo: {
    flex: 1,
    marginLeft: 12,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  deviceStatus: {
    fontSize: 14,
    color: '#22C55E',
    marginTop: 2,
  },
  saveSection: {
    padding: 20,
  },
  saveButton: {
    backgroundColor: '#5546FF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#5546FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default NotificationScreen;
