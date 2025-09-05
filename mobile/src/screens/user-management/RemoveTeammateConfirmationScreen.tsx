import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

const RemoveTeammateConfirmationScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = route.params as any;
  const [isLoading, setIsLoading] = useState(false);

  const handleRemoveUser = async () => {
    setIsLoading(true);
    try {
      // TODO: Integrate with backend API
      await new Promise(resolve => setTimeout(resolve, 1500));

      navigation.navigate('RemoveTeammateSuccess', { user });
    } catch (error) {
      Alert.alert('Error', 'Failed to remove team member');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Warning Icon */}
        <View style={styles.warningContainer}>
          <View style={styles.warningCircle}>
            <MaterialIcons name="warning" size={48} color="#EF4444" />
          </View>
        </View>

        {/* Warning Message */}
        <View style={styles.messageContainer}>
          <Text style={styles.title}>Remove Team Member</Text>
          <Text style={styles.subtitle}>
            Are you sure you want to remove {user.name} from your team?
          </Text>

          <View style={styles.userCard}>
            <View style={styles.userInfo}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{user.avatar}</Text>
              </View>
              <View style={styles.userDetails}>
                <Text style={styles.userName}>{user.name}</Text>
                <Text style={styles.userEmail}>{user.email}</Text>
                <Text style={styles.userRole}>{user.role}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Consequences */}
        <View style={styles.consequencesContainer}>
          <Text style={styles.consequencesTitle}>What happens when you remove this member?</Text>

          <View style={styles.consequenceItem}>
            <MaterialIcons name="cancel" size={20} color="#EF4444" />
            <Text style={styles.consequenceText}>
              They will lose access to all team projects
            </Text>
          </View>

          <View style={styles.consequenceItem}>
            <MaterialIcons name="delete" size={20} color="#EF4444" />
            <Text style={styles.consequenceText}>
              Their voice clones will remain but they can't access them
            </Text>
          </View>

          <View style={styles.consequenceItem}>
            <MaterialIcons name="block" size={20} color="#EF4444" />
            <Text style={styles.consequenceText}>
              They can be re-invited later if needed
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancel}
            disabled={isLoading}
          >
            <Text style={styles.cancelButtonText}>Keep Member</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.removeButton, isLoading && styles.disabledButton]}
            onPress={handleRemoveUser}
            disabled={isLoading}
          >
            <MaterialIcons name="delete" size={20} color="#FFFFFF" />
            <Text style={styles.removeButtonText}>
              {isLoading ? 'Removing...' : 'Remove Member'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Additional Info */}
        <View style={styles.infoContainer}>
          <MaterialIcons name="info" size={16} color="#6B7280" />
          <Text style={styles.infoText}>
            This action cannot be undone. The user will need to be re-invited to regain access.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  warningContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  warningCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  userCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  userEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  userRole: {
    fontSize: 12,
    color: '#5546FF',
    fontWeight: '500',
    marginTop: 4,
  },
  consequencesContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  consequencesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  consequenceItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  consequenceText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  removeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF4444',
    borderRadius: 8,
    paddingVertical: 12,
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
  },
  removeButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 8,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
});

export default RemoveTeammateConfirmationScreen;
