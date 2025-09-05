import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const InviteTeammateScreen = () => {
  const navigation = useNavigation();
  const [formData, setFormData] = useState({
    email: '',
    role: 'Editor',
    message: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const roles = [
    { id: 'Editor', name: 'Editor', description: 'Can edit and manage projects' },
    { id: 'Viewer', name: 'Viewer', description: 'Can view projects only' },
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleRoleSelect = (role: string) => {
    setFormData(prev => ({
      ...prev,
      role,
    }));
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSendInvite = async () => {
    if (!formData.email.trim()) {
      Alert.alert('Error', 'Please enter an email address');
      return;
    }

    if (!validateEmail(formData.email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Integrate with backend API
      await new Promise(resolve => setTimeout(resolve, 2000));

      navigation.navigate('InviteSent', {
        email: formData.email,
        role: formData.role,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to send invitation');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons name="arrow-back" size={24} color="#6B7280" />
          </TouchableOpacity>
          <Text style={styles.title}>Invite Teammate</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.subtitle}>
            Invite new team members to collaborate on your projects
          </Text>

          {/* Email Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email Address *</Text>
            <View style={styles.inputContainer}>
              <MaterialIcons name="email" size={20} color="#6B7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="colleague@company.com"
                value={formData.email}
                onChangeText={(value) => handleInputChange('email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          {/* Role Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Role</Text>
            <Text style={styles.roleDescription}>
              Choose the level of access for this team member
            </Text>

            {roles.map((role) => (
              <TouchableOpacity
                key={role.id}
                style={[
                  styles.roleCard,
                  formData.role === role.id && styles.roleCardSelected,
                ]}
                onPress={() => handleRoleSelect(role.id)}
              >
                <View style={styles.roleHeader}>
                  <Text
                    style={[
                      styles.roleName,
                      formData.role === role.id && styles.roleNameSelected,
                    ]}
                  >
                    {role.name}
                  </Text>
                  <View
                    style={[
                      styles.radio,
                      formData.role === role.id && styles.radioSelected,
                    ]}
                  >
                    {formData.role === role.id && <View style={styles.radioInner} />}
                  </View>
                </View>
                <Text
                  style={[
                    styles.roleDescription,
                    formData.role === role.id && styles.roleDescriptionSelected,
                  ]}
                >
                  {role.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Personal Message */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Personal Message (Optional)</Text>
            <TextInput
              style={[styles.input, styles.messageInput]}
              placeholder="Add a personal message to your invitation..."
              value={formData.message}
              onChangeText={(value) => handleInputChange('message', value)}
              multiline
              numberOfLines={4}
              maxLength={500}
            />
            <Text style={styles.charCount}>
              {formData.message.length}/500
            </Text>
          </View>

          {/* Send Invite Button */}
          <TouchableOpacity
            style={[
              styles.inviteButton,
              (!formData.email.trim() || isLoading) && styles.disabledButton,
            ]}
            onPress={handleSendInvite}
            disabled={!formData.email.trim() || isLoading}
          >
            <Text style={styles.inviteButtonText}>
              {isLoading ? 'Sending...' : 'Send Invitation'}
            </Text>
            <MaterialIcons name="send" size={20} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Info Section */}
          <View style={styles.infoSection}>
            <View style={styles.infoItem}>
              <MaterialIcons name="info" size={20} color="#F59E0B" />
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>Invitation Details</Text>
                <Text style={styles.infoText}>
                  • Invitations expire after 7 days
                  • Users can accept from any device
                  • You can revoke invitations anytime
                </Text>
              </View>
            </View>
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
  scrollView: {
    flex: 1,
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
  content: {
    padding: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  messageInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'right',
    marginTop: 4,
  },
  roleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  roleCardSelected: {
    borderColor: '#5546FF',
    backgroundColor: '#F8F9FF',
  },
  roleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  roleName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  roleNameSelected: {
    color: '#5546FF',
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
    borderColor: '#5546FF',
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#5546FF',
  },
  roleDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  roleDescriptionSelected: {
    color: '#5546FF',
  },
  inviteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#5546FF',
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 24,
    shadowColor: '#5546FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
  },
  inviteButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 8,
  },
  infoSection: {
    backgroundColor: '#FFF8E1',
    borderRadius: 12,
    padding: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoContent: {
    marginLeft: 12,
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
  },
});

export default InviteTeammateScreen;
