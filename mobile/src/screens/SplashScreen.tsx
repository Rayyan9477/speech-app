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
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const SplashScreen = () => {
  const navigation = useNavigation();
  const logoScale = new Animated.Value(0);
  const logoRotate = new Animated.Value(0);
  const textOpacity = new Animated.Value(0);
  const pulseValue = new Animated.Value(1);

  useEffect(() => {
    startAnimation();
    checkUserStatus();
  }, []);

  const startAnimation = () => {
    // Logo animation
    Animated.sequence([
      Animated.timing(logoScale, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseValue, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Rotation animation
    Animated.loop(
      Animated.timing(logoRotate, {
        toValue: 1,
        duration: 8000,
        useNativeDriver: true,
      })
    ).start();
  };

  const checkUserStatus = async () => {
    setTimeout(async () => {
      try {
        const hasSeenWalkthrough = await AsyncStorage.getItem('hasSeenWalkthrough');
        const authToken = await AsyncStorage.getItem('authToken');

        if (authToken) {
          navigation.navigate('MainTabs' as never);
        } else if (hasSeenWalkthrough) {
          navigation.navigate('Welcome' as never);
        } else {
          navigation.navigate('Walkthrough' as never);
        }
      } catch (error) {
        console.error('Error checking user status:', error);
        navigation.navigate('Welcome' as never);
      }
    }, 3000);
  };

  const spin = logoRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <LinearGradient
        colors={['#1e1b4b', '#7c3aed', '#1e1b4b']}
        style={styles.gradient}
      >
        {/* Background particles */}
        <View style={styles.particlesContainer}>
          {Array.from({ length: 20 }).map((_, index) => (
            <Animated.View
              key={index}
              style={[
                styles.particle,
                {
                  left: Math.random() * width,
                  top: Math.random() * height,
                  opacity: Math.random() * 0.3,
                },
              ]}
            />
          ))}
        </View>

        {/* Main logo */}
        <Animated.View style={[
          styles.logoContainer,
          {
            transform: [
              { scale: Animated.multiply(logoScale, pulseValue) },
              { rotate: spin },
            ],
          },
        ]}>
          <LinearGradient
            colors={['#a855f7', '#ec4899', '#3b82f6']}
            style={styles.logoCircle}
          >
            <View style={styles.logoInner}>
              <MaterialIcons name="mic" size={48} color="white" />
            </View>
          </LinearGradient>

          {/* Floating elements */}
          <Animated.View style={[styles.floatingElement, styles.sparkle]}>
            <MaterialIcons name="auto-awesome" size={16} color="#fbbf24" />
          </Animated.View>

          <Animated.View style={[styles.floatingElement, styles.wave]}>
            <MaterialIcons name="volume-up" size={12} color="#06b6d4" />
          </Animated.View>
        </Animated.View>

        {/* App title */}
        <Animated.View style={[styles.textContainer, { opacity: textOpacity }]}>
          <Text style={styles.title}>Voicify</Text>
          <Text style={styles.subtitle}>Transform Your Voice</Text>
        </Animated.View>

        {/* Loading indicator */}
        <Animated.View style={[styles.loadingContainer, { opacity: textOpacity }]}>
          <View style={styles.loadingDots}>
            {[0, 1, 2].map((index) => (
              <Animated.View
                key={index}
                style={[
                  styles.dot,
                  {
                    opacity: logoScale.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.3, 1],
                    }),
                  },
                ]}
              />
            ))}
          </View>
        </Animated.View>

        {/* Version info */}
        <Animated.View style={[styles.versionContainer, { opacity: textOpacity }]}>
          <Text style={styles.version}>Version 1.0.0</Text>
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
  },
  particlesContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  particle: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'white',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  logoCircle: {
    width: 128,
    height: 128,
    borderRadius: 64,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.44,
    shadowRadius: 10.32,
    elevation: 16,
  },
  logoInner: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingElement: {
    position: 'absolute',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sparkle: {
    top: -8,
    right: -8,
    width: 32,
    height: 32,
    backgroundColor: 'rgba(251, 191, 36, 0.9)',
  },
  wave: {
    bottom: -8,
    left: -8,
    width: 24,
    height: 24,
    backgroundColor: 'rgba(6, 182, 212, 0.9)',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 20,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    fontWeight: '300',
  },
  loadingContainer: {
    position: 'absolute',
    bottom: 80,
    alignItems: 'center',
  },
  loadingDots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    marginHorizontal: 4,
  },
  versionContainer: {
    position: 'absolute',
    bottom: 32,
    alignItems: 'center',
  },
  version: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
  },
});

export default SplashScreen;