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

const InviteSentScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { email, role } = route.params as any;

  useEffect(() => {
    // Auto navigate back after 3 seconds
    const timer = setTimeout(() => {
      navigation.navigate('UserManagement');
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleInviteAnother = () => {
    navigation.navigate('InviteTeammate');
  };

  const handleBackToTeam = () => {
    navigation.navigate('UserManagement');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Success Animation */}
        <View style={styles.animationContainer}>
          <View style={styles.successCircle}>
            <MaterialIcons name="check" size={60} color="#FFFFFF" />
          </View>

          <View style={styles.confetti}>
            {[...Array(6)].map((_, i) => (
              <View
                key={i}
                style={[
                  styles.confettiPiece,
                  {
                    left: `${20 + i * 10}%`,
                    animationDelay: `${i * 0.2}s`,
                  },
                ]}
              />
            ))}
          </View>
        </View>

        {/* Success Message */}
        <View style={styles.messageContainer}>
          <Text style={styles.title}>Invitation Sent!</Text>
          <Text style={styles.subtitle}>
            We've sent an invitation to {email}
          </Text>

          <View style={styles.inviteDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Email</Text>
              <Text style={styles.detailValue}>{email}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Role</Text>
              <Text style={styles.detailValue}>{role}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Expires</Text>
              <Text style={styles.detailValue}>
                {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>

        {/* What's Next */}
        <View style={styles.nextContainer}>
          <Text style={styles.nextTitle}>What happens next?</Text>

          <View style={styles.nextItem}>
            <MaterialIcons name="email" size={20} color="#22C55E" />
            <Text style={styles.nextText}>
              They'll receive an email with instructions
            </Text>
          </View>

          <View style={styles.nextItem}>
            <MaterialIcons name="schedule" size={20} color="#F59E0B" />
            <Text style={styles.nextText}>
              Invitation expires in 7 days
            </Text>
          </View>

          <View style={styles.nextItem}>
            <MaterialIcons name="person-add" size={20} color="#5546FF" />
            <Text style={styles.nextText}>
              They'll appear in your team once they accept
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.secondaryButton} onPress={handleInviteAnother}>
            <MaterialIcons name="person-add" size={20} color="#5546FF" />
            <Text style={styles.secondaryButtonText}>Invite Another</Text>
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
    position: 'relative',
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
  confetti: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  confettiPiece: {
    position: 'absolute',
    width: 8,
    height: 8,
    backgroundColor: '#F59E0B',
    borderRadius: 4,
    top: 20,
  },
  messageContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
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
  inviteDetails: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    marginTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  detailLabel: {
    fontSize: 16,
    color: '#6B7280',
  },
  detailValue: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  nextContainer: {
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
  nextTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  nextItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  nextText: {
    fontSize: 16,
    color: '#1F2937',
    marginLeft: 12,
    flex: 1,
    lineHeight: 22,
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

export default InviteSentScreen;
