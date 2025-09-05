import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

const ReviewSummaryScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { plan, billingCycle, price } = route.params as any;

  const [isProcessing, setIsProcessing] = useState(false);

  const planDetails = {
    pro: {
      name: 'Pro Plan',
      color: '#5546FF',
      features: [
        'Unlimited voice clones',
        'Commercial usage rights',
        'Priority processing',
        'Advanced voice effects',
        'Multi-language support',
      ],
    },
    enterprise: {
      name: 'Enterprise Plan',
      color: '#7C3AED',
      features: [
        'Everything in Pro',
        'Custom voice training',
        'Dedicated account manager',
        'SLA guarantee',
        'Advanced analytics',
      ],
    },
  };

  const currentPlan = planDetails[plan as keyof typeof planDetails];
  const billingText = billingCycle === 'yearly' ? 'Yearly' : 'Monthly';

  const handleConfirmUpgrade = () => {
    navigation.navigate('SelectPaymentMethod', {
      plan,
      billingCycle,
      price,
    });
  };

  const handleEditPlan = () => {
    navigation.goBack();
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
        <Text style={styles.title}>Review Summary</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Plan Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Plan Summary</Text>

          <View style={[styles.planCard, { borderLeftColor: currentPlan.color }]}>
            <View style={styles.planHeader}>
              <View style={styles.planIcon}>
                <MaterialIcons name="star" size={24} color={currentPlan.color} />
              </View>
              <View style={styles.planInfo}>
                <Text style={styles.planName}>{currentPlan.name}</Text>
                <Text style={styles.planBilling}>{billingText} Billing</Text>
              </View>
              <View style={styles.planPrice}>
                <Text style={styles.price}>${price}</Text>
                <Text style={styles.period}>/{billingCycle === 'yearly' ? 'year' : 'month'}</Text>
              </View>
            </View>

            <View style={styles.featuresList}>
              {currentPlan.features.map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <MaterialIcons name="check" size={16} color="#22C55E" />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Billing Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Billing Details</Text>

          <View style={styles.billingCard}>
            <View style={styles.billingRow}>
              <Text style={styles.billingLabel}>Subtotal</Text>
              <Text style={styles.billingValue}>${price}</Text>
            </View>

            <View style={styles.billingRow}>
              <Text style={styles.billingLabel}>Tax</Text>
              <Text style={styles.billingValue}>${(price * 0.08).toFixed(2)}</Text>
            </View>

            <View style={[styles.billingRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>${(price * 1.08).toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Billing Cycle Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Billing Information</Text>

          <View style={styles.infoCard}>
            <View style={styles.infoItem}>
              <MaterialIcons name="schedule" size={20} color="#6B7280" />
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>Next Billing Date</Text>
                <Text style={styles.infoValue}>
                  {billingCycle === 'yearly'
                    ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString()
                    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()
                  }
                </Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <MaterialIcons name="credit-card" size={20} color="#6B7280" />
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>Payment Method</Text>
                <Text style={styles.infoValue}>Will be selected next</Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <MaterialIcons name="refresh" size={20} color="#6B7280" />
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>Billing Cycle</Text>
                <Text style={styles.infoValue}>
                  {billingCycle === 'yearly' ? 'Annual' : 'Monthly'} - Auto-renew
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Terms and Conditions */}
        <View style={styles.section}>
          <View style={styles.termsCard}>
            <MaterialIcons name="info" size={20} color="#F59E0B" />
            <View style={styles.termsContent}>
              <Text style={styles.termsTitle}>Important Information</Text>
              <Text style={styles.termsText}>
                • You can cancel anytime from your account settings
                • 30-day money-back guarantee
                • No hidden fees or setup costs
                • Instant access to all features
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.editButton} onPress={handleEditPlan}>
            <MaterialIcons name="edit" size={20} color="#5546FF" />
            <Text style={styles.editButtonText}>Edit Plan</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmUpgrade}>
            <Text style={styles.confirmButtonText}>Continue to Payment</Text>
            <MaterialIcons name="arrow-forward" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By continuing, you agree to our Terms of Service and Privacy Policy
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
  planCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  planIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  planInfo: {
    flex: 1,
  },
  planName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  planBilling: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  planPrice: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  period: {
    fontSize: 14,
    color: '#6B7280',
  },
  featuresList: {
    gap: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
  },
  billingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  billingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  billingLabel: {
    fontSize: 16,
    color: '#6B7280',
  },
  billingValue: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 16,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#5546FF',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoContent: {
    marginLeft: 12,
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  infoValue: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
    marginTop: 2,
  },
  termsCard: {
    backgroundColor: '#FFF8E1',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  termsContent: {
    marginLeft: 12,
    flex: 1,
  },
  termsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 8,
  },
  termsText: {
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  editButton: {
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
  editButtonText: {
    fontSize: 16,
    color: '#5546FF',
    marginLeft: 8,
  },
  confirmButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#5546FF',
    borderRadius: 8,
    paddingVertical: 12,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 8,
  },
  footer: {
    padding: 20,
    paddingBottom: 40,
  },
  footerText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default ReviewSummaryScreen;
