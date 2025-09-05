import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  TextInput,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

const SelectPaymentMethodScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { plan, billingCycle, price } = route.params as any;

  const [selectedMethod, setSelectedMethod] = useState('card');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: '',
  });
  const [isSavingCard, setIsSavingCard] = useState(false);

  const paymentMethods = [
    {
      id: 'card',
      name: 'Credit/Debit Card',
      icon: 'credit-card',
      description: 'Visa, Mastercard, Amex',
    },
    {
      id: 'paypal',
      name: 'PayPal',
      icon: 'account-balance-wallet',
      description: 'Pay with PayPal',
    },
    {
      id: 'apple',
      name: 'Apple Pay',
      icon: 'phone-iphone',
      description: 'Touch ID or Face ID',
    },
    {
      id: 'google',
      name: 'Google Pay',
      icon: 'android',
      description: 'Google Pay integration',
    },
  ];

  const savedCards = [
    {
      id: '1',
      type: 'Visa',
      last4: '4242',
      expiry: '12/25',
      isDefault: true,
    },
    {
      id: '2',
      type: 'Mastercard',
      last4: '8888',
      expiry: '08/26',
      isDefault: false,
    },
  ];

  const handlePaymentMethodSelect = (methodId: string) => {
    setSelectedMethod(methodId);
  };

  const handleCardInputChange = (field: string, value: string) => {
    setCardDetails(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCompletePayment = () => {
    if (selectedMethod === 'card' && !cardDetails.number) {
      Alert.alert('Error', 'Please enter your card details');
      return;
    }

    navigation.navigate('ProcessingPayment', {
      plan,
      billingCycle,
      price,
      paymentMethod: selectedMethod,
    });
  };

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const match = cleaned.match(/\d{1,4}/g);
    return match ? match.join(' ').substr(0, 19) : '';
  };

  const formatExpiry = (text: string) => {
    const cleaned = text.replace(/\D+/g, '');
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
    }
    return cleaned;
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
        <Text style={styles.title}>Payment Method</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Plan</Text>
              <Text style={styles.summaryValue}>
                {plan === 'pro' ? 'Pro Plan' : 'Enterprise Plan'}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Billing</Text>
              <Text style={styles.summaryValue}>
                {billingCycle === 'yearly' ? 'Yearly' : 'Monthly'}
              </Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>${(price * 1.08).toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Payment Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Payment Method</Text>

          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.methodCard,
                selectedMethod === method.id && styles.methodCardSelected,
              ]}
              onPress={() => handlePaymentMethodSelect(method.id)}
            >
              <View style={styles.methodIcon}>
                <MaterialIcons
                  name={method.icon as any}
                  size={24}
                  color={selectedMethod === method.id ? '#FFFFFF' : '#5546FF'}
                />
              </View>
              <View style={styles.methodInfo}>
                <Text
                  style={[
                    styles.methodName,
                    selectedMethod === method.id && styles.methodNameSelected,
                  ]}
                >
                  {method.name}
                </Text>
                <Text
                  style={[
                    styles.methodDescription,
                    selectedMethod === method.id && styles.methodDescriptionSelected,
                  ]}
                >
                  {method.description}
                </Text>
              </View>
              <View
                style={[
                  styles.radio,
                  selectedMethod === method.id && styles.radioSelected,
                ]}
              >
                {selectedMethod === method.id && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Saved Cards */}
        {selectedMethod === 'card' && savedCards.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Saved Cards</Text>
            {savedCards.map((card) => (
              <TouchableOpacity
                key={card.id}
                style={styles.savedCard}
                onPress={() => {
                  // Pre-fill card details
                  setCardDetails({
                    number: `**** **** **** ${card.last4}`,
                    expiry: card.expiry,
                    cvv: '',
                    name: '',
                  });
                }}
              >
                <View style={styles.cardIcon}>
                  <MaterialIcons name="credit-card" size={20} color="#6B7280" />
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardType}>{card.type}</Text>
                  <Text style={styles.cardNumber}>**** **** **** {card.last4}</Text>
                </View>
                {card.isDefault && (
                  <View style={styles.defaultBadge}>
                    <Text style={styles.defaultText}>Default</Text>
                  </View>
                )}
                <MaterialIcons name="chevron-right" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Card Details Form */}
        {selectedMethod === 'card' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Card Details</Text>

            <View style={styles.formCard}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Card Number</Text>
                <TextInput
                  style={styles.input}
                  placeholder="1234 5678 9012 3456"
                  value={cardDetails.number}
                  onChangeText={(value) => handleCardInputChange('number', formatCardNumber(value))}
                  keyboardType="numeric"
                  maxLength={19}
                />
              </View>

              <View style={styles.rowInputs}>
                <View style={[styles.inputGroup, styles.halfInput]}>
                  <Text style={styles.inputLabel}>Expiry Date</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="MM/YY"
                    value={cardDetails.expiry}
                    onChangeText={(value) => handleCardInputChange('expiry', formatExpiry(value))}
                    keyboardType="numeric"
                    maxLength={5}
                  />
                </View>

                <View style={[styles.inputGroup, styles.halfInput]}>
                  <Text style={styles.inputLabel}>CVV</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="123"
                    value={cardDetails.cvv}
                    onChangeText={(value) => handleCardInputChange('cvv', value)}
                    keyboardType="numeric"
                    maxLength={4}
                    secureTextEntry
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Cardholder Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="John Doe"
                  value={cardDetails.name}
                  onChangeText={(value) => handleCardInputChange('name', value)}
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.checkboxRow}>
                <TouchableOpacity
                  style={[styles.checkbox, isSavingCard && styles.checkboxChecked]}
                  onPress={() => setIsSavingCard(!isSavingCard)}
                >
                  {isSavingCard && <MaterialIcons name="check" size={16} color="#FFFFFF" />}
                </TouchableOpacity>
                <Text style={styles.checkboxLabel}>Save card for future payments</Text>
              </View>
            </View>
          </View>
        )}

        {/* Complete Payment Button */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.paymentButton} onPress={handleCompletePayment}>
            <Text style={styles.paymentButtonText}>
              Complete Payment - ${(price * 1.08).toFixed(2)}
            </Text>
            <MaterialIcons name="lock" size={20} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.securityInfo}>
            <MaterialIcons name="security" size={16} color="#22C55E" />
            <Text style={styles.securityText}>SSL Encrypted • PCI Compliant</Text>
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
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#6B7280',
  },
  summaryValue: {
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
  methodCard: {
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
  methodCardSelected: {
    backgroundColor: '#5546FF',
    shadowColor: '#5546FF',
    shadowOpacity: 0.2,
  },
  methodIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  methodInfo: {
    flex: 1,
  },
  methodName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  methodNameSelected: {
    color: '#FFFFFF',
  },
  methodDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  methodDescriptionSelected: {
    color: '#FFFFFF',
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
  savedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardIcon: {
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
  },
  cardType: {
    fontSize: 14,
    color: '#6B7280',
  },
  cardNumber: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  defaultBadge: {
    backgroundColor: '#22C55E',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 12,
  },
  defaultText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1F2937',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: '#5546FF',
    borderColor: '#5546FF',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  paymentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#5546FF',
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 16,
    shadowColor: '#5546FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  paymentButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 8,
  },
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  securityText: {
    fontSize: 12,
    color: '#22C55E',
    marginLeft: 6,
  },
});

export default SelectPaymentMethodScreen;
