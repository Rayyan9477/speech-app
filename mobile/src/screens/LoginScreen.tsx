import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, SafeAreaView, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../lib/theme-provider';
import { Colors, Typography, Spacing, BorderRadius } from '../../../shared/design-system';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';

const LoginScreen = () => {
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    // TODO: Implement actual login logic
    navigation.navigate('MainApp' as never);
  };

  const handleSocialLogin = (provider: string) => {
    // TODO: Implement social login
    console.log(`Login with ${provider}`);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Button
            title=""
            icon="arrow-back"
            variant="ghost"
            size="small"
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          />
          
          <View style={styles.welcomeSection}>
            <Text style={[styles.welcomeTitle, { color: colors.text.primary }]}>
              Welcome Back! 👋
            </Text>
            <Text style={[styles.welcomeSubtitle, { color: colors.text.secondary }]}>
              Let the Creativity Continue
            </Text>
          </View>
        </View>

        {/* Login Form */}
        <View style={styles.formContainer}>
          <Text style={[styles.fieldLabel, { color: colors.text.primary }]}>Email</Text>
          <Input
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon="email"
            containerStyle={styles.inputContainer}
          />

          <Text style={[styles.fieldLabel, { color: colors.text.primary }]}>Password</Text>
          <Input
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            leftIcon="lock"
            rightIcon={showPassword ? 'visibility-off' : 'visibility'}
            onRightIconPress={() => setShowPassword(!showPassword)}
            containerStyle={styles.inputContainer}
          />

          {/* Remember Me & Forgot Password */}
          <View style={styles.optionsRow}>
            <Button
              title={rememberMe ? "✓ Remember me" : "Remember me"}
              variant="ghost"
              size="small"
              style={styles.rememberButton}
              textStyle={[styles.rememberText, { color: colors.text.secondary }]}
              onPress={() => setRememberMe(!rememberMe)}
            />
            <Button
              title="Forgot Password?"
              variant="ghost"
              size="small"
              textStyle={[styles.forgotText, { color: Colors.primary[500] }]}
              onPress={() => navigation.navigate('ForgotPassword' as never)}
            />
          </View>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            <Text style={[styles.dividerText, { color: colors.text.secondary }]}>or</Text>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          </View>

          {/* Social Login Buttons */}
          <View style={styles.socialButtonsContainer}>
            <Button
              title="Continue with Google"
              variant="outline"
              icon="g-translate"
              style={styles.socialButton}
              textStyle={[styles.socialButtonText, { color: colors.text.primary }]}
              onPress={() => handleSocialLogin('Google')}
            />
            
            <Button
              title="Continue with Apple"
              variant="outline"
              icon="phone-iphone"
              style={styles.socialButton}
              textStyle={[styles.socialButtonText, { color: colors.text.primary }]}
              onPress={() => handleSocialLogin('Apple')}
            />
            
            <Button
              title="Continue with Facebook"
              variant="outline"
              icon="facebook"
              style={styles.socialButton}
              textStyle={[styles.socialButtonText, { color: colors.text.primary }]}
              onPress={() => handleSocialLogin('Facebook')}
            />
          </View>

          {/* Login Button */}
          <Button
            title="Log in"
            variant="gradient"
            size="large"
            fullWidth
            style={styles.loginButton}
            onPress={handleLogin}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing[6],
    paddingTop: Spacing[4],
    paddingBottom: Spacing[8],
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: Spacing[6],
  },
  welcomeSection: {
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.bold,
    textAlign: 'center',
    marginBottom: Spacing[2],
  },
  welcomeSubtitle: {
    fontSize: Typography.fontSize.base,
    textAlign: 'center',
    lineHeight: Typography.lineHeight.relaxed * Typography.fontSize.base,
  },
  formContainer: {
    paddingHorizontal: Spacing[6],
    paddingBottom: Spacing[8],
  },
  fieldLabel: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    marginBottom: Spacing[2],
    marginTop: Spacing[2],
  },
  inputContainer: {
    marginBottom: Spacing[4],
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing[8],
  },
  rememberButton: {
    paddingHorizontal: 0,
  },
  rememberText: {
    fontSize: Typography.fontSize.sm,
  },
  forgotText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing[8],
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: Spacing[4],
    fontSize: Typography.fontSize.sm,
  },
  socialButtonsContainer: {
    gap: Spacing[3],
    marginBottom: Spacing[8],
  },
  socialButton: {
    borderRadius: BorderRadius.lg,
  },
  socialButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
  },
  loginButton: {
    borderRadius: BorderRadius.lg,
  },
});

export default LoginScreen;
