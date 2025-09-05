import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

const RemoveTeammateSuccessScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = route.params as any;

  useEffect(() => {
    // Auto navigate back after 3 seconds
    const timer = setTimeout(() => {
      navigation.navigate('UserManagement');
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleBackToTeam = () => {
    navigation.navigate('UserManagement');
  };

  const handleInviteNewMember = () => {
    navigation.navigate('InviteTeammate');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Success Animation */}
        <View style={styles.animationContainer}>
          <View style={styles.successCircle}>
            <MaterialIcons name="check" size: 60, color="#FFFFFF" />
          </View>
        </View>

        {/* Success Message */}
        <View style={styles.messageContainer}>
          <Text style={styles.title}>Team Member Removed</Text>
          <Text style={styles.subtitle}>
            {user.name} has been successfully removed from your team
          </Text>

          <View style={styles.userCard}>
            <View style={styles.userInfo}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{user.avatar}</Text>
              </View>
              <View style={styles.userDetails}>
                <Text style={styles.userName}>{user.name}</Text>
                <Text style={styles.userEmail}>{user.email}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* What Happened */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>What happened?</Text>

          <View style={styles.infoItem}>
            <MaterialIcons name="block" size={20} color="#EF4444" />
            <Text style={styles.infoText}>
              {user.name} can no longer access team projects
            </Text>
          </View>

          <View style={styles.infoItem}>
            <MaterialIcons name="save" size={20} color="#22C55E" />
            <Text style={styles.infoText}>
              Their voice clones remain in the library
            </Text>
          </View>

          <View style={styles.infoItem}>
            <MaterialIcons name="refresh" size={20} color="#F59E0B" />
            <Text style={styles.infoText}>
              They can be re-invited anytime
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.secondaryButton} onPress={handleInviteNewMember}>
            <MaterialIcons name="person-add" size={20} color="#5546FF" />
            <Text style={styles.secondaryButtonText}>Invite New Member</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.primaryButton} onPress={handleBackToTeam}>
            <Text style={styles.primaryButtonText}>Back to Team</Text>
            <MaterialIcons name="arrow-forward" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Auto Redirect Notice */}
        <View style={styles.redirectNotice}>
          <Text style={styles.redirectText}>
            Auto-redirecting to team management in 3 seconds...
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
    alignItems: 'center',
  },
  animationContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  successCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#22C55E',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
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
  infoContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  secondaryButtonText: {
    fontSize: 16,
    color: '#5546FF',
    marginLeft: 8,
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#5546FF',
    borderRadius: 8,
    paddingVertical: 12,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 8,
  },
  redirectNotice: {
    marginTop: 24,
    padding: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  redirectText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});

export default RemoveTeammateSuccessScreen;
