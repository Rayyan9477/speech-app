import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../lib/theme-provider';
import { Colors, Typography, Spacing } from '../../../shared/design-system';

const { width, height } = Dimensions.get('window');

const SplashScreen = () => {
  const navigation = useNavigation();
  const { isDark } = useTheme();
  const logoScale = new Animated.Value(0);
  const textOpacity = new Animated.Value(0);
  const spinnerOpacity = new Animated.Value(0);
  const spinnerRotation = new Animated.Value(0);

  useEffect(() => {
    startAnimation();
    navigateToWalkthrough();
  }, []);

  const startAnimation = () => {
    // Logo appears first
    Animated.timing(logoScale, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Text appears after logo
    setTimeout(() => {
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    }, 300);

    // Spinner appears last with rotation
    setTimeout(() => {
      Animated.timing(spinnerOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();

      // Start spinner rotation
      Animated.loop(
        Animated.timing(spinnerRotation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ).start();
    }, 800);
  };

  const navigateToWalkthrough = () => {
    setTimeout(() => {
      navigation.navigate('Walkthrough' as never);
    }, 2500);
  };

  const spin = spinnerRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <LinearGradient
        colors={Colors.gradients.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Voicify Logo Icon */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              transform: [{ scale: logoScale }],
            },
          ]}
        >
          <View style={styles.logoIconContainer}>
            <View style={styles.soundBar} />
            <View style={[styles.soundBar, styles.soundBar2]} />
            <View style={[styles.soundBar, styles.soundBar3]} />
            <View style={[styles.soundBar, styles.soundBar4]} />
            <View style={[styles.soundBar, styles.soundBar5]} />
            <View style={[styles.soundBar, styles.soundBar6]} />
            <View style={[styles.soundBar, styles.soundBar7]} />
          </View>
        </Animated.View>

        {/* App Title */}
        <Animated.View
          style={[
            styles.titleContainer,
            { opacity: textOpacity },
          ]}
        >
          <Text style={styles.title}>Voicify</Text>
        </Animated.View>

        {/* Loading Spinner */}
        <Animated.View
          style={[
            styles.spinnerContainer,
            { opacity: spinnerOpacity },
          ]}
        >
          <Animated.View
            style={[
              styles.spinner,
              { transform: [{ rotate: spin }] },
            ]}
          />
        </Animated.View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing[6],
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing[20],
  },
  logoIconContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
  },
  soundBar: {
    width: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    height: 24,
  },
  soundBar2: {
    height: 40,
  },
  soundBar3: {
    height: 56,
  },
  soundBar4: {
    height: 72,
  },
  soundBar5: {
    height: 56,
  },
  soundBar6: {
    height: 40,
  },
  soundBar7: {
    height: 24,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: Spacing[32],
  },
  title: {
    fontSize: Typography.fontSize['5xl'],
    fontWeight: Typography.fontWeight.bold,
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 1,
  },
  spinnerContainer: {
    position: 'absolute',
    bottom: 120,
    alignItems: 'center',
  },
  spinner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderTopColor: '#FFFFFF',
  },
});

export default SplashScreen;