import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
// Note: Framer Motion is not fully compatible with React Native, using View instead

const WelcomeScreen = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.skipButton}
            onPress={() => navigation.navigate('MainApp' as never)}
          >
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.mainContent}>
          {/* Logo/Icon */}
          <View style={styles.logoContainer}>
            <View style={styles.iconCircle}>
              <MaterialIcons name="mic" size={40} color="white" />
            </View>
            <Text style={styles.appName}>Voicify</Text>
          </View>

          {/* Animated elements */}
          <View style={styles.animationContainer}>
            <View style={styles.floatingIcon}>
              <View style={styles.smallIcon}>
                <MaterialIcons name="star" size={16} color="white" />
              </View>
            </View>

            <View style={styles.floatingIcon2}>
              <View style={styles.smallIcon}>
                <MaterialIcons name="mic" size={12} color="white" />
              </View>
            </View>

            <View style={styles.mainIcon}>
              <View style={styles.mainIconInner}>
                <MaterialIcons name="volume-up" size={48} color="white" />
              </View>
            </View>
          </View>

          {/* Title */}
          <Text style={styles.title}>Transform Your Voice</Text>

          {/* Subtitle */}
          <Text style={styles.subtitle}>
            Create stunning voice content with AI-powered text-to-speech,
            voice cloning, and real-time translation. Your words, their voice.
          </Text>

          {/* Features */}
          <View style={styles.features}>
            <View style={styles.feature}>
              <View style={styles.featureIcon}>
                <MaterialIcons name="volume-up" size={24} color="#5546FF" />
              </View>
              <Text style={styles.featureText}>TTS</Text>
            </View>
            <View style={styles.feature}>
              <View style={styles.featureIcon}>
                <MaterialIcons name="mic" size={24} color="#5546FF" />
              </View>
              <Text style={styles.featureText}>Clone</Text>
            </View>
            <View style={styles.feature}>
              <View style={styles.featureIcon}>
                <MaterialIcons name="translate" size={24} color="#5546FF" />
              </View>
              <Text style={styles.featureText}>Translate</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => navigation.navigate('Signup' as never)}
            >
              <Text style={styles.primaryButtonText}>Get Started</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => navigation.navigate('Login' as never)}
            >
              <Text style={styles.secondaryButtonText}>I Already Have an Account</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By continuing, you agree to our{' '}
            <Text style={styles.linkText}>Terms of Service</Text> and{' '}
            <Text style={styles.linkText}>Privacy Policy</Text>
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'flex-end',
    paddingVertical: 20,
  },
  skipButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  skipText: {
    color: '#9CA3AF',
    fontSize: 16,
  },
  mainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#5546FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  animationContainer: {
    position: 'relative',
    alignItems: 'center',
    marginBottom: 40,
  },
  mainIcon: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: '#5546FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainIconInner: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingIcon: {
    position: 'absolute',
    top: -16,
    right: -16,
  },
  floatingIcon2: {
    position: 'absolute',
    bottom: -16,
    left: -16,
  },
  smallIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  features: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
    marginBottom: 48,
  },
  feature: {
    alignItems: 'center',
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
  },
  primaryButton: {
    backgroundColor: '#5546FF',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#374151',
    fontSize: 18,
    fontWeight: '600',
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  linkText: {
    color: '#5546FF',
    textDecorationLine: 'underline',
  },
});

export default WelcomeScreen;
