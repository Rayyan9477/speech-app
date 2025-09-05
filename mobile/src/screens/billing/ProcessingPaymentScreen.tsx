import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

const ProcessingPaymentScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { plan, billingCycle, price, paymentMethod } = route.params as any;

  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  const processingSteps = [
    { label: 'Validating payment method...', icon: 'credit-card' },
    { label: 'Processing payment...', icon: 'payment' },
    { label: 'Confirming transaction...', icon: 'check-circle' },
    { label: 'Activating subscription...', icon: 'upgrade' },
  ];

  useEffect(() => {
    let stepIndex = 0;

    const processStep = () => {
      if (stepIndex >= processingSteps.length) {
        // Payment completed successfully
        setTimeout(() => {
          navigation.navigate('UpgradeSuccessful', {
            plan,
            billingCycle,
            price,
          });
        }, 1000);
        return;
      }

      setCurrentStep(stepIndex);

      // Animate progress for this step
      const stepDuration = 2000; // 2 seconds per step
      const interval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + 2;
          if (newProgress >= 100) {
            clearInterval(interval);
            stepIndex++;
            setProgress(0);
            setTimeout(processStep, 500);
            return 100;
          }
          return newProgress;
        });
      }, stepDuration / 50);

      return () => clearInterval(interval);
    };

    processStep();
  }, []);

  const getProgressPercentage = () => {
    return ((currentStep * 25) + (progress * 0.25)).toFixed(0);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Processing Animation */}
        <View style={styles.animationContainer}>
          <View style={styles.processingCircle}>
            <ActivityIndicator size="large" color="#5546FF" />
            <View style={styles.progressRing}>
              <Text style={styles.progressText}>{getProgressPercentage()}%</Text>
            </View>
          </View>

          {/* Progress Dots */}
          <View style={styles.progressDots}>
            {processingSteps.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.progressDot,
                  index < currentStep && styles.progressDotCompleted,
                  index === currentStep && styles.progressDotActive,
                ]}
              />
            ))}
          </View>
        </View>

        {/* Current Step */}
        <View style={styles.stepContainer}>
          <MaterialIcons
            name={processingSteps[currentStep]?.icon as any || 'sync'}
            size={32}
            color="#5546FF"
          />
          <Text style={styles.stepText}>
            {processingSteps[currentStep]?.label || 'Processing...'}
          </Text>
        </View>

        {/* Payment Details */}
        <View style={styles.detailsContainer}>
          <Text style={styles.detailsTitle}>Payment Details</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Plan</Text>
            <Text style={styles.detailValue}>
              {plan === 'pro' ? 'Pro Plan' : 'Enterprise Plan'}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Amount</Text>
            <Text style={styles.detailValue}>${(price * 1.08).toFixed(2)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Payment Method</Text>
            <Text style={styles.detailValue}>
              {paymentMethod === 'card' ? 'Credit Card' :
               paymentMethod === 'paypal' ? 'PayPal' :
               paymentMethod === 'apple' ? 'Apple Pay' : 'Google Pay'}
            </Text>
          </View>
        </View>

        {/* Security Notice */}
        <View style={styles.securityContainer}>
          <MaterialIcons name="security" size={20} color="#22C55E" />
          <Text style={styles.securityText}>
            Your payment is secure and encrypted
          </Text>
        </View>

        {/* Instructions */}
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsTitle}>Please don't close this page</Text>
          <Text style={styles.instructionsText}>
            We're processing your payment and activating your subscription.
            This may take a few moments.
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
    marginBottom: 40,
  },
  processingCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  progressRing: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#5546FF',
  },
  progressDots: {
    flexDirection: 'row',
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
  },
  progressDotCompleted: {
    backgroundColor: '#22C55E',
  },
  progressDotActive: {
    backgroundColor: '#5546FF',
  },
  stepContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  stepText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    textAlign: 'center',
  },
  detailsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
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
  securityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
  },
  securityText: {
    fontSize: 14,
    color: '#15803D',
    marginLeft: 8,
  },
  instructionsContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  instructionsText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default ProcessingPaymentScreen;
