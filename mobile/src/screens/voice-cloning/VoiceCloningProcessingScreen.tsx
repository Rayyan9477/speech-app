import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  ProgressBarAndroid,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

const VoiceCloningProcessingScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  const audioUri = route.params?.audioUri;
  const duration = route.params?.duration;

  const processingSteps = [
    { label: 'Analyzing audio...', icon: 'analytics', duration: 2000 },
    { label: 'Extracting voice features...', icon: 'psychology', duration: 3000 },
    { label: 'Training AI model...', icon: 'model-training', duration: 4000 },
    { label: 'Generating voice clone...', icon: 'transform', duration: 2000 },
    { label: 'Finalizing voice profile...', icon: 'check-circle', duration: 1000 },
  ];

  useEffect(() => {
    let stepIndex = 0;
    let stepProgress = 0;

    const processStep = () => {
      if (stepIndex >= processingSteps.length) {
        // Processing complete
        setTimeout(() => {
          navigation.navigate('VoiceCloningIdentity', { audioUri, duration });
        }, 1000);
        return;
      }

      const step = processingSteps[stepIndex];
      setCurrentStep(stepIndex);

      // Animate progress for this step
      const stepDuration = step.duration;
      const interval = setInterval(() => {
        stepProgress += 5;
        const overallProgress = (stepIndex * 20) + (stepProgress / 5);

        if (stepProgress >= 100) {
          clearInterval(interval);
          stepIndex++;
          stepProgress = 0;
          setTimeout(processStep, 500);
        } else {
          setProgress(overallProgress / 100);
        }
      }, stepDuration / 20);

      return () => clearInterval(interval);
    };

    processStep();
  }, []);

  const renderProgressBar = () => {
    if (Platform.OS === 'android') {
      return (
        <ProgressBarAndroid
          styleAttr="Horizontal"
          indeterminate={false}
          progress={progress}
          color="#5546FF"
          style={styles.progressBar}
        />
      );
    }

    return (
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Processing Animation */}
        <View style={styles.animationContainer}>
          <View style={styles.pulseCircle}>
            <ActivityIndicator size="large" color="#5546FF" />
          </View>
          <View style={styles.neuralNetwork}>
            {[...Array(8)].map((_, i) => (
              <View key={i} style={[styles.neuralNode, { animationDelay: `${i * 0.2}s` }]} />
            ))}
          </View>
        </View>

        {/* Current Step */}
        <View style={styles.stepContainer}>
          <MaterialIcons
            name={processingSteps[currentStep]?.icon as any || 'sync'}
            size={32}
            color="#5546FF"
          />
          <Text style={styles.stepText}>
            {processingSteps[currentStep]?.label || 'Processing...'}
          </Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          {renderProgressBar()}
          <Text style={styles.progressText}>
            {Math.round(progress * 100)}%
          </Text>
        </View>

        {/* Processing Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>Voice Cloning in Progress</Text>
          <Text style={styles.infoText}>
            Our AI is analyzing your voice sample and creating a unique voice profile.
            This process may take a few minutes.
          </Text>
        </View>

        {/* Steps List */}
        <View style={styles.stepsList}>
          {processingSteps.map((step, index) => (
            <View key={index} style={styles.stepItem}>
              <View style={[
                styles.stepIndicator,
                index < currentStep && styles.stepCompleted,
                index === currentStep && styles.stepActive,
              ]}>
                {index < currentStep ? (
                  <MaterialIcons name="check" size={16} color="#FFFFFF" />
                ) : index === currentStep ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.stepNumber}>{index + 1}</Text>
                )}
              </View>
              <Text style={[
                styles.stepLabel,
                index <= currentStep && styles.stepLabelActive,
              ]}>
                {step.label}
              </Text>
            </View>
          ))}
        </View>

        {/* Tips */}
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>💡 Pro Tip</Text>
          <Text style={styles.tipsText}>
            Better voice samples result in higher quality clones.
            Make sure your recording was clear and contained only your voice.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  animationContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  pulseCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  neuralNetwork: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    width: 200,
  },
  neuralNode: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#5546FF',
    margin: 4,
    opacity: 0.7,
  },
  stepContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  stepText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    textAlign: 'center',
  },
  progressContainer: {
    marginBottom: 32,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#5546FF',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5546FF',
    textAlign: 'center',
  },
  infoContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  stepsList: {
    marginBottom: 32,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  stepIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepCompleted: {
    backgroundColor: '#22C55E',
  },
  stepActive: {
    backgroundColor: '#5546FF',
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  stepLabel: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },
  stepLabelActive: {
    color: '#1F2937',
    fontWeight: '500',
  },
  tipsContainer: {
    backgroundColor: '#FFF8E1',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 8,
  },
  tipsText: {
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
  },
});

export default VoiceCloningProcessingScreen;
