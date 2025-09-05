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
import { useNavigation } from '@react-navigation/native';

const UpgradePlanScreen = () => {
  const navigation = useNavigation();
  const [selectedPlan, setSelectedPlan] = useState('pro');
  const [billingCycle, setBillingCycle] = useState('monthly');

  const plans = {
    pro: {
      name: 'Pro Plan',
      monthly: {
        price: 19.99,
        originalPrice: 29.99,
        period: 'month',
        features: [
          'Unlimited voice clones',
          'Commercial usage rights',
          'Priority processing',
          'Advanced voice effects',
          'Multi-language support',
          'API access',
          'Priority support',
        ],
      },
      yearly: {
        price: 199.99,
        originalPrice: 359.88,
        period: 'year',
        savings: '44% off',
        features: [
          'Unlimited voice clones',
          'Commercial usage rights',
          'Priority processing',
          'Advanced voice effects',
          'Multi-language support',
          'API access',
          'Priority support',
          'Free voice cloning sessions',
        ],
      },
    },
    enterprise: {
      name: 'Enterprise Plan',
      monthly: {
        price: 49.99,
        originalPrice: 79.99,
        period: 'month',
        features: [
          'Everything in Pro',
          'Custom voice training',
          'Dedicated account manager',
          'SLA guarantee',
          'Advanced analytics',
          'White-label solution',
          'Custom integrations',
        ],
      },
      yearly: {
        price: 499.99,
        originalPrice: 959.88,
        period: 'year',
        savings: '48% off',
        features: [
          'Everything in Pro',
          'Custom voice training',
          'Dedicated account manager',
          'SLA guarantee',
          'Advanced analytics',
          'White-label solution',
          'Custom integrations',
          'Migration assistance',
        ],
      },
    },
  };

  const currentPlan = plans[selectedPlan as keyof typeof plans];
  const currentBilling = currentPlan[billingCycle as keyof typeof currentPlan];

  const handleUpgrade = () => {
    navigation.navigate('ReviewSummary', {
      plan: selectedPlan,
      billingCycle,
      price: currentBilling.price,
    });
  };

  const handleContactSales = () => {
    Alert.alert(
      'Contact Sales',
      'Our enterprise team will contact you within 24 hours to discuss your needs.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Contact Sales',
          onPress: () => {
            // Open email or contact form
            console.log('Contact sales');
          },
        },
      ]
    );
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
        <Text style={styles.title}>Upgrade Plan</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Billing Toggle */}
        <View style={styles.billingToggle}>
          <TouchableOpacity
            style={[
              styles.billingOption,
              billingCycle === 'monthly' && styles.billingOptionActive,
            ]}
            onPress={() => setBillingCycle('monthly')}
          >
            <Text
              style={[
                styles.billingText,
                billingCycle === 'monthly' && styles.billingTextActive,
              ]}
            >
              Monthly
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.billingOption,
              billingCycle === 'yearly' && styles.billingOptionActive,
            ]}
            onPress={() => setBillingCycle('yearly')}
          >
            <Text
              style={[
                styles.billingText,
                billingCycle === 'yearly' && styles.billingTextActive,
              ]}
            >
              Yearly
            </Text>
            <View style={styles.savingsBadge}>
              <Text style={styles.savingsText}>
                {billingCycle === 'monthly' ? 'Save 44%' : 'Save 48%'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Plan Selection */}
        <View style={styles.plansContainer}>
          {Object.entries(plans).map(([planKey, plan]) => {
            const isSelected = selectedPlan === planKey;
            const billing = plan[billingCycle as keyof typeof plan];

            return (
              <TouchableOpacity
                key={planKey}
                style={[styles.planCard, isSelected && styles.planCardSelected]}
                onPress={() => setSelectedPlan(planKey)}
              >
                <View style={styles.planHeader}>
                  <View style={styles.planInfo}>
                    <Text style={[styles.planName, isSelected && styles.planNameSelected]}>
                      {plan.name}
                    </Text>
                    <View style={styles.priceContainer}>
                      <Text style={[styles.price, isSelected && styles.priceSelected]}>
                        ${billing.price}
                      </Text>
                      <Text style={[styles.period, isSelected && styles.periodSelected]}>
                        /{billing.period}
                      </Text>
                      {billing.originalPrice && (
                        <Text style={styles.originalPrice}>
                          ${billing.originalPrice}
                        </Text>
                      )}
                    </View>
                    {billing.savings && (
                      <View style={styles.savingsTag}>
                        <Text style={styles.savingsTagText}>{billing.savings}</Text>
                      </View>
                    )}
                  </View>
                  <View style={[styles.radio, isSelected && styles.radioSelected]}>
                    {isSelected && <View style={styles.radioInner} />}
                  </View>
                </View>

                <View style={styles.featuresList}>
                  {billing.features.map((feature, index) => (
                    <View key={index} style={styles.featureItem}>
                      <MaterialIcons
                        name="check"
                        size={16}
                        color={isSelected ? "#FFFFFF" : "#22C55E"}
                      />
                      <Text style={[styles.featureText, isSelected && styles.featureTextSelected]}>
                        {feature}
                      </Text>
                    </View>
                  ))}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Enterprise Contact */}
        <View style={styles.enterpriseContact}>
          <Text style={styles.enterpriseTitle}>Need Custom Solutions?</Text>
          <Text style={styles.enterpriseText}>
            Contact our enterprise team for custom pricing and dedicated support.
          </Text>
          <TouchableOpacity style={styles.contactButton} onPress={handleContactSales}>
            <MaterialIcons name="business" size={20} color="#5546FF" />
            <Text style={styles.contactButtonText}>Contact Sales Team</Text>
          </TouchableOpacity>
        </View>

        {/* Upgrade Button */}
        <View style={styles.upgradeSection}>
          <TouchableOpacity style={styles.upgradeButton} onPress={handleUpgrade}>
            <Text style={styles.upgradeButtonText}>
              Upgrade to {currentPlan.name}
            </Text>
            <MaterialIcons name="arrow-forward" size={20} color="#FFFFFF" />
          </TouchableOpacity>

          <Text style={styles.disclaimer}>
            Cancel anytime. No hidden fees. 30-day money-back guarantee.
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
  billingToggle: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    margin: 20,
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  billingOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    position: 'relative',
  },
  billingOptionActive: {
    backgroundColor: '#5546FF',
  },
  billingText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
  },
  billingTextActive: {
    color: '#FFFFFF',
  },
  savingsBadge: {
    position: 'absolute',
    top: -8,
    right: 8,
    backgroundColor: '#EF4444',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  savingsText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  plansContainer: {
    paddingHorizontal: 20,
  },
  planCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  planCardSelected: {
    borderColor: '#5546FF',
    backgroundColor: '#5546FF',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  planInfo: {
    flex: 1,
  },
  planName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  planNameSelected: {
    color: '#FFFFFF',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  price: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  priceSelected: {
    color: '#FFFFFF',
  },
  period: {
    fontSize: 16,
    color: '#6B7280',
    marginLeft: 4,
  },
  periodSelected: {
    color: '#FFFFFF',
  },
  originalPrice: {
    fontSize: 16,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
    marginLeft: 8,
  },
  savingsTag: {
    backgroundColor: '#22C55E',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  savingsTagText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: '#FFFFFF',
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  featuresList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
    lineHeight: 20,
  },
  featureTextSelected: {
    color: '#FFFFFF',
  },
  enterpriseContact: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  enterpriseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  enterpriseText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  contactButtonText: {
    fontSize: 16,
    color: '#5546FF',
    marginLeft: 8,
  },
  upgradeSection: {
    padding: 20,
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#5546FF',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#5546FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  upgradeButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 8,
  },
  disclaimer: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default UpgradePlanScreen;
