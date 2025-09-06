import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const SignupCompleteScreen = () => {
  const navigation = useNavigation();
  
  // Animation values
  const checkmarkScale = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const featuresOpacity = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(0)).current;
  const confettiValues = useRef(
    Array.from({ length: 12 }, () => ({
      x: new Animated.Value(0),
      y: new Animated.Value(0),
      rotation: new Animated.Value(0),
      scale: new Animated.Value(0),
    }))
  ).current;

  useEffect(() => {
    startAnimations();
  }, []);

  const startAnimations = () => {
    // Checkmark animation
    Animated.spring(checkmarkScale, {
      toValue: 1,
      tension: 100,
      friction: 8,
      useNativeDriver: true,
    }).start();

    // Text animation
    Animated.timing(textOpacity, {
      toValue: 1,
      duration: 800,
      delay: 400,
      useNativeDriver: true,
    }).start();

    // Features animation
    Animated.timing(featuresOpacity, {
      toValue: 1,
      duration: 800,
      delay: 800,
      useNativeDriver: true,
    }).start();

    // Button animation
    Animated.spring(buttonScale, {
      toValue: 1,
      tension: 80,
      friction: 8,
      delay: 1200,
      useNativeDriver: true,
    }).start();

    // Confetti animation
    confettiValues.forEach((confetti, index) => {
      const delay = index * 100;
      const randomX = (Math.random() - 0.5) * width * 0.8;
      const randomY = -Math.random() * height * 0.3;
      
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(confetti.scale, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(confetti.x, {
            toValue: randomX,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(confetti.y, {
            toValue: height * 0.6,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(confetti.rotation, {
            toValue: 720,
            duration: 2000,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(confetti.scale, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const handleGetStarted = () => {
    navigation.navigate('MainTabs' as never);
  };

  const features = [
    {
      icon: 'psychology',
      title: 'Personalized Experience',
      description: 'Your dashboard is customized based on your role and preferences',
      color: '#6366f1',
    },
    {
      icon: 'rocket-launch',
      title: 'Free Trial Access',
      description: 'Start with 10 free voice generations to explore our features',
      color: '#8b5cf6',
    },
    {
      icon: 'lightbulb',
      title: 'Smart Recommendations',
      description: 'Get AI-powered suggestions for voices and content types',
      color: '#ec4899',
    },
  ];

  const confettiColors = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444'];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#1e1b4b', '#6366f1', '#8b5cf6']}
        style={styles.gradient}
      >
        {/* Confetti */}
        {confettiValues.map((confetti, index) => (
          <Animated.View
            key={index}
            style={[
              styles.confetti,
              {
                backgroundColor: confettiColors[index % confettiColors.length],
                transform: [
                  { translateX: confetti.x },
                  { translateY: confetti.y },
                  { rotate: confetti.rotation.interpolate({
                      inputRange: [0, 360],
                      outputRange: ['0deg', '360deg'],
                    })
                  },
                  { scale: confetti.scale },
                ],
              },
            ]}
          />
        ))}

        <View style={styles.content}>
          {/* Success checkmark */}
          <Animated.View style={[
            styles.checkmarkContainer,
            { transform: [{ scale: checkmarkScale }] }
          ]}>
            <View style={styles.checkmarkCircle}>
              <LinearGradient
                colors={['#10b981', '#059669']}
                style={styles.checkmarkGradient}
              >
                <MaterialIcons name="check" size={48} color="white" />
              </LinearGradient>
            </View>
          </Animated.View>

          {/* Success message */}
          <Animated.View style={[styles.textContainer, { opacity: textOpacity }]}>
            <Text style={styles.title}>Welcome to Voicify! 🎉</Text>
            <Text style={styles.subtitle}>
              Your account has been created successfully
            </Text>
          </Animated.View>

          {/* Features preview */}
          <Animated.View style={[styles.featuresContainer, { opacity: featuresOpacity }]}>
            {features.map((feature, index) => (
              <Animated.View
                key={feature.title}
                style={[
                  styles.featureCard,
                  {
                    transform: [{
                      translateY: featuresOpacity.interpolate({
                        inputRange: [0, 1],
                        outputRange: [30, 0],
                      }),
                    }],
                  },
                ]}
              >
                <View style={[styles.featureIcon, { backgroundColor: `${feature.color}20` }]}>
                  <MaterialIcons
                    name={feature.icon as keyof typeof MaterialIcons.glyphMap}
                    size={28}
                    color={feature.color}
                  />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </View>
              </Animated.View>
            ))}
          </Animated.View>

          {/* Stats */}
          <Animated.View style={[styles.statsContainer, { opacity: featuresOpacity }]}>
            <View style={styles.statsCard}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>10</Text>
                <Text style={styles.statLabel}>Free Generations</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>50+</Text>
                <Text style={styles.statLabel}>AI Voices</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>30+</Text>
                <Text style={styles.statLabel}>Languages</Text>
              </View>
            </View>
          </Animated.View>

          {/* Action button */}
          <Animated.View style={[
            styles.buttonContainer,
            { transform: [{ scale: buttonScale }] }
          ]}>
            <TouchableOpacity
              style={styles.button}
              onPress={handleGetStarted}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)']}
                style={styles.buttonGradient}
              >
                <MaterialIcons name="auto-awesome" size={24} color="white" />
                <Text style={styles.buttonText}>Start Creating</Text>
                <MaterialIcons name="arrow-forward" size={20} color="white" />
              </LinearGradient>
            </TouchableOpacity>

            <Text style={styles.readyText}>
              Ready to transform your voice content?
            </Text>
          </Animated.View>
        </View>

        {/* Background decoration */}
        <View style={styles.backgroundDecoration}>
          <View style={[styles.decorativeCircle, styles.circle1]} />
          <View style={[styles.decorativeCircle, styles.circle2]} />
          <View style={[styles.decorativeCircle, styles.circle3]} />
        </View>
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
  },
  confetti: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    top: height * 0.3,
    left: width * 0.5,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkContainer: {
    marginBottom: 32,
  },
  checkmarkCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
  },
  checkmarkGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    fontWeight: '300',
  },
  featuresContainer: {
    width: '100%',
    marginBottom: 32,
  },
  featureCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    backdropFilter: 'blur(10px)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  featureIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
  },
  statsContainer: {
    marginBottom: 40,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 20,
    backdropFilter: 'blur(10px)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 16,
  },
  buttonContainer: {
    alignItems: 'center',
    width: '100%',
  },
  button: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
    marginBottom: 16,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginHorizontal: 12,
  },
  readyText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  backgroundDecoration: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  decorativeCircle: {
    position: 'absolute',
    borderRadius: 1000,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  circle1: {
    width: 200,
    height: 200,
    top: -100,
    right: -100,
  },
  circle2: {
    width: 150,
    height: 150,
    bottom: -75,
    left: -75,
  },
  circle3: {
    width: 100,
    height: 100,
    top: '50%',
    right: -50,
  },
});

export default SignupCompleteScreen;