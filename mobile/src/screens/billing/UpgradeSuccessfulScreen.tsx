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

const UpgradeSuccessfulScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { plan, billingCycle, price } = route.params as any;

  useEffect(() => {
    // Auto navigate to main app after 5 seconds
    const timer = setTimeout(() => {
      navigation.navigate('MainApp');
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleContinue = () => {
    navigation.navigate('MainApp');
  };

  const handleViewFeatures = () => {
    // Navigate to features overview or main app
    navigation.navigate('MainApp');
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
          <Text style={styles.title}>Welcome to {plan === 'pro' ? 'Pro' : 'Enterprise'}!</Text>
          <Text style={styles.subtitle}>
            Your subscription has been activated successfully
          </Text>

          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Plan</Text>
              <Text style={styles.detailValue}>
                {plan === 'pro' ? 'Pro Plan' : 'Enterprise Plan'}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Billing</Text>
              <Text style={styles.detailValue}>
                {billingCycle === 'yearly' ? 'Yearly' : 'Monthly'}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Amount Paid</Text>
              <Text style={styles.detailValue}>${(price * 1.08).toFixed(2)}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Next Billing</Text>
              <Text style={styles.detailValue}>
                {new Date(Date.now() + (billingCycle === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000)
                  .toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>

        {/* What's Next */}
        <View style={styles.nextContainer}>
          <Text style={styles.nextTitle}>What's Next?</Text>

          <View style={styles.nextItem}>
            <MaterialIcons name="check-circle" size={20} color="#22C55E" />
            <Text style={styles.nextText}>Unlimited voice clones</Text>
          </View>

          <View style={styles.nextItem}>
            <MaterialIcons name="check-circle" size={20} color="#22C55E" />
            <Text style={styles.nextText}>Priority processing</Text>
          </View>

          <View style={styles.nextItem}>
            <MaterialIcons name="check-circle" size={20} color="#22C55E" />
            <Text style={styles.nextText}>Advanced features unlocked</Text>
          </View>

          <View style={styles.nextItem}>
            <MaterialIcons name="check-circle" size={20} color="#22C55E" />
            <Text style={styles.nextText}>24/7 priority support</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.secondaryButton} onPress={handleViewFeatures}>
            <MaterialIcons name="explore" size={20} color="#5546FF" />
            <Text style={styles.secondaryButtonText}>Explore Features</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.primaryButton} onPress={handleContinue}>
            <Text style={styles.primaryButtonText}>Get Started</Text>
            <MaterialIcons name="arrow-forward" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Auto Redirect Notice */}
        <View style={styles.redirectNotice}>
          <Text style={styles.redirectText}>
            Auto-redirecting to main app in 5 seconds...
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
  detailsCard: {
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

export default UpgradeSuccessfulScreen;
