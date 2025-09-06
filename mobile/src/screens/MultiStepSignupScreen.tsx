import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  StatusBar,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

interface SignUpData {
  role: string;
  companySize: string;
  contentType: string;
  profile: {
    company: string;
    position: string;
    industry: string;
    bio: string;
    website: string;
  };
}

const MultiStepSignupScreen = () => {
  const navigation = useNavigation();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [signUpData, setSignUpData] = useState<SignUpData>({
    role: '',
    companySize: '',
    contentType: '',
    profile: {
      company: '',
      position: '',
      industry: '',
      bio: '',
      website: '',
    },
  });

  const progressWidth = useSharedValue(0);
  const totalSteps = 4;

  const roles = [
    {
      id: 'content-creator',
      title: 'Content Creator',
      description: 'I create content for social media, YouTube, podcasts, etc.',
      icon: 'movie',
      popular: true,
    },
    {
      id: 'business-owner',
      title: 'Business Owner',
      description: 'I own a business and need voice content for marketing',
      icon: 'business-center',
    },
    {
      id: 'educator',
      title: 'Educator',
      description: 'I create educational content and training materials',
      icon: 'school',
    },
    {
      id: 'marketer',
      title: 'Marketer',
      description: 'I work in marketing and need voice content for campaigns',
      icon: 'trending-up',
    },
    {
      id: 'developer',
      title: 'Developer',
      description: 'I build applications that need voice integration',
      icon: 'code',
    },
    {
      id: 'other',
      title: 'Other',
      description: 'My role is not listed above',
      icon: 'more-horiz',
    },
  ];

  const companySizes = [
    { id: '1', label: 'Just me', description: 'Individual creator' },
    { id: '2-10', label: '2-10 employees', description: 'Small team' },
    { id: '11-50', label: '11-50 employees', description: 'Growing company' },
    { id: '51-200', label: '51-200 employees', description: 'Established business' },
    { id: '201-500', label: '201-500 employees', description: 'Large company' },
    { id: '500+', label: '500+ employees', description: 'Enterprise' },
  ];

  const contentTypes = [
    {
      id: 'social-media',
      title: 'Social Media',
      description: 'Instagram, TikTok, YouTube Shorts',
      icon: 'smartphone',
    },
    {
      id: 'podcasts',
      title: 'Podcasts & Audio',
      description: 'Podcasts, audiobooks, voice-overs',
      icon: 'headphones',
    },
    {
      id: 'marketing',
      title: 'Marketing Content',
      description: 'Ads, product demos, explainers',
      icon: 'campaign',
    },
    {
      id: 'education',
      title: 'Educational Content',
      description: 'Online courses, tutorials, training',
      icon: 'school',
    },
    {
      id: 'entertainment',
      title: 'Entertainment',
      description: 'Stories, games, creative projects',
      icon: 'theater-comedy',
    },
    {
      id: 'business',
      title: 'Business Communications',
      description: 'Presentations, meetings, announcements',
      icon: 'business',
    },
  ];

  React.useEffect(() => {
    progressWidth.value = withTiming((currentStep / totalSteps) * 100, {
      duration: 300,
    });
  }, [currentStep]);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigation.goBack();
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      navigation.navigate('SignupComplete' as never);
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateSignUpData = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setSignUpData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof SignUpData],
          [child]: value,
        },
      }));
    } else {
      setSignUpData(prev => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return signUpData.role !== '';
      case 2:
        return signUpData.companySize !== '';
      case 3:
        return signUpData.contentType !== '';
      case 4:
        return signUpData.profile.company !== '' && signUpData.profile.position !== '';
      default:
        return false;
    }
  };

  const renderRoleSelection = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>What's your role?</Text>
      <Text style={styles.stepSubtitle}>Help us personalize your experience</Text>

      <ScrollView style={styles.optionsContainer} showsVerticalScrollIndicator={false}>
        {roles.map((role) => (
          <TouchableOpacity
            key={role.id}
            style={[
              styles.optionCard,
              signUpData.role === role.id && styles.selectedCard,
            ]}
            onPress={() => updateSignUpData('role', role.id)}
            activeOpacity={0.7}
          >
            <View style={styles.optionContent}>
              <MaterialIcons
                name={role.icon as keyof typeof MaterialIcons.glyphMap}
                size={32}
                color={signUpData.role === role.id ? '#6366f1' : '#6b7280'}
              />
              <View style={styles.optionText}>
                <View style={styles.optionHeader}>
                  <Text style={[
                    styles.optionTitle,
                    signUpData.role === role.id && styles.selectedTitle,
                  ]}>
                    {role.title}
                  </Text>
                  {role.popular && (
                    <View style={styles.popularBadge}>
                      <Text style={styles.popularText}>Popular</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.optionDescription}>{role.description}</Text>
              </View>
              {signUpData.role === role.id && (
                <MaterialIcons name="check-circle" size={24} color="#6366f1" />
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderCompanySize = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Company size</Text>
      <Text style={styles.stepSubtitle}>How big is your team?</Text>

      <ScrollView style={styles.optionsContainer} showsVerticalScrollIndicator={false}>
        {companySizes.map((size) => (
          <TouchableOpacity
            key={size.id}
            style={[
              styles.optionCard,
              signUpData.companySize === size.id && styles.selectedCard,
            ]}
            onPress={() => updateSignUpData('companySize', size.id)}
            activeOpacity={0.7}
          >
            <View style={styles.simpleOptionContent}>
              <View>
                <Text style={[
                  styles.optionTitle,
                  signUpData.companySize === size.id && styles.selectedTitle,
                ]}>
                  {size.label}
                </Text>
                <Text style={styles.optionDescription}>{size.description}</Text>
              </View>
              {signUpData.companySize === size.id && (
                <MaterialIcons name="check-circle" size={24} color="#6366f1" />
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderContentType = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Content type</Text>
      <Text style={styles.stepSubtitle}>What kind of content do you create?</Text>

      <ScrollView style={styles.optionsContainer} showsVerticalScrollIndicator={false}>
        {contentTypes.map((type) => (
          <TouchableOpacity
            key={type.id}
            style={[
              styles.optionCard,
              signUpData.contentType === type.id && styles.selectedCard,
            ]}
            onPress={() => updateSignUpData('contentType', type.id)}
            activeOpacity={0.7}
          >
            <View style={styles.optionContent}>
              <MaterialIcons
                name={type.icon as keyof typeof MaterialIcons.glyphMap}
                size={32}
                color={signUpData.contentType === type.id ? '#6366f1' : '#6b7280'}
              />
              <View style={styles.optionText}>
                <Text style={[
                  styles.optionTitle,
                  signUpData.contentType === type.id && styles.selectedTitle,
                ]}>
                  {type.title}
                </Text>
                <Text style={styles.optionDescription}>{type.description}</Text>
              </View>
              {signUpData.contentType === type.id && (
                <MaterialIcons name="check-circle" size={24} color="#6366f1" />
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderProfileCompletion = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Complete your profile</Text>
      <Text style={styles.stepSubtitle}>Tell us more about yourself</Text>

      <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Company *</Text>
          <TextInput
            style={styles.input}
            placeholder="Your company name"
            value={signUpData.profile.company}
            onChangeText={(text) => updateSignUpData('profile.company', text)}
            placeholderTextColor="#9ca3af"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Position *</Text>
          <TextInput
            style={styles.input}
            placeholder="Your job title"
            value={signUpData.profile.position}
            onChangeText={(text) => updateSignUpData('profile.position', text)}
            placeholderTextColor="#9ca3af"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Industry</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Technology, Marketing, Education"
            value={signUpData.profile.industry}
            onChangeText={(text) => updateSignUpData('profile.industry', text)}
            placeholderTextColor="#9ca3af"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Website</Text>
          <TextInput
            style={styles.input}
            placeholder="https://your-website.com"
            value={signUpData.profile.website}
            onChangeText={(text) => updateSignUpData('profile.website', text)}
            placeholderTextColor="#9ca3af"
            keyboardType="url"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Bio</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Tell us about yourself and what you do..."
            value={signUpData.profile.bio}
            onChangeText={(text) => updateSignUpData('profile.bio', text)}
            placeholderTextColor="#9ca3af"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity style={styles.photoButton} activeOpacity={0.7}>
          <MaterialIcons name="camera-alt" size={24} color="#6366f1" />
          <Text style={styles.photoButtonText}>Add Profile Photo</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderRoleSelection();
      case 2:
        return renderCompanySize();
      case 3:
        return renderContentType();
      case 4:
        return renderProfileCompletion();
      default:
        return null;
    }
  };

  return (
    <LinearGradient colors={['#f8fafc', '#f1f5f9']} style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <MaterialIcons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>

        <View style={styles.progressContainer}>
          <Text style={styles.stepText}>Step {currentStep} of {totalSteps}</Text>
          <View style={styles.progressBar}>
            <Animated.View style={[styles.progressFill, progressStyle]} />
          </View>
        </View>

        <View style={{ width: 24 }} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {renderStepContent()}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.backTextButton}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.nextButton,
            !isStepValid() && styles.disabledButton,
          ]}
          onPress={handleNext}
          disabled={!isStepValid() || isLoading}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={isStepValid() ? ['#6366f1', '#8b5cf6'] : ['#e5e7eb', '#d1d5db']}
            style={styles.nextButtonGradient}
          >
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <Text style={[styles.nextText, { color: 'white' }]}>Creating...</Text>
              </View>
            ) : (
              <Text style={[
                styles.nextText,
                !isStepValid() && styles.disabledText,
              ]}>
                {currentStep === totalSteps ? 'Complete' : 'Continue'}
              </Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  progressContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  stepText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6366f1',
    borderRadius: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  stepContainer: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  optionsContainer: {
    flex: 1,
  },
  optionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedCard: {
    borderColor: '#6366f1',
    backgroundColor: '#f0f4ff',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  simpleOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionText: {
    flex: 1,
    marginLeft: 12,
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  selectedTitle: {
    color: '#6366f1',
  },
  popularBadge: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  popularText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '500',
  },
  optionDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  formContainer: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    backgroundColor: 'white',
  },
  textArea: {
    height: 100,
  },
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingVertical: 16,
    marginTop: 8,
  },
  photoButtonText: {
    fontSize: 16,
    color: '#6366f1',
    fontWeight: '500',
    marginLeft: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 24,
    paddingBottom: 40,
  },
  backTextButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  backText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  nextButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  disabledButton: {
    shadowOpacity: 0,
    elevation: 0,
  },
  nextButtonGradient: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
  },
  nextText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  disabledText: {
    color: '#9ca3af',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default MultiStepSignupScreen;